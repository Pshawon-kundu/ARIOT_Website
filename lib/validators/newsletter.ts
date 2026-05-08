import { z } from 'zod';
import { emailSchema, optionalText } from './common';

/**
 * Newsletter subscription payload — used by the footer subscribe form
 * and the blog newsletter CTA. The `source` field is informational only
 * (where the subscribe happened) and never trusted for routing logic.
 */
export const newsletterSchema = z.object({
  email: emailSchema,
  source: optionalText(60),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
