import type { Metadata } from 'next';
import { siteConfig } from '@/lib/seo/site';

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
  /** Optional per-page OG image. Falls back to the default OG image. */
  image?: string;
  /** Set true to opt this page out of search engine indexing. */
  noindex?: boolean;
}

/**
 * Single source of per-page metadata composition.
 *
 * Every page that ships its own `metadata` export should compose it via
 * this helper, so canonical URLs, OG defaults, robots directives, and
 * the title template stay consistent across the site.
 *
 *   export const metadata: Metadata = defineMetadata({
 *     title: 'Products',
 *     description: 'Explore the ARIOT product catalog.',
 *     path: '/products',
 *   });
 */
export function defineMetadata({
  title,
  description = siteConfig.description,
  path,
  image,
  noindex = false,
}: DefineMetadataInput): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const ogImage = image ?? '/og/default.png';

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
