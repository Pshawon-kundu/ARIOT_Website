import Link from 'next/link';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { defineMetadata } from '@/lib/seo/metadata';

/**
 * Sub-turn 2 placeholder home page.
 *
 * Lives inside the (marketing) route group so it inherits the global
 * header, footer, and skip link from `app/(marketing)/layout.tsx`.
 * The real home (hero, trust strip, feature stack, products preview,
 * solutions grid, metric band, blog teaser, CTA band) lands in Sub-turn 3.
 *
 * Intentionally noindex during scaffold so a half-built home cannot
 * accidentally rank.
 */
export const metadata: Metadata = defineMetadata({
  title: 'Foundation in place',
  description:
    '[Phase 1 scaffold for ARIOT — design tokens, layout shell, UI primitives, and metadata pipeline are wired. Marketing pages land in subsequent sub-turns.]',
  path: '/',
  noindex: true,
});

const facts = [
  { label: 'Stack', value: 'Next 16 / RSC' },
  { label: 'Style', value: 'Tailwind v4' },
  { label: 'Lint', value: 'ESLint flat' },
  { label: 'Stage', value: 'Sub-turn 2' },
] as const;

export default function HomePage() {
  return (
    <Section bg="base" spacing="loose" className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at top, var(--cyan-faint) 0%, transparent 60%)',
        }}
      />
      <Container>
        <Badge variant="cyan">[02 — Layout shell]</Badge>

        <h1 className="text-steel-100 mt-6 font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
          ARIOT —{' '}
          <span className="text-cyan-400">
            Autonomous Robotics &amp; IoT
          </span>
        </h1>

        <p className="text-steel-200 mt-6 max-w-2xl text-lg sm:text-xl">
          [Phase 1 scaffold has the design system, layout shell, and reusable
          UI primitives wired. The full marketing surface lands in Sub-turn 3.]
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="primary">
            <Link href="/products">Explore products</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/quote">Request a quote</Link>
          </Button>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-steel-400 font-mono text-[11px] tracking-[0.18em] uppercase">
                {fact.label}
              </dt>
              <dd className="text-steel-100 mt-1 font-mono text-sm">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="text-steel-400 mt-12 font-mono text-xs">
          [BRACKETED] copy is intentional and grep-able. See `docs/` for the
          full plan.
        </p>
      </Container>
    </Section>
  );
}
