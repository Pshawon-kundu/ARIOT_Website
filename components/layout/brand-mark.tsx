import { BrandLogo } from './brand-logo';
import { cn } from '@/lib/utils/cn';

interface BrandMarkProps {
  /** Size of the zoomed logo symbol. Defaults to a prominent header scale. */
  logoClassName?: string;
  /** Wrapper classes (gap, alignment). */
  className?: string;
}

/**
 * BrandMark — zoomed ARIOT symbol + two-tone wordmark.
 *
 * `AR` renders in charcoal (steel-100); `IOT` in the restrained ARIOT cyan.
 * Used as the single source of brand placement in the header, footer, and
 * mobile drawer so the lockup stays identical everywhere (DESIGN_SYSTEM §brand).
 *
 * The image is decorative (aria-hidden, alt="") because the visible wordmark
 * and the parent link's aria-label carry the accessible name.
 */
export function BrandMark({ logoClassName, className }: BrandMarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <BrandLogo className={logoClassName} alt="" ariaHidden />
      <span
        aria-hidden
        className="font-display text-xl font-semibold tracking-tight text-balance md:text-2xl"
      >
        <span className="text-steel-100">AR</span>
        <span className="text-cyan-400">IOT</span>
      </span>
    </span>
  );
}
