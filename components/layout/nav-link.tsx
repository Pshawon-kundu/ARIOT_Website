'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';

interface NavLinkProps extends ComponentProps<typeof Link> {
  /** When true, only the exact path is considered active (e.g. for "/").
   *  Default false: nested paths under the link are also marked active. */
  exact?: boolean;
}

/**
 * NavLink — Next.js Link with active-state detection via usePathname.
 *
 * Client component because usePathname is a client-only hook. The component
 * is small and tree-shakeable; the rest of the header/footer remain server.
 *
 * Active state is conveyed both visually (cyan-400 text) and semantically
 * via aria-current="page" — assistive technology announces the active page.
 */
export function NavLink({
  href,
  className,
  children,
  exact = false,
  ...props
}: NavLinkProps) {
  const pathname = usePathname();
  const hrefStr =
    typeof href === 'string' ? href : (href.pathname ?? '');

  const isActive = (() => {
    if (!hrefStr) return false;
    if (exact || hrefStr === '/') return pathname === hrefStr;
    return pathname === hrefStr || pathname.startsWith(`${hrefStr}/`);
  })();

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'relative inline-flex items-center rounded-sm',
        'px-2 py-1 text-sm font-medium tracking-tight',
        'transition-colors duration-200 ease-out-quart',
        'text-steel-200 hover:text-steel-100',
        'aria-[current=page]:text-cyan-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
