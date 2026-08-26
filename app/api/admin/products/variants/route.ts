import { NextResponse } from 'next/server';
import { createProductVariant } from '@/server/admin/products/create-product-variant';
import { updateProductVariant } from '@/server/admin/products/update-product-variant';
import { archiveProductVariant } from '@/server/admin/products/archive-product-variant';
import type { VariantMutationResult } from '@/server/admin/products/product-variant-mutation-helpers';

/**
 * POST /api/admin/products/variants
 *
 * Product variant mutation endpoint — Step 2.4.5.
 * Dispatches to the correct mutation based on the `action` field.
 * Authorization is enforced inside each mutation service.
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

    let result: VariantMutationResult;
    switch (action) {
      case 'createVariant':
        result = await createProductVariant(body.payload);
        break;
      case 'updateVariant':
        result = await updateProductVariant(body.payload);
        break;
      case 'archiveVariant':
        result = await archiveProductVariant(body.payload);
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
