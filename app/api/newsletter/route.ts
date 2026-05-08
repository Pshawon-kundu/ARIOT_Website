import { NextResponse } from 'next/server';
import { newsletterSchema } from '@/lib/validators/newsletter';

/**
 * POST /api/newsletter — Phase 1 stub.
 *
 * Validates the inbound payload with Zod. Subscription persistence and
 * double-opt-in email confirmation land alongside the email provider
 * integration in a later phase. No email values are logged.
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

  return NextResponse.json({ success: true }, { status: 200 });
}
