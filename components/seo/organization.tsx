import { JsonLd } from './json-ld';
import { siteConfig } from '@/lib/seo/site';

interface OrganizationProps {
  /** Override the default organization name. */
  name?: string;
  /** Override the default URL. */
  url?: string;
  /** Logo image URL (absolute). */
  logo?: string;
}

/**
 * Schema.org Organization structured data.
 * Renders on the homepage and about page to establish entity identity
 * for Google Knowledge Panel and rich results.
 */
export function Organization({
  name = siteConfig.fullName,
  url = siteConfig.url,
  logo,
}: OrganizationProps) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name,
        url,
        ...(logo ? { logo } : {}),
        sameAs: [
          siteConfig.social.linkedin,
          siteConfig.social.github,
          siteConfig.social.twitter,
        ].filter((v) => v && !v.startsWith('[')),
        contactPoint: {
          '@type': 'ContactPoint',
          email: siteConfig.contact.email,
          telephone: siteConfig.contact.phone,
          contactType: 'customer service',
        },
        address: {
          '@type': 'PostalAddress',
          addressCountry: siteConfig.contact.address.country,
        },
      }}
    />
  );
}
