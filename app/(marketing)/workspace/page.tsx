import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, BookOpen, Cpu, FlaskConical, Layers, Users, Wrench } from 'lucide-react';
import { CtaBand } from '@/components/marketing/cta-band';
import { FeatureCard } from '@/components/marketing/feature-card';
import { FeatureGrid } from '@/components/marketing/feature-grid';
import { HeroShell } from '@/components/marketing/hero-shell';
import { SectionHeader } from '@/components/marketing/section-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { BreadcrumbList } from '@/components/seo/breadcrumb-list';
import { defineMetadata } from '@/lib/seo/metadata';

const whoIsItFor = [
  {
    icon: Users,
    title: 'Students',
    description:
      'Undergraduate and graduate students working on robotics, electronics, or IoT projects who need proper bench space and tools.',
  },
  {
    icon: Cpu,
    title: 'Engineers & researchers',
    description:
      'Working engineers and academic researchers who need a dedicated technical environment outside a corporate or university lab.',
  },
  {
    icon: FlaskConical,
    title: 'Robotics teams',
    description:
      'Competition teams, research groups, and independent builders who need a reliable shared space with power, tools, and assembly room.',
  },
  {
    icon: Layers,
    title: 'Startups & founders',
    description:
      'Early-stage hardware founders who need a low-cost prototyping environment before committing to dedicated premises.',
  },
] as const;

const plannedFacilities = [
  { label: 'Electronics workbench' },
  { label: 'Soldering station' },
  { label: 'Multimeters & probes' },
  { label: 'Bench power supplies' },
  { label: 'Hand & assembly tools' },
  { label: 'Meeting & whiteboard area' },
  { label: 'High-speed internet' },
  { label: 'Engineering support' },
  { label: 'Oscilloscope (where available)' },
  { label: 'Robot assembly floor space' },
] as const;

const rentalOptions = [
  { period: 'Hourly', description: 'Drop-in sessions for focused work.' },
  { period: 'Daily', description: 'Full-day access for intensive builds.' },
  { period: 'Weekly', description: 'Short-term residency for a sprint.' },
  { period: 'Monthly', description: 'Dedicated desk access for ongoing projects.' },
] as const;

export const metadata: Metadata = defineMetadata({
  title: 'Robotics workspace',
  description:
    'ARIOT Technologies is planning a shared robotics and electronics co-working space for students, engineers, and research teams in Bangladesh.',
  path: '/workspace',
});

