import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils/cn';

interface LogoStripItem {
  /** Visible label. Today this is text-only (capability/partner name).
   *  When real partner logos ship, an optional `logoSrc` + `logoAlt` will
   *  swap in via <Image>. */
  label: string;
}

interface LogoStripProps {
  /** Cyan-mono caption above the row (optional). */
  eyebrow?: string;
  items: ReadonlyArray<LogoStripItem>;
  className?: string;
}

/**
 * LogoStrip — horizontal row of partner names, certifications, or
 * capability tags.
 *
 * DESIGN_SYSTEM §9.1: 60% opacity by default, lifts to 100% on hover.
 * Today renders text-only because we have no real partner logos cleared
 * to ship; the structure is identical so a future PR can drop in real
 * SVG/PNG marks without changing call sites.
 */
export function LogoStrip({ eyebrow, items, className }: LogoStripProps) {
  return (
    <Reveal>
      <div className={cn('flex flex-col items-center gap-6', className)}>
        {eyebrow ? (
          <p className="text-steel-400 font-mono text-[11px] tracking-[0.18em] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-12">
          {items.map((item) => (
            <li
              key={item.label}
              className="text-steel-300 hover:text-steel-100 ease-out-quart font-mono text-[12px] tracking-[0.18em] uppercase opacity-70 transition-[color,opacity] duration-200 hover:opacity-100"
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
