import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Composes Tailwind class names safely.
 *
 * `clsx` handles conditional logic; `twMerge` resolves Tailwind utility
 * conflicts (e.g. `px-2 px-4` collapses to `px-4`).
 *
 * Use this in every component that accepts a `className` prop.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
