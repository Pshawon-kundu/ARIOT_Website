/**
 * Product media mutations — Step 2.4.4.
 *
 * Narrowly scoped mutations for product media relationships.
 * Each mutation enforces authorization, validates inputs strictly,
 * uses optimistic concurrency, and writes audit logs.
 */

import { z } from 'zod';
import { Prisma } from '@/lib/generated/prisma/client';
import { prisma } from '@/server/db';
import { requirePermission } from '@/server/auth/permissions';
import { PERMISSIONS } from '@/server/auth/permission-catalog';
import { isApprovedImageMime, isApprovedVideoMime } from '../media/media-policy';

// ── Result types ─────────────────────────────────────────────────────────────

export type MediaMutationResult =
  | { ok: true; updatedAt: string }
  | { ok: false; type: 'forbidden'; message: string }
  | { ok: false; type: 'not_found'; message: string }
  | { ok: false; type: 'conflict'; message: string }
  | { ok: false; type: 'validation'; message: string }
  | { ok: false; type: 'error'; message: string };

// ── Schemas ──────────────────────────────────────────────────────────────────

const setHeroSchema = z
  .object({
    productId: z.string().min(1),
    mediaId: z.string().min(1),
    expectedUpdatedAt: z.string().min(1),
  })
  .strict();

const clearHeroSchema = z
  .object({
    productId: z.string().min(1),
    expectedUpdatedAt: z.string().min(1),
  })
  .strict();

const galleryAddSchema = z
  .object({
    productId: z.string().min(1),
    mediaId: z.string().min(1),
    altText: z.string().min(1).max(300),
    expectedUpdatedAt: z.string().min(1),
  })
  .strict();

const galleryRemoveSchema = z
  .object({
    productId: z.string().min(1),
    productImageId: z.string().min(1),
    expectedUpdatedAt: z.string().min(1),
  })
  .strict();

const galleryReorderSchema = z
  .object({
    productId: z.string().min(1),
    orderedIds: z.array(z.string().min(1)).min(1),
    expectedUpdatedAt: z.string().min(1),
  })
  .strict();

const videoAddSchema = z
  .object({
    productId: z.string().min(1),
    mediaId: z.string().min(1),
    caption: z.string().max(300).nullable().optional(),
    expectedUpdatedAt: z.string().min(1),
  })
  .strict();

const videoRemoveSchema = z
  .object({
    productId: z.string().min(1),
    productVideoId: z.string().min(1),
    expectedUpdatedAt: z.string().min(1),
  })
  .strict();

// ── Helpers ──────────────────────────────────────────────────────────────────

async function requireProductWrite() {
  const ctx = await requirePermission([PERMISSIONS.products.write, PERMISSIONS.media.read]);
  return ctx;
}

async function loadProduct(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId, deletedAt: null },
    select: { id: true, updatedAt: true, heroImageId: true, heroVideoId: true },
  });
}

function checkConcurrency(current: Date, expected: string): MediaMutationResult | null {
  if (current.toISOString() !== expected) {
    return {
      ok: false,
      type: 'conflict',
      message: 'Product was updated elsewhere. Reload and try again.',
    };
  }
  return null;
}

// ── Set Hero Image ───────────────────────────────────────────────────────────

