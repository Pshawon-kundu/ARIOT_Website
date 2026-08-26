'use client';

import { Suspense, lazy, useEffect, useRef, useState } from 'react';

// Lazy-load the scene — SSR: false prevents server rendering of Three.js
// (THREE uses window/WebGL APIs that don't exist on the server).
const HeroScene = lazy(() => import('./hero-scene'));

interface R3FWrapperProps {
  /** Height of the canvas — matches the hero shell height. */
  height?: string;
  className?: string;
}

/**
 * R3FWrapper — lazy-loads the Three.js hero scene behind a Suspense boundary
 * with a steel-skeleton fallback.
 *
 * Renders the canvas only when the component is visible in the viewport
 * (IntersectionObserver gate) so work is paused when the hero scrolls out
 * of view (architecture rule §8.3).
 *
 * The canvas is always client-only (`dynamic({ ssr: false })` at the page
 * level is the next.js way; here we use `lazy` + `useEffect` to keep the
 * wrapper a module that is itself dynamically importable).
 */
export function R3FWrapper({ height = '100%', className }: R3FWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry?.isIntersecting ?? false);
      },
      { threshold: 0, rootMargin: '100px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ height }} className={className} aria-hidden>
      <Suspense fallback={<SkeletonFallback />}>
        {isVisible ? <HeroScene /> : <SkeletonFallback />}
      </Suspense>
    </div>
  );
}

function SkeletonFallback() {
  return (
    <div
      className="h-full w-full animate-pulse rounded-lg"
      style={{
        background:
          'linear-gradient(135deg, var(--bg-raised) 0%, var(--bg-elevated) 50%, var(--bg-raised) 100%)',
      }}
      aria-label="3D scene loading"
    />
  );
}
