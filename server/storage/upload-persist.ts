/**
 * Upload persist (STORAGE-1R / D-067) — the final completion side-effect.
 *
 * Persists MediaAsset + AuditLog in one transaction with MediaAsset.id as the
 * idempotency boundary. The boundary lives in the database, so a replay
 * returns the same verified asset without ever touching storage again. Replay
 * writes no second audit row.
 *
 * The Prisma client is overridable via the `deps` parameter so the real
 * `persistCompletedAsset` logic can be exercised against a disposable
 * PostgreSQL database in tests (TASK 11). Production callers omit `deps`.
 */

import { Prisma, PrismaClient } from '../../lib/generated/prisma/client.ts';
import { MEDIA_KIND } from '../admin/media/media-policy.ts';
import type { ApprovedMime } from '../admin/media/media-policy.ts';
import { kindToFolder } from './upload-keys.ts';

/**
 * The persistence boundary only needs these payload fields — provider-neutral
 * and free of token metadata (jti/iat/exp). Both the R2 completion flow (full
 * UploadTokenPayload) and the local flow (local-upload.ts) satisfy it.
 */
export type PersistPayload = {
  mediaAssetId: string;
  mimeType: ApprovedMime;
  sizeBytes: number;
  kind: 'IMAGE' | 'VIDEO';
  tempKey: string;
  publicKey: string;
  userId: string;
};

export type CompletedAssetDto = {
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
  sizeBytes: string;
  createdAt: string;
};

export type CompleteUploadResult =
  | { ok: true; asset: CompletedAssetDto; created: boolean }
  | {
      ok: false;
      type: 'forbidden' | 'validation' | 'not_found' | 'conflict' | 'not_configured' | 'error';
      message: string;
    };

export type PersistDeps = {
  prisma?: PrismaClient;
};

export type PersistOptions = {
  altText?: string;
  caption?: string;
  mimeType: string;
  /**
   * Provider-resolved public URL to persist as `cdnUrl` (D-068). Nullable —
   * a provider without an external origin (site-relative local delivery)
   * persists null and the DTO resolves the URL from the storage key.
   */
  cdnUrl?: string | null;
};

export async function persistCompletedAsset(
  payload: PersistPayload,
  actorRole: string | null,
  options: PersistOptions,
  deps: PersistDeps = {},
): Promise<CompleteUploadResult> {
  // Lazy default import keeps `server/db.ts` (which uses `@/server`/`@/lib`
  // path aliases) out of the storage module graph at smoke-test load time.
  const defaultPrisma = deps.prisma ?? (await import('../db.ts')).prisma;
  const prisma = defaultPrisma as PrismaClient;

  const cdnUrl = options.cdnUrl ?? null;

  // Pre-transaction: idempotency boundary lives on MediaAsset.id (the primary
  // key). A replay returns the same verified asset and writes no second
  // audit row.
  const existing = await prisma.mediaAsset.findUnique({
    where: { id: payload.mediaAssetId },
  });
  if (existing) {
    return { ok: true, asset: toAssetDto(existing), created: false };
  }

  try {
    const { asset, created } = await prisma.$transaction(async (tx) => {
      const createdAsset = await tx.mediaAsset.create({
        data: {
          id: payload.mediaAssetId,
          kind: payload.kind,
          mime: options.mimeType || payload.mimeType,
          sizeBytes: BigInt(payload.sizeBytes),
          storageKey: payload.publicKey,
          cdnUrl,
          variants: Prisma.JsonNull,
          altText: options.altText ?? null,
          caption: options.caption ?? null,
          tags: Prisma.JsonNull,
          folder: `products/${kindToFolder(payload.kind)}`,
          isPublic: true,
          uploadedBy: payload.userId,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: payload.userId,
          actorRole:
            actorRole === 'SUPER_ADMIN' ||
            actorRole === 'CONTENT_ADMIN' ||
            actorRole === 'SUPPORT_ADMIN' ||
            actorRole === 'SALES_ADMIN'
              ? (actorRole as 'SUPER_ADMIN' | 'CONTENT_ADMIN' | 'SUPPORT_ADMIN' | 'SALES_ADMIN')
              : null,
          action: 'MEDIA_ASSET_UPLOADED',
          entityType: 'MediaAsset',
          entityId: payload.mediaAssetId,
          before: Prisma.DbNull,
          after: {
            id: createdAsset.id,
            kind: createdAsset.kind,
            mime: createdAsset.mime,
            sizeBytes: createdAsset.sizeBytes.toString(),
            storageKey: createdAsset.storageKey,
            isPublic: createdAsset.isPublic,
          } as Prisma.InputJsonValue,
        },
      });

      return { asset: createdAsset, created: true };
    });

    return { ok: true, asset: toAssetDto(asset), created };
  } catch (err) {
    // Race between the findUnique precheck and the create — honor the PK as
    // the canonical idempotency boundary.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const replay = await prisma.mediaAsset.findUnique({
        where: { id: payload.mediaAssetId },
      });
      if (replay) {
        return { ok: true, asset: toAssetDto(replay), created: false };
      }
      return {
        ok: false,
        type: 'conflict',
        message: 'MediaAsset id collision; please retry.',
      };
    }
    return { ok: false, type: 'error', message: 'Could not finalize the upload.' };
  }
}

type AssetRow = {
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
};

export function toAssetDto(asset: AssetRow): CompletedAssetDto {
  return {
    id: asset.id,
    filename: asset.storageKey.split('/').pop() ?? asset.storageKey,
    mimeType: asset.mime,
    mediaType:
      asset.kind === MEDIA_KIND.IMAGE || asset.kind === MEDIA_KIND.VIDEO ? asset.kind : 'OTHER',
    url: asset.cdnUrl ?? `/${asset.storageKey}`,
    altText: asset.altText,
    caption: asset.caption,
    width: asset.width,
    height: asset.height,
    durationSeconds: asset.durationSeconds,
    sizeBytes: asset.sizeBytes.toString(),
    createdAt: asset.createdAt.toISOString(),
  };
}
