import type { Request, Response } from 'express';
import { newsletterSchema, fieldErrors } from '../validation/schemas.js';
import { subscribe } from '../services/newsletter.service.js';
import { badRequest } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export async function handleNewsletter(req: Request, res: Response): Promise<void> {
  const parsed = newsletterSchema.safeParse(req.body);

  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);

    if ('company' in errors) {
      logger.warn('Newsletter honeypot triggered');
      res.status(201).json({ success: true, message: 'Thank you for subscribing.' });
      return;
    }

    throw badRequest(errors.email ?? 'Please enter a valid email address.', errors);
  }

  const result = await subscribe(parsed.data.email);

  res.status(201).json({
    success: true,
    message: result.created
      ? 'Almost there — please check your inbox to confirm your subscription.'
      : 'You’re already subscribed. Thank you.',
  });
}
