/**
 * tests/upload-keys.test.ts — Step 2.4.4 canonical object keys and completion
 * key binding (STORAGE-1R / D-067).
 *
 * Covers the temp/public key builders + strict parsers, path-traversal
 * rejection, and validateTokenKeys (the completion flow's cross-check that the
 * token's keys, kind, and extension all agree).
 *
 * Run:
 *   node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/upload-keys.test.ts
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  buildPublicMediaKey,
  buildTempUploadKey,
  isSafeObjectKey,
  kindToFolder,
  parsePublicMediaKey,
  parseTempUploadKey,
  validateTokenKeys,
} from '../server/storage/upload-keys.ts';
import type { UploadTokenPayload } from '../server/storage/upload-token.ts';

const UUID = '9a7f1c2e-8d4b-4c6a-b1e2-3f5a7b9d1c0e';
const DATE = new Date('2026-08-05T12:00:00.000Z');

function makePayload(overrides: Partial<UploadTokenPayload> = {}): UploadTokenPayload {
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
    iat: Date.now(),
    exp: Date.now() + 15 * 60 * 1000,
    jti: 'x',
    ...overrides,
  };
}

describe('Temp upload keys', () => {
  it('builds and parses a canonical temp key', () => {
    const key = buildTempUploadKey({ id: UUID, ext: 'jpg', date: DATE });
    assert.strictEqual(key, `tmp/uploads/2026/08/${UUID}.jpg`);
    const parsed = parseTempUploadKey(key);
    assert.ok(parsed);
    assert.deepStrictEqual(parsed, {
      id: UUID,
      ext: 'jpg',
      yearMonth: '2026/08',
    });
  });

  it('zero-pads the month', () => {
    const key = buildTempUploadKey({
      id: UUID,
      ext: 'png',
      date: new Date('2026-01-05T00:00:00.000Z'),
    });
    assert.strictEqual(key, `tmp/uploads/2026/01/${UUID}.png`);
  });

  it('rejects keys with out-of-range year or month', () => {
    assert.strictEqual(parseTempUploadKey(`tmp/uploads/1999/08/${UUID}.jpg`), null);
    assert.strictEqual(parseTempUploadKey(`tmp/uploads/2101/08/${UUID}.jpg`), null);
    assert.strictEqual(parseTempUploadKey(`tmp/uploads/2026/00/${UUID}.jpg`), null);
    assert.strictEqual(parseTempUploadKey(`tmp/uploads/2026/13/${UUID}.jpg`), null);
  });

  it('rejects malformed or injected temp keys', () => {
    assert.strictEqual(parseTempUploadKey(''), null);
    assert.strictEqual(parseTempUploadKey(`uploads/2026/08/${UUID}.jpg`), null);
    assert.strictEqual(parseTempUploadKey(`tmp/2026/08/${UUID}.jpg`), null);
    assert.strictEqual(parseTempUploadKey(`tmp/uploads/2026/08/${UUID.slice(0, 6)}.jpg`), null);
    assert.strictEqual(parseTempUploadKey(`tmp/uploads/2026/08/${UUID}.JPG`), null);
    assert.strictEqual(parseTempUploadKey(`tmp/uploads/2026/08/${UUID}.jp g`), null);
    assert.strictEqual(parseTempUploadKey(`tmp/uploads/2026/08/${UUID}.jp\\g`), null);
    assert.strictEqual(parseTempUploadKey(`tmp/uploads/2026/08/${UUID}/extra.jpg`), null);
    assert.strictEqual(parseTempUploadKey(`tmp/uploads/2026/08/${UUID}.jpg/../escape`), null);
  });
});

describe('Public media keys', () => {
  it('builds and parses an image public key', () => {
    const key = buildPublicMediaKey({
      kind: 'IMAGE',
      id: UUID,
      ext: 'webp',
      date: DATE,
    });
    assert.strictEqual(key, `public/products/images/2026/08/${UUID}.webp`);
    const parsed = parsePublicMediaKey(key);
    assert.deepStrictEqual(parsed, {
      kind: 'IMAGE',
      id: UUID,
      ext: 'webp',
      yearMonth: '2026/08',
    });
  });

  it('builds and parses a video public key', () => {
    const key = buildPublicMediaKey({
      kind: 'VIDEO',
      id: UUID,
      ext: 'mp4',
      date: DATE,
    });
    assert.strictEqual(key, `public/products/videos/2026/08/${UUID}.mp4`);
    const parsed = parsePublicMediaKey(key);
    assert.ok(parsed);
    assert.strictEqual(parsed.kind, 'VIDEO');
  });

  it('rejects public keys with the wrong folder or shape', () => {
    assert.strictEqual(parsePublicMediaKey(`public/products/models/2026/08/${UUID}.jpg`), null);
    assert.strictEqual(parsePublicMediaKey(`public/products/images/2026/08/${UUID}`), null);
    assert.strictEqual(parsePublicMediaKey(`public/products/images/2026/13/${UUID}.jpg`), null);
  });

  it('maps kind to folder', () => {
    assert.strictEqual(kindToFolder('IMAGE'), 'images');
    assert.strictEqual(kindToFolder('VIDEO'), 'videos');
  });
});

describe('isSafeObjectKey', () => {
  it('rejects traversal and injection patterns', () => {
    assert.ok(!isSafeObjectKey(''));
    assert.ok(!isSafeObjectKey('a//b'));
    assert.ok(!isSafeObjectKey('..'));
    assert.ok(!isSafeObjectKey('a/../../etc'));
    assert.ok(!isSafeObjectKey('a\\b'));
    assert.ok(!isSafeObjectKey('a'.repeat(1025)));
  });

  it('accepts a normal key', () => {
    assert.ok(isSafeObjectKey(`tmp/uploads/2026/08/${UUID}.jpg`));
  });
});

describe('validateTokenKeys', () => {
  it('accepts a payload whose keys agree with the token', () => {
    assert.deepStrictEqual(validateTokenKeys(makePayload()), { ok: true });
  });

  it('rejects when the temp key id does not match the token id', () => {
    const result = validateTokenKeys(
      makePayload({
        tempKey: buildTempUploadKey({
          id: 'b2c3d4e5-f6a7-48b9-9c1d-2e3f4a5b6c7d',
          ext: 'jpg',
          date: DATE,
        }),
      }),
    );
    assert.deepStrictEqual(result, {
      ok: false,
      message: 'Upload keys do not match the token.',
    });
  });

  it('rejects when the public key kind disagrees with the token kind', () => {
    const result = validateTokenKeys(
      makePayload({
        kind: 'IMAGE',
        publicKey: buildPublicMediaKey({
          kind: 'VIDEO',
          id: UUID,
          ext: 'jpg',
          date: DATE,
        }),
      }),
    );
    assert.deepStrictEqual(result, {
      ok: false,
      message: 'Upload keys do not match the token.',
    });
  });

  it('rejects when the key extension disagrees with the MIME type', () => {
    const result = validateTokenKeys(
      makePayload({
        mimeType: 'image/jpeg',
        tempKey: buildTempUploadKey({ id: UUID, ext: 'png', date: DATE }),
        publicKey: buildPublicMediaKey({
          kind: 'IMAGE',
          id: UUID,
          ext: 'png',
          date: DATE,
        }),
      }),
    );
    assert.deepStrictEqual(result, {
      ok: false,
      message: 'Upload key extension does not match the media type.',
    });
  });

  it('rejects an unapproved MIME type', () => {
    // Cast: the payload schema only admits approved MIMEs; an attacker-supplied
    // payload could still carry an unapproved type, which the validator must
    // reject at runtime.
    const result = validateTokenKeys({
      ...makePayload(),
      mimeType: 'image/gif',
    } as unknown as UploadTokenPayload);
    assert.deepStrictEqual(result, {
      ok: false,
      message: 'Upload key extension does not match the media type.',
    });
  });

  it('rejects malformed keys', () => {
    const result = validateTokenKeys(
      makePayload({ tempKey: 'not-a-key', publicKey: 'also-not-a-key' }),
    );
    assert.deepStrictEqual(result, {
      ok: false,
      message: 'Invalid upload keys in token.',
    });
  });

  it('rejects traversal attempts at the parse step before the safe-key guard', () => {
    // The strict parsers reject `..`, `//` and `\` structurally, so a payload
    // carrying a traversal key fails validation regardless of the guard.
    const result = validateTokenKeys(
      makePayload({
        publicKey: `public/products/images/2026/08/${UUID}.jpg/../escape`,
      }),
    );
    assert.ok(!result.ok);
  });

  it('any key that parses is structurally safe (defense-in-depth invariant)', () => {
    // The safe-key guard in validateTokenKeys runs after the parsers, so a key
    // that reaches it can never be unsafe. Assert the invariant holds for the
    // canonical builders.
    const payload = makePayload();
    assert.ok(parseTempUploadKey(payload.tempKey));
    assert.ok(parsePublicMediaKey(payload.publicKey));
    assert.ok(isSafeObjectKey(payload.tempKey));
    assert.ok(isSafeObjectKey(payload.publicKey));
  });
});
