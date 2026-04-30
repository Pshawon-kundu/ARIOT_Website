import type { Metadata } from 'next';
import { Briefcase, Package, Paperclip, Send, UserRound } from 'lucide-react';
import { HeroShell } from '@/components/marketing/hero-shell';
import { Timeline } from '@/components/marketing/timeline';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Section } from '@/components/ui/section';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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

              <form className="grid grid-cols-1 gap-8" aria-label="Quote request form placeholder">
                <fieldset className="grid grid-cols-1 gap-5">
                  <legend className="text-steel-100 mb-4 font-display text-2xl font-semibold tracking-tight">
                    Step 1 — Project
                  </legend>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FormField label="Industry" required>
                      {(fieldProps) => (
                        <Select {...fieldProps} defaultValue="">
                          <option value="">[Select industry]</option>
                          <option value="home">Homes</option>
                          <option value="office">Offices</option>
                          <option value="institution">Institutions</option>
                          <option value="industry">Small industries</option>
                        </Select>
                      )}
                    </FormField>
                    <FormField label="Timeline" required>
                      {(fieldProps) => (
                        <Select {...fieldProps} defaultValue="">
                          <option value="">[Select timeline]</option>
                          <option value="urgent">[Urgent]</option>
                          <option value="quarter">[This quarter]</option>
                          <option value="planning">[Planning stage]</option>
                        </Select>
                      )}
                    </FormField>
                  </div>
                  <FormField label="Use case" required>
                    {(fieldProps) => <Textarea {...fieldProps} placeholder="[What are you trying to automate, monitor, or prototype?]" />}
                  </FormField>
                  <FormField label="Expected scale">
                    {(fieldProps) => <Input {...fieldProps} placeholder="[Units / sites / users pending]" />}
                  </FormField>
                </fieldset>

                <fieldset className="grid grid-cols-1 gap-5">
                  <legend className="text-steel-100 mb-4 font-display text-2xl font-semibold tracking-tight">
                    Step 2 — Products
                  </legend>
                  <FormField label="Interested product category" required>
                    {(fieldProps) => (
                      <Select {...fieldProps} defaultValue="">
                        <option value="">[Select category]</option>
                        <option value="robotics">Robotics</option>
                        <option value="iot">IoT devices</option>
                        <option value="education">Education kits</option>
                        <option value="custom">Custom R&D</option>
                      </Select>
                    )}
                  </FormField>
                  <FormField label="Technical notes">
                    {(fieldProps) => <Textarea {...fieldProps} rows={5} placeholder="[Known constraints, preferred protocols, environment details.]" />}
                  </FormField>
                  <FormField label="Attachment">
                    {(fieldProps) => <Input {...fieldProps} type="file" />}
                  </FormField>
                </fieldset>

                <fieldset className="grid grid-cols-1 gap-5">
                  <legend className="text-steel-100 mb-4 font-display text-2xl font-semibold tracking-tight">
                    Step 3 — Contact
                  </legend>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FormField label="Name" required>
                      {(fieldProps) => <Input {...fieldProps} placeholder="[Your name]" />}
                    </FormField>
                    <FormField label="Company" required>
                      {(fieldProps) => <Input {...fieldProps} placeholder="[Company / institution]" />}
                    </FormField>
                    <FormField label="Role">
                      {(fieldProps) => <Input {...fieldProps} placeholder="[Role]" />}
                    </FormField>
                    <FormField label="Email" required>
                      {(fieldProps) => <Input {...fieldProps} type="email" placeholder="[name@company.com]" />}
                    </FormField>
                    <FormField label="Phone">
                      {(fieldProps) => <Input {...fieldProps} type="tel" placeholder="[Phone number]" />}
                    </FormField>
                    <FormField label="Preferred contact channel">
                      {(fieldProps) => (
                        <Select {...fieldProps} defaultValue="email">
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="meeting">Meeting</option>
                        </Select>
                      )}
                    </FormField>
                  </div>
                </fieldset>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-steel-400 text-sm">
                    [Static UI only — quote submission backend is not part of Phase 1.]
                  </p>
                  <Button type="button" size="lg" variant="primary">
                    <Send className="h-4 w-4" />
                    Send placeholder quote request
                  </Button>
                </div>
              </form>
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
