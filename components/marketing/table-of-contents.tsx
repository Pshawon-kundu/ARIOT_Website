'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TocItem {
  id: string;
  text: string;
}

interface TableOfContentsProps {
  items: ReadonlyArray<TocItem>;
  className?: string;
}

/**
 * TableOfContents — sticky sidebar TOC for blog posts and support articles.
 *
 * - Desktop: sticky sidebar that scrolls alongside content
 * - Mobile: collapsible panel (hidden by default)
 * - Active section: tracked via IntersectionObserver on h2 elements
 *   (scroll-mt-28 on headings ensures the active state fires at the right
 *   scroll position, accounting for the sticky header height)
 *
 * Renders nothing if `items` is empty.
 */
export function TableOfContents({ items, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    // Collect all heading elements by ID
    const headingIds = items.map((item) => item.id);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Pick the topmost heading that is currently intersecting
        const intersecting = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (intersecting.length > 0 && intersecting[0]) {
          setActiveId(intersecting[0].target.id);
        }
      },
      {
        // Fire when the heading enters the top ~25% of the viewport
        rootMargin: '-10% 0% -70% 0%',
        threshold: 0,
      },
    );

    headingIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el && observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className={cn('text-sm', className)}>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-steel-400 hover:text-steel-100 flex w-full items-center justify-between gap-2 font-mono text-[11px] tracking-[0.18em] uppercase transition-colors duration-200 lg:hidden"
        aria-expanded={isOpen}
      >
        On this page
        <ChevronIcon
          className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>

      {/* Desktop heading (always visible) */}
      <p className="text-steel-400 mb-3 hidden font-mono text-[11px] tracking-[0.18em] uppercase lg:block">
        On this page
      </p>

      {/* TOC list */}
      <ol
        className={cn(
          'flex flex-col gap-1 overflow-hidden transition-all duration-300',
          // Mobile: collapsed by default
          isOpen ? 'mt-3 max-h-[400px]' : 'mt-0 max-h-0 lg:max-h-none',
          // Desktop: always visible
          'lg:mt-0 lg:max-h-none',
        )}
      >
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={() => setIsOpen(false)}
              className={cn(
                'ease-out-quart block rounded-sm py-1 pl-3 text-sm transition-colors duration-200',
                'border-l-2',
                activeId === item.id
                  ? 'text-steel-100 border-cyan-400'
                  : 'border-steel-800 text-steel-400 hover:border-steel-600 hover:text-steel-200',
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
