/**
 * Upload completion token (STORAGE-1R / D-067).
 *
 * Format: `v1.<base64url(json-payload)>.<base64url(hmac-sha256(payload))>`
 *   - Payload is validated by a strict Zod schema before signing and again
 *     after verification (schema is the single source of truth for shape).
 *   - 15-minute lifetime (`exp`), issued with `iat`.
 *   - `jti` is 128 random bits, making token forgery/replay infeasible.
 *   - HMAC comparison is constant-time (timingSafeEqual).
 *
 * The token binds the completion request to the exact object keys and the
 * preallocated MediaAsset id created at initiate time — the completion route
 * never trusts client-supplied paths or ids.
 */

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import {
  APPROVED_IMAGE_MIMES,
  APPROVED_VIDEO_MIMES,
  MEDIA_KIND,
} from '../admin/media/media-policy.ts';

export const UPLOAD_TOKEN_TTL_MS = 15 * 60 * 1000;
export const UPLOAD_TOKEN_VERSION = 'v1';
/** 16 bytes = 128 random bits, per D-067 (jti >= 128 bits). */
const JTI_BYTE_LENGTH = 16;

export const uploadTokenPayloadSchema = z
  .object({
    /** Preallocated MediaAsset id created at initiate time. */
    mediaAssetId: z.string().min(1).max(128),
    /** One of the approved image/video MIME types. */
    mimeType: z.enum([...APPROVED_IMAGE_MIMES, ...APPROVED_VIDEO_MIMES]),
    /** Exact byte size declared at initiate time. */
    sizeBytes: z.number().int().positive(),
    kind: z.enum([MEDIA_KIND.IMAGE, MEDIA_KIND.VIDEO]),
    /** Canonical temp key the client was presigned to PUT. */
    tempKey: z.string().min(1).max(1024),
    /** Canonical public key the object is promoted to on completion. */
    publicKey: z.string().min(1).max(1024),
    /** Uploader (ARIOT User.id) — completion requires the SAME user (D-067). */
    userId: z.string().min(1).max(128),
    iat: z.number().int().positive(),
    exp: z.number().int().positive(),
    jti: z.string().min(1),
  })
  .strict();

export type UploadTokenPayload = z.infer<typeof uploadTokenPayloadSchema>;

export type UploadTokenInput = Omit<UploadTokenPayload, 'iat' | 'exp' | 'jti'>;

/**
 * Creates a signed completion token: fills iat/exp/jti, validates the strict
 * Zod payload, then signs it. Returns the `v1.<payload>.<hmac>` string.
 */
export function createUploadToken(secret: string, input: UploadTokenInput): string {
  const now = Date.now();
  const payload = uploadTokenPayloadSchema.parse({
    ...input,
    iat: now,
    exp: now + UPLOAD_TOKEN_TTL_MS,
    jti: randomBytes(JTI_BYTE_LENGTH).toString('base64url'),
  });
  return signUploadToken(secret, payload);
}

/** Serializes + signs a payload into a `v1.<payload>.<hmac>` token string. */
export function signUploadToken(secret: string, payload: UploadTokenPayload): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = createHmac('sha256', secret).update(encodedPayload).digest('base64url');
  return `${UPLOAD_TOKEN_VERSION}.${encodedPayload}.${hmac}`;
}

export type TokenVerification =
  | { ok: true; payload: UploadTokenPayload }
  | { ok: false; reason: TokenRejectReason };

export type TokenRejectReason = 'malformed' | 'bad-signature' | 'invalid-payload' | 'expired';

/**
 * Verifies a completion token: format, constant-time HMAC, Zod payload, and
 * 15-minute expiry. Returns the validated payload on success.
 */
export function verifyUploadToken(secret: string, token: string): TokenVerification {
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== UPLOAD_TOKEN_VERSION) {
    return { ok: false, reason: 'malformed' };
  }
  const [, encodedPayload, providedHmac] = parts;

  const expectedHmac = createHmac('sha256', secret).update(encodedPayload).digest('base64url');
  const providedBuf = Buffer.from(providedHmac);
  const expectedBuf = Buffer.from(expectedHmac);
  if (providedBuf.length !== expectedBuf.length || !timingSafeEqual(providedBuf, expectedBuf)) {
    return { ok: false, reason: 'bad-signature' };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  const parsed = uploadTokenPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: 'invalid-payload' };
  }

  if (parsed.data.exp < Date.now()) {
    return { ok: false, reason: 'expired' };
  }

  return { ok: true, payload: parsed.data };
}
