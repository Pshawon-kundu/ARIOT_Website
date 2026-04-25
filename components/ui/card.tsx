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
const cardVariants = cva('relative overflow-hidden', {
  variants: {
    variant: {
      steel:
        'bg-bg-raised border border-steel-700 rounded-lg shadow-inset',
      glass:
        'border border-white/[0.06] rounded-xl backdrop-blur-xl shadow-inset',
    },
    interactive: {
      true: 'transition-colors duration-200 ease-out-quart hover:border-steel-600',
      false: '',
    },
  },
  defaultVariants: { variant: 'steel', interactive: false },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({
  className,
  variant,
  interactive,
  style,
  ...props
}: CardProps) {
  // Glass gradient is exposed as a CSS variable in app/globals.css to keep
  // the rgba stops out of components (DESIGN_SYSTEM §7.2).
  const resolvedStyle: CSSProperties | undefined =
    variant === 'glass'
      ? { background: 'var(--gradient-glass)', ...style }
      : style;

  return (
    <div
      className={cn(cardVariants({ variant, interactive }), className)}
      style={resolvedStyle}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 px-6 pt-6 pb-4', className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'font-display text-xl font-semibold tracking-tight text-steel-100',
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-steel-300', className)} {...props} />
  );
}

export function CardBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pb-6', className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-6 pt-4 pb-6 border-t border-steel-800',
        className,
      )}
      {...props}
    />
  );
}

export { cardVariants };
