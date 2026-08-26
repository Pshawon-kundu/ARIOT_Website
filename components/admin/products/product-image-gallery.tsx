'use client';

import { ArrowDown, ArrowUp, Layers } from 'lucide-react';
import type { AdminProductImageDto } from '@/server/admin/products/get-product-media';

/**
 * Product image gallery section — Step 2.4.4.
 *
 * Accessible reordering via Move Up / Move Down buttons (keyboard operable,
 * labeled per item) rather than drag-and-drop. Order changes are optimistic
 * in the parent and reverted on mutation failure.
 */

interface Props {
  gallery: AdminProductImageDto[];
  canEdit: boolean;
  busy: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onMove: (index: number, dir: -1 | 1) => void;
}

export function ProductImageGallery({ gallery, canEdit, busy, onAdd, onRemove, onMove }: Props) {
  return (
    <section className="border-steel-800 bg-bg-elevated rounded-lg border p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="text-steel-400 h-4 w-4" />
          <h2 className="text-steel-200 text-sm font-semibold">Image Gallery</h2>
          <span className="text-steel-500 text-xs">({gallery.length})</span>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={onAdd}
            disabled={busy}
            className="bg-steel-700 text-steel-200 hover:bg-steel-600 rounded px-3 py-1.5 text-xs font-medium disabled:opacity-50"
          >
            Add Image
          </button>
        )}
      </div>
      {gallery.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {gallery.map((img, index) => (
            <div
              key={img.id}
              className="group border-steel-700 bg-steel-900 relative overflow-hidden rounded-lg border"
            >
              <div className="aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.media.url} alt={img.altText} className="h-full w-full object-cover" />
              </div>
              <div className="px-2 py-1.5">
                <p className="text-steel-400 truncate text-[10px]">{img.altText}</p>
                {img.isPrimary && (
                  <span className="text-[9px] font-medium text-cyan-400">Primary</span>
                )}
              </div>
              {canEdit && (
                <div className="absolute top-1 right-1 flex gap-1">
                  <button
                    type="button"
                    onClick={() => onMove(index, -1)}
                    disabled={busy || index === 0}
                    className="bg-steel-900/80 text-steel-300 hover:bg-steel-800 rounded p-1 text-[10px] opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-30"
                    aria-label={`Move ${img.altText} earlier in the gallery`}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(index, 1)}
                    disabled={busy || index === gallery.length - 1}
                    className="bg-steel-900/80 text-steel-300 hover:bg-steel-800 rounded p-1 text-[10px] opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-30"
                    aria-label={`Move ${img.altText} later in the gallery`}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(img.id)}
                    disabled={busy}
                    className="bg-steel-900/80 hover:bg-steel-900 rounded p-1 text-[10px] text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                    aria-label={`Remove ${img.altText}`}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="border-steel-700 bg-steel-900/50 flex flex-col items-center justify-center rounded-lg border border-dashed py-6">
          <Layers className="text-steel-600 mb-2 h-6 w-6" />
          <p className="text-steel-500 text-sm">No gallery images</p>
        </div>
      )}
    </section>
  );
}
