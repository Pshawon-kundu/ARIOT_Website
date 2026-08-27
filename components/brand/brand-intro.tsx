'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const SESSION_KEY = 'ariot.intro.seen';

type Phase = 'symbol' | 'wordmark' | 'hold' | 'exit' | 'done';

/**
 * BrandIntro — premium ARIoT opening animation, played once per browser
 * session on the public site.
 *
 * Sequence (reduced-motion collapses to a static logo + instant reveal):
 *   1. Symbol scales 0.85 → 1, fades in (≈600ms, ease-out, no bounce).
 *   2. Full lockup (ARIoT + TECHNOLOGIES) fades in over the symbol (≈600ms).
 *   3. Brief hold with a subtle 1 → 1.03 cinematic zoom (≈500ms).
 *   4. Lockup eases up toward the header and the overlay fades, revealing
 *      the homepage underneath.
 *
 * Only actual logo artwork is used (never redrawn). Total ≈ 2.3s, under the
 * 2.5s cap. A Skip control and a load safety-timeout guarantee navigation is
 * never blocked by the animation.
 */
export function BrandIntro() {
  const [phase, setPhase] = useState<Phase>('symbol');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timerList = timers.current;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      seen = false;
    }

    // All phase transitions are deferred via setTimeout so we never call
    // setState synchronously inside the effect body (avoids cascading renders
    // and satisfies react-hooks/set-state-in-effect).
    const add = (fn: () => void, ms: number) => {
      timers.current.push(setTimeout(fn, ms));
    };

    if (seen) {
      add(() => finish(), 0);
      return;
    }

    if (reduced) {
      // Show the completed logo briefly, then go straight to the site.
      add(() => setPhase('wordmark'), 0);
      add(() => setPhase('exit'), 450);
      add(() => finish(), 850);
    } else {
      add(() => setPhase('wordmark'), 600);
      add(() => setPhase('hold'), 1200);
      add(() => setPhase('exit'), 1750);
      add(() => finish(), 2350);
    }

    // Safety: never trap the user if media stalls.
    const safety = setTimeout(() => finish(), 5000);
    timers.current.push(safety);

    function finish() {
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        /* ignore */
      }
      setPhase('done');
    }

    return () => {
      timerList.forEach(clearTimeout);
    };
  }, []);

  // Lock background scroll while the intro is on screen; restore on dismiss.
  useEffect(() => {
    if (phase === 'done') {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [phase]);

  function skip() {
    timers.current.forEach(clearTimeout);
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
    setPhase('exit');
    setTimeout(() => setPhase('done'), 500);
  }

  if (phase === 'done') return null;

  const symbolVisible = phase === 'symbol' || phase === 'wordmark' || phase === 'hold';
  const fullVisible = phase === 'wordmark' || phase === 'hold';
  const zoomed = phase === 'hold';
  const exiting = phase === 'exit';

  return (
    <div
      aria-hidden={
        phase !== 'symbol' && phase !== 'wordmark' && phase !== 'hold' ? undefined : true
      }
      className={[
        'fixed inset-0 z-[100] flex items-center justify-center bg-white',
        'ease-out-quart transition-opacity duration-500',
        exiting ? 'opacity-0' : 'opacity-100',
      ].join(' ')}
    >
      <div
        className={[
          'ease-out-quart relative flex items-center justify-center transition-all duration-500',
          exiting ? '-translate-y-24 scale-90 opacity-0' : 'translate-y-0 scale-100 opacity-100',
        ].join(' ')}
      >
        {/* Stage 1 — symbol */}
        <Image
          src="/media/brand/ariot-logo-symbol.png"
          alt=""
          aria-hidden
          width={1335}
          height={1194}
          priority
          className={[
            'ease-out-quart absolute w-[120px] max-w-none transition-all duration-[600ms] md:w-[160px]',
            symbolVisible ? 'scale-100 opacity-100' : 'scale-[0.85] opacity-0',
          ].join(' ')}
        />
        {/* Stage 2/3/4 — full lockup */}
        <Image
          src="/media/brand/ariot-logo-full.png"
          alt="ARIoT Technologies"
          width={4259}
          height={1194}
          priority
          className={[
            'ease-out-quart relative h-auto w-[230px] max-w-none transition-all duration-[600ms] md:w-[300px]',
            fullVisible
              ? zoomed
                ? 'scale-[1.03] opacity-100'
                : 'scale-100 opacity-100'
              : 'scale-95 opacity-0',
          ].join(' ')}
        />
      </div>

      <button
        type="button"
        onClick={skip}
        className="border-steel-700 text-steel-500 hover:border-steel-500 hover:text-steel-300 focus-visible:ring-brand-orange absolute right-5 bottom-5 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none"
      >
        Skip intro
      </button>
    </div>
  );
}
