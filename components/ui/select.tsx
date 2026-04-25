import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

/**
 * Select — native <select> with a custom chevron and our token styling.
 *
 * We deliberately use the native control here:
 *   - Zero JS shipped (server-component-friendly).
 *   - Ships full keyboard, screen-reader, and mobile-OS support for free.
 *   - Custom Radix-based combobox can be introduced later if/when filter
 *     UX justifies it (catalog filters, multi-select).
 */
export function Select({
  className,
  children,
  disabled,
  ...props
}: SelectProps) {
  return (
    <div className="relative">
      <select
        disabled={disabled}
        className={cn(
          'flex h-10 w-full appearance-none rounded-md',
          'bg-bg-elevated border border-steel-700 text-steel-100',
          'pl-3 pr-10 py-2 text-base',
          'transition-colors duration-200 ease-out-quart',
          'focus-visible:outline-none focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-faint',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'aria-[invalid=true]:border-danger',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className={cn(
          'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4',
          disabled ? 'text-steel-500' : 'text-steel-400',
        )}
      />
    </div>
  );
}