export async function setProductHeroImage(rawInput: unknown): Promise<MediaMutationResult> {
  let ctx;
  try {
    ctx = await requireProductWrite();
  } catch {
    return { ok: false, type: 'forbidden', message: 'Insufficient permissions.' };
  }

  const parsed = setHeroSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, type: 'validation', message: 'Invalid input.' };
  }

  const { productId, mediaId, expectedUpdatedAt } = parsed.data;

  const product = await loadProduct(productId);
  if (!product) {
    return { ok: false, type: 'not_found', message: 'Product not found.' };
  }

  const conflict = checkConcurrency(product.updatedAt, expectedUpdatedAt);
  if (conflict) return conflict;

  // No-op check
  if (product.heroImageId === mediaId) {
    return { ok: true, updatedAt: product.updatedAt.toISOString() };
  }

  // Verify media exists and is an image
  const media = await prisma.mediaAsset.findUnique({
    where: { id: mediaId, deletedAt: null },
    select: { id: true, kind: true, mime: true },
  });

  if (!media) {
    return { ok: false, type: 'validation', message: 'Media asset not found.' };
  }

  if (media.kind !== 'IMAGE' || !isApprovedImageMime(media.mime)) {
    return { ok: false, type: 'validation', message: 'Media must be an approved image type.' };
  }

  const previousId = product.heroImageId;

  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.product.update({
      where: { id: productId },
      data: { heroImageId: mediaId, updatedBy: ctx.userId },
      select: { updatedAt: true },
    });

    await tx.auditLog.create({
      data: {
        actorId: ctx.userId,
        actorRole:
          (ctx.roles[0] as 'SUPER_ADMIN' | 'CONTENT_ADMIN' | 'SUPPORT_ADMIN' | 'SALES_ADMIN') ??
          null,
        action: 'PRODUCT_HERO_IMAGE_SET',
        entityType: 'Product',
        entityId: productId,
        before: { heroImageId: previousId } as object,
        after: { heroImageId: mediaId } as object,
      },
    });

    return p;
  });

  return { ok: true, updatedAt: updated.updatedAt.toISOString() };
}

// ── Clear Hero Image ─────────────────────────────────────────────────────────

export async function clearProductHeroImage(rawInput: unknown): Promise<MediaMutationResult> {
  let ctx;
  try {
    ctx = await requireProductWrite();
  } catch {
    return { ok: false, type: 'forbidden', message: 'Insufficient permissions.' };
  }

  const parsed = clearHeroSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, type: 'validation', message: 'Invalid input.' };
  }

  const { productId, expectedUpdatedAt } = parsed.data;

  const product = await loadProduct(productId);
  if (!product) {
    return { ok: false, type: 'not_found', message: 'Product not found.' };
  }

  const conflict = checkConcurrency(product.updatedAt, expectedUpdatedAt);
  if (conflict) return conflict;

  // No-op
  if (product.heroImageId === null) {
    return { ok: true, updatedAt: product.updatedAt.toISOString() };
  }

  const previousId = product.heroImageId;

  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.product.update({
      where: { id: productId },
      data: { heroImageId: null, updatedBy: ctx.userId },
      select: { updatedAt: true },
    });

    await tx.auditLog.create({
      data: {
        actorId: ctx.userId,
        actorRole:
          (ctx.roles[0] as 'SUPER_ADMIN' | 'CONTENT_ADMIN' | 'SUPPORT_ADMIN' | 'SALES_ADMIN') ??
          null,
        action: 'PRODUCT_HERO_IMAGE_CLEARED',
        entityType: 'Product',
        entityId: productId,
        before: { heroImageId: previousId } as object,
        after: { heroImageId: null } as object,
      },
    });

    return p;
  });

  return { ok: true, updatedAt: updated.updatedAt.toISOString() };
}

// ── Set Hero Video ───────────────────────────────────────────────────────────

export async function setProductHeroVideo(rawInput: unknown): Promise<MediaMutationResult> {
  let ctx;
  try {
    ctx = await requireProductWrite();
  } catch {
    return { ok: false, type: 'forbidden', message: 'Insufficient permissions.' };
  }

  const parsed = setHeroSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, type: 'validation', message: 'Invalid input.' };
  }

  const { productId, mediaId, expectedUpdatedAt } = parsed.data;

  const product = await loadProduct(productId);
  if (!product) {
    return { ok: false, type: 'not_found', message: 'Product not found.' };
  }

  const conflict = checkConcurrency(product.updatedAt, expectedUpdatedAt);
  if (conflict) return conflict;

  if (product.heroVideoId === mediaId) {
    return { ok: true, updatedAt: product.updatedAt.toISOString() };
  }

  const media = await prisma.mediaAsset.findUnique({
    where: { id: mediaId, deletedAt: null },
    select: { id: true, kind: true, mime: true },
  });

  if (!media) {
    return { ok: false, type: 'validation', message: 'Media asset not found.' };
  }

  if (media.kind !== 'VIDEO' || !isApprovedVideoMime(media.mime)) {
    return { ok: false, type: 'validation', message: 'Media must be an approved video type.' };
  }

  const previousId = product.heroVideoId;

  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.product.update({
      where: { id: productId },
      data: { heroVideoId: mediaId, updatedBy: ctx.userId },
      select: { updatedAt: true },
    });

    await tx.auditLog.create({
      data: {
        actorId: ctx.userId,
        actorRole:
          (ctx.roles[0] as 'SUPER_ADMIN' | 'CONTENT_ADMIN' | 'SUPPORT_ADMIN' | 'SALES_ADMIN') ??
          null,
        action: 'PRODUCT_HERO_VIDEO_SET',
        entityType: 'Product',
        entityId: productId,
        before: { heroVideoId: previousId } as object,
        after: { heroVideoId: mediaId } as object,
      },
    });

    return p;
  });

  return { ok: true, updatedAt: updated.updatedAt.toISOString() };
}

