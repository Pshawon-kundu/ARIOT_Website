import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type HeroShellProps = HTMLAttributes<HTMLDivElement>;

/**
 * HeroShell — full-bleed cinematic background for the page hero.
 *
 * Layers (back-to-front):
 *   1. Cyan radial vignette at top (signal cue)
 *   2. Deep base-fade at the bottom (hands content off to the next section)
 *   3. Faint grid texture, masked to a soft ellipse (engineering-blueprint feel)
 *   4. Children — supplied by the caller
 *
 * No raster assets ship here. When Seedream/Seedance hero media lands,
 * an additional <Image>/<video> layer can slot in beneath the children.
 * (See AI_ASSET_PIPELINE §6.1 for naming + storage convention.)
 *
 * No 3D. No infinite background animation.
 */
export function HeroShell({ className, children, ...props }: HeroShellProps) {
  return (
    <div
      className={cn('relative isolate overflow-hidden', className)}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, var(--cyan-faint) 0%, transparent 60%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, var(--bg-base) 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(var(--bg-grid) 1px, transparent 1px), linear-gradient(90deg, var(--bg-grid) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse at center, #000 45%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, #000 45%, transparent 80%)',
        }}
      />
      {children}
    </div>
  );
}
