import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Search } from 'lucide-react';
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
import { Select } from '@/components/ui/select';
import { defineMetadata } from '@/lib/seo/metadata';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CONNECTIVITY,
  PRODUCT_USE_CASES,
  PRODUCTS,
} from '@/app/(marketing)/products/_data';

export const metadata: Metadata = defineMetadata({
  title: 'All products',
  description:
    'Explore ARIOT robotics products, IoT devices, education kits, and custom embedded systems for Bangladesh and South Asia.',
  path: '/products',
});

export default function ProductsPage() {
  return (
    <>
      <HeroShell>
        <Section bg="base" spacing="loose">
          <Container className="flex flex-col gap-6">
            <p className="text-cyan-400 font-mono text-[12px] font-medium tracking-[0.18em] uppercase">
              [PRODUCTS]
            </p>
            <div className="flex max-w-4xl flex-col gap-5">
              <h1 className="text-steel-100 font-display text-4xl font-semibold leading-[1.04] tracking-tight text-balance sm:text-5xl md:text-6xl">
                All products
              </h1>
              <p className="text-steel-200 max-w-2xl text-base sm:text-lg md:text-xl">
                [Industrial robots, IoT systems, and educational kits — engineered for the South Asian context.]
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {PRODUCT_CATEGORIES.map((category) => (
                <span
                  key={category}
                  className="border-steel-700 bg-bg-elevated text-steel-200 rounded-sm border px-3 py-1 font-mono text-[11px] tracking-[0.14em] uppercase"
                >
                  {category}
                </span>
              ))}
            </div>
          </Container>
        </Section>
      </HeroShell>

      <Section bg="raised" spacing="default">
        <Container className="grid grid-cols-1 gap-8 lg:grid-cols-[18rem_1fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle>Catalog filters</CardTitle>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                <FormField label="Search" helper="[Static UI — filtering lands with catalog logic later.]">
                  {(fieldProps) => (
                    <div className="relative">
                      <Search
                        aria-hidden
                        className="text-steel-500 pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                      />
                      <Input
                        {...fieldProps}
                        className="pl-9"
                        placeholder="[Search products]"
                      />
                    </div>
                  )}
                </FormField>
                <FormField label="Category">
                  {(fieldProps) => (
                    <Select {...fieldProps} defaultValue="">
                      <option value="">[All categories]</option>
                      {PRODUCT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormField>
                <FormField label="Use case">
                  {(fieldProps) => (
                    <Select {...fieldProps} defaultValue="">
                      <option value="">[All use cases]</option>
                      {PRODUCT_USE_CASES.map((useCase) => (
                        <option key={useCase} value={useCase}>
                          {useCase}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormField>
                <FormField label="Connectivity">
                  {(fieldProps) => (
                    <Select {...fieldProps} defaultValue="">
                      <option value="">[Any connectivity]</option>
                      {PRODUCT_CONNECTIVITY.map((connectivity) => (
                        <option key={connectivity} value={connectivity}>
                          {connectivity}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormField>
                <Button type="button" variant="secondary">
                  Apply placeholder filters
                </Button>
              </CardBody>
            </Card>
          </aside>

          <div className="flex flex-col gap-8">
            <SectionHeader
              eyebrow="Catalog"
              title="Find the right hardware path"
              subhead="[Product cards link to detail pages. Pricing, stock, and compare logic land in later phases.]"
              size="compact"
            />
            <FeatureGrid columns={3}>
              {PRODUCTS.map((product) => (
                <FeatureCard
                  key={product.slug}
                  icon={product.icon}
                  eyebrow={product.status}
                  title={product.title}
                  description={product.description}
                  chips={product.chips}
                  href={`/products/${product.slug}`}
                  cta="View product"
                />
              ))}
            </FeatureGrid>
            <Card>
              <CardBody className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-steel-100 font-display text-2xl font-semibold tracking-tight">
                    [No exact match?]
                  </h2>
                  <p className="text-steel-300 mt-2 text-sm">
                    [Request a custom build and an engineer will map the right hardware path.]
                  </p>
                </div>
                <Button asChild variant="primary">
                  <Link href="/quote">
                    Request a custom solution
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Custom systems"
        title="Need something outside the catalog?"
        subtitle="[Share the environment, constraints, and target outcome. We'll route it to the right engineering track.]"
        primary={{ label: 'Request a quote', href: '/quote' }}
        secondary={{ label: 'Talk to sales', href: '/contact' }}
      />
    </>
  );
}
