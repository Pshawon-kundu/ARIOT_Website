/**
 * Upload initiate (STORAGE-1R / D-067) — step 1 of the flow.
 *
 * Requires media.write, validates the declared file against the media policy,
 * preallocates the MediaAsset id + canonical keys, mints the HMAC completion
 * token (binds mediaAssetId/keys/mime/size/kind/user), and returns a 5-minute
 * presigned PUT bound to the approved Content-Type.
 */

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import {
  APPROVED_MIME_TO_EXT,
  APPROVED_IMAGE_MIMES,
  APPROVED_VIDEO_MIMES,
  getExtensionForMimeIfApproved,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  MEDIA_KIND,
} from '../admin/media/media-policy.ts';
import { newMediaAssetId } from './media-id.ts';
import { getR2Client } from './r2-client.ts';
import { getR2ConfigSafe, requireMediaWrite } from './upload-context.ts';
import { buildPublicMediaKey, buildTempUploadKey } from './upload-keys.ts';
import { createUploadToken, type UploadTokenPayload } from './upload-token.ts';

/** Presigned PUT lifetime in seconds (D-067: 5 minutes). */
export const PRESIGN_EXPIRY_SECONDS = 5 * 60;

export type InitiateUploadResult =
  | {
      ok: true;
      uploadUrl: string;
      token: string;
      mediaAssetId: string;
      tempKey: string;
      expiresInSeconds: number;
    }
  | { ok: false; type: 'forbidden' | 'validation' | 'not_configured' | 'error'; message: string };

/**
 * Strict initiation contract — only what the client is allowed to declare.
 * No IDs, no keys, no credentials, no permissions.
 */
const initiateSchema = z
  .object({
    filename: z
      .string()
      .min(1, 'filename is required.')
      .max(255, 'filename must be 255 characters or fewer.')
      .refine((v) => !v.includes('\u0000'), 'filename must not contain null bytes.'),
    mimeType: z.enum([...APPROVED_IMAGE_MIMES, ...APPROVED_VIDEO_MIMES] as [string, ...string[]], {
      message: 'Unsupported media type.',
    }),
    sizeBytes: z.number().int().positive(),
    kind: z.enum([MEDIA_KIND.IMAGE, MEDIA_KIND.VIDEO]),
  })
  .strict();

/**
 * Step 1 of the upload flow — see module doc. `rawInput` is the unvalidated
 * request body; the route handler stays a thin dispatcher.
 */
export async function initiateUpload(
  rawInput: unknown,
  req?: Request,
): Promise<InitiateUploadResult> {
  const parsed = initiateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      type: 'validation',
      message: parsed.error.issues[0]?.message ?? 'Invalid upload request.',
    };
  }

  const auth = await requireMediaWrite(req);
  if (!auth) {
    return { ok: false, type: 'forbidden', message: 'Upload permission required.' };
  }

  const { mimeType, sizeBytes, kind } = parsed.data;

  // Policy: per-kind size cap is server-derived, never client-supplied.
  const maxBytes = kind === MEDIA_KIND.IMAGE ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;
  if (sizeBytes > maxBytes) {
    return {
      ok: false,
      type: 'validation',
      message: `File exceeds the ${kind === MEDIA_KIND.IMAGE ? 'image' : 'video'} size limit.`,
    };
  }

  const config = getR2ConfigSafe();
  if (!config) {
    return { ok: false, type: 'not_configured', message: 'Storage is not configured.' };
  }

  // Server-generated identity + keys. The client never chooses any of these.
  const id = newMediaAssetId();
  const ext = getExtensionForMimeIfApproved(mimeType);
  if (!ext) {
    // Defensive: the enum above already filters to approved mimes.
    return { ok: false, type: 'validation', message: 'Unsupported media type.' };
  }
  void APPROVED_MIME_TO_EXT;
  const now = new Date();
  const tempKey = buildTempUploadKey({ id, ext, date: now });
  const publicKey = buildPublicMediaKey({ kind, id, ext, date: now });

  let uploadUrl: string;
  try {
    uploadUrl = await getSignedUrl(
      getR2Client(),
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: tempKey,
        ContentType: mimeType,
      }),
      { expiresIn: PRESIGN_EXPIRY_SECONDS },
    );
  } catch {
    return { ok: false, type: 'error', message: 'Could not create the upload URL.' };
  }

  const token = createUploadToken(config.uploadTokenSecret, {
    mediaAssetId: id,
    mimeType: mimeType as UploadTokenPayload['mimeType'],
    sizeBytes,
    kind,
    tempKey,
    publicKey,
    userId: auth.userId,
  });

  return {
    ok: true,
    uploadUrl,
    token,
    mediaAssetId: id,
    tempKey,
    expiresInSeconds: PRESIGN_EXPIRY_SECONDS,
  };
}
