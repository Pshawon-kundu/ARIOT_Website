'use client';

import { ProductEditorHeader } from './product-editor-header';
import { ProductMediaEditor } from './product-media-editor';
import type { AdminProductMediaDto } from '@/server/admin/products/get-product-media';

/**
 * Product media shell — Step 2.4.4.
 *
 * Wraps the shared tab header and delegates to the media editor.
 */

interface ProductMediaShellProps {
  media: AdminProductMediaDto;
}

export function ProductMediaShell({ media }: ProductMediaShellProps) {
  return (
    <div className="space-y-6">
      <ProductEditorHeader
        productId={media.productId}
        productName={media.productName}
        sku={media.productSku}
        status={media.productStatus}
        canEdit={media.canEditProductMedia}
      />

      <ProductMediaEditor media={media} />
    </div>
  );
}
