import { z } from 'zod';
import { emailSchema, nameSchema, optionalText, phoneSchema } from './common';

/**
 * Quote-request payload — single-step submission of all three logical
 * sections (Project / Products / Contact). Validation rules mirror
 * the future `QuoteRequest` model in DATABASE_SCHEMA_PLAN §4.
 */
export const quoteIndustryValues = [
  'home',
  'office',
  'institution',
  'industry',
  'other',
] as const;

export const quoteTimelineValues = [
  'urgent',
  'quarter',
  'planning',
] as const;

export const quoteCategoryValues = [
  'robotics',
  'iot',
  'education',
  'custom',
] as const;

export const quoteChannelValues = ['email', 'phone', 'meeting'] as const;

export const quoteSchema = z.object({
  industry: z.enum(quoteIndustryValues, {
    message: 'Select an industry that fits the project.',
  }),
  timeline: z.enum(quoteTimelineValues, {
    message: 'Pick the rough timeline so we can route correctly.',
  }),
  useCase: z
    .string({ message: 'Describe the use case.' })
    .trim()
    .min(10, 'Please share at least 10 characters of use-case context.')
    .max(2000, 'Use case must be 2000 characters or fewer.'),
  scaleHint: optionalText(200),
  productCategory: z.enum(quoteCategoryValues, {
    message: 'Pick the closest product category.',
  }),
  technicalNotes: optionalText(2000),
  name: nameSchema,
  company: z
    .string({ message: 'Company or institution is required.' })
    .trim()
    .min(2, 'Company must be at least 2 characters.')
    .max(160, 'Company must be 160 characters or fewer.'),
  role: optionalText(120),
  email: emailSchema,
  phone: phoneSchema,
  preferredChannel: z.enum(quoteChannelValues, {
    message: 'Pick a preferred contact channel.',
  }),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
export type QuoteIndustry = (typeof quoteIndustryValues)[number];
export type QuoteTimeline = (typeof quoteTimelineValues)[number];
export type QuoteCategory = (typeof quoteCategoryValues)[number];
export type QuoteChannel = (typeof quoteChannelValues)[number];