// ── Clear Hero Video ─────────────────────────────────────────────────────────

export async function clearProductHeroVideo(rawInput: unknown): Promise<MediaMutationResult> {
  let ctx;
  try {
    ctx = await requireProductWrite();
  } catch {
    return { ok: false, type: 'forbidden', message: 'Insufficient permissions.' };
  }

  const parsed = clearHeroSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, type: 'validation', message: 'Invalid input.' };
  }

  const { productId, expectedUpdatedAt } = parsed.data;

  const product = await loadProduct(productId);
  if (!product) {
    return { ok: false, type: 'not_found', message: 'Product not found.' };
  }

  const conflict = checkConcurrency(product.updatedAt, expectedUpdatedAt);
  if (conflict) return conflict;

  if (product.heroVideoId === null) {
    return { ok: true, updatedAt: product.updatedAt.toISOString() };
  }

  const previousId = product.heroVideoId;

  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.product.update({
      where: { id: productId },
      data: { heroVideoId: null, updatedBy: ctx.userId },
      select: { updatedAt: true },
    });

    await tx.auditLog.create({
      data: {
        actorId: ctx.userId,
        actorRole:
          (ctx.roles[0] as 'SUPER_ADMIN' | 'CONTENT_ADMIN' | 'SUPPORT_ADMIN' | 'SALES_ADMIN') ??
          null,
        action: 'PRODUCT_HERO_VIDEO_CLEARED',
        entityType: 'Product',
        entityId: productId,
        before: { heroVideoId: previousId } as object,
        after: { heroVideoId: null } as object,
      },
    });

    return p;
  });

  return { ok: true, updatedAt: updated.updatedAt.toISOString() };
}

// ── Gallery: Add Image ───────────────────────────────────────────────────────

export async function addProductGalleryImage(rawInput: unknown): Promise<MediaMutationResult> {
  let ctx;
  try {
    ctx = await requireProductWrite();
  } catch {
    return { ok: false, type: 'forbidden', message: 'Insufficient permissions.' };
  }

  const parsed = galleryAddSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, type: 'validation', message: 'Invalid input.' };
  }

  const { productId, mediaId, altText, expectedUpdatedAt } = parsed.data;

  const product = await loadProduct(productId);
  if (!product) {
    return { ok: false, type: 'not_found', message: 'Product not found.' };
  }

  const conflict = checkConcurrency(product.updatedAt, expectedUpdatedAt);
  if (conflict) return conflict;

  const media = await prisma.mediaAsset.findUnique({
    where: { id: mediaId, deletedAt: null },
    select: { id: true, kind: true, mime: true },
  });

  if (!media) {
    return { ok: false, type: 'validation', message: 'Media asset not found.' };
  }

  if (media.kind !== 'IMAGE' || !isApprovedImageMime(media.mime)) {
    return {
      ok: false,
      type: 'validation',
      message: 'Only approved image types allowed in gallery.',
    };
  }

  // Get next order value
  const maxOrder = await prisma.productImage.aggregate({
    where: { productId },
    _max: { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.productImage.create({
      data: {
        productId,
        mediaId,
        altText,
        order: nextOrder,
        isPrimary: nextOrder === 0,
      },
    });

    const p = await tx.product.update({
      where: { id: productId },
      data: { updatedBy: ctx.userId },
      select: { updatedAt: true },
    });

    await tx.auditLog.create({
      data: {
        actorId: ctx.userId,
        actorRole:
          (ctx.roles[0] as 'SUPER_ADMIN' | 'CONTENT_ADMIN' | 'SUPPORT_ADMIN' | 'SALES_ADMIN') ??
          null,
        action: 'PRODUCT_GALLERY_IMAGE_ADDED',
        entityType: 'Product',
        entityId: productId,
        before: Prisma.DbNull,
        after: { mediaId, altText, order: nextOrder } as object,
      },
    });

    return p;
  });

  return { ok: true, updatedAt: updated.updatedAt.toISOString() };
}

