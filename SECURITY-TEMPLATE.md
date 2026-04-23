# Security Policy

> **Status**: active | **Last reviewed**: 2026-04-23

## Reporting a vulnerability

If you discover a security vulnerability, please **do NOT open a public GitHub issue**.
Instead, email: **security@devtoolsmith.com** (monitored by the founder, acknowledged within 72h).

Include:
- Affected endpoint / file path
- Proof of concept (curl, screenshot, or code)
- Your contact info (for coordinated disclosure)

We commit to:
- Acknowledge the report within 72 hours
- Provide a remediation timeline within 7 days
- Credit you in the fix announcement (unless you prefer anonymity)

## Supported versions

Only the `master` branch (live on production domain) is supported.
Older commits or preview branches receive no security updates.

## Breach Response Playbook (GDPR Art. 33/34)

**Scope**: any unauthorized access, disclosure, alteration, or destruction of customer personal data (emails, API keys, subscription info, processed documents, session tokens).

### Phase 1 — Detection (0-1h from alert)

**Triggers**:
- Monitoring alert (UptimeRobot, Sentry, Axiom, Discord webhook) indicating mass 5xx errors, unexpected data exfiltration patterns, or security control bypass
- Customer report via security@devtoolsmith.com
- Automated alert from Stripe (anomalous charges), Upstash (unusual query volume), Vercel (function abuse)
- GitHub Dependabot / CodeQL / Socket.dev flagging an exploited CVE

**Immediate actions**:
1. Acknowledge the alert. Start the incident log (timestamp, observed symptoms, triggering source).
2. Rotate credentials if compromise suspected: Upstash Redis tokens, Stripe restricted keys, Brevo API key, `ADMIN_API_SECRET`.
3. If database compromise: use Vercel Instant Rollback to revert the last deploy while investigating.
4. Notify the founder (antonio.alt3000@gmail.com) via Discord `#alerts-critical` + SMS if available.

### Phase 2 — Containment (1-6h)

- Isolate the affected surface: disable the endpoint via a feature flag or deploy a hotfix that returns 503 on the compromised route.
- Preserve evidence: export Vercel function logs, Upstash analytics, Stripe event log for the last 72h.
- Identify affected data categories (emails, API keys, documents, session tokens).
- Estimate the blast radius: how many users, which countries (for GDPR DPA notification choice).

### Phase 3 — Assessment (within 24h)

Decide: is this a **personal-data breach** under GDPR Art. 4(12)?
- YES → Art. 33 (DPA notification) + Art. 34 (user notification if "high risk") may apply.
- NO (e.g., only internal system data leaked, no PII) → document and close.

Risk analysis factors:
- Type and sensitivity of data exposed (special category = higher risk)
- Ease of identification (hashed vs plaintext)
- Volume (one record vs full DB)
- Likelihood of exploitation
- Severity of impact (financial fraud, identity theft, reputation damage)

### Phase 4 — Notification (within 72h from awareness)

**If personal data exposed AND risk to individuals' rights**:
- **Notify DPA** within 72h:
  - Italy: Garante per la protezione dei dati personali — https://www.garanteprivacy.it/web/guest/home/docweb/-/docweb-display/docweb/9782752
  - Spain: AEPD — https://www.aepd.es/canalprioritario
  - Include: nature of breach, categories+approximate number of users, likely consequences, measures taken
- **Notify affected users** if "high risk" (Art. 34):
  - Clear plain-language email via Brevo (not transactional — dedicated breach notification)
  - Describe: what happened, what data, what they should do (change password, monitor accounts, etc.), how to contact us

### Phase 5 — Remediation (within 30 days)

- Root cause analysis (RCA) document stored in `shared-memory/incident-<YYYY-MM-DD>.md`
- Fix deployed (hotfix + regression tests)
- Update `known-issues.md` with detection signature
- Update monitoring (add alert rule if this was missed)
- Post-mortem shared with advisor / legal (if EU fine risk)

## Cryptographic standards (in use as of 2026-04-23)

- **TLS**: 1.2+ (HTTPS enforced via Vercel, HSTS max-age 63072000 with preload)
- **Password hashing**: bcryptjs cost 12 (migration from SHA-256 completed 2026-04-23)
- **API keys**: SHA-256 hash at rest in Upstash Redis, raw key returned once at creation
- **Session tokens**: 256-bit random (`crypto.randomBytes(32)`), stored hashed server-side
- **Webhook signatures**: Stripe official `constructEvent` verification
- **Secret comparison**: `crypto.timingSafeEqual()` for admin secrets

## Sub-processors

See each SaaS' `/privacy` page for the full, current list. Core processors:

- Vercel Inc. (hosting, EU region `fra1`) — https://vercel.com/legal/privacy-policy
- Upstash (Redis, EU region) — https://upstash.com/trust/privacy.pdf
- Stripe Payments Europe (payment processing) — https://stripe.com/privacy
- Brevo (transactional email) — https://www.brevo.com/en/legal/privacypolicy/
- GitHub (source code, EU developer account) — https://github.com/privacy

## Security headers enforced in production

- Content-Security-Policy (nonce/self + vetted CDNs)
- Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: restrictive

## Credentials rotation schedule

- Upstash Redis tokens: quarterly
- Stripe restricted keys: quarterly + on team change
- `ADMIN_API_SECRET`: quarterly
- Brevo API key: bi-annually + on suspected leak
- Vercel API tokens: annually

## Known limitations

- `unsafe-inline` in CSP script-src (required for GTM) — partial mitigation only
- SameSite=Lax cookies (not Strict) — required for email-linked flows; mitigated by short TTL + Redis session revocation on logout
- DNS rebinding SSRF protection not yet implemented for URL-fetching endpoints (planned)
