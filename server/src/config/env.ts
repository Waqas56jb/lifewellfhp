import 'dotenv/config';
import { z } from 'zod';

/**
 * Environment schema.
 *
 * Validated once at boot so a misconfigured deployment fails immediately and
 * loudly rather than at the moment a patient submits a form.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  /** Comma-separated list of origins permitted to call the API. */
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  /** Destination for contact-form notifications. */
  CONTACT_EMAIL: z.string().email().default('contact@lifewellfhp.com'),
  MAIL_FROM: z.string().default('LifeWell Website <no-reply@lifewellfhp.com>'),

  /* SMTP. When unset the server runs in log-only mode — useful locally and in
     CI, and it prevents silent data loss from being mistaken for delivery. */
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),

  /* Newsletter provider. Left unset until the client chooses one; the service
     layer degrades to log-only rather than pretending to subscribe. */
  NEWSLETTER_PROVIDER: z.enum(['none', 'mailchimp', 'convertkit']).default('none'),
  NEWSLETTER_API_KEY: z.string().optional(),
  NEWSLETTER_LIST_ID: z.string().optional(),

  /** Rate limits, per IP per hour. */
  RATE_LIMIT_CONTACT: z.coerce.number().int().positive().default(5),
  RATE_LIMIT_NEWSLETTER: z.coerce.number().int().positive().default(3),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('\n');
  console.error(`Invalid environment configuration:\n${issues}`);
  process.exit(1);
}

export const env = parsed.data;

export const corsOrigins = env.CORS_ORIGINS.split(',')
  .map((o) => o.trim())
  .filter(Boolean);

/** True once SMTP is fully configured; otherwise mail is logged, not sent. */
export const mailConfigured = Boolean(
  env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASSWORD
);

export const isProduction = env.NODE_ENV === 'production';
