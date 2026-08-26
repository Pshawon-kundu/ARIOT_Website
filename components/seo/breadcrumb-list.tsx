import { JsonLd } from './json-ld';
import { siteConfig } from '@/lib/seo/site';

export interface BreadcrumbItem {
  /** Display name of the breadcrumb level. */
  name: string;
  /** Absolute path (e.g. `/products`). Last item should be the current page. */
  url: string;
}

interface BreadcrumbListProps {
  items: BreadcrumbItem[];
}

/**
 * Schema.org BreadcrumbList structured data.
 * Renders on every page except the homepage. Google displays breadcrumb
 * trails in search results, improving CTR and site hierarchy signals.
 */
export function BreadcrumbList({ items }: BreadcrumbListProps) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: new URL(item.url, siteConfig.url).toString(),
        })),
      }}
    />
  );
}
