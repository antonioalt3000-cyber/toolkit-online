'use strict';

// ─── DevToolsmith Outreach Agent ──────────────────────────────────────────────
// Sends one personalised B2B email per day to the next uncontacted prospect.
// Reads/writes prospects.json to track state (committed back by the workflow).
// Runs daily at 09:30 UTC via GitHub Actions. Zero npm dependencies.
//
// Required env vars:  BREVO_API_KEY
// Optional env var:   OUTREACH_DRY_RUN=true

const fs   = require('fs');
const path = require('path');
const { sendAndLog } = require('./brevo');

const PROSPECTS_FILE = path.join(__dirname, 'prospects.json');

// ── Email templates per tool ──────────────────────────────────────────────────
const TEMPLATES = {
  F1: (prospect) => ({
    subject: `Quick question about compliance at ${prospect.company}`,
    sender:  { name: 'CompliPilot', email: 'hello@complipilot.dev' },
    html: `
<div style="font-family:system-ui,sans-serif;max-width:600px;line-height:1.6;color:#1f2937">
  <p>Hi ${prospect.contact === 'Team' || prospect.contact === 'Founders' || prospect.contact === 'Engineering' ? 'team' : prospect.contact},</p>

  <p>I'm Antonio from <a href="https://complipilot.dev" style="color:#3b82f6">CompliPilot</a> —
  an automated compliance scanner for GDPR, HIPAA, CCPA, NIS2, and the EU AI Act.</p>

  <p>I noticed ${prospect.company} ${prospect.angle.toLowerCase().includes('ai') ? 'works with AI systems that fall under the EU AI Act\'s requirements' : 'processes user data that\'s subject to EU privacy regulations'}.
  We built CompliPilot specifically for engineering teams who need compliance insight
  without hiring a full-time DPO.</p>

  <p><strong>What it does in 60 seconds:</strong></p>
  <ul>
    <li>200+ automated checks across GDPR, HIPAA, CCPA, NIS2, EU AI Act</li>
    <li>Scored audit report with specific remediation steps per finding</li>
    <li>Executive PDF export for board/investor reporting</li>
    <li>Ongoing monitoring with email alerts when new issues are detected</li>
  </ul>

  <p>Would a quick scan of ${prospect.company}'s public-facing properties be useful?
  Happy to run it and share the full report — no signup required.</p>

  <p>Best,<br>
  Antonio Altomonte<br>
  <a href="https://complipilot.dev" style="color:#3b82f6">complipilot.dev</a> · DevToolsmith Suite</p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
  <p style="font-size:12px;color:#9ca3af">
    You're receiving this because ${prospect.company} may benefit from automated compliance monitoring.
    To unsubscribe, reply with "unsubscribe".
  </p>
</div>`,
  }),

  F2: (prospect) => ({
    subject: `Accessibility compliance question for ${prospect.company}`,
    sender:  { name: 'AccessiScan', email: 'hello@fixmyweb.dev' },
    html: `
<div style="font-family:system-ui,sans-serif;max-width:600px;line-height:1.6;color:#1f2937">
  <p>Hi ${prospect.contact === 'Team' || prospect.contact === 'Founders' || prospect.contact === 'Dev Team' || prospect.contact === 'Developer Relations' ? 'team' : prospect.contact},</p>

  <p>I'm Antonio from <a href="https://fixmyweb.dev" style="color:#3b82f6">AccessiScan</a> —
  a WCAG 2.2 accessibility scanner that runs 201 automated checks and generates
  a scored compliance report in under 60 seconds.</p>

  <p>The European Accessibility Act took full effect in June 2025,
  meaning EU-facing digital products face fines up to €600,000 for non-compliance.
  Most development teams don't have a clear view of where they stand.</p>

  <p><strong>AccessiScan covers:</strong></p>
  <ul>
    <li>All WCAG 2.2 success criteria (Levels A, AA, AAA)</li>
    <li>Colour contrast, keyboard navigation, ARIA usage, form labels</li>
    <li>Embeddable badge + PDF report for documentation</li>
    <li>Multi-page batch scanning for full-site audits</li>
  </ul>

  <p>${prospect.angle}. I'd be happy to run a free audit of ${prospect.company}
  and share the full results — takes about 60 seconds.</p>

  <p>Worth a look?</p>

  <p>Best,<br>
  Antonio Altomonte<br>
  <a href="https://fixmyweb.dev" style="color:#3b82f6">fixmyweb.dev</a> · DevToolsmith Suite</p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
  <p style="font-size:12px;color:#9ca3af">
    To unsubscribe, reply with "unsubscribe".
  </p>
</div>`,
  }),

  F3: (prospect) => ({
    subject: `Recovering failed payments for ${prospect.company} subscribers`,
    sender:  { name: 'ChurnGuard', email: 'hello@paymentrescue.dev' },
    html: `
<div style="font-family:system-ui,sans-serif;max-width:600px;line-height:1.6;color:#1f2937">
  <p>Hi ${prospect.contact === 'Team' || prospect.contact === 'Partnerships' || prospect.contact === 'Tech Partnerships' || prospect.contact === 'Platform Partnerships' ? 'team' : prospect.contact},</p>

  <p>I'm Antonio from <a href="https://paymentrescue.dev" style="color:#3b82f6">ChurnGuard</a> —
  an automated payment recovery and dunning management system for subscription businesses.</p>

  <p>Industry data puts involuntary churn (failed payments) at 30–40% of all subscription
  cancellations. For a $100K MRR business, that's roughly $3,500–$4,000 disappearing
  every month from cards that expired or got blocked — not because the customer wanted to leave.</p>

  <p><strong>ChurnGuard handles the full recovery loop:</strong></p>
  <ul>
    <li>Intelligent retry scheduling (Day 0 → 3 → 7 → 15)</li>
    <li>Automated email sequences with payment update links</li>
    <li>4 pre-built retention playbooks per customer segment</li>
    <li>HMAC-SHA256 webhooks for Stripe and Paddle integration</li>
    <li>Real-time recovery dashboard showing MRR saved</li>
  </ul>

  <p>${prospect.angle}. Happy to discuss whether an integration would make sense.</p>

  <p>Best,<br>
  Antonio Altomonte<br>
  <a href="https://paymentrescue.dev" style="color:#3b82f6">paymentrescue.dev</a> · DevToolsmith Suite</p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
  <p style="font-size:12px;color:#9ca3af">
    To unsubscribe, reply with "unsubscribe".
  </p>
</div>`,
  }),

  F4: (prospect) => ({
    subject: `AI document extraction API for ${prospect.company}`,
    sender:  { name: 'ParseFlow', email: 'hello@parseflow.dev' },
    html: `
<div style="font-family:system-ui,sans-serif;max-width:600px;line-height:1.6;color:#1f2937">
  <p>Hi ${prospect.contact === 'Team' || prospect.contact === 'Partnerships' || prospect.contact === 'App Marketplace' || prospect.contact === 'Platform Team' || prospect.contact === 'Developer Platform' ? 'team' : prospect.contact},</p>

  <p>I'm Antonio from <a href="https://parseflow.dev" style="color:#3b82f6">ParseFlow</a> —
  an AI-powered document extraction API that turns invoices, receipts, and forms
  into structured JSON. Supports PDF, Word, and Excel with a single endpoint.</p>

  <p>${prospect.angle}. Manual data entry at scale is expensive and error-prone —
  ParseFlow handles variable layouts, multi-language documents,
  and scanned PDFs without any template configuration.</p>

  <p><strong>What the API returns in &lt; 2 seconds:</strong></p>
  <ul>
    <li>Vendor name, invoice number, date, due date</li>
    <li>Full line items with descriptions, quantities, unit prices</li>
    <li>Subtotal, tax breakdown, total in any currency</li>
    <li>Payment terms, PO number, reference codes</li>
  </ul>

  <p>Free tier: 100 documents/month. Would it make sense to test it against
  a sample of ${prospect.company} documents?</p>

  <p>Best,<br>
  Antonio Altomonte<br>
  <a href="https://parseflow.dev" style="color:#3b82f6">parseflow.dev</a> · DevToolsmith Suite</p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
  <p style="font-size:12px;color:#9ca3af">
    To unsubscribe, reply with "unsubscribe".
  </p>
</div>`,
  }),

  B7: (prospect) => ({
    subject: `Screenshot & PDF API for ${prospect.company} workflows`,
    sender:  { name: 'CaptureAPI', email: 'hello@captureapi.dev' },
    html: `
<div style="font-family:system-ui,sans-serif;max-width:600px;line-height:1.6;color:#1f2937">
  <p>Hi ${prospect.contact === 'Team' || prospect.contact === 'Partnerships' || prospect.contact === 'Developer Relations' || prospect.contact === 'Platform Partnerships' || prospect.contact === 'API Team' || prospect.contact === 'App Marketplace' || prospect.contact === 'Marketplace' || prospect.contact === 'Platform' || prospect.contact === 'Community' ? 'team' : prospect.contact},</p>

  <p>I'm Antonio from <a href="https://captureapi.dev" style="color:#3b82f6">CaptureAPI</a> —
  a screenshot and PDF generation API with 200 free captures per month.
  No Puppeteer setup, no server maintenance, no cold starts.</p>

  <p>${prospect.angle}. We built CaptureAPI because running headless Chrome
  in production is a full-time maintenance job — CaptureAPI takes it off your plate
  with a single API call.</p>

  <p><strong>CaptureAPI capabilities:</strong></p>
  <ul>
    <li>Full-page and viewport screenshots (Mobile → 4K presets)</li>
    <li>CSS selector targeting (capture just one component)</li>
    <li>PDF generation from any URL</li>
    <li>Watermark support, custom user agent, cookies</li>
    <li>Batch endpoint + webhook notifications on completion</li>
    <li>99.9% uptime SLA, &lt; 2s median response time</li>
  </ul>

  <p>Would a CaptureAPI integration fit in ${prospect.company}'s workflow?
  Happy to set up a test account and walk through the docs.</p>

  <p>Best,<br>
  Antonio Altomonte<br>
  <a href="https://captureapi.dev" style="color:#3b82f6">captureapi.dev</a> · DevToolsmith Suite</p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
  <p style="font-size:12px;color:#9ca3af">
    To unsubscribe, reply with "unsubscribe".
  </p>
</div>`,
  }),
};

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const dryRun = process.env.OUTREACH_DRY_RUN === 'true';

  console.log('\n[Outreach Agent]');
  console.log('─'.repeat(60));

  // Load prospects
  if (!fs.existsSync(PROSPECTS_FILE)) {
    console.error(`\n❌ prospects.json not found at ${PROSPECTS_FILE}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(PROSPECTS_FILE, 'utf8'));
  const prospects = data.prospects;

  // Find next uncontacted prospect
  const next = prospects.find(p => !p.contacted);

  if (!next) {
    console.log('\n✅ All prospects have been contacted. Add new prospects to prospects.json.');
    process.exit(0);
  }

  // Build email from template
  const templateFn = TEMPLATES[next.tool];
  if (!templateFn) {
    console.error(`\n❌ No email template for tool "${next.tool}" (prospect: ${next.id})`);
    process.exit(1);
  }

  const email = templateFn(next);

  console.log(`  Prospect    : ${next.company} (${next.id})`);
  console.log(`  Email       : ${next.email}`);
  console.log(`  Tool        : ${next.tool}`);
  console.log(`  Angle       : ${next.angle}`);
  console.log(`  Subject     : ${email.subject}`);
  console.log('─'.repeat(60));

  if (dryRun) {
    console.log('\n[DRY RUN] Would send this email. Set OUTREACH_DRY_RUN=false to send.');
    console.log(`\n--- EMAIL PREVIEW ---`);
    console.log(`To:      ${next.email}`);
    console.log(`Subject: ${email.subject}`);
    console.log(`From:    ${email.sender.email}`);
    process.exit(0);
  }

  // Send email
  console.log('\nSending outreach email...');
  const success = await sendAndLog({
    to:          [{ email: next.email, name: next.company }],
    subject:     email.subject,
    htmlContent: email.html,
    sender:      email.sender,
    replyTo:     email.sender.email,
  });

  if (!success) {
    console.error('\n❌ Email delivery failed — prospect NOT marked as contacted');
    process.exit(1);
  }

  // Mark prospect as contacted
  next.contacted      = true;
  next.contacted_date = new Date().toISOString().split('T')[0];
  data._last_updated  = new Date().toISOString().split('T')[0];

  fs.writeFileSync(PROSPECTS_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');

  const remaining = prospects.filter(p => !p.contacted).length;
  console.log(`\n✅ Email sent and prospect marked as contacted`);
  console.log(`   Remaining uncontacted: ${remaining} of ${prospects.length}`);

  process.exit(0);
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(2);
});
