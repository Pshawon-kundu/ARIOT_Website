'use client';

import { motion, useReducedMotion } from 'motion/react';

const CALLOUTS = [
  { id: 'nav', label: 'Autonomous Navigation', cls: 'left-2 top-8', align: 'left' as const },
  { id: 'sense', label: 'Smart Sensing', cls: 'right-2 top-20', align: 'right' as const },
  { id: 'mon', label: 'Real-time Monitoring', cls: 'left-2 bottom-24', align: 'left' as const },
  { id: 'ops', label: 'Intelligent Operations', cls: 'right-2 bottom-10', align: 'right' as const },
];

const EASE = [0.19, 1, 0.22, 1] as const;

function Callout({
  label,
  cls,
  align,
  delay,
}: {
  label: string;
  cls: string;
  align: 'left' | 'right';
  delay: number;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      className={`absolute z-30 hidden items-center gap-2 md:flex ${cls} ${
        align === 'right' ? 'flex-row-reverse' : ''
      }`}
      aria-hidden
    >
      <motion.span
        className="bg-brand-orange h-1.5 w-1.5 rounded-full shadow-[0_0_0_3px_rgba(245,115,35,0.18)]"
        initial={reduce ? { scale: 1 } : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, ease: EASE, delay }}
      />
      <motion.span
        className="bg-brand-orange/70 block h-px w-10"
        style={{ transformOrigin: align === 'right' ? 'right' : 'left' }}
        initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: EASE, delay }}
      />
      <motion.span
        className="text-brand-navy font-mono text-[10px] tracking-[0.16em] whitespace-nowrap uppercase"
        initial={reduce ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay }}
      >
        {label}
      </motion.span>
    </div>
  );
}

/**
 * RobotFeatureCallouts — the small technical labels that sit around the hero
 * robot (Autonomous Navigation, Smart Sensing, Real-time Monitoring, Intelligent
 * Operations). On desktop they are absolutely positioned with an orange line +
 * node reveal; on mobile they collapse to a simple chip row so the small screen
 * never shows a cluttered overlay.
 */
export function RobotFeatureCallouts() {
  return (
    <>
      {CALLOUTS.map((c, i) => (
        <Callout key={c.id} {...c} delay={0.9 + i * 0.12} />
      ))}
      <div className="absolute inset-x-2 bottom-2 z-30 flex flex-wrap justify-center gap-1.5 md:hidden">
        {CALLOUTS.map((c) => (
          <span
            key={c.id}
            className="border-brand-orange/40 text-brand-navy rounded-full border bg-white/70 px-2 py-1 font-mono text-[9px] tracking-[0.14em] uppercase backdrop-blur"
          >
            {c.label}
          </span>
        ))}
      </div>
    </>
  );
}
