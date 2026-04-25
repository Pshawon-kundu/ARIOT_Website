import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { NavLink } from './nav-link';
import { MobileDrawer } from './mobile-drawer';

const NAV_ITEMS = [
  { label: 'Products', href: '/products' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Support', href: '/support' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
] as const;

/**
 * SiteHeader — sticky public-website header.
 *
 * Server component. The two interactive bits (active link detection,
 * mobile drawer) are isolated client islands (NavLink, MobileDrawer)
 * so the header itself ships zero client JS.
 *
 * Translucent bg + 12px backdrop blur reads premium under any hero
 * background; a 1px steel-800 bottom border keeps the boundary visible
 * against light hero stills (DESIGN_SYSTEM §13).
 */
export function SiteHeader() {
  return (
    <header
      role="banner"
      className="sticky top-0 z-30 border-b border-steel-800 bg-bg-base/80 backdrop-blur-md"
    >
      <Container className="flex h-[60px] items-center justify-between md:h-[72px]">
        <Link
          href="/"
          aria-label="ARIOT — home"
          className="
            inline-flex items-center
            font-display text-lg md:text-xl font-semibold tracking-tight
            text-steel-100 hover:text-cyan-400
            transition-colors duration-200 ease-out-quart
            rounded-sm
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base
          "
        >
          ARIOT
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild size="sm" variant="ghost">
            <Link href="/contact">Contact</Link>
          </Button>
          <Button asChild size="sm" variant="primary">
            <Link href="/quote">Request a quote</Link>
          </Button>
        </div>

        <MobileDrawer navItems={NAV_ITEMS} />
      </Container>
    </header>
  );
}
