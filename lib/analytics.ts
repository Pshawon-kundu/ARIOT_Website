'use client';

import { track as vercelTrack } from '@vercel/analytics/react';

/**
 * Typed analytics event tracking. Wraps `@vercel/analytics/react` track
 * to provide a single, discoverable API for all site events.
 *
 * Usage:
 *   import { trackEvent } from '@/lib/analytics';
 *   trackEvent('Contact Form Submitted', { topic: 'sales' });
 *
 * Events flow to both Vercel Analytics (custom events) and Plausible
 * (as custom events via the Vercel script, if configured).
 */

type AllowedValue = string | number | boolean | null;

/** All trackable events — add new events here to keep a typed registry. */
type EventMap = {
  /** Contact form submitted successfully. */
  'Contact Form Submitted': { topic: string };
  /** Quote request form submitted successfully. */
  'Quote Form Submitted': { product: string; quantity: number };
  /** Newsletter subscription submitted successfully. */
  'Newsletter Subscribed': Record<string, never>;
  /** User clicked a CTA button/link. */
  'CTA Clicked': { label: string; href: string; location: string };
  /** User viewed a product detail page. */
  'Product Viewed': { slug: string; name: string };
  /** User clicked a product card from catalog. */
  'Product Card Clicked': { slug: string; name: string };
};

type EventName = keyof EventMap;

/**
 * Fire a typed analytics event.
 *
 * No-op if the analytics script is not loaded (e.g. local dev without
 * Vercel/Plausible). No PII is ever sent.
 */
export function trackEvent<T extends EventName>(
  name: T,
  properties?: EventMap[T] extends Record<string, never>
    ? Record<string, never>
    : { [K in keyof EventMap[T]]: AllowedValue },
): void {
  try {
    vercelTrack(name, properties as Record<string, AllowedValue> | undefined);
  } catch {
    // Silently swallow — analytics must never break the UI.
  }
}
