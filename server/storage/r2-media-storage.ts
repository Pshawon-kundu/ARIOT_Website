/**
 * `r2` media storage provider (D-068) — Cloudflare R2 (STORAGE-1R / D-067).
 *
 * Retained as a first-class provider, switchable via MEDIA_STORAGE_PROVIDER=r2.
 * The upload flow itself stays in upload-initiate / upload-complete; this
 * class only adapts the provider contract (public URL + health) for R2.
 *
 * A cdnUrl (R2_PUBLIC_BASE_URL + storageKey) is persisted on MediaAsset at
 * upload time; when absent, URLs fall back to site-relative /{storageKey}.
 */

import type { MediaStorageProvider } from './media-storage-provider.ts';
import { getR2ConfigSafe } from './upload-context.ts';

export class R2MediaStorageProvider implements MediaStorageProvider {
  readonly name = 'r2' as const;

  getPublicUrl(storageKey: string, cdnUrl: string | null): string {
    return cdnUrl ?? `/${storageKey}`;
  }

  async checkHealth(): Promise<{ ok: boolean; detail: string }> {
    if (getR2ConfigSafe()) {
      return { ok: true, detail: 'R2 storage is configured.' };
    }
    return { ok: false, detail: 'R2 storage is not configured.' };
  }
}
