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
import { HeroCopy } from '@/components/marketing/hero-copy';
import { HeroVisual } from '@/components/marketing/hero-visual';
import { CleanBotHowItWorks } from '@/components/marketing/cleanbot-how-it-works';
import { BackgroundVideo } from '@/components/media/background-video';
import { Reveal } from '@/components/motion/reveal';
import { Organization } from '@/components/seo/organization';
import { WebSite } from '@/components/seo/website';
import { defineMetadata } from '@/lib/seo/metadata';
import {
  BLOG_TEASERS,
  BUSINESS_AREAS,
  CAPABILITIES,
  COMPONENT_TEASERS,
  ENGINEERING_FULL_LIST,
  ENGINEERING_PILLARS,
  METRICS,
  PRODUCTS,
  SOLUTIONS,
} from './_home-content';

export const metadata: Metadata = defineMetadata({
  title: 'Building the Robotics Ecosystem of Bangladesh',
  description:
    'ARIOT Technologies researches autonomous robotics, develops connected IoT products, and is building the engineering workspace and component supply for innovators across South Asia.',
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <Organization />
      <WebSite />

      {/* 1 — Hero */}
      <HeroShell>
        <Section bg="base" spacing="loose" className="py-14 md:py-20">
          <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[48fr_52fr] lg:items-center lg:gap-12">
            <HeroCopy />
            <HeroVisual />
          </Container>
        </Section>
      </HeroShell>

      {/* 2 — Capability strip */}
      <Section bg="raised" spacing="compact">
        <Container>
          <Reveal>
            <LogoStrip eyebrow="What we do" items={CAPABILITIES} />
          </Reveal>
        </Container>
      </Section>

      {/* 3 — Business areas */}
      <Section bg="base" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Business areas"
            title="Five directions, one ecosystem"
            subhead="From autonomous R&D to the workspace and components that support every builder in Bangladesh."
          />
          <FeatureGrid columns={3}>
            {BUSINESS_AREAS.map((area) => (
              <FeatureCard key={area.title} {...area} cta="Learn more" />
            ))}
          </FeatureGrid>
        </Container>
      </Section>

      {/* 4 — R&D and engineering proof */}
      <Section bg="raised" spacing="default">
        <Container className="flex flex-col gap-16 md:gap-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Research & development"
              title="Real engineering across the stack"
              subhead="From the embedded board to the cloud dashboard — we own the full chain and test in real conditions."
            />
            <Button asChild variant="ghost" className="shrink-0">
              <Link href="/research">
                View all R&amp;D
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
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

      {/* 5 — Robotics workspace (navy contrast section) */}
      <Section bg="navy" spacing="default" className="relative isolate overflow-hidden">
        {/* Ambient premium-robot background loop (asset dropped per
            AI_ASSET_PIPELINE — degrades to nothing until present). */}
        <BackgroundVideo
          webm="/media/home/home-hero-cinematic-arm-01-21x9.webm"
          mp4="/media/home/home-hero-cinematic-arm-01-21x9.mp4"
          poster="/media/home/home-hero-cinematic-arm-01-poster-21x9.avif"
          className="absolute inset-0 -z-10 hidden h-full w-full object-cover opacity-30 md:block"
          imgClassName="absolute inset-0 -z-10 h-full w-full object-cover opacity-30 md:hidden"
        />
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div className="flex flex-col gap-6">
              <SectionHeader
                eyebrow="Planned initiative"
                title="A shared engineering space for Bangladesh builders"
                subhead="We are building a robotics co-working workspace for students, engineers, and research teams who need proper bench space, tools, and a technical community."
              />
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="primary" size="lg">
                  <Link href="/workspace">
                    About the workspace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="border-white/40 bg-transparent text-white hover:border-white/60 hover:bg-white/10"
                >
                  <Link href="/contact">Register interest</Link>
                </Button>
              </div>
            </div>
            <div className="border-steel-700 bg-bg-raised flex flex-col gap-4 rounded-xl border p-6">
              <h3 className="text-steel-100 font-display text-base font-semibold">
                Planned facilities
              </h3>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  'Electronics workbench',
                  'Soldering station',
                  'Bench power supplies',
                  'Hand & assembly tools',
                  'Meeting area',
                  'High-speed internet',
                  'Engineering support',
                  'Robot assembly space',
                ].map((f) => (
                  <li key={f} className="text-steel-200 flex items-center gap-2 text-sm">
                    <span
                      aria-hidden
                      className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400"
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <Badge variant="warning">Opening details to be announced</Badge>
            </div>
          </div>
        </Container>
      </Section>

      {/* 6 — Components and electronics */}
      <Section bg="raised" spacing="default">
        <Container className="flex flex-col gap-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Store in development"
              title="Electronics and robotics components"
              subhead="We are building a components supply for development boards, sensors, motors, and IoT modules — available for request now, online ordering coming later."
            />
            <Button asChild variant="ghost" className="shrink-0">
              <Link href="/components">
                Browse components
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <FeatureGrid columns={4}>
            {COMPONENT_TEASERS.map((cat) => (
              <FeatureCard key={cat.title} {...cat} cta="Explore" />
            ))}
          </FeatureGrid>
        </Container>
      </Section>

      {/* 7 — IoT products and solutions */}
      <Section bg="base" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Products"
            title="IoT products and robotics systems in development"
            subhead="Our current product line — from early concept to prototype validation. Status labels reflect where each product actually stands."
          />
          <FeatureGrid columns={4}>
            {PRODUCTS.map((product) => (
              <FeatureCard key={product.title} {...product} cta="View details" />
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

      {/* 7b — CleanBot scroll storytelling (real product) */}
      <CleanBotHowItWorks />

      {/* Solutions sub-section */}
      <Section bg="raised" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Where it deploys"
            title="Engineered for the spaces South Asia actually uses"
            subhead="From single homes to small factory floors — hardware designed for the environment, not just the demo."
          />
          <FeatureGrid columns={3}>
            {SOLUTIONS.map((solution) => (
              <FeatureCard key={solution.title} {...solution} cta="See solution" />
            ))}
          </FeatureGrid>
        </Container>
      </Section>

      {/* 8 — Status metrics */}
      <Section bg="base" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Where we stand"
            title="Honest status indicators"
            subhead="We use status labels, not invented statistics. Numbers will appear when we have verified evidence to share."
            size="compact"
          />
          <MetricBand metrics={METRICS} />
        </Container>
      </Section>

      {/* 9 — Blog / innovation teaser */}
      <Section bg="raised" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="From the lab"
            title="Notes from the workbench"
            subhead="Field reports, R&D logs, and tutorials from the ARIOT engineering team."
          />
          <FeatureGrid columns={3}>
            {BLOG_TEASERS.map((post) => (
              <FeatureCard key={post.title} {...post} cta="Read on" />
            ))}
          </FeatureGrid>
        </Container>
      </Section>

      {/* 10 — Final CTA band */}
      <CtaBand
        eyebrow="Get involved"
        title="Build something real with us"
        subtitle="Whether it is a quote request, a workspace enquiry, a component order, or a research collaboration — get in touch and we will route you to the right person."
        primary={{ label: 'Request a quote', href: '/quote' }}
        secondary={{ label: 'Contact ARIOT', href: '/contact' }}
        backgroundVideo={{
          webm: '/media/home/home-hero-cinematic-arm-01-21x9.webm',
          mp4: '/media/home/home-hero-cinematic-arm-01-21x9.mp4',
          poster: '/media/home/home-hero-cinematic-arm-01-poster-21x9.avif',
        }}
      />
    </>
  );
}
