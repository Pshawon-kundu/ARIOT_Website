'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface RevealProps {
  children: ReactNode;
  /** Classes always applied. */
  className?: string;
  /** Classes applied once the element enters the viewport. */
  revealClassName?: string;
  /** Stop observing after the first reveal. */
  once?: boolean;
  /** IntersectionObserver threshold. */
  threshold?: number;
}

/**
 * Reveal — lightweight viewport-entrance wrapper. Applies `revealClassName`
 * when the element scrolls into view (and keeps it once `once` is true).
 * Pure transform/opacity, so it never triggers layout. Respects
 * prefers-reduced-motion because the global CSS collapses transition/animation
 * durations to near-zero — the element simply appears.
 */
export function Reveal({
  children,
  className,
  revealClassName,
  once = true,
  threshold = 0.15,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // No IntersectionObserver (e.g. very old browsers): show content immediately
    // so it is never stuck hidden. This runs client-side only, so it does not
    // affect the server-rendered markup.
    if (typeof IntersectionObserver === 'undefined') {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) io.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, threshold]);

  return (
    <div ref={ref} className={cn(className, visible && revealClassName)}>
      {children}
    </div>
  );
}
