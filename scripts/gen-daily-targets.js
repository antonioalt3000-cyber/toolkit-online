#!/usr/bin/env node
/**
 * DAILY TARGET GENERATOR — Crea email da target pool rotante
 *
 * Eseguire: node scripts/gen-daily-targets.js
 *
 * Workflow:
 * 1. Legge CONTACTS_REGISTRY.md per evitare duplicati
 * 2. Seleziona 30 target dal pool (non ancora contattati)
 * 3. Crea file JSON nella coda email
 * 4. Pronto per daily-outreach.js
 *
 * IMPORTANTE: Aggiungere nuovi target al pool regolarmente!
 * Il pool si esaurisce — /boss deve cercare nuovi target con WebSearch
 */

const fs = require("fs");
const path = require("path");

const QUEUE_DIR = "C:/Users/ftass/toolkit-online/scripts/queue/email";
const REGISTRY = "C:/Users/ftass/toolkit-online/scripts/queue/sent/CONTACTS_REGISTRY.md";
const TODAY = new Date().toISOString().slice(0, 10);

// ============================================================
// TARGET POOL — Aggiungere nuovi target qui regolarmente
// Formato: { email, name, business, subject, body }
// business: F2, F1, B7, F3, F4
// ============================================================

const SENDER_MAP = {
  F2: { name: "Antonio - FixMyWeb", email: "hello@fixmyweb.dev" },
  F1: { name: "Antonio - CompliPilot", email: "hello@complipilot.dev" },
  B7: { name: "Antonio - CaptureAPI", email: "hello@captureapi.dev" },
  F3: { name: "Antonio - PaymentRescue", email: "hello@paymentrescue.dev" },
  F4: { name: "Antonio - ParseFlow", email: "hello@parseflow.dev" },
};

// Template email per business (personalizzare il {COMPANY} placeholder)
const TEMPLATES = {
  F2: {
    subject: "WCAG scanning partnership for {COMPANY}",
    body: "<p>Hi {COMPANY} team,</p><p>With EAA enforcement active across the EU, many agencies need automated accessibility pre-audit tools. FixMyWeb.dev runs 201 WCAG checks in seconds with code-level fix suggestions — double what WAVE offers.</p><p>Would you be interested in a partnership? Happy to set up a free Pro account for your team to test.</p><p>Best,<br>Antonio<br>FixMyWeb.dev</p>",
  },
  F1: {
    subject: "Automated AI Act scanning for {COMPANY}",
    body: "<p>Hi {COMPANY} team,</p><p>CompliPilot.dev automates 200+ EU AI Act compliance checks — gives your clients an instant risk assessment before in-depth consulting. Deadline August 2026 is approaching fast.</p><p>Would a referral partnership make sense? Free demo available.</p><p>Best,<br>Antonio<br>CompliPilot.dev</p>",
  },
  B7: {
    subject: "Screenshot + PDF + OG API — cross-referral idea with {COMPANY}",
    body: "<p>Hi {COMPANY} team,</p><p>I built CaptureAPI.dev — screenshots, HTML-to-PDF, and OG image generation in one API. 200 free requests/month. Different enough from your offering for a cross-referral?</p><p>Your users needing PDF/OG generation could benefit from our API. Happy to discuss.</p><p>Best,<br>Antonio<br>CaptureAPI.dev</p>",
  },
  F3: {
    subject: "Automated dunning for {COMPANY} merchants/users",
    body: "<p>Hi {COMPANY} team,</p><p>Failed payments cause up to 9% MRR loss in subscriptions. PaymentRescue.dev automates 3-step dunning for Stripe — recovers up to 50% of involuntary churn.</p><p>Could be a valuable add-on for your platform. Free ROI calculator at paymentrescue.dev.</p><p>Best,<br>Antonio<br>PaymentRescue.dev</p>",
  },
  F4: {
    subject: "PDF extraction API — complementary to {COMPANY}",
    body: "<p>Hi {COMPANY} team,</p><p>ParseFlow.dev extracts structured data from PDFs into clean JSON — one API call, no ML training needed. 100 free pages/month.</p><p>Could be complementary for your users who need lightweight document extraction. Cross-referral opportunity?</p><p>Best,<br>Antonio<br>ParseFlow.dev</p>",
  },
};

