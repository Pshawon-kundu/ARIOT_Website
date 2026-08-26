'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, ImageIcon, VideoIcon, Loader2 } from 'lucide-react';
import type { AdminMediaAssetDto } from '@/server/admin/products/get-product-media';

/**
 * Media selector dialog — Step 2.4.4.
 *
 * Server-backed media library search with type filtering,
 * pagination, and keyboard navigation.
 */

interface MediaSelectorProps {
  kind: 'IMAGE' | 'VIDEO';
  requireAltText?: boolean;
  onSelect: (asset: AdminMediaAssetDto, altText?: string) => void;
  onClose: () => void;
}

export function MediaSelector({ kind, requireAltText, onSelect, onClose }: MediaSelectorProps) {
  const [items, setItems] = useState<AdminMediaAssetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [selected, setSelected] = useState<AdminMediaAssetDto | null>(null);
  const [altText, setAltText] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  const fetchMedia = useCallback(
    async (q: string, c?: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ kind });
        if (q.trim()) params.set('q', q.trim());
        if (c) params.set('cursor', c);
        params.set('limit', '20');

        const res = await fetch(`/api/admin/media/search?${params}`);
        const data = await res.json();
        if (data.ok) {
          if (c) {
            setItems((prev) => [...prev, ...data.items]);
          } else {
            setItems(data.items);
          }
          setCursor(data.nextCursor);
          setHasMore(!!data.nextCursor);
        }
      } catch {
        // Silent fail — items remain as-is
      } finally {
        setLoading(false);
      }
    },
    [kind],
  );

  useEffect(() => {
    let cancelled = false;
    const doFetch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ kind });
        if (search.trim()) params.set('q', search.trim());
        params.set('limit', '20');
        const res = await fetch(`/api/admin/media/search?${params}`);
        const data = await res.json();
        if (!cancelled && data.ok) {
          setItems(data.items);
          setCursor(data.nextCursor);
          setHasMore(!!data.nextCursor);
        }
      } catch {
        // Silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    doFetch();
    return () => {
      cancelled = true;
    };
  }, [kind, search]);

  // Trap focus
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleConfirm = () => {
    if (!selected) return;
    if (requireAltText && !altText.trim()) return;
    onSelect(selected, requireAltText ? altText.trim() : undefined);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Select ${kind === 'IMAGE' ? 'image' : 'video'}`}
    >
      <div
        ref={dialogRef}
        className="border-steel-700 bg-bg-base flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl border shadow-2xl"
      >
        {/* Header */}
        <div className="border-steel-800 flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-steel-200 text-sm font-semibold">
            Select {kind === 'IMAGE' ? 'Image' : 'Video'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-steel-400 hover:text-steel-200 rounded p-1 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="border-steel-800 border-b px-5 py-3">
          <div className="relative">
            <Search className="text-steel-500 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelected(null);
              }}
              placeholder="Search by filename or alt text..."
              className="border-steel-700 bg-steel-900 text-steel-200 placeholder:text-steel-600 w-full rounded-lg border py-2 pr-4 pl-10 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {loading && items.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="text-steel-500 h-6 w-6 animate-spin" />
              <p className="text-steel-500 mt-2 text-sm">Loading media...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              {kind === 'IMAGE' ? (
                <ImageIcon className="text-steel-600 h-8 w-8" />
              ) : (
                <VideoIcon className="text-steel-600 h-8 w-8" />
              )}
              <p className="text-steel-500 mt-2 text-sm">
                No {kind === 'IMAGE' ? 'images' : 'videos'} found
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelected(item);
                      setAltText(item.altText ?? '');
                    }}
                    className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                      selected?.id === item.id
                        ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                        : 'border-steel-700 hover:border-steel-500'
                    }`}
                  >
                    {kind === 'IMAGE' ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.url}
                        alt={item.altText ?? item.filename}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="bg-steel-900 flex h-full w-full flex-col items-center justify-center">
                        <VideoIcon className="text-steel-500 h-6 w-6" />
                        <p className="text-steel-500 mt-1 max-w-full truncate px-1 text-[9px]">
                          {item.filename}
                        </p>
                      </div>
                    )}
                    {selected?.id === item.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-cyan-900/40">
                        <div className="rounded-full bg-cyan-400 p-1">
                          <svg
                            className="h-3 w-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {hasMore && (
                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (cursor) fetchMedia(search, cursor);
                    }}
                    disabled={loading}
                    className="bg-steel-700 text-steel-200 hover:bg-steel-600 rounded px-4 py-2 text-xs font-medium disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Alt text + confirm */}
        {selected && (
          <div className="border-steel-800 border-t px-5 py-3">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <p className="text-steel-400 mb-1 truncate text-xs">
                  Selected: {selected.filename}
                </p>
                {requireAltText && (
                  <div>
                    <label htmlFor="alt-text-input" className="text-steel-400 text-xs">
                      Alt text <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="alt-text-input"
                      type="text"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      maxLength={300}
                      placeholder="Describe this image..."
                      className="border-steel-700 bg-steel-900 text-steel-200 placeholder:text-steel-600 mt-1 w-full rounded border px-3 py-1.5 text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={requireAltText && !altText.trim()}
                className="rounded bg-cyan-600 px-4 py-2 text-xs font-medium text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
