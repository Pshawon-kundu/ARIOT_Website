import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { SkipLink } from '@/components/ui/skip-link';

/**
 * Marketing route-group layout.
 * Wraps every public-marketing page with the global header, footer, and
 * keyboard skip link. Uses fragment-style composition so the body's
 * flex column (set in app/layout.tsx) handles the footer-at-bottom
 * behavior on short pages.
 */
export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
