import { JsonLd } from './json-ld';
import { siteConfig } from '@/lib/seo/site';

interface ServiceProps {
  /** Service name. */
  name: string;
  /** Service description. */
  description: string;
  /** Absolute URL of the service page image. */
  image?: string;
  /** Page URL path. */
  url: string;
  /** Industry / service category. */
  category?: string;
  /** Geographic area served. */
  areaServed?: string[];
  /** Related product names. */
  hasOfferCatalog?: string[];
}

/**
 * Schema.org Service structured data.
 * Renders on `/solutions/[slug]`. Enables service rich results and
 * tells Google this page describes a specific service offering.
 */
export function Service({
  name,
  description,
  image,
  url,
  category,
  areaServed,
  hasOfferCatalog,
}: ServiceProps) {
  const fullUrl = new URL(url, siteConfig.url).toString();

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name,
        description,
        ...(image ? { image } : {}),
        provider: {
          '@type': 'Organization',
          name: siteConfig.fullName,
          url: siteConfig.url,
        },
        url: fullUrl,
        ...(category ? { category } : {}),
        ...(areaServed && areaServed.length > 0
          ? {
              areaServed: areaServed.map((area) => ({
                '@type': 'Country',
                name: area,
              })),
            }
          : {}),
        ...(hasOfferCatalog && hasOfferCatalog.length > 0
          ? {
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: `${name} catalog`,
                itemListElement: hasOfferCatalog.map((productName) => ({
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Product',
                    name: productName,
                  },
                })),
              },
            }
          : {}),
      }}
    />
  );
}
