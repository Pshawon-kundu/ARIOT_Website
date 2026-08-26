/**
 * Cloudflare R2 S3-compatible client (STORAGE-1R / D-067).
 *
 * Lazily constructed on first use so a deployment without R2 env config never
 * instantiates the client. `getR2Config()` (server/env.ts) asserts the full
 * env set and derives the S3 API endpoint from the account id.
 */

import { S3Client } from '@aws-sdk/client-s3';
import { getR2Config } from '../env.ts';

let cachedClient: S3Client | null = null;
let cachedFingerprint: string | null = null;

export function getR2Client(): S3Client {
  const config = getR2Config();
  // One bucket per environment (D-067): rebuild only if the bucket changed.
  const fingerprint = `${config.endpoint}/${config.bucketName}`;
  if (cachedClient && cachedFingerprint === fingerprint) {
    return cachedClient;
  }
  const client = new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  cachedClient = client;
  cachedFingerprint = fingerprint;
  return client;
}

/**
 * Test seam: clears the cached S3Client so the next `getR2Client()` rebuilds
 * with current env. Used by the R2 smoke test between assertions to ensure a
 * fresh transport.
 */
export function resetR2ClientForTests(): void {
  cachedClient = null;
  cachedFingerprint = null;
}
