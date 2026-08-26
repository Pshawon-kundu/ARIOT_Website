import type { ReactNode } from 'react';
import { Eyebrow } from './eyebrow';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils/cn';

interface SectionHeaderProps {
  /** Cyan-mono caption above the title. */
  eyebrow?: string;
  /** Section title. Renders as a real <h2> for landmark order. */
  title: ReactNode;
  /** Optional subhead body copy. */
  subhead?: ReactNode;
  /** Visual alignment. Most marketing sections use 'left'; CTA bands and
   *  centered hero copy use 'center'. */
  align?: 'left' | 'center';
  /** Adjust the title scale: `default` for in-page sections, `compact` for
   *  tighter sections like the metric band. */
  size?: 'default' | 'compact';
  className?: string;
}

/**
 * SectionHeader — eyebrow + title + subhead. Every public section uses
 * this so visual rhythm and heading hierarchy stay consistent
 * (DESIGN_SYSTEM §9, PAGE_BLUEPRINTS §1).
 */
export function SectionHeader({
  eyebrow,
  title,
  subhead,
  align = 'left',
  size = 'default',
  className,
}: SectionHeaderProps) {
  const titleClass =
    size === 'compact'
      ? 'font-display text-2xl font-semibold tracking-tight text-balance text-steel-100 sm:text-3xl md:text-4xl'
      : 'font-display text-3xl font-semibold tracking-tight text-balance text-steel-100 sm:text-4xl md:text-5xl';

  return (
    <Reveal>
      <header
        className={cn(
          'flex max-w-3xl flex-col gap-4',
          align === 'center' && 'mx-auto items-center text-center',
          className,
        )}
      >
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 className={titleClass}>{title}</h2>
        {subhead ? (
          <p
            className={cn(
              'text-steel-300 max-w-2xl text-base sm:text-lg',
              align === 'center' && 'mx-auto',
            )}
          >
            {subhead}
          </p>
        ) : null}
      </header>
    </Reveal>
  );
}
