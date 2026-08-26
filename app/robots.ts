import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/seo/site';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/account', '/auth', '/api', '/checkout', '/cart'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
