import Link from 'next/link';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/card';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils/cn';

interface FeatureCardProps {
  /** Optional Lucide icon rendered in a cyan-tinted square. */
  icon?: LucideIcon;
  /** Optional small caption above the title (e.g. category label). */
  eyebrow?: string;
  title: string;
  description: string;
  /** When provided, the card becomes a clickable Link with a subtle
   *  hover-lift and an arrow chip. */
  href?: string;
  /** CTA microcopy when href is set. Defaults to "Learn more". */
  cta?: string;
  /** Spec or attribute chips rendered as a mono pill row. */
  chips?: ReadonlyArray<string>;
  /** Visual flavor — defaults to steel; use 'glass' on hero-adjacent rows. */
  variant?: 'steel' | 'glass';
  /** Optional stagger index for precision scroll-reveal (max sensible: 6). */
  index?: number;
  className?: string;
}

/**
 * FeatureCard — the universal marketing card.
 *
 * Used by:
 *   - product showcase grids
 *   - solutions grids
 *   - engineering-capability grids
 *   - blog/innovation teaser grids
 *
 * The whole card is a single click target when `href` is set
 * (PAGE_BLUEPRINTS §1 + §3 hover lift + cyan ring guidance).
 */
export function FeatureCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  href,
  cta = 'Learn more',
  chips,
  variant = 'steel',
  index,
  className,
}: FeatureCardProps) {
  const interactive = Boolean(href);
  const inner = (
    <Card variant={variant} interactive={interactive} className={cn('h-full', className)}>
      <CardBody className="flex h-full flex-col gap-4 p-6">
        {Icon ? (
          <span
            aria-hidden
            className="bg-cyan-faint inline-flex h-11 w-11 items-center justify-center rounded-lg border-cyan-400/20 text-cyan-400 ring-1 ring-cyan-400/10 ring-inset"
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
        {eyebrow ? (
          <span className="font-mono text-[11px] tracking-[0.18em] text-cyan-400 uppercase">
            {eyebrow}
          </span>
        ) : null}
        <h3 className="text-steel-100 font-display text-xl font-semibold tracking-tight">
          {title}
        </h3>
        <p className="text-steel-300 text-sm">{description}</p>
        {chips?.length ? (
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <li
                key={chip}
                className="border-steel-700 bg-bg-elevated text-steel-300 rounded-sm border px-2 py-0.5 font-mono text-[11px]"
              >
                {chip}
              </li>
            ))}
          </ul>
        ) : null}
        {href ? (
          <span className="ease-out-quart mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-cyan-400 transition-colors duration-200 group-hover:text-cyan-300">
            {cta}
            <ArrowUpRight className="ease-out-quart h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        ) : null}
      </CardBody>
    </Card>
  );

  const reveal = (
    <Reveal delay={index ? Math.min(index, 6) * 0.06 : 0} className="h-full">
      {inner}
    </Reveal>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group focus-visible:ring-offset-bg-base block h-full rounded-lg focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {reveal}
      </Link>
    );
  }
  return reveal;
}
