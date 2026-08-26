import { BrandLogo } from './brand-logo';
import { cn } from '@/lib/utils/cn';

interface BrandMarkProps {
  /** Display height of the official full ARIOT logo. */
  logoClassName?: string;
  /** Wrapper classes (gap, alignment). */
  className?: string;
}

/**
 * BrandMark — the official ARIOT full logo, placed identically in the header,
 * footer, and mobile drawer so the lockup stays consistent everywhere
 * (DESIGN_SYSTEM §brand). The source asset already contains the official
 * navy + orange lockup, so we render it as-is and never recreate the
 * wordmark typography.
 *
 * The image carries the accessible name (alt="ARIOT"); the parent link may
 * still add its own aria-label.
 */
export function BrandMark({ logoClassName, className }: BrandMarkProps) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      <BrandLogo className={cn('h-9 w-auto md:h-10', logoClassName)} alt="ARIOT" />
    </span>
  );
}
