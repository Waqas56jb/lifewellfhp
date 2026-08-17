/**
 * End-to-end form test: real browser -> Next.js frontend -> Node API.
 *
 * Requires both servers running:
 *   server/  npm start   (port 4000)
 *   client/  npm start   (port 3000)
 *
 *   node scripts/check-forms.mjs
 */
import { chromium } from 'playwright';

const SITE = process.env.SITE_BASE ?? 'http://localhost:3000';
const API = process.env.API_BASE ?? 'http://localhost:4000';

const results = [];
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

// Fail fast if the API is not up, rather than blaming the UI.
try {
  const health = await fetch(`${API}/health`).then((r) => r.json());
  console.log(`\nAPI health: ${health.status} (mail: ${health.integrations.mail})\n`);
} catch {
  console.error(`Cannot reach the API at ${API}. Start server/ first.`);
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage();

/** Waits until React has hydrated and the form is interactive. */
async function ready(locator) {
  await locator.waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.readyState === 'complete');
  await page.waitForTimeout(400);
}

/* ------------------------------------------------------- contact form --- */

console.log('Contact form');
await page.goto(`${SITE}/contact-telehealth-mental-health-provider`, {
  waitUntil: 'domcontentloaded',
});

// The footer newsletter also has an email field, so scope to the contact form.
let contactForm = page.locator('form').filter({ has: page.getByRole('button', { name: /send message/i }) });

// Client-side validation must block an empty submit.
await ready(page.getByRole('button', { name: /send message/i }));
await page.getByRole('button', { name: /send message/i }).click();
await page.waitForTimeout(300);
const clientErrors = await page.locator('[id$="-error"]').count();
record('client-side validation blocks empty submit', clientErrors > 0, `${clientErrors} field errors`);

const requestSeen = { hit: false, body: null };
page.on('request', (req) => {
  if (req.url().includes('/api/contact') && req.method() === 'POST') {
    requestSeen.hit = true;
    try {
      requestSeen.body = JSON.parse(req.postData() ?? '{}');
    } catch {
      requestSeen.body = null;
    }
  }
});

await contactForm.getByLabel(/your name/i).fill('Playwright Tester');
await contactForm.getByLabel(/email address/i).fill('tester@example.com');
await contactForm.getByLabel(/phone number/i).fill('(407) 555-0199');
await contactForm.getByLabel(/subject/i).fill('Automated integration test');
await page
  .getByLabel(/how can we help/i)
  .fill('This is an automated end-to-end test of the contact form submission path.');
await contactForm.getByRole('checkbox').check();
await page.getByRole('button', { name: /send message/i }).click();

await page.waitForTimeout(1500);

record('POST /api/contact issued from the browser', requestSeen.hit);
record(
  'payload carries the entered values',
  requestSeen.body?.name === 'Playwright Tester' && requestSeen.body?.consent === true,
  requestSeen.body ? `name="${requestSeen.body.name}"` : 'no body'
);
record(
  'honeypot field sent empty',
  requestSeen.body?.company === '',
  `company=${JSON.stringify(requestSeen.body?.company)}`
);

const success = await page.getByRole('status').isVisible().catch(() => false);
const successText = success ? await page.getByRole('status').innerText() : '';
record('success state rendered', success, successText.split('\n')[0]?.slice(0, 60));

const canResend = await page.getByRole('button', { name: /send another message/i }).isVisible();
record('offers to send another message', canResend);

/* ---------------------------------------------------- newsletter form --- */

console.log('\nNewsletter form');
await page.goto(`${SITE}/`, { waitUntil: 'domcontentloaded' });

const newsletterInput = page.locator('input[name="email"]').first();
await newsletterInput.scrollIntoViewIfNeeded();
await ready(newsletterInput);

// Invalid address is caught before any request goes out.
let newsletterRequests = 0;
page.on('request', (req) => {
  if (req.url().includes('/api/newsletter')) newsletterRequests += 1;
});

await newsletterInput.fill('not-an-email');
await page.getByRole('button', { name: /^sign up$/i }).click();
await page.waitForTimeout(400);
record('invalid email blocked client-side', newsletterRequests === 0, `${newsletterRequests} requests`);

const inlineError = await page.locator('text=Please enter a valid email address.').first().isVisible();
record('inline error shown', inlineError);

await newsletterInput.fill('subscriber@example.com');
await page.getByRole('button', { name: /^sign up$/i }).click();
await page.waitForTimeout(1500);

record('valid email triggers request', newsletterRequests >= 1, `${newsletterRequests} requests`);

const subscribed = await page
  .locator('text=please check your inbox')
  .first()
  .isVisible()
  .catch(() => false);
record('subscription success state rendered', subscribed);

/* ---------------------------------------------------- error handling --- */

console.log('\nError handling (API unreachable)');
await page.route('**/api/contact', (route) => route.abort('failed'));
await page.goto(`${SITE}/contact-telehealth-mental-health-provider`, {
  waitUntil: 'domcontentloaded',
});
contactForm = page.locator('form').filter({ has: page.getByRole('button', { name: /send message/i }) });
await ready(page.getByRole('button', { name: /send message/i }));
await contactForm.getByLabel(/your name/i).fill('Offline Tester');
await contactForm.getByLabel(/email address/i).fill('offline@example.com');
await page
  .getByLabel(/how can we help/i)
  .fill('Testing the failure path when the API cannot be reached at all.');
await contactForm.getByRole('checkbox').check();
await page.getByRole('button', { name: /send message/i }).click();
await page.waitForTimeout(1200);

// Two live regions exist on the page; the contact form's is the first.
const alert = page.locator('[role="alert"]').first();
const alertVisible = await alert.isVisible().catch(() => false);
const alertText = alertVisible ? await alert.innerText() : '';
record('network failure surfaces a friendly error', alertVisible && /could not send/i.test(alertText), alertText.slice(0, 70));
record('no stack trace leaked to the user', !/Error:|at \w+\./.test(alertText));

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(
  `\n${failed.length === 0 ? '✓ ALL PASS' : `✗ ${failed.length} failure(s)`} — ${results.length} checks\n`
);
process.exit(failed.length === 0 ? 0 : 1);
