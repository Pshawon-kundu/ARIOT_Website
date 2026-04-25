import { Container } from '@/components/ui/container';

/**
 * Marketing route-group loading skeleton.
 * Streamed by Next.js as a Suspense fallback while route data resolves.
 * Uses steel-token blocks so the placeholder visually belongs to the
 * loaded UI rather than feeling like a generic library spinner.
 *
 * The pulse animation collapses to a single static frame under
 * prefers-reduced-motion (handled globally in app/globals.css).
 */
export default function MarketingLoading() {
  return (
    <Container className="py-24 md:py-32">
      <div className="flex max-w-3xl flex-col gap-6">
        <div className="bg-steel-800 h-3 w-32 animate-pulse rounded-full" />
        <div className="bg-steel-800 h-12 w-full animate-pulse rounded-md" />
        <div className="bg-steel-800 h-12 w-3/4 animate-pulse rounded-md" />
        <div className="bg-steel-800/60 h-5 w-full animate-pulse rounded-md" />
        <div className="bg-steel-800/60 h-5 w-5/6 animate-pulse rounded-md" />
        <div className="bg-steel-800/60 h-5 w-2/3 animate-pulse rounded-md" />
        <div className="mt-4 flex gap-3">
          <div className="bg-steel-800 h-12 w-40 animate-pulse rounded-md" />
          <div className="bg-steel-800/60 h-12 w-40 animate-pulse rounded-md" />
        </div>
      </div>
    </Container>
  );
}
