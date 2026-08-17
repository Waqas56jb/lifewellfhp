import { Router } from 'express';
import { handleContact } from '../controllers/contact.controller.js';
import { handleNewsletter } from '../controllers/newsletter.controller.js';
import { asyncHandler, contactLimiter, newsletterLimiter } from '../middleware/index.js';
import { mailConfigured, env } from '../config/env.js';

export const router: Router = Router();

/**
 * Liveness / readiness probe.
 *
 * Reports whether the integrations are actually wired up, so a deployment that
 * silently lost its SMTP credentials is visible rather than discovered when a
 * patient's message vanishes.
 */
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    integrations: {
      mail: mailConfigured ? 'configured' : 'log-only',
      newsletter: env.NEWSLETTER_PROVIDER,
    },
  });
});

router.post('/api/contact', contactLimiter, asyncHandler(handleContact));
router.post('/api/newsletter', newsletterLimiter, asyncHandler(handleNewsletter));
