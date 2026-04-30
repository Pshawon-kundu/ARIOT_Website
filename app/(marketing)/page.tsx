import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { CtaBand } from '@/components/marketing/cta-band';
import { FeatureCard } from '@/components/marketing/feature-card';
import { FeatureGrid } from '@/components/marketing/feature-grid';
import { FeatureStack } from '@/components/marketing/feature-stack';
import { HeroShell } from '@/components/marketing/hero-shell';
import { LogoStrip } from '@/components/marketing/logo-strip';
import { MetricBand } from '@/components/marketing/metric-band';
import { SectionHeader } from '@/components/marketing/section-header';
import { defineMetadata } from '@/lib/seo/metadata';
import {
  BLOG_TEASERS,
  CAPABILITIES,
  ENGINEERING_FULL_LIST,
  ENGINEERING_PILLARS,
  METRICS,
  PRODUCTS,
  SOLUTIONS,
} from './_home-content';

/**
 * ARIOT homepage — premium dark robotics + IoT landing.
 * Section order matches the brief in PAGE_BLUEPRINTS §1 (adapted for the
 * current sub-turn). Server component throughout; no 3D yet, no AI assets
 * yet — token-driven placeholders sit where Seedream/Seedance media will
 * slot in (AI_ASSET_PIPELINE §2).
 */
export const metadata: Metadata = defineMetadata({
  title: 'Autonomous Robotics & IoT, engineered in Bangladesh',
  description:
    'ARIOT engineers autonomous robots, embedded electronics, and connected IoT systems for homes, offices, institutions, and small industries across Bangladesh and South Asia.',
  path: '/',
});

export default function HomePage() {
  return (
    <>
      {/* 1 — Hero */}
      <HeroShell>
        <Section bg="base" spacing="loose">
          <Container className="flex flex-col gap-8">
            <Badge variant="cyan">[ROBOTICS · IOT · ENGINEERED IN BD]</Badge>

            <h1 className="text-steel-100 max-w-4xl font-display text-4xl leading-[1.04] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
              Autonomous machines and connected systems,{' '}
              <span className="text-cyan-400">engineered in Bangladesh.</span>
            </h1>

            <p className="text-steel-200 max-w-2xl text-base sm:text-lg md:text-xl">
              [ARIOT designs robots, IoT devices, and custom solutions for
              homes, offices, institutions, and small industries across
              South Asia.]
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="xl" variant="primary">
                <Link href="/quote">
                  Request a quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="secondary">
                <Link href="/products">Explore products</Link>
              </Button>
            </div>

            <div
              aria-hidden
              className="text-steel-500 mt-12 flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] uppercase"
            >
              <span className="bg-steel-700 h-px w-12" />
              [SCROLL · ASSET PIPELINE — SEEDANCE HERO PENDING]
            </div>
          </Container>
        </Section>
      </HeroShell>

      {/* 2 — Trust / capability strip */}
      <Section bg="raised" spacing="compact">
        <Container>
          <LogoStrip eyebrow="What we engineer" items={CAPABILITIES} />
        </Container>
      </Section>

      {/* 3 — Product showcase preview */}
      <Section bg="base" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Product preview"
            title="A growing line of robotics and IoT systems"
            subhead="[Practical hardware, designed for the South Asian context. The current line-up — from concept to early production — at a glance.]"
          />
          <FeatureGrid columns={4}>
            {PRODUCTS.map((product) => (
              <FeatureCard
                key={product.title}
                {...product}
                cta="View details"
              />
            ))}
          </FeatureGrid>
          <div>
            <Button asChild variant="ghost">
              <Link href="/products">
                View all products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* 4 — Solutions */}
      <Section bg="raised" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Where it deploys"
            title="Engineered for the spaces South Asia actually lives in"
            subhead="[From single homes to small factory floors — we ship hardware that fits the environment, not the other way around.]"
          />
          <FeatureGrid columns={3}>
            {SOLUTIONS.map((solution) => (
              <FeatureCard
                key={solution.title}
                {...solution}
                cta="See solution"
              />
            ))}
          </FeatureGrid>
        </Container>
      </Section>

      {/* 5 — Engineering capability */}
      <Section bg="base" spacing="default">
        <Container className="flex flex-col gap-16 md:gap-20">
          <SectionHeader
            eyebrow="Under the hood"
            title="Real engineering across the stack"
            subhead="[From the embedded board to the cloud dashboard, we own the full chain — and we ship hardware that survives the field.]"
          />
          <FeatureStack items={ENGINEERING_PILLARS} />
          <ul
            aria-label="All engineering capabilities"
            className="border-steel-800 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t pt-8"
          >
            {ENGINEERING_FULL_LIST.map((item) => (
              <li
                key={item}
                className="text-steel-300 font-mono text-[11px] tracking-[0.18em] uppercase"
              >
                · {item}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* 6 — Metric / proof band */}
      <Section bg="raised" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="By the numbers"
            title="Where ARIOT is right now"
            subhead="[Real numbers replace these brackets as the work ships.]"
            size="compact"
          />
          <MetricBand metrics={METRICS} />
        </Container>
      </Section>

      {/* 7 — Blog / innovation teaser */}
      <Section bg="base" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="From the lab"
            title="Notes from the workbench"
            subhead="[Field reports, R&D logs, and tutorials from the ARIOT engineering team.]"
          />
          <FeatureGrid columns={3}>
            {BLOG_TEASERS.map((post) => (
              <FeatureCard key={post.title} {...post} cta="Read on" />
            ))}
          </FeatureGrid>
        </Container>
      </Section>

      {/* 8 — Final CTA band */}
      <CtaBand
        eyebrow="Next step"
        title="Build something real with us"
        subtitle="[Whether it's an enterprise rollout, a single prototype, or a question about an existing device — get in touch and we'll route you to the right engineer.]"
        primary={{ label: 'Request a quote', href: '/quote' }}
        secondary={{ label: 'Talk to sales', href: '/contact' }}
      />
    </>
  );
}
