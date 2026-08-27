import Link from 'next/link';
import type { ReactNode } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Eyebrow } from './eyebrow';
import { Reveal } from '@/components/motion/reveal';
import { BackgroundVideo } from '@/components/media/background-video';
import { cn } from '@/lib/utils/cn';

interface CtaBandLink {
  label: string;
  href: string;
}

interface CtaBandVideo {
  webm: string;
  mp4: string;
  poster: string;
}

interface CtaBandProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  primary?: CtaBandLink;
  secondary?: CtaBandLink;
  /** Optional ambient background loop (AI_ASSET_PIPELINE §1.7 / §9.3). */
  backgroundVideo?: CtaBandVideo;
  /** Background canvas. Defaults to raised so the band visually separates
   *  from the section above it (DESIGN_SYSTEM §9.1 cta-band rule). */
  bg?: 'base' | 'raised';
  className?: string;
}

/**
 * CtaBand — single big CTA section, centered, on a raised canvas.
 *
 * Cinematic but not loud: a soft cyan radial vignette at the top, no
 * background animation, no gradient fills outside the token system.
 *
 * Use at most one cta-band per page (DESIGN_SYSTEM §9.2).
 */
export function CtaBand({
  eyebrow,
  title,
  subtitle,
  primary,
  secondary,
  backgroundVideo,
  bg = 'raised',
  className,
}: CtaBandProps) {
  return (
    <Section
      bg={bg}
      spacing="default"
      className={cn('relative isolate overflow-hidden', className)}
    >
      {backgroundVideo ? (
        <BackgroundVideo
          webm={backgroundVideo.webm}
          mp4={backgroundVideo.mp4}
          poster={backgroundVideo.poster}
          className="absolute inset-0 -z-20 hidden h-full w-full object-cover opacity-30 md:block"
          imgClassName="absolute inset-0 -z-20 h-full w-full object-cover opacity-30 md:hidden"
        />
      ) : null}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, var(--cyan-faint) 0%, transparent 60%)',
        }}
      />
      {/* Subtle ARIoT symbol behind the CTA — part of the brand architecture
          as the page transitions into the navy footer (DESIGN_SYSTEM §brand). */}
      <Image
        src="/media/brand/ariot-logo-symbol.png"
        alt=""
        aria-hidden
        width={1335}
        height={1194}
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 w-[420px] max-w-[60vw] -translate-x-1/2 -translate-y-1/2 opacity-[0.05] select-none"
      />
      <Reveal>
        <Container className="flex flex-col items-center gap-6 text-center">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h2 className="text-steel-100 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-steel-300 max-w-2xl text-base sm:text-lg">{subtitle}</p>
          ) : null}
          {primary || secondary ? (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              {primary ? (
                <Button asChild size="lg" variant="primary">
                  <Link href={primary.href}>{primary.label}</Link>
                </Button>
              ) : null}
              {secondary ? (
                <Button asChild size="lg" variant="secondary">
                  <Link href={secondary.href}>{secondary.label}</Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </Container>
      </Reveal>
    </Section>
  );
}
