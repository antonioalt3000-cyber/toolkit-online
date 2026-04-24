/**
 * Generate personalized outreach emails from contact lists
 * Usage: node gen-personalized-emails.js
 *
 * Reads contacts from scripts/queue/outreach/*.md
 * Generates email JSON files in scripts/queue/email/
 */
const fs = require('fs');
const path = require('path');

const QUEUE_DIR = 'C:/Users/ftass/toolkit-online/scripts/queue/email';
const SENT_DIR = 'C:/Users/ftass/toolkit-online/scripts/queue/sent';

// Get already-sent emails to avoid duplicates
function getSentEmails() {
  const sent = new Set();
  try {
    const files = fs.readdirSync(SENT_DIR).filter(f => f.includes('email'));
    for (const f of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(SENT_DIR, f), 'utf8'));
        if (data.to_email) sent.add(data.to_email.toLowerCase());
      } catch(e) {}
    }
  } catch(e) {}
  // Also check current queue
  try {
    const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.json'));
    for (const f of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(QUEUE_DIR, f), 'utf8'));
        if (data.to_email) sent.add(data.to_email.toLowerCase());
      } catch(e) {}
    }
  } catch(e) {}
  return sent;
}

// Email templates per business
const templates = {
  f2: {
    sender_name: "Antonio - FixMyWeb",
    sender_email: "hello@fixmyweb.dev",
    subject: (company) => `Quick WCAG scan for ${company} — 201 automated checks`,
    body: (company, note) => `<p>Hi ${company} team,</p><p>${note}</p><p>I built FixMyWeb (fixmyweb.dev) — an automated WCAG scanner that runs 201 checks in 60 seconds. Agencies use it to pre-screen client sites before manual audits.</p><p>Would a free scan of your clients' sites be useful? We also offer a 30% partner commission on referrals.</p><p>Best,<br>Antonio Altomonte<br><a href='https://fixmyweb.dev'>fixmyweb.dev</a></p>`
  },
  b7: {
    sender_name: "Antonio - CaptureAPI",
    sender_email: "hello@captureapi.dev",
    subject: (company) => `Screenshot + PDF API for ${company} — 200 free/month`,
    body: (company, note) => `<p>Hi ${company} team,</p><p>${note}</p><p>CaptureAPI (captureapi.dev) captures any URL as screenshot, PDF, or OG image via REST API. 200 free captures/month, from $9/mo.</p><p>Would this be useful for your workflow?</p><p>Best,<br>Antonio Altomonte<br><a href='https://captureapi.dev'>captureapi.dev</a></p>`
  },
  f1: {
    sender_name: "Antonio - CompliPilot",
    sender_email: "hello@complipilot.dev",
    subject: (company) => `EU AI Act compliance check for ${company} — 200+ automated checks`,
    body: (company, note) => `<p>Hi ${company} team,</p><p>${note}</p><p>CompliPilot (complipilot.dev) runs 200+ automated EU AI Act compliance checks. Deadline: August 2, 2026. From $29/month — 100x less than enterprise tools.</p><p>Free assessment available. Would this help your clients?</p><p>Best,<br>Antonio Altomonte<br><a href='https://complipilot.dev'>complipilot.dev</a></p>`
  },
  f3: {
    sender_name: "Antonio - ChurnGuard",
    sender_email: "hello@paymentrescue.dev",
    subject: (company) => `Recover failed payments for ${company} — automated dunning`,
    body: (company, note) => `<p>Hi ${company} team,</p><p>${note}</p><p>ChurnGuard (paymentrescue.dev) recovers 30-50% of failed Stripe payments automatically with 3-step dunning emails. Setup in 5 minutes via Stripe Connect.</p><p>Free ROI calculator: paymentrescue.dev/calculator</p><p>Best,<br>Antonio Altomonte<br><a href='https://paymentrescue.dev'>paymentrescue.dev</a></p>`
  },
  f4: {
    sender_name: "Antonio - DocuMint",
    sender_email: "hello@parseflow.dev",
    subject: (company) => `PDF to JSON extraction for ${company} — no ML needed`,
    body: (company, note) => `<p>Hi ${company} team,</p><p>${note}</p><p>DocuMint (parseflow.dev) extracts structured JSON from PDF invoices and documents via REST API. No ML training needed. 100 free pages/month.</p><p>Best,<br>Antonio Altomonte<br><a href='https://parseflow.dev'>parseflow.dev</a></p>`
  }
};

// Generate emails from a contact list
function generateEmails(contacts, startDate) {
  const sent = getSentEmails();
  let date = new Date(startDate);
  let count = 0;
  const maxPerDay = 10; // Max 10 emails per day (Brevo limit per domain)
  let dailyCount = 0;

  for (const contact of contacts) {
    if (sent.has(contact.email.toLowerCase())) {
      console.log(`SKIP (already sent): ${contact.email}`);
      continue;
    }

    if (dailyCount >= maxPerDay) {
      date.setDate(date.getDate() + 1);
      dailyCount = 0;
    }

    const dateStr = date.toISOString().split('T')[0];
    const template = templates[contact.business];
    if (!template) {
      console.log(`SKIP (no template for ${contact.business}): ${contact.email}`);
      continue;
    }

    const slug = contact.company.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').substring(0, 30);
    const filename = `${dateStr}_email_${contact.business}-${slug}.json`;
    const filepath = path.join(QUEUE_DIR, filename);

    const emailData = {
      to_email: contact.email,
      to_name: contact.company,
      sender_name: template.sender_name,
      sender_email: template.sender_email,
      subject: template.subject(contact.company),
      html_body: template.body(contact.company, contact.note || '')
    };

    fs.writeFileSync(filepath, JSON.stringify(emailData, null, 2));
    console.log(`CREATED: ${filename}`);
    count++;
    dailyCount++;
  }

  console.log(`\nTotal: ${count} emails created`);
}

// Export for use
module.exports = { generateEmails, templates, getSentEmails };
console.log('Email generator ready. Use generateEmails(contacts, startDate)');
