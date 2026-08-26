import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface BrandLogoProps {
  /** Display height/width of the square logo mark. Defaults to h-8 w-8 (32px). */
  className?: string;
  /** Eager-load (LCP). Set only on the primary above-the-fold header mark. */
  priority?: boolean;
  /** Alt text. Pass alt="" + ariaHidden when the wordmark text supplies the name. */
  alt?: string;
  /** Hide from assistive tech when a visible wordmark provides the name. */
  ariaHidden?: boolean;
}

/**
 * BrandLogo — the ARIOT symbol mark, served from the brand asset folder.
 *
 * Centralized so the header, footer, and mobile drawer all place the same
 * mark with identical sizing/alt semantics (DESIGN_SYSTEM §brand). The source
 * is a square mark; we render it as a contained square so it never distorts.
 */
export function BrandLogo({
  className,
  priority = false,
  alt = 'ARIOT',
  ariaHidden = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/media/brand/ariot-logo-full-01.jpg"
      alt={alt}
      aria-hidden={ariaHidden || undefined}
      width={4500}
      height={4500}
      priority={priority}
      className={cn('h-8 w-8 object-contain', className)}
    />
  );
}
