import nodemailer, { type Transporter } from 'nodemailer';
import { env, mailConfigured, isProduction } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { serverError } from '../utils/errors.js';
import type { ContactInput } from '../validation/schemas.js';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!mailConfigured) return null;
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user: env.SMTP_USER as string, pass: env.SMTP_PASSWORD as string },
  });

  return transporter;
}

/** Escapes a value for safe interpolation into the HTML email body. */
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export interface DeliveryResult {
  delivered: boolean;
  referenceId: string;
}

/**
 * Sends the contact-form notification.
 *
 * Nothing is persisted. The submission is validated, forwarded, and dropped —
 * storing what may be protected health information would place this service in
 * HIPAA scope and require a BAA with the host and mail provider.
 */
export async function sendContactNotification(
  input: ContactInput,
  referenceId: string
): Promise<DeliveryResult> {
  const subject = input.subject
    ? `Website enquiry: ${input.subject}`
    : `Website enquiry from ${input.name}`;

  const text = [
    `New enquiry from the LifeWell website`,
    `Reference: ${referenceId}`,
    ``,
    `Name:    ${input.name}`,
    `Email:   ${input.email}`,
    `Phone:   ${input.phone || '—'}`,
    `Subject: ${input.subject || '—'}`,
    ``,
    `Message:`,
    input.message,
    ``,
    `— Sent from the contact form at lifewellfhp.com`,
  ].join('\n');

  const html = `
    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#374151;line-height:1.6">
      <h2 style="font-family:Georgia,serif;color:#2f6691;margin:0 0 4px">New website enquiry</h2>
      <p style="margin:0 0 20px;font-size:13px;color:#5b6675">Reference ${escapeHtml(referenceId)}</p>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px">
        <tr><td style="padding:6px 16px 6px 0;color:#5b6675">Name</td><td style="padding:6px 0"><strong>${escapeHtml(input.name)}</strong></td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#5b6675">Email</td><td style="padding:6px 0"><a href="mailto:${escapeHtml(input.email)}">${escapeHtml(input.email)}</a></td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#5b6675">Phone</td><td style="padding:6px 0">${escapeHtml(input.phone || '—')}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#5b6675">Subject</td><td style="padding:6px 0">${escapeHtml(input.subject || '—')}</td></tr>
      </table>
      <div style="border-left:3px solid #3e7fb1;padding:4px 0 4px 16px;white-space:pre-wrap">${escapeHtml(input.message)}</div>
      <p style="margin-top:24px;font-size:12px;color:#5b6675">Sent from the contact form at lifewellfhp.com</p>
    </div>
  `;

  const mail = getTransporter();

  if (!mail) {
    // Log-only mode. Never claim delivery that did not happen.
    logger.warn('SMTP is not configured — contact notification was not sent', {
      referenceId,
      hasSubject: Boolean(input.subject),
      messageLength: input.message.length,
    });
    if (isProduction) {
      throw serverError('Mail transport is not configured');
    }
    return { delivered: false, referenceId };
  }

  try {
    await mail.sendMail({
      from: env.MAIL_FROM,
      to: env.CONTACT_EMAIL,
      // Lets the practice reply straight to the patient without exposing the
      // address as the envelope sender.
      replyTo: `${input.name} <${input.email}>`,
      subject,
      text,
      html,
    });

    logger.info('Contact notification delivered', { referenceId });
    return { delivered: true, referenceId };
  } catch (error) {
    logger.error('Contact notification failed', {
      referenceId,
      reason: error instanceof Error ? error.message : 'unknown',
    });
    throw serverError('Unable to deliver the message');
  }
}

/** Verifies SMTP credentials at boot so misconfiguration surfaces early. */
export async function verifyMailTransport(): Promise<void> {
  const mail = getTransporter();
  if (!mail) {
    logger.warn('SMTP not configured — contact form runs in log-only mode');
    return;
  }
  try {
    await mail.verify();
    logger.info('SMTP transport verified');
  } catch (error) {
    logger.error('SMTP verification failed', {
      reason: error instanceof Error ? error.message : 'unknown',
    });
  }
}
