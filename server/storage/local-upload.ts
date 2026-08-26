/**
 * Local provider upload pipeline (D-068) — `localUploadFromForm`.
 *
 * Single multipart request (POST /api/admin/media/uploads/local):
 *   auth (media.write) → strict form contract → per-kind size cap →
 *   server-generated id + canonical keys → temp write → signature verify →
 *   atomic promote to public key → permanent verify → transactional
 *   MediaAsset + AuditLog persist → best-effort compensation cleanup.
 *
 * The route handler stays a thin dispatcher; this module is the app boundary
 * that tests exercise. The Prisma client and provider root are overridable via
 * `deps` so the real pipeline runs against a disposable DB + isolated temp
 * root in tests.
 */

import { z } from 'zod';
import {
  APPROVED_IMAGE_MIMES,
  APPROVED_VIDEO_MIMES,
  getExtensionForMimeIfApproved,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  MEDIA_KIND,
} from '../admin/media/media-policy.ts';
import type { ApprovedMime } from '../admin/media/media-policy.ts';
import type { PrismaClient } from '../../lib/generated/prisma/client.ts';
import { assertSafeLocalRoot, getLocalMediaConfig } from './media-storage-config.ts';
import {
  deleteOwnedKey,
  promoteToPublic,
  statPublicKey,
  writeTempFile,
} from './local-storage-fs.ts';
import { verifyUploadedBuffer } from './media-file-verification.ts';
import { newMediaAssetId } from './media-id.ts';
import { persistCompletedAsset, type CompleteUploadResult } from './upload-persist.ts';
import { buildPublicMediaKey, buildTempUploadKey } from './upload-keys.ts';
import { actorRole, requireMediaWrite } from './upload-context.ts';
import { LocalMediaStorageProvider } from './local-media-storage.ts';

/** Form fields allowed in the local upload request — nothing else. */
const ALLOWED_FORM_FIELDS = new Set(['file', 'mimeType', 'kind']);

const formSchema = z
  .object({
    file: z.instanceof(File, { message: 'A single file is required.' }),
    mimeType: z.enum([...APPROVED_IMAGE_MIMES, ...APPROVED_VIDEO_MIMES] as [string, ...string[]], {
      message: 'Unsupported media type.',
    }),
    kind: z.enum([MEDIA_KIND.IMAGE, MEDIA_KIND.VIDEO]),
  })
  .strict();

export type LocalUploadDeps = {
  /** Test seam: disposable-DB Prisma client. Production callers omit it. */
  prisma?: PrismaClient;
  /** Test seam: isolated provider root. Production callers omit it. */
  root?: string;
};

/**
 * The full local-provider upload. `form` is the parsed multipart body and
 * `req` is the original request (used only for the auth boundary).
 */
export async function localUploadFromForm(
  form: FormData,
  req?: Request,
  deps: LocalUploadDeps = {},
): Promise<CompleteUploadResult> {
  const auth = await requireMediaWrite(req);
  if (!auth) {
    return { ok: false, type: 'forbidden', message: 'Upload permission required.' };
  }

  // Exactly one file, no unknown fields.
  for (const key of form.keys()) {
    if (!ALLOWED_FORM_FIELDS.has(key)) {
      return { ok: false, type: 'validation', message: 'Unexpected form field.' };
    }
  }
  let fileCount = 0;
  for (const value of form.values()) {
    if (value instanceof File) fileCount += 1;
  }
  if (fileCount !== 1) {
    return { ok: false, type: 'validation', message: 'Exactly one file is required.' };
  }

  const parsed = formSchema.safeParse({
    file: form.get('file'),
    mimeType: form.get('mimeType'),
    kind: form.get('kind'),
  });
  if (!parsed.success) {
    return {
      ok: false,
      type: 'validation',
      message: parsed.error.issues[0]?.message ?? 'Invalid upload request.',
    };
  }
  const { file, mimeType, kind } = parsed.data;

  const kindMatchesMime =
    (kind === MEDIA_KIND.IMAGE && mimeType.startsWith('image/')) ||
    (kind === MEDIA_KIND.VIDEO && mimeType.startsWith('video/'));
  if (!kindMatchesMime) {
    return {
      ok: false,
      type: 'validation',
      message: 'Declared kind does not match the media type.',
    };
  }

  const maxBytes = kind === MEDIA_KIND.IMAGE ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;
  if (file.size <= 0) {
    return { ok: false, type: 'validation', message: 'Uploaded file is empty.' };
  }
  if (file.size > maxBytes) {
    return {
      ok: false,
      type: 'validation',
      message: `File exceeds the ${kind === MEDIA_KIND.IMAGE ? 'image' : 'video'} size limit.`,
    };
  }

  // Provider config — test seams override the root so real uploads never touch
  // the configured provider directory during tests.
  const root = deps.root ? assertSafeLocalRoot(deps.root) : getLocalMediaConfig().root;
  const provider = new LocalMediaStorageProvider({ root });

  // Server-generated identity + canonical keys. The client never chooses any.
  const id = newMediaAssetId();
  const ext = getExtensionForMimeIfApproved(mimeType);
  if (!ext) {
    return { ok: false, type: 'validation', message: 'Unsupported media type.' };
  }
  const now = new Date();
  const tempKey = buildTempUploadKey({ id, ext, date: now });
  const publicKey = buildPublicMediaKey({ kind, id, ext, date: now });

  // The size cap above bounds the buffered read (10 MB image / 200 MB video).
  const buffer = Buffer.from(await file.arrayBuffer());

  // 1) Temp write — `wx` fails on key collision.
  try {
    await writeTempFile(root, tempKey, buffer);
  } catch {
    return { ok: false, type: 'error', message: 'Could not store the uploaded file.' };
  }

  // 2) Signature verification.
  const verification = await verifyUploadedBuffer(buffer, {
    declaredMime: mimeType,
    declaredKind: kind,
  });
  if (!verification.ok) {
    await deleteOwnedKey(root, tempKey).catch(() => undefined);
    return { ok: false, type: 'validation', message: verification.message };
  }

  // 3) Atomic promote to the immutable public key.
  try {
    await promoteToPublic(root, tempKey, publicKey);
  } catch {
    await deleteOwnedKey(root, tempKey).catch(() => undefined);
    return { ok: false, type: 'error', message: 'Could not finalize the uploaded file.' };
  }

  // 4) Verify the permanent file matches the declared metadata.
  const permanent = await statPublicKey(root, publicKey);
  if (!permanent || permanent.sizeBytes !== buffer.length) {
    await deleteOwnedKey(root, publicKey).catch(() => undefined);
    return { ok: false, type: 'error', message: 'Permanent file did not match the upload.' };
  }

  // 5) Transactional persistence (MediaAsset + AuditLog in one PG tx).
  const cdnUrl = provider.getPublicUrl(publicKey, null);
  const result = await persistCompletedAsset(
    {
      mediaAssetId: id,
      mimeType: mimeType as ApprovedMime,
      sizeBytes: buffer.length,
      kind,
      tempKey,
      publicKey,
      userId: auth.userId,
    },
    actorRole(auth),
    { mimeType, cdnUrl },
    deps.prisma ? { prisma: deps.prisma } : {},
  );

  // 6) Best-effort compensation: on failure, remove only files this upload
  //    provably owns (canonical keys derived from the server-generated id).
  //    A janitor for stuck tmp files is the canonical fallback.
  if (!result.ok) {
    await deleteOwnedKey(root, publicKey).catch(() => undefined);
    await deleteOwnedKey(root, tempKey).catch(() => undefined);
  }

  return result;
}
