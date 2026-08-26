/**
 * Upload complete (STORAGE-1R / D-067) — step 3 of the flow.
 *
 * Verifies the completion token, enforces the same-user rule, reconciles the
 * uploaded bytes against the declared metadata via HEAD + ranged GET, copies
 * the temp object to the canonical public key with ETag-bound copy, verifies
 * the permanent object, and hands off to a single transactional persistence
 * call. The temporary object is best-effort deleted after the commit returns;
 * a cleanup failure must not roll back a successful upload.
 */

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';
import { z } from 'zod';
import {
  APPROVED_IMAGE_MIMES,
  APPROVED_VIDEO_MIMES,
  MEDIA_KIND,
} from '../admin/media/media-policy.ts';
import { getR2Client } from './r2-client.ts';
import { getR2ConfigSafe, requireMediaWrite, actorRole } from './upload-context.ts';
import { parsePublicMediaKey, parseTempUploadKey } from './upload-keys.ts';
import {
  UPLOAD_TOKEN_VERSION,
  verifyUploadToken,
  type UploadTokenPayload,
} from './upload-token.ts';
import {
  persistCompletedAsset,
  type CompleteUploadResult,
  type PersistDeps,
} from './upload-persist.ts';

/** Max bytes of the temp object we ever read for MIME validation. */
export const SIGNATURE_READ_BYTES = 64 * 1024;

/** Cache-Control for the public, immutable object. */
export const PUBLIC_CACHE_CONTROL = 'public, max-age=31536000, immutable';

/** Minimum bytes for the file-type sniffing window. */
const MIN_SIGNATURE_BYTES = 12;

export type CompleteUploadInput = {
  completionToken: string;
  altText?: string;
  caption?: string;
};

const completeSchema = z
  .object({
    completionToken: z
      .string()
      .min(1)
      .refine((v) => v.startsWith(`${UPLOAD_TOKEN_VERSION}.`), 'Malformed completion token.'),
    altText: z.string().max(500).optional(),
    caption: z.string().max(500).optional(),
  })
  .strict();

/**
 * Bounded stream read: returns the first `max` bytes (or fewer if the stream
 * ends first), then closes the stream so we never buffer the full upload into
 * memory.
 */
async function readBounded(stream: Readable, max: number): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let received = 0;
  return await new Promise((resolve, reject) => {
    const onError = (err: unknown): void => reject(err);
    stream.on('error', onError);
    stream.on('data', (chunk: Buffer) => {
      received += chunk.length;
      if (received <= max) chunks.push(chunk);
      if (received >= max) {
        stream.removeListener('error', onError);
        stream.destroy();
        resolve(Buffer.concat(chunks, Math.min(received, max)));
      }
    });
    stream.on('end', () => resolve(Buffer.concat(chunks, received)));
  });
}

/**
 * Step 3 of the upload flow. `rawInput` is the unvalidated request body; the
 * route handler stays a thin dispatcher.
 */
export async function completeUpload(
  rawInput: unknown,
  req?: Request,
): Promise<CompleteUploadResult> {
  const parsed = completeSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      type: 'validation',
      message: parsed.error.issues[0]?.message ?? 'Invalid completion request.',
    };
  }

  const auth = await requireMediaWrite(req);
  if (!auth) {
    return { ok: false, type: 'forbidden', message: 'Upload permission required.' };
  }

  const config = getR2ConfigSafe();
  if (!config) {
    return { ok: false, type: 'not_configured', message: 'Storage is not configured.' };
  }

  const verification = verifyUploadToken(config.uploadTokenSecret, parsed.data.completionToken);
  if (!verification.ok) {
    return { ok: false, type: 'validation', message: 'Invalid completion token.' };
  }
  const payload = verification.payload;

  // Same-user completion: only the user who initiated may finalize.
  if (auth.userId !== payload.userId) {
    return {
      ok: false,
      type: 'forbidden',
      message: 'Completion must be performed by the initiating user.',
    };
  }

  return await finalizeUpload({
    payload,
    config,
    actorRoleValue: actorRole(auth),
    altText: parsed.data.altText,
    caption: parsed.data.caption,
  });
}

