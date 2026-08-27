'use client';

import { motion, useReducedMotion } from 'motion/react';

const EASE = [0.19, 1, 0.22, 1] as const;

/**
 * HeroTechnicalOrbit — faint decorative orbital diagram behind the hero robot.
 *
 * Thin gray concentric circles + one orange arc that draws itself in after the
 * hero settles. Purely decorative (aria-hidden). Honors reduced motion by
 * rendering the final state immediately.
 */
export function HeroTechnicalOrbit({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" aria-hidden>
      {/* concentric circles */}
      <circle cx="100" cy="100" r="92" stroke="var(--steel-300)" strokeWidth="0.6" opacity="0.45" />
      <circle cx="100" cy="100" r="64" stroke="var(--steel-300)" strokeWidth="0.6" opacity="0.45" />
      <circle cx="100" cy="100" r="38" stroke="var(--steel-300)" strokeWidth="0.6" opacity="0.45" />

      {/* orange arc that draws in */}
      <motion.path
        d="M 100 22 A 78 78 0 1 1 22 100"
        stroke="var(--brand-orange)"
        strokeWidth="1.4"
        strokeLinecap="round"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.9 }}
        opacity="0.9"
      />

      {/* center node — gentle pulse */}
      <motion.circle
        cx="100"
        cy="100"
        r="3"
        fill="var(--brand-orange)"
        animate={reduce ? undefined : { r: [3, 4.5, 3], opacity: [1, 0.6, 1] }}
        transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
      />

      {/* static orbiting nodes */}
      <circle cx="178" cy="100" r="2.2" fill="var(--steel-400)" />
      <circle cx="100" cy="22" r="2.2" fill="var(--steel-400)" />
      <circle cx="36" cy="138" r="2.2" fill="var(--steel-400)" />
    </svg>
  );
}
