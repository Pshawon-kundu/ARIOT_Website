import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { SkipLink } from '@/components/ui/skip-link';
import { CommandPalette } from '@/components/layout/command-palette';
import { BrandIntro } from '@/components/brand/brand-intro';

/**
 * Marketing route-group layout.
 * Wraps every public-marketing page with the global header, footer,
 * keyboard skip link, and command palette (Ctrl/Cmd+K). Uses
 * fragment-style composition so the body's flex column (set in
 * app/layout.tsx) handles the footer-at-bottom behavior on short pages.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="theme-light bg-bg-base text-steel-100 flex min-h-dvh flex-col font-sans antialiased">
      <SkipLink />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <CommandPalette />
      <BrandIntro />
    </div>
  );
}
