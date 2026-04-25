import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Separator } from '@/components/ui/separator';
import { siteConfig } from '@/lib/seo/site';
import { cn } from '@/lib/utils/cn';

const PRODUCT_LINKS = [
  { label: 'All products', href: '/products' },
  { label: 'Industrial robotics', href: '/products/category/robotics' },
  { label: 'Smart-city IoT', href: '/products/category/smart-city' },
  { label: 'Smart-building IoT', href: '/products/category/smart-building' },
  { label: 'Education kits', href: '/products/category/education' },
] as const;

const SOLUTIONS_LINKS = [
  { label: 'Smart Factory', href: '/solutions/smart-factory' },
  { label: 'Smart Agriculture', href: '/solutions/smart-agriculture' },
  { label: 'Smart City', href: '/solutions/smart-city' },
  { label: 'Energy & Utilities', href: '/solutions/energy' },
  { label: 'Education', href: '/solutions/education' },
] as const;

const SUPPORT_LINKS = [
  { label: 'Support hub', href: '/support' },
  { label: 'Manuals', href: '/support/manuals' },
  { label: 'Firmware', href: '/support/firmware' },
  { label: 'Open a ticket', href: '/support/ticket' },
  { label: 'Contact', href: '/contact' },
] as const;

const COMPANY_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Innovation Lab', href: '/innovation-lab' },
  { label: 'Blog', href: '/blog' },
  { label: 'Press', href: '/about/press' },
  { label: 'Careers', href: '/careers' },
] as const;

const LEGAL_LINKS = [
  { label: 'Privacy', href: '/legal/privacy' },
  { label: 'Terms', href: '/legal/terms' },
  { label: 'Cookies', href: '/legal/cookies' },
  { label: 'Warranty', href: '/legal/warranty' },
  { label: 'Shipping & returns', href: '/legal/shipping' },
] as const;

// Social brand icons intentionally deferred — lucide-react v1 dropped
// brand icons. We will add them as inline SVGs (or via a dedicated brand-
// icon library) in a follow-up sub-turn once the brand handles are real.

const footerLinkClass = cn(
  'rounded-sm text-sm text-steel-200 hover:text-cyan-400',
  'transition-colors duration-200 ease-out-quart',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
);

/**
 * SiteFooter — public-website footer (DESIGN_SYSTEM §13 + PAGE_BLUEPRINTS §13).
 * Pure server component. Newsletter form lands in Sub-turn 5.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer role="contentinfo" className="border-t border-steel-800 bg-bg-base">
      <Container className="py-16 md:py-24">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-12">
          {/* Brand column */}
          <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
            <Link
              href="/"
              className="font-display text-xl font-semibold tracking-tight text-steel-100"
            >
              ARIOT
            </Link>
            <p className="max-w-xs text-sm text-steel-300">
              [Autonomous robotics and intelligent IoT systems engineered in
              South Asia for the real world.]
            </p>
            <p className="mt-2 max-w-xs font-mono text-xs text-steel-500">
              [Engineered in Bangladesh · Deployed across South Asia]
            </p>
          </div>

          <FooterStack>
            <FooterColumn title="Products" links={PRODUCT_LINKS} />
            <FooterColumn title="Solutions" links={SOLUTIONS_LINKS} />
          </FooterStack>

          <FooterStack>
            <FooterColumn title="Support" links={SUPPORT_LINKS} />
            <FooterColumn title="Company" links={COMPANY_LINKS} />
          </FooterStack>

          {/* Contact / CTA column */}
          <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
            <FooterColumnTitle>Get in touch</FooterColumnTitle>
            <p className="text-sm text-steel-300">
              [Talk to our sales team for an enterprise quote, or explore our
              product catalog.]
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild variant="primary" size="md">
                <Link href="/quote">Request a quote</Link>
              </Button>
              <Button asChild variant="secondary" size="md">
                <Link href="/contact">Talk to sales</Link>
              </Button>
            </div>
            <p className="mt-2 font-mono text-xs text-steel-400">
              {siteConfig.contact.email}
              <br />
              {siteConfig.contact.phone}
            </p>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-xs text-steel-400">
            © {year} ARIOT. [All rights reserved.]
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(footerLinkClass, 'text-xs text-steel-400 hover:text-steel-200')}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-steel-400">
      {children}
    </h3>
  );
}

function FooterStack({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-6">{children}</div>;
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <FooterColumnTitle>{title}</FooterColumnTitle>
      <ul className="flex flex-col gap-2">
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={footerLinkClass}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
