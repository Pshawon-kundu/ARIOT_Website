/**
 * Media storage provider selector (D-068).
 *
 * Resolves the active provider from MEDIA_STORAGE_PROVIDER and hands out a
 * cached provider instance. Selection rules:
 *   - 'local' / 'r2' → that provider.
 *   - unset → 'local' in development; FAIL CLOSED in production (production
 *     must declare its storage provider explicitly).
 *   - any other value → FAIL CLOSED (unreachable post-boot because
 *     server/env.ts validates the enum; kept as a regression guard).
 *
 * The browser never chooses a provider — it only reads the server-resolved
 * mode via /api/admin/media/upload/mode.
 */

import { env } from '../env.ts';
import { LocalMediaStorageProvider } from './local-media-storage.ts';
import { getLocalMediaConfig } from './media-storage-config.ts';
import type { MediaStorageProvider, MediaStorageProviderName } from './media-storage-provider.ts';
import { R2MediaStorageProvider } from './r2-media-storage.ts';

export type { MediaStorageProvider, MediaStorageProviderName };

export function resolveProviderName(): MediaStorageProviderName {
  const value = env.MEDIA_STORAGE_PROVIDER;
  if (value === 'local' || value === 'r2') return value;
  if (value === undefined) {
    if (env.NODE_ENV === 'production') {
      throw new Error(
        'MEDIA_STORAGE_PROVIDER must be explicitly set to "local" or "r2" in production.',
      );
    }
    return 'local';
  }
  throw new Error(`Unknown MEDIA_STORAGE_PROVIDER value: ${value}. Use "local" or "r2".`);
}

let cachedProvider: MediaStorageProvider | null = null;
let cachedName: MediaStorageProviderName | null = null;

export function getMediaStorageProvider(): MediaStorageProvider {
  const name = resolveProviderName();
  if (cachedProvider && cachedName === name) {
    return cachedProvider;
  }
  const provider: MediaStorageProvider =
    name === 'r2'
      ? new R2MediaStorageProvider()
      : new LocalMediaStorageProvider(getLocalMediaConfig());
  cachedProvider = provider;
  cachedName = name;
  return provider;
}

/** Test seam: clears the cached provider so the next call rebuilds. */
export function resetMediaStorageProviderForTests(): void {
  cachedProvider = null;
  cachedName = null;
}
