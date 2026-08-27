'use client';

import { motion } from 'motion/react';

const STEPS = [
  { id: '01', label: 'Introduction' },
  { id: '02', label: 'CleanBot & line' },
  { id: '03', label: 'R&D systems' },
  { id: '04', label: 'Get involved' },
] as const;

/**
 * HeroStepIndicator — vertical numbered rail shown to the left of the hero copy.
 *
 * Static, decorative (aria-hidden). The active index is driven by scroll
 * position on the real page later; for the hero it is fixed to 0 (Introduction).
 * Active step reads in ARIOT orange, the rest in muted steel.
 */
export function HeroStepIndicator({ active = 0 }: { active?: number }) {
  return (
    <div className="hidden flex-col lg:flex" aria-hidden>
      {STEPS.map((s, i) => {
        const isActive = i === active;
        return (
          <div key={s.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`font-mono text-[10px] tracking-[0.2em] transition-colors duration-300 ${
                  isActive ? 'text-brand-orange' : 'text-steel-400'
                }`}
              >
                {s.id}
              </span>
              <motion.span
                className={`mt-1 h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                  isActive ? 'bg-brand-orange' : 'bg-steel-300'
                }`}
              />
              {i < STEPS.length - 1 ? (
                <span
                  className={`my-1 w-px transition-colors duration-300 ${
                    isActive ? 'bg-brand-orange/50' : 'bg-steel-200'
                  }`}
                  style={{ height: '2.25rem' }}
                />
              ) : null}
            </div>
            <span
              className={`font-mono text-[10px] tracking-[0.16em] uppercase transition-colors duration-300 ${
                isActive ? 'text-steel-200' : 'text-steel-400'
              }`}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
