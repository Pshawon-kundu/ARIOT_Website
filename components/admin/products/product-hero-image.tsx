'use client';

import { ImageIcon } from 'lucide-react';
import type { AdminMediaAssetDto } from '@/server/admin/products/get-product-media';

/**
 * Product hero image slot — Step 2.4.4.
 *
 * Displays the assigned hero image with Replace/Remove actions. Extracted
 * from the media editor to respect the 300-line file limit.
 */

interface Props {
  heroImage: AdminMediaAssetDto | null;
  canEdit: boolean;
  busy: boolean;
  onSelect: () => void;
  onClear: () => void;
}

export function ProductHeroImage({ heroImage, canEdit, busy, onSelect, onClear }: Props) {
  return (
    <section className="border-steel-800 bg-bg-elevated rounded-lg border p-5">
      <div className="mb-4 flex items-center gap-2">
        <ImageIcon className="text-steel-400 h-4 w-4" />
        <h2 className="text-steel-200 text-sm font-semibold">Hero Image</h2>
      </div>
      {heroImage ? (
        <div className="flex items-start gap-4">
          <div className="border-steel-700 bg-steel-900 relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage.url}
              alt={heroImage.altText ?? 'Product hero image'}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-steel-300 truncate text-sm">{heroImage.filename}</p>
            {heroImage.width && heroImage.height && (
              <p className="text-steel-500 text-xs">
                {heroImage.width} x {heroImage.height}
              </p>
            )}
            {heroImage.altText && (
              <p className="text-steel-500 text-xs italic">{heroImage.altText}</p>
            )}
            {canEdit && (
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onSelect}
                  disabled={busy}
                  className="bg-steel-700 text-steel-200 hover:bg-steel-600 rounded px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  disabled={busy}
                  className="bg-steel-800 rounded px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-950/50 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="border-steel-700 bg-steel-900/50 flex flex-col items-center justify-center rounded-lg border border-dashed py-8">
          <ImageIcon className="text-steel-600 mb-2 h-8 w-8" />
          <p className="text-steel-500 text-sm">No hero image assigned</p>
          {canEdit && (
            <button
              type="button"
              onClick={onSelect}
              disabled={busy}
              className="mt-3 rounded bg-cyan-600 px-4 py-2 text-xs font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
            >
              Select Image
            </button>
          )}
        </div>
      )}
    </section>
  );
}
