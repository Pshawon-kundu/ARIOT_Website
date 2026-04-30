import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Eyebrow } from './eyebrow';
import { cn } from '@/lib/utils/cn';

interface CtaBandLink {
  label: string;
  href: string;
}

interface CtaBandProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  primary?: CtaBandLink;
  secondary?: CtaBandLink;
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
  bg = 'raised',
  className,
}: CtaBandProps) {
  return (
    <Section
      bg={bg}
      spacing="default"
      className={cn('relative isolate overflow-hidden', className)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, var(--cyan-faint) 0%, transparent 60%)',
        }}
      />
      <Container className="flex flex-col items-center gap-6 text-center">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 className="text-steel-100 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-steel-300 max-w-2xl text-base sm:text-lg">
            {subtitle}
          </p>
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
    </Section>
  );
}
