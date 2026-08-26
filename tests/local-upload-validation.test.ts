/**
 * tests/local-upload-validation.test.ts — Step 2.4.4 local provider (D-068).
 *
 * Route-contract checks (thin dispatchers), the multipart form contract, the
 * per-kind size cap, and the real file-signature verification helper. Runs
 * against an isolated temp root and never touches a database (all scenarios
 * here reject before persistence).
 *
 * Run:
 *   node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/local-upload-validation.test.ts
 */

import { describe, it, before, after } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { localUploadFromForm } from '../server/storage/local-upload.ts';
import {
  clearAuthContextOverride,
  setAuthContextOverride,
} from '../server/storage/upload-context.ts';
import { MAX_IMAGE_SIZE_BYTES, MAX_VIDEO_SIZE_BYTES } from '../server/admin/media/media-policy.ts';
import {
  MIN_SIGNATURE_BYTES,
  verifyUploadedBuffer,
} from '../server/storage/media-file-verification.ts';

const TINY_PNG = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x08, 0x08, 0x02, 0x00, 0x00, 0x00, 0x4b, 0x6d, 0x29,
  0xdc,
]);

const JPEG_BYTES = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
  0x00, 0x01, 0x00, 0x00, 0xff, 0xd9,
]);

// ── Helpers ──────────────────────────────────────────────────────────────────

let tempRoot: string;

function installAuthStub(userId: string): void {
  setAuthContextOverride(async () => ({
    userId,
    email: `${userId}@test.local`,
    roles: ['CONTENT_ADMIN'],
    permissions: ['media.write'],
  }));
}

function buildForm(file: File, mimeType: string, kind: string): FormData {
  const form = new FormData();
  form.append('file', file);
  form.append('mimeType', mimeType);
  form.append('kind', kind);
  return form;
}

/** Buffer → BlobPart (typed for File construction under TS 5 lib). */
function toBlobPart(bytes: Buffer): BlobPart {
  return new Uint8Array(bytes);
}

function pngFile(bytes: Buffer = TINY_PNG, type = 'image/png'): File {
  return new File([toBlobPart(bytes)], 'photo.png', { type });
}

async function walkFiles(dir: string): Promise<string[]> {
  const { readdir } = await import('node:fs/promises');
  const { stat } = await import('node:fs/promises');
  const out: string[] = [];
  const entries = await readdir(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const info = await stat(full);
    if (info.isDirectory()) {
      out.push(...(await walkFiles(full)));
    } else {
      out.push(full);
    }
  }
  return out;
}

before(async () => {
  tempRoot = mkdtempSync(join(tmpdir(), 'ariot-local-validation-'));
});

after(async () => {
  clearAuthContextOverride();
  rmSync(tempRoot, { recursive: true, force: true });
});

// ── Route contracts (thin dispatchers) ───────────────────────────────────────

describe('Local upload route contracts (D-068)', () => {
  it('local upload route is a thin dispatcher', () => {
    const content = readFileSync(
      resolve(process.cwd(), 'app/api/admin/media/uploads/local/route.ts'),
      'utf8',
    );
    assert.ok(content.includes('localUploadFromForm'));
    assert.ok(!content.includes('userId'));
    assert.ok(!content.includes('permissions'));
    assert.ok(!content.includes('roles'));
    assert.ok(!content.includes('actor'));
    assert.ok(content.includes('Internal server error.'));
  });

  it('upload mode route exposes the server-resolved provider', () => {
    const content = readFileSync(
      resolve(process.cwd(), 'app/api/admin/media/upload/mode/route.ts'),
      'utf8',
    );
    assert.ok(content.includes('resolveProviderName'));
    assert.ok(!content.includes('permissions'));
  });

  it('storage health route is admin-gated', () => {
    const content = readFileSync(
      resolve(process.cwd(), 'app/api/admin/media/storage/health/route.ts'),
      'utf8',
    );
    assert.ok(content.includes('getMediaStorageProvider'));
    assert.ok(content.includes('requireMediaWrite'));
  });

  it('public delivery route re-parses keys and narrows to the local provider', () => {
    const content = readFileSync(
      resolve(process.cwd(), 'app/media/[...segments]/route.ts'),
      'utf8',
    );
    assert.ok(content.includes('parsePublicMediaKey'));
    assert.ok(content.includes('LocalMediaStorageProvider'));
    assert.ok(content.includes('Accept-Ranges'));
  });
});

// ── Form contract + size cap ────────────────────────────────────────────────

