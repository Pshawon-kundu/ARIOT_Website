/**
 * tests/helpers/register-hooks.mjs — Node native TS loader hooks for tests.
 *
 * Node 24 runs .ts files natively (type stripping) as ESM, but does NOT
 * understand the tsconfig `@/*` path alias or extensionless relative imports
 * (`./product-variant-schema`). This hooks module teaches the resolver both,
 * so the REAL production server modules (server/admin/products/*) can be
 * imported by node:test without tsx, CJS interop, or a duplicate SQL mirror.
 *
 * Register with:
 *   node --import ./tests/helpers/register-hooks.mjs --test tests/...
 */

import { registerHooks } from 'node:module';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = process.cwd();

function tryResolveFile(absBase) {
  if (existsSync(absBase) && statSync(absBase).isFile()) return absBase;
  for (const ext of ['.ts', '.tsx', '.mjs', '.js']) {
    if (existsSync(absBase + ext) && statSync(absBase + ext).isFile()) {
      return absBase + ext;
    }
  }
  for (const idx of ['index.ts', 'index.tsx', 'index.js']) {
    const cand = join(absBase, idx);
    if (existsSync(cand) && statSync(cand).isFile()) return cand;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    // tsconfig `@/*` path alias → workspace-relative file.
    if (specifier.startsWith('@/')) {
      const target = tryResolveFile(join(ROOT, specifier.slice(2)));
      if (target) {
        return { url: pathToFileURL(target).href, shortCircuit: true };
      }
    }

    // Extensionless relative imports → append .ts/.tsx when the exact file
    // does not exist. Pass through when the specifier already resolves.
    const parentURL = context.parentURL;
    if (
      parentURL &&
      parentURL.startsWith('file:') &&
      (specifier.startsWith('./') || specifier.startsWith('../'))
    ) {
      const abs = fileURLToPath(new URL(specifier, parentURL));
      if (!existsSync(abs)) {
        const target = tryResolveFile(abs);
        if (target) {
          return { url: pathToFileURL(target).href, shortCircuit: true };
        }
      }
    }

    return nextResolve(specifier, context);
  },
});
