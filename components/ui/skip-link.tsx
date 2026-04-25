import { cn } from '@/lib/utils/cn';

interface SkipLinkProps {
  /** Anchor target, defaults to the marketing layout's <main id="main">. */
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * SkipLink — keyboard-only "Skip to main content" anchor.
 * Visually hidden by default; flies into the top-left on focus-visible.
 * Required for WCAG 2.4.1 (Bypass Blocks).
 */
export function SkipLink({
  href = '#main',
  children = 'Skip to main content',
  className,
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only',
        'focus-visible:not-sr-only',
        'focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-50',
        'focus-visible:inline-flex focus-visible:items-center',
        'focus-visible:rounded-md focus-visible:bg-cyan-400',
        'focus-visible:px-4 focus-visible:py-2',
        'focus-visible:text-sm focus-visible:font-medium focus-visible:text-bg-base',
        'focus-visible:shadow-cyan-strong',
        'focus-visible:outline-none',
        className,
      )}
    >
      {children}
    </a>
  );
}