describe('localUploadFromForm — form contract (D-068)', () => {
  it('requires media.write permission', async () => {
    // A null auth override simulates an unauthenticated/denied caller; the
    // real RBAC path is covered by product-api-route-security tests.
    setAuthContextOverride(async () => null);
    const result = await localUploadFromForm(
      buildForm(pngFile(), 'image/png', 'IMAGE'),
      undefined,
      { root: tempRoot },
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.type, 'forbidden');
  });

  it('rejects a request with exactly zero files', async () => {
    installAuthStub('u-empty-form');
    const form = new FormData();
    form.append('mimeType', 'image/png');
    form.append('kind', 'IMAGE');
    const result = await localUploadFromForm(form, undefined, { root: tempRoot });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.type, 'validation');
  });

  it('rejects a request with more than one file', async () => {
    installAuthStub('u-multi-file');
    const form = new FormData();
    form.append('file', pngFile());
    form.append('file', pngFile());
    form.append('mimeType', 'image/png');
    form.append('kind', 'IMAGE');
    const result = await localUploadFromForm(form, undefined, { root: tempRoot });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.type, 'validation');
  });

  it('rejects unexpected form fields', async () => {
    installAuthStub('u-extra-field');
    const form = buildForm(pngFile(), 'image/png', 'IMAGE');
    form.append('provider', 'local');
    const result = await localUploadFromForm(form, undefined, { root: tempRoot });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.type, 'validation');
  });

  it('rejects an unsupported MIME type', async () => {
    installAuthStub('u-bad-mime');
    const form = buildForm(pngFile(), 'image/svg+xml', 'IMAGE');
    const result = await localUploadFromForm(form, undefined, { root: tempRoot });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.type, 'validation');
  });

  it('rejects a kind that does not match the MIME type', async () => {
    installAuthStub('u-kind-mismatch');
    const result = await localUploadFromForm(
      buildForm(pngFile(), 'image/png', 'VIDEO'),
      undefined,
      { root: tempRoot },
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.type, 'validation');
  });

  it('rejects an empty file', async () => {
    installAuthStub('u-empty-file');
    const result = await localUploadFromForm(
      buildForm(pngFile(Buffer.alloc(0)), 'image/png', 'IMAGE'),
      undefined,
      { root: tempRoot },
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.type, 'validation');
  });

  it('rejects an image over the 10 MB size cap', async () => {
    installAuthStub('u-big-image');
    const big = new File([toBlobPart(Buffer.alloc(MAX_IMAGE_SIZE_BYTES + 1))], 'big.png', {
      type: 'image/png',
    });
    const result = await localUploadFromForm(buildForm(big, 'image/png', 'IMAGE'), undefined, {
      root: tempRoot,
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.type, 'validation');
  });

  it('rejects a video over the 200 MB size cap', async () => {
    installAuthStub('u-big-video');
    const big = new File([toBlobPart(Buffer.alloc(MAX_VIDEO_SIZE_BYTES + 1))], 'big.mp4', {
      type: 'video/mp4',
    });
    const result = await localUploadFromForm(buildForm(big, 'video/mp4', 'VIDEO'), undefined, {
      root: tempRoot,
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.type, 'validation');
  });
});

// ── Signature verification + compensation cleanup ───────────────────────────

describe('localUploadFromForm — signature verification', () => {
  it('rejects declared image/png whose real bytes are JPEG and cleans up', async () => {
    installAuthStub('u-sig-mismatch');
    const result = await localUploadFromForm(
      buildForm(pngFile(JPEG_BYTES, 'image/png'), 'image/png', 'IMAGE'),
      undefined,
      { root: tempRoot },
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.type, 'validation');
    const leftovers = (await walkFiles(tempRoot)).filter((p) => p.includes('tmp'));
    assert.equal(leftovers.length, 0, 'temp upload files must be cleaned up');
  });

  it('rejects declared mp4/VIDEO whose real bytes are a PNG image', async () => {
    installAuthStub('u-sig-video-kind');
    const result = await localUploadFromForm(
      buildForm(pngFile(TINY_PNG, 'video/mp4'), 'video/mp4', 'VIDEO'),
      undefined,
      { root: tempRoot },
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.type, 'validation');
  });
});

describe('verifyUploadedBuffer', () => {
  it('accepts a real PNG with matching declaration', async () => {
    const result = await verifyUploadedBuffer(TINY_PNG, {
      declaredMime: 'image/png',
      declaredKind: 'IMAGE',
    });
    assert.ok(result.ok);
  });

  it('rejects a MIME mismatch', async () => {
    const result = await verifyUploadedBuffer(JPEG_BYTES, {
      declaredMime: 'image/png',
      declaredKind: 'IMAGE',
    });
    assert.ok(!result.ok);
  });

  it('rejects a kind mismatch (image declared as video)', async () => {
    const result = await verifyUploadedBuffer(TINY_PNG, {
      declaredMime: 'image/png',
      declaredKind: 'VIDEO',
    });
    assert.ok(!result.ok);
  });

  it('rejects a buffer too small to identify', async () => {
    const result = await verifyUploadedBuffer(Buffer.alloc(MIN_SIGNATURE_BYTES - 1), {
      declaredMime: 'image/png',
      declaredKind: 'IMAGE',
    });
    assert.ok(!result.ok);
  });
});
