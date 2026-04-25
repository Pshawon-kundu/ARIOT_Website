import type { LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Render the cyan required-dot after the label text. */
  required?: boolean;
}

/**
 * Label — form label with optional cyan required indicator.
 * Pair with <FormField> for full label + helper + error wiring.
 */
export function Label({
  className,
  required = false,
  children,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-1 text-sm font-medium text-steel-200',
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span aria-hidden className="text-cyan-400">
          *
        </span>
      ) : null}
    </label>
  );
}
