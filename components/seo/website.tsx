import { JsonLd } from './json-ld';
import { siteConfig } from '@/lib/seo/site';

interface WebSiteProps {
  /** Override the default site name. */
  name?: string;
  /** Override the default URL. */
  url?: string;
}

/**
 * Schema.org WebSite structured data.
 * Renders on the homepage. Enables Google sitelinks searchbox and
 * establishes the site as a web entity.
 */
export function WebSite({ name = siteConfig.name, url = siteConfig.url }: WebSiteProps) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name,
        url,
        publisher: {
          '@type': 'Organization',
          name: siteConfig.fullName,
        },
      }}
    />
  );
}
