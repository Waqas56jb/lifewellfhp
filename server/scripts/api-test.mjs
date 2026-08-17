/**
 * Functional test pass over the LifeWell API.
 *   node _source/api-test.mjs
 */
const BASE = process.env.API_BASE ?? 'http://localhost:4000';

let pass = 0;
let fail = 0;

async function check(name, run, expectStatus, assertBody) {
  try {
    const { status, body } = await run();
    const statusOk = Array.isArray(expectStatus)
      ? expectStatus.includes(status)
      : status === expectStatus;
    const bodyOk = assertBody ? assertBody(body) : true;
    if (statusOk && bodyOk) {
      pass++;
      console.log(`  PASS  ${name}  → ${status}`);
    } else {
      fail++;
      console.log(
        `  FAIL  ${name}  → ${status} (expected ${expectStatus})  ${JSON.stringify(body).slice(0, 160)}`
      );
    }
  } catch (e) {
    fail++;
    console.log(`  FAIL  ${name}  → threw: ${e.message}`);
  }
}

const post = (path, payload, headers = {}) => async () => {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body };
};

const get = (path, headers = {}) => async () => {
  const res = await fetch(BASE + path, { headers });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body };
};

const valid = {
  name: 'Jane Tester',
  email: 'jane@example.com',
  phone: '(407) 555-0100',
  subject: 'Insurance question',
  message: 'I would like to ask whether you accept Aetna for follow-up visits.',
  consent: true,
};

console.log('\nLifeWell API — functional tests\n');

console.log('Health & routing');
await check('health returns ok', get('/health'), 200, (b) => b?.status === 'ok');
await check('unknown route 404s as JSON', get('/nope'), 404, (b) => b?.success === false);

console.log('\nContact endpoint');
await check('valid submission accepted', post('/api/contact', valid), 201, (b) => b?.success === true && typeof b.referenceId === 'string');
await check(
  'invalid fields rejected with per-field messages',
  post('/api/contact', { name: 'J', email: 'nope', message: 'short', consent: false }),
  400,
  (b) =>
    b?.errors?.name === 'Please enter your full name.' &&
    b?.errors?.email === 'Please enter a valid email address.' &&
    b?.errors?.consent === 'Please confirm before sending.'
);
await check(
  'honeypot silently accepted without work',
  post('/api/contact', { ...valid, company: 'SpamCo' }),
  201,
  (b) => b?.success === true && b.referenceId === undefined
);
await check(
  'CRLF header-injection attempt sanitised',
  post('/api/contact', {
    ...valid,
    name: 'Bob\r\nBcc: attacker@evil.com',
  }),
  201,
  (b) => b?.success === true
);
await check('malformed JSON returns 400', post('/api/contact', '{bad json'), 400);
await check(
  'oversized payload returns 413',
  post('/api/contact', { ...valid, message: 'x'.repeat(40000) }),
  413
);

console.log('\nNewsletter endpoint');
await check(
  'valid email accepted and normalised',
  post('/api/newsletter', { email: '  Reader@Example.COM ' }),
  201,
  (b) => b?.success === true
);
await check('invalid email rejected', post('/api/newsletter', { email: 'bad' }), 400, (b) => b?.success === false);

console.log('\nCORS');
await check(
  'disallowed origin blocked with 403',
  post('/api/contact', valid, { Origin: 'https://evil.example' }),
  403,
  (b) => b?.success === false
);

console.log('\nRate limiting (contact limit = 5/hour)');
let limited = false;
for (let i = 0; i < 8; i++) {
  const res = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...valid, message: `Rate limit probe number ${i} goes here.` }),
  });
  if (res.status === 429) {
    limited = true;
    break;
  }
}
if (limited) {
  pass++;
  console.log('  PASS  contact endpoint rate-limits after threshold → 429');
} else {
  fail++;
  console.log('  FAIL  contact endpoint never returned 429');
}

console.log(`\n${fail === 0 ? 'ALL PASS' : `${fail} FAILURE(S)`} — ${pass + fail} checks\n`);
process.exit(fail === 0 ? 0 : 1);
