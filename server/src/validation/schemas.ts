import { z } from 'zod';

/**
 * Authoritative request validation.
 *
 * The browser performs the same checks for immediate feedback, but these are
 * the ones that count — client-side validation is never trusted.
 */

/** Trimmed, length-bounded string carrying patient-facing messages. */
const trimmed = (min: number, max: number, tooShort: string, tooLong: string) =>
  z
    .string({ required_error: tooShort, invalid_type_error: tooShort })
    .transform((v) => v.trim())
    .pipe(z.string().min(min, tooShort).max(max, tooLong));

/**
 * Strips ASCII control characters (including CR and LF) so a crafted value
 * cannot inject extra headers into the notification email.
 */
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;
const sanitise = (value: string) =>
  value.replace(CONTROL_CHARS, ' ').replace(/\s+/g, ' ').trim();

/** Message bodies keep their newlines but lose every other control character. */
const MESSAGE_CONTROL = /[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/g;
const sanitiseMultiline = (value: string) =>
  value.replace(MESSAGE_CONTROL, ' ').replace(/\r\n?/g, '\n').trim();

export const contactSchema = z.object({
  name: trimmed(
    2,
    100,
    'Please enter your full name.',
    'Please use 100 characters or fewer.'
  )
    .transform(sanitise)
    .refine((v) => v.length >= 2, { message: 'Please enter your full name.' }),

  email: z
    .string()
    .transform((v) => v.trim().toLowerCase())
    .pipe(z.string().email('Please enter a valid email address.').max(254)),

  phone: z
    .string()
    .transform((v) => v.trim())
    .pipe(
      z
        .string()
        .max(20)
        .regex(/^$|^[\d\s()+.\-]{7,20}$/, 'Please enter a valid phone number.')
    )
    .optional()
    .default(''),

  subject: z
    .string()
    .transform((v) => sanitise(v).slice(0, 150))
    .optional()
    .default(''),

  message: trimmed(
    10,
    2000,
    'Please provide a little more detail.',
    'Please use 2000 characters or fewer.'
  ).transform(sanitiseMultiline),

  consent: z.literal(true, {
    errorMap: () => ({ message: 'Please confirm before sending.' }),
  }),

  /** Honeypot — must be empty. */
  company: z.string().max(0).optional().default(''),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({
  email: z
    .string()
    .transform((v) => v.trim().toLowerCase())
    .pipe(z.string().email('Please enter a valid email address.').max(254)),

  company: z.string().max(0).optional().default(''),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

/** Flattens Zod issues into a field -> message map for the client. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !out[key]) out[key] = issue.message;
  }
  return out;
}
