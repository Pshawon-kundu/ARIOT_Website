import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, BookOpen, Calendar, Clock, FlaskConical, Wifi } from 'lucide-react';
import { FeatureCard } from '@/components/marketing/feature-card';
import { FeatureGrid } from '@/components/marketing/feature-grid';
import { HeroShell } from '@/components/marketing/hero-shell';
import { SectionHeader } from '@/components/marketing/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { NewsletterForm } from '@/features/forms/newsletter-form';
import { BreadcrumbList } from '@/components/seo/breadcrumb-list';
import { defineMetadata } from '@/lib/seo/metadata';

const categories = [
  'Robotics R&D',
  'IoT in Bangladesh',
  'Smart Industry',
  'Build Logs',
  'Tutorials',
  'Engineering Notes',
] as const;

const posts = [
  {
    icon: FlaskConical,
    eyebrow: 'Robotics R&D · 8 min',
    title: 'What makes a robot reliable outside the lab',
    description:
      'A field note on dust, uneven floors, power cycles, and why autonomy work starts with the environment.',
  },
  {
    icon: Wifi,
    eyebrow: 'IoT in Bangladesh · 6 min',
    title: 'Designing IoT for unreliable networks',
    description:
      'How buffering, local alarms, and recovery states shape a deployment in real regional conditions.',
  },
  {
    icon: BookOpen,
    eyebrow: 'Tutorial · 10 min',
    title: 'A practical MQTT checklist for device teams',
    description:
      'Topic naming, retry behavior, credentials, and logs — the details that keep telemetry useful.',
  },
] as const;

export const metadata: Metadata = defineMetadata({
  title: 'Blog — engineering notes',
  description:
    'Read ARIOT engineering notes, robotics R&D logs, IoT deployment thinking, and tutorials for South Asian hardware teams.',
  path: '/blog',
});

export default function BlogPage() {
  const featured = posts[0];

  return (
    <>
      <BreadcrumbList
        items={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
        ]}
      />
      <HeroShell>
        <Section bg="base" spacing="loose">
          <Container className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div className="flex flex-col gap-6">
              <p className="font-mono text-[12px] font-medium tracking-[0.18em] text-cyan-400 uppercase">
                Blog
              </p>
              <div>
                <h1 className="text-steel-100 font-display text-4xl leading-[1.04] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
                  Notes from the engineering floor
                </h1>
                <p className="text-steel-200 mt-5 max-w-2xl text-base sm:text-lg md:text-xl">
                  Build logs, field notes, and practical tutorials from ARIOT robotics and IoT work.
                  Published when there is something real to share.
                </p>
              </div>
              <Button asChild size="xl" variant="primary" className="w-fit">
                <Link href="/blog">
                  Read featured post
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <Card variant="glass">
              <CardBody className="p-6 md:p-8">
                <p className="font-mono text-[11px] tracking-[0.18em] text-cyan-400 uppercase">
                  {featured.eyebrow}
                </p>
                <h2 className="text-steel-100 font-display mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
                  {featured.title}
                </h2>
                <p className="text-steel-300 mt-4 text-base">{featured.description}</p>
                <div className="text-steel-400 mt-6 flex flex-wrap gap-4 font-mono text-[11px] tracking-[0.14em] uppercase">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    To be published
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />8 min read
                  </span>
                </div>
              </CardBody>
            </Card>
          </Container>
        </Section>
      </HeroShell>

      <Section bg="raised" spacing="compact">
        <Container>
          <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Blog categories">
            {categories.map((category) => (
              <li key={category}>
                <span className="border-steel-700 bg-bg-elevated text-steel-200 inline-flex rounded-full border px-4 py-2 font-mono text-[11px] tracking-[0.16em] whitespace-nowrap uppercase">
                  {category}
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section bg="base" spacing="default">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Latest posts"
            title="Writing that shows the work"
            subhead="Published when there is genuine engineering insight to share — not on a content-marketing schedule."
          />
          <FeatureGrid columns={3}>
            {posts.slice(1).map((post) => (
              <FeatureCard key={post.title} {...post} href="/blog" cta="Read" />
            ))}
          </FeatureGrid>
        </Container>
      </Section>

      <Section bg="raised" spacing="default">
        <Container>
          <Card variant="glass">
            <CardBody className="grid grid-cols-1 gap-8 p-6 md:p-8 lg:grid-cols-[0.7fr_1fr] lg:items-center">
              <div className="border-steel-700 relative aspect-video overflow-hidden rounded-lg border">
                <Image
                  src="/media/blog/blog-build-log-feature-01-16x9.svg"
                  alt="Build log — workbench session"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: 'linear-gradient(180deg, transparent 50%, var(--bg-base) 100%)',
                  }}
                />
              </div>
              <div>
                <p className="font-mono text-[11px] tracking-[0.18em] text-cyan-400 uppercase">
                  Build logs
                </p>
                <h2 className="text-steel-100 font-display mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                  Longer-form engineering content coming
                </h2>
                <p className="text-steel-300 mt-4 text-base">
                  Build logs, teardowns, and tutorial series will be published here as ARIOT
                  production and lab work produces content worth sharing in depth.
                </p>
              </div>
            </CardBody>
          </Card>
        </Container>
      </Section>

      <Section bg="raised" spacing="default" className="relative isolate overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 0%, var(--cyan-faint) 0%, transparent 60%)',
          }}
        />
        <Container>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
            <p className="font-mono text-[12px] font-medium tracking-[0.18em] text-cyan-400 uppercase">
              Newsletter
            </p>
            <h2 className="text-steel-100 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
              Get engineering notes when they ship
            </h2>
            <p className="text-steel-300 max-w-xl text-base sm:text-lg">
              Build logs, IoT field notes, and the occasional teardown — sent only when there is
              something engineered worth reading.
            </p>
            <NewsletterForm source="blog" variant="inline" className="mt-2 w-full max-w-lg" />
          </div>
        </Container>
      </Section>
    </>
  );
}
