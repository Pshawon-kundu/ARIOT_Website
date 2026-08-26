import { JsonLd } from './json-ld';

export interface FaqItem {
  /** The question text. */
  question: string;
  /** The answer text (can contain basic HTML for line breaks). */
  answer: string;
}

interface FaqPageProps {
  items: FaqItem[];
}

/**
 * Schema.org FAQPage structured data.
 * Renders on pages with FAQ sections (e.g. quote page, support hub).
 * Enables FAQ rich results — expandable Q&A pairs in Google search.
 */
export function FaqPage({ items }: FaqPageProps) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }}
    />
  );
}
