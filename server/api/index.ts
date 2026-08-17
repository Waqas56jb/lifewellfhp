/**
 * Vercel serverless entry point.
 *
 * Vercel treats every file under `api/` as a function, so this exposes the same
 * Express app that `npm start` runs locally. Deploying `server/` as its own
 * Vercel project therefore needs no code changes.
 *
 * Caveats when running serverless rather than as a long-lived process:
 *
 *  - Rate limiting uses express-rate-limit's in-memory store, which is per
 *    instance. Under serverless the limits still blunt casual abuse but are not
 *    a hard global ceiling. For a strict limit, back it with Vercel KV or
 *    Upstash Redis, or put the endpoints behind Vercel's WAF.
 *
 *  - SMTP connections cannot be pooled between invocations, so each submission
 *    opens its own connection. That is fine at this volume.
 *
 * Prefer a persistent host (Render, Railway, Fly) if either matters.
 */
import { createApp } from '../src/app.js';

export default createApp();
