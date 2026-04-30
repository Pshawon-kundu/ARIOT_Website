import {
  BookOpen,
  Bot,
  Building2,
  Factory,
  FlaskConical,
  GraduationCap,
  House,
  PlugZap,
  ShieldCheck,
  Sparkles,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import type { FeatureStackItem } from '@/components/marketing/feature-stack';
import type { Metric } from '@/components/marketing/metric-band';

/**
 * Marketing-route home page content.
 *
 * Lives next to `page.tsx` under the underscored convention so Next.js
 * does not route to it. Bracketed copy is intentional and grep-able
 * (CONTENT_STRATEGY §10 anti-patterns).
 *
 * Real product names, prices, and metrics replace the placeholders as
 * the catalog work lands in Phase 2.
 */
interface FeatureCardData {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description: string;
  chips?: ReadonlyArray<string>;
  href?: string;
}

// Section 2 — capability strip (renders via <LogoStrip>)
export const CAPABILITIES = [
  { label: 'Autonomous systems' },
  { label: 'Embedded electronics' },
  { label: 'IoT safety' },
  { label: 'Product R&D' },
  { label: 'Support-ready' },
] as const;

// Section 3 — product showcase preview
export const PRODUCTS: ReadonlyArray<FeatureCardData> = [
  {
    icon: Bot,
    eyebrow: '[CONCEPT — IN R&D]',
    title: 'Autonomous floor-cleaning robot',
    description:
      '[Self-mapping, low-noise cleaning for homes and small offices. Runs unattended on a schedule.]',
    chips: ['[LiDAR]', '[SLAM]', '[Wi-Fi]'],
    href: '/products',
  },
  {
    icon: ShieldCheck,
    eyebrow: '[IOT SAFETY]',
    title: 'IoT home safety device',
    description:
      '[Connected smoke, gas, and motion sensing with phone alerts and a local siren — no cloud-only dependency.]',
    chips: ['[Wi-Fi]', '[BLE]', '[Buzzer]'],
    href: '/products',
  },
  {
    icon: PlugZap,
    eyebrow: '[SMART HOME]',
    title: 'Smart appliance control',
    description:
      '[Switch, schedule, and meter common appliances over Wi-Fi from one app, with offline fallback.]',
    chips: ['[Wi-Fi]', '[Energy meter]', '[App]'],
    href: '/products',
  },
  {
    icon: FlaskConical,
    eyebrow: '[CUSTOM]',
    title: 'Custom robotics & R&D',
    description:
      '[Prototype-to-product engagements for institutions, integrators, and industry pilots.]',
    chips: ['[Discover]', '[Prototype]', '[Deploy]'],
    href: '/quote',
  },
] as const;

// Section 4 — solutions
export const SOLUTIONS: ReadonlyArray<FeatureCardData> = [
  {
    icon: House,
    title: 'Homes',
    description:
      '[Smart safety, energy, and convenience devices for everyday households.]',
    href: '/solutions',
  },
  {
    icon: Building2,
    title: 'Offices',
    description:
      '[Connected access, environment monitoring, and appliance control for SMEs.]',
    href: '/solutions',
  },
  {
    icon: GraduationCap,
    title: 'Institutions',
    description:
      '[Robotics labs, classroom kits, and infrastructure for schools and universities.]',
    href: '/solutions',
  },
  {
    icon: Factory,
    title: 'Small industries',
    description:
      '[Compact automation, sensor networks, and energy monitoring for small-batch production.]',
    href: '/solutions',
  },
  {
    icon: Sparkles,
    title: 'Custom robotics projects',
    description:
      '[Tailored builds for research groups, integrators, and enterprise pilots.]',
    href: '/quote',
  },
] as const;

// Section 5 — engineering capability (3 hero rows + chip strip of all 5)
export const ENGINEERING_PILLARS: ReadonlyArray<FeatureStackItem> = [
  {
    eyebrow: '01 · NAVIGATION & AUTONOMY',
    title: 'Real-room autonomy, not lab-perfect demos',
    description:
      '[We design control loops, planning, and obstacle handling that work on real floors and real factory aisles — not perfect simulations.]',
    chips: ['[ROS 2]', '[LiDAR]', '[SLAM]'],
  },
  {
    eyebrow: '02 · EMBEDDED CONTROL',
    title: 'Custom boards tuned for the duty cycle',
    description:
      '[We pick the silicon, lay out the PCB, and write the firmware — every signal chain matched to how the device actually runs in the field.]',
    chips: ['[STM32]', '[ESP32-S3]', '[RTOS]'],
  },
  {
    eyebrow: '03 · CLOUD- & APP-READY IOT',
    title: 'Devices that report without surprising operators',
    description:
      '[Authentication, telemetry, and OTA updates designed for flaky regional networks — not just the demo Wi-Fi.]',
    chips: ['[MQTT]', '[HTTPS]', '[OTA]'],
  },
];

export const ENGINEERING_FULL_LIST = [
  'Navigation & autonomy',
  'Sensor integration',
  'Embedded control',
  'Cloud & app-ready IoT',
  'Prototyping to deployment',
] as const;

// Section 6 — metrics
export const METRICS: ReadonlyArray<Metric> = [
  { value: '[X+]', label: 'Prototypes built' },
  { value: '[Y]', label: 'Product lines in development' },
  { value: '[Z]', label: 'Regions covered for support' },
  { value: '[<24h]', label: 'Avg. quote response' },
];

// Section 7 — blog / innovation teaser
export const BLOG_TEASERS: ReadonlyArray<FeatureCardData> = [
  {
    icon: FlaskConical,
    eyebrow: '[ROBOTICS R&D]',
    title: 'Build logs from the lab floor',
    description:
      '[Control theory, mechanical decisions, and the small wins that make autonomous machines actually finish the job.]',
    href: '/blog',
  },
  {
    icon: Wifi,
    eyebrow: '[IOT IN BANGLADESH]',
    title: 'Why deployments here look different',
    description:
      '[Power reliability, regional networks, and the design choices that make IoT stick in real South Asian environments.]',
    href: '/blog',
  },
  {
    icon: BookOpen,
    eyebrow: '[BUILD LOGS · TUTORIALS]',
    title: 'Hands-on guides for engineers',
    description:
      '[Practical walkthroughs for robotics and IoT engineers — protocols, firmware patterns, and field-tested approaches.]',
    href: '/blog',
  },
] as const;
