import { Quote } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

interface TestimonialAttribution {
  name: string;
  role: string;
  org?: string;
}

interface TestimonialProps {
  /** The quote text. Render plain — no quote marks, the icon supplies them. */
  quote: string;
  attribution: TestimonialAttribution;
  className?: string;
}

/**
 * Testimonial — large quote marquee on a glass card.
 *
 * Reserved for real customers/partners with cleared rights
 * (CONTENT_STRATEGY §7.1, AI_ASSET_PIPELINE §2 — testimonials are NEVER
 * AI-generated). Component ships now so future surfaces (About,
 * Solution detail, Case study) can drop it in without a UI ticket.
 */
export function Testimonial({ quote, attribution, className }: TestimonialProps) {
  return (
    <Card variant="glass" className={cn('p-8 md:p-12', className)}>
      <Quote className="text-cyan-400 h-8 w-8" aria-hidden />
      <figure className="mt-4 flex flex-col gap-6">
        <blockquote className="text-steel-100 font-display text-2xl font-semibold leading-snug tracking-tight md:text-3xl">
          {quote}
        </blockquote>
        <figcaption className="flex flex-col gap-0.5">
          <span className="text-steel-100 text-sm font-medium">
            {attribution.name}
          </span>
          <span className="text-steel-400 font-mono text-[11px] tracking-[0.18em] uppercase">
            {attribution.role}
            {attribution.org ? ` · ${attribution.org}` : ''}
          </span>
        </figcaption>
      </figure>
    </Card>
  );
}
