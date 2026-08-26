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
import { BreadcrumbList } from '@/components/seo/breadcrumb-list';
import { FaqPage } from '@/components/seo/faq-page';
import { defineMetadata } from '@/lib/seo/metadata';

const supportCategories = [
  {
    icon: BookOpen,
    title: 'Getting started',
    description: 'First setup, unboxing, account basics, and safe power-on checks for new devices.',
  },
  {
    icon: Settings2,
    title: 'Setup & install',
    description: 'Mounting, wiring, calibration, and deployment preparation for ARIOT hardware.',
  },
  {
    icon: Wifi,
    title: 'Connectivity',
    description: 'Wi-Fi, Bluetooth, MQTT, gateway, and network troubleshooting guidance.',
  },
  {
    icon: Download,
    title: 'Firmware',
    description: 'Version notes, update preparation, and recovery guidance for device firmware.',
  },
  {
    icon: MessageCircle,
    title: 'Troubleshooting',
    description: 'Symptom-led guidance for common device and app issues encountered in the field.',
  },
  {
    icon: ShieldCheck,
    title: 'Warranty & returns',
    description: 'Coverage information, service flow, repair windows, and return requirements.',
  },
] as const;

const faqs = [
  {
    question: 'How do I find the right manual?',
    answer:
      'Manuals are listed below by product. Search by product name or setup task. Full PDF documentation ships with each product.',
  },
  {
    question: 'How do firmware updates work?',
    answer:
      'Firmware release notes and update files will be hosted here once device-management workflows are established. Check back after receiving your device.',
  },
  {
    question: 'Can I open a support ticket?',
    answer:
      'Ticket creation is in development. Use the contact form for now — support questions are routed to the right team within one business day.',
  },
] as const;

const downloads = [
  'Autonomous floor-cleaning robot datasheet',
  'IoT home safety device installation guide',
  'Smart appliance control wiring guide',
  'Education robotics kit curriculum outline',
] as const;

export const metadata: Metadata = defineMetadata({
  title: 'Support hub',
  description:
    'Find ARIOT manuals, setup guidance, firmware notes, FAQs, and support contact paths.',
  path: '/support',
});

export default function SupportPage() {
  return (
    <>
      <BreadcrumbList
        items={[
          { name: 'Home', url: '/' },
          { name: 'Support', url: '/support' },
        ]}
      />
      <FaqPage
        items={faqs.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        }))}
      />

      <HeroShell>
        <Section bg="base" spacing="loose">
          <Container className="flex flex-col gap-8">
            <p className="font-mono text-[12px] font-medium tracking-[0.18em] text-cyan-400 uppercase">
              Support
            </p>
            <div className="max-w-4xl">
              <h1 className="text-steel-100 font-display text-4xl leading-[1.04] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
                Help and documentation
              </h1>
              <p className="text-steel-200 mt-5 max-w-2xl text-base sm:text-lg md:text-xl">
                Manuals, setup guides, firmware notes, and troubleshooting paths for ARIOT hardware.
                Search or browse by category.
              </p>
            </div>
            <FormField
              label="Search support"
              helper="Full-text search is being built — browse categories below."
            >
              {(fieldProps) => (
                <div className="relative max-w-2xl">
                  <Search
                    aria-hidden
                    className="text-steel-500 pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2"
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
            subhead="Browse by category to find the right documentation or support path."
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
              <CardTitle>Manuals &amp; downloads</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="text-steel-400 mb-4 text-sm">
                Documentation PDFs are linked here once finalized for each product. Use the contact
                page to request a document directly.
              </p>
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
              <CardTitle>Frequently asked questions</CardTitle>
            </CardHeader>
            <CardBody>
              <dl className="flex flex-col gap-5">
                {faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="border-steel-800 border-b pb-5 last:border-b-0 last:pb-0"
                  >
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
        title="Reach support directly"
        subtitle="Use the contact form to describe your issue. Support messages are routed within one business day."
        primary={{ label: 'Contact support', href: '/contact' }}
        secondary={{ label: 'Request a quote', href: '/quote' }}
      />
    </>
  );
}
