import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Badge — small caption-style chip. Uses mono type and uppercase tracking
 * to read like an engineering label rather than a marketing tag.
 *
 * Variants:
 *   cyan    — accent (default; eyebrows, "new", featured)
 *   steel   — neutral (categories, generic chips)
 *   success | warning | danger — semantic states
 */
const badgeVariants = cva(
  [
    'inline-flex items-center gap-1 rounded-full',
    'px-2.5 py-0.5',
    'font-mono text-[11px] font-medium tracking-[0.04em] uppercase',
    'border',
  ].join(' '),
  {
    variants: {
      variant: {
        cyan: 'bg-cyan-faint text-cyan-300 border-cyan-400/20',
        steel: 'bg-bg-elevated text-steel-200 border-steel-700',
        success: 'bg-success/10 text-success border-success/30',
        warning: 'bg-warning/10 text-warning border-warning/30',
        danger: 'bg-danger/10 text-danger border-danger/30',
      },
    },
    defaultVariants: { variant: 'cyan' },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
