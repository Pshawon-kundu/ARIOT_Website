/**
 * Uploaded-file verification (D-068) — the local provider's signature check.
 *
 * Mirrors the R2 completion flow's validation (see upload-complete.ts) but is
 * deliberately independent of the S3 client so the local provider carries no
 * AWS dependency: exact size, approved MIME via real `file-type` sniffing on
 * the first bytes, and kind/MIME agreement.
 */

import {
  APPROVED_IMAGE_MIMES,
  APPROVED_VIDEO_MIMES,
  MEDIA_KIND,
} from '../admin/media/media-policy.ts';
import { getExtensionForMimeIfApproved } from '../admin/media/media-policy.ts';

/** Max bytes we ever sniff for MIME detection. */
export const SIGNATURE_READ_BYTES = 64 * 1024;

/** Minimum bytes for the file-type sniffing window to be meaningful. */
export const MIN_SIGNATURE_BYTES = 12;

export type VerificationInput = {
  /** MIME declared by the client (form field) — must match the sniff. */
  declaredMime: string;
  /** Kind declared by the client — must agree with the sniffed type. */
  declaredKind: 'IMAGE' | 'VIDEO';
};

export type VerificationResult = { ok: true } | { ok: false; message: string };

/**
 * Verifies an in-memory uploaded buffer. The caller is responsible for the
 * declared size already matching the buffer (file.size === buffer length);
 * this helper covers MIME signature + kind agreement.
 */
export async function verifyUploadedBuffer(
  buffer: Buffer,
  input: VerificationInput,
): Promise<VerificationResult> {
  if (buffer.length < MIN_SIGNATURE_BYTES) {
    return { ok: false, message: 'Uploaded file is too small to identify.' };
  }

  const fileType = await import('file-type');
  const detected = await fileType.fileTypeFromBuffer(buffer.subarray(0, SIGNATURE_READ_BYTES));
  if (!detected) {
    return { ok: false, message: 'Could not detect the file type.' };
  }

  const approved = new Set<string>([...APPROVED_IMAGE_MIMES, ...APPROVED_VIDEO_MIMES]);
  if (!approved.has(detected.mime) || detected.mime !== input.declaredMime) {
    return { ok: false, message: 'Declared MIME does not match the actual file type.' };
  }

  const isImageKind = input.declaredKind === MEDIA_KIND.IMAGE;
  const kindMatches =
    (isImageKind && detected.mime.startsWith('image/')) ||
    (!isImageKind && detected.mime.startsWith('video/'));
  if (!kindMatches) {
    return { ok: false, message: 'Declared kind does not match file type.' };
  }

  // Consistency guard: the declared MIME must resolve to a canonical
  // extension; anything else is a policy regression, not a user input.
  if (!getExtensionForMimeIfApproved(input.declaredMime)) {
    return { ok: false, message: 'Unsupported media type.' };
  }

  return { ok: true };
}
