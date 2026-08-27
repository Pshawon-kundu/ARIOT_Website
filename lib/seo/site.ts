import { env } from '@/server/env';

/**
 * Single-source site configuration. Imported wherever metadata, JSON-LD,
 * sitemap, robots, or analytics consume site-level identity.
 *
 * Bracketed values are intentional placeholders — replace with real values
 * before public launch (Phase 1 follow-up).
 */
export const siteConfig = {
  name: 'ARIoT',
  fullName: 'ARIoT Technologies',
  description:
    '[ARIOT engineers autonomous robotics and intelligent IoT systems for industry, smart cities, education, and prosumers across South Asia.]',
  url: env.NEXT_PUBLIC_SITE_URL,
  locale: 'en_US',
  defaultLocale: 'en',
  themeColor: '#08090B',
  keywords: [
    'robotics',
    'IoT',
    'autonomous robots',
    'industrial automation',
    'smart city',
    'sensors',
    'Bangladesh robotics',
    'South Asia robotics',
    'ARIOT',
  ],
  social: {
    twitter: '[@ariot]',
    linkedin: '[ariot]',
    github: '[ariot]',
  },
  contact: {
    email: '[hello@ariot.example]',
    phone: '[+880-XX-XXXXXXX]',
    address: {
      country: 'Bangladesh',
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
