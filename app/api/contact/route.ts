import { NextResponse, type NextRequest } from 'next/server';
import { contactSchema } from '@/lib/validators/contact';
import { sendContactNotification } from '@/server/mail/client';
import { rateLimit, clientKeyFromRequest } from '@/server/rate-limit';

/**
 * POST /api/contact — validate, send notification email to ARIOT team.
 *
 * Validates the inbound payload with Zod, then sends a transactional
 * notification to the ARIOT inbox. No PII fields are logged (AGENTS.md §9).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const rl = rateLimit(clientKeyFromRequest(request, 'contact'));
  if (rl.limited) {
    const retryAfter = Math.max(0, Math.ceil((rl.resetAt - Date.now()) / 1000));
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
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

  const result = await sendContactNotification(parsed.data);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send your message. Please try again or email us directly.',
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
