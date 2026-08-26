/**
 * `local` media storage provider (D-068) — persistent VPS filesystem.
 *
 * Maps provider-neutral storageKeys onto filesystem paths under the validated
 * provider root (`MEDIA_LOCAL_ROOT`). Public delivery is site-relative
 * (`/media/{storageKey-after-public-prefix}`) or absolute when
 * MEDIA_PUBLIC_BASE_URL is set.
 */

import type { LocalMediaConfig } from './media-storage-config.ts';
import type { MediaStorageProvider } from './media-storage-provider.ts';
import { isRootWritable, resolveKeyPath } from './local-storage-fs.ts';

const PUBLIC_PREFIX = 'public/';

export class LocalMediaStorageProvider implements MediaStorageProvider {
  readonly name = 'local' as const;
  private readonly config: LocalMediaConfig;

  constructor(config: LocalMediaConfig) {
    this.config = config;
  }

  getPublicUrl(storageKey: string, cdnUrl: string | null): string {
    if (cdnUrl) return cdnUrl;
    const publicPath = storageKey.startsWith(PUBLIC_PREFIX)
      ? storageKey.slice(PUBLIC_PREFIX.length)
      : storageKey;
    const base = this.config.publicBaseUrl;
    return base ? `${base.replace(/\/+$/, '')}/media/${publicPath}` : `/media/${publicPath}`;
  }

  async checkHealth(): Promise<{ ok: boolean; detail: string }> {
    if (await isRootWritable(this.config.root)) {
      return { ok: true, detail: 'local provider root is readable and writable.' };
    }
    return { ok: false, detail: 'local provider root is not accessible.' };
  }

  /**
   * Traversal-safe absolute path for a storageKey. Used by the `/media`
   * delivery route; throws when the key would escape the provider root.
   */
  resolvePath(storageKey: string): string {
    return resolveKeyPath(this.config.root, storageKey);
  }
}
