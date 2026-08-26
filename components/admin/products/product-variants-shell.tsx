'use client';

import { ProductEditorHeader } from './product-editor-header';
import { ProductVariantsEditor } from './product-variants-editor';
import type { AdminProductVariantsDto } from '@/server/admin/products/get-product-variants';

/**
 * Product variants shell — Step 2.4.5.
 *
 * Wraps the shared tab header and delegates to the variants editor.
 */

interface ProductVariantsShellProps {
  variants: AdminProductVariantsDto;
}

export function ProductVariantsShell({ variants }: ProductVariantsShellProps) {
  return (
    <div className="space-y-6">
      <ProductEditorHeader
        productId={variants.productId}
        productName={variants.productName}
        sku={variants.productSku}
        status={variants.productStatus}
        canEdit={variants.canEditVariants}
      />

      <ProductVariantsEditor variants={variants} />
    </div>
  );
}
