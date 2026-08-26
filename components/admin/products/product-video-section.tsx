'use client';

import { VideoIcon } from 'lucide-react';
import type {
  AdminMediaAssetDto,
  AdminProductVideoDto,
} from '@/server/admin/products/get-product-media';

/**
 * Product video section — Step 2.4.4.
 *
 * Hero video slot + gallery videos. Assignments are managed via server
 * mutations; the empty/loading/error states are first-class.
 */

interface Props {
  heroVideo: AdminMediaAssetDto | null;
  galleryVideos: AdminProductVideoDto[];
  canEdit: boolean;
  busy: boolean;
  onAddVideo: () => void;
  onSelectHeroVideo: () => void;
  onClearHeroVideo: () => void;
  onRemoveVideo: (id: string) => void;
}

export function ProductVideoSection({
  heroVideo,
  galleryVideos,
  canEdit,
  busy,
  onAddVideo,
  onSelectHeroVideo,
  onClearHeroVideo,
  onRemoveVideo,
}: Props) {
  return (
    <section className="border-steel-800 bg-bg-elevated rounded-lg border p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <VideoIcon className="text-steel-400 h-4 w-4" />
          <h2 className="text-steel-200 text-sm font-semibold">Videos</h2>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={onAddVideo}
            disabled={busy}
            className="bg-steel-700 text-steel-200 hover:bg-steel-600 rounded px-3 py-1.5 text-xs font-medium disabled:opacity-50"
          >
            Add Video
          </button>
        )}
      </div>
      {heroVideo ? (
        <div className="border-steel-700 bg-steel-900/50 mb-4 flex items-start gap-4 rounded border p-3">
          <VideoIcon className="text-steel-500 mt-0.5 h-8 w-8 shrink-0" />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-steel-400 text-xs font-medium">Hero Video</p>
            <p className="text-steel-300 truncate text-sm">{heroVideo.filename}</p>
            <p className="text-steel-500 text-xs">{heroVideo.mimeType}</p>
            {canEdit && (
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onSelectHeroVideo}
                  disabled={busy}
                  className="bg-steel-700 text-steel-200 hover:bg-steel-600 rounded px-2 py-1 text-[10px] font-medium disabled:opacity-50"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={onClearHeroVideo}
                  disabled={busy}
                  className="bg-steel-800 rounded px-2 py-1 text-[10px] font-medium text-red-400 hover:bg-red-950/50 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        canEdit && (
          <div className="border-steel-700 bg-steel-900/30 mb-4 flex items-center gap-3 rounded border border-dashed p-3">
            <VideoIcon className="text-steel-600 h-5 w-5" />
            <p className="text-steel-500 text-xs">No hero video assigned</p>
            <button
              type="button"
              onClick={onSelectHeroVideo}
              disabled={busy}
              className="bg-steel-700 text-steel-200 hover:bg-steel-600 ml-auto rounded px-3 py-1.5 text-xs font-medium disabled:opacity-50"
            >
              Select Video
            </button>
          </div>
        )
      )}
      {galleryVideos.length > 0 ? (
        <div className="space-y-2">
          {galleryVideos.map((vid) => (
            <div
              key={vid.id}
              className="border-steel-700 bg-steel-900/50 flex items-center gap-3 rounded border p-3"
            >
              <VideoIcon className="text-steel-500 h-5 w-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-steel-300 truncate text-sm">{vid.media.filename}</p>
                {vid.caption && <p className="text-steel-500 text-xs">{vid.caption}</p>}
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onRemoveVideo(vid.id)}
                  disabled={busy}
                  className="bg-steel-800 rounded px-2 py-1 text-[10px] font-medium text-red-400 hover:bg-red-950/50 disabled:opacity-50"
                  aria-label={`Remove video ${vid.media.filename}`}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        !heroVideo && (
          <div className="border-steel-700 bg-steel-900/50 flex flex-col items-center justify-center rounded-lg border border-dashed py-6">
            <VideoIcon className="text-steel-600 mb-2 h-6 w-6" />
            <p className="text-steel-500 text-sm">No videos</p>
          </div>
        )
      )}
    </section>
  );
}
