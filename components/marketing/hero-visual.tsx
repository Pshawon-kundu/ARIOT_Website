'use client';

import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { Hero3DClient } from '@/components/three/hero-3d-client';
import { HeroTechnicalOrbit } from './hero-technical-orbit';
import { RobotFeatureCallouts } from './robot-feature-callouts';

const EASE = [0.19, 1, 0.22, 1] as const;

/**
 * HeroVisual — right-side hero robotics visual (reference rebuild).
 *
 * Composition:
 *   - HeroTechnicalOrbit behind the robot (faint orbital diagram)
 *   - Hero3DClient robot (R3F on desktop, static poster on mobile)
 *   - RobotFeatureCallouts (technical labels around the robot)
 *   - a soft contact shadow under the robot
 *
 * Motion:
 *   - entrance: from right +45px, opacity 0→1, scale 0.97→1 (~1s, delay 0.6)
 *   - pointer tilt (desktop only): the whole stage rotates ±1.5° around X/Y
 *   - idle breathing float after the entrance settles (y 0→-4→0, 6s loop)
 *   - reduced motion / touch: all motion collapsed to the final static state
 */
export function HeroVisual() {
  const reduce = useReducedMotion();
  const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 60, damping: 18 });
  const sry = useSpring(ry, { stiffness: 60, damping: 18 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce || coarse) return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 3);
    rx.set(((e.clientY - r.top) / r.height - 0.5) * -3);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const enter = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, x: 45, scale: 0.97 },
        animate: { opacity: 1, x: 0, scale: 1 },
      };

  return (
    <motion.div
      className="relative h-[420px] w-full md:h-[560px] lg:h-[600px]"
      initial={enter.initial}
      animate={enter.animate}
      transition={{ duration: 1, ease: EASE, delay: 0.6 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* Soft brand glow + faint technical field behind the robot */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[122%] w-[122%] -translate-x-1/2 -translate-y-1/2 opacity-80"
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 50% 46%, rgba(245,115,35,0.12) 0%, rgba(9,56,121,0.07) 38%, transparent 70%)',
          }}
        />
      </div>

      {/* Orbital diagram behind the robot */}
      <HeroTechnicalOrbit className="pointer-events-none absolute top-1/2 left-1/2 h-[128%] w-[128%] -translate-x-1/2 -translate-y-1/2 opacity-60" />

      {/* Soft contact shadow */}
      <div
        aria-hidden
        className="absolute top-[80%] left-1/2 h-6 w-2/3 -translate-x-1/2 rounded-[50%] bg-black/10 blur-xl"
      />

      {/* Tilt + idle float stage */}
      <motion.div
        className="absolute inset-0"
        style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      >
        <motion.div
          className="relative h-full w-full"
          animate={reduce ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity, delay: 1.6 }}
        >
          <Hero3DClient className="absolute inset-0 z-10 h-full w-full" />
        </motion.div>
      </motion.div>

      {/* Technical callouts around the robot */}
      <RobotFeatureCallouts />
    </motion.div>
  );
}
