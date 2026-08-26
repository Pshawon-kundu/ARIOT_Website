import { NextResponse } from 'next/server';
import {
  setProductHeroImage,
  clearProductHeroImage,
  setProductHeroVideo,
  clearProductHeroVideo,
  addProductGalleryImage,
  removeProductGalleryImage,
  reorderProductGallery,
  addProductGalleryVideo,
  removeProductGalleryVideo,
} from '@/server/admin/products/update-product-media';

/**
 * POST /api/admin/products/media
 *
 * Product media mutation endpoint — Step 2.4.4.
 * Dispatches to the correct mutation based on `action` field.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body?.action;

    if (typeof action !== 'string') {
      return NextResponse.json(
        { ok: false, type: 'validation', message: 'Missing action field.' },
        { status: 400 },
      );
    }

    let result;
    switch (action) {
      case 'setHeroImage':
        result = await setProductHeroImage(body.payload);
        break;
      case 'clearHeroImage':
        result = await clearProductHeroImage(body.payload);
        break;
      case 'setHeroVideo':
        result = await setProductHeroVideo(body.payload);
        break;
      case 'clearHeroVideo':
        result = await clearProductHeroVideo(body.payload);
        break;
      case 'addGalleryImage':
        result = await addProductGalleryImage(body.payload);
        break;
      case 'removeGalleryImage':
        result = await removeProductGalleryImage(body.payload);
        break;
      case 'reorderGallery':
        result = await reorderProductGallery(body.payload);
        break;
      case 'addGalleryVideo':
        result = await addProductGalleryVideo(body.payload);
        break;
      case 'removeGalleryVideo':
        result = await removeProductGalleryVideo(body.payload);
        break;
      default:
        return NextResponse.json(
          { ok: false, type: 'validation', message: 'Unknown action.' },
          { status: 400 },
        );
    }

    const status = result.ok
      ? 200
      : result.type === 'forbidden'
        ? 403
        : result.type === 'conflict'
          ? 409
          : result.type === 'not_found'
            ? 404
            : 400;
    return NextResponse.json(result, { status });
  } catch {
    return NextResponse.json(
      { ok: false, type: 'error', message: 'Internal server error.' },
      { status: 500 },
    );
  }
}
