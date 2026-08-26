/**
 * Media policy constants — Step 2.4.4.
 *
 * Centralized MIME type and file-size constraints for product media.
 * Consumed by both server mutations and client-side UX validation.
 */

// ── Approved MIME types ──────────────────────────────────────────────────────

export const APPROVED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export const APPROVED_VIDEO_MIMES = ['video/mp4', 'video/webm'] as const;

export type ApprovedImageMime = (typeof APPROVED_IMAGE_MIMES)[number];
export type ApprovedVideoMime = (typeof APPROVED_VIDEO_MIMES)[number];

// ── Size limits ──────────────────────────────────────────────────────────────

/** Maximum image file size: 10 MB */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

/** Maximum video file size: 200 MB */
export const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024;

// ── Helpers ──────────────────────────────────────────────────────────────────

export function isApprovedImageMime(mime: string): mime is ApprovedImageMime {
  return (APPROVED_IMAGE_MIMES as readonly string[]).includes(mime);
}

export function isApprovedVideoMime(mime: string): mime is ApprovedVideoMime {
  return (APPROVED_VIDEO_MIMES as readonly string[]).includes(mime);
}

/** MediaKind enum values matching Prisma schema */
export const MEDIA_KIND = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  DOCUMENT: 'DOCUMENT',
  FIRMWARE: 'FIRMWARE',
  MODEL_3D: 'MODEL_3D',
  OTHER: 'OTHER',
} as const;

export type MediaKind = (typeof MEDIA_KIND)[keyof typeof MEDIA_KIND];

export type ApprovedMime = ApprovedImageMime | ApprovedVideoMime;

/**
 * Canonical extension for each approved MIME type (STORAGE-1R / D-067).
 * Object keys are built from these extensions only — never from client input —
 * so a file cannot smuggle characters (slashes, dots, `..`) into a key.
 */
export const APPROVED_MIME_TO_EXT: Record<ApprovedMime, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};

export function isApprovedMime(mime: string): mime is ApprovedMime {
  return isApprovedImageMime(mime) || isApprovedVideoMime(mime);
}

export function getExtensionForMime(mime: ApprovedMime): string {
  return APPROVED_MIME_TO_EXT[mime];
}

/** Returns the canonical extension for a MIME type, or null if not approved. */
export function getExtensionForMimeIfApproved(mime: string): string | null {
  return isApprovedMime(mime) ? APPROVED_MIME_TO_EXT[mime] : null;
}

/** Canonical extension → approved MIME type (inverse of APPROVED_MIME_TO_EXT). */
export const APPROVED_EXT_TO_MIME = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  mp4: 'video/mp4',
  webm: 'video/webm',
} as const satisfies Record<string, ApprovedMime>;

/** Returns the approved MIME type for a canonical extension, or null. */
export function getMimeForExtension(ext: string): ApprovedMime | null {
  return APPROVED_EXT_TO_MIME[ext as keyof typeof APPROVED_EXT_TO_MIME] ?? null;
}
