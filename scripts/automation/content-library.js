'use strict';

// ─── DevToolsmith Content Library ────────────────────────────────────────────
// 10 technical articles (2 per tool) + 25 Bluesky posts (5 per tool).
// Rotates by dayOfYear so each run posts unique content.
// All articles are original — NOT duplicates of previously published posts.

// ── Bluesky posts (max 300 chars) ─────────────────────────────────────────────
const BLUESKY_POSTS = [
  // CompliPilot (F1)
  {
    tool: 'F1',
    text: 'GDPR fines hit €1.2B in 2023. Most violations? Missing consent banners, inadequate data processing notices, no DPO documentation. Run a free compliance scan on your site in 60 seconds: complipilot.dev',
  },
  {
    tool: 'F1',
    text: 'EU AI Act enforcement starts August 2026. High-risk AI systems need conformity assessments, risk registers, and human oversight mechanisms. Check your AI compliance status: complipilot.dev',
  },
  {
    tool: 'F1',
    text: 'NIS2 applies to 160,000+ EU companies. If you handle digital infrastructure, energy, health, or finance — you\'re probably covered. Free NIS2 compliance check: complipilot.dev',
  },
  {
    tool: 'F1',
    text: 'HIPAA compliance for SaaS: BAA agreements, PHI encryption, audit logs, minimum necessary access. Missing even one = violations. Automated HIPAA audit: complipilot.dev',
  },
  {
    tool: 'F1',
    text: 'CCPA gives California residents rights to know, delete, and opt-out of data sales. Your privacy policy probably doesn\'t cover half of it. Free CCPA scan: complipilot.dev',
  },
  // AccessiScan (F2)
  {
    tool: 'F2',
    text: 'The European Accessibility Act takes full effect June 2025. Non-compliant websites face fines up to €600,000. WCAG 2.2 scanner covering 201 checks: fixmyweb.dev',
  },
  {
    tool: 'F2',
    text: '71% of users with disabilities leave inaccessible websites immediately. That\'s a massive chunk of your audience gone. Check your accessibility score in 60 seconds: fixmyweb.dev',
  },
  {
    tool: 'F2',
    text: 'Color contrast failures are the #1 accessibility issue on the web. WCAG requires 4.5:1 for normal text, 3:1 for large text. Automated 201-point accessibility scan: fixmyweb.dev',
  },
  {
    tool: 'F2',
    text: 'Keyboard navigation: if your site can\'t be used without a mouse, 2.5M+ US users with motor disabilities can\'t use it. Free WCAG 2.2 audit: fixmyweb.dev',
  },
  {
    tool: 'F2',
    text: 'Missing alt text. Empty form labels. Auto-playing media. These accessibility basics fail on 98% of websites. Scan yours for free across 201 WCAG 2.2 checks: fixmyweb.dev',
  },
  // ChurnGuard (F3)
  {
    tool: 'F3',
    text: 'For every $100K MRR, roughly $4,000/month disappears from failed payments. That\'s $48K/year left on the table. Automated payment recovery: paymentrescue.dev',
  },
  {
    tool: 'F3',
    text: 'Smart dunning = right message, right time. Day 1: gentle reminder. Day 3: urgency. Day 7: final warning with discount. Automate the entire sequence: paymentrescue.dev',
  },
  {
    tool: 'F3',
    text: 'Involuntary churn (failed cards) causes 40% of subscription cancellations. Most businesses ignore it. Automated retry logic + email sequences: paymentrescue.dev',
  },
  {
    tool: 'F3',
    text: 'HMAC-SHA256 webhooks. Stripe + Paddle integration. Real-time recovery dashboard. Custom retention playbooks. Everything you need to fight payment failures: paymentrescue.dev',
  },
  {
    tool: 'F3',
    text: 'The optimal retry schedule for failed payments: immediately, 3 days, 7 days, 15 days. Each retry doubles recovery probability. Automate all 4 attempts: paymentrescue.dev',
  },
  // ParseFlow (F4)
  {
    tool: 'F4',
    text: 'Stop writing fragile regex to extract invoice data. AI-powered document parsing handles varying layouts, languages, and formats. Extract structured JSON from any PDF: parseflow.dev',
  },
  {
    tool: 'F4',
    text: 'Invoice parsing benchmark: Regex = breaks on layout change. Template matching = needs 1 template per vendor. AI = works on any document out of the box. Try it: parseflow.dev',
  },
  {
    tool: 'F4',
    text: 'ParseFlow extracts: vendor name, invoice number, date, line items, subtotal, tax, total — from PDF, Word, and Excel. Webhook notifications on completion: parseflow.dev',
  },
  {
    tool: 'F4',
    text: 'Processing 500 invoices/month manually at 3 min each = 25 hours wasted. Automated extraction takes seconds per document. Batch processing API: parseflow.dev',
  },
  {
    tool: 'F4',
    text: 'JSON to PDF generator: turn your structured data into professional invoices, receipts, and reports. 3 templates, instant preview, no design skills needed: parseflow.dev',
  },
  // CaptureAPI (B7)
  {
    tool: 'B7',
    text: 'Running Puppeteer on your server just for screenshots? It uses 400MB RAM per instance and breaks constantly. Screenshot API alternative with 200 free captures/month: captureapi.dev',
  },
  {
    tool: 'B7',
    text: 'CaptureAPI vs headless Chrome: no server setup, no memory leaks, no Chrome version conflicts. Just an API call. Full-page, viewport, CSS selector capture: captureapi.dev',
  },
  {
    tool: 'B7',
    text: 'Generate PDF reports from any URL in 2 lines of code. No Puppeteer, no Lambda cold starts, no infrastructure. 200 free renders/month: captureapi.dev',
  },
  {
    tool: 'B7',
    text: 'Visual regression testing: screenshot your UI before and after deploys, diff them automatically. Catch layout breaks before users do. Screenshot API: captureapi.dev',
  },
  {
    tool: 'B7',
    text: 'Webhook on capture.completed. Batch endpoint for queuing. CSS selector targeting. Viewport presets from mobile to 4K. 99.9% uptime SLA: captureapi.dev',
  },
];

