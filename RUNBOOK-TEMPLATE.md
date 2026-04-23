# Operations Runbook

> **Scope**: incident response and day-2 operations for this SaaS on Vercel + Upstash + Stripe.
> **Owner**: founder (antonio.alt3000@gmail.com) | **Updated**: 2026-04-23

## Alerts and response

### 🔴 Site down (HTTP 5xx homepage)

**Source**: UptimeRobot/Better Stack Discord alert, Vercel email, customer ticket.

1. Visit `https://<domain>/api/health` — inspect `status`, `checks.redis.status`.
2. If `redis.status === "down"`:
   - Check https://status.upstash.com
   - Check Upstash console → the database → metrics (throttling?)
   - If throttled: temporarily increase limits (free tier has bursty concurrency)
3. If `status === "ok"` but home 5xx: check Vercel dashboard → Runtime logs for the failing function
4. If deploy-related: use **Vercel Instant Rollback** to revert to the last known-good deployment (Dashboard → Deployments → `...` → Promote to Production)
5. Post in Discord `#alerts-critical` with the RCA once stable.

### 🔴 Stripe webhook 5xx loop (applies to F3/F4/B7)

**Source**: Stripe Dashboard `Events` shows many failed deliveries.

1. Check Vercel logs for `/api/webhooks/stripe` (or `/api/webhook` for B7).
2. Verify `STRIPE_WEBHOOK_SECRET` env var matches the endpoint's signing secret in Stripe Dashboard.
3. If signature errors: rotate the webhook secret in Stripe, update Vercel env var, redeploy.
4. If processing errors: check Redis. Webhook idempotency key is `webhook:processed:{event.id}` (7d TTL).
5. Stripe auto-retries 3 days. Fix + let Stripe retry, don't manually replay unless critical.

### 🔴 Rate limit spike (fail-closed 429s from many users)

**Source**: Sentry `HTTP 429` spike, customer complaints.

1. Verify Redis is up (`/api/health`). A Redis outage now fails rate-limit CLOSED → legitimate users get blocked.
2. If Redis healthy but 429 spike: likely real abuse. Check Vercel logs for the attacker pattern (IP, email, user agent).
3. Temporary mitigation: add the attacker email to a block list in `lib/rate-limit.ts` or rotate public tokens.
4. Consider enabling Cloudflare WAF rules if attack persists.

### 🟡 Slow response time (>3s homepage)

1. Check Vercel Speed Insights for RUM.
2. Check Vercel region — should be `fra1` (set in `vercel.json`).
3. Check cold start frequency — consider moving to edge runtime where possible, or ping the function periodically with UptimeRobot.

### 🟡 Dependabot / CodeQL alert (CVE)

1. Read the advisory: severity, attack vector, exploit maturity.
2. If patch available and non-breaking (`npm audit fix`): apply on branch `deps/cve-fix`, test, merge.
3. If breaking: open tracked issue with migration plan.
4. For `ReDoS` / supply-chain trojan: treat as CRITICAL — apply even if breaking.

### 🟡 Cron missed (`/api/cron/dunning` F3 only)

1. Check Vercel Cron history in dashboard → Settings → Crons.
2. If multiple misses: check `maxDuration` in the route — should be 60s.
3. If execution timed out: reduce work per cron run (pagination).

### 🟡 Suspected credential leak

1. Treat as breach — follow `SECURITY.md` Breach Response Playbook Phase 1.
2. Rotate immediately: Stripe restricted key (via Stripe Dashboard), Upstash tokens (via Upstash console), Brevo key, `ADMIN_API_SECRET`.
3. Update Vercel env vars (Production + Preview).
4. Force redeploy to pick up new secrets.

## Day-2 operations

### Deploy a fix
1. Branch `fix/<short-name>` from master.
2. Run `npm run lint && npm run build` locally — must pass.
3. Push branch → Vercel Preview auto-deploys.
4. Smoke test Preview URL.
5. Open PR → self-review → merge to master → Vercel Production auto-deploys.
6. Verify `/api/health` green within 2 minutes.

### Rotate `ADMIN_API_SECRET`
1. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` → copy output.
2. Vercel → Settings → Env Vars → update `ADMIN_API_SECRET` (Production + Preview).
3. Redeploy master.
4. Update your admin tooling with the new secret.

### Scale Redis (when out of Upstash free tier)
- Free tier: 10k commands/day, 256MB.
- Monitor via Upstash dashboard → Usage.
- Upgrade to paid tier (pay-as-you-go, ~$0.20 per 100k commands) only when primary SaaS has recurring revenue.

### Scale Vercel (bandwidth / function exec)
- Hobby free: 100GB bandwidth, 100h function GB-sec.
- Vercel Pro already active (see `portfolio-config.md`) → 1TB bandwidth, 1000h function.
- Monitor via Vercel dashboard → Usage. Alert at 80%.

## Contacts

- **Founder**: antonio.alt3000@gmail.com (primary)
- **Vercel support**: https://vercel.com/support (Pro plan entitled to priority)
- **Stripe support**: https://support.stripe.com (live chat for account issues)
- **Upstash support**: support@upstash.com (email, 48h response free tier)
- **Brevo support**: https://www.brevo.com/contact/ (email)

## Useful commands

```bash
# Health check
curl -s https://<domain>/api/health | jq

# Log tail (Vercel CLI required)
vercel logs <deployment-url> --follow

# Rollback to previous deployment
# Via Vercel Dashboard → Deployments → pick previous READY → Promote to Production

# Rotate secrets + redeploy
vercel env rm ADMIN_API_SECRET production
vercel env add ADMIN_API_SECRET production < /dev/stdin  # paste new secret
vercel --prod  # redeploy
```
