'use client';

import type { ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics';

interface ProductGridTrackerProps {
  children: ReactNode;
}

/**
 * Wraps the product catalog grid to fire analytics events on product
 * card clicks and CTA button clicks. Thin client island — all state
 * lives in the server-rendered children.
 */
export function ProductGridTracker({ children }: ProductGridTrackerProps) {
  return (
    <div
      onClick={(e) => {
        const link = (e.target as HTMLElement).closest('a');
        if (!link) return;

        const href = link.getAttribute('href') ?? '';
        const label = link.textContent?.trim() ?? '';

        // Product detail links: /products/[slug]
        const productMatch = href.match(/^\/products\/([^/]+)$/);
        if (productMatch) {
          trackEvent('Product Card Clicked', {
            slug: productMatch[1],
            name: label,
          });
          return;
        }

        // CTA buttons (non-product links)
        if (label && href) {
          trackEvent('CTA Clicked', { label, href, location: 'products' });
        }
      }}
    >
      {children}
    </div>
  );
}