/**
 * Test seam: replace the S3 client used by finalizeUpload. Only set in tests;
 * production callers leave it undefined. The test mock must implement
 * `send(command)` and accept all the commands used by finalizeUpload.
 */
type S3Like = ReturnType<typeof getR2Client>;
let clientOverride: S3Like | null = null;

export function setR2ClientOverrideForTests(client: S3Like | null): void {
  clientOverride = client;
}

/**
 * Test seam: pass a disposable-DB Prisma client into the persistence step so
 * the real finalizeUpload logic can be exercised against a test database.
 */
let persistDepsOverride: PersistDeps | null = null;
export function setPersistDepsOverrideForTests(deps: PersistDeps | null): void {
  persistDepsOverride = deps;
}

/**
 * Internal — runs after the auth/token gates. Splits R2 operations from
 * persistence so the dependency seam is easy to test (TASK 11).
 */
export async function finalizeUpload(params: {
  payload: UploadTokenPayload;
  config: NonNullable<ReturnType<typeof getR2ConfigSafe>>;
  actorRoleValue: string | null;
  altText?: string;
  caption?: string;
}): Promise<CompleteUploadResult> {
  const { payload, config, actorRoleValue } = params;

  // Defensive: re-parse the token's keys through the strict validators. A
  // tampered token can never survive upload-token.ts validation, but the
  // parsers here guarantee we only touch canonical paths under tmp/uploads/
  // and public/products/.
  const parsedTemp = parseTempUploadKey(payload.tempKey);
  if (!parsedTemp || parsedTemp.id !== payload.mediaAssetId) {
    return { ok: false, type: 'validation', message: 'Invalid token: temp key.' };
  }
  const parsedPublic = parsePublicMediaKey(payload.publicKey);
  if (!parsedPublic || parsedPublic.id !== payload.mediaAssetId) {
    return { ok: false, type: 'validation', message: 'Invalid token: public key.' };
  }
  if (parsedPublic.kind !== payload.kind) {
    return { ok: false, type: 'validation', message: 'Invalid token: public kind.' };
  }

  const client = clientOverride ?? getR2Client();

  // ── HEAD the temp object: size, Content-Type, ETag, existence ─────────────
  type HeadInfo = {
    sizeBytes: number;
    contentType: string | undefined;
    etag: string | undefined;
  };
  let head: HeadInfo;
  try {
    const res = await client.send(
      new HeadObjectCommand({ Bucket: config.bucketName, Key: payload.tempKey }),
    );
    head = {
      sizeBytes: res.ContentLength ?? 0,
      contentType: res.ContentType ?? undefined,
      etag: res.ETag ?? undefined,
    };
  } catch {
    return {
      ok: false,
      type: 'not_found',
      message: 'Uploaded object was not found at the temporary key.',
    };
  }

  if (head.sizeBytes <= 0) {
    return { ok: false, type: 'validation', message: 'Uploaded object is empty.' };
  }
  if (head.sizeBytes !== payload.sizeBytes) {
    return {
      ok: false,
      type: 'validation',
      message: 'Uploaded size does not match the declared size.',
    };
  }
  if (head.contentType !== payload.mimeType) {
    return {
      ok: false,
      type: 'validation',
      message: 'Uploaded content type does not match the declared type.',
    };
  }
  if (!head.etag) {
    return { ok: false, type: 'error', message: 'Could not determine the upload ETag.' };
  }

  // ── Ranged GET the first SIGNATURE_READ_BYTES for MIME validation ─────────
  const sniffRes = await client.send(
    new GetObjectCommand({
      Bucket: config.bucketName,
      Key: payload.tempKey,
      Range: `bytes=0-${SIGNATURE_READ_BYTES - 1}`,
    }),
  );
  const body = sniffRes.Body;
  if (!body) {
    return { ok: false, type: 'error', message: 'Could not read the uploaded bytes.' };
  }
  let sniffBytes: Buffer;
  try {
    sniffBytes = await readBounded(body as Readable, SIGNATURE_READ_BYTES);
  } catch {
    return { ok: false, type: 'error', message: 'Could not read the uploaded bytes.' };
  }
  if (sniffBytes.length < MIN_SIGNATURE_BYTES) {
    return {
      ok: false,
      type: 'validation',
      message: 'Uploaded object is too small to identify.',
    };
  }

  // file-type v21 detects from the first bytes; matches policy-approved mimes
  // for image/jpeg, image/png, image/webp, image/avif, video/mp4, video/webm.
  const fileType = await import('file-type');
  const detected = await fileType.fileTypeFromBuffer(sniffBytes);
  if (!detected) {
    return { ok: false, type: 'validation', message: 'Could not detect the file type.' };
  }
  const detectedMime = detected.mime;
  const approved = new Set<string>([...APPROVED_IMAGE_MIMES, ...APPROVED_VIDEO_MIMES]);
  if (!approved.has(detectedMime) || detectedMime !== payload.mimeType) {
    return {
      ok: false,
      type: 'validation',
      message: 'Declared MIME does not match the actual file type.',
    };
  }
  if (payload.kind === MEDIA_KIND.IMAGE && detectedMime.startsWith('video/')) {
    return { ok: false, type: 'validation', message: 'Declared kind does not match file type.' };
  }
  if (payload.kind === MEDIA_KIND.VIDEO && detectedMime.startsWith('image/')) {
    return { ok: false, type: 'validation', message: 'Declared kind does not match file type.' };
  }

  // ── ETag-bound copy to the permanent location ─────────────────────────────
  const etag = head.etag;
  try {
    await client.send(
      new CopyObjectCommand({
        Bucket: config.bucketName,
        Key: payload.publicKey,
        CopySource: `${encodeURIComponent(config.bucketName)}/${payload.tempKey
          .split('/')
          .map(encodeURIComponent)
          .join('/')}`,
        CopySourceIfMatch: etag,
        ContentType: payload.mimeType,
        CacheControl: PUBLIC_CACHE_CONTROL,
        MetadataDirective: 'REPLACE',
      }),
    );
  } catch {
    return {
      ok: false,
      type: 'error',
      message: 'Could not finalize the uploaded object.',
    };
  }

  // ── Verify the permanent object ───────────────────────────────────────────
  try {
    const perm = await client.send(
      new HeadObjectCommand({
        Bucket: config.bucketName,
        Key: payload.publicKey,
      }),
    );
    if (perm.ContentLength !== payload.sizeBytes || perm.ContentType !== payload.mimeType) {
      return {
        ok: false,
        type: 'error',
        message: 'Permanent object did not match the declared metadata.',
      };
    }
  } catch {
    return {
      ok: false,
      type: 'error',
      message: 'Could not verify the permanent object.',
    };
  }

  // ── Transactional persistence (MediaAsset + AuditLog in one PG tx) ────────
  const cdnUrl = config.publicBaseUrl
    ? `${config.publicBaseUrl.replace(/\/+$/, '')}/${payload.publicKey}`
    : null;
  const result = await persistCompletedAsset(
    payload,
    actorRoleValue,
    {
      altText: params.altText,
      caption: params.caption,
      mimeType: detectedMime,
      cdnUrl,
    },
    persistDepsOverride ?? {},
  );

  // Best-effort temp cleanup. Failure to delete the tmp/uploads/ object does
  // not invalidate the upload — a periodic janitor is the canonical fallback
  // for stuck tmp objects.
  if (result.ok) {
    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: config.bucketName,
          Key: payload.tempKey,
        }),
      );
    } catch {
      // Intentional swallow — see comment above.
    }
  }

  return result;
}
