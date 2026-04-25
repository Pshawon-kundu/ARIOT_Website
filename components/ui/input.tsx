import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

/**
 * Input — token-styled native <input>.
 * Designed to be wrapped by react-hook-form `register` in Sub-turn 5.
 * `aria-invalid="true"` triggers the danger styling so form libraries
 * just need to set that attribute.
 */
export function Input({ className, type = 'text', ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md',
        'bg-bg-elevated border border-steel-700 text-steel-100',
        'px-3 py-2 text-base',
        'placeholder:text-steel-400',
        'transition-colors duration-200 ease-out-quart',
        'focus-visible:outline-none focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-faint',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'aria-[invalid=true]:border-danger',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-steel-100',
        className,
      )}
      {...props}
    />
  );
}
