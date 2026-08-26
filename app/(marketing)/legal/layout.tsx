import Link from 'next/link';
import type { ReactNode } from 'react';
import { Breadcrumb } from '@/components/marketing/breadcrumb';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Separator } from '@/components/ui/separator';

interface LegalLayoutProps {
  children: ReactNode;
}

/**
 * Legal layout — wraps all legal/* pages with consistent breadcrumb
 * and document chrome. Inherits the (marketing) layout's header/footer.
 */
export default function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <>
      <Section bg="base" spacing="compact">
        <Container>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Legal', href: '/legal' },
            ]}
          />
        </Container>
      </Section>

      <Separator />

      <div className="min-h-screen">{children}</div>

      <Section bg="raised" spacing="compact">
        <Container>
          <nav aria-label="Legal pages">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                { label: 'Privacy policy', href: '/legal/privacy' },
                { label: 'Terms of service', href: '/legal/terms' },
                { label: 'Cookie policy', href: '/legal/cookies' },
                { label: 'Warranty policy', href: '/legal/warranty' },
                { label: 'Shipping & returns', href: '/legal/shipping' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-steel-400 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-200 hover:text-cyan-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </Section>
    </>
  );
}
