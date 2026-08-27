import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Button — primitive in three voices and four sizes.
 *
 * Variants follow DESIGN_SYSTEM §6:
 *   - primary  — ARIOT orange signal, the page's strongest call-to-action
 *   - secondary — ARIOT navy filled, used alongside a primary
 *   - ghost    — transparent, low-visual-weight (icon buttons, toolbars)
 *   - subtle   — filled steel, used inside cards and dense UIs
 *   - danger   — destructive intent (destroy, cancel-final, delete)
 *   - link     — inline orange text link
 *
 * `asChild` swaps the rendered element for the consumer's child via
 * Radix Slot, so a Next.js `<Link>` can carry button styling without
 * losing client-side navigation.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-md',
    'font-medium tracking-tight whitespace-nowrap',
    'transition-[transform,color,background-color,border-color,box-shadow] duration-200 ease-out-quart',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
    'disabled:pointer-events-none disabled:opacity-40',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-brand-orange text-brand-orange-foreground hover:bg-brand-orange-hover active:bg-[#c24e00] hover:shadow-2',
        navy: 'bg-brand-navy text-brand-navy-foreground hover:bg-brand-orange hover:text-brand-orange-foreground active:bg-[#c24e00] hover:shadow-2',
        secondary:
          'bg-brand-navy text-brand-navy-foreground hover:bg-[#002a63] active:bg-[#00214d] hover:shadow-2',
        ghost: 'bg-transparent text-steel-200 hover:text-steel-100 hover:bg-bg-elevated',
        subtle:
          'bg-bg-elevated text-steel-100 border border-steel-800 hover:bg-bg-raised hover:border-steel-700',
        outline:
          'border border-brand-navy bg-white text-brand-navy hover:bg-bg-raised hover:border-brand-navy active:bg-bg-sunken',
        outlineOrange:
          'border border-brand-orange bg-white text-brand-orange hover:bg-brand-orange/5 hover:border-brand-orange-hover active:bg-brand-orange/10',
        danger: 'bg-danger text-bg-base hover:opacity-90 active:opacity-80',
        link: 'bg-transparent text-brand-orange hover:text-brand-orange-hover underline-offset-4 hover:underline',
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
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, type, ...props }: ButtonProps) {
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
