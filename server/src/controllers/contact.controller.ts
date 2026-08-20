import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { contactSchema, fieldErrors } from '../validation/schemas.js';
import { sendContactNotification } from '../services/email.service.js';
import { storeLead } from './leads.controller.js';
import { logEmailMessage } from '../lib/mailLog.js';
import { badRequest } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { supabaseConfigured } from '../lib/supabase.js';

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

  if (supabaseConfigured()) {
    try {
      await storeLead({
        type: 'contact',
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        subject: parsed.data.subject,
        message: parsed.data.message,
        reference_id: referenceId,
      });
    } catch (err) {
      logger.error('lead persist failed', {
        reason: err instanceof Error ? err.message : 'unknown',
      });
    }
  }

  const result = await sendContactNotification(parsed.data, referenceId);

  await logEmailMessage({
    direction: 'inbound',
    from_email: parsed.data.email,
    from_name: parsed.data.name,
    to_email: result.inbox,
    to_name: 'LifeWell inbox',
    subject: parsed.data.subject || `Website enquiry from ${parsed.data.name}`,
    body: [
      `Name: ${parsed.data.name}`,
      `Email: ${parsed.data.email}`,
      `Phone: ${parsed.data.phone || '—'}`,
      `Reference: ${referenceId}`,
      '',
      parsed.data.message,
    ].join('\n'),
    status: result.delivered ? 'sent' : 'failed',
    error: result.delivered ? null : 'SMTP did not accept the message',
  });

  res.status(201).json({
    success: true,
    message: result.delivered
      ? 'Your message has been sent. We aim to respond within one business day.'
      : 'Your message has been received. We aim to respond within one business day.',
    referenceId,
  });
}
