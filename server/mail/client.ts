import { Resend } from 'resend';
import { env } from '@/server/env';

/**
 * Resend client singleton.
 *
 * initialised lazily on first use so the module can be imported at the
 * top of API routes without throwing when the API key is absent (e.g.
 * during `next build` or local dev without `.env.local`).
 *
 * When `RESEND_API_KEY` is unset in non-production environments, the client is
 * `null` and send functions degrade to a non-PII console warning. Production
 * throws instead of silently stubbing email delivery.
 */
let client: Resend | null = null;

function getClient(): Resend | null {
  if (client) return client;
  const key = env.RESEND_API_KEY;
  if (!key) {
    if (env.NODE_ENV === 'production') {
      throw new Error('RESEND_API_KEY is required for production email delivery.');
    }

    console.warn(
      '[mail] RESEND_API_KEY is not set — email delivery is stubbed in this non-production environment.',
    );
    return null;
  }
  client = new Resend(key);
  return client;
}

/* ---------------------------------------------------------------------------
 * Shared send helper
 * ------------------------------------------------------------------------ */

export interface SendEmailParams {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  /** Optional plain-text fallback for clients that don't render HTML. */
  text?: string;
  /** Optional reply-to address. */
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send a transactional email via Resend.
 *
 * Falls back to a non-PII console log when the API key is missing outside
 * production so development flows are never blocked by missing configuration.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const resend = getClient();

  if (!resend) {
    console.log('[mail] (dev stub) Email send skipped.');
    return { success: true, id: 'dev-stub' };
  }

  try {
    const result = await resend.emails.send({
      from: params.from,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      ...(params.text ? { text: params.text } : {}),
      ...(params.replyTo ? { replyTo: params.replyTo } : {}),
    });

    if (result.error) {
      console.error('[mail] Resend error:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown email error';
    console.error('[mail] Failed to send email:', message);
    return { success: false, error: message };
  }
}

/* ---------------------------------------------------------------------------
 * Convenience re-exports
 * ------------------------------------------------------------------------ */

export { sendContactNotification } from './templates/contact-notification';
export { sendQuoteNotification } from './templates/quote-notification';
export { sendNewsletterWelcome } from './templates/newsletter-welcome';
