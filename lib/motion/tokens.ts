import { duration, easing } from '@/lib/design-tokens';

/**
 * Motion-compatible easing + duration tokens.
 *
 * Use these instead of inline cubic-bezier or magic-number durations.
 * Always pair with a `prefers-reduced-motion` fallback at the component
 * level — the global CSS reset shrinks animation duration to 0.01ms when
 * the user requests reduced motion, but components should still avoid
 * essential meaning being conveyed only through motion.
 *
 * Example:
 *   import { motion } from 'motion/react';
 *   import { transitions } from '@/lib/motion/tokens';
 *   <motion.div
 *     initial={{ opacity: 0, y: 16 }}
 *     animate={{ opacity: 1, y: 0 }}
 *     transition={transitions.sectionReveal}
 *   />
 */

export const transitions = {
  hover: { duration: duration.d2, ease: easing.outQuart },
  ui: { duration: duration.d2, ease: easing.outQuart },
  drawer: { duration: duration.d3, ease: easing.outQuart },
  sectionReveal: { duration: duration.d4, ease: easing.outExpo },
  heroEntry: { duration: duration.d5, ease: easing.outExpo },
  cinematic: { duration: duration.d6, ease: easing.outExpo },
} as const;

/**
 * Stagger intervals for grouped children. Cap at 6 children (per
 * `docs/DESIGN_SYSTEM.md` §11.4) — beyond that the effect feels
 * gimmicky and slows perceived load.
 */
export const stagger = {
  tight: 0.04,
  default: 0.06,
  loose: 0.1,
} as const;

/**
 * Common variants library for section-level reveals. Keep these in one
 * place so motion reads as a coherent grammar across the site.
 */
export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
} as const;

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
} as const;

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
} as const;
