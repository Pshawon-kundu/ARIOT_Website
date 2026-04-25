'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavLink } from './nav-link';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  label: string;
  href: string;
}

interface MobileDrawerProps {
  navItems: ReadonlyArray<NavItem>;
}

/**
 * MobileDrawer — hamburger trigger + slide-in side drawer.
 *
 * Client component because it owns open/close state, an Escape-key
 * listener, and a body-scroll lock. Only renders on viewports below
 * the `md` breakpoint (md:hidden on the shell).
 *
 * Auto-closes on route change so the drawer never blocks the page after
 * the user taps a nav link.
 */
export function MobileDrawer({ navItems }: MobileDrawerProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Derive "close on route change" during render via a tracked previous
  // pathname (React 19 pattern; replaces a setState-in-useEffect anti-pattern).
  const [previousPathname, setPreviousPathname] = useState(pathname);
  if (pathname !== previousPathname) {
    setPreviousPathname(pathname);
    setOpen(false);
  }

  // ESC to close + body scroll lock when open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-drawer"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden',
          'text-steel-100 hover:text-cyan-400 hover:bg-bg-elevated',
          'transition-colors duration-200 ease-out-quart',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
        )}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Backdrop */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn(
          'fixed inset-0 z-40 bg-bg-overlay backdrop-blur-sm md:hidden',
          'transition-opacity duration-300 ease-out-quart',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      {/* Drawer */}
      <div
        id="mobile-drawer"
        role="dialog"
        aria-modal={open}
        aria-label="Mobile navigation"
        className={cn(
          'fixed right-0 top-0 z-50 h-dvh w-[88%] max-w-sm md:hidden',
          'flex flex-col bg-bg-raised border-l border-steel-800',
          'transition-transform duration-300 ease-out-quart',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-steel-800 px-5">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="font-display text-lg font-semibold tracking-tight text-steel-100"
          >
            ARIOT
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-md',
              'text-steel-100 hover:text-cyan-400 hover:bg-bg-elevated',
              'transition-colors duration-200 ease-out-quart',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-5" aria-label="Primary mobile">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href} className="px-4 py-3 text-base">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3 border-t border-steel-800 p-5">
          <Button asChild size="lg" variant="primary">
            <Link href="/quote">Request a quote</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/contact">Talk to sales</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
