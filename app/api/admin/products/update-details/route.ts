import { NextResponse } from 'next/server';
import { updateProductDetails } from '@/server/admin/products/update-product-details';

/**
 * POST /api/admin/products/update-details
 *
 * Server-side product details mutation endpoint — Step 2.4.3.
 * Authorization is enforced inside updateProductDetails.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await updateProductDetails(body);
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
