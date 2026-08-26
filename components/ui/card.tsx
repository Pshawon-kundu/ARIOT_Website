import { cva, type VariantProps } from 'class-variance-authority';
import type { CSSProperties, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Card — premium surface in two flavors per DESIGN_SYSTEM §7:
 *   - steel (default) — bg-raised + steel-700 border + inset highlight.
 *   - glass            — gradient + backdrop-blur, used sparingly for hero
 *                        panels and feature highlights.
 *
 * The "holo" flavor described in DESIGN_SYSTEM §7.3 is reserved for product
 * showcases and lands with the catalog work in a later sub-turn.
 */
const cardVariants = cva(
  'relative overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-brand-orange before:to-transparent before:opacity-0 before:transition-opacity duration-200',
  {
    variants: {
      variant: {
        steel: 'bg-bg-raised border border-steel-700 rounded-lg shadow-1',
        glass: 'glass-panel-strong rounded-xl',
      },
      interactive: {
        true: 'group transition-shadow transition-transform duration-200 ease-out-quart hover:-translate-y-0.5 hover:shadow-2 hover:border-steel-600 group-hover:before:opacity-100',
        false: '',
      },
    },
    defaultVariants: { variant: 'steel', interactive: false },
  },
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, variant, interactive, style, ...props }: CardProps) {
  // Glass uses the shared .glass-panel-strong CSS class (see globals.css) rather
  // than an inline background so backdrop-filter works correctly without needing
  // the gradient-glass variable, which is now redundant for the glass card.
  const resolvedStyle: CSSProperties | undefined = variant === 'glass' ? style : style;

  return (
    <div
      className={cn(cardVariants({ variant, interactive }), className)}
      style={resolvedStyle}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 px-6 pt-6 pb-4', className)} {...props} />;
}

export function CardTitle({
  as: Comp = 'h3',
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }) {
  return (
    <Comp
      className={cn('font-display text-steel-100 text-xl font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-steel-300 text-sm', className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pb-6', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('border-steel-800 flex items-center gap-3 border-t px-6 pt-4 pb-6', className)}
      {...props}
    />
  );
}

export { cardVariants };