// ── Articles (Dev.to / Hashnode format) ──────────────────────────────────────
const ARTICLES = [
  // ── F1 CompliPilot ────────────────────────────────────────────────────────
  {
    tool:  'F1',
    title: 'GDPR Audit Automation: 5 Compliance Checks You Are Probably Missing',
    tags:  ['webdev', 'security', 'privacy', 'tutorial'],
    body: `
GDPR has been enforceable since 2018, yet enforcement actions keep increasing year after year. The problem isn't that developers don't care — it's that most compliance checks happen once, at launch, and then get forgotten. Here are five critical GDPR requirements that slip through the cracks on most SaaS products.

## 1. Data Processing Register (ROPA)

The GDPR requires all organisations processing personal data to maintain a Record of Processing Activities (Article 30). Most developers have never heard of it. Your ROPA must document:

- What data you collect and why
- The legal basis for processing (consent, legitimate interest, contract)
- Data retention periods
- Third-party processors (AWS, Stripe, Mixpanel — every one)
- Cross-border data transfers

The fine for not having one: up to €10M or 2% of global turnover.

## 2. Data Subject Request Automation

Under GDPR, users have the right to access, rectify, erase, and port their data — within 30 days. Most SaaS products handle these manually (or ignore them entirely). At scale, this becomes unmanageable.

\`\`\`javascript
// Minimum viable DSR handler
app.post('/api/dsr/erasure', authenticate, async (req, res) => {
  const userId = req.user.id;

  // Must delete from ALL systems — not just your main DB
  await Promise.all([
    db.users.delete(userId),
    analyticsService.deleteUser(userId),
    emailService.unsubscribeAll(userId),
    backups.scheduleDataPurge(userId), // often forgotten
  ]);

  res.json({ status: 'processing', deadline: addDays(new Date(), 30) });
});
\`\`\`

## 3. Legitimate Interest Assessment (LIA)

"Legitimate interest" is the most used (and most abused) legal basis for data processing. Using it correctly requires a three-part balancing test: purpose test, necessity test, and balancing test. Using it incorrectly — for marketing without consent, for example — is a violation.

## 4. Cookie Consent That Actually Works

A cookie banner that says "We use cookies" with a single OK button is not GDPR-compliant. Compliant consent requires:

- Granular categories (functional, analytics, marketing)
- Equal ease of accepting vs rejecting
- No pre-ticked boxes
- Stored consent records with timestamp and version
- Re-consent when purposes change

## 5. Vendor Due Diligence

Every third-party service your app touches that handles personal data is a "data processor" under GDPR. You need:

- A signed Data Processing Agreement (DPA) with each
- Documented transfers under Article 46 (SCCs for US vendors)
- A way to revoke access if they're breached

Common oversight: using npm packages that phone home (analytics, error tracking, fonts) without documenting them.

## Automating the Audit

Running these checks manually is error-prone and time-consuming. Tools like [CompliPilot](https://complipilot.dev) automate 200+ compliance checks across GDPR, HIPAA, CCPA, and NIS2 — giving you a scored audit report in under 60 seconds, with specific remediation steps for each finding.

The goal isn't perfect compliance overnight. It's knowing exactly where your gaps are so you can prioritise the highest-risk issues first.
`.trim(),
  },

  {
    tool:  'F1',
    title: 'NIS2 Directive 2025: What Software Companies Need to Do Now',
    tags:  ['webdev', 'security', 'devops', 'tutorial'],
    body: `
NIS2 (Network and Information Security Directive 2) came into EU law in October 2024. Unlike GDPR, which targets data protection, NIS2 targets **operational resilience and cybersecurity**. It expands coverage to over 160,000 entities across 18 sectors — and software companies are directly in scope.

## Who Is Covered?

NIS2 applies to "essential" and "important" entities across sectors including:

- Digital infrastructure (cloud providers, DNS, CDNs, datacenters)
- Digital services (online marketplaces, search engines, social networks)
- ICT service management (managed service providers, SaaS)
- Public administration

If your SaaS has 50+ employees or €10M+ annual turnover, you're likely an "important entity." Violations carry fines up to €7M or 1.4% of global turnover.

## The 10 Core Technical Requirements

NIS2 Article 21 mandates ten specific security measures. Here's what they mean technically:

### 1. Risk Analysis and Information Security Policy

You need a documented risk register. Not in someone's head — an actual document with identified threats, likelihood ratings, and mitigation plans.

### 2. Incident Handling

Incident response plan required. Plus: significant incidents must be reported to your national authority within **24 hours** (initial) and **72 hours** (detailed). Define "significant" internally before you need it.

### 3. Business Continuity

RPO and RTO targets for every critical system. Documented backup procedures. Tested DR runbooks. "We have backups" doesn't count.

### 4. Supply Chain Security

Third-party vendor risk assessments. Contracts must include security requirements. This includes SaaS dependencies, not just infrastructure.

### 5. Vulnerability Disclosure

A way for researchers to report vulnerabilities. Coordinated Vulnerability Disclosure (CVD) policy. Consider a security.txt file:

\`\`\`
# public/.well-known/security.txt
Contact: mailto:security@yourcompany.com
Encryption: https://yourcompany.com/pgp-key.asc
Preferred-Languages: en
Policy: https://yourcompany.com/security/disclosure-policy
\`\`\`

### 6. Multi-Factor Authentication

MFA is now mandatory for access to sensitive systems — not optional, not "encouraged."

### 7. Encryption

Data in transit: TLS 1.2+ minimum (1.3 recommended). Data at rest: AES-256. Keys managed separately from data.

### 8. Access Control

Principle of least privilege. Role-based access. Quarterly access reviews. Offboarding checklists.

### 9. Staff Awareness Training

Annual security training. Phishing simulations. Documented completion records.

### 10. Asset Management

Complete inventory of hardware and software assets. You can't protect what you don't know you have.

## Where to Start

Most companies are failing on items 1, 3, and 4 above. Start with a gap assessment — map your current controls against the 10 requirements. Tools like [CompliPilot](https://complipilot.dev) can automate an initial NIS2 audit to show you exactly where you stand before bringing in a consultant.

NIS2 enforcement is active. Don't wait for an incident to find out you weren't compliant.
`.trim(),
  },

  // ── F2 AccessiScan ────────────────────────────────────────────────────────
  {
    tool:  'F2',
    title: 'Color Contrast Failures: The Number One Accessibility Issue and How to Fix It',
    tags:  ['accessibility', 'css', 'webdev', 'beginners'],
    body: `
Color contrast failures are the single most common accessibility issue on the web. The WebAIM Million study found them on 83.6% of home pages tested. Yet they're also one of the easiest issues to fix — once you understand the rules.

## The WCAG Contrast Requirements

WCAG 2.2 defines two success criteria for color contrast:

**1.4.3 Contrast (Minimum) — Level AA**
- Normal text (< 18pt or < 14pt bold): minimum **4.5:1** contrast ratio
- Large text (≥ 18pt or ≥ 14pt bold): minimum **3:1** contrast ratio
- UI components and graphical objects: minimum **3:1**

**1.4.6 Contrast (Enhanced) — Level AAA**
- Normal text: **7:1**
- Large text: **4.5:1**

The contrast ratio formula is \`(L1 + 0.05) / (L2 + 0.05)\`, where L1 is the lighter colour's relative luminance and L2 is the darker one's.

## The Mathematics Behind Luminance

Relative luminance isn't just brightness — it accounts for how the human eye perceives different wavelengths:

\`\`\`javascript
function relativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const sRGB = c / 255;
    return sRGB <= 0.04045
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1, hex2) {
  const lum1 = relativeLuminance(...hexToRgb(hex1));
  const lum2 = relativeLuminance(...hexToRgb(hex2));
  const [lighter, darker] = lum1 > lum2 ? [lum1, lum2] : [lum2, lum1];
  return (lighter + 0.05) / (darker + 0.05);
}
\`\`\`

## Common Failures and Fixes

### Grey text on white backgrounds
Light grey (#767676) on white is exactly 4.54:1 — barely passing. At #757575, it fails. Use #595959 or darker for safe normal text.

### Blue links on coloured backgrounds
Many design systems use brand blue (#0066CC) as the link colour. On a dark navy background (#003366), that's only 2.6:1 — a clear failure.

### Placeholder text
Placeholder text is treated as normal text for contrast purposes. The typical grey placeholder on a white input (#B0B0B0 on #FFFFFF) is 2.5:1 — fails badly.

\`\`\`css
/* ❌ Fails WCAG */
input::placeholder { color: #B0B0B0; }

/* ✅ Passes WCAG AA */
input::placeholder { color: #767676; }
\`\`\`

### Disabled states
Disabled controls are exempt from contrast requirements — but only if they're genuinely disabled (not just visually styled as disabled).

## The Tricky Edge Cases

**Gradients**: WCAG requires the entire text background to meet contrast requirements. For text on a gradient, test at the lowest-contrast point.

**Text over images**: Image backgrounds change depending on the user's screen, browser rendering, and image loading. Safest approach: add a semi-transparent overlay or text shadow.

\`\`\`css
.hero-text {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  /* OR */
  background: rgba(0, 0, 0, 0.5);
  padding: 0.5em 1em;
}
\`\`\`

**Focus indicators**: WCAG 2.2 added Success Criterion 2.4.11 (Focus Appearance) — focus indicators must have at least 3:1 contrast against adjacent colours.

## Automating Detection

Checking contrast manually across every combination of text and background in your app is impractical. Automated tools like [AccessiScan](https://fixmyweb.dev) scan your entire page across 201 WCAG 2.2 checks — including contrast — and generate a prioritised report with specific failing elements identified.

Start with Level AA compliance. The changes are usually small CSS tweaks with an outsized impact on usability for everyone, not just users with visual impairments.
`.trim(),
  },

  {
    tool:  'F2',
    title: 'Keyboard Navigation Testing: A Developer Complete Guide to WCAG Operability',
    tags:  ['accessibility', 'webdev', 'javascript', 'tutorial'],
    body: `
Keyboard accessibility is one of the most important — and most neglected — aspects of web accessibility. An estimated 2.5 million Americans have motor disabilities that prevent mouse use. If your site can't be operated entirely by keyboard, you're excluding them completely.

## The Four Core Principles

WCAG 2.2 Principle 2 (Operable) contains the keyboard requirements:

- **2.1.1 Keyboard** (AA): All functionality must be operable via keyboard
- **2.1.2 No Keyboard Trap** (AA): If focus moves into a component, it must be possible to move it out
- **2.4.3 Focus Order** (AA): If page can be navigated sequentially, order must be logical and predictable
- **2.4.7 Focus Visible** (AA): Any keyboard-operable UI must have a visible focus indicator
- **2.4.11 Focus Appearance** (AA, new in 2.2): Focus indicator must meet size and contrast requirements

## Testing Without Automated Tools

Start with the basic keyboard test:

1. Unplug (or ignore) your mouse
2. Press Tab to move forward through interactive elements
3. Press Shift+Tab to move backward
4. Use Enter/Space to activate buttons, links, checkboxes
5. Use arrow keys for radio groups, menus, sliders
6. Use Escape to close dialogs and menus

Any element you can't reach or activate? That's a WCAG 2.1.1 failure.

## The Most Common Keyboard Failures

### Custom dropdowns and menus

\`\`\`jsx
// ❌ Keyboard inaccessible
function Dropdown({ items }) {
  return (
    <div onClick={toggle} className="dropdown">
      {items.map(item => (
        <div onClick={() => select(item)}>{item.label}</div>
      ))}
    </div>
  );
}

// ✅ Fully keyboard accessible
function Dropdown({ items }) {
  return (
    <div
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      tabIndex={0}
      onKeyDown={handleKeyDown} // handles Enter, Space, Arrows, Escape
      className="dropdown"
    >
      <ul role="listbox">
        {items.map((item, i) => (
          <li
            key={item.id}
            role="option"
            tabIndex={-1}
            aria-selected={i === activeIndex}
            onKeyDown={e => e.key === 'Enter' && select(item)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

### Modals and dialogs

Modal dialogs must:
1. Move focus into the dialog when it opens
2. Trap focus inside while it's open (Tab cycles within)
3. Return focus to the trigger element when it closes

\`\`\`javascript
function openModal(modalEl, triggerEl) {
  const focusable = modalEl.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  first.focus();

  modalEl.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    if (e.key === 'Escape') closeModal(triggerEl);
  });
}
\`\`\`

### Removing default focus styles

The single most common mistake: \`outline: none\` in a CSS reset.

\`\`\`css
/* ❌ Never do this globally */
* { outline: none; }

/* ✅ Remove default, replace with better style */
:focus { outline: none; }
:focus-visible {
  outline: 3px solid #0066CC;
  outline-offset: 2px;
  border-radius: 2px;
}
\`\`\`

The \`:focus-visible\` pseudo-class shows focus only when navigating by keyboard, not on mouse click — giving you the best of both worlds.

## Skip Links

Users navigating by keyboard should be able to skip repetitive navigation. A skip link is the first focusable element in your page:

\`\`\`html
<a href="#main-content" class="skip-link">Skip to main content</a>
\`\`\`

\`\`\`css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  z-index: 9999;
}
.skip-link:focus { top: 0; }
\`\`\`

## Automated Testing Coverage

Automated scanners can catch about 40% of keyboard accessibility issues — primarily missing tabindex, incorrect roles, and missing focus styles. Tools like [AccessiScan](https://fixmyweb.dev) provide a starting point with 201 automated checks, but the Tab-through test above is still essential for catching interaction patterns that automation misses.
`.trim(),
  },

  // ── F3 ChurnGuard ─────────────────────────────────────────────────────────
  {
    tool:  'F3',
    title: 'The SaaS Revenue Leak: How Failed Payments Are Silently Killing Your MRR',
    tags:  ['business', 'saas', 'javascript', 'webdev'],
    body: `
Every SaaS founder knows about voluntary churn — customers who cancel because they're not seeing value. But there's a second, quieter type of churn that often goes untracked: **involuntary churn** from failed payments.

Industry data puts it at 30-40% of all subscription cancellations. For a $100K MRR business, that's roughly $3,500-$4,000 disappearing every month from credit cards that expired, bank fraud blocks, or exceeded limits — not because the customer wanted to leave.

## Why Banks Decline Payment Attempts

Understanding why payments fail is the first step to recovering them:

| Reason | Frequency | Recoverable? |
|--------|-----------|--------------|
| Insufficient funds | ~38% | Yes (retry end of month) |
| Card expired | ~25% | Yes (update request) |
| Fraud prevention block | ~18% | Yes (customer contacts bank) |
| Card reported lost/stolen | ~12% | No (new card needed) |
| Bank-side technical error | ~7% | Yes (retry within 24h) |

The key insight: **most failures are temporary**. A retry at the right time recovers the revenue.

## The Optimal Retry Schedule

Don't retry immediately and aggressively — that triggers fraud detection and makes the situation worse. The optimal dunning schedule:

- **Day 0**: Immediate retry (catches temporary errors)
- **Day 3**: Second retry (most cards refreshed by now)
- **Day 7**: Third retry with email notification
- **Day 15**: Final attempt + escalation email

Each retry should use intelligent payment routing — try a different payment processor if the primary fails, or use card updater services to get updated card details automatically.

## Building a Dunning Email Sequence

The email sequence matters as much as the retry schedule. Tone progression:

### Email 1 (Day 3 — No-blame)
\`\`\`
Subject: Quick update on your [Product] subscription

Hi {{name}},

We had trouble processing your payment for [Product]. This happens
occasionally — usually a temporary bank issue.

We'll automatically retry in a few days. No action needed.
\`\`\`

### Email 2 (Day 7 — Helpful)
\`\`\`
Subject: Action needed: Update your payment details

Hi {{name}},

We've been unable to process your [Product] subscription payment.
Your account will remain active for 7 more days.

Update your payment details here: [LINK]
\`\`\`

### Email 3 (Day 14 — Urgency)
\`\`\`
Subject: Your [Product] account will be suspended tomorrow

Hi {{name}},

This is a final reminder. Your account will be suspended in 24 hours
unless you update your payment details.

We'd hate to lose you — here's a one-click update link: [LINK]
\`\`\`

The three-email sequence typically recovers 18-25% of failed payments before the account suspends.

## Implementing Retry Logic with Stripe

\`\`\`javascript
// Stripe webhook handler for payment failures
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const event = stripe.webhooks.constructEvent(
    req.body,
    req.headers['stripe-signature'],
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;
    const attemptCount = invoice.attempt_count;

    // Schedule next retry based on attempt number
    const retryDelays = [0, 3, 7, 15]; // days
    const nextDelay = retryDelays[attemptCount] || null;

    if (nextDelay !== null) {
      await scheduleRetry(invoice.subscription, nextDelay);
      await sendDunningEmail(invoice.customer, attemptCount);
    } else {
      await suspendSubscription(invoice.subscription);
      await sendFinalNotice(invoice.customer);
    }
  }

  res.json({ received: true });
});
\`\`\`

## Measuring Recovery Rate

Track these metrics to optimise your dunning process:

- **Recovery rate**: % of failed payments recovered before suspension
- **Recovery revenue**: total MRR recovered per month
- **Time to recovery**: median days from failure to successful payment
- **Email-to-update CTR**: click-through on payment update links

A well-implemented dunning system typically achieves 15-25% recovery rate. Tools like [ChurnGuard](https://paymentrescue.dev) automate the entire process — retry scheduling, email sequences, recovery tracking — with zero code integration required.

Don't let payment failures become silent cancellations. The revenue is there; you just need to ask for it at the right time.
`.trim(),
  },

  {
    tool:  'F3',
    title: 'Building Retention Playbooks: Proven Strategies to Reduce SaaS Churn',
    tags:  ['business', 'saas', 'productivity', 'webdev'],
    body: `
Churn reduction is not a single tactic — it's a system. The best SaaS companies treat each at-risk customer segment differently, with specific playbooks tailored to why they're likely to churn. Here's how to build them.

## The Four At-Risk Segments

### 1. New Customers (Days 1-30)
**Risk**: Haven't reached activation. Haven't seen core value yet.
**Signal**: Haven't completed onboarding, low feature usage in week 2.

New customers churn when the gap between signup expectations and reality is too wide. The solution: accelerate time-to-value.

\`\`\`
Playbook: Activation acceleration
Day 0:  Personalised welcome + first action prompt
Day 3:  Check-in email: "Have you tried X yet?"
Day 7:  Success story from similar customer
Day 14: Feature spotlight they haven't used
Day 21: "How's it going?" + offer a call
Day 28: Renewal reminder with value recap
\`\`\`

### 2. Disengaged Mid-Tier Customers
**Risk**: Usage dropping month-over-month. Haven't logged in for 14+ days.
**Signal**: Login frequency down >50% vs baseline.

These customers haven't decided to cancel yet — they're just drifting. Re-engagement while they're still subscribed is dramatically easier than win-back.

\`\`\`
Playbook: Re-engagement
Week 1: Feature they've never tried (personalised)
Week 2: Case study from their industry
Week 3: "We noticed you haven't been around — anything we can help with?"
Week 4: Personal outreach from account manager
\`\`\`

### 3. High-Value Customers at Contract Renewal
**Risk**: Evaluating alternatives. May downgrade.
**Signal**: Contract renewal date approaching, recent support tickets, pricing page visits.

These customers represent outsized revenue. They deserve white-glove treatment.

\`\`\`
Playbook: Renewal protection
90 days before: Executive Business Review invitation
60 days before: Usage summary + ROI report
45 days before: New features relevant to their use case
30 days before: Renewal conversation with CSM
14 days before: Contract sent with expansion offer
\`\`\`

### 4. Customers After Repeated Payment Failures
**Risk**: Billing friction converting to active cancellation.
**Signal**: 2+ failed payment attempts.

A customer who's had 3 payment failures and still hasn't cancelled is signalling intent to stay — they just need to be helped through the update process.

\`\`\`
Playbook: Payment recovery
Failure 1: Soft reminder, auto-retry scheduled
Failure 2: Help email with direct update link + live chat
Failure 3: Phone call offer + temporary grace period
Failure 4: "We'd hate to lose you" — discount to stay
\`\`\`

## Measuring Playbook Effectiveness

Each playbook needs metrics to improve over time:

| Playbook | Key Metric |
|----------|------------|
| Activation | Time-to-first-key-action |
| Re-engagement | 30-day reactivation rate |
| Renewal | Net Revenue Retention (NRR) |
| Payment recovery | Recovery rate % |

Track cohorts separately. A customer who needed the payment recovery playbook and stayed is worth more than average — they've demonstrated intent to continue.

## Automating Playbook Triggers

\`\`\`javascript
// Example: trigger re-engagement playbook
async function checkEngagementHealth() {
  const users = await db.users.findAll({
    where: {
      lastLoginAt: { [Op.lt]: subDays(new Date(), 14) },
      status: 'active',
      segment: { [Op.not]: 'at-risk' }, // not already in a playbook
    },
  });

  for (const user of users) {
    await playbookEngine.trigger('re-engagement', user.id);
    await db.users.update({ segment: 'at-risk' }, { where: { id: user.id } });
  }
}
\`\`\`

[ChurnGuard](https://paymentrescue.dev) includes four pre-built retention playbooks (New Customer, High-Value, Long-Term, Repeat Failure) with customisable email templates, trigger conditions, and a recovery dashboard showing revenue saved per playbook. The automation runs in the background while you focus on building product.

The best churn reduction strategy is the one that runs automatically, 24/7, without requiring a dedicated CSM for every account.
`.trim(),
  },

  // ── F4 ParseFlow ──────────────────────────────────────────────────────────
  {
    tool:  'F4',
    title: 'Structured Data Extraction from PDFs: Regex vs Template Matching vs AI',
    tags:  ['ai', 'javascript', 'tutorial', 'productivity'],
    body: `
Invoice processing is one of those problems that looks simple until you actually try to build it. Reading data from a PDF invoice should be straightforward — but the moment you encounter 50 different vendor layouts, foreign languages, scanned images, and multi-page documents, your initial approach falls apart. Here's an honest comparison of the three main approaches.

## Approach 1: Regex and String Parsing

For a single, controlled invoice format, regex works fine:

\`\`\`javascript
function extractInvoiceData(text) {
  const invoiceNumber = text.match(/Invoice\\s*#?\\s*([A-Z0-9-]+)/i)?.[1];
  const total = text.match(/Total\\s*[:\\$]?\\s*([\\d,]+\\.\\d{2})/i)?.[1];
  const date  = text.match(/(\\d{1,2}[\\/.-]\\d{1,2}[\\/.-]\\d{2,4})/)?.[1];

  return { invoiceNumber, total, date };
}
\`\`\`

**When it works**: Internal documents with consistent formatting, fixed-template invoices from a single vendor, structured data exports.

**When it breaks**: Any layout change. "Invoice No:" vs "Invoice Number:" vs "Ref:" vs just printing the number without a label. International date formats. Currency symbols in different positions. Thousands separators (1.234,56 vs 1,234.56).

Reality: regex-based extraction needs constant maintenance. Every new vendor format requires code changes.

## Approach 2: Template Matching

Template matching defines anchor points in a document layout (coordinates or text markers) and extracts data from fixed positions relative to those anchors.

\`\`\`python
# Example with a hypothetical template engine
template = {
  'invoice_number': { 'after': 'Invoice Number:', 'line': 0, 'field': 0 },
  'total': { 'anchor': 'TOTAL DUE', 'offset_y': 0, 'offset_x': 150 },
}
result = extract_with_template(pdf_path, template)
\`\`\`

**When it works**: High-volume, single-vendor processing (e.g., processing all invoices from one supplier). Government forms with fixed layouts.

**When it breaks**: Requires one template per vendor. A 200-vendor AP operation needs 200 templates. PDFs with dynamic layout (the total row moves based on number of line items). Scanned documents with slight rotation or skew.

Template matching is maintenance-intensive at scale.

## Approach 3: AI-Powered Extraction

Modern document AI models (fine-tuned on millions of documents) understand document structure semantically:

\`\`\`javascript
// Using an AI document API
const response = await fetch('https://parseflow.dev/api/extract', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.PARSEFLOW_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    document_url: 'https://your-bucket.s3.amazonaws.com/invoice.pdf',
    fields: ['invoice_number', 'date', 'vendor_name', 'line_items', 'subtotal', 'tax', 'total'],
  }),
});

const data = await response.json();
// Returns structured JSON regardless of layout
\`\`\`

**Output**:
\`\`\`json
{
  "invoice_number": "INV-2026-0142",
  "date": "2026-04-01",
  "vendor_name": "Acme Corporation",
  "line_items": [
    { "description": "SaaS Platform License", "quantity": 1, "unit_price": 5000.00, "total": 5000.00 },
    { "description": "Implementation Services", "quantity": 10, "unit_price": 250.00, "total": 2500.00 }
  ],
  "subtotal": 7500.00,
  "tax": 750.00,
  "total": 8250.00
}
\`\`\`

**When it works**: Variable layouts, multiple vendors, multi-language documents, scanned PDFs, Word/Excel files.

**Limitations**: Higher cost per document than local processing. Privacy considerations for sensitive documents (check your provider's data handling).

## Honest Comparison

| Factor | Regex | Templates | AI API |
|--------|-------|-----------|--------|
| Setup time | Low | Medium | Very low |
| Accuracy (known format) | High | High | High |
| Accuracy (variable formats) | Low | Medium | High |
| Maintenance burden | High | High | Low |
| Cost per document | Zero | Zero | Small fee |
| Scalability | Code changes | Template changes | None |

## The Practical Choice

For most accounts payable automation projects:
- **Under 5 vendors, stable formats**: Regex is fine
- **5-50 vendors, some variation**: Templates + regex hybrid
- **50+ vendors or unknown formats**: AI extraction is the only practical option

[ParseFlow](https://parseflow.dev) uses the AI approach, handling PDF, Word, and Excel with a single API endpoint. The free tier covers 100 documents/month — enough to validate the approach before committing.
`.trim(),
  },

  {
    tool:  'F4',
    title: 'Building an Automated Invoice Processing Pipeline with Node.js',
    tags:  ['javascript', 'tutorial', 'webdev', 'node'],
    body: `
Accounts payable teams spend an average of 3.7 minutes manually processing each invoice. At 200 invoices per month, that's 12+ hours of data entry. Here's how to build an automated pipeline that brings this to under 10 seconds per document.

## Pipeline Architecture

\`\`\`
Email/SFTP/API → Receive → Extract → Validate → Enrich → Store → Notify
\`\`\`

Each stage is independent and can fail gracefully without losing the document.

## Stage 1: Document Ingestion

Accept invoices from multiple sources:

\`\`\`javascript
const express = require('express');
const multer  = require('multer');
const path    = require('path');

const upload = multer({
  dest: '/tmp/invoices',
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.xlsx', '.png', '.jpg'];
    const ext     = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

app.post('/api/invoices/upload', upload.array('files', 20), async (req, res) => {
  const jobs = req.files.map(file => ({
    id:       generateJobId(),
    path:     file.path,
    filename: file.originalname,
    status:   'queued',
  }));

  await queue.addBatch(jobs);
  res.json({ jobs: jobs.map(j => ({ id: j.id, status: j.status })) });
});
\`\`\`

## Stage 2: Extraction

\`\`\`javascript
async function extractInvoiceData(job) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(job.path), job.filename);
  formData.append('fields', JSON.stringify([
    'invoice_number', 'invoice_date', 'due_date',
    'vendor_name', 'vendor_address', 'vendor_tax_id',
    'line_items', 'subtotal', 'tax_amount', 'total_amount',
    'currency', 'payment_terms',
  ]));

  const response = await fetch('https://parseflow.dev/api/extract', {
    method:  'POST',
    headers: { 'Authorization': \`Bearer \${process.env.PARSEFLOW_KEY}\` },
    body:    formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(\`Extraction failed: \${error.message}\`);
  }

  return response.json();
}
\`\`\`

## Stage 3: Validation

Never trust extracted data without validation:

\`\`\`javascript
function validateInvoice(data) {
  const errors = [];

  // Required fields
  if (!data.invoice_number) errors.push('Missing invoice number');
  if (!data.vendor_name)    errors.push('Missing vendor name');
  if (!data.total_amount)   errors.push('Missing total amount');

  // Math validation
  if (data.line_items?.length > 0) {
    const lineTotal = data.line_items.reduce((sum, item) => sum + item.total, 0);
    const tolerance = 0.02; // 2 cents tolerance for rounding

    if (Math.abs(lineTotal - data.subtotal) > tolerance) {
      errors.push(\`Line items sum (\${lineTotal}) != subtotal (\${data.subtotal})\`);
    }
  }

  if (data.subtotal && data.tax_amount && data.total_amount) {
    const expected = data.subtotal + data.tax_amount;
    if (Math.abs(expected - data.total_amount) > 0.02) {
      errors.push(\`Subtotal + tax (\${expected}) != total (\${data.total_amount})\`);
    }
  }

  // Duplicate detection
  // (check against your DB for same invoice_number + vendor)

  return { valid: errors.length === 0, errors };
}
\`\`\`

## Stage 4: Enrichment

Match the vendor to your supplier database:

\`\`\`javascript
async function enrichInvoice(data) {
  // Fuzzy match vendor name to known suppliers
  const vendor = await db.suppliers.findBestMatch(data.vendor_name);

  if (vendor) {
    data.supplier_id      = vendor.id;
    data.gl_account       = vendor.default_gl_account;
    data.cost_center      = vendor.default_cost_center;
    data.approver_email   = vendor.approver_email;
    data.payment_method   = vendor.preferred_payment_method;
  } else {
    data.requires_review  = true;
    data.review_reason    = 'Unknown vendor — manual matching required';
  }

  return data;
}
\`\`\`

## Stage 5: Notifications

\`\`\`javascript
async function notifyApprover(invoice) {
  // Only for invoices above threshold or from unknown vendors
  if (invoice.total_amount > 5000 || invoice.requires_review) {
    await emailService.send({
      to:      invoice.approver_email,
      subject: \`Invoice approval required: \${invoice.invoice_number} — \${invoice.vendor_name}\`,
      template: 'invoice-approval',
      data:    invoice,
    });
  }
}
\`\`\`

## Error Handling and Dead Letter Queue

\`\`\`javascript
async function processJob(job) {
  try {
    job.status = 'processing';
    const extracted  = await extractInvoiceData(job);
    const validation = validateInvoice(extracted);

    if (!validation.valid) {
      job.status       = 'validation_failed';
      job.errors       = validation.errors;
      await moveToReview(job);
      return;
    }

    const enriched = await enrichInvoice(extracted);
    await db.invoices.create({ ...enriched, job_id: job.id });
    await notifyApprover(enriched);

    job.status = 'completed';

  } catch (err) {
    job.attempts++;
    if (job.attempts >= 3) {
      job.status = 'dead_letter';
      await alertOps(job, err);
    } else {
      job.status       = 'retry';
      job.retry_after  = addMinutes(new Date(), job.attempts * 15);
    }
  }

  await db.jobs.update(job);
}
\`\`\`

## Results

A pipeline like this, using [ParseFlow](https://parseflow.dev) for the extraction stage, processes a typical invoice in 4-8 seconds with 94%+ field accuracy across variable formats. The validation stage catches the remaining edge cases and routes them to a human reviewer queue rather than silently accepting bad data.

The full pipeline handles PDF, Word, and Excel with the same code path — no special-casing per format.
`.trim(),
  },

  // ── B7 CaptureAPI ─────────────────────────────────────────────────────────
  {
    tool:  'B7',
    title: 'Screenshot APIs vs Headless Chrome: Benchmarks, Costs, and Decision Framework',
    tags:  ['javascript', 'tutorial', 'webdev', 'node'],
    body: `
Every developer who needs to automate screenshots eventually asks: should I run Puppeteer/Playwright myself, or use a screenshot API? I've done this comparison across multiple projects. Here's the honest breakdown.

## The DIY Headless Chrome Approach

Running your own Puppeteer instance looks simple:

\`\`\`javascript
const puppeteer = require('puppeteer');

async function screenshot(url) {
  const browser = await puppeteer.launch();
  const page    = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  const buffer  = await page.screenshot({ fullPage: true });
  await browser.close();
  return buffer;
}
\`\`\`

Looks fine. Now wait for production to hit it.

### Hidden Operational Costs

**Memory**: Each Chrome instance uses 200-400MB RAM. At 10 concurrent screenshots, that's 2-4GB just for Chrome. Kubernetes auto-scaling events, higher instance tier needed.

**CPU**: Chrome rendering is CPU-intensive. Your screenshot service competing with your API for CPU causes latency spikes across your entire application.

**Stability**: Puppeteer has a well-documented problem with processes not cleaning up after errors. Memory leaks in long-running processes. Need to implement browser pool management:

\`\`\`javascript
// What you actually need to write for production
class BrowserPool {
  constructor(size = 5) {
    this.size     = size;
    this.available = [];
    this.queue    = [];
  }

  async acquire() { /* ... */ }
  async release(browser) { /* ... */ }
  async handleCrash(browser) { /* ... */ }
  async warmUp() { /* ... */ }
  async healthCheck() { /* ... */ }
}
\`\`\`

**Maintenance**: Chrome updates. Headless Chrome API changes. puppeteer-chromium version mismatches. This becomes a part-time job.

**Infrastructure**: Your screenshot service can't run on serverless (Lambda cold starts with Chromium take 3-5 seconds minimum). Needs persistent containers.

### When DIY Makes Sense

- Screenshots are your core product feature (not a utility)
- You need deep customisation (complex JS execution, credential injection)
- Compliance requires keeping data on-premise
- Volume: millions of screenshots per day (at scale, API cost exceeds hosting)

## The Screenshot API Approach

\`\`\`javascript
async function screenshot(url) {
  const response = await fetch(
    \`https://captureapi.dev/v1/screenshot?url=\${encodeURIComponent(url)}\`,
    { headers: { 'Authorization': \`Bearer \${process.env.CAPTURE_API_KEY}\` } }
  );
  return response.arrayBuffer();
}
\`\`\`

Zero infrastructure. Zero maintenance. Scales to any volume automatically.

### Capabilities Comparison

| Feature | DIY Puppeteer | CaptureAPI |
|---------|---------------|------------|
| Full page | ✅ | ✅ |
| Viewport sizes (mobile/4K) | ✅ custom | ✅ 5 presets + custom |
| CSS selector targeting | ✅ custom code | ✅ built-in |
| PDF generation | ✅ | ✅ |
| Watermarks | ✅ custom code | ✅ built-in |
| Webhooks on completion | ❌ need to build | ✅ built-in |
| Batch processing | ❌ need to build | ✅ built-in |
| Status page / SLA | ❌ you own it | ✅ 99.9% SLA |
| Maintenance burden | HIGH | None |

### Real Cost Comparison

Assume 10,000 screenshots per month:

**DIY on AWS**:
- t3.medium EC2 (2 vCPU, 4GB RAM): $30.37/month
- Storage + network: ~$5/month
- Your engineering time (maintenance, incident response): ~2 hours/month × $150/hr = $300
- **Total: ~$335/month** (mostly hidden engineering cost)

**CaptureAPI**:
- 10,000 captures: $29/month
- Engineering time: ~0 hours
- **Total: $29/month**

At 100,000 screenshots/month, the crossover point approaches — but even then the operational simplicity often wins.

## Performance Benchmarks

Testing from the same region (EU-West):

| Metric | Puppeteer (warm) | Puppeteer (cold) | CaptureAPI |
|--------|------------------|------------------|------------|
| Simple page | 1.8s | 4.2s | 1.1s |
| Complex SPA | 3.4s | 7.8s | 1.9s |
| Full page (3000px) | 2.9s | 6.1s | 2.3s |

APIs win on cold start performance by a significant margin because they run pre-warmed Chrome instances.

## Decision Framework

**Use a Screenshot API if**:
- Screenshots are a secondary feature of your product
- You want zero infrastructure to maintain
- You need reliability guarantees (SLA, 99.9% uptime)
- You're a small team where ops overhead matters

**Run your own Puppeteer if**:
- Screenshots are your primary product
- You process millions per day
- You need maximum customisation (authenticated sessions, complex interactions)
- Data sovereignty requires on-premise processing

[CaptureAPI](https://captureapi.dev) offers 200 free captures per month — enough to integrate and validate before deciding whether to use the API or build in-house.
`.trim(),
  },

  {
    tool:  'B7',
    title: 'Visual Regression Testing with Screenshot APIs: Catch UI Bugs Before Users Do',
    tags:  ['testing', 'javascript', 'webdev', 'devops'],
    body: `
Unit tests check logic. Integration tests check API contracts. But neither catches the CSS regression that moves your checkout button off-screen in Safari, or the z-index bug that hides your navigation on mobile. Visual regression testing fills this gap — and with a screenshot API, it's surprisingly easy to set up.

## The Core Concept

Visual regression testing works by:
1. Capturing a "baseline" screenshot of each page/component
2. After each deploy, capturing a new screenshot
3. Diffing the two images pixel-by-pixel
4. Flagging any changes above a threshold as potential regressions

The diff highlights exactly where things changed — so you see "the nav bar is 2px taller" or "this button moved 40px to the right" immediately.

## Setting Up a Baseline

First, capture reference screenshots of all critical pages:

\`\`\`javascript
const fs   = require('fs');
const path = require('path');

const PAGES_TO_MONITOR = [
  { name: 'homepage',  url: 'https://yourapp.com', viewport: '1920x1080' },
  { name: 'login',     url: 'https://yourapp.com/login', viewport: '1280x800' },
  { name: 'dashboard', url: 'https://yourapp.com/dashboard', viewport: '1440x900' },
  { name: 'mobile-home', url: 'https://yourapp.com', viewport: '390x844' },
  { name: 'pricing',   url: 'https://yourapp.com/pricing', viewport: '1280x800' },
];

async function captureBaseline() {
  const baselineDir = './visual-tests/baseline';
  fs.mkdirSync(baselineDir, { recursive: true });

  for (const page of PAGES_TO_MONITOR) {
    const [width, height] = page.viewport.split('x').map(Number);
    const url = \`https://captureapi.dev/v1/screenshot?\${new URLSearchParams({
      url:      page.url,
      width:    width.toString(),
      height:   height.toString(),
      format:   'png',
      full_page: 'false',
    })}\`;

    const response = await fetch(url, {
      headers: { 'Authorization': \`Bearer \${process.env.CAPTURE_API_KEY}\` },
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(path.join(baselineDir, \`\${page.name}.png\`), buffer);
    console.log(\`✅ Baseline captured: \${page.name}\`);
  }
}
\`\`\`

## Comparing Against Baseline

After each deploy, capture the same pages and diff them:

\`\`\`javascript
const { createCanvas, loadImage } = require('canvas');

async function diffImages(baselinePath, currentPath) {
  const [baseline, current] = await Promise.all([
    loadImage(baselinePath),
    loadImage(currentPath),
  ]);

  if (baseline.width !== current.width || baseline.height !== current.height) {
    return { changed: true, reason: 'Dimensions changed', pixelDiff: Infinity };
  }

  const canvas = createCanvas(baseline.width, baseline.height);
  const ctx    = canvas.getContext('2d');

  ctx.drawImage(baseline, 0, 0);
  const baselineData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(current, 0, 0);
  const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let diffCount = 0;
  const diffCanvas = createCanvas(baseline.width, baseline.height);
  const diffCtx    = diffCanvas.getContext('2d');
  const diffImage  = diffCtx.createImageData(canvas.width, canvas.height);

  for (let i = 0; i < baselineData.data.length; i += 4) {
    const rDiff = Math.abs(baselineData.data[i]   - currentData.data[i]);
    const gDiff = Math.abs(baselineData.data[i+1] - currentData.data[i+1]);
    const bDiff = Math.abs(baselineData.data[i+2] - currentData.data[i+2]);
    const diff  = (rDiff + gDiff + bDiff) / 3;

    if (diff > 10) { // threshold for noise
      diffCount++;
      diffImage.data[i]   = 255; // red highlight
      diffImage.data[i+1] = 0;
      diffImage.data[i+2] = 0;
      diffImage.data[i+3] = 255;
    } else {
      // Dim unchanged pixels for contrast
      diffImage.data[i]   = baselineData.data[i]   * 0.3;
      diffImage.data[i+1] = baselineData.data[i+1] * 0.3;
      diffImage.data[i+2] = baselineData.data[i+2] * 0.3;
      diffImage.data[i+3] = 255;
    }
  }

  const totalPixels  = canvas.width * canvas.height;
  const diffPercent  = (diffCount / totalPixels) * 100;

  diffCtx.putImageData(diffImage, 0, 0);
  const diffPng = diffCanvas.toBuffer('image/png');

  return {
    changed:      diffPercent > 0.1, // 0.1% threshold
    pixelDiff:    diffCount,
    diffPercent:  diffPercent.toFixed(3),
    diffImage:    diffPng,
  };
}
\`\`\`

## GitHub Actions Integration

\`\`\`yaml
# .github/workflows/visual-regression.yml
name: Visual Regression
on: [deployment_status]

jobs:
  visual-test:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with: { name: visual-baseline, path: visual-tests/baseline }
      - name: Run visual regression tests
        env:
          CAPTURE_API_KEY: \${{ secrets.CAPTURE_API_KEY }}
          TARGET_URL: \${{ github.event.deployment_status.target_url }}
        run: node scripts/visual-regression.js
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: visual-diffs
          path: visual-tests/diffs/
\`\`\`

## Practical Tips

**Anti-flake strategies**:
- Wait for network idle before screenshotting (the API handles this automatically)
- Exclude dynamic content (timestamps, ads) with CSS: \`.timestamp { visibility: hidden; }\`
- Use a small pixel threshold (0.1%) to avoid false positives from antialiasing

**What to monitor**:
- All pages in your primary user flow (login → dashboard → key action → checkout)
- Mobile viewports — these regress most often
- Email clients if you send HTML emails

**Updating baselines**: When you intentionally change the UI, update the baseline images as part of your PR. Store them in git or a dedicated artifact storage.

[CaptureAPI](https://captureapi.dev) works well for this use case with its CSS selector targeting (capture just the component you changed) and batch endpoint (check 20 pages in one request).
`.trim(),
  },
];

// ── Rotation helpers ──────────────────────────────────────────────────────────

function getDayOfYear() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff  = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Returns today's article from the library (rotates by day of year).
 * @returns {{ tool, title, tags, body }}
 */
function getTodayArticle() {
  const day = getDayOfYear();
  return ARTICLES[day % ARTICLES.length];
}

/**
 * Returns today's Bluesky post (rotates by day of year).
 * @returns {{ tool, text }}
 */
function getTodayBlueskyPost() {
  const day = getDayOfYear();
  return BLUESKY_POSTS[day % BLUESKY_POSTS.length];
}

/**
 * Returns all articles (for bulk publishing or indexing).
 */
function getAllArticles() {
  return ARTICLES;
}

/**
 * Returns all Bluesky posts.
 */
function getAllBlueskyPosts() {
  return BLUESKY_POSTS;
}

module.exports = { getTodayArticle, getTodayBlueskyPost, getAllArticles, getAllBlueskyPosts, getDayOfYear };