// ── Gallery: Remove Image ────────────────────────────────────────────────────

export async function removeProductGalleryImage(rawInput: unknown): Promise<MediaMutationResult> {
  let ctx;
  try {
    ctx = await requireProductWrite();
  } catch {
    return { ok: false, type: 'forbidden', message: 'Insufficient permissions.' };
  }

  const parsed = galleryRemoveSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, type: 'validation', message: 'Invalid input.' };
  }

  const { productId, productImageId, expectedUpdatedAt } = parsed.data;

  const product = await loadProduct(productId);
  if (!product) {
    return { ok: false, type: 'not_found', message: 'Product not found.' };
  }

  const conflict = checkConcurrency(product.updatedAt, expectedUpdatedAt);
  if (conflict) return conflict;

  const existing = await prisma.productImage.findFirst({
    where: { id: productImageId, productId },
    select: { id: true, mediaId: true, altText: true, order: true },
  });

  if (!existing) {
    return { ok: false, type: 'validation', message: 'Gallery image not found.' };
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.productImage.delete({ where: { id: productImageId } });

    const p = await tx.product.update({
      where: { id: productId },
      data: { updatedBy: ctx.userId },
      select: { updatedAt: true },
    });

    await tx.auditLog.create({
      data: {
        actorId: ctx.userId,
        actorRole:
          (ctx.roles[0] as 'SUPER_ADMIN' | 'CONTENT_ADMIN' | 'SUPPORT_ADMIN' | 'SALES_ADMIN') ??
          null,
        action: 'PRODUCT_GALLERY_IMAGE_REMOVED',
        entityType: 'Product',
        entityId: productId,
        before: { mediaId: existing.mediaId, altText: existing.altText } as object,
        after: Prisma.DbNull,
      },
    });

    return p;
  });

  return { ok: true, updatedAt: updated.updatedAt.toISOString() };
}

// ── Gallery: Reorder ─────────────────────────────────────────────────────────

export async function reorderProductGallery(rawInput: unknown): Promise<MediaMutationResult> {
  let ctx;
  try {
    ctx = await requireProductWrite();
  } catch {
    return { ok: false, type: 'forbidden', message: 'Insufficient permissions.' };
  }

  const parsed = galleryReorderSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, type: 'validation', message: 'Invalid input.' };
  }

  const { productId, orderedIds, expectedUpdatedAt } = parsed.data;

  const product = await loadProduct(productId);
  if (!product) {
    return { ok: false, type: 'not_found', message: 'Product not found.' };
  }

  const conflict = checkConcurrency(product.updatedAt, expectedUpdatedAt);
  if (conflict) return conflict;

  // Verify all IDs belong to this product
  const existing = await prisma.productImage.findMany({
    where: { productId },
    select: { id: true, order: true },
    orderBy: { order: 'asc' },
  });

  const existingIds = new Set(existing.map((e) => e.id));
  for (const id of orderedIds) {
    if (!existingIds.has(id)) {
      return { ok: false, type: 'validation', message: 'Invalid image ID in order list.' };
    }
  }

  // Check if order actually changed
  const currentOrder = existing.map((e) => e.id);
  if (JSON.stringify(currentOrder) === JSON.stringify(orderedIds)) {
    return { ok: true, updatedAt: product.updatedAt.toISOString() };
  }

  const updated = await prisma.$transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx.productImage.update({
        where: { id: orderedIds[i] },
        data: { order: i, isPrimary: i === 0 },
      });
    }

    const p = await tx.product.update({
      where: { id: productId },
      data: { updatedBy: ctx.userId },
      select: { updatedAt: true },
    });

    await tx.auditLog.create({
      data: {
        actorId: ctx.userId,
        actorRole:
          (ctx.roles[0] as 'SUPER_ADMIN' | 'CONTENT_ADMIN' | 'SUPPORT_ADMIN' | 'SALES_ADMIN') ??
          null,
        action: 'PRODUCT_GALLERY_REORDERED',
        entityType: 'Product',
        entityId: productId,
        before: { order: currentOrder } as object,
        after: { order: orderedIds } as object,
      },
    });

    return p;
  });

  return { ok: true, updatedAt: updated.updatedAt.toISOString() };
}

