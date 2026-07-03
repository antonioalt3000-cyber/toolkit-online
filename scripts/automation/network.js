'use strict';

// ─── Ouroboros Network Registry — the 17-property portfolio ──────────────────
// Single source of truth for the self-monitoring / self-optimization layer.
// EXTENDS (never mutates) config.js SITES with the 7 empire domains + the
// scanner-applicability matrix. Secrets NEVER live here — only structure; the
// God-Mode creator keys are read from env at call time (see `keyEnv`).
//
// The 10 SaaS are BOTH the scanners AND scan targets — the snake eats its tail.
// The 7 empire domains are absent from config.js SITES on purpose (they have no
// /api/redeem funnel or /api/v1 surface, so injecting them there would break the
// redeem-liveness loop in saas-smoke.js). They live only here.

const { SITES } = require('./config');

// ── Scanner-SaaS: which of our own products can audit an external URL, and the
// EXACT API contract for each. Routes/verbs/params were read from each SaaS's
// source (not guessed): HeaderShield GET /api/v1/scan?url=, SEOScope POST
// /api/v1/audit {url}, CompliPilot POST /api/scan {url}, CaptureAPI GET
// /api/v1/screenshot?url=&json=true. All authenticate with `x-api-key` — the
// creator key bypasses quota, not auth (a random key still 401s).
const SCANNERS = {
  HSH: {
    code: 'HSH',
    brand: 'HeaderShield',
    base: 'https://headershield.dev',
    method: 'GET',
    path: '/api/v1/scan',
    urlParam: 'url',
    keyEnv: 'CREATOR_HSH_KEY',
    kind: 'headers',
    label: 'Security headers (CSP/HSTS/CORS) grade',
  },
  SEO: {
    code: 'SEO',
    brand: 'SEOScope',
    base: 'https://seoscope.dev',
    method: 'POST',
    path: '/api/v1/audit',
    bodyParam: 'url',
    keyEnv: 'CREATOR_SEO_KEY',
    kind: 'seo',
    label: 'On-page SEO & Core Web Vitals audit',
  },
  F1: {
    code: 'F1',
    brand: 'CompliPilot',
    base: 'https://complipilot.dev',
    method: 'POST',
    path: '/api/scan',
    bodyParam: 'url',
    keyEnv: 'CREATOR_F1_KEY',
    kind: 'gdpr',
    label: 'GDPR / cookie-consent / EU-AI-Act compliance',
  },
  B7: {
    code: 'B7',
    brand: 'CaptureAPI',
    base: 'https://captureapi.dev',
    method: 'GET',
    path: '/api/v1/screenshot',
    urlParam: 'url',
    extraQuery: { json: 'true', format: 'jpeg' },
    keyEnv: 'CREATOR_B7_KEY',
    kind: 'snapshot',
    label: 'Visual snapshot (change-detection)',
  },
  F2: {
    code: 'F2',
    brand: 'FixMyWeb',
    base: 'https://fixmyweb.dev',
    method: 'POST',
    path: '/api/scan',
    bodyParam: 'url',
    keyEnv: 'CREATOR_F2_KEY', // ask_live_* key bypasses BotID (a valid API key skips the bot gate)
    kind: 'a11y',
    label: 'WCAG 2.2 accessibility audit',
  },
};

// Applicability matrix — honest scoping, not "all 10 on all 17".
//   SaaS products      → security headers + visual snapshot (a real header
//                        regression on our own API matters; SEO of an API is vanity).
//   Content/affiliate  → the FULL quality audit: these live on organic ranking
//                        and load AdSense/GA, so SEO + GDPR-consent genuinely apply.
const SAAS_SCANNERS = ['HSH', 'B7'];
const CONTENT_SCANNERS = ['HSH', 'SEO', 'F1', 'B7', 'F2'];

// The 10 SaaS, derived from the trusted SITES list (URLs never duplicated).
const SAAS = SITES.map((s) => ({
  code: s.tool,
  name: s.name,
  url: s.url,
  domain: new URL(s.url).host,
  group: 'saas',
  deploy: 'auto',
  repo: 'self',
  scanners: SAAS_SCANNERS,
}));

// The 7 empire domains (5 AdSense content + 2 affiliate).
const EMPIRE = [
  {
    code: 'SOLAR',
    name: 'SolarFlow',
    url: 'https://solarflow.site',
    group: 'adsense',
    deploy: 'auto',
    repo: '~/empire-of-ads/solarflow',
  },
  {
    code: 'AISTACK',
    name: 'AIStackPicker',
    url: 'https://aistackpicker.xyz',
    group: 'adsense',
    deploy: 'auto',
    repo: '~/empire-of-ads/aistackpicker',
  },
  {
    code: 'EXPAT',
    name: 'ExpatFinance',
    url: 'https://expatfinance.info',
    group: 'adsense',
    deploy: 'auto',
    repo: '~/empire-of-ads/expatfinance',
  },
  {
    code: 'NICHIN',
    name: 'NichInsurance',
    url: 'https://nichinsurance.info',
    group: 'adsense',
    deploy: 'auto',
    repo: '~/empire-of-ads/nichinsurance',
  },
  {
    code: 'BCB',
    name: 'BorderCollieBase',
    url: 'https://bordercolliebase.xyz',
    group: 'adsense',
    deploy: 'auto',
    repo: '~/empire-of-ads/bordercolliebase',
  },
  {
    code: 'ITRIP',
    name: 'InstantTrip',
    url: 'https://instanttrip.online',
    group: 'affiliate',
    deploy: 'auto',
    repo: '~/instanttrip',
  },
  {
    code: 'TOPRK',
    name: 'TopRanked',
    url: 'https://topranked.info',
    group: 'affiliate',
    deploy: 'manual-cli',
    repo: '~/topranked',
  },
].map((e) => ({ ...e, domain: new URL(e.url).host, scanners: CONTENT_SCANNERS }));

const NETWORK = [...SAAS, ...EMPIRE]; // all 17 live properties

module.exports = { NETWORK, SAAS, EMPIRE, SCANNERS, SAAS_SCANNERS, CONTENT_SCANNERS };
