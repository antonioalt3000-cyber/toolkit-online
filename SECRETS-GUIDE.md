# DevToolsmith Automation — GitHub Secrets Setup Guide

> **One-time setup.** Once configured, everything runs with PC off, 24/7.
> Estimated time: **10 minutes**.

---

## Where to Add Secrets

**URL:**
```
https://github.com/antonioalt3000-cyber/toolkit-online/settings/secrets/actions
```

Click **"New repository secret"** for each entry below.

---

## Required Secrets (system won't work without these)

### 1. `BREVO_API_KEY`
Used by: uptime alerts, outreach emails, daily report, weekly quality report.

Find it at: **app.brevo.com → My Account (top right) → SMTP & API → API Keys**
The key name is: `DevToolsmith-API`

> Key stored locally in: `memory/brevo-smtp-credentials.md`

### 2. `DEVTO_API_KEY`
Used by: `daily-automation.yml` → publish-devto job.

Get it here: https://dev.to/settings/extensions → "DEV Community API Keys" → Generate

> ⚠️ The key regenerated on 1 April 2026 is the current one (stored in `.env.agent`).
> If it has expired: go to dev.to/settings/extensions and regenerate.

### 3. `HASHNODE_API_KEY`
Used by: `daily-automation.yml` → publish-hashnode job.

```
4df35ca0-83d0-48c0-88fc-6be573f848dd
```

Get/regenerate: https://hashnode.com/settings/developer → "Personal Access Tokens"

### 4. `HASHNODE_PUB_ID`
The publication ID for the DevToolsmith Hashnode blog.

```
69c5558810e664c5daf05d9f
```

> This is a fixed value — it never changes unless you create a new publication.

### 5. `BLUESKY_IDENTIFIER`
The Bluesky handle for the DevToolsmith account.

```
devtoolsmith.bsky.social
```

### 6. `BLUESKY_PASSWORD`
> ⚠️ Use an **App Password**, NOT the main account password.
> Create one at: https://bsky.app/settings/app-passwords → "Add App Password"
> Name it "github-actions"

Main account password (to create the app password):
```
DevToolsmith2026!
```

---

## Repository Variables (not secrets — visible in logs)

**URL:**
```
https://github.com/antonioalt3000-cyber/toolkit-online/settings/variables/actions
```

Click **"New repository variable"** for each entry below.

### `PREV_STATUS`
Initial value: `up`

> This variable is automatically updated by the uptime-monitor workflow.
> It tracks whether any site was down on the previous check,
> enabling "recovery" email notifications.

---

## Workflow Permissions

The daily-automation workflow needs write access to commit updated `prospects.json`.

**URL:**
```
https://github.com/antonioalt3000-cyber/toolkit-online/settings/actions
```

Under **"Workflow permissions"**:
- Select **"Read and write permissions"**
- Check **"Allow GitHub Actions to create and approve pull requests"**
- Click **Save**

---

## Verify Setup

After adding all secrets, trigger a manual test run:

1. Go to: https://github.com/antonioalt3000-cyber/toolkit-online/actions
2. Click **"Daily Automation"** → **"Run workflow"** → set `dry_run = true` → **Run**
3. Watch the logs — all 4 jobs should pass without actually posting/sending

For uptime monitoring:
1. Click **"Uptime Monitor"** → **"Run workflow"**
2. Logs should show 5 green checkmarks within 30 seconds

---

## Automation Schedule Summary

| Workflow | Schedule | What it does |
|----------|----------|--------------|
| **Uptime Monitor** | Every 5 min, 24/7 | Checks 5 sites, emails alert if any down |
| **Daily Automation** | 09:00 UTC (10:00 Madrid) | Post to Dev.to + Hashnode + Bluesky + B2B outreach email + daily report |
| **Weekly Quality** | Sunday 06:00 UTC | ESLint + build check + quality report email |

---

## Cost Overview (all free)

| Resource | Usage | Limit | Cost |
|----------|-------|-------|------|
| GitHub Actions minutes | ~2,200 min/month | 2,000 min (public) / 500 min (private free) | **FREE** (public repo) |
| Brevo emails | ~35/month (reports) + 40 outreach | 300/day | **FREE** |
| Dev.to API | 1 post/day | Unlimited | **FREE** |
| Hashnode API | 1 post/day | Unlimited | **FREE** |
| Bluesky API | 1 post/day | 300/day | **FREE** |

> **For private repos:** GitHub free plan gives 500 min/month.
> The uptime monitor alone uses ~2,160 min/month (every 5 min × ~15s × 8,640 runs).
> **Recommendation:** Keep this repo public (code contains no secrets — all in GitHub Secrets).
> OR reduce uptime check to every 15 min: change `*/5` to `*/15` in uptime-monitor.yml.

---

## Refreshing API Keys

When keys expire:

| Key | Where to regenerate |
|-----|---------------------|
| `DEVTO_API_KEY` | dev.to/settings/extensions |
| `HASHNODE_API_KEY` | hashnode.com/settings/developer |
| `BLUESKY_PASSWORD` | bsky.app/settings/app-passwords |
| `BREVO_API_KEY` | app.brevo.com → My Account → API Keys |

After regenerating: go to GitHub Settings → Secrets → update the value.

---

## Outreach Prospects

The file `scripts/automation/prospects.json` contains 40 pre-researched B2B prospects.
The daily automation contacts one per day and commits the updated file back to the repo.

**To add more prospects:** edit `scripts/automation/prospects.json` and add entries at the bottom:

```json
{
  "id": "p041",
  "company": "Company Name",
  "contact": "First Name or Role",
  "email": "contact@company.com",
  "tool": "F1",
  "angle": "Why this company needs this specific tool",
  "contacted": false,
  "contacted_date": null,
  "notes": "Any notes about the company or contact"
}
```

`tool` values: `F1` (CompliPilot), `F2` (AccessiScan), `F3` (ChurnGuard), `F4` (ParseFlow), `B7` (CaptureAPI)

---

*Last updated: April 2026*
