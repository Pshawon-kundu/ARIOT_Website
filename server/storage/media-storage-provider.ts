/**
 * Media storage provider abstraction (D-068) — the single seam between media
 * business logic and the configured storage backend.
 *
 * Providers:
 *   - `local`: persistent VPS filesystem under MEDIA_LOCAL_ROOT (default).
 *   - `r2`:    Cloudflare R2 (STORAGE-1R / D-067), retained and switchable.
 *
 * The provider-neutral `MediaAsset.storageKey` (see upload-keys.ts) is the only
 * identity ever persisted; each provider maps that key onto its own namespace
 * (filesystem path, S3 object key) internally. Absolute OS paths are never
 * stored in the database.
 */

export type MediaStorageProviderName = 'local' | 'r2';

export interface MediaStorageProvider {
  readonly name: MediaStorageProviderName;

  /**
   * Resolve the public URL for a stored asset.
   *
   * `cdnUrl` is the provider-resolved URL persisted on MediaAsset at upload
   * time (may be null for legacy rows); when present it is authoritative. The
   * fallback derives a site-relative URL from the canonical storage key so
   * legacy records without a cdnUrl still render.
   */
  getPublicUrl(storageKey: string, cdnUrl: string | null): string;

  /**
   * Health probe. Returns `{ ok: false }` with a non-secret reason when the
   * provider is not usable (root missing, config incomplete). Never echoes
   * secrets or absolute filesystem paths.
   */
  checkHealth(): Promise<{ ok: boolean; detail: string }>;
}
