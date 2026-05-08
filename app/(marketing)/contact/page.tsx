import type { Metadata } from 'next';
import { Mail, MessageCircle, Newspaper, Phone } from 'lucide-react';
import { ContactForm } from '@/features/forms/contact-form';
import { FeatureCard } from '@/components/marketing/feature-card';
import { FeatureGrid } from '@/components/marketing/feature-grid';
import { HeroShell } from '@/components/marketing/hero-shell';
import { SectionHeader } from '@/components/marketing/section-header';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { siteConfig } from '@/lib/seo/site';
import { defineMetadata } from '@/lib/seo/metadata';

const channels = [
  {
    icon: Mail,
    title: '[Sales]',
    description: `[Use for product questions, quote routing, and partner inquiries. Email: ${siteConfig.contact.email}. SLA: [1 business day].]`,
  },
  {
    icon: MessageCircle,
    title: '[Support]',
    description: '[Use for setup help, manuals, firmware questions, and warranty direction. SLA: [SLA pending].]',
  },
  {
    icon: Newspaper,
    title: '[Press]',
    description: '[Use for media requests, founder background, and approved company information.]',
  },
] as const;

export const metadata: Metadata = defineMetadata({
  title: 'Contact ARIOT',
  description:
    'Contact ARIOT for robotics products, IoT systems, support questions, partnerships, and press inquiries.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <HeroShell>
        <Section bg="base" spacing="loose">
          <Container className="flex flex-col gap-6">
            <p className="text-cyan-400 font-mono text-[12px] font-medium tracking-[0.18em] uppercase">
              [CONTACT]
            </p>
            <div className="max-w-4xl">
              <h1 className="text-steel-100 font-display text-4xl font-semibold leading-[1.04] tracking-tight text-balance sm:text-5xl md:text-6xl">
                Talk to us
              </h1>
              <p className="text-steel-200 mt-5 max-w-2xl text-base sm:text-lg md:text-xl">
                [Reach the right ARIOT team for sales, support, partnerships, or press.]
              </p>
            </div>
          </Container>
        </Section>
      </HeroShell>

      <Section bg="raised" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Channels"
            title="Route the message correctly"
            subhead="[Use the form below if you are not sure where the request belongs.]"
          />
          <FeatureGrid columns={3}>
            {channels.map((channel) => (
              <FeatureCard key={channel.title} {...channel} />
            ))}
          </FeatureGrid>
        </Container>
      </Section>

      <Section bg="base" spacing="default">
        <Container className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.75fr]">
          <Card>
            <CardHeader>
              <CardTitle>Contact form</CardTitle>
            </CardHeader>
            <CardBody>
              <ContactForm />
            </CardBody>
          </Card>

          <Card variant="glass">
            <CardBody className="flex flex-col gap-6 p-6 md:p-8">
              <div>
                <p className="text-cyan-400 font-mono text-[11px] tracking-[0.18em] uppercase">
                  [OFFICE LOCATOR]
                </p>
                <h2 className="text-steel-100 mt-3 font-display text-3xl font-semibold tracking-tight">
                  Bangladesh base, South Asia focus
                </h2>
                <p className="text-steel-300 mt-4 text-base">
                  [Office address, hours, and maps link pending real launch details.]
                </p>
              </div>
              <div className="text-steel-300 flex flex-col gap-3 text-sm">
                <p className="inline-flex items-center gap-2">
                  <Mail className="text-cyan-400 h-4 w-4" />
                  {siteConfig.contact.email}
                </p>
                <p className="inline-flex items-center gap-2">
                  <Phone className="text-cyan-400 h-4 w-4" />
                  {siteConfig.contact.phone}
                </p>
              </div>
              <div className="border-steel-700 bg-bg-base relative aspect-video rounded-lg border">
                <span className="text-steel-500 absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.18em] uppercase">
                  [MAP PLACEHOLDER]
                </span>
              </div>
            </CardBody>
          </Card>
        </Container>
      </Section>
    </>
  );
}
