'use client';

import { useRef } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileUp,
  ImageIcon,
  Loader2,
  Upload,
  VideoIcon,
} from 'lucide-react';
import type { AdminMediaAssetDto } from '@/server/admin/products/get-product-media';
import { useMediaUpload } from '@/features/admin/media/use-media-upload';

/**
 * Media upload section (D-068).
 *
 * Presents the upload flow and, once a file is verified and stored, offers to
 * attach it to a product media slot. The transport (local multipart POST or R2
 * presigned PUT) is chosen by `use-media-upload` from the server-resolved
 * provider mode; this component only renders.
 */

export type UploadAttachTarget = 'heroImage' | 'galleryImage' | 'heroVideo' | 'galleryVideo';

interface Props {
  canUpload: boolean;
  /** True while a parent media mutation is in flight (disables attach buttons). */
  busy: boolean;
  onAttach: (target: UploadAttachTarget, asset: AdminMediaAssetDto) => void;
}

export function MediaUploader({ canUpload, busy, onAttach }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { phase, progress, error, asset, fileName, uploadFile, reset } = useMediaUpload();

  const isImage = asset?.mediaType === 'IMAGE';

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    uploadFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <section className="border-steel-800 bg-bg-elevated rounded-lg border p-5">
      <div className="mb-4 flex items-center gap-2">
        <Upload className="text-steel-400 h-4 w-4" />
        <h2 className="text-steel-200 text-sm font-semibold">Upload New Media</h2>
      </div>

      {canUpload ? (
        <div className="border-steel-700 bg-steel-900/50 rounded-lg border border-dashed p-5">
          {phase === 'done' && asset ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {isImage ? (
                  <ImageIcon className="h-8 w-8 shrink-0 text-cyan-400" />
                ) : (
                  <VideoIcon className="h-8 w-8 shrink-0 text-cyan-400" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <p className="text-steel-300 truncate text-sm">{fileName}</p>
                  </div>
                  <p className="text-steel-500 text-xs">Upload verified and stored.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {isImage ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onAttach('galleryImage', asset)}
                      disabled={busy}
                      className="rounded bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
                    >
                      Add to Image Gallery
                    </button>
                    <button
                      type="button"
                      onClick={() => onAttach('heroImage', asset)}
                      disabled={busy}
                      className="bg-steel-700 text-steel-200 hover:bg-steel-600 rounded px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                    >
                      Set as Hero Image
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onAttach('galleryVideo', asset)}
                      disabled={busy}
                      className="rounded bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
                    >
                      Add Video
                    </button>
                    <button
                      type="button"
                      onClick={() => onAttach('heroVideo', asset)}
                      disabled={busy}
                      className="bg-steel-700 text-steel-200 hover:bg-steel-600 rounded px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                    >
                      Set as Hero Video
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={reset}
                  className="bg-steel-800 text-steel-400 hover:bg-steel-700 rounded px-3 py-1.5 text-xs font-medium"
                >
                  Upload Another
                </button>
              </div>
            </div>
          ) : phase === 'idle' ? (
            <div className="flex flex-col items-center justify-center py-4">
              <FileUp className="text-steel-600 mb-2 h-8 w-8" />
              <p className="text-steel-500 text-sm">JPEG, PNG, WebP, AVIF · MP4, WebM</p>
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded bg-cyan-600 px-4 py-2 text-xs font-medium text-white hover:bg-cyan-500">
                <Upload className="h-3.5 w-3.5" />
                Choose File
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
                  className="sr-only"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </label>
              <p className="text-steel-600 mt-2 text-[10px]">
                Images up to 10 MB · Videos up to 200 MB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              {phase === 'error' ? (
                <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
              ) : (
                <Loader2 className="mb-2 h-8 w-8 animate-spin text-cyan-400" />
              )}
              {phase === 'uploading' && (
                <div className="mb-3 w-full max-w-xs">
                  <div className="text-steel-500 mb-1 flex justify-between text-[10px]">
                    <span>Uploading…</span>
                    <span>{progress}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Upload progress"
                    className="bg-steel-800 h-1.5 w-full overflow-hidden rounded-full"
                  >
                    <div
                      className="h-full rounded-full bg-cyan-500 transition-[width] duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
              <p className="text-steel-400 text-sm">
                {phase === 'initiating' && 'Preparing upload…'}
                {phase === 'uploading' && `Uploading ${fileName}…`}
                {phase === 'completing' && 'Verifying upload…'}
                {phase === 'error' && error}
              </p>
              {phase === 'error' && (
                <button
                  type="button"
                  onClick={reset}
                  className="bg-steel-700 text-steel-200 hover:bg-steel-600 mt-3 rounded px-4 py-2 text-xs font-medium"
                >
                  Try Again
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="border-steel-700 bg-steel-900/50 flex flex-col items-center justify-center rounded-lg border border-dashed py-8">
          <Upload className="text-steel-600 mb-2 h-8 w-8" />
          <p className="text-steel-500 text-sm">You do not have permission to upload media.</p>
        </div>
      )}
    </section>
  );
}
