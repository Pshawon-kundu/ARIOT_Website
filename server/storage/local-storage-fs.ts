/**
 * Local filesystem primitives for the `local` media provider (D-068).
 *
 * Every path is derived from a canonical, provider-neutral storageKey
 * (upload-keys.ts) plus a validated absolute root — never from client input.
 * `resolveKeyPath` guards against traversal so a tampered key can never escape
 * the provider root.
 */

import { constants } from 'node:fs';
import { access, mkdir, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { parsePublicMediaKey, parseTempUploadKey } from './upload-keys.ts';

/**
 * Map a provider-neutral storageKey onto an absolute path under the root,
 * rejecting any key that would escape the root via `..` segments or an
 * absolute nested path. Also rejects a non-absolute root.
 */
export function resolveKeyPath(root: string, storageKey: string): string {
  if (!isAbsolute(root)) {
    throw new Error('Media provider root must be an absolute path.');
  }
  const resolved = resolve(root, storageKey);
  const rel = relative(root, resolved);
  if (rel.startsWith('..') || isAbsolute(rel)) {
    throw new Error('Storage key escapes the media provider root.');
  }
  return resolved;
}

async function ensureParent(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
}

/**
 * Write an upload to its temp key (`tmp/uploads/...`). `wx` mode fails if the
 * target already exists, which would indicate a key collision.
 */
export async function writeTempFile(root: string, tempKey: string, data: Buffer): Promise<string> {
  if (!parseTempUploadKey(tempKey)) {
    throw new Error('Invalid temp storage key.');
  }
  const filePath = resolveKeyPath(root, tempKey);
  await ensureParent(filePath);
  await writeFile(filePath, data, { flag: 'wx' });
  return filePath;
}

/**
 * Atomically promote a verified temp file to its canonical public key
 * (`public/products/...`). Both live under the same root, so `rename` is
 * atomic within the filesystem.
 */
export async function promoteToPublic(
  root: string,
  tempKey: string,
  publicKey: string,
): Promise<string> {
  if (!parseTempUploadKey(tempKey)) {
    throw new Error('Invalid temp storage key.');
  }
  if (!parsePublicMediaKey(publicKey)) {
    throw new Error('Invalid public storage key.');
  }
  const tempPath = resolveKeyPath(root, tempKey);
  const publicPath = resolveKeyPath(root, publicKey);
  await ensureParent(publicPath);
  await rename(tempPath, publicPath);
  return publicPath;
}

/**
 * Best-effort delete of a key we provably own (only canonical tmp/public
 * keys; anything else is refused). ENOENT is swallowed — deleting a missing
 * key is already the desired end state. Used for compensation cleanup when an
 * upload fails after writing, and for smoke-test cleanup.
 */
export async function deleteOwnedKey(root: string, storageKey: string): Promise<void> {
  const isTemp = parseTempUploadKey(storageKey) !== null;
  const isPublic = parsePublicMediaKey(storageKey) !== null;
  if (!isTemp && !isPublic) {
    throw new Error('Refusing to delete a non-canonical storage key.');
  }
  try {
    await unlink(resolveKeyPath(root, storageKey));
  } catch (err) {
    if ((err as { code?: string }).code !== 'ENOENT') throw err;
  }
}

/** Stat a canonical public key; returns null when missing. */
export async function statPublicKey(
  root: string,
  publicKey: string,
): Promise<{ sizeBytes: number } | null> {
  if (!parsePublicMediaKey(publicKey)) {
    throw new Error('Invalid public storage key.');
  }
  try {
    const info = await stat(resolveKeyPath(root, publicKey));
    if (!info.isFile()) return null;
    return { sizeBytes: info.size };
  } catch (err) {
    if ((err as { code?: string }).code === 'ENOENT') return null;
    throw err;
  }
}

/** True when the root exists and is readable + writable (health probe). */
export async function isRootWritable(root: string): Promise<boolean> {
  try {
    await access(root, constants.R_OK | constants.W_OK);
    return true;
  } catch {
    return false;
  }
}
