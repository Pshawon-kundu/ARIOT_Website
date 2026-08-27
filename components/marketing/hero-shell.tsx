import type { HTMLAttributes } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

type HeroShellProps = HTMLAttributes<HTMLDivElement>;

/**
 * HeroShell — full-bleed cinematic background for the page hero.
 *
 * Layers (back-to-front):
 *   1. Seedream hero still image (priority-loaded for LCP)
 *   2. Cyan radial vignette at top (signal cue)
 *   3. Deep base-fade at the bottom (hands content off to the next section)
 *   4. Faint grid texture, masked to a soft ellipse (engineering-blueprint feel)
 *   5. Children — supplied by the caller
 *
 * Assets from step 1.13.1 — Seedream/Seedance hero media. See
 * AI_ASSET_PIPELINE §6.1 for naming + storage convention.
 *
 * No 3D. No infinite background animation.
 */
export function HeroShell({ className, children, ...props }: HeroShellProps) {
  return (
    <div className={cn('relative isolate overflow-hidden', className)} {...props}>
      {/* Seedream hero still — priority-loaded as LCP candidate */}
      <Image
        src="/media/home/home-hero-cinematic-arm-01-21x9.svg"
        alt=""
        role="presentation"
        fill
        priority
        className="pointer-events-none -z-30 object-cover opacity-55"
        sizes="100vw"
      />

      {/* Soft left-to-right white scrim so the hero copy stays legible over
          the cinematic still without flattening the robotics visual. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background:
            'linear-gradient(90deg, var(--bg-base) 0%, rgba(255,255,255,0.65) 38%, transparent 62%), linear-gradient(180deg, transparent 55%, var(--bg-base) 100%)',
        }}
      />
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
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(var(--bg-grid) 1px, transparent 1px), linear-gradient(90deg, var(--bg-grid) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at center, #000 45%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 45%, transparent 80%)',
        }}
      />
      {/* ARIoT symbol watermark — large, very low opacity, part of the brand
          architecture behind the hero visual (DESIGN_SYSTEM §brand). */}
      <Image
        src="/media/brand/ariot-logo-symbol.png"
        alt=""
        aria-hidden
        width={1335}
        height={1194}
        className="pointer-events-none absolute top-1/2 left-1/2 -z-20 w-[60vw] max-w-[680px] -translate-x-1/2 -translate-y-1/2 opacity-[0.04] select-none"
      />
      {/* Brushed-metal hairline at the base of the hero */}
      <span
        aria-hidden
        className="via-steel-600/50 pointer-events-none absolute inset-x-0 bottom-0 z-0 h-px bg-gradient-to-r from-transparent to-transparent"
      />
      {children}
    </div>
  );
}
