'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';

interface RevealProps extends HTMLMotionProps<'div'> {
  /** Stagger delay in seconds (precision, not entertainment). */
  delay?: number;
  /** Travel distance in px for the y-translate reveal. */
  y?: number;
}

/**
 * Reveal — precision scroll-reveal wrapper.
 *
 * Fades + lifts children into place once, when scrolled into view, using the
 * project's out-expo easing token. Honors `prefers-reduced-motion` by
 * collapsing to an instant, motionless appearance (AGENTS.md §7).
 *
 * Keep usage sparse: section headers, cards, metric rows, CTA bands. Do not
 * wrap every paragraph — restraint is the point.
 */
export function Reveal({ delay = 0, y = 16, children, ...props }: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    const { className } = props;
    return <div className={className}>{children as ReactNode}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.19, 1, 0.22, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
