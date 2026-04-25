import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Button — primitive in three voices and four sizes.
 *
 * Variants follow DESIGN_SYSTEM §6:
 *   - primary  — cyan signal, the page's strongest call-to-action
 *   - secondary — steel ghost, used alongside a primary
 *   - ghost    — transparent, low-visual-weight (icon buttons, toolbars)
 *   - subtle   — filled steel, used inside cards and dense UIs
 *   - danger   — destructive intent (destroy, cancel-final, delete)
 *   - link     — inline cyan text link
 *
 * `asChild` swaps the rendered element for the consumer's child via
 * Radix Slot, so a Next.js `<Link>` can carry button styling without
 * losing client-side navigation.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-md',
    'font-medium tracking-tight whitespace-nowrap',
    'transition-colors duration-200 ease-out-quart',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
    'disabled:pointer-events-none disabled:opacity-40',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-cyan-400 text-bg-base hover:bg-cyan-300 active:bg-cyan-500',
        secondary:
          'bg-transparent text-steel-100 border border-steel-600 hover:bg-bg-elevated hover:border-steel-500 active:bg-bg-raised',
        ghost:
          'bg-transparent text-steel-200 hover:text-steel-100 hover:bg-bg-elevated',
        subtle:
          'bg-bg-elevated text-steel-100 border border-steel-800 hover:bg-bg-raised hover:border-steel-700',
        danger:
          'bg-danger text-bg-base hover:opacity-90 active:opacity-80',
        link:
          'bg-transparent text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-5 text-lg',
        xl: 'h-14 px-6 text-lg',
      },
    },
    compoundVariants: [
      // The link variant ignores h/px from sizes — text size is the only
      // meaningful dimension for an inline link.
      { variant: 'link', class: 'h-auto px-0' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  // Default `type="button"` to avoid accidental form submits when the
  // button is used inside a <form>. Consumers can override.
  const resolvedType = asChild ? undefined : (type ?? 'button');

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      type={resolvedType}
      {...props}
    />
  );
}

export { buttonVariants };
