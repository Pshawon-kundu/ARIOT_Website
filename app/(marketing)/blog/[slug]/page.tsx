import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, Calendar, Clock, Tag, User } from 'lucide-react';
import { Breadcrumb } from '@/components/marketing/breadcrumb';
import { CtaBand } from '@/components/marketing/cta-band';
import { FeatureCard } from '@/components/marketing/feature-card';
import { FeatureGrid } from '@/components/marketing/feature-grid';
import { SectionHeader } from '@/components/marketing/section-header';
import { TableOfContents } from '@/components/marketing/table-of-contents';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Separator } from '@/components/ui/separator';
import { BreadcrumbList } from '@/components/seo/breadcrumb-list';
import { BlogPosting } from '@/components/seo/blog-posting';
import { defineMetadata, defineBlogMetadata } from '@/lib/seo/metadata';
import { BLOG_POSTS, getBlogPostBySlug, getRelatedPosts } from '@/features/blog/_data';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

/** Static import map — Next.js statically analyses these to bundle the right chunks. */
async function getContent(slug: string) {
  switch (slug) {
    case 'building-autonomous-robots-bangladesh':
      return (await import('@/content/blog/building-autonomous-robots-bangladesh.mdx')).default;
    case 'iot-sensor-networks-smart-agriculture':
      return (await import('@/content/blog/iot-sensor-networks-smart-agriculture.mdx')).default;
    case 'regional-robotics-local-engineering':
      return (await import('@/content/blog/regional-robotics-local-engineering.mdx')).default;
    default:
      return null;
  }
}

export function generateStaticParams(): Array<{ slug: string }> {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return defineMetadata({
      title: 'Post not found',
      description: 'The requested blog post could not be found.',
      path: `/blog/${slug}`,
      noindex: true,
    });
  }

  return defineBlogMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
    author: post.author.name,
    publishedTime: post.publishedAt,
    tags: post.tags,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const [MDXContent, relatedPosts] = await Promise.all([
    getContent(slug),
    Promise.resolve(getRelatedPosts(slug)),
  ]);

  const PostIcon = post.icon;

  return (
    <>
      <BlogPosting
        headline={post.title}
        description={post.excerpt}
        datePublished={post.publishedAt}
        url={`/blog/${post.slug}`}
        author={[post.author.name]}
        tags={[...post.tags]}
      />
      <BreadcrumbList
        items={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: post.category, url: '/blog' },
          { name: post.title, url: `/blog/${post.slug}` },
        ]}
      />

      {/* Hero */}
      <Section bg="base" spacing="loose">
        <Container className="flex flex-col gap-8">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: post.category, href: '/blog' },
              { label: post.title },
            ]}
          />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_0.35fr]">
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-3">
                <span
                  aria-hidden
                  className="bg-cyan-faint inline-flex h-10 w-10 items-center justify-center rounded-md text-cyan-400"
                >
                  <PostIcon className="h-5 w-5" />
                </span>
                <p className="font-mono text-[11px] tracking-[0.18em] text-cyan-400 uppercase">
                  {post.category}
                </p>
              </div>

              <h1 className="text-steel-100 font-display text-4xl leading-[1.04] font-semibold tracking-tight text-balance sm:text-5xl">
                {post.title}
              </h1>

              <p className="text-steel-200 text-lg sm:text-xl">{post.subtitle}</p>

              <div className="text-steel-400 flex flex-wrap items-center gap-4 font-mono text-[11px] tracking-[0.14em] uppercase">
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" aria-hidden />
                  {post.author.name}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" aria-hidden />
                  {post.publishedAt}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {post.readingTimeMinutes} min read
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border-steel-700 bg-bg-elevated text-steel-300 inline-flex items-center gap-1 rounded-full border px-3 py-1 font-mono text-[11px]"
                  >
                    <Tag className="h-3 w-3" aria-hidden />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero image placeholder */}
            <div
              role="img"
              aria-label={`${post.title} cover image placeholder`}
              className="border-steel-700 bg-bg-raised relative aspect-[4/3] overflow-hidden rounded-lg border lg:aspect-square"
            >
              <span
                aria-hidden
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    'linear-gradient(var(--bg-grid) 1px, transparent 1px), linear-gradient(90deg, var(--bg-grid) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />
              <span className="text-steel-500 absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.18em] uppercase">
                [COVER IMAGE — AI_ASSET_PIPELINE step 1.13]
              </span>
            </div>
          </div>
        </Container>
      </Section>

      <Separator />

      {/* Article body + TOC */}
      <Section bg="base" spacing="default">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_14rem] xl:grid-cols-[1fr_16rem]">
            {/* Body */}
            <article aria-label={post.title} className="min-w-0">
              <p className="text-steel-100 mb-10 text-lg leading-relaxed font-medium sm:text-xl">
                {post.excerpt}
              </p>

              {MDXContent ? (
                <div className="prose-ariot">
                  <MDXContent />
                </div>
              ) : (
                <p className="text-steel-400 font-mono text-sm">
                  [MDX content not found for slug: {slug}]
                </p>
              )}

              <Separator className="my-12" />

              {/* Author bio */}
              <Card variant="glass">
                <CardBody className="flex items-start gap-4 p-6">
                  <div
                    role="img"
                    aria-label={`${post.author.name} avatar placeholder`}
                    className="border-steel-700 bg-bg-base h-12 w-12 flex-shrink-0 rounded-full border"
                  />
                  <div>
                    <p className="text-steel-100 font-display font-semibold">{post.author.name}</p>
                    <p className="text-steel-400 text-sm">{post.author.role}</p>
                    <p className="text-steel-300 mt-2 text-sm">
                      [Author bio pending — will appear once engineering team profiles are
                      approved.]
                    </p>
                  </div>
                </CardBody>
              </Card>

              <div className="mt-10">
                <Button asChild variant="ghost">
                  <Link href="/blog">
                    <ArrowLeft className="h-4 w-4" />
                    Back to blog
                  </Link>
                </Button>
              </div>
            </article>

            {/* Sticky TOC sidebar */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <TableOfContents items={post.toc} />
            </aside>
          </div>
        </Container>
      </Section>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <Section bg="raised" spacing="default">
          <Container className="flex flex-col gap-12">
            <SectionHeader
              eyebrow="Keep reading"
              title="Related engineering notes"
              size="compact"
            />
            <FeatureGrid columns={2}>
              {relatedPosts.map((related) => (
                <FeatureCard
                  key={related.slug}
                  icon={related.icon}
                  eyebrow={`${related.category} · ${related.readingTimeMinutes} min`}
                  title={related.title}
                  description={related.excerpt}
                  href={`/blog/${related.slug}`}
                  cta="Read"
                />
              ))}
            </FeatureGrid>
          </Container>
        </Section>
      )}

      <CtaBand
        eyebrow="Newsletter"
        title="Get engineering notes when they ship"
        subtitle="Build logs and field notes from the ARIOT team — sent only when there is something worth reading."
        primary={{ label: 'Subscribe', href: '/blog#newsletter' }}
        secondary={{ label: 'Browse all posts', href: '/blog' }}
      />
    </>
  );
}
