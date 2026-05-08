import { NextResponse } from 'next/server';
import { quoteSchema } from '@/lib/validators/quote';

/**
 * POST /api/quote — Phase 1 stub.
 *
 * Validates the inbound payload with Zod. Persistence, internal
 * routing, transactional email, and rate limiting are deferred to
 * later phases per FEATURE_ROADMAP. No PII fields are logged
 * (AGENTS.md §9).
 */
export async function POST(request: Request): Promise<NextResponse> {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Some fields look off — please review and try again.',
      },
      { status: 422 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
