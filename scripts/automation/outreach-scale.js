'use strict';

// ─── Outreach Scale Script ────────────────────────────────────────────────────
// Sends N emails/day (default 5) from prospects-scale.json
// Zero-cost: only uses Brevo free tier API (300/day limit)
// SAFETY: regex price guard blocks any email with price figures pre-send

const fs = require('fs');
const path = require('path');
const { sendEmail } = require('./brevo');

const PROSPECTS_FILE  = path.join(__dirname, 'prospects-scale.json');
const LOG_FILE        = path.join(__dirname, 'outreach-scale-log.json');
const SENT_LOG_FILE   = path.join(__dirname, '..', '..', 'sent-log-scale.json');  // Outside scripts/

const DRY_RUN = process.env.OUTREACH_DRY_RUN === 'true';
const LIMIT   = Math.max(1, Math.min(20, parseInt(process.env.OUTREACH_LIMIT || '5', 10)));

// Price regex — BLOCKS email if any of these match
const PRICE_REGEX = /\$\s?\d|\€\s?\d|£\s?\d|LTD from \$|\d+%\s*off|\d+\s*USD|\d+\s*EUR|lifetime\s+from|forever\s+only/i;

// ── SaaS-specific email templates (rule-based, no LLM) ───────────────────────
const TEMPLATES = {
  F1: {
    from:    { name: 'Antonio / DevToolsmith', email: 'hello@complipilot.dev' },
    subject: (p) => `EU AI Act compliance check for ${p.company}`,
    body:    (p) => `Hi ${p.firstName || 'team'},

Quick note - EU AI Act enforcement deadline is August 2, 2026. Many teams using LLMs, AI features, or automated decision systems will need compliance documentation soon.

We built CompliPilot (https://complipilot.dev) - automated scanner for EU AI Act, HIPAA, CCPA, NIS2. 200+ checks, 4 risk tier classification, executive PDF report.

Free tier available (no card). Takes ~60 seconds for first-pass audit.

Useful if ${p.company} is building AI-powered products for EU markets.

Thanks,
Antonio / DevToolsmith
https://complipilot.dev`,
  },
  F2: {
    from:    { name: 'Antonio / DevToolsmith', email: 'hello@fixmyweb.dev' },
    subject: (p) => `EAA accessibility check for ${p.company}`,
    body:    (p) => `Hi ${p.firstName || 'team'},

European Accessibility Act is enforceable across EU since June 2025. Fines vary by country and can be material.

Built FixMyWeb (https://fixmyweb.dev) - automated WCAG 2.2 + EAA scanner. 201 checks in under 60s, PDF report, embeddable compliance badge.

Free tier, no card needed. First-pass audit before deeper manual testing.

Useful if ${p.company} serves EU customers.

Thanks,
Antonio / DevToolsmith
https://fixmyweb.dev`,
  },
  F3: {
    from:    { name: 'Antonio / DevToolsmith', email: 'hello@paymentrescue.dev' },
    subject: (p) => `Failed payment recovery for ${p.company}`,
    body:    (p) => `Hi ${p.firstName || 'team'},

Many subscription businesses lose a meaningful share of MRR to involuntary churn (card expired, fraud decline, insufficient funds). Smart dunning can recover a large portion automatically.

Built ChurnGuard (https://paymentrescue.dev) - Stripe-native payment recovery. 4 retention playbooks, HMAC webhook API, recovery dashboard.

Free tier (ROI calculator + small scale). Useful if ${p.company} runs subscriptions.

Thanks,
Antonio / DevToolsmith
https://paymentrescue.dev`,
  },
  F4: {
    from:    { name: 'Antonio / DevToolsmith', email: 'hello@parseflow.dev' },
    subject: (p) => `PDF data extraction for ${p.company}`,
    body:    (p) => `Hi ${p.firstName || 'team'},

If ${p.company} handles invoices, receipts, or bank statements, automated extraction saves hours.

Built ParseFlow (https://parseflow.dev) - API returning structured JSON from PDF/Word/Excel. No ML training required, batch uploads, webhooks.

Free tier 100 pages/month. Useful for fintech, accounting, RPA integrations.

Thanks,
Antonio / DevToolsmith
https://parseflow.dev`,
  },
  B7: {
    from:    { name: 'Antonio / DevToolsmith', email: 'hello@captureapi.dev' },
    subject: (p) => `Screenshot API for ${p.company}`,
    body:    (p) => `Hi ${p.firstName || 'team'},

If ${p.company} ever needs programmatic screenshots, OG images, or HTML-to-PDF, running headless Chrome at scale is a pain.

Built CaptureAPI (https://captureapi.dev) - managed Playwright endpoint. 5 viewport presets (mobile to 4K), CSS selector capture, watermark, batch.

Free tier 200 screenshots/month (no card). 99.9% uptime, 143ms avg.

Thanks,
Antonio / DevToolsmith
https://captureapi.dev`,
  },
};

function loadJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch (_) { return fallback; }
}

function saveJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

async function main() {
  const prospects = loadJson(PROSPECTS_FILE, { prospects: [] });
  const log       = loadJson(LOG_FILE, { runs: [] });

  if (!Array.isArray(prospects.prospects)) {
    console.error('No prospects.json array found');
    process.exit(1);
  }

  // Select next N uncontacted prospects
  const uncontacted = prospects.prospects.filter(p => !p.contacted_date && !p.bounced);
  const batch = uncontacted.slice(0, LIMIT);

  console.log(`Total prospects: ${prospects.prospects.length}`);
  console.log(`Uncontacted: ${uncontacted.length}`);
  console.log(`Sending today (limit ${LIMIT}): ${batch.length}`);

  if (batch.length === 0) {
    console.log('Nothing to send today. Consider adding more prospects to prospects-scale.json');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const runResults = [];

  for (const p of batch) {
    const tpl = TEMPLATES[p.saas];
    if (!tpl) {
      console.log(`  ⚠️ Skip ${p.email}: no template for SaaS ${p.saas}`);
      runResults.push({ email: p.email, status: 'skip-no-template' });
      continue;
    }

    const subject = tpl.subject(p);
    const body    = tpl.body(p);

    // SAFETY: regex price guard — BLOCK if match
    if (PRICE_REGEX.test(subject) || PRICE_REGEX.test(body)) {
      console.log(`  🔴 BLOCKED ${p.email}: price regex matched`);
      runResults.push({ email: p.email, status: 'blocked-price-regex' });
      continue;
    }

    if (DRY_RUN) {
      console.log(`  [DRY] would send to ${p.email} (${p.saas}): ${subject}`);
      runResults.push({ email: p.email, status: 'dry-run' });
      continue;
    }

    try {
      const result = await sendEmail({
        to: { email: p.email, name: p.company || 'Team' },
        subject,
        htmlContent: body.replace(/\n/g, '<br>'),
        sender: tpl.from,
      });

      if (result.status === 208) {
        console.log(`  ⚠️ DEDUP ${p.email}: ${result.body}`);
        runResults.push({ email: p.email, status: 'dedup-skipped' });
      } else if (result.status >= 200 && result.status < 300) {
        console.log(`  ✅ ${p.email}: ${result.status}`);
        p.contacted_date = today;
        p.contacted_saas = p.saas;
        runResults.push({ email: p.email, status: 'sent', httpCode: result.status });
      } else {
        console.error(`  ❌ ${p.email}: ${result.status} ${result.body.substring(0, 100)}`);
        p.bounced = true;
        p.bounce_date = today;
        runResults.push({ email: p.email, status: 'failed', httpCode: result.status });
      }
    } catch (e) {
      console.error(`  ❌ ${p.email}: exception ${e.message}`);
      runResults.push({ email: p.email, status: 'exception', error: e.message });
    }

    // Rate limit: 10s between sends (self-imposed anti-spam)
    await new Promise(r => setTimeout(r, 10000));
  }

  // Persist
  if (!DRY_RUN) {
    saveJson(PROSPECTS_FILE, prospects);
  }

  log.runs.push({ date: today, count: runResults.length, results: runResults });
  saveJson(LOG_FILE, log);

  const ok = runResults.filter(r => r.status === 'sent').length;
  console.log(`\n=== Summary: ${ok}/${runResults.length} sent ===`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
