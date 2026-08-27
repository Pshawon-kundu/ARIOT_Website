'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { NavLink } from './nav-link';
import { BrandMark } from './brand-mark';
import { MobileDrawer } from './mobile-drawer';
import { MoreMenu } from './more-menu';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'R&D', href: '/research' },
  { label: 'Workspace', href: '/workspace' },
  { label: 'Components', href: '/components' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'About', href: '/about' },
] as const;

const MOBILE_NAV_ITEMS = [
  ...NAV_ITEMS,
  { label: 'Blog', href: '/blog' },
  { label: 'Support', href: '/support' },
] as const;

/**
 * SiteHeader — sticky public-website header.
 *
 * Clean, premium white surface with a subtle bottom border. On scroll the
 * header height eases down slightly and a backdrop blur + soft shadow engage,
 * keeping the ARIoT logo perfectly readable. The logo is width-sized (not
 * boxed in a square) so the full lockup fills its visual area.
 *
 * The two interactive bits (active link detection, mobile drawer, More menu)
 * remain isolated client islands; this shell only adds scroll state.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      role="banner"
      className={[
        'ease-out-quart sticky top-0 z-30 border-b backdrop-blur-md transition-[height,box-shadow,background-color] duration-300',
        scrolled ? 'border-steel-800 shadow-2 bg-white/85' : 'border-steel-800/70 bg-white/90',
      ].join(' ')}
    >
      <Container
        className={[
          'ease-out-quart relative flex items-center justify-between gap-3 transition-[height] duration-300',
          scrolled ? 'h-[56px] md:h-[64px]' : 'h-[64px] md:h-[76px]',
        ].join(' ')}
      >
        <span
          aria-hidden
          className={[
            'via-brand-orange pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent transition-opacity duration-300',
            scrolled ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />
        <Link
          href="/"
          aria-label="ARIoT Technologies — home"
          className="focus-visible:ring-offset-bg-base focus-visible:ring-brand-orange inline-flex items-center rounded-sm transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <BrandMark />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
          <MoreMenu />
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild size="sm" variant="ghost">
            <Link href="/contact">Contact</Link>
          </Button>
          <Button asChild size="sm" variant="primary">
            <Link href="/quote">Request a quote</Link>
          </Button>
        </div>

        <MobileDrawer navItems={MOBILE_NAV_ITEMS} />
      </Container>
    </header>
  );
}
