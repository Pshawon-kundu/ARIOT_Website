'use client';

import { useEffect, useRef, useState } from 'react';
import { PcbSignalAnimation } from './pcb-signal-animation';
import { IoTConnectivityAnimation } from './iot-connectivity-animation';

/**
 * EngineeringAnimationPanel — the dark technical panel chrome that wraps the
 * PCB / IoT diagram animations.
 *
 * Visual language: deep charcoal panel, brushed-metal border, soft cyan
 * internal glow, faint technical grid, restrained metallic top highlight.
 * The huge white/silver edge gradients from the old placeholder are gone.
 *
 * Performance / a11y: pauses all CSS animations when scrolled out of view
 * (IntersectionObserver → `.tech-paused`), and reduced-motion users see the
 * complete static diagram (animations are gated in globals.css).
 */
export function EngineeringAnimationPanel({ variant }: { variant: 'embedded' | 'iot' }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setPaused(!entry.isIntersecting), {
      threshold: 0.1,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[
        'border-steel-700 shadow-1 relative aspect-[16/10] w-full overflow-hidden rounded-xl border bg-[var(--tech-panel-bg)]',
        paused ? 'tech-paused' : '',
      ].join(' ')}
    >
      {/* Soft internal cyan glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, var(--tech-cyan-soft) 0%, transparent 60%)',
        }}
      />
      {/* Faint technical grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(var(--tech-line) 1px, transparent 1px), linear-gradient(90deg, var(--tech-line) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Brushed-metal top highlight */}
      <span
        aria-hidden
        className="via-steel-500/40 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
      />
      {/* Diagram (≥16px internal padding) */}
      <div className="absolute inset-0 p-4 md:p-6">
        {variant === 'embedded' ? <PcbSignalAnimation /> : <IoTConnectivityAnimation />}
      </div>
    </div>
  );
}
