'use strict';

// ─── DevToolsmith Automation — Shared Configuration ──────────────────────────
// All secrets come from environment variables / GitHub Actions Secrets.
// NEVER hardcode API keys in this file.

const SITES = [
  {
    name:   'CompliPilot',
    url:    'https://complipilot.dev',
    tool:   'F1',
    sender: { name: 'CompliPilot', email: 'hello@complipilot.dev' },
    tagline: 'AI-powered EU/GDPR/HIPAA compliance scanner',
  },
  {
    name:   'AccessiScan',
    url:    'https://fixmyweb.dev',
    tool:   'F2',
    sender: { name: 'AccessiScan', email: 'hello@fixmyweb.dev' },
    tagline: '201-check WCAG 2.2 accessibility scanner',
  },
  {
    name:   'ChurnGuard',
    url:    'https://paymentrescue.dev',
    tool:   'F3',
    sender: { name: 'ChurnGuard', email: 'hello@paymentrescue.dev' },
    tagline: 'Automated failed-payment recovery & dunning management',
  },
  {
    name:   'ParseFlow',
    url:    'https://parseflow.dev',
    tool:   'F4',
    sender: { name: 'ParseFlow', email: 'hello@parseflow.dev' },
    tagline: 'AI document & invoice parser (PDF, Word, Excel)',
  },
  {
    name:   'CaptureAPI',
    url:    'https://captureapi.dev',
    tool:   'B7',
    sender: { name: 'CaptureAPI', email: 'hello@captureapi.dev' },
    tagline: 'Screenshot & PDF generation API — 200 free/month',
  },
];

const OWNER = {
  email:  'antonio.alt3000@gmail.com',
  name:   'Antonio Altomonte',
  brand:  'DevToolsmith',
  sender: { name: 'DevToolsmith', email: 'hello@captureapi.dev' },
};

// GitHub repo info (used in report links)
const GITHUB = {
  owner: 'antonioalt3000-cyber',
  repo:  'toolkit-online',
};

module.exports = { SITES, OWNER, GITHUB };
