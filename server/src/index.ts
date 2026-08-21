import app from './app.js';
import { env, corsOrigins } from './config/env.js';
import { verifyMailTransport } from './services/email.service.js';
import { logger } from './utils/logger.js';

export default app;

/** Local `npm start` / `npm run dev`. Vercel invokes the exported app instead. */
if (!process.env.VERCEL) {
  const server = app.listen(env.PORT, () => {
    logger.info('LifeWell API listening', {
      port: env.PORT,
      env: env.NODE_ENV,
      corsOrigins,
    });
    void verifyMailTransport();
  });

  function shutdown(signal: string) {
    logger.info('Shutting down', { signal });
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
});
