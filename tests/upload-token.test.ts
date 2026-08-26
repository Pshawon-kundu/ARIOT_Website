/**
 * tests/upload-token.test.ts — Step 2.4.4 upload completion token
 * (STORAGE-1R / D-067).
 *
 * Covers the `v1.<payload>.<hmac>` format, HMAC verification (constant-time
 * path), strict Zod payload, 15-minute lifetime, and jti entropy.
 *
 * Run:
 *   node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/upload-token.test.ts
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { createHmac } from 'node:crypto';
import {
  createUploadToken,
  signUploadToken,
  verifyUploadToken,
  UPLOAD_TOKEN_TTL_MS,
  UPLOAD_TOKEN_VERSION,
  uploadTokenPayloadSchema,
  type UploadTokenInput,
  type UploadTokenPayload,
} from '../server/storage/upload-token.ts';
import { buildPublicMediaKey, buildTempUploadKey } from '../server/storage/upload-keys.ts';

const SECRET = 'unit-test-upload-token-secret';
const UUID = '9a7f1c2e-8d4b-4c6a-b1e2-3f5a7b9d1c0e';
const DATE = new Date('2026-08-05T12:00:00.000Z');

function makeInput(overrides: Partial<UploadTokenInput> = {}): UploadTokenInput {
  return {
    mediaAssetId: UUID,
    mimeType: 'image/jpeg',
    sizeBytes: 4096,
    kind: 'IMAGE',
    tempKey: buildTempUploadKey({ id: UUID, ext: 'jpg', date: DATE }),
    publicKey: buildPublicMediaKey({
      kind: 'IMAGE',
      id: UUID,
      ext: 'jpg',
      date: DATE,
    }),
    userId: 'user_123',
    ...overrides,
  };
}

function makePayload(overrides: Partial<UploadTokenPayload> = {}): UploadTokenPayload {
  return {
    ...makeInput(),
    iat: Date.now(),
    exp: Date.now() + UPLOAD_TOKEN_TTL_MS,
    jti: 'x',
    ...overrides,
  };
}

describe('Upload completion token', () => {
  it('produces a three-part v1 token', () => {
    const token = createUploadToken(SECRET, makeInput());
    const parts = token.split('.');
    assert.strictEqual(parts.length, 3);
    assert.strictEqual(parts[0], UPLOAD_TOKEN_VERSION);
    assert.ok(parts[1].length > 0);
    assert.ok(parts[2].length > 0);
  });

  it('round-trips through verify with the same secret', () => {
    const token = createUploadToken(SECRET, makeInput());
    const result = verifyUploadToken(SECRET, token);
    assert.ok(result.ok);
    if (result.ok) {
      assert.strictEqual(result.payload.mediaAssetId, UUID);
      assert.strictEqual(result.payload.mimeType, 'image/jpeg');
      assert.strictEqual(result.payload.sizeBytes, 4096);
      assert.strictEqual(result.payload.kind, 'IMAGE');
      assert.strictEqual(result.payload.userId, 'user_123');
      assert.match(result.payload.tempKey, /^tmp\/uploads\//);
      assert.match(result.payload.publicKey, /^public\/products\/images\//);
    }
  });

  it('sets iat at issue time and exp exactly TTL later', () => {
    const before = Date.now();
    const token = createUploadToken(SECRET, makeInput());
    const after = Date.now();
    const result = verifyUploadToken(SECRET, token);
    assert.ok(result.ok);
    if (result.ok) {
      assert.ok(result.payload.iat >= before && result.payload.iat <= after);
      assert.strictEqual(result.payload.exp - result.payload.iat, UPLOAD_TOKEN_TTL_MS);
    }
  });

  it('jti is at least 128 bits of entropy', () => {
    const token = createUploadToken(SECRET, makeInput());
    const result = verifyUploadToken(SECRET, token);
    assert.ok(result.ok);
    if (result.ok) {
      const jtiBytes = Buffer.from(result.payload.jti, 'base64url');
      assert.ok(jtiBytes.length >= 16, `jti is ${jtiBytes.length} bytes`);
    }
  });

  it('jti differs between tokens', () => {
    const a = verifyUploadToken(SECRET, createUploadToken(SECRET, makeInput()));
    const b = verifyUploadToken(SECRET, createUploadToken(SECRET, makeInput()));
    assert.ok(a.ok && b.ok);
    if (a.ok && b.ok) {
      assert.notStrictEqual(a.payload.jti, b.payload.jti);
    }
  });

  it('rejects tokens signed with a different secret', () => {
    const token = createUploadToken(SECRET, makeInput());
    const result = verifyUploadToken('different-secret', token);
    assert.deepStrictEqual(result, { ok: false, reason: 'bad-signature' });
  });

  it('rejects a tampered payload segment', () => {
    const token = createUploadToken(SECRET, makeInput());
    const [, payload, hmac] = token.split('.');
    const flipped = (payload[0] === 'e' ? 'f' : 'e') + payload.slice(1);
    const result = verifyUploadToken(SECRET, `${UPLOAD_TOKEN_VERSION}.${flipped}.${hmac}`);
    assert.deepStrictEqual(result, { ok: false, reason: 'bad-signature' });
  });

  it('rejects structurally malformed tokens', () => {
    assert.deepStrictEqual(verifyUploadToken(SECRET, 'a.b'), {
      ok: false,
      reason: 'malformed',
    });
    assert.deepStrictEqual(verifyUploadToken(SECRET, 'a.b.c.d'), {
      ok: false,
      reason: 'malformed',
    });
    assert.deepStrictEqual(verifyUploadToken(SECRET, 'v2.x.y'), {
      ok: false,
      reason: 'malformed',
    });
    assert.deepStrictEqual(verifyUploadToken(SECRET, ''), {
      ok: false,
      reason: 'malformed',
    });
  });

  it('rejects a payload segment that is not valid JSON', () => {
    const encodedPayload = Buffer.from('{this is not json').toString('base64url');
    const hmac = createHmac('sha256', SECRET).update(encodedPayload).digest('base64url');
    const result = verifyUploadToken(SECRET, `${UPLOAD_TOKEN_VERSION}.${encodedPayload}.${hmac}`);
    assert.deepStrictEqual(result, { ok: false, reason: 'malformed' });
  });

  it('rejects a validly-signed payload that fails the strict schema', () => {
    const payload = makePayload() as Record<string, unknown>;
    delete payload.mediaAssetId;
    const token = signUploadToken(SECRET, payload as UploadTokenPayload);
    const result = verifyUploadToken(SECRET, token);
    assert.deepStrictEqual(result, { ok: false, reason: 'invalid-payload' });
  });

  it('rejects an expired token even with a valid signature', () => {
    const token = signUploadToken(
      SECRET,
      makePayload({
        iat: Date.now() - 20 * 60 * 1000,
        exp: Date.now() - 5 * 60 * 1000,
      }),
    );
    const result = verifyUploadToken(SECRET, token);
    assert.deepStrictEqual(result, { ok: false, reason: 'expired' });
  });

  it('accepts a token that expires in the future', () => {
    const token = createUploadToken(SECRET, makeInput());
    const result = verifyUploadToken(SECRET, token);
    assert.ok(result.ok);
    if (result.ok) {
      assert.ok(result.payload.exp > Date.now());
    }
  });

  it('strict schema rejects unknown fields', () => {
    const payload = makePayload() as Record<string, unknown>;
    payload.sneaky = 'x';
    assert.ok(!uploadTokenPayloadSchema.safeParse(payload).success);
  });
});