// ── Gallery: Add Video ───────────────────────────────────────────────────────

export async function addProductGalleryVideo(rawInput: unknown): Promise<MediaMutationResult> {
  let ctx;
  try {
    ctx = await requireProductWrite();
  } catch {
    return { ok: false, type: 'forbidden', message: 'Insufficient permissions.' };
  }

  const parsed = videoAddSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, type: 'validation', message: 'Invalid input.' };
  }

  const { productId, mediaId, caption, expectedUpdatedAt } = parsed.data;

  const product = await loadProduct(productId);
  if (!product) {
    return { ok: false, type: 'not_found', message: 'Product not found.' };
  }

  const conflict = checkConcurrency(product.updatedAt, expectedUpdatedAt);
  if (conflict) return conflict;

  const media = await prisma.mediaAsset.findUnique({
    where: { id: mediaId, deletedAt: null },
    select: { id: true, kind: true, mime: true },
  });

  if (!media) {
    return { ok: false, type: 'validation', message: 'Media asset not found.' };
  }

  if (media.kind !== 'VIDEO' || !isApprovedVideoMime(media.mime)) {
    return { ok: false, type: 'validation', message: 'Only approved video types allowed.' };
  }

  const maxOrder = await prisma.productVideo.aggregate({
    where: { productId },
    _max: { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.productVideo.create({
      data: {
        productId,
        mediaId,
        caption: caption ?? null,
        order: nextOrder,
      },
    });

    const p = await tx.product.update({
      where: { id: productId },
      data: { updatedBy: ctx.userId },
      select: { updatedAt: true },
    });

    await tx.auditLog.create({
      data: {
        actorId: ctx.userId,
        actorRole:
          (ctx.roles[0] as 'SUPER_ADMIN' | 'CONTENT_ADMIN' | 'SUPPORT_ADMIN' | 'SALES_ADMIN') ??
          null,
        action: 'PRODUCT_GALLERY_VIDEO_ADDED',
        entityType: 'Product',
        entityId: productId,
        before: Prisma.DbNull,
        after: { mediaId, caption, order: nextOrder } as object,
      },
    });

    return p;
  });

  return { ok: true, updatedAt: updated.updatedAt.toISOString() };
}

// ── Gallery: Remove Video ────────────────────────────────────────────────────

export async function removeProductGalleryVideo(rawInput: unknown): Promise<MediaMutationResult> {
  let ctx;
  try {
    ctx = await requireProductWrite();
  } catch {
    return { ok: false, type: 'forbidden', message: 'Insufficient permissions.' };
  }

  const parsed = videoRemoveSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, type: 'validation', message: 'Invalid input.' };
  }

  const { productId, productVideoId, expectedUpdatedAt } = parsed.data;

  const product = await loadProduct(productId);
  if (!product) {
    return { ok: false, type: 'not_found', message: 'Product not found.' };
  }

  const conflict = checkConcurrency(product.updatedAt, expectedUpdatedAt);
  if (conflict) return conflict;

  const existing = await prisma.productVideo.findFirst({
    where: { id: productVideoId, productId },
    select: { id: true, mediaId: true, caption: true },
  });

  if (!existing) {
    return { ok: false, type: 'validation', message: 'Gallery video not found.' };
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.productVideo.delete({ where: { id: productVideoId } });

    const p = await tx.product.update({
      where: { id: productId },
      data: { updatedBy: ctx.userId },
      select: { updatedAt: true },
    });

    await tx.auditLog.create({
      data: {
        actorId: ctx.userId,
        actorRole:
          (ctx.roles[0] as 'SUPER_ADMIN' | 'CONTENT_ADMIN' | 'SUPPORT_ADMIN' | 'SALES_ADMIN') ??
          null,
        action: 'PRODUCT_GALLERY_VIDEO_REMOVED',
        entityType: 'Product',
        entityId: productId,
        before: { mediaId: existing.mediaId, caption: existing.caption } as object,
        after: Prisma.DbNull,
      },
    });

    return p;
  });

  return { ok: true, updatedAt: updated.updatedAt.toISOString() };
}
