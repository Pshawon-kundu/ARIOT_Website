import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Textarea — token-styled native <textarea>.
 * Default rows=4 fits most form fields; resize-y lets users grow it.
 */
export function Textarea({ className, rows = 4, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(
        'flex w-full min-h-[6rem] rounded-md resize-y',
        'bg-bg-elevated border border-steel-700 text-steel-100',
        'px-3 py-2 text-base leading-relaxed',
        'placeholder:text-steel-400',
        'transition-colors duration-200 ease-out-quart',
        'focus-visible:outline-none focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-faint',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'aria-[invalid=true]:border-danger',
        className,
      )}
      {...props}
    />
  );
}
