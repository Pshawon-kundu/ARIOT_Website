import Link from 'next/link';
import type { Metadata } from 'next';
import { Download, FileText } from 'lucide-react';
import { Breadcrumb } from '@/components/marketing/breadcrumb';
import { HeroShell } from '@/components/marketing/hero-shell';
import { SectionHeader } from '@/components/marketing/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { defineMetadata } from '@/lib/seo/metadata';

const MANUALS = [
  {
    product: '[Autonomous floor-cleaning robot]',
    documents: [
      { label: '[Datasheet v0.1 (PDF, size pending)]', href: '#' },
      { label: '[Quick-start guide (PDF, size pending)]', href: '#' },
      { label: '[Safety notice (PDF, size pending)]', href: '#' },
    ],
  },
  {
    product: '[IoT home safety device]',
    documents: [
      { label: '[Datasheet v0.1 (PDF, size pending)]', href: '#' },
      { label: '[Installation guide (PDF, size pending)]', href: '#' },
      { label: '[Sensor replacement guide (PDF, size pending)]', href: '#' },
    ],
  },
  {
    product: '[Smart appliance control]',
    documents: [
      { label: '[Datasheet v0.1 (PDF, size pending)]', href: '#' },
      { label: '[Wiring guide (PDF, size pending)]', href: '#' },
    ],
  },
  {
    product: '[IoT gateway node]',
    documents: [
      { label: '[Deployment brief (PDF, size pending)]', href: '#' },
      { label: '[Protocol sheet (PDF, size pending)]', href: '#' },
      { label: '[Enclosure mounting guide (PDF, size pending)]', href: '#' },
    ],
  },
  {
    product: '[Education robotics kit]',
    documents: [
      { label: '[Curriculum outline (PDF, size pending)]', href: '#' },
      { label: '[Lab guide (PDF, size pending)]', href: '#' },
      { label: '[Component reference (PDF, size pending)]', href: '#' },
    ],
  },
] as const;

export const metadata: Metadata = defineMetadata({
  title: 'Manuals & downloads',
  description:
    'Download ARIOT product datasheets, installation guides, quick-start guides, and safety notices.',
  path: '/support/manuals',
});

export default function ManualsPage() {
  return (
    <>
      <HeroShell>
        <Section bg="base" spacing="loose">
          <Container className="flex flex-col gap-6">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Support', href: '/support' },
                { label: 'Manuals & downloads' },
              ]}
            />
            <div className="max-w-4xl">
              <p className="font-mono text-[12px] font-medium tracking-[0.18em] text-cyan-400 uppercase">
                [SUPPORT / MANUALS]
              </p>
              <h1 className="text-steel-100 font-display mt-4 text-4xl leading-[1.04] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
                Manuals &amp; downloads
              </h1>
              <p className="text-steel-200 mt-5 max-w-2xl text-base sm:text-lg">
                [Product datasheets, installation guides, quick-start cards, and safety notices. All
                documents are placeholder links until production-ready PDFs are approved.]
              </p>
            </div>
          </Container>
        </Section>
      </HeroShell>

      <Section bg="raised" spacing="default">
        <Container className="flex flex-col gap-10">
          <SectionHeader
            eyebrow="All products"
            title="Find your document"
            subhead="[Documents are released alongside hardware. Placeholder items will become live download links.]"
            size="compact"
          />
          <div className="flex flex-col gap-6">
            {MANUALS.map((group) => (
              <Card key={group.product}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-cyan-400" aria-hidden />
                    {group.product}
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                    {group.documents.map((doc) => (
                      <li key={doc.label}>
                        <Button
                          asChild
                          variant="secondary"
                          size="sm"
                          className="w-full justify-start sm:w-auto"
                        >
                          <Link href={doc.href}>
                            <Download className="h-4 w-4" />
                            {doc.label}
                          </Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section bg="base" spacing="default">
        <Container>
          <Card variant="glass">
            <CardBody className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
              <div>
                <h2 className="text-steel-100 font-display text-2xl font-semibold tracking-tight">
                  [Missing a document?]
                </h2>
                <p className="text-steel-300 mt-2 text-sm">
                  [If a document for your product is not listed, contact the support team with the
                  product name and serial number.]
                </p>
              </div>
              <Button asChild variant="primary">
                <Link href="/contact">Contact support</Link>
              </Button>
            </CardBody>
          </Card>
        </Container>
      </Section>
    </>
  );
}
