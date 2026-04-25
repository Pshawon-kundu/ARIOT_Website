import type { Metadata } from 'next';
import { defineMetadata } from '@/lib/seo/metadata';

/**
 * Sub-turn 1 placeholder home page.
 *
 * The real home page (hero, trust strip, feature stack, products preview,
 * solutions grid, metric band, blog teaser, CTA band) lands in Sub-turn 3.
 * This file exists so that `pnpm build` succeeds end-to-end and so the
 * design tokens, fonts, and metadata pipeline can be visually verified
 * in isolation.
 */
export const metadata: Metadata = defineMetadata({
  title: 'Foundation in place',
  description:
    '[Phase 1 scaffold for ARIOT — design tokens, type system, and metadata pipeline are wired. Marketing pages land in subsequent sub-turns.]',
  path: '/',
  noindex: true,
});

const facts = [
  { label: 'Stack', value: 'Next 16 / RSC' },
  { label: 'Style', value: 'Tailwind v4' },
  { label: 'Lint', value: 'ESLint flat' },
  { label: 'Stage', value: 'Sub-turn 1' },
] as const;

export default function HomePage() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at top, var(--cyan-faint) 0%, transparent 60%)',
        }}
      />

      <section className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-center px-6 py-24">
        <p className="text-cyan-400 font-mono text-xs tracking-[0.2em] uppercase">
          [01 — Foundation]
        </p>

        <h1 className="text-steel-100 font-display mt-6 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
          ARIOT —{' '}
          <span className="text-cyan-400">Autonomous Robotics &amp; IoT</span>
        </h1>

        <p className="text-steel-200 mt-6 max-w-2xl text-lg sm:text-xl">
          [Phase 1 scaffold is live. Design tokens, fonts, lint, build, and
          types are wired. Marketing surfaces, components, and content land in
          subsequent sub-turns.]
        </p>

        <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
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
      </section>
    </main>
  );
}
