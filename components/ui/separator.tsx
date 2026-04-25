import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  /** Mark as decorative when the separator carries no semantic meaning
   *  (most cases). When false, role="separator" is announced by AT. */
  decorative?: boolean;
}

/**
 * Separator — token-driven divider line. Hairline thin (1px) by default
 * with steel-800 to read as the quietest possible boundary, per
 * DESIGN_SYSTEM §5.
 */
export function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <div
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        'bg-steel-800 shrink-0',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  );
}
