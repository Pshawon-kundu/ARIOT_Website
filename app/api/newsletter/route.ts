import { NextResponse, type NextRequest } from 'next/server';
import { newsletterSchema } from '@/lib/validators/newsletter';
import { sendNewsletterWelcome } from '@/server/mail/client';
import { rateLimit, clientKeyFromRequest } from '@/server/rate-limit';

/**
 * POST /api/newsletter — validate, store (placeholder), send welcome email.
 *
 * Validates the inbound payload with Zod. Subscription persistence lands
 * in Phase 2 (DB-backed). Sends a welcome email via Resend. No email
 * values are logged.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const rl = rateLimit(clientKeyFromRequest(request, 'newsletter'));
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

  const parsed = newsletterSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'That email looks off — please double-check and try again.',
      },
      { status: 422 },
    );
  }

  const result = await sendNewsletterWelcome(parsed.data.email);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send welcome email. Please try again.',
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
