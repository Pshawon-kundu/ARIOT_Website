'use client';

import { useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { AutonomyVisual } from './autonomy-visual';
import type { FeatureStackItem } from './feature-stack';

const EASE = [0.19, 1, 0.22, 1] as const;
type Emphasis = 'slam' | 'lidar' | 'ros' | null;

/**
 * AutonomyNarrative — the upgraded "01 · NAVIGATION & AUTONOMY" storytelling row.
 *
 * Left column: editorial text reveal (eyebrow line, masked headline words,
 * description, engineering-label tags with hover→sim linkage). Right column: the
 * AutonomyVisual simulation inside a refined white card with a status bar.
 *
 * Scroll-triggered: text reveals once on enter; the sim loops only while ~35%
 * visible and freezes to the final frame under reduced motion or offscreen.
 */
export function AutonomyNarrative({ item }: { item: FeatureStackItem }) {
  const reduce = useReducedMotion();
  const rowRef = useRef<HTMLDivElement>(null);
  const revealed = useInView(rowRef, { once: true, amount: 0.4 });
  const live = useInView(rowRef, { amount: 0.35 });
  const [emphasis, setEmphasis] = useState<Emphasis>(null);

  const play = live && !reduce;

  // Optional desktop parallax (text +12 / visual -12, opposite directions)
  const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
  const { scrollYProgress } = useScroll({ target: rowRef, offset: ['start end', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [-8, 8]);
  const visualY = useTransform(scrollYProgress, [0, 1], [12, -12]);
  const parallax = !reduce && !coarse;

  const [before, after] = splitTitle(item.title);
  const show = (v: object) => (reduce ? {} : v);

  return (
    <article ref={rowRef} className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-12">
      {/* Left — copy */}
      <motion.div
        className="flex flex-col gap-4 md:col-span-5"
        style={parallax ? { y: textY } : undefined}
      >
        {/* Eyebrow — orange line draws first, then label slides in */}
        <motion.div
          className="flex items-center gap-3"
          {...show({
            initial: { opacity: 0, x: -20 },
            animate: revealed ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 },
            transition: { duration: 0.4, ease: EASE },
          })}
        >
          <motion.span
            className="bg-brand-orange block h-px w-8"
            style={{ transformOrigin: 'left' }}
            {...show({
              initial: { width: 0 },
              animate: revealed ? { width: '2rem' } : { width: 0 },
              transition: { duration: 0.45, ease: EASE },
            })}
          />
          <span className="font-mono text-[11px] tracking-[0.18em] text-cyan-400 uppercase">
            {item.eyebrow}
          </span>
        </motion.div>

        {/* Headline — masked editorial reveal */}
        <h3 className="font-display text-brand-navy text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">
          <span className="block overflow-hidden">
            <motion.span
              className="block"
              {...show({
                initial: { opacity: 0, y: 22 },
                animate: revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 },
                transition: { duration: 0.5, ease: EASE, delay: 0.1 },
              })}
            >
              {before}
            </motion.span>
          </span>
          <span className="flex items-baseline gap-3">
            <motion.span
              className="text-brand-orange"
              {...show({
                initial: { opacity: 0 },
                animate: revealed ? { opacity: 1 } : { opacity: 0 },
                transition: { duration: 0.3, ease: EASE, delay: 0.26 },
              })}
            >
              —
            </motion.span>
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                {...show({
                  initial: { opacity: 0, x: -28 },
                  animate: revealed ? { opacity: 1, x: 0 } : { opacity: 0, x: -28 },
                  transition: { duration: 0.5, ease: EASE, delay: 0.34 },
                })}
              >
                {after}
              </motion.span>
            </span>
          </span>
        </h3>

        {/* Description */}
        <motion.p
          className="text-steel-200 text-base md:text-lg"
          {...show({
            initial: { opacity: 0, y: 12 },
            animate: revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
            transition: { duration: 0.45, ease: EASE, delay: 0.5 },
          })}
        >
          {item.description}
        </motion.p>

        {/* Tags — engineering labels, stagger + hover linkage to the sim */}
        {item.chips?.length ? (
          <ul className="mt-1 flex flex-wrap gap-2">
            {item.chips.map((chip, i) => (
              <motion.li
                key={chip}
                {...show({
                  initial: { opacity: 0, y: 8, scale: 0.98 },
                  animate: revealed
                    ? { opacity: 1, y: 0, scale: 1 }
                    : { opacity: 0, y: 8, scale: 0.98 },
                  transition: { duration: 0.4, ease: EASE, delay: 0.6 + i * 0.08 },
                })}
              >
                <button
                  type="button"
                  onMouseEnter={() => setEmphasis(mapChip(chip))}
                  onMouseLeave={() => setEmphasis(null)}
                  onFocus={() => setEmphasis(mapChip(chip))}
                  onBlur={() => setEmphasis(null)}
                  className="group border-steel-200 text-steel-700 hover:border-brand-orange hover:text-brand-navy focus-visible:border-brand-orange relative block border bg-white px-2.5 py-1 font-mono text-[11px] tracking-[0.12em] uppercase transition-all duration-200 hover:-translate-y-0.5"
                >
                  <span className="bg-brand-orange absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100" />
                  {chip}
                </button>
              </motion.li>
            ))}
          </ul>
        ) : null}
      </motion.div>

      {/* Right — autonomy simulation card */}
      <motion.div
        className="md:col-span-7"
        style={parallax ? { y: visualY } : undefined}
        {...show({
          initial: { opacity: 0, x: 24, scale: 0.985 },
          animate: revealed ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 24, scale: 0.985 },
          transition: { duration: 0.7, ease: EASE, delay: 0.1 },
        })}
      >
        <div className="border-steel-200 relative aspect-[16/10] w-full overflow-hidden rounded-[28px] border bg-white shadow-[0_30px_80px_-40px_rgba(9,56,121,0.45)]">
          {/* Status bar */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-3">
            <span className="text-steel-400 font-mono text-[10px] tracking-[0.18em] uppercase">
              Autonomous Navigation
            </span>
            <span className="text-steel-400 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] uppercase">
              <span className="bg-brand-orange h-1.5 w-1.5 rounded-full motion-safe:animate-pulse" />
              Live Simulation
            </span>
          </div>
          <div className="absolute inset-0 p-4 md:p-6">
            <AutonomyVisual animate={play} emphasis={emphasis} />
          </div>
        </div>
      </motion.div>
    </article>
  );
}

function splitTitle(title: string): [string, string] {
  const parts = title.split(' — ');
  if (parts.length === 2) return [parts[0], parts[1]];
  return [title, ''];
}

function mapChip(chip: string): Emphasis {
  const c = chip.toLowerCase();
  if (c.includes('slam')) return 'slam';
  if (c.includes('lidar')) return 'lidar';
  if (c.includes('ros')) return 'ros';
  return null;
}
