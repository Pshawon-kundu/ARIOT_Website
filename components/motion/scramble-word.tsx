'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=<>/';

interface ScrambleWordProps {
  /** Words to cycle through. Each resolves via a scramble-decode effect. */
  words: ReadonlyArray<string>;
  className?: string;
  /** How long the resolved word stays before the next scramble (ms). */
  holdMs?: number;
  /** Duration of the scramble-decode reveal (ms). */
  scrambleMs?: number;
}

/**
 * ScrambleWord — precision "decode" text effect for the hero.
 *
 * Letters scramble randomly, then settle left-to-right into the target word,
 * hold, and advance to the next word in the list. Loops continuously.
 *
 * Honors `prefers-reduced-motion` by rendering the first word statically
 * (AGENTS.md §7). SSR renders the first word so there is no layout shift or
 * SEO loss before hydration (DESIGN_SYSTEM §14).
 */
export function ScrambleWord({
  words,
  className,
  holdMs = 2400,
  scrambleMs = 750,
}: ScrambleWordProps) {
  const reduce = useReducedMotion();
  const [text, setText] = useState(words[0]);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (reduce) {
      // SSR initial state already holds words[0]; nothing to animate.
      return;
    }

    let wordIndex = 0;
    let startTime = 0;
    let holding = false;
    let holdStart = 0;

    const tick = (now: number) => {
      const target = words[wordIndex];

      if (!holding) {
        if (!startTime) startTime = now;
        const progress = Math.min((now - startTime) / scrambleMs, 1);
        const reveal = Math.floor(progress * target.length);
        let out = '';
        for (let i = 0; i < target.length; i += 1) {
          if (target[i] === ' ') out += ' ';
          else if (i < reveal) out += target[i];
          else out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        setText(out);
        if (progress >= 1) {
          setText(target);
          holding = true;
          holdStart = now;
        }
      } else if (now - holdStart >= holdMs) {
        holding = false;
        startTime = 0;
        wordIndex = (wordIndex + 1) % words.length;
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [words, reduce, holdMs, scrambleMs]);

  return (
    <span className={className} aria-label={words.join(', ')}>
      <span aria-hidden>{text}</span>
    </span>
  );
}
