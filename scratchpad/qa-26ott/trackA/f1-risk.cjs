// F1 CompliPilot — /risk-assessment questionnaire in a real browser vs an
// oracle written from the EU AI Act tier rules (not from product code paths).
const { Journey, sleep } = require('../../qa-infra/cdp-journey.cjs');
const BASE = process.argv[2] || 'https://complipilot.dev';
const EV = 'C:/Users/ftass/toolkit-online/scratchpad/qa-26ott/evidence/f1';
const W = {
  // option weights as published in the questionnaire
  purpose: {
    'social-scoring': 4,
    biometric: 4,
    'biometric-other': 3,
    critical: 3,
    chatbot: 2,
    internal: 1,
  },
  impact: { 'life-safety': 4, 'legal-financial': 3, moderate: 2, minimal: 1 },
  autonomy: { 'fully-auto': 4, 'semi-auto': 3, assisted: 2, suggestions: 1 },
  data: { 'biometric-health': 4, 'financial-criminal': 3, behavioral: 2, none: 1 },
  sector: { 'law-enforcement': 4, 'healthcare-infra': 3, 'finance-hr': 3, marketing: 1 },
  transparency: { none: 4, limited: 2, good: 1, full: 0 },
};
function oracle(a) {
  if (a.purpose === 'social-scoring' || a.purpose === 'biometric') return 'Unacceptable Risk'; // Art. 5 per se
  const sum = Object.entries(a).reduce((s, [q, v]) => s + W[q][v], 0);
  const r = sum / 24;
  return { tier: r > 0.6 ? 'High Risk' : r > 0.35 ? 'Limited Risk' : 'Minimal Risk', sum };
}
const CASES = [
  [
    'social scoring, otherwise benign',
    {
      purpose: 'social-scoring',
      impact: 'minimal',
      autonomy: 'suggestions',
      data: 'none',
      sector: 'marketing',
      transparency: 'full',
    },
  ],
  [
    'real-time public biometric ID (law enforcement)',
    {
      purpose: 'biometric',
      impact: 'minimal',
      autonomy: 'suggestions',
      data: 'none',
      sector: 'marketing',
      transparency: 'full',
    },
  ],
  [
    'CV screening for hiring',
    {
      purpose: 'critical',
      impact: 'legal-financial',
      autonomy: 'semi-auto',
      data: 'financial-criminal',
      sector: 'finance-hr',
      transparency: 'limited',
    },
  ],
  [
    'customer-service chatbot',
    {
      purpose: 'chatbot',
      impact: 'moderate',
      autonomy: 'assisted',
      data: 'behavioral',
      sector: 'marketing',
      transparency: 'limited',
    },
  ],
  [
    'spam filter',
    {
      purpose: 'internal',
      impact: 'minimal',
      autonomy: 'suggestions',
      data: 'none',
      sector: 'marketing',
      transparency: 'good',
    },
  ],
  [
    'boundary 14/24 (0.583)',
    {
      purpose: 'chatbot',
      impact: 'legal-financial',
      autonomy: 'semi-auto',
      data: 'behavioral',
      sector: 'finance-hr',
      transparency: 'good',
    },
  ],
  [
    'boundary 15/24 (0.625)',
    {
      purpose: 'chatbot',
      impact: 'legal-financial',
      autonomy: 'semi-auto',
      data: 'behavioral',
      sector: 'finance-hr',
      transparency: 'limited',
    },
  ],
  [
    'boundary 8/24 vs 9/24: 9 (0.375)',
    {
      purpose: 'internal',
      impact: 'moderate',
      autonomy: 'assisted',
      data: 'none',
      sector: 'marketing',
      transparency: 'good',
    },
  ],
  [
    'boundary 8/24 (0.333)',
    {
      purpose: 'internal',
      impact: 'moderate',
      autonomy: 'suggestions',
      data: 'none',
      sector: 'marketing',
      transparency: 'good',
    },
  ],
  [
    'non-law-enforcement biometric (weight 3, not per-se banned)',
    {
      purpose: 'biometric-other',
      impact: 'minimal',
      autonomy: 'suggestions',
      data: 'none',
      sector: 'marketing',
      transparency: 'full',
    },
  ],
];
(async () => {
  const j = await Journey.open(`${BASE}/risk-assessment`);
  const rows = [];
  for (const [name, ans] of CASES) {
    await j.goto(`${BASE}/risk-assessment`);
    await j.waitFor('label[for="ra-purpose-internal"]');
    for (const [q, v] of Object.entries(ans)) await j.click(`label[for="ra-${q}-${v}"]`);
    await j.click('text=Get Risk Classification');
    await j.waitFor('js:/Your AI System Risk Classification/i.test(document.body.innerText)', {
      timeout: 8000,
    });
    const got = await j.eval(
      `(() => { const p = [...document.querySelectorAll('p')].find(e => /Your AI System Risk Classification/i.test(e.innerText)); return p ? p.parentElement.querySelector('h2').innerText.trim() : null; })()`
    );
    const o = oracle(ans);
    const want = typeof o === 'string' ? o : o.tier;
    rows.push({
      case: name,
      sum: typeof o === 'string' ? 'Art.5' : o.sum,
      want,
      got,
      ok: got === want,
    });
  }
  await j.screenshot(`${EV}/prod-risk-last.png`);
  console.table(rows);
  console.log(
    'PASS',
    rows.filter((r) => r.ok).length,
    '/',
    rows.length,
    '| report',
    JSON.stringify(j.report())
  );
  await j.close();
})().catch((e) => {
  console.error('ERR', e.message);
  process.exitCode = 1;
});
