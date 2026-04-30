import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  Building2,
  Factory,
  GraduationCap,
  House,
  Lightbulb,
  Settings2,
} from 'lucide-react';
import { CtaBand } from '@/components/marketing/cta-band';
import { FeatureCard } from '@/components/marketing/feature-card';
import { FeatureGrid } from '@/components/marketing/feature-grid';
import { FeatureStack } from '@/components/marketing/feature-stack';
import { HeroShell } from '@/components/marketing/hero-shell';
import { SectionHeader } from '@/components/marketing/section-header';
import { Timeline } from '@/components/marketing/timeline';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { defineMetadata } from '@/lib/seo/metadata';

const industries = [
  {
    icon: Factory,
    title: '[Smart Factory]',
    description: '[Machine telemetry, compact automation, and operator visibility for small production floors.]',
    href: '/quote',
  },
  {
    icon: House,
    title: '[Smart Homes]',
    description: '[Safety, appliance control, and energy visibility for connected residential spaces.]',
    href: '/quote',
  },
  {
    icon: Building2,
    title: '[Smart Offices]',
    description: '[Environment monitoring, access-aware workflows, and appliance control for SME offices.]',
    href: '/quote',
  },
  {
    icon: GraduationCap,
    title: '[Education]',
    description: '[Robotics labs, classroom kits, and guided hardware programs for institutions.]',
    href: '/quote',
  },
  {
    icon: Settings2,
    title: '[Energy & Utilities]',
    description: '[Sensor networks and dashboards for usage visibility, alerts, and field diagnostics.]',
    href: '/quote',
  },
  {
    icon: Lightbulb,
    title: '[Custom R&D]',
    description: '[Prototype-to-deployment work for teams building new robotics or IoT products.]',
    href: '/quote',
  },
] as const;

const engagementSteps = [
  {
    label: 'Discover',
    title: '[Map the environment]',
    description: '[We document the site, users, constraints, and the outcome that would make the deployment worth doing.]',
  },
  {
    label: 'Design',
    title: '[Choose the right architecture]',
    description: '[We define hardware, connectivity, software, service paths, and risks before a pilot starts.]',
  },
  {
    label: 'Pilot',
    title: '[Test with real operators]',
    description: '[A small deployment proves usability, reliability, and support needs before wider rollout.]',
  },
  {
    label: 'Deploy',
    title: '[Scale with documentation]',
    description: '[Install plans, handover notes, and technician-ready documentation keep rollout predictable.]',
  },
  {
    label: 'Support',
    title: '[Maintain the system]',
    description: '[Support paths, firmware planning, and field feedback loops keep the system useful after launch.]',
  },
] as const;

const approach = [
  {
    eyebrow: '01 · FIELD CONTEXT',
    title: '[Start with the site, not the device]',
    description: '[Power reliability, operator behavior, dust, humidity, and network availability shape the architecture from day one.]',
    chips: ['[Site survey]', '[Risk log]', '[Operator workflow]'],
  },
  {
    eyebrow: '02 · SYSTEM DESIGN',
    title: '[Integrate hardware, firmware, and cloud cleanly]',
    description: '[We align sensors, controllers, connectivity, dashboards, and support docs so the system has one owner.]',
    chips: ['[Sensors]', '[Firmware]', '[MQTT / HTTPS]'],
  },
  {
    eyebrow: '03 · SUPPORT MODEL',
    title: '[Design for maintenance before launch]',
    description: '[Deployment is not finished when the device powers on. We prepare the service path, spares, and escalation notes.]',
    chips: ['[Spares]', '[Manuals]', '[SLA pending]'],
  },
] as const;

export const metadata: Metadata = defineMetadata({
  title: 'IoT and robotics solutions',
  description:
    'Explore ARIOT robotics and IoT solution patterns for homes, offices, institutions, factories, and custom R&D projects.',
  path: '/solutions',
});

export default function SolutionsPage() {
  return (
    <>
      <HeroShell>
        <Section bg="base" spacing="loose">
          <Container className="flex flex-col gap-8">
            <p className="text-cyan-400 font-mono text-[12px] font-medium tracking-[0.18em] uppercase">
              [SOLUTIONS]
            </p>
            <div className="max-w-4xl">
              <h1 className="text-steel-100 font-display text-4xl font-semibold leading-[1.04] tracking-tight text-balance sm:text-5xl md:text-6xl">
                Engineered for the spaces South Asia actually runs
              </h1>
              <p className="text-steel-200 mt-5 max-w-2xl text-base sm:text-lg md:text-xl">
                [Industry-aware robotics and IoT systems for homes, offices, institutions, and small industries.]
              </p>
            </div>
            <div>
              <Button asChild size="xl" variant="primary">
                <Link href="/quote">
                  Discuss your project
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Container>
        </Section>
      </HeroShell>

      <Section bg="raised" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Industries"
            title="Choose a deployment pattern"
            subhead="[Each card is a placeholder for future industry detail pages.]"
          />
          <FeatureGrid columns={3}>
            {industries.map((industry) => (
              <FeatureCard
                key={industry.title}
                {...industry}
                cta="Discuss this"
              />
            ))}
          </FeatureGrid>
        </Container>
      </Section>

      <Section bg="base" spacing="default">
        <Container className="flex flex-col gap-16">
          <SectionHeader
            eyebrow="Approach"
            title="How we turn a requirement into a working system"
            subhead="[A practical engagement model for hardware projects that need field reliability.]"
          />
          <FeatureStack items={approach} />
        </Container>
      </Section>

      <Section bg="raised" spacing="default">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1fr] lg:items-start">
          <SectionHeader
            eyebrow="Process"
            title="A deployment workflow operators can follow"
            subhead="[This becomes the basis for project plans, quotes, and handover docs later.]"
            size="compact"
          />
          <Timeline items={engagementSteps} numbered />
        </Container>
      </Section>

      <Section bg="base" spacing="default">
        <Container>
          <Card variant="glass">
            <CardBody className="grid grid-cols-1 gap-8 p-6 md:p-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div>
                <p className="text-cyan-400 font-mono text-[11px] tracking-[0.18em] uppercase">
                  [CASE STUDY PLACEHOLDER]
                </p>
                <h2 className="text-steel-100 mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">
                  [Featured deployment story pending]
                </h2>
                <p className="text-steel-300 mt-4 max-w-2xl text-base">
                  [A real customer story will show problem, approach, deployment environment, and measured outcome once approved.]
                </p>
              </div>
              <div className="border-steel-700 bg-bg-base relative aspect-video overflow-hidden rounded-lg border">
                <span className="text-steel-500 absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.18em] uppercase">
                  [MEDIA SHOWCASE PLACEHOLDER]
                </span>
              </div>
            </CardBody>
          </Card>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Project fit"
        title="Have a site or workflow in mind?"
        subtitle="[Send us the environment, target outcome, and deployment timeline. We'll help scope the first practical step.]"
        primary={{ label: 'Request a quote', href: '/quote' }}
        secondary={{ label: 'Contact sales', href: '/contact' }}
      />
    </>
  );
}
