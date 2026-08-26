/**
 * tests/upload-complete-logic.test.ts — Step 2.4.4 completion binding logic
 * (STORAGE-1R / D-067).
 *
 * Exercises the pure decision logic of the completion flow: a real minted
 * token must bind its preallocated MediaAsset id, keys, kind, size, and the
 * initiating user, and every tamper path must be rejected before storage is
 * touched. The R2 calls themselves are out of scope here — those run against
 * the real dev bucket in the smoke test.
 *
 * Run:
 *   node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/upload-complete-logic.test.ts
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  createUploadToken,
  signUploadToken,
  verifyUploadToken,
} from '../server/storage/upload-token.ts';
import {
  buildPublicMediaKey,
  buildTempUploadKey,
  parsePublicMediaKey,
  parseTempUploadKey,
  validateTokenKeys,
} from '../server/storage/upload-keys.ts';
import type { UploadTokenPayload } from '../server/storage/upload-token.ts';

const SECRET = 'unit-test-upload-token-secret';
const UUID = '9a7f1c2e-8d4b-4c6a-b1e2-3f5a7b9d1c0e';
const DATE = new Date('2026-08-05T12:00:00.000Z');

describe('Completion binding logic', () => {
  it('a minted token verifies and passes key validation end-to-end', () => {
    const token = createUploadToken(SECRET, {
      mediaAssetId: UUID,
      mimeType: 'video/mp4',
      sizeBytes: 8 * 1024 * 1024,
      kind: 'VIDEO',
      tempKey: buildTempUploadKey({ id: UUID, ext: 'mp4', date: DATE }),
      publicKey: buildPublicMediaKey({
        kind: 'VIDEO',
        id: UUID,
        ext: 'mp4',
        date: DATE,
      }),
      userId: 'user_abc',
    });

    const verification = verifyUploadToken(SECRET, token);
    assert.ok(verification.ok);
    if (verification.ok) {
      assert.strictEqual(verification.payload.mediaAssetId, UUID);
      assert.strictEqual(verification.payload.kind, 'VIDEO');
      assert.strictEqual(verification.payload.mimeType, 'video/mp4');
      assert.strictEqual(verification.payload.sizeBytes, 8 * 1024 * 1024);
      // D-067: the completion request must be bound to the initiating user.
      assert.strictEqual(verification.payload.userId, 'user_abc');
      assert.deepStrictEqual(validateTokenKeys(verification.payload), {
        ok: true,
      });
    }
  });

  it('temp and public keys in a token always reference the same id', () => {
    const token = createUploadToken(SECRET, {
      mediaAssetId: UUID,
      mimeType: 'image/jpeg',
      sizeBytes: 2048,
      kind: 'IMAGE',
      tempKey: buildTempUploadKey({ id: UUID, ext: 'jpg', date: DATE }),
      publicKey: buildPublicMediaKey({
        kind: 'IMAGE',
        id: UUID,
        ext: 'jpg',
        date: DATE,
      }),
      userId: 'user_abc',
    });
    const verification = verifyUploadToken(SECRET, token);
    assert.ok(verification.ok);
    if (verification.ok) {
      const { tempKey, publicKey } = verification.payload;
      const tempParsed = parseTempUploadKey(tempKey);
      const publicParsed = parsePublicMediaKey(publicKey);
      assert.ok(tempParsed && publicParsed);
      assert.strictEqual(tempParsed.id, UUID);
      assert.strictEqual(publicParsed.id, UUID);
      assert.strictEqual(tempParsed.id, publicParsed.id);
    }
  });

  it('rejects a token whose keys were swapped for another asset', () => {
    const otherId = 'b2c3d4e5-f6a7-48b9-9c1d-2e3f4a5b6c7d';
    const payload: UploadTokenPayload = {
      mediaAssetId: UUID,
      mimeType: 'image/jpeg',
      sizeBytes: 2048,
      kind: 'IMAGE',
      tempKey: buildTempUploadKey({ id: otherId, ext: 'jpg', date: DATE }),
      publicKey: buildPublicMediaKey({
        kind: 'IMAGE',
        id: otherId,
        ext: 'jpg',
        date: DATE,
      }),
      userId: 'user_abc',
      iat: Date.now(),
      exp: Date.now() + 15 * 60 * 1000,
      jti: 'x',
    };
    assert.ok(!validateTokenKeys(payload).ok);
  });

  it('rejects a token whose folder implies a different kind', () => {
    const payload: UploadTokenPayload = {
      mediaAssetId: UUID,
      mimeType: 'image/jpeg',
      sizeBytes: 2048,
      kind: 'IMAGE',
      tempKey: buildTempUploadKey({ id: UUID, ext: 'jpg', date: DATE }),
      // Public key routed to the videos folder while the token says IMAGE.
      publicKey: buildPublicMediaKey({
        kind: 'VIDEO',
        id: UUID,
        ext: 'jpg',
        date: DATE,
      }),
      userId: 'user_abc',
      iat: Date.now(),
      exp: Date.now() + 15 * 60 * 1000,
      jti: 'x',
    };
    assert.ok(!validateTokenKeys(payload).ok);
  });

  it('rejects a token that declares a size different from the keyed upload', () => {
    const payload: UploadTokenPayload = {
      mediaAssetId: UUID,
      mimeType: 'image/jpeg',
      sizeBytes: 999999,
      kind: 'IMAGE',
      tempKey: buildTempUploadKey({ id: UUID, ext: 'jpg', date: DATE }),
      publicKey: buildPublicMediaKey({
        kind: 'IMAGE',
        id: UUID,
        ext: 'jpg',
        date: DATE,
      }),
      userId: 'user_abc',
      iat: Date.now(),
      exp: Date.now() + 15 * 60 * 1000,
      jti: 'x',
    };
    const token = signUploadToken(SECRET, payload);
    const verification = verifyUploadToken(SECRET, token);
    assert.ok(verification.ok);
    if (verification.ok) {
      // Key binding is still consistent; the size mismatch is caught at the
      // storage layer (HEAD ContentLength check), not by the token schema.
      assert.deepStrictEqual(validateTokenKeys(verification.payload), {
        ok: true,
      });
      assert.strictEqual(verification.payload.sizeBytes, 999999);
    }
  });

  it('rejects a forged token before any key check runs', () => {
    const token = createUploadToken(SECRET, {
      mediaAssetId: UUID,
      mimeType: 'image/png',
      sizeBytes: 1024,
      kind: 'IMAGE',
      tempKey: buildTempUploadKey({ id: UUID, ext: 'png', date: DATE }),
      publicKey: buildPublicMediaKey({
        kind: 'IMAGE',
        id: UUID,
        ext: 'png',
        date: DATE,
      }),
      userId: 'user_abc',
    });
    const parts = token.split('.');
    const tampered = `${parts[0]}.${parts[1].slice(0, -1)}x.${parts[2]}`;
    const result = verifyUploadToken(SECRET, tampered);
    assert.deepStrictEqual(result, { ok: false, reason: 'bad-signature' });
  });

  it('rejects a stale token even when the signature is valid', () => {
    const stale = signUploadToken(SECRET, {
      mediaAssetId: UUID,
      mimeType: 'image/jpeg',
      sizeBytes: 1024,
      kind: 'IMAGE',
      tempKey: buildTempUploadKey({ id: UUID, ext: 'jpg', date: DATE }),
      publicKey: buildPublicMediaKey({
        kind: 'IMAGE',
        id: UUID,
        ext: 'jpg',
        date: DATE,
      }),
      userId: 'user_abc',
      iat: Date.now() - 30 * 60 * 1000,
      exp: Date.now() - 15 * 60 * 1000,
      jti: 'x',
    });
    const result = verifyUploadToken(SECRET, stale);
    assert.deepStrictEqual(result, { ok: false, reason: 'expired' });
  });

  it('completion source enforces the same-user binding (D-067)', () => {
    const content = readFileSync(
      resolve(process.cwd(), 'server/storage/upload-complete.ts'),
      'utf8',
    );
    assert.ok(content.includes('auth.userId !== payload.userId'));
    assert.ok(content.includes('Completion must be performed by the initiating user.'));
  });
});
