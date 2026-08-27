import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface BrandLogoProps {
  /** Display width classes (height is derived from the asset aspect ratio). */
  className?: string;
  /** Eager-load (LCP). Set only on the primary above-the-fold header mark. */
  priority?: boolean;
  /** Alt text. Defaults to the official brand name. */
  alt?: string;
  /** Hide from assistive tech when surrounding text supplies the name. */
  ariaHidden?: boolean;
}

/**
 * BrandLogo — the official ARIoT Technologies full logo (horizontal lockup),
 * served from the tightly-cropped transparent brand asset.
 *
 * The source asset already contains the official navy + orange lockup, so we
 * render it as-is and never recreate the wordmark typography (DESIGN_SYSTEM
 * §brand). Intrinsic width/height match the cropped PNG so the browser reserves
 * the correct box and there is zero layout shift.
 *
 * Sizing is width-driven (height auto) so the logo fills its visual area
 * instead of being letterboxed inside a tiny square — the previous square
 * render made the mark look tiny because of the source's surrounding whitespace.
 */
export function BrandLogo({
  className,
  priority = false,
  alt = 'ARIoT Technologies',
  ariaHidden = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/media/brand/ariot-logo-full.png"
      alt={alt}
      aria-hidden={ariaHidden || undefined}
      width={4259}
      height={1194}
      priority={priority}
      className={cn('h-auto w-[150px] md:w-[184px]', className)}
    />
  );
}
