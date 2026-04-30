import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, BadgeCheck, Cog, Globe, Users } from 'lucide-react';
import { CtaBand } from '@/components/marketing/cta-band';
import { FeatureCard } from '@/components/marketing/feature-card';
import { FeatureGrid } from '@/components/marketing/feature-grid';
import { HeroShell } from '@/components/marketing/hero-shell';
import { LogoStrip } from '@/components/marketing/logo-strip';
import { MetricBand } from '@/components/marketing/metric-band';
import { SectionHeader } from '@/components/marketing/section-header';
import { Timeline } from '@/components/marketing/timeline';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { defineMetadata } from '@/lib/seo/metadata';

const metrics = [
  { value: '[X+]', label: 'Prototypes built' },
  { value: '[Y]', label: 'Product lines' },
  { value: '[Z]', label: 'Engineering domains' },
  { value: '[BD]', label: 'Home market' },
] as const;

const story = [
  {
    label: '[YEAR PENDING]',
    title: '[ARIOT foundation milestone]',
    description: '[Company origin story and early robotics/IoT focus to be approved by founders.]',
  },
  {
    label: '[YEAR PENDING]',
    title: '[First prototype milestone]',
    description: '[A real prototype or lab milestone will replace this placeholder.]',
  },
  {
    label: '[YEAR PENDING]',
    title: '[First field deployment]',
    description: '[Deployment details, site type, and measured outcome pending approval.]',
  },
  {
    label: '[NEXT]',
    title: '[South Asia expansion path]',
    description: '[Regional support, partnerships, and product roadmap statement pending.]',
  },
] as const;

const focusAreas = [
  {
    icon: Cog,
    title: '[Engineering ownership]',
    description: '[We align mechanics, electronics, firmware, cloud, and service documentation around the same product goal.]',
  },
  {
    icon: Globe,
    title: '[South Asian context]',
    description: '[Power reliability, network conditions, climate, and support access are treated as design constraints.]',
  },
  {
    icon: BadgeCheck,
    title: '[Quality path]',
    description: '[Manufacturing, QA, and certification claims stay bracketed until verified by real evidence.]',
  },
] as const;

const partnerPlaceholders = [
  { label: '[Certification pending]' },
  { label: '[Institution pending]' },
  { label: '[Partner pending]' },
  { label: '[Customer pending]' },
] as const;

export const metadata: Metadata = defineMetadata({
  title: 'About ARIOT',
  description:
    'Learn about ARIOT, a Bangladesh-based robotics and IoT engineering company building for South Asian conditions.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <>
      <HeroShell>
        <Section bg="base" spacing="loose">
          <Container className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div className="flex flex-col gap-6">
              <p className="text-cyan-400 font-mono text-[12px] font-medium tracking-[0.18em] uppercase">
                [OUR STORY]
              </p>
              <div>
                <h1 className="text-steel-100 font-display text-4xl font-semibold leading-[1.04] tracking-tight text-balance sm:text-5xl md:text-6xl">
                  We build autonomy for the environments we know
                </h1>
                <p className="text-steel-200 mt-5 max-w-2xl text-base sm:text-lg md:text-xl">
                  [We build the machines and systems that let South Asia automate on its own terms.]
                </p>
              </div>
              <Button asChild size="xl" variant="primary" className="w-fit">
                <Link href="/contact">
                  Work with us
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <Card variant="glass">
              <CardBody className="p-4 md:p-6">
                <div
                  role="img"
                  aria-label="ARIOT lab placeholder"
                  className="border-steel-700 bg-bg-base relative aspect-[4/3] overflow-hidden rounded-lg border"
                >
                  <span className="text-steel-500 absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.18em] uppercase">
                    [LAB PHOTO PLACEHOLDER]
                  </span>
                </div>
              </CardBody>
            </Card>
          </Container>
        </Section>
      </HeroShell>

      <Section bg="raised" spacing="compact">
        <Container>
          <p className="text-steel-100 mx-auto max-w-4xl text-center font-display text-2xl font-semibold leading-snug tracking-tight md:text-4xl">
            [ARIOT exists to engineer practical robotics and connected systems that can be built, serviced, and trusted in Bangladesh and across South Asia.]
          </p>
        </Container>
      </Section>

      <Section bg="base" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="By the numbers"
            title="Proof points will replace placeholders"
            subhead="[Until real evidence is approved, every metric remains bracketed.]"
            size="compact"
          />
          <MetricBand metrics={metrics} />
        </Container>
      </Section>

      <Section bg="raised" spacing="default">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1fr] lg:items-start">
          <SectionHeader
            eyebrow="Story"
            title="Milestones, not mythology"
            subhead="[Founder-approved milestones will replace this timeline.]"
            size="compact"
          />
          <Timeline items={story} />
        </Container>
      </Section>

      <Section bg="base" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Engineering focus"
            title="What makes ARIOT credible"
            subhead="[Capability claims stay concrete and evidence-led.]"
          />
          <FeatureGrid columns={3}>
            {focusAreas.map((area) => (
              <FeatureCard key={area.title} {...area} />
            ))}
          </FeatureGrid>
        </Container>
      </Section>

      <Section bg="raised" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Team"
            title="People behind the systems"
            subhead="[Real team names, roles, bios, and photographs are required before launch.]"
          />
          <FeatureGrid columns={3}>
            {[1, 2, 3].map((member) => (
              <FeatureCard
                key={member}
                icon={Users}
                title={`[Team member ${member}]`}
                description="[Role, engineering focus, and approved one-line bio pending.]"
              />
            ))}
          </FeatureGrid>
        </Container>
      </Section>

      <Section bg="base" spacing="compact">
        <Container>
          <LogoStrip eyebrow="Certifications & partners" items={partnerPlaceholders} />
        </Container>
      </Section>

      <Section bg="raised" spacing="default">
        <Container>
          <Card variant="glass">
            <CardBody className="flex flex-col gap-4 p-6 md:p-8">
              <p className="text-cyan-400 font-mono text-[11px] tracking-[0.18em] uppercase">
                [PRESS / NEWS]
              </p>
              <h2 className="text-steel-100 font-display text-3xl font-semibold tracking-tight">
                [Recent mentions pending]
              </h2>
              <p className="text-steel-300 max-w-2xl text-base">
                [Press links, institution announcements, or founder updates will appear here when real sources exist.]
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Next step"
        title="Build with a team that owns the whole system"
        subtitle="[Tell us what you are trying to automate, monitor, or prototype.]"
        primary={{ label: 'Contact ARIOT', href: '/contact' }}
        secondary={{ label: 'Request a quote', href: '/quote' }}
      />
    </>
  );
}
