/**
 * Local media storage configuration (D-068).
 *
 * Resolves the provider root + public base URL for the `local` provider from
 * the typed env contract. The root is validated (absolute, no `..` segments,
 * never inside the Next.js `public/` directory) so a misconfigured deployment
 * fails with a clear message instead of serving or deleting files in the wrong
 * place.
 */

import { isAbsolute, normalize, relative, resolve } from 'node:path';
import { env } from '../env.ts';

export interface LocalMediaConfig {
  /** Absolute provider root; contains `tmp/` and `public/` subdirectories. */
  root: string;
  /**
   * Optional external origin for served media (e.g. https://media.ariot.tech).
   * When unset, media URLs are site-relative (`/media/...`).
   */
  publicBaseUrl?: string;
}

/**
 * Resolve the active local provider config from the typed env contract.
 *
 * MEDIA_LOCAL_ROOT must be explicit in production. In development it defaults
 * to a sibling of the repository (`<repo-parent>/ariot-media-dev`) — never
 * inside the Next.js deployment directory, which may be wiped on redeploy.
 */
export function getLocalMediaConfig(): LocalMediaConfig {
  const configured = env.MEDIA_LOCAL_ROOT;
  let root: string;
  if (configured) {
    root = configured;
  } else if (env.NODE_ENV === 'production') {
    throw new Error(
      'MEDIA_LOCAL_ROOT is required when MEDIA_STORAGE_PROVIDER=local in production.',
    );
  } else {
    root = resolve(process.cwd(), '..', 'ariot-media-dev');
  }
  return { root: assertSafeLocalRoot(root), publicBaseUrl: env.MEDIA_PUBLIC_BASE_URL };
}

/**
 * Local root safety rules (D-068):
 *  1. must be an absolute path;
 *  2. must not contain `..` segments (no escaping the root);
 *  3. must not live inside the Next.js `public/` directory — uploads must
 *     never be served from the static public dir or shipped in the deploy
 *     bundle.
 *
 * Returns the normalized root. Throws with an actionable message otherwise.
 */
export function assertSafeLocalRoot(root: string): string {
  if (!isAbsolute(root)) {
    throw new Error('MEDIA_LOCAL_ROOT must be an absolute path.');
  }
  if (root.split(/[\\/]+/).includes('..')) {
    throw new Error('MEDIA_LOCAL_ROOT must not contain ".." path segments.');
  }
  const normalized = normalize(root);
  const publicDir = resolve(process.cwd(), 'public');
  const rel = relative(publicDir, normalized);
  const insidePublic = rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
  if (insidePublic) {
    throw new Error('MEDIA_LOCAL_ROOT must not live inside the Next.js public/ directory.');
  }
  return normalized;
}
