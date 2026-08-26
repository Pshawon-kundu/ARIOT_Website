'use client';

import { ProductEditorHeader } from './product-editor-header';
import type { AdminProductDetailsDto } from '@/server/admin/products/get-product';
import { ProductDetailsEditor } from './product-details-editor';

/**
 * Product editor shell — Step 2.4.3.
 *
 * Provides the page header, tab strip, and metadata panel.
 * Delegates field editing to ProductDetailsEditor.
 */

interface ProductEditorShellProps {
  product: AdminProductDetailsDto;
  categories: Array<{ id: string; name: string }>;
}

export function ProductEditorShell({ product, categories }: ProductEditorShellProps) {
  return (
    <div className="space-y-6">
      <ProductEditorHeader
        productId={product.id}
        productName={product.name}
        sku={product.sku}
        status={product.status}
        canEdit={product.canEdit}
      />

      {/* Details tab content */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <ProductDetailsEditor product={product} categories={categories} />

        {/* Metadata panel */}
        <aside className="border-steel-800 bg-bg-elevated space-y-4 rounded-lg border p-4">
          <h2 className="text-steel-500 text-xs font-semibold tracking-wider uppercase">
            Metadata
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-steel-500">Product ID</dt>
              <dd className="text-steel-300 mt-0.5 font-mono text-xs break-all">{product.id}</dd>
            </div>
            <div>
              <dt className="text-steel-500">Created</dt>
              <dd className="text-steel-300 mt-0.5">
                {new Date(product.createdAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </dd>
            </div>
            <div>
              <dt className="text-steel-500">Last updated</dt>
              <dd className="text-steel-300 mt-0.5">
                {new Date(product.updatedAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </dd>
            </div>
            {product.publishedAt && (
              <div>
                <dt className="text-steel-500">Published</dt>
                <dd className="text-steel-300 mt-0.5">
                  {new Date(product.publishedAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-steel-500">Stock</dt>
              <dd className="text-steel-300 mt-0.5">
                {product.stock} ({product.stockPolicy.replace(/_/g, ' ').toLowerCase()})
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
