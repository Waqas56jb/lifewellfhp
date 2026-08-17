import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { contactSchema, fieldErrors } from '../validation/schemas.js';
import { sendContactNotification } from '../services/email.service.js';
import { badRequest } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export async function handleContact(req: Request, res: Response): Promise<void> {
  const parsed = contactSchema.safeParse(req.body);

  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);

    // A filled honeypot means a bot. Return the normal success shape so the
    // sender learns nothing, but do no work.
    if ('company' in errors) {
      logger.warn('Contact honeypot triggered');
      res.status(201).json({
        success: true,
        message: 'Thank you — your message has been received.',
      });
      return;
    }

    throw badRequest('Please correct the highlighted fields and try again.', errors);
  }

  const referenceId = randomUUID().slice(0, 8).toUpperCase();
  const result = await sendContactNotification(parsed.data, referenceId);

  res.status(201).json({
    success: true,
    message: result.delivered
      ? 'Your message has been sent. We aim to respond within one business day.'
      : 'Your message has been received. We aim to respond within one business day.',
    referenceId,
  });
}
