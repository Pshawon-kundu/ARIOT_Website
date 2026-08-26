/**
 * Product media loader — Step 2.4.4.
 *
 * Server-only loader for the Media tab. Returns product media relationships
 * and available MediaAsset records for selection.
 */

import { prisma } from '@/server/db';
import { requirePermission } from '@/server/auth/permissions';
import { PERMISSIONS } from '@/server/auth/permission-catalog';
import { hasPermission } from '@/server/auth/permission-catalog';
import { getMediaStorageProvider } from '@/server/storage/get-media-storage-provider';

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface AdminMediaAssetDto {
  id: string;
  filename: string;
  mimeType: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER';
  url: string;
  altText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  sizeBytes: string | null;
  createdAt: string;
}

export interface AdminProductImageDto {
  id: string;
  media: AdminMediaAssetDto;
  order: number;
  altText: string;
  isPrimary: boolean;
}

export interface AdminProductVideoDto {
  id: string;
  media: AdminMediaAssetDto;
  poster: AdminMediaAssetDto | null;
  order: number;
  caption: string | null;
}

export interface AdminProductMediaDto {
  productId: string;
  productName: string;
  productSku: string;
  productStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  updatedAt: string;
  heroImage: AdminMediaAssetDto | null;
  heroVideo: AdminMediaAssetDto | null;
  galleryImages: AdminProductImageDto[];
  galleryVideos: AdminProductVideoDto[];
  canEditProductMedia: boolean;
  canUploadMedia: boolean;
}

// ── Mapper ───────────────────────────────────────────────────────────────────

/** Provider-resolved public URL authority (D-068). */
const mediaStorageProvider = getMediaStorageProvider();

function mapMediaKind(kind: string): 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER' {
  if (kind === 'IMAGE') return 'IMAGE';
  if (kind === 'VIDEO') return 'VIDEO';
  if (kind === 'DOCUMENT') return 'DOCUMENT';
  return 'OTHER';
}

function toMediaDto(asset: {
  id: string;
  kind: string;
  mime: string;
  sizeBytes: bigint;
  storageKey: string;
  cdnUrl: string | null;
  altText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  createdAt: Date;
}): AdminMediaAssetDto {
  return {
    id: asset.id,
    filename: asset.storageKey.split('/').pop() ?? asset.storageKey,
    mimeType: asset.mime,
    mediaType: mapMediaKind(asset.kind),
    url: mediaStorageProvider.getPublicUrl(asset.storageKey, asset.cdnUrl),
    altText: asset.altText,
    caption: asset.caption,
    width: asset.width,
    height: asset.height,
    durationSeconds: asset.durationSeconds,
    sizeBytes: asset.sizeBytes.toString(),
    createdAt: asset.createdAt.toISOString(),
  };
}

// ── Media asset select fields ────────────────────────────────────────────────

const MEDIA_ASSET_SELECT = {
  id: true,
  kind: true,
  mime: true,
  sizeBytes: true,
  storageKey: true,
  cdnUrl: true,
  altText: true,
  caption: true,
  width: true,
  height: true,
  durationSeconds: true,
  createdAt: true,
} as const;

// ── Main loader ──────────────────────────────────────────────────────────────

export async function getProductMedia(productId: string): Promise<AdminProductMediaDto | null> {
  const ctx = await requirePermission(PERMISSIONS.products.read);

  const canEdit =
    hasPermission(ctx.permissions, PERMISSIONS.products.write) &&
    hasPermission(ctx.permissions, PERMISSIONS.media.read);
  const canUpload = hasPermission(ctx.permissions, PERMISSIONS.media.write);

  const product = await prisma.product.findUnique({
    where: { id: productId, deletedAt: null },
    select: {
      id: true,
      name: true,
      sku: true,
      status: true,
      updatedAt: true,
      heroImage: { select: MEDIA_ASSET_SELECT },
      heroVideo: { select: MEDIA_ASSET_SELECT },
      images: {
        where: { media: { deletedAt: null } },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          order: true,
          altText: true,
          isPrimary: true,
          media: { select: MEDIA_ASSET_SELECT },
        },
      },
      videos: {
        where: { media: { deletedAt: null } },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          order: true,
          caption: true,
          media: { select: MEDIA_ASSET_SELECT },
          posterMedia: { select: MEDIA_ASSET_SELECT },
        },
      },
    },
  });

  if (!product) return null;

  return {
    productId: product.id,
    productName: product.name,
    productSku: product.sku,
    productStatus: product.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    updatedAt: product.updatedAt.toISOString(),
    heroImage: product.heroImage ? toMediaDto(product.heroImage) : null,
    heroVideo: product.heroVideo ? toMediaDto(product.heroVideo) : null,
    galleryImages: product.images.map((img) => ({
      id: img.id,
      media: toMediaDto(img.media),
      order: img.order,
      altText: img.altText,
      isPrimary: img.isPrimary,
    })),
    galleryVideos: product.videos.map((vid) => ({
      id: vid.id,
      media: toMediaDto(vid.media),
      poster: vid.posterMedia ? toMediaDto(vid.posterMedia) : null,
      order: vid.order,
      caption: vid.caption,
    })),
    canEditProductMedia: canEdit,
    canUploadMedia: canUpload,
  };
}

// ── Media library search ─────────────────────────────────────────────────────

export interface MediaLibraryQuery {
  kind?: 'IMAGE' | 'VIDEO';
  search?: string;
  cursor?: string;
  limit?: number;
}

export interface MediaLibraryResult {
  items: AdminMediaAssetDto[];
  nextCursor: string | null;
}

export async function searchMediaLibrary(query: MediaLibraryQuery): Promise<MediaLibraryResult> {
  await requirePermission(PERMISSIONS.media.read);

  const limit = Math.min(query.limit ?? 20, 50);
  const where: Record<string, unknown> = { deletedAt: null };

  if (query.kind) {
    where.kind = query.kind;
  }

  if (query.search && query.search.trim().length > 0) {
    const term = query.search.trim();
    where.OR = [
      { altText: { contains: term, mode: 'insensitive' } },
      { storageKey: { contains: term, mode: 'insensitive' } },
      { caption: { contains: term, mode: 'insensitive' } },
    ];
  }

  const items = await prisma.mediaAsset.findMany({
    where,
    select: MEDIA_ASSET_SELECT,
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    take: limit + 1,
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
  });

  const hasMore = items.length > limit;
  const resultItems = hasMore ? items.slice(0, limit) : items;

  return {
    items: resultItems.map(toMediaDto),
    nextCursor: hasMore ? resultItems[resultItems.length - 1].id : null,
  };
}
