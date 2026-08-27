import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Separator } from '@/components/ui/separator';
import { Reveal } from '@/components/ui/reveal';
import { BrandMark } from '@/components/layout/brand-mark';
import { NewsletterForm } from '@/features/forms/newsletter-form';
import { cn } from '@/lib/utils/cn';

const COMPANY_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
] as const;

const RD_LINKS = [{ label: 'Research & development', href: '/research' }] as const;

const WORKSPACE_LINKS = [{ label: 'Robotics workspace', href: '/workspace' }] as const;

const COMPONENTS_LINKS = [{ label: 'Components store', href: '/components' }] as const;

const SOLUTIONS_LINKS = [
  { label: 'Smart Factory', href: '/solutions/smart-factory' },
  { label: 'Smart Agriculture', href: '/solutions/smart-agriculture' },
  { label: 'Smart City', href: '/solutions/smart-city' },
  { label: 'Energy & Utilities', href: '/solutions/energy' },
  { label: 'Education', href: '/solutions/education' },
] as const;

const RESOURCES_LINKS = [
  { label: 'Support hub', href: '/support' },
  { label: 'Manuals', href: '/support/manuals' },
  { label: 'Firmware', href: '/support/firmware' },
  { label: 'Blog', href: '/blog' },
] as const;

const LEGAL_LINKS = [
  { label: 'Privacy', href: '/legal/privacy' },
  { label: 'Terms', href: '/legal/terms' },
  { label: 'Cookies', href: '/legal/cookies' },
  { label: 'Warranty', href: '/legal/warranty' },
  { label: 'Shipping & returns', href: '/legal/shipping' },
] as const;

const footerLinkClass = cn(
  'rounded-sm text-sm text-white/70 hover:text-brand-orange',
  'transition-colors duration-200 ease-out-quart',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy',
);

/**
 * SiteFooter — public-website footer.
 * Server component shell with a small client island for the newsletter form.
 *
 * Link columns follow the approved public IA:
 *   Company · R&D · Workspace · Components · Solutions · Resources
 * Blog and Support remain reachable (Resources / More menu) without crowding
 * the primary nav. Only verified/real routes are linked — no placeholder or
 * unverified destinations.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="border-brand-navy bg-brand-navy relative overflow-hidden border-t"
    >
      <span
        aria-hidden
        className="via-brand-orange pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
      />
      {/* Oversized ARIoT symbol watermark — partially outside the footer boundary. */}
      <Image
        src="/media/brand/ariot-logo-symbol.png"
        alt=""
        aria-hidden
        width={1335}
        height={1194}
        className="pointer-events-none absolute -right-28 -bottom-24 w-[460px] opacity-[0.05] select-none md:w-[560px]"
      />
      <Container className="relative py-16 md:py-20">
        {/* Brand + contact CTA */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <Reveal
            className="ease-out-quart flex translate-y-3 flex-col gap-4 opacity-0 transition-all duration-500"
            revealClassName="opacity-100 translate-y-0"
          >
            <Link
              href="/"
              aria-label="ARIoT Technologies — home"
              className="focus-visible:ring-offset-bg-base focus-visible:ring-brand-orange inline-flex w-fit items-center rounded-lg transition-opacity duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <span className="bg-ariot-white shadow-2 inline-flex rounded-xl p-2.5">
                <BrandMark logoClassName="w-[170px]" />
              </span>
            </Link>
            <p className="max-w-md text-sm text-white/70">
              ARIOT Technologies researches autonomous robotics, develops connected IoT products,
              and is building the engineering workspace and component supply that local innovators
              need — engineered in Bangladesh for South Asia.
            </p>
          </Reveal>
          <div className="flex flex-col gap-4 lg:items-end">
            <Reveal
              className="ease-out-quart w-0 transition-[width] duration-500"
              revealClassName="w-14"
            >
              <span className="brand-line block" />
            </Reveal>
            <h3 className="font-mono text-xs font-medium tracking-[0.18em] text-white/60 uppercase">
              Get in touch
            </h3>
            <p className="max-w-md text-sm text-white/70 lg:text-right">
              Tell us what you are automating, monitoring, or prototyping — we will route you to the
              right engineer.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <Button asChild variant="primary" size="md">
                <Link href="/quote">Request a quote</Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="md"
                className="border-white/40 bg-transparent text-white hover:border-white/60 hover:bg-white/10"
              >
                <Link href="/contact">Contact ARIOT</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Link columns */}
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
          <FooterColumn title="Company" links={COMPANY_LINKS} />
          <FooterColumn title="R&D" links={RD_LINKS} />
          <FooterColumn title="Workspace" links={WORKSPACE_LINKS} />
          <FooterColumn title="Components" links={COMPONENTS_LINKS} />
          <FooterColumn title="Solutions" links={SOLUTIONS_LINKS} />
          <FooterColumn title="Resources" links={RESOURCES_LINKS} />
        </div>

        {/* Newsletter */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-[1.1fr_1fr] md:items-end">
          <div className="flex flex-col gap-2">
            <h3 className="font-mono text-xs font-medium tracking-[0.18em] text-white/60 uppercase">
              Newsletter
            </h3>
            <p className="max-w-md text-sm text-white/70">
              Quiet engineering notes from the ARIOT team — build logs, IoT field notes, and the
              occasional product update.
            </p>
          </div>
          <NewsletterForm source="footer" variant="footer" />
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-xs text-white/60">
            © {year} ARIOT Technologies. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(footerLinkClass, 'text-steel-400 text-xs hover:text-white/80')}
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
    <h3 className="font-mono text-xs font-medium tracking-[0.18em] text-white/60 uppercase">
      {children}
    </h3>
  );
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
