import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type EyebrowProps = HTMLAttributes<HTMLSpanElement>;

/**
 * Eyebrow — small caption-cyan label that sits above every section title.
 * 2–4 word ALL-CAPS in JetBrains Mono, cyan-400, wide letter-spacing
 * (DESIGN_SYSTEM §3.3 + §9 + CONTENT_STRATEGY §3.1).
 */
export function Eyebrow({ className, children, ...props }: EyebrowProps) {
  return (
    <span
      className={cn(
        'text-cyan-400 inline-block font-mono text-[12px] font-medium tracking-[0.18em] uppercase',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
