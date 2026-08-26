import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Background canvas. Alternates between base and raised maintain the
   *  page rhythm called for in DESIGN_SYSTEM §4.2 (no two raised in a row).
   *  `navy` is a deep ARIOT-navy contrast section (light text on navy). */
  bg?: 'base' | 'raised' | 'navy';
  /** Vertical padding scale. */
  spacing?: 'compact' | 'default' | 'loose';
}

const bgMap = {
  base: 'bg-bg-base',
  raised: 'bg-bg-raised',
  navy: 'bg-brand-navy tone-navy',
} as const;

const spacingMap = {
  compact: 'py-12 md:py-16',
  default: 'py-16 md:py-24',
  loose: 'py-20 md:py-32',
} as const;

/**
 * Section — vertical-padding wrapper for top-level page sections.
 * Always pair with <Container> inside for horizontal alignment.
 */
export function Section({ className, bg = 'base', spacing = 'default', ...props }: SectionProps) {
  return <section className={cn(bgMap[bg], spacingMap[spacing], className)} {...props} />;
}
