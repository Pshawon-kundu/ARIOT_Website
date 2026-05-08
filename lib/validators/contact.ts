import { z } from 'zod';
import { emailSchema, nameSchema, optionalText, phoneSchema } from './common';

/**
 * Contact form payload — used by the public `/contact` form and the
 * `/api/contact` route handler. Identical validation runs on both
 * sides (TECH_ARCHITECTURE §3.2).
 */
export const contactTopicValues = [
  'sales',
  'support',
  'partnership',
  'press',
  'other',
] as const;

export const contactSchema = z.object({
  name: nameSchema,
  company: optionalText(160),
  email: emailSchema,
  phone: phoneSchema,
  topic: z.enum(contactTopicValues, {
    message: 'Pick the topic that best matches your message.',
  }),
  message: z
    .string({ message: 'Tell us a bit about what you need.' })
    .trim()
    .min(10, 'Please share at least 10 characters of context.')
    .max(3000, 'Message must be 3000 characters or fewer.'),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactTopic = (typeof contactTopicValues)[number];
