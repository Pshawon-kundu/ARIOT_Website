/**
 * Canonical object keys (STORAGE-1R / D-067).
 *
 *   temp:   tmp/uploads/{yyyy}/{mm}/{mediaAssetId}.{ext}
 *   public: public/products/{images|videos}/{yyyy}/{mm}/{mediaAssetId}.{ext}
 *
 * Keys are built exclusively from server-generated components (uuid id, ext
 * from the approved-MIME map, date parts from a single UTC Date) and are
 * always run through the strict parsers below before any S3 call. The character
 * classes used here exclude `/`, `\`, `.` and whitespace, so a validated key
 * cannot perform path traversal or key injection.
 */

import { getExtensionForMimeIfApproved, MEDIA_KIND } from '../admin/media/media-policy.ts';
import type { UploadTokenPayload } from './upload-token.ts';

export type MediaKindForStorage = 'IMAGE' | 'VIDEO';

/** Kind → public key folder segment. */
export function kindToFolder(kind: MediaKindForStorage): 'images' | 'videos' {
  return kind === MEDIA_KIND.IMAGE ? 'images' : 'videos';
}

export function buildTempUploadKey(params: { id: string; ext: string; date: Date }): string {
  return `tmp/uploads/${fmtYearMonth(params.date)}/${params.id}.${params.ext}`;
}

export function buildPublicMediaKey(params: {
  kind: MediaKindForStorage;
  id: string;
  ext: string;
  date: Date;
}): string {
  return `public/products/${kindToFolder(params.kind)}/${fmtYearMonth(
    params.date,
  )}/${params.id}.${params.ext}`;
}

function fmtYearMonth(date: Date): string {
  const yyyy = String(date.getUTCFullYear());
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${yyyy}/${mm}`;
}

// ── Strict validators ────────────────────────────────────────────────────────

export type ParsedTempUploadKey = {
  id: string;
  ext: string;
  yearMonth: string;
};

export type ParsedPublicMediaKey = {
  kind: MediaKindForStorage;
  id: string;
  ext: string;
  yearMonth: string;
};

const ID_CHARS = '[a-zA-Z0-9_-]';
const EXT_CHARS = '[a-z0-9]';

const TEMP_KEY_RE = new RegExp(
  `^tmp\\/uploads\\/(\\d{4})\\/(\\d{2})\\/(${ID_CHARS}{8,128})\\.(${EXT_CHARS}{1,10})$`,
);

const PUBLIC_KEY_RE = new RegExp(
  `^public\\/products\\/(images|videos)\\/(\\d{4})\\/(\\d{2})\\/(${ID_CHARS}{8,128})\\.(${EXT_CHARS}{1,10})$`,
);

function isValidYearMonth(year: string, month: string): boolean {
  const y = Number(year);
  const m = Number(month);
  return y >= 2000 && y <= 2100 && m >= 1 && m <= 12;
}

export function parseTempUploadKey(key: string): ParsedTempUploadKey | null {
  const match = TEMP_KEY_RE.exec(key);
  if (!match) return null;
  const [, year, month, id, ext] = match;
  if (!isValidYearMonth(year, month)) return null;
  return { id, ext, yearMonth: `${year}/${month}` };
}

export function parsePublicMediaKey(key: string): ParsedPublicMediaKey | null {
  const match = PUBLIC_KEY_RE.exec(key);
  if (!match) return null;
  const [, folder, year, month, id, ext] = match;
  if (!isValidYearMonth(year, month)) return null;
  const kind: MediaKindForStorage = folder === 'images' ? MEDIA_KIND.IMAGE : MEDIA_KIND.VIDEO;
  return { kind, id, ext, yearMonth: `${year}/${month}` };
}

/**
 * Defensive guard applied before any S3 call that touches a user-influenced
 * key. Keys built by this module can never fail this; it exists to catch
 * regressions where a key is assembled from untrusted parts.
 */
export function isSafeObjectKey(key: string): boolean {
  if (key.length === 0 || key.length > 1024) return false;
  return !key.includes('..') && !key.includes('//') && !key.includes('\\');
}

/**
 * Cross-checks a token payload's keys (STORAGE-1R / D-067). The temp + public
 * keys must both parse, must reference the token's preallocated MediaAsset id,
 * must agree on kind, and their extensions must match the declared MIME type.
 * Runs before any S3 call in the completion flow.
 */
export function validateTokenKeys(
  payload: UploadTokenPayload,
): { ok: true } | { ok: false; message: string } {
  const tempParsed = parseTempUploadKey(payload.tempKey);
  const publicParsed = parsePublicMediaKey(payload.publicKey);
  if (!tempParsed || !publicParsed) {
    return { ok: false, message: 'Invalid upload keys in token.' };
  }
  if (
    tempParsed.id !== payload.mediaAssetId ||
    publicParsed.id !== payload.mediaAssetId ||
    publicParsed.kind !== payload.kind
  ) {
    return { ok: false, message: 'Upload keys do not match the token.' };
  }
  const expectedExt = getExtensionForMimeIfApproved(payload.mimeType);
  if (!expectedExt || tempParsed.ext !== expectedExt || publicParsed.ext !== expectedExt) {
    return { ok: false, message: 'Upload key extension does not match the media type.' };
  }
  if (!isSafeObjectKey(payload.tempKey) || !isSafeObjectKey(payload.publicKey)) {
    return { ok: false, message: 'Unsafe object key.' };
  }
  return { ok: true };
}