// ============================================================
// TARGET POOL — Aggiornato 5 aprile 2026
// Aggiungere nuovi target dopo ogni ricerca WebSearch
// ============================================================
// ============================================================
// TARGET POOL — Ogni target ha email PERSONALIZZATA
// 'hook' = frase specifica su cosa fa l'azienda (ricercata via web)
// 'angle' = perche ci contattiamo (partnership, cross-referral, etc.)
//
// AGGIUNGERE NUOVI TARGET: durante sessione /boss, cercare con
// WebSearch + WebFetch per trovare email verificate e scrivere
// hook personalizzati per ogni azienda.
// ============================================================
const TARGET_POOL = [
  // F2 AccessiScan — Agenzie/tool accessibilita
  { email: "info@siteimprove.com", name: "Siteimprove", business: "F2",
    hook: "Your all-in-one platform covers SEO, analytics, and accessibility",
    angle: "FixMyWeb focuses purely on WCAG code fixes — could complement your platform for developer teams who want to fix issues at the source code level" },
  { email: "hello@silktide.com", name: "Silktide", business: "F2",
    hook: "Your website governance platform monitors accessibility at scale",
    angle: "FixMyWeb provides code-level fix snippets that your users could apply directly — a natural next step after Silktide identifies the issues" },
  { email: "info@deque.com", name: "Deque Systems", business: "F2",
    hook: "axe-core is the gold standard for accessibility testing",
    angle: "FixMyWeb runs 201 checks including axe rules plus additional EU-specific EAA checks — could be interesting for your EU-focused customers" },
  { email: "info@monsido.com", name: "Monsido", business: "F2",
    hook: "Your web governance suite helps organizations manage website quality",
    angle: "FixMyWeb adds developer-focused fix snippets — your clients identify issues with Monsido, developers fix them with FixMyWeb code suggestions" },
  { email: "contact@temesis.com", name: "Temesis", business: "F2",
    hook: "Your RGAA and WCAG expertise in France is well-known in the accessibility community",
    angle: "FixMyWeb could speed up your audit workflow — automated pre-screening with 201 checks before your expert manual review" },

  // F1 CompliPilot — AI governance
  { email: "info@trilateralresearch.com", name: "Trilateral Research", business: "F1",
    hook: "Your responsible innovation research bridges ethics and technology",
    angle: "CompliPilot automates the technical compliance checks for EU AI Act — could give your research clients an instant risk baseline" },
  { email: "hello@mostly.ai", name: "Mostly AI", business: "F1",
    hook: "Your synthetic data platform helps companies use data responsibly",
    angle: "CompliPilot scans AI systems for EU AI Act compliance — your customers using synthetic data for AI training also need to check their AI system compliance" },
  { email: "info@algorithmwatch.org", name: "AlgorithmWatch", business: "F1",
    hook: "Your research on algorithmic accountability is groundbreaking",
    angle: "CompliPilot makes AI Act compliance accessible to SMEs — aligns with your mission of algorithmic accountability for all, not just enterprises" },

  // B7 CaptureAPI — Dev tools
  { email: "support@scrapingbee.com", name: "ScrapingBee", business: "B7",
    hook: "Your web scraping API handles JavaScript rendering beautifully",
    angle: "CaptureAPI adds visual capture (screenshots + PDF + OG images) — your scraping users often also need visual snapshots of the pages they scrape" },
  { email: "hello@phantombuster.com", name: "PhantomBuster", business: "B7",
    hook: "Your growth automation platform automates LinkedIn and social outreach",
    angle: "CaptureAPI could add visual proof features — screenshot evidence of profile visits, page states before/after automation" },
  { email: "support@scrapfly.io", name: "Scrapfly", business: "B7",
    hook: "Your scraping API with anti-bot bypass is impressively robust",
    angle: "CaptureAPI focuses on the visual side — screenshots, PDFs, OG images. Could be a nice cross-sell for your users who need visual capture alongside data scraping" },

  // F3 ChurnGuard — Billing/subscription
  { email: "support@recurly.com", name: "Recurly", business: "F3",
    hook: "Your subscription management platform powers thousands of recurring businesses",
    angle: "PaymentRescue adds automated dunning specifically for Stripe-connected businesses — could complement Recurly for merchants using both platforms" },
  { email: "info@churnkey.co", name: "Churnkey", business: "F3",
    hook: "Your cancellation flows and retention tools reduce voluntary churn",
    angle: "PaymentRescue focuses on involuntary churn (failed payments) — different problem, complementary solution. Your users stop voluntary churn, we recover failed payments" },
  { email: "support@billsby.com", name: "Billsby", business: "F3",
    hook: "Your subscription billing platform makes recurring revenue simple",
    angle: "PaymentRescue adds 3-step dunning for failed payments — could be a valuable integration for your merchants losing revenue to card failures" },

  // F4 ParseFlow — Document processing
  { email: "support@parseur.com", name: "Parseur", business: "F4",
    hook: "Your email and document parser automates data extraction from various sources",
    angle: "ParseFlow is API-first with no ML training needed — could handle the simpler extraction use cases your users have, freeing Parseur for complex parsing" },
  { email: "hello@nanonets.com", name: "Nanonets", business: "F4",
    hook: "Your AI-powered OCR handles complex document types impressively",
    angle: "ParseFlow takes a simpler approach — template-based extraction for structured PDFs like invoices. Different market segment, potential cross-referral" },
  { email: "support@veryfi.com", name: "Veryfi", business: "F4",
    hook: "Your real-time receipt and invoice OCR is used by major fintech companies",
    angle: "ParseFlow offers a lightweight alternative for developers who need basic PDF-to-JSON without the full Veryfi feature set — different price point, potential referral" },
];

