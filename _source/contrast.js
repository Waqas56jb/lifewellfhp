// WCAG 2.2 relative-luminance contrast checker for the LifeWell token set.
const hex = (h) => {
  const s = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};
const lum = (h) => {
  const [r, g, b] = hex(h).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

const T = {
  primary: '#3E7FB1',
  primaryHover: '#2F6691',
  accent: '#5FAF6B',
  accentHover: '#4A8F55',
  accentStrong: '#3D7A47',
  textPrimary: '#374151',
  textSecondary: '#5B6675',
  textLink: '#2F6691',
  white: '#FFFFFF',
  surfaceBase: '#F4F7FA',
  surfaceRaised: '#FFFFFF',
  surfaceMuted: '#EEF3F7',
  surfaceInverse: '#2F6691',
  borderSubtle: '#E1E8EE',
  borderStrong: '#C9D6E2',
  error: '#B3261E',
  warning: '#9A6700',
  crisis: '#B3261E',
  crisisSoft: '#FDECEB',
};

// [label, fg, bg, requirement]  req: 4.5 normal text, 3.0 large text / UI
const checks = [
  ['Body text on base surface', T.textPrimary, T.surfaceBase, 4.5],
  ['Body text on raised (card)', T.textPrimary, T.surfaceRaised, 4.5],
  ['Body text on muted band', T.textPrimary, T.surfaceMuted, 4.5],
  ['Secondary text on base', T.textSecondary, T.surfaceBase, 4.5],
  ['Secondary text on raised', T.textSecondary, T.surfaceRaised, 4.5],
  ['Secondary text on muted', T.textSecondary, T.surfaceMuted, 4.5],
  ['Link on base', T.textLink, T.surfaceBase, 4.5],
  ['Link on raised', T.textLink, T.surfaceRaised, 4.5],
  ['White on primary button', T.white, T.primary, 4.5],
  ['White on primary hover', T.white, T.primaryHover, 4.5],
  ['White on accent-strong CTA', T.white, T.accentStrong, 4.5],
  ['White on accent (AVOID for text)', T.white, T.accent, 4.5],
  ['White on inverse surface', T.white, T.surfaceInverse, 4.5],
  ['Error text on raised', T.error, T.surfaceRaised, 4.5],
  ['Error text on crisis-soft', T.crisis, T.crisisSoft, 4.5],
  ['Warning text on raised', T.warning, T.surfaceRaised, 4.5],
  ['Primary as LARGE display text on white', T.primary, T.surfaceRaised, 3.0],
  ['Focus ring vs base surface (UI)', T.primary, T.surfaceBase, 3.0],
  ['Focus ring vs raised (UI)', T.primary, T.surfaceRaised, 3.0],
  ['Border-strong vs raised (UI)', T.borderStrong, T.surfaceRaised, 3.0],
  ['Accent fill vs white (non-text UI)', T.accent, T.surfaceRaised, 3.0],
];

let fail = 0;
console.log('WCAG 2.2 contrast audit — LifeWell token set\n');
console.log('  RATIO   REQ   STATUS  PAIR');
console.log('  ------  ----  ------  ----------------------------------------');
for (const [label, fg, bg, req] of checks) {
  const r = ratio(fg, bg);
  const ok = r >= req;
  if (!ok) fail++;
  console.log(
    `  ${r.toFixed(2).padStart(5)}   ${req.toFixed(1)}   ${ok ? ' PASS ' : ' FAIL '}  ${label}  (${fg} on ${bg})`
  );
}
console.log(`\n${fail === 0 ? 'ALL PASS' : fail + ' FAILURE(S)'} — ${checks.length} pairs checked`);
