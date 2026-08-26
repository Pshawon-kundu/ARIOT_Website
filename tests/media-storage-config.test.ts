/**
 * tests/media-storage-config.test.ts — Step 2.4.4 provider abstraction (D-068).
 *
 * Provider selection, public-URL generation for both providers, local-root
 * safety validation, the ext → MIME map, and the env contract fail-closed
 * behavior. No database, no filesystem writes.
 *
 * Run:
 *   node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/media-storage-config.test.ts
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { normalize, resolve } from 'node:path';
import {
  getMediaStorageProvider,
  resetMediaStorageProviderForTests,
  resolveProviderName,
} from '../server/storage/get-media-storage-provider.ts';
import { LocalMediaStorageProvider } from '../server/storage/local-media-storage.ts';
import { R2MediaStorageProvider } from '../server/storage/r2-media-storage.ts';
import { assertSafeLocalRoot } from '../server/storage/media-storage-config.ts';
import { getMimeForExtension } from '../server/admin/media/media-policy.ts';

const DEV_ROOT = resolve(process.cwd(), '..', 'ariot-media-dev');

describe('Media storage provider selection (D-068)', () => {
  it('resolves to local in development when MEDIA_STORAGE_PROVIDER is unset', () => {
    // Test process: no MEDIA_STORAGE_PROVIDER, NODE_ENV defaults to
    // development → dev default provider is local.
    assert.equal(resolveProviderName(), 'local');
  });

  it('getMediaStorageProvider returns a local provider by default', () => {
    resetMediaStorageProviderForTests();
    const provider = getMediaStorageProvider();
    assert.equal(provider.name, 'local');
    resetMediaStorageProviderForTests();
  });
});

describe('Local provider public URLs', () => {
  const provider = new LocalMediaStorageProvider({ root: DEV_ROOT });

  it('returns the persisted cdnUrl when present', () => {
    const url = '/media/products/images/2026/08/cabc123.png';
    assert.equal(provider.getPublicUrl('public/products/images/2026/08/cabc123.png', url), url);
  });

  it('builds a site-relative /media/... URL when no publicBaseUrl is set', () => {
    assert.equal(
      provider.getPublicUrl('public/products/images/2026/08/cabc123.png', null),
      '/media/products/images/2026/08/cabc123.png',
    );
  });

  it('builds an absolute URL when MEDIA_PUBLIC_BASE_URL is set', () => {
    const abs = new LocalMediaStorageProvider({
      root: DEV_ROOT,
      publicBaseUrl: 'https://media.ariot.tech',
    });
    assert.equal(
      abs.getPublicUrl('public/products/videos/2026/08/cdef456.mp4', null),
      'https://media.ariot.tech/media/products/videos/2026/08/cdef456.mp4',
    );
  });
});

describe('R2 provider public URLs', () => {
  const provider = new R2MediaStorageProvider();

  it('returns the persisted cdnUrl when present', () => {
    const url = 'https://media.example.com/public/products/images/2026/08/cabc.png';
    assert.equal(provider.getPublicUrl('public/products/images/2026/08/cabc.png', url), url);
  });

  it('falls back to a site-relative /{storageKey} URL', () => {
    assert.equal(
      provider.getPublicUrl('public/products/images/2026/08/cabc.png', null),
      '/public/products/images/2026/08/cabc.png',
    );
  });
});

describe('assertSafeLocalRoot (D-068 root safety)', () => {
  it('accepts an absolute path outside the public directory', () => {
    assert.equal(assertSafeLocalRoot(DEV_ROOT), normalize(DEV_ROOT));
  });

  it('rejects a relative path', () => {
    assert.throws(() => assertSafeLocalRoot('relative/media'), /absolute/);
  });

  it('rejects a root with explicit ".." segments', () => {
    const rootWithDotDot = `${resolve(process.cwd(), 'media')}\\..\\escape`;
    assert.throws(() => assertSafeLocalRoot(rootWithDotDot), /\.\./);
  });

  it('rejects a root inside the Next.js public directory', () => {
    assert.throws(() => assertSafeLocalRoot(resolve(process.cwd(), 'public', 'uploads')), /public/);
  });
});

describe('ext → MIME mapping (media-policy)', () => {
  it('maps every canonical extension to its approved MIME type', () => {
    assert.equal(getMimeForExtension('jpg'), 'image/jpeg');
    assert.equal(getMimeForExtension('png'), 'image/png');
    assert.equal(getMimeForExtension('webp'), 'image/webp');
    assert.equal(getMimeForExtension('avif'), 'image/avif');
    assert.equal(getMimeForExtension('mp4'), 'video/mp4');
    assert.equal(getMimeForExtension('webm'), 'video/webm');
  });

  it('returns null for an unapproved extension', () => {
    assert.equal(getMimeForExtension('svg'), null);
    assert.equal(getMimeForExtension('exe'), null);
  });
});

describe('Env contract fail-closed behavior (D-068)', () => {
  it('rejects an unknown MEDIA_STORAGE_PROVIDER value at boot', async () => {
    process.env.MEDIA_STORAGE_PROVIDER = 's3';
    let threw = false;
    const specA = '../server/env.ts?case=unknown-provider';
    try {
      await import(specA);
    } catch {
      threw = true;
    }
    assert.ok(threw, 'env.ts must fail closed on an unknown provider value');
    delete process.env.MEDIA_STORAGE_PROVIDER;
  });

  it('rejects a relative MEDIA_LOCAL_ROOT at boot', async () => {
    process.env.MEDIA_LOCAL_ROOT = 'relative/media-root';
    let threw = false;
    const specB = '../server/env.ts?case=relative-local-root';
    try {
      await import(specB);
    } catch {
      threw = true;
    }
    assert.ok(threw, 'env.ts must reject a non-absolute MEDIA_LOCAL_ROOT');
    delete process.env.MEDIA_LOCAL_ROOT;
  });
});
