import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface FeatureStackItem {
  /** Cyan-mono caption above the row title. */
  eyebrow?: string;
  /** Row title. Renders as a real <h3> under the parent <section>'s <h2>. */
  title: string;
  /** Body copy for the row. */
  description: string;
  /** Optional CTA link target. */
  href?: string;
  /** Optional CTA microcopy. Defaults to "Learn more". */
  cta?: string;
  /** Optional spec/attribute chips. */
  chips?: ReadonlyArray<string>;
  /** Optional alt text for the media tile. Falls back to title. */
  mediaAlt?: string;
}

interface FeatureStackProps {
  items: ReadonlyArray<FeatureStackItem>;
  className?: string;
}

/**
 * FeatureStack — alternating image/text rows.
 * Used for hero-adjacent capability storytelling
 * (DESIGN_SYSTEM §9.1, PAGE_BLUEPRINTS §1.3).
 *
 * The media tile is a token-driven placeholder until Seedream assets ship
 * (AI_ASSET_PIPELINE §3.1). Drop-in replacement: swap <FeatureMedia /> for
 * a real <Image> or <video> when assets are ready.
 *
 * Even-indexed rows render media-right; odd rows render media-left.
 */
export function FeatureStack({ items, className }: FeatureStackProps) {
  return (
    <div className={cn('flex flex-col gap-16 md:gap-24', className)}>
      {items.map((item, index) => (
        <FeatureStackRow
          key={item.title}
          item={item}
          reversed={index % 2 === 1}
        />
      ))}
    </div>
  );
}

function FeatureStackRow({
  item,
  reversed,
}: {
  item: FeatureStackItem;
  reversed: boolean;
}) {
  return (
    <article className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-12">
      <div
        className={cn(
          'flex flex-col gap-4 md:col-span-5',
          reversed ? 'md:order-2 md:col-start-8' : 'md:order-1',
        )}
      >
        {item.eyebrow ? (
          <span className="text-cyan-400 font-mono text-[11px] tracking-[0.18em] uppercase">
            {item.eyebrow}
          </span>
        ) : null}
        <h3 className="text-steel-100 font-display text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">
          {item.title}
        </h3>
        <p className="text-steel-300 text-base md:text-lg">
          {item.description}
        </p>
        {item.chips?.length ? (
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {item.chips.map((chip) => (
              <li
                key={chip}
                className="border-steel-700 bg-bg-elevated text-steel-200 rounded-sm border px-2 py-0.5 font-mono text-[11px]"
              >
                {chip}
              </li>
            ))}
          </ul>
        ) : null}
        {item.href ? (
          <Link
            href={item.href}
            className="text-cyan-400 focus-visible:ring-cyan-400 focus-visible:ring-offset-bg-base mt-2 inline-flex w-fit items-center gap-1 rounded-sm text-sm font-medium transition-colors duration-200 ease-out-quart hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            {item.cta ?? 'Learn more'}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
      <div
        className={cn(
          'md:col-span-7',
          reversed ? 'md:order-1 md:col-start-1' : 'md:order-2',
        )}
      >
        <FeatureMedia alt={item.mediaAlt ?? item.title} />
      </div>
    </article>
  );
}

function FeatureMedia({ alt }: { alt: string }) {
  return (
    <div
      role="img"
      aria-label={alt}
      className="border-steel-700 bg-bg-raised shadow-inset relative aspect-[16/10] w-full overflow-hidden rounded-xl border"
    >
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, var(--cyan-faint) 0%, transparent 60%)',
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'linear-gradient(var(--bg-grid) 1px, transparent 1px), linear-gradient(90deg, var(--bg-grid) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage:
            'radial-gradient(ellipse at center, #000 50%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, #000 50%, transparent 100%)',
        }}
      />
      <span className="text-steel-500 absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.18em] uppercase">
        [SEEDREAM PLACEHOLDER]
      </span>
    </div>
  );
}
