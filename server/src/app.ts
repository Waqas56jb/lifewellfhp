import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { corsOrigins, isProduction } from './config/env.js';
import { router } from './routes/index.js';
import {
  disallowedOrigin,
  errorHandler,
  jsonErrorHandler,
  notFoundHandler,
  requestId,
  requestLogger,
} from './middleware/index.js';

export function createApp(): Express {
  const app = express();

  // Required for correct client IPs (and therefore rate limiting) behind a
  // reverse proxy or platform load balancer.
  if (isProduction) app.set('trust proxy', 1);

  app.disable('x-powered-by');

  app.use(
    helmet({
      // This is a JSON API; it serves no HTML, so the default CSP is
      // unnecessary. The frontend sets its own.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-site' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        // Same-origin and server-to-server requests arrive without an Origin.
        if (!origin) return callback(null, true);
        if (corsOrigins.includes(origin)) return callback(null, true);
        // Reject by withholding the CORS headers rather than throwing — a
        // thrown error would surface as a 500. The browser still blocks the
        // response, and non-browser callers get a clean 403 below.
        return callback(null, false);
      },
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400,
    })
  );

  // Refuse cross-origin requests from origins that are not on the allowlist.
  app.use(disallowedOrigin);

  // Public forms stay small; admin CMS + image uploads need more room.
  app.use(express.json({ limit: '8mb' }));

  // Malformed or oversized JSON is a client error, not a server fault.
  app.use(jsonErrorHandler);

  app.use(requestId);
  app.use(requestLogger);

  app.use(router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
