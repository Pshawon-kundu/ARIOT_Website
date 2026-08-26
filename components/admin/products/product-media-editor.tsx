'use client';

import { useCallback, useState } from 'react';
import { AlertCircle, Box } from 'lucide-react';
import type {
  AdminProductMediaDto,
  AdminMediaAssetDto,
} from '@/server/admin/products/get-product-media';
import { MediaSelector } from './media-selector';
import { MediaUploader, type UploadAttachTarget } from './media-upload';
import { ProductHeroImage } from './product-hero-image';
import { ProductImageGallery } from './product-image-gallery';
import { ProductVideoSection } from './product-video-section';

/**
 * Product media editor — Step 2.4.4.
 *
 * Orchestrates the media sections (hero image, gallery, videos, uploader) and
 * all server mutations. Sections are split into their own files to respect the
 * 300-line file limit.
 */

interface Props {
  media: AdminProductMediaDto;
}

type SelectorTarget =
  | { type: 'heroImage' }
  | { type: 'heroVideo' }
  | { type: 'galleryImage' }
  | { type: 'galleryVideo' };

export function ProductMediaEditor({ media: initialMedia }: Props) {
  const [media, setMedia] = useState(initialMedia);
  const [token, setToken] = useState(initialMedia.updatedAt);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorTarget, setSelectorTarget] = useState<SelectorTarget | null>(null);

  const canEdit = media.canEditProductMedia;

  const mutate = useCallback(
    async (action: string, payload: Record<string, unknown>) => {
      setError(null);
      setLoading(true);
      try {
        const res = await fetch('/api/admin/products/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, payload: { ...payload, expectedUpdatedAt: token } }),
        });
        const result = await res.json();
        if (result.ok) {
          setToken(result.updatedAt);
          return result;
        }
        if (result.type === 'conflict') {
          setError('This product was updated elsewhere. Please reload.');
        } else {
          setError(result.message ?? 'An error occurred.');
        }
        return null;
      } catch {
        setError('Network error. Please try again.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  const openSelector = (target: SelectorTarget) => {
    setSelectorTarget(target);
    setSelectorOpen(true);
  };

  const attachAsset = async (
    target: SelectorTarget,
    asset: AdminMediaAssetDto,
    altText?: string,
  ) => {
    let result;
    switch (target.type) {
      case 'heroImage':
        result = await mutate('setHeroImage', { productId: media.productId, mediaId: asset.id });
        if (result) setMedia((m) => ({ ...m, heroImage: asset }));
        break;
      case 'heroVideo':
        result = await mutate('setHeroVideo', { productId: media.productId, mediaId: asset.id });
        if (result) setMedia((m) => ({ ...m, heroVideo: asset }));
        break;
      case 'galleryImage':
        result = await mutate('addGalleryImage', {
          productId: media.productId,
          mediaId: asset.id,
          altText: altText ?? asset.altText ?? asset.filename,
        });
        if (result) {
          setMedia((m) => ({
            ...m,
            galleryImages: [
              ...m.galleryImages,
              {
                id: `temp-${Date.now()}`,
                media: asset,
                order: m.galleryImages.length,
                altText: altText ?? asset.altText ?? asset.filename,
                isPrimary: m.galleryImages.length === 0,
              },
            ],
          }));
        }
        break;
      case 'galleryVideo':
        result = await mutate('addGalleryVideo', {
          productId: media.productId,
          mediaId: asset.id,
          caption: asset.caption ?? null,
        });
        if (result) {
          setMedia((m) => ({
            ...m,
            galleryVideos: [
              ...m.galleryVideos,
              {
                id: `temp-${Date.now()}`,
                media: asset,
                poster: null,
                order: m.galleryVideos.length,
                caption: asset.caption ?? null,
              },
            ],
          }));
        }
        break;
    }
  };

  const handleSelect = (asset: AdminMediaAssetDto, altText?: string) => {
    setSelectorOpen(false);
    if (selectorTarget) {
      void attachAsset(selectorTarget, asset, altText);
      setSelectorTarget(null);
    }
  };

  const handleUploadAttach = (target: UploadAttachTarget, asset: AdminMediaAssetDto) => {
    void attachAsset({ type: target }, asset);
  };

  const moveImage = async (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= media.galleryImages.length) return;
    const reordered = [...media.galleryImages];
    const [item] = reordered.splice(index, 1);
    reordered.splice(next, 0, item);
    const normalized = reordered.map((g, i) => ({ ...g, order: i, isPrimary: i === 0 }));
    const previous = media.galleryImages;
    setMedia((m) => ({ ...m, galleryImages: normalized }));
    const result = await mutate('reorderGallery', {
      productId: media.productId,
      orderedIds: normalized.map((g) => g.id),
    });
    if (!result) setMedia((m) => ({ ...m, galleryImages: previous }));
  };

  const clearHeroImage = async () => {
    const result = await mutate('clearHeroImage', { productId: media.productId });
    if (result) setMedia((m) => ({ ...m, heroImage: null }));
  };

  const clearHeroVideo = async () => {
    const result = await mutate('clearHeroVideo', { productId: media.productId });
    if (result) setMedia((m) => ({ ...m, heroVideo: null }));
  };

  const removeGalleryImage = async (productImageId: string) => {
    const result = await mutate('removeGalleryImage', {
      productId: media.productId,
      productImageId,
    });
    if (result) {
      setMedia((m) => ({
        ...m,
        galleryImages: m.galleryImages.filter((g) => g.id !== productImageId),
      }));
    }
  };

  const removeGalleryVideo = async (productVideoId: string) => {
    const result = await mutate('removeGalleryVideo', {
      productId: media.productId,
      productVideoId,
    });
    if (result) {
      setMedia((m) => ({
        ...m,
        galleryVideos: m.galleryVideos.filter((v) => v.id !== productVideoId),
      }));
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <ProductHeroImage
        heroImage={media.heroImage}
        canEdit={canEdit}
        busy={loading}
        onSelect={() => openSelector({ type: 'heroImage' })}
        onClear={clearHeroImage}
      />

      <ProductImageGallery
        gallery={media.galleryImages}
        canEdit={canEdit}
        busy={loading}
        onAdd={() => openSelector({ type: 'galleryImage' })}
        onRemove={removeGalleryImage}
        onMove={moveImage}
      />

      <ProductVideoSection
        heroVideo={media.heroVideo}
        galleryVideos={media.galleryVideos}
        canEdit={canEdit}
        busy={loading}
        onAddVideo={() => openSelector({ type: 'galleryVideo' })}
        onSelectHeroVideo={() => openSelector({ type: 'heroVideo' })}
        onClearHeroVideo={clearHeroVideo}
        onRemoveVideo={removeGalleryVideo}
      />

      <MediaUploader
        canUpload={media.canUploadMedia}
        busy={loading}
        onAttach={handleUploadAttach}
      />

      {/* 3D Model — Planned */}
      <section className="border-steel-800 bg-bg-elevated rounded-lg border p-5 opacity-60">
        <div className="flex items-center gap-2">
          <Box className="text-steel-500 h-4 w-4" />
          <h2 className="text-steel-400 text-sm font-semibold">3D Models</h2>
          <span className="bg-steel-800 text-steel-500 rounded px-2 py-0.5 text-[9px] font-medium">
            Planned
          </span>
        </div>
        <p className="text-steel-600 mt-2 text-xs">
          3D model support is planned for a future release.
        </p>
      </section>

      {/* Media Selector Dialog */}
      {selectorOpen && selectorTarget && (
        <MediaSelector
          kind={
            selectorTarget.type === 'heroVideo' || selectorTarget.type === 'galleryVideo'
              ? 'VIDEO'
              : 'IMAGE'
          }
          requireAltText={selectorTarget.type === 'galleryImage'}
          onSelect={handleSelect}
          onClose={() => {
            setSelectorOpen(false);
            setSelectorTarget(null);
          }}
        />
      )}
    </div>
  );
}
