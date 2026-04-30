import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TimelineItem {
  /** Short kicker label (e.g. "Discover", "2024", "Step 02"). */
  label: string;
  title: string;
  description?: ReactNode;
}

interface TimelineProps {
  items: ReadonlyArray<TimelineItem>;
  /** When true, prepends a zero-padded step counter to the kicker
   *  (e.g. "Step 01 · Discover"). Use on process timelines; leave off
   *  for date-led story timelines. */
  numbered?: boolean;
  className?: string;
}

/**
 * Timeline — vertical timeline with cyan markers (DESIGN_SYSTEM §9.1).
 *
 * Used for:
 *   - Solutions engagement workflow (Discover → Design → Pilot → Deploy → Support)
 *   - About page company story
 *   - Quote-page "What happens next" side panel
 *
 * Pure server component. No motion library; the cyan line is a static
 * border on the left, and step markers are absolutely-positioned dots.
 */
export function Timeline({ items, numbered = false, className }: TimelineProps) {
  return (
    <ol
      className={cn(
        'border-steel-700 relative flex flex-col gap-8 border-l pl-8 md:gap-10',
        className,
      )}
    >
      {items.map((item, index) => (
        <li key={`${item.label}-${index}`} className="relative">
          <span
            aria-hidden
            className="bg-bg-base border-cyan-400 absolute -left-[34px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2"
          >
            <span className="bg-cyan-400 block h-1.5 w-1.5 rounded-full" />
          </span>
          <p className="text-cyan-400 font-mono text-[11px] tracking-[0.18em] uppercase">
            {numbered
              ? `Step ${String(index + 1).padStart(2, '0')} · ${item.label}`
              : item.label}
          </p>
          <h3 className="text-steel-100 mt-1 font-display text-xl font-semibold tracking-tight md:text-2xl">
            {item.title}
          </h3>
          {item.description ? (
            <div className="text-steel-300 mt-2 text-base">
              {item.description}
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
