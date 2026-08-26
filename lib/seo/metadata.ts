import type { Metadata } from 'next';
import { siteConfig } from '@/lib/seo/site';

/* ---------------------------------------------------------------------------
 * OG image URL builder
 *
 * Generates a dynamic OG image URL via `/api/og`. Each page type gets its own
 * badge color. When `type` is omitted the badge is hidden.
 * ------------------------------------------------------------------------ */

type OgPageType = 'product' | 'blog' | 'solution' | 'support' | '';

function buildOgUrl(title: string, type: OgPageType = ''): string {
  const base = `${siteConfig.url}/api/og`;
  const params = new URLSearchParams();
  params.set('title', title);
  if (type) params.set('type', type);
  return `${base}?${params.toString()}`;
}

/* ---------------------------------------------------------------------------
 * Base metadata
 * ------------------------------------------------------------------------ */

interface DefineMetadataInput {
  /** Page-specific title. Will be composed with the global title template
   *  in `app/layout.tsx` to produce e.g. `Products — ARIOT`. */
  title: string;
  /** Optional override of the page description. Falls back to the site
   *  default when omitted. */
  description?: string;
  /** Path of this page (e.g. `/products`, `/blog/some-slug`). Used to
   *  build the canonical URL. Always include the leading slash. */
  path: string;
  /** Optional per-page OG image URL override. When omitted, a dynamic OG
   *  image is generated from the page title. */
  image?: string;
  /** Set true to opt this page out of search engine indexing. */
  noindex?: boolean;
  /** Page type used to render a colored badge on the OG image. */
  ogType?: OgPageType;
}

/**
 * Shared metadata builder. All page-type variants delegate here for the
 * common fields (title, description, canonical, OG base, twitter base,
 * robots) and then layer page-type-specific overrides on top.
 */
export function defineMetadata({
  title,
  description = siteConfig.description,
  path,
  image,
  noindex = false,
  ogType = '',
}: DefineMetadataInput): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const ogImage = image ?? buildOgUrl(title, ogType);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${title} — ${siteConfig.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

/* ---------------------------------------------------------------------------
 * Product metadata
 *
 * Used by `/products/[slug]`. Adds OG type "website" with product-specific
 * overrides (category, price) so social previews show product context.
 * ------------------------------------------------------------------------ */

interface DefineProductMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  category?: string;
  noindex?: boolean;
}

export function defineProductMetadata({
  title,
  description,
  path,
  image,
  category,
  noindex = false,
}: DefineProductMetadataInput): Metadata {
  const base = defineMetadata({
    title,
    description,
    path,
    image,
    noindex,
    ogType: 'product',
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: 'website',
      title,
      description,
      ...(category ? { section: category } : {}),
    },
    twitter: {
      ...base.twitter,
      title,
      description,
    },
  };
}

/* ---------------------------------------------------------------------------
 * Blog metadata
 *
 * Used by `/blog/[slug]`. Sets OG type to "article" so Facebook, LinkedIn,
 * and other platforms render the link as a rich article card with author,
 * publication date, and tags.
 * ------------------------------------------------------------------------ */

interface DefineBlogMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: ReadonlyArray<string>;
  noindex?: boolean;
}

export function defineBlogMetadata({
  title,
  description,
  path,
  image,
  author = siteConfig.name,
  publishedTime,
  modifiedTime,
  tags,
  noindex = false,
}: DefineBlogMetadataInput): Metadata {
  const base = defineMetadata({
    title,
    description,
    path,
    image,
    noindex,
    ogType: 'blog',
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: 'article',
      title,
      description,
      authors: [author],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(tags && tags.length > 0 ? { tags: [...tags] } : {}),
    },
    twitter: {
      ...base.twitter,
      title,
      description,
    },
  };
}

/* ---------------------------------------------------------------------------
 * Solution metadata
 *
 * Used by `/solutions/[slug]`. Keeps OG type "website" — solutions are
 * service pages, not articles. Adds section metadata for分类 context.
 * ------------------------------------------------------------------------ */

interface DefineSolutionMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  industry?: string;
  noindex?: boolean;
}

export function defineSolutionMetadata({
  title,
  description,
  path,
  image,
  industry,
  noindex = false,
}: DefineSolutionMetadataInput): Metadata {
  const base = defineMetadata({
    title,
    description,
    path,
    image,
    noindex,
    ogType: 'solution',
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: 'website',
      title,
      description,
      ...(industry ? { section: industry } : {}),
    },
    twitter: {
      ...base.twitter,
      title,
      description,
    },
  };
}

/* ---------------------------------------------------------------------------
 * Support article metadata
 *
 * Used by `/support/article/[slug]`. Sets OG type to "article" (tech
 * article). Adds tags for product context so link previews are informative.
 * ------------------------------------------------------------------------ */

interface DefineSupportArticleMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: ReadonlyArray<string>;
  noindex?: boolean;
}

export function defineSupportArticleMetadata({
  title,
  description,
  path,
  image,
  publishedTime,
  modifiedTime,
  tags,
  noindex = false,
}: DefineSupportArticleMetadataInput): Metadata {
  const base = defineMetadata({
    title,
    description,
    path,
    image,
    noindex,
    ogType: 'support',
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: 'article',
      title,
      description,
      authors: [siteConfig.name],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(tags && tags.length > 0 ? { tags: [...tags] } : {}),
    },
    twitter: {
      ...base.twitter,
      title,
      description,
    },
  };
}
