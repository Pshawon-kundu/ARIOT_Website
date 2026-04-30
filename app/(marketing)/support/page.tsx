import Link from 'next/link';
import type { Metadata } from 'next';
import {
  BookOpen,
  Download,
  FileText,
  MessageCircle,
  Search,
  Settings2,
  ShieldCheck,
  Wifi,
} from 'lucide-react';
import { CtaBand } from '@/components/marketing/cta-band';
import { FeatureCard } from '@/components/marketing/feature-card';
import { FeatureGrid } from '@/components/marketing/feature-grid';
import { HeroShell } from '@/components/marketing/hero-shell';
import { SectionHeader } from '@/components/marketing/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Section } from '@/components/ui/section';
import { defineMetadata } from '@/lib/seo/metadata';

const supportCategories = [
  {
    icon: BookOpen,
    title: '[Getting started]',
    description: '[First setup, unboxing, account basics, and safe power-on checks.]',
  },
  {
    icon: Settings2,
    title: '[Setup & install]',
    description: '[Mounting, wiring, calibration, and deployment preparation.]',
  },
  {
    icon: Wifi,
    title: '[Connectivity]',
    description: '[Wi-Fi, Bluetooth, MQTT, gateway, and network troubleshooting.]',
  },
  {
    icon: Download,
    title: '[Firmware]',
    description: '[Version notes, update preparation, and recovery guidance.]',
  },
  {
    icon: MessageCircle,
    title: '[Troubleshooting]',
    description: '[Symptom-led guidance for common device and app issues.]',
  },
  {
    icon: ShieldCheck,
    title: '[Warranty & returns]',
    description: '[Coverage, service flow, repair windows, and return requirements.]',
  },
] as const;

const faqs = [
  {
    question: '[How do I find the right manual?]',
    answer: '[Search by product name, SKU, or setup task. Public manuals are placeholders until real PDFs ship.]',
  },
  {
    question: '[How do firmware updates work?]',
    answer: '[Firmware release notes and files will live in the support hub after the device-management phase.]',
  },
  {
    question: '[Can I open a support ticket here?]',
    answer: '[Ticket creation is intentionally deferred. For now, use the contact or quote forms as static UI.]',
  },
] as const;

const downloads = [
  '[Autonomous floor-cleaning robot datasheet (PDF, size pending)]',
  '[IoT home safety device installation guide (PDF, size pending)]',
  '[Smart appliance control wiring guide (PDF, size pending)]',
  '[Education robotics kit curriculum outline (PDF, size pending)]',
] as const;

export const metadata: Metadata = defineMetadata({
  title: 'Support hub',
  description:
    'Find ARIOT manuals, setup guidance, firmware placeholders, FAQs, and support contact paths.',
  path: '/support',
});

export default function SupportPage() {
  return (
    <>
      <HeroShell>
        <Section bg="base" spacing="loose">
          <Container className="flex flex-col gap-8">
            <p className="text-cyan-400 font-mono text-[12px] font-medium tracking-[0.18em] uppercase">
              [SUPPORT]
            </p>
            <div className="max-w-4xl">
              <h1 className="text-steel-100 font-display text-4xl font-semibold leading-[1.04] tracking-tight text-balance sm:text-5xl md:text-6xl">
                [Help, fast.]
              </h1>
              <p className="text-steel-200 mt-5 max-w-2xl text-base sm:text-lg md:text-xl">
                [Search manuals, setup notes, firmware placeholders, and troubleshooting paths for ARIOT hardware.]
              </p>
            </div>
            <FormField label="Search support" helper="[Static search UI — support search lands in a later phase.]">
              {(fieldProps) => (
                <div className="relative max-w-2xl">
                  <Search
                    aria-hidden
                    className="text-steel-500 pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2"
                  />
                  <Input
                    {...fieldProps}
                    className="h-14 pl-12 text-lg"
                    placeholder="Search manuals, articles, firmware…"
                  />
                </div>
              )}
            </FormField>
          </Container>
        </Section>
      </HeroShell>

      <Section bg="raised" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Top categories"
            title="Start with the task you are trying to finish"
            subhead="[Category pages and articles are placeholders until support content lands.]"
          />
          <FeatureGrid columns={3}>
            {supportCategories.map((category) => (
              <FeatureCard key={category.title} {...category} />
            ))}
          </FeatureGrid>
        </Container>
      </Section>

      <Section bg="base" spacing="default">
        <Container className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Manuals & downloads</CardTitle>
            </CardHeader>
            <CardBody>
              <ul className="flex flex-col gap-3">
                {downloads.map((download) => (
                  <li key={download}>
                    <Button asChild variant="secondary" className="w-full justify-start">
                      <Link href="/support">
                        <FileText className="h-4 w-4" />
                        {download}
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FAQ placeholder</CardTitle>
            </CardHeader>
            <CardBody>
              <dl className="flex flex-col gap-5">
                {faqs.map((faq) => (
                  <div key={faq.question} className="border-steel-800 border-b pb-5 last:border-b-0 last:pb-0">
                    <dt className="text-steel-100 font-display text-lg font-semibold">
                      {faq.question}
                    </dt>
                    <dd className="text-steel-300 mt-2 text-sm">{faq.answer}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Still stuck?"
        title="Talk to support before the issue grows"
        subtitle="[Ticketing is scheduled for a later phase. For now, route support questions through contact.]"
        primary={{ label: 'Contact support', href: '/contact' }}
        secondary={{ label: 'Request a quote', href: '/quote' }}
      />
    </>
  );
}