function getAlreadyContacted() {
  if (!fs.existsSync(REGISTRY)) return new Set();
  const content = fs.readFileSync(REGISTRY, "utf8");
  const emails = new Set();
  const regex = /[\w.-]+@[\w.-]+\.\w+/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    emails.add(match[0].toLowerCase());
  }
  return emails;
}

function generateEmails() {
  const contacted = getAlreadyContacted();
  const available = TARGET_POOL.filter(t => !contacted.has(t.email.toLowerCase()));

  if (available.length === 0) {
    console.log("[GEN] Pool esaurito! Aggiungere nuovi target al TARGET_POOL.");
    console.log("[GEN] Eseguire /boss per cercare nuovi target con WebSearch.");
    return 0;
  }

  // Select up to 30 targets, respecting per-business quotas
  const quotas = { F2: 10, F1: 7, B7: 5, F3: 4, F4: 4 };
  const selected = [];
  const used = {};

  for (const target of available) {
    if (selected.length >= 30) break;
    used[target.business] = (used[target.business] || 0) + 1;
    if (used[target.business] > (quotas[target.business] || 5)) continue;
    selected.push(target);
  }

  // Create email files with PERSONALIZED content
  if (!fs.existsSync(QUEUE_DIR)) fs.mkdirSync(QUEUE_DIR, { recursive: true });

  let created = 0;
  for (const target of selected) {
    const sender = SENDER_MAP[target.business];
    const template = TEMPLATES[target.business];
    const companySlug = target.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    // Se il target ha hook+angle personalizzati, usa quelli
    // Altrimenti fallback al template generico
    let subject, body;
    if (target.hook && target.angle) {
      subject = template.subject.replace("{COMPANY}", target.name);
      body = `<p>Hi ${target.name} team,</p><p>${target.hook}. ${target.angle}.</p><p>Would you be interested in exploring this? Happy to set up a free account for your team.</p><p>Best,<br>Antonio<br>${SENDER_MAP[target.business].name.replace("Antonio - ", "")}</p>`;
    } else {
      subject = template.subject.replace("{COMPANY}", target.name);
      body = template.body.replace(/{COMPANY}/g, target.name);
    }

    const emailData = {
      to_email: target.email,
      to_name: target.name,
      sender_name: sender.name,
      sender_email: sender.email,
      subject: subject,
      html_body: body,
    };

    const filename = `${TODAY}_email_${companySlug}.json`;
    fs.writeFileSync(path.join(QUEUE_DIR, filename), JSON.stringify(emailData, null, 2));
    created++;
  }

  console.log(`[GEN] ${created} email create in coda (${available.length - created} target rimasti nel pool)`);
  console.log(`[GEN] Eseguire: node scripts/daily-outreach.js per inviarle`);
  return created;
}

generateEmails();
