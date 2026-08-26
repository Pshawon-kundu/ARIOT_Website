'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

interface ProductViewTrackerProps {
  slug: string;
  name: string;
}

/**
 * Fires a Product Viewed analytics event on mount.
 * Render inside the product detail page — the event fires once per mount.
 */
export function ProductViewTracker({ slug, name }: ProductViewTrackerProps) {
  useEffect(() => {
    trackEvent('Product Viewed', { slug, name });
  }, [slug, name]);

  return null;
}
