import type { Metadata } from 'next';
import { Briefcase, Package, Paperclip, UserRound } from 'lucide-react';
import { QuoteForm } from '@/features/forms/quote-form';
import { HeroShell } from '@/components/marketing/hero-shell';
import { Timeline } from '@/components/marketing/timeline';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { defineMetadata } from '@/lib/seo/metadata';

const steps = [
  { label: 'Project', icon: Briefcase },
  { label: 'Products', icon: Package },
  { label: 'Contact', icon: UserRound },
] as const;

const nextSteps = [
  {
    label: 'Confirmation email',
    title: '[We confirm receipt]',
    description: '[A quote ID and expectation-setting email will be generated when backend workflows land.]',
  },
  {
    label: 'Assigned engineer',
    title: '[The right engineer reviews scope]',
    description: '[Robotics, embedded, or IoT specialist assignment will depend on the requested outcome.]',
  },
  {
    label: 'Discovery call',
    title: '[We clarify constraints]',
    description: '[Site, duty cycle, environment, timeline, support, and procurement constraints get documented.]',
  },
  {
    label: 'Proposal',
    title: '[You receive the next practical step]',
    description: '[Proposal, pilot scope, or product recommendation depending on the project fit.]',
  },
] as const;

export const metadata: Metadata = defineMetadata({
  title: 'Request a quote',
  description:
    'Request an ARIOT quote for robotics products, IoT deployments, custom embedded systems, and South Asia field projects.',
  path: '/quote',
});

export default function QuotePage() {
  return (
    <>
      <HeroShell>
        <Section bg="base" spacing="loose">
          <Container className="flex flex-col gap-6">
            <p className="text-cyan-400 font-mono text-[12px] font-medium tracking-[0.18em] uppercase">
              [QUOTE]
            </p>
            <div className="max-w-4xl">
              <h1 className="text-steel-100 font-display text-4xl font-semibold leading-[1.04] tracking-tight text-balance sm:text-5xl md:text-6xl">
                Request a quote
              </h1>
              <p className="text-steel-200 mt-5 max-w-2xl text-base sm:text-lg md:text-xl">
                [Tell us about your project. We&apos;ll respond within [SLA] with the right engineer.]
              </p>
            </div>
          </Container>
        </Section>
      </HeroShell>

      <Section bg="raised" spacing="default">
        <Container className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <Card>
            <CardHeader>
              <CardTitle>Quote request form</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-8">
              <ol className="grid grid-cols-3 gap-2" aria-label="Quote form steps">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <li
                      key={step.label}
                      className="border-steel-700 bg-bg-elevated flex flex-col gap-2 rounded-md border p-3"
                    >
                      <span className="text-cyan-400 inline-flex h-8 w-8 items-center justify-center rounded-md bg-cyan-faint">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="text-steel-400 font-mono text-[10px] tracking-[0.18em] uppercase">
                        Step {index + 1}
                      </span>
                      <span className="text-steel-100 text-sm font-medium">{step.label}</span>
                    </li>
                  );
                })}
              </ol>

              <QuoteForm />
            </CardBody>
          </Card>

          <div className="flex flex-col gap-8 lg:sticky lg:top-28">
            <Card variant="glass">
              <CardBody className="flex flex-col gap-5 p-6 md:p-8">
                <p className="text-cyan-400 font-mono text-[11px] tracking-[0.18em] uppercase">
                  [WHAT HAPPENS NEXT]
                </p>
                <h2 className="text-steel-100 font-display text-3xl font-semibold tracking-tight">
                  A quote path with engineering review
                </h2>
                <p className="text-steel-300 text-base">
                  [We route each request by technical fit, not just by sales territory.]
                </p>
              </CardBody>
            </Card>
            <Timeline items={nextSteps} numbered />
            <Card>
              <CardBody className="flex items-start gap-3 p-6">
                <Paperclip className="text-cyan-400 mt-1 h-5 w-5" aria-hidden />
                <p className="text-steel-300 text-sm">
                  [Upload RFPs, drawings, device photos, or site notes when the backend intake flow lands.]
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
