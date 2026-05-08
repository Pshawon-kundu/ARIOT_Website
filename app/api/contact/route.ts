import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validators/contact';

/**
 * POST /api/contact — Phase 1 stub.
 *
 * Validates the inbound payload with Zod. Persistence, transactional
 * email, and rate limiting are intentionally deferred (TECH_ARCHITECTURE
 * §3.5; PHASE 1 scope). No request body fields are logged so PII never
 * leaks into server logs (AGENTS.md §9).
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

  const parsed = contactSchema.safeParse(raw);
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
