'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'motion/react';

interface BackgroundVideoProps {
  /** Modern codec, served first (AV1/WebM). */
  webm: string;
  /** Broad-compat fallback (H.264/MP4). */
  mp4: string;
  /** Still frame (AVIF/WebP) — also the mobile + reduced-motion fallback. */
  poster: string;
  /** Class for the <video> (desktop). Include `hidden md:block` when a
   *  mobile still is provided via `imgClassName`. */
  className?: string;
  /** Class for the mobile still <img>. Include `md:hidden`. */
  imgClassName?: string;
}

const POSTER_WIDTH = 1920;
const POSTER_HEIGHT = 824;

/**
 * BackgroundVideo — decorative, autoplaying, muted, looping background clip.
 *
 * Rules honored (AI_ASSET_PIPELINE §4 / §9.3 / §9.4):
 *   - muted + loop + playsInline + preload="metadata", no audio
 *   - reduced motion → poster still only, never autoplays
 *   - IntersectionObserver gate: pause when off-screen; pause on tab hidden
 *   - mobile drops the loop and shows the still (imgClassName `md:hidden`)
 *   - degrades silently if the asset files are not present yet
 *
 * The element is decorative (aria-hidden); never carries content text.
 */
export function BackgroundVideo({
  webm,
  mp4,
  poster,
  className,
  imgClassName,
}: BackgroundVideoProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.1,
    });
    io.observe(el);
    const onVisibility = () => {
      if (document.hidden) el.pause();
      else if (inView) el.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduce, inView]);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) {
      el?.pause();
      return;
    }
    if (inView) el.play().catch(() => {});
    else el.pause();
  }, [inView, reduce]);

  const hide = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  if (reduce) {
    return (
      <Image
        src={poster}
        alt=""
        width={POSTER_WIDTH}
        height={POSTER_HEIGHT}
        aria-hidden
        onError={hide}
        className={imgClassName ?? className}
      />
    );
  }

  return (
    <>
      <video
        ref={ref}
        className={className}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        autoPlay
        aria-hidden
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      >
        <source src={webm} type="video/webm" />
        <source src={mp4} type="video/mp4" />
      </video>
      <Image
        src={poster}
        alt=""
        width={POSTER_WIDTH}
        height={POSTER_HEIGHT}
        aria-hidden
        onError={hide}
        className={imgClassName}
      />
    </>
  );
}
