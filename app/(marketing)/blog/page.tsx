import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, BookOpen, Calendar, Clock, FlaskConical, Newspaper, Wifi } from 'lucide-react';
import { CtaBand } from '@/components/marketing/cta-band';
import { FeatureCard } from '@/components/marketing/feature-card';
import { FeatureGrid } from '@/components/marketing/feature-grid';
import { HeroShell } from '@/components/marketing/hero-shell';
import { SectionHeader } from '@/components/marketing/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { defineMetadata } from '@/lib/seo/metadata';

const categories = [
  '[Robotics R&D]',
  '[IoT in Bangladesh]',
  '[Smart Industry]',
  '[Build Logs]',
  '[Tutorials]',
  '[Engineering Notes]',
] as const;

const posts = [
  {
    icon: FlaskConical,
    eyebrow: '[ROBOTICS R&D · 8 MIN]',
    title: '[What makes a robot reliable outside the lab]',
    description: '[A field note on dust, uneven floors, power cycles, and why autonomy work starts with the environment.]',
  },
  {
    icon: Wifi,
    eyebrow: '[IOT IN BANGLADESH · 6 MIN]',
    title: '[Designing IoT for unreliable networks]',
    description: '[How buffering, local alarms, and recovery states shape a deployment in real regional conditions.]',
  },
  {
    icon: BookOpen,
    eyebrow: '[TUTORIAL · 10 MIN]',
    title: '[A practical MQTT checklist for device teams]',
    description: '[Topic naming, retry behavior, credentials, and logs — the details that keep telemetry useful.]',
  },
  {
    icon: Newspaper,
    eyebrow: '[BUILD LOG · 5 MIN]',
    title: '[Inside a safety-device enclosure review]',
    description: '[A short build log on sensor placement, cable strain relief, and service access.]',
  },
] as const;

export const metadata: Metadata = defineMetadata({
  title: 'Blog and innovation lab',
  description:
    'Read ARIOT engineering notes, robotics R&D logs, IoT deployment thinking, and tutorials for South Asian hardware teams.',
  path: '/blog',
});

export default function BlogPage() {
  const featuredPost = posts[0];

  return (
    <>
      <HeroShell>
        <Section bg="base" spacing="loose">
          <Container className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div className="flex flex-col gap-6">
              <p className="text-cyan-400 font-mono text-[12px] font-medium tracking-[0.18em] uppercase">
                [BLOG · INNOVATION LAB]
              </p>
              <div>
                <h1 className="text-steel-100 font-display text-4xl font-semibold leading-[1.04] tracking-tight text-balance sm:text-5xl md:text-6xl">
                  Notes from the engineering floor
                </h1>
                <p className="text-steel-200 mt-5 max-w-2xl text-base sm:text-lg md:text-xl">
                  [Build logs, field notes, and practical tutorials from ARIOT robotics and IoT work.]
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
                <p className="text-cyan-400 font-mono text-[11px] tracking-[0.18em] uppercase">
                  {featuredPost.eyebrow}
                </p>
                <h2 className="text-steel-100 mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl">
                  {featuredPost.title}
                </h2>
                <p className="text-steel-300 mt-4 text-base">{featuredPost.description}</p>
                <div className="text-steel-400 mt-6 flex flex-wrap gap-4 font-mono text-[11px] tracking-[0.14em] uppercase">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    [DATE PENDING]
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    [READ TIME]
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
                <span className="border-steel-700 bg-bg-elevated text-steel-200 inline-flex rounded-full border px-4 py-2 font-mono text-[11px] tracking-[0.16em] uppercase whitespace-nowrap">
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
            subhead="[No CMS yet. These are static placeholders for the future editorial system.]"
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
              <div className="border-steel-700 bg-bg-base relative aspect-video rounded-lg border">
                <span className="text-steel-500 absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.18em] uppercase">
                  [BUILD LOG MEDIA PLACEHOLDER]
                </span>
              </div>
              <div>
                <p className="text-cyan-400 font-mono text-[11px] tracking-[0.18em] uppercase">
                  [LAB]
                </p>
                <h2 className="text-steel-100 mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">
                  [Long-form innovation lab feature pending]
                </h2>
                <p className="text-steel-300 mt-4 text-base">
                  [This area will highlight build logs, case studies, and tutorial series once content production starts.]
                </p>
              </div>
            </CardBody>
          </Card>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Newsletter"
        title="Get engineering notes when they ship"
        subtitle="[Newsletter submission is UI-only in Phase 1. Backend subscription handling lands later.]"
        primary={{ label: 'Contact the team', href: '/contact' }}
        secondary={{ label: 'Explore products', href: '/products' }}
      />
    </>
  );
}
