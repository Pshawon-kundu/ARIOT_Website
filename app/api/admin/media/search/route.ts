import { NextResponse } from 'next/server';
import { searchMediaLibrary } from '@/server/admin/products/get-product-media';

/**
 * GET /api/admin/media/search
 *
 * Media library search endpoint — Step 2.4.4.
 * Returns paginated MediaAsset records for the media selector.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const kind = url.searchParams.get('kind') as 'IMAGE' | 'VIDEO' | null;
    const search = url.searchParams.get('q') ?? undefined;
    const cursor = url.searchParams.get('cursor') ?? undefined;
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit')!, 10)
      : undefined;

    if (kind && kind !== 'IMAGE' && kind !== 'VIDEO') {
      return NextResponse.json(
        { ok: false, type: 'validation', message: 'Invalid kind filter.' },
        { status: 400 },
      );
    }

    const result = await searchMediaLibrary({ kind: kind ?? undefined, search, cursor, limit });
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json(
      { ok: false, type: 'error', message: 'Internal server error.' },
      { status: 500 },
    );
  }
}
