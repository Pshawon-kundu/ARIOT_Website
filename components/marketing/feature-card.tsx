import Link from 'next/link';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/card';
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
  className,
}: FeatureCardProps) {
  const interactive = Boolean(href);
  const inner = (
    <Card
      variant={variant}
      interactive={interactive}
      className={cn('h-full', className)}
    >
      <CardBody className="flex h-full flex-col gap-4 p-6">
        {Icon ? (
          <span
            aria-hidden
            className="bg-cyan-faint text-cyan-400 inline-flex h-10 w-10 items-center justify-center rounded-md"
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
        {eyebrow ? (
          <span className="text-steel-400 font-mono text-[11px] tracking-[0.18em] uppercase">
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
                className="border-steel-700 bg-bg-elevated text-steel-200 rounded-sm border px-2 py-0.5 font-mono text-[11px]"
              >
                {chip}
              </li>
            ))}
          </ul>
        ) : null}
        {href ? (
          <span className="text-cyan-400 mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium transition-colors duration-200 ease-out-quart group-hover:text-cyan-300">
            {cta}
            <ArrowUpRight className="h-4 w-4" />
          </span>
        ) : null}
      </CardBody>
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group focus-visible:ring-cyan-400 focus-visible:ring-offset-bg-base block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}
