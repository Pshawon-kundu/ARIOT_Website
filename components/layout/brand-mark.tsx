import { BrandLogo } from './brand-logo';
import { cn } from '@/lib/utils/cn';

interface BrandMarkProps {
  /** Sizing classes forwarded to the logo (width-driven). */
  logoClassName?: string;
  /** Wrapper classes (gap, alignment). */
  className?: string;
}

/**
 * BrandMark — the official ARIoT Technologies full logo, placed identically in
 * the header, footer, and mobile drawer so the lockup stays consistent
 * everywhere (DESIGN_SYSTEM §brand). The image carries the accessible name;
 * the parent link may still add its own aria-label.
 */
export function BrandMark({ logoClassName, className }: BrandMarkProps) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      <BrandLogo className={logoClassName} alt="ARIoT Technologies" />
    </span>
  );
}
