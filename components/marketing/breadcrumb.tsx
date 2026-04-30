import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface BreadcrumbItem {
  label: string;
  /** When omitted (or on the last item), the entry renders as static text. */
  href?: string;
}

interface BreadcrumbProps {
  items: ReadonlyArray<BreadcrumbItem>;
  className?: string;
}

/**
 * Breadcrumb — small mono trail used on pages that live more than one
 * level deep (PAGE_BLUEPRINTS §15 — "breadcrumbs on every page deeper
 * than one level").
 *
 * The last item is always rendered as the current page (`aria-current`),
 * even if a href was supplied — guards against accidental self-links.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('w-full', className)}
    >
      <ol className="text-steel-400 flex flex-wrap items-center gap-1 font-mono text-[11px] tracking-[0.18em] uppercase">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 ? (
                <ChevronRight
                  aria-hidden
                  className="text-steel-600 h-3 w-3"
                />
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-steel-200 focus-visible:ring-cyan-400 focus-visible:ring-offset-bg-base rounded-sm transition-colors duration-200 ease-out-quart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={isLast ? 'text-steel-200' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
