'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroStepIndicator } from './hero-step-indicator';

const EASE = [0.19, 1, 0.22, 1] as const;
const SHUFFLE_WORDS = ['Robotics', 'Innovation', 'Automation', 'IoT'] as const;

/**
 * WordShuffle — fixed-height, overflow-hidden orange word that cycles between
 * related terms (Robotics → Automation → IoT → Innovation) with a vertical
 * slide-and-fade. An invisible sizer reserves the widest word so the heading
 * never shifts horizontally. Reduced motion shows only the first word.
 */
function WordShuffle({ words, reduce }: { words: readonly string[]; reduce: boolean | null }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((p) => (p + 1) % words.length), 3000);
    return () => clearInterval(t);
  }, [reduce, words.length]);

  if (reduce) {
    return <span className="text-brand-orange">{words[0]}</span>;
  }

  const longest = words.reduce((a, b) => (b.length >= a.length ? b : a), '');

  return (
    <span
      className="text-brand-orange relative inline-block overflow-hidden align-bottom"
      style={{ height: '1.1em' }}
      aria-label={words.join(', ')}
    >
      <span className="invisible" aria-hidden>
        {longest}
      </span>
      <span className="absolute inset-0" aria-hidden>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={i}
            className="absolute inset-0 flex items-end"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-110%', opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {words[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

/**
 * HeroCopy — left-column hero message (reference rebuild).
 *
 * Honors the approved copy and brand rule (highlighted word orange, rest navy).
 * Adds a vertical step indicator rail, a drawn-in orange eyebrow line, a masked
 * headline whose highlighted word shuffles between related terms, a soft staggered
 * page-load reveal, and CTA scale-in. Reduced motion collapses to the final
 * static state. CTA destinations/semantics preserved: primary orange
 * "Request a quote" (/quote), secondary navy "Explore R&D" (/research).
 */
export function HeroCopy() {
  const reduce = useReducedMotion();

  const line = (delay: number, from: { x?: number; y?: number; scale?: number }) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, ...from },
          animate: { opacity: 1, x: 0, y: 0, scale: 1 },
          transition: { duration: 0.6, ease: EASE, delay },
        };

  return (
    <div className="group mx-auto flex max-w-3xl flex-col gap-8 pb-12 md:mx-0 md:flex-row md:items-start md:gap-8 md:pb-0">
      <HeroStepIndicator active={0} />

      <div className="flex flex-col md:flex-1">
        {/* Eyebrow — orange line draws in above the label */}
        <div className="flex flex-col items-center gap-3 md:items-start">
          <motion.span
            className="bg-brand-orange block h-px"
            style={{ transformOrigin: 'left' }}
            initial={{ width: 0 }}
            animate={{ width: '2.5rem' }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          />
          <motion.span
            className="text-brand-orange font-mono text-[11px] tracking-[0.2em] uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Robotics · IoT · Engineered in Bangladesh
          </motion.span>
        </div>

        {/* Headline — masked reveal, highlighted word shuffles */}
        <h1 className="font-display text-brand-navy mt-6 max-w-4xl text-4xl leading-[1.02] font-semibold tracking-[-0.02em] text-balance sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="block overflow-hidden">
            <motion.span className="block" {...line(0.2, { y: 24 })}>
              Building the
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span className="block" {...line(0.35, { y: 24 })}>
              <WordShuffle words={SHUFFLE_WORDS} reduce={reduce} /> Ecosystem
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span className="block" {...line(0.55, { y: 24 })}>
              of Bangladesh.
            </motion.span>
          </span>
        </h1>

        <motion.p
          className="text-steel-200 mt-7 max-w-[520px] text-base sm:text-lg md:text-xl"
          {...(reduce
            ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
            : {
                initial: { opacity: 0, y: 18 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.6, ease: EASE, delay: 0.7 },
              })}
        >
          ARIOT Technologies researches autonomous robotics, develops connected IoT products, and is
          building the engineering workspace and component supply that local innovators need.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start"
          {...(reduce
            ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
            : {
                initial: { opacity: 0, y: 18, scale: 0.96 },
                animate: { opacity: 1, y: 0, scale: 1 },
                transition: { duration: 0.6, ease: EASE, delay: 0.85 },
              })}
        >
          <Button
            asChild
            size="xl"
            variant="primary"
            className="group transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Link href="/quote">
              Request a quote
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button
            asChild
            size="xl"
            variant="navy"
            className="group transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Link href="/research">
              Explore R&amp;D
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </motion.div>

        <motion.div
          className="text-steel-400 mt-6 flex items-center justify-center gap-3 font-mono text-[11px] tracking-[0.18em] uppercase md:justify-start"
          aria-hidden
          {...(reduce
            ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
            : {
                initial: { opacity: 0, y: 18 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.6, ease: EASE, delay: 0.98 },
              })}
        >
          <span className="bg-steel-300 h-px w-12" />
          Scroll
        </motion.div>
      </div>
    </div>
  );
}
