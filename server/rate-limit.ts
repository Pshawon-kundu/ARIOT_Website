import type { NextRequest } from 'next/server';

/**
 * In-memory fixed-window rate limiter for public mutating API routes.
 *
 * Default policy: 10 requests per minute per client IP (per master plan
 * steps 1.11.5–1.11.7 and AGENTS.md §9). Applied to /api/contact,
 * /api/quote, and /api/newsletter.
 *
 * This is a single-instance, process-local limiter. It is intentionally
 * dependency-free and safe for the current single-node / preview deploy.
 * It does NOT share state across serverless instances — see
 * docs/08_KNOWN_ISSUES.md (I-015) for the scale-out limitation and the
 * Phase 2 plan to move to a shared store (Redis/Upstash).
 *
 * No request bodies, IPs, or PII are logged here (AGENTS.md §9).
 */

export interface RateLimitOptions {
  /** Maximum requests allowed within the window. */
  max?: number;
  /** Window length in milliseconds. */
  windowMs?: number;
}

export interface RateLimitResult {
  limited: boolean;
  /** Requests remaining in the current window. */
  remaining: number;
  /** Epoch ms when the current window resets. */
  resetAt: number;
}

const DEFAULT_MAX = 10;
const DEFAULT_WINDOW_MS = 60_000;
const MAX_BUCKETS = 10_000;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function sweep(): void {
  if (buckets.size < MAX_BUCKETS) return;
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function rateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  sweep();
  const max = options.max ?? DEFAULT_MAX;
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const now = Date.now();

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { limited: false, remaining: max - 1, resetAt };
  }

  if (existing.count >= max) {
    return { limited: true, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { limited: false, remaining: max - existing.count, resetAt: existing.resetAt };
}

/**
 * Derive a per-namespace client key from the request. Uses the first hop of
 * `x-forwarded-for` (set by the hosting proxy/CDN); falls back to "unknown"
 * when the header is absent (e.g. local dev).
 */
export function clientKeyFromRequest(request: NextRequest, namespace: string): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return `${namespace}:${ip}`;
}
