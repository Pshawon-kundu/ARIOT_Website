import { z } from 'zod';

/**
 * Cross-cutting form-input schemas shared by the contact, quote, and
 * newsletter handlers. Co-located here so client and server validate
 * against the exact same rules (TECH_ARCHITECTURE §3.2).
 *
 * Rules of thumb:
 * - All free-text strings are length-bounded so payload size is honest.
 * - "Optional" fields are modeled as plain strings that allow an empty
 *   value — RHF defaults stay as `''`, the zod input/output types stay
 *   in lockstep, and downstream code treats empty strings as missing.
 *   We deliberately avoid `.optional()` + `.transform()` here because
 *   the resulting `ZodEffects` widens RHF's resolver types in a way
 *   that fights the strict `exactOptionalPropertyTypes` setting.
 * - Phone numbers are loosely validated — true E.164 enforcement lives
 *   in a later phase once we know carrier formats per region.
 */

const PHONE_PATTERN = /^\+?[\d\s().-]{7,20}$/;

export const nameSchema = z
  .string({ message: 'Please enter your name.' })
  .trim()
  .min(2, 'Name must be at least 2 characters.')
  .max(120, 'Name must be 120 characters or fewer.');

export const emailSchema = z
  .string({ message: 'Please enter your email.' })
  .trim()
  .min(1, 'Please enter your email.')
  .max(254, 'Email is too long.')
  .email('Enter a valid email address.');

/**
 * Optional phone — accepts empty strings as "not provided". When a
 * value is present, it must match a permissive E.164-ish shape. Input
 * and output types both stay `string`, which keeps RHF defaultValues
 * and the zod resolver perfectly aligned.
 */
export const phoneSchema = z
  .string()
  .max(40, 'Phone number is too long.')
  .refine(
    (v) => v.trim() === '' || PHONE_PATTERN.test(v.trim()),
    {
      message:
        'Enter a valid phone number (digits, spaces, +, -, () allowed).',
    },
  );

/**
 * Optional, length-bounded free text (company, role, notes, etc).
 * Empty string means "not provided"; downstream code is responsible
 * for treating empty strings as missing where it matters.
 */
export const optionalText = (max: number) =>
  z.string().max(max, `Must be ${max} characters or fewer.`);
