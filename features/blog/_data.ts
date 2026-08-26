import { BookOpen, FlaskConical, Wifi, type LucideIcon } from 'lucide-react';
import { slugify } from '@/lib/utils/slugify';

export interface TocItem {
  id: string;
  text: string;
}

export interface BlogAuthor {
  name: string;
  role: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  tags: ReadonlyArray<string>;
  author: BlogAuthor;
  publishedAt: string;
  readingTimeMinutes: number;
  icon: LucideIcon;
  excerpt: string;
  /** TOC items derived from the MDX file's h2 headings.
   *  IDs must match what rehype-slug generates from the heading text. */
  toc: ReadonlyArray<TocItem>;
}

function toc(headings: ReadonlyArray<string>): ReadonlyArray<TocItem> {
  return headings.map((text) => ({ text, id: slugify(text) }));
}

export const BLOG_POSTS: ReadonlyArray<BlogPost> = [
  {
    slug: 'building-autonomous-robots-bangladesh',
    title: 'Building autonomous robots in Bangladesh',
    subtitle: 'What changes when you design for South Asian floors, power, and field conditions.',
    category: 'Robotics R&D',
    tags: ['autonomous-systems', 'product-development', 'south-asia'],
    author: { name: '[ARIOT Engineering Team]', role: '[Robotics Lead]' },
    publishedAt: '[DATE PENDING]',
    readingTimeMinutes: 8,
    icon: FlaskConical,
    excerpt:
      'How designing autonomous robots for real South Asian environments — dust, uneven surfaces, power fluctuations — changes every engineering assumption imported from Western research labs.',
    toc: toc([
      'Why lab-proven autonomy fails in the field',
      'SLAM on real surfaces',
      'Power management for a 220V country with brownouts',
      'Thermal performance in a hot, humid climate',
      'What we learned so far',
    ]),
  },
  {
    slug: 'iot-sensor-networks-smart-agriculture',
    title: 'IoT sensor networks for smart agriculture',
    subtitle:
      'Building reliable field telemetry for smallholder farms with intermittent connectivity.',
    category: 'IoT in Bangladesh',
    tags: ['iot', 'agriculture', 'lorawan', 'telemetry'],
    author: { name: '[ARIOT Engineering Team]', role: '[IoT Systems Lead]' },
    publishedAt: '[DATE PENDING]',
    readingTimeMinutes: 6,
    icon: Wifi,
    excerpt:
      'Designing a sensor network for smallholder farms in rural Bangladesh means accepting intermittent connectivity, solar power variability, and operators who need decisions — not dashboards.',
    toc: toc([
      'The connectivity assumption problem',
      'Soil moisture sensing in the field',
      'Solar harvesting for node autonomy',
      'Alerts, not dashboards',
    ]),
  },
  {
    slug: 'regional-robotics-local-engineering',
    title: 'Why regional robotics needs local engineering',
    subtitle:
      'The case for building hardware knowledge inside Bangladesh rather than importing solutions.',
    category: 'Engineering Notes',
    tags: ['engineering', 'bangladesh', 'manufacturing', 'ecosystem'],
    author: { name: '[ARIOT Engineering Team]', role: '[Founder]' },
    publishedAt: '[DATE PENDING]',
    readingTimeMinutes: 10,
    icon: BookOpen,
    excerpt:
      'Importing a robot or IoT system designed for a different market means paying more, waiting longer, and getting hardware that does not match local conditions, power, or support paths. Building local engineering capacity changes the equation.',
    toc: toc([
      'The import-first assumption',
      'What local engineering unlocks',
      'The skills gap is real but closeable',
      'What this means for ARIOT',
    ]),
  },
] as const;

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getRelatedPosts(slug: string): ReadonlyArray<BlogPost> {
  return BLOG_POSTS.filter((post) => post.slug !== slug).slice(0, 2);
}
