'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { House, RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root error boundary. Next.js requires this to be a client component.
 *
 * Server-side errors are already logged on the server. We log a
 * dev-only console message here for debugging; production-ready
 * client-side error tracking (Sentry or equivalent) lands in Phase 2.
 */
export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[error.tsx]', error);
    }
  }, [error]);

  return (
    <main
      id="main"
      className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at top, var(--danger-bg) 0%, transparent 55%)',
        }}
      />
      <Container className="text-center">
        <Badge variant="danger">[ERROR · 500]</Badge>

        <h1 className="mt-6 font-display text-5xl font-semibold tracking-tight text-steel-100 md:text-7xl">
          Signal lost.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-steel-200">
          [Something went wrong on our end. The error has been logged. You
          can retry the request, or head back to the home page.]
        </p>

        {error.digest ? (
          <p className="mt-4 font-mono text-xs text-steel-400">
            ref: <span className="text-steel-200">{error.digest}</span>
          </p>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} size="lg" variant="primary">
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/">
              <House className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
        </div>
      </Container>
    </main>
  );
}
