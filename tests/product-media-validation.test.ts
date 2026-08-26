/**
 * tests/product-media-validation.test.ts — Step 2.4.4 media validation.
 *
 * Tests media policy constants, MIME validation, and mutation input schemas.
 *
 * Run:
 *   node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/product-media-validation.test.ts
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  isApprovedImageMime,
  isApprovedVideoMime,
  APPROVED_IMAGE_MIMES,
  APPROVED_VIDEO_MIMES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  MEDIA_KIND,
} from '../server/admin/media/media-policy.ts';

describe('Media policy', () => {
  it('approves jpeg, png, webp, avif image MIME types', () => {
    assert.ok(isApprovedImageMime('image/jpeg'));
    assert.ok(isApprovedImageMime('image/png'));
    assert.ok(isApprovedImageMime('image/webp'));
    assert.ok(isApprovedImageMime('image/avif'));
  });

  it('rejects unapproved image MIME types', () => {
    assert.ok(!isApprovedImageMime('image/svg+xml'));
    assert.ok(!isApprovedImageMime('image/gif'));
    assert.ok(!isApprovedImageMime('image/tiff'));
    assert.ok(!isApprovedImageMime('text/html'));
    assert.ok(!isApprovedImageMime('application/javascript'));
    assert.ok(!isApprovedImageMime('video/mp4'));
  });

  it('approves mp4 and webm video MIME types', () => {
    assert.ok(isApprovedVideoMime('video/mp4'));
    assert.ok(isApprovedVideoMime('video/webm'));
  });

  it('rejects unapproved video MIME types', () => {
    assert.ok(!isApprovedVideoMime('video/avi'));
    assert.ok(!isApprovedVideoMime('video/quicktime'));
    assert.ok(!isApprovedVideoMime('image/jpeg'));
    assert.ok(!isApprovedVideoMime('application/octet-stream'));
  });

  it('image size limit is 10 MB', () => {
    assert.strictEqual(MAX_IMAGE_SIZE_BYTES, 10 * 1024 * 1024);
  });

  it('video size limit is 200 MB', () => {
    assert.strictEqual(MAX_VIDEO_SIZE_BYTES, 200 * 1024 * 1024);
  });

  it('APPROVED_IMAGE_MIMES contains exactly 4 types', () => {
    assert.strictEqual(APPROVED_IMAGE_MIMES.length, 4);
  });

  it('APPROVED_VIDEO_MIMES contains exactly 2 types', () => {
    assert.strictEqual(APPROVED_VIDEO_MIMES.length, 2);
  });

  it('MEDIA_KIND has all expected values', () => {
    assert.strictEqual(MEDIA_KIND.IMAGE, 'IMAGE');
    assert.strictEqual(MEDIA_KIND.VIDEO, 'VIDEO');
    assert.strictEqual(MEDIA_KIND.DOCUMENT, 'DOCUMENT');
    assert.strictEqual(MEDIA_KIND.FIRMWARE, 'FIRMWARE');
    assert.strictEqual(MEDIA_KIND.MODEL_3D, 'MODEL_3D');
    assert.strictEqual(MEDIA_KIND.OTHER, 'OTHER');
  });

  it('does not accept empty string as valid MIME', () => {
    assert.ok(!isApprovedImageMime(''));
    assert.ok(!isApprovedVideoMime(''));
  });
});

describe('Media API route contract', () => {
  it('route file imports only mutation functions', () => {
    const content = readFileSync(
      resolve(process.cwd(), 'app/api/admin/products/media/route.ts'),
      'utf8',
    );
    assert.ok(content.includes('setProductHeroImage'));
    assert.ok(content.includes('clearProductHeroImage'));
    assert.ok(content.includes('setProductHeroVideo'));
    assert.ok(content.includes('clearProductHeroVideo'));
    assert.ok(content.includes('addProductGalleryImage'));
    assert.ok(content.includes('removeProductGalleryImage'));
    assert.ok(content.includes('reorderProductGallery'));
    assert.ok(!content.includes('userId'));
    assert.ok(!content.includes('permissions'));
    assert.ok(!content.includes('roles'));
    assert.ok(!content.includes('actor'));
    assert.ok(content.includes("'Internal server error.'"));
  });

  it('search route does not accept mutation payloads', () => {
    const content = readFileSync(
      resolve(process.cwd(), 'app/api/admin/media/search/route.ts'),
      'utf8',
    );
    assert.ok(content.includes('searchMediaLibrary'));
    assert.ok(!content.includes('POST'));
    assert.ok(!content.includes('userId'));
    assert.ok(!content.includes('permissions'));
  });

  it('upload initiate route is a thin dispatcher', () => {
    const content = readFileSync(
      resolve(process.cwd(), 'app/api/admin/media/upload/initiate/route.ts'),
      'utf8',
    );
    assert.ok(content.includes('initiateUpload'));
    assert.ok(!content.includes('userId'));
    assert.ok(!content.includes('permissions'));
    assert.ok(!content.includes('roles'));
    assert.ok(!content.includes('actor'));
    assert.ok(content.includes('Internal server error.'));
  });

  it('upload complete route is a thin dispatcher', () => {
    const content = readFileSync(
      resolve(process.cwd(), 'app/api/admin/media/upload/complete/route.ts'),
      'utf8',
    );
    assert.ok(content.includes('completeUpload'));
    assert.ok(!content.includes('userId'));
    assert.ok(!content.includes('permissions'));
    assert.ok(!content.includes('roles'));
    assert.ok(!content.includes('actor'));
    assert.ok(content.includes('Internal server error.'));
  });
});
