'use strict';

// ─── DevToolsmith Automation — Shared Configuration ──────────────────────────
// All secrets come from environment variables / GitHub Actions Secrets.
// NEVER hardcode API keys in this file.

const SITES = [
  {
    name: 'CompliPilot',
    url: 'https://complipilot.dev',
    tool: 'F1',
    sender: { name: 'CompliPilot', email: 'hello@complipilot.dev' },
    tagline: 'AI-powered EU/GDPR/HIPAA compliance scanner',
  },
  {
    name: 'AccessiScan',
    url: 'https://fixmyweb.dev',
    tool: 'F2',
    sender: { name: 'AccessiScan', email: 'hello@fixmyweb.dev' },
    tagline: '201-check WCAG 2.2 accessibility scanner',
  },
  {
    name: 'ChurnGuard',
    url: 'https://paymentrescue.dev',
    tool: 'F3',
    sender: { name: 'ChurnGuard', email: 'hello@paymentrescue.dev' },
    tagline: 'Automated failed-payment recovery & dunning management',
  },
  {
    name: 'ParseFlow',
    url: 'https://parseflow.dev',
    tool: 'F4',
    sender: { name: 'ParseFlow', email: 'hello@parseflow.dev' },
    tagline: 'AI document & invoice parser (PDF, Word, Excel)',
  },
  {
    name: 'CaptureAPI',
    url: 'https://captureapi.dev',
    tool: 'B7',
    sender: { name: 'CaptureAPI', email: 'hello@captureapi.dev' },
    tagline: 'Screenshot & PDF generation API — 200 free/month',
  },
  // ─── Round-2 SaaS (added 2026-07: portfolio grew 5 → 10) ───────────────────
  // Public brand = root domain (never the repo codename). HookLab/CardForge live
  // on the get-prefixed domains; the bare hooklab.dev/cardforge.dev are THIRD-PARTY.
  {
    name: 'EmailGuard',
    url: 'https://emailguard.dev',
    tool: 'EG',
    sender: { name: 'EmailGuard', email: 'hello@emailguard.dev' },
    tagline: 'Email verification & deliverability API',
  },
  {
    name: 'SEOScope',
    url: 'https://seoscope.dev',
    tool: 'SEO',
    sender: { name: 'SEOScope', email: 'hello@seoscope.dev' },
    tagline: 'On-page SEO audit & Core Web Vitals scanner',
  },
  {
    name: 'HeaderShield',
    url: 'https://headershield.dev',
    tool: 'HSH',
    sender: { name: 'HeaderShield', email: 'hello@headershield.dev' },
    tagline: 'HTTP security-headers scanner & grader',
  },
  {
    name: 'HookLab',
    url: 'https://gethooklab.dev',
    tool: 'HKL',
    sender: { name: 'HookLab', email: 'hello@gethooklab.dev' },
    tagline: 'Webhook testing, inspection & replay',
  },
  {
    name: 'CardForge',
    url: 'https://getcardforge.dev',
    tool: 'CFG',
    sender: { name: 'CardForge', email: 'hello@getcardforge.dev' },
    tagline: 'Dynamic Open Graph image generation API',
  },
];

const OWNER = {
  email: 'antonio.alt3000@gmail.com',
  name: 'Antonio Altomonte',
  brand: 'DevToolsmith',
  sender: { name: 'DevToolsmith', email: 'hello@captureapi.dev' },
};

// GitHub repo info (used in report links)
const GITHUB = {
  owner: 'antonioalt3000-cyber',
  repo: 'toolkit-online',
};

module.exports = { SITES, OWNER, GITHUB };
