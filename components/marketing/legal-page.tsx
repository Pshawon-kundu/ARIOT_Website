import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Separator } from '@/components/ui/separator';

interface LegalSection {
  heading: string;
  body: string;
}

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  sections: ReadonlyArray<LegalSection>;
}

/**
 * LegalPage — shared prose chrome for all legal/* pages.
 *
 * Renders a page title, last-updated line, and a series of heading/body
 * section pairs. All content is provided as [BRACKETED_PLACEHOLDERS] until
 * legal review is complete.
 */
export function LegalPage({ title, lastUpdated, sections }: LegalPageProps) {
  return (
    <Section bg="base" spacing="default">
      <Container>
        <article className="mx-auto max-w-3xl" aria-label={title}>
          <header className="flex flex-col gap-3">
            <h1 className="text-steel-100 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="text-steel-400 font-mono text-[11px] tracking-[0.14em] uppercase">
              Last updated: {lastUpdated}
            </p>
          </header>

          <Separator className="my-8" />

          <div className="flex flex-col gap-10">
            {sections.map((section) => (
              <div key={section.heading} className="flex flex-col gap-4">
                <h2 className="text-steel-100 font-display text-xl font-semibold tracking-tight sm:text-2xl">
                  {section.heading}
                </h2>
                <p className="text-steel-300 text-base leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>

          <Separator className="my-10" />

          <p className="text-steel-500 font-mono text-[11px] tracking-[0.14em]">
            [This document is a pre-commercial placeholder. ARIOT will replace all bracketed content
            with legally reviewed text before commercial operations begin.]
          </p>
        </article>
      </Container>
    </Section>
  );
}
