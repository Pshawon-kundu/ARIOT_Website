import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Use the wide container (90rem / 1440px). Reserve for hero/marketing
   *  sections that intentionally bleed wider than primary content. */
  wide?: boolean;
}

/**
 * Container — horizontal layout boundary with token-driven gutters.
 * Default max-width: 80rem (1280px). Wide max-width: 90rem (1440px).
 * See DESIGN_SYSTEM §4.1.
 */
export function Container({ className, wide = false, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-6 sm:px-8 lg:px-10',
        wide ? 'max-w-[90rem]' : 'max-w-[80rem]',
        className,
      )}
      {...props}
    />
  );
}
