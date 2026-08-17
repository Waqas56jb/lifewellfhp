import { env, isProduction } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { serverError } from '../utils/errors.js';

export interface SubscribeResult {
  /** False when the address was already on the list. */
  created: boolean;
  /** False when no provider is configured and the request was only logged. */
  delivered: boolean;
}

/**
 * Newsletter subscription.
 *
 * The client has not yet chosen an email service provider, so this is written
 * as a clean integration boundary: add a provider implementation below and set
 * NEWSLETTER_PROVIDER. Until then the service logs rather than pretending to
 * subscribe, and refuses to run in production so a silent no-op can never be
 * mistaken for a working signup.
 *
 * Whichever provider is chosen must be configured for double opt-in, and the
 * confirmation email must carry an unsubscribe link (CAN-SPAM).
 */
export async function subscribe(email: string): Promise<SubscribeResult> {
  switch (env.NEWSLETTER_PROVIDER) {
    case 'mailchimp':
      return subscribeMailchimp(email);
    case 'convertkit':
      return subscribeConvertKit(email);
    case 'none':
    default: {
      logger.warn('No newsletter provider configured — subscription was not stored', {
        domain: email.split('@')[1] ?? 'unknown',
      });
      if (isProduction) {
        throw serverError('Newsletter provider is not configured');
      }
      return { created: true, delivered: false };
    }
  }
}

async function subscribeMailchimp(email: string): Promise<SubscribeResult> {
  const key = env.NEWSLETTER_API_KEY;
  const listId = env.NEWSLETTER_LIST_ID;
  if (!key || !listId) throw serverError('Mailchimp credentials are incomplete');

  // API keys are suffixed with the datacentre, e.g. "abc123-us21".
  const dc = key.split('-')[1];
  if (!dc) throw serverError('Mailchimp API key is malformed');

  const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    // "pending" triggers Mailchimp's double opt-in confirmation email.
    body: JSON.stringify({ email_address: email, status: 'pending' }),
  });

  if (res.status === 400) {
    const body = (await res.json().catch(() => ({}))) as { title?: string };
    if (body.title === 'Member Exists') return { created: false, delivered: true };
  }

  if (!res.ok) {
    logger.error('Mailchimp subscription failed', { status: res.status });
    throw serverError('Unable to complete the subscription');
  }

  return { created: true, delivered: true };
}

async function subscribeConvertKit(email: string): Promise<SubscribeResult> {
  const key = env.NEWSLETTER_API_KEY;
  const formId = env.NEWSLETTER_LIST_ID;
  if (!key || !formId) throw serverError('ConvertKit credentials are incomplete');

  const res = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: key, email }),
  });

  if (!res.ok) {
    logger.error('ConvertKit subscription failed', { status: res.status });
    throw serverError('Unable to complete the subscription');
  }

  return { created: true, delivered: true };
}
