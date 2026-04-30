import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface Metric {
  /** Display value. Often a bracketed placeholder like `[X+]` until real
   *  numbers exist (CONTENT_STRATEGY §3.1). */
  value: ReactNode;
  /** Short label below the value. */
  label: string;
}

interface MetricBandProps {
  metrics: ReadonlyArray<Metric>;
  className?: string;
}

/**
 * MetricBand — 3–6 large monospace digits with cyan accents.
 *
 * Description list semantics keep the value/label relationship explicit
 * for assistive technology: <dd> for the number, <dt> for the label.
 * The `flex-col-reverse` trick keeps the visual order (value above
 * label) without changing the document order (label, then value).
 */
export function MetricBand({ metrics, className }: MetricBandProps) {
  return (
    <dl
      className={cn(
        'grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 sm:gap-x-10',
        className,
      )}
    >
      {metrics.map((metric) => (
        <div key={metric.label} className="flex flex-col-reverse gap-2">
          <dt className="text-steel-400 font-mono text-[11px] tracking-[0.18em] uppercase">
            {metric.label}
          </dt>
          <dd className="text-cyan-400 font-display text-4xl font-semibold tracking-tight tabular-nums md:text-5xl">
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
