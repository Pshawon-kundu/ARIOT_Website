'use client';

/**
 * Hero3DClient — wrapper that exposes the R3F hero to server-component pages
 * via a dynamic import with SSR disabled.
 *
 * Usage in a server component page:
 *   import { Hero3DClient } from '@/components/three/hero-3d-client';
 *   <Hero3DClient />
 *
 * Mobile fallback (< 768px): renders the Seedance poster (SVG placeholder
 * until real Seedance video assets land in a future asset pass).
 * See AI_ASSET_PIPELINE §6.1 for naming + storage convention.
 */

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useEffect, useReducer } from 'react';

// Dynamic import with ssr: false — Three.js cannot run on the server
const R3FWrapper = dynamic(() => import('./r3f-wrapper').then((m) => m.R3FWrapper), {
  ssr: false,
  loading: () => <PlaneFallback />,
});

function PlaneFallback() {
  return (
    <div
      className="h-full w-full animate-pulse rounded-lg"
      aria-hidden
      style={{
        background:
          'linear-gradient(135deg, var(--bg-raised) 0%, var(--bg-elevated) 50%, var(--bg-raised) 100%)',
      }}
    />
  );
}

function MobileFallback() {
  return (
    <div
      role="img"
      aria-label="ARIOT autonomous robot — hero visual"
      className="relative h-full w-full overflow-hidden rounded-lg"
    >
      {/* Seedance poster — SVG placeholder until real AVIF lands */}
      <Image
        src="/media/home/home-hero-cinematic-arm-01-9x16.svg"
        alt=""
        aria-hidden
        fill
        className="object-cover"
        sizes="100vw"
      />
      {/* Gradient overlay for readability */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(0deg, var(--bg-base) 0%, transparent 50%, transparent 100%)',
        }}
      />
    </div>
  );
}

type ViewState = 'unresolved' | 'mobile' | 'desktop';

type Action = { type: 'setMobile'; value: boolean };

function reducer(_state: ViewState, action: Action): ViewState {
  return action.value ? 'mobile' : 'desktop';
}

interface Hero3DClientProps {
  className?: string;
}

export function Hero3DClient({ className }: Hero3DClientProps) {
  const [viewState, dispatch] = useReducer(reducer, 'unresolved');

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    dispatch({ type: 'setMobile', value: mq.matches });
    const handler = (e: MediaQueryListEvent) => dispatch({ type: 'setMobile', value: e.matches });
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className={className} style={{ position: 'relative' }}>
      {viewState === 'unresolved' && <PlaneFallback />}
      {viewState === 'mobile' && <MobileFallback />}
      {viewState === 'desktop' && <R3FWrapper height="100%" />}
    </div>
  );
}