export default function WorkspacePage() {
  return (
    <>
      <BreadcrumbList
        items={[
          { name: 'Home', url: '/' },
          { name: 'Workspace', url: '/workspace' },
        ]}
      />

      <HeroShell>
        <Section bg="base" spacing="loose">
          <Container className="flex flex-col gap-8">
            <Badge variant="warning">Planned Initiative</Badge>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-start">
              <div className="flex flex-col gap-6">
                <h1 className="text-steel-100 font-display text-4xl leading-[1.04] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
                  A shared engineering space for Bangladesh robotics builders
                </h1>
                <p className="text-steel-200 max-w-2xl text-base sm:text-lg md:text-xl">
                  ARIOT Technologies is building a robotics co-working and engineering workspace — a
                  dedicated environment where students, engineers, and research teams can build,
                  test, and collaborate on hardware projects without needing a full lab.
                </p>
                <p className="border-steel-700 bg-bg-raised text-steel-300 max-w-2xl rounded-lg border px-5 py-4 text-sm">
                  <strong className="text-steel-100">Status:</strong> This is a planned initiative.
                  Facilities, pricing, and opening details are still being finalised. Register your
                  interest below to be notified when it opens.
                </p>
                <div>
                  <Button asChild size="xl" variant="primary">
                    <Link href="/contact">
                      Register interest
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              {/* Glass facilities summary */}
              <div className="glass-panel-strong flex flex-col gap-3 p-5">
                <p className="text-steel-400 font-mono text-[11px] tracking-[0.16em] uppercase">
                  Planned access
                </p>
                {rentalOptions.map((opt) => (
                  <div
                    key={opt.period}
                    className="border-steel-800 flex items-start gap-3 border-b pb-3 last:border-b-0 last:pb-0"
                  >
                    <span className="font-display w-16 shrink-0 text-base font-semibold text-cyan-400">
                      {opt.period}
                    </span>
                    <span className="text-steel-300 text-sm">{opt.description}</span>
                  </div>
                ))}
                <Badge variant="warning" className="mt-1 w-fit">
                  Pricing to be announced
                </Badge>
              </div>
            </div>
          </Container>
        </Section>
      </HeroShell>

      {/* Who is it for */}
      <Section bg="raised" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Who it is for"
            title="Built for hardware builders"
            subhead="Anyone working on a robotics, electronics, or IoT project who needs proper workspace without a full lab."
          />
          <FeatureGrid columns={4}>
            {whoIsItFor.map((item) => (
              <FeatureCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
              />
            ))}
          </FeatureGrid>
        </Container>
      </Section>

      {/* Planned facilities */}
      <Section bg="base" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Planned facilities"
            title="What will be available"
            subhead="Final equipment list will be confirmed before opening. These are the planned facilities based on current planning."
          />
          <ul className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
            {plannedFacilities.map((f) => (
              <li key={f.label} className="text-steel-200 flex items-center gap-2 text-sm">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400"
                />
                {f.label}
              </li>
            ))}
          </ul>
          <p className="text-steel-400 text-sm">
            Oscilloscope and advanced test equipment availability is subject to final procurement.
            Details will be announced before opening.
          </p>
        </Container>
      </Section>

      {/* Rental periods */}
      <Section bg="raised" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Access model"
            title="Planned rental periods"
            subhead="Final pricing has not been set. Indicative access models are listed below."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rentalOptions.map((opt) => (
              <Card key={opt.period} variant="steel">
                <CardBody className="flex flex-col gap-2 p-6">
                  <p className="font-display text-xl font-semibold tracking-tight text-cyan-400">
                    {opt.period}
                  </p>
                  <p className="text-steel-300 text-sm">{opt.description}</p>
                  <p className="text-steel-500 mt-1 font-mono text-xs">Pricing to be announced</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Intended use */}
      <Section bg="base" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="What you can do here"
            title="Project work, not just hot-desking"
            subhead="The space is designed for active engineering work — prototyping, assembly, testing, and collaboration."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Wrench,
                title: 'Electronics work',
                desc: 'Soldering, debugging, and circuit assembly on a proper bench with good lighting and ventilation.',
              },
              {
                icon: Layers,
                title: 'Robotics assembly',
                desc: 'Floor space and bench room for mechanical assembly and integration of sensors, actuators, and compute.',
              },
              {
                icon: FlaskConical,
                title: 'Testing',
                desc: 'Basic electrical test equipment and space to run supervised hardware validation sessions.',
              },
              {
                icon: BookOpen,
                title: 'Workshops & learning',
                desc: 'Periodic workshops on embedded systems, robotics, and IoT development — dates to be announced.',
              },
              {
                icon: Users,
                title: 'Team meetings',
                desc: 'Meeting area for design reviews, retrospectives, and collaborative planning sessions.',
              },
              {
                icon: Cpu,
                title: 'Project development',
                desc: 'Dedicated engineering time away from home or classroom distractions, with technical support available.',
              },
            ].map((item) => (
              <FeatureCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.desc}
              />
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Stay updated"
        title="Register your interest in the workspace"
        subtitle="Tell us about your project and access needs. We will reach out when the workspace opens for registration."
        primary={{ label: 'Register interest', href: '/contact' }}
        secondary={{ label: 'Ask about the workspace', href: '/contact' }}
      />
    </>
  );
}
