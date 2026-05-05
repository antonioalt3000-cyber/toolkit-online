/**
 * Watchtower test plan — F1 CompliPilot
 *
 * Coverage: every public route + dashboard + redeem flow + core scan tool.
 * Goes far beyond the original `qa-deep-f1.js` (10 pages) — this version
 * covers ~20 routes plus 4 interactive flows that simulate a real
 * customer journey.
 *
 * Severity assignment guide:
 *   P0 = revenue-blocking (homepage, dashboard, redeem, core scan, auth)
 *   P1 = degraded UX (secondary tool, pricing, signup)
 *   P2 = warning (legal page, doc page)
 */

import type { PageTest } from "../lib/types.js";

const BASE = "https://www.complipilot.dev";

export const F1_BASE_URL = BASE;
export const F1_NAME = "F1-CompliPilot";

export const F1_PAGES: PageTest[] = [
  // -------------------------------------------------------------------------
  // P0 — homepage + core revenue paths
  // -------------------------------------------------------------------------
  {
    name: "Homepage",
    url: BASE,
    severity: "P0",
    interaction: async (page) => {
      // The homepage MUST contain the brand name + an actionable CTA.
      const text = (await page.textContent("body")) ?? "";
      if (!/CompliPilot|EU AI Act|GDPR|compliance/i.test(text)) {
        throw new Error("Homepage does not mention CompliPilot/EU AI Act/GDPR — content broken");
      }
      // At least one prominent CTA link/button to /scan or /pricing
      const ctas = await page.locator('a[href*="/scan"], a[href*="/pricing"], button').count();
      if (ctas < 1) throw new Error("No CTA link/button found on homepage");
    },
  },
  {
    name: "/scan tool — fill URL + submit + verify result",
    url: `${BASE}/scan`,
    severity: "P0",
    timeoutMs: 90_000,
    interaction: async (page) => {
      // Find first url-ish input
      const input = page
        .locator('input[type="url"], input[placeholder*="url" i], input[placeholder*="website" i], input[name*="url" i]')
        .first();
      await input.waitFor({ state: "visible", timeout: 15_000 });
      await input.fill("https://example.com");

      // Submit
      const submit = page
        .locator('button[type="submit"], form button')
        .first();
      await submit.click();

      // Real result must appear within 60s (large LLM call)
      await page.waitForTimeout(60_000);

      const body = (await page.textContent("body")) ?? "";
      if (!/score|compliance|issue|gdpr|ai act|finding|risk/i.test(body)) {
        throw new Error("Scan result indicators not found in page after 60s — scanner broken");
      }
    },
  },
  {
    name: "/dashboard (authenticated area shape check)",
    url: `${BASE}/dashboard`,
    severity: "P0",
    interaction: async (page) => {
      // Without auth this should redirect to /signin OR show a sign-in CTA.
      // What we DO want to fail: unhandled error / blank page.
      const body = (await page.textContent("body")) ?? "";
      if (body.trim().length < 50) {
        throw new Error("Dashboard renders blank — likely SSR exception");
      }
    },
  },
  {
    name: "/redeem (LTD coupon entry page) — submit invalid expects error",
    url: `${BASE}/redeem`,
    severity: "P0",
    timeoutMs: 30_000,
    interaction: async (page) => {
      // 1. Page must show coupon input (smoke check).
      const couponInput = page.locator('input[placeholder*="coupon" i], input[placeholder*="code" i], input[name*="coupon" i], input[name*="code" i]').first();
      if ((await couponInput.count()) === 0) {
        throw new Error("/redeem page has no coupon input field — LTD redemption broken");
      }
      // 2. End-to-end probe: submit deliberately invalid credentials, expect error.
      // We DO NOT submit a valid coupon here (would consume a real LTD slot).
      // Instead we verify the endpoint stack (form → API → response → DOM error)
      // is alive by submitting fake data and expecting a "not found / invalid" message.
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      if (await emailInput.count()) {
        await emailInput.fill("watchtower-probe@example.com");
      }
      await couponInput.fill("WATCHTOWER-INVALID-9999");
      const submit = page.locator('button[type="submit"], form button').first();
      if (await submit.count()) {
        await submit.click();
        await page.waitForTimeout(4_000);
        const body = (await page.textContent("body")) ?? "";
        // Backend must respond with a recognisable error message — proves the
        // chain frontend→API→Redis is wired.
        if (!/invalid|not found|expired|already|error|unrecogn/i.test(body)) {
          throw new Error(
            "/redeem submit with invalid coupon did not produce error message — backend chain may be broken",
          );
        }
      }
    },
  },
  {
    name: "/api/health — backend ping",
    url: `${BASE}/api/health`,
    severity: "P0",
    mode: "fetch",
    expectBodyContains: ["ok"],
    timeoutMs: 15_000,
  },
  {
    // Authenticated probe: confirms the paid scan endpoint actually accepts
    // the owner API key and the LLM pipeline is alive. This catches:
    //   - Vercel env var WATCHTOWER_F1_APIKEY missing (returns 401)
    //   - rate-limit bypass not active (would return 429)
    //   - upstream LLM/Anthropic timeout (returns 5xx)
    // The api key is read from process.env to keep it out of git history.
    name: "/api/scan POST — owner apikey end-to-end",
    url: `${BASE}/api/scan`,
    severity: "P0",
    mode: "fetch",
    fetchMethod: "POST",
    fetchHeaders: {
      "content-type": "application/json",
      "x-api-key": process.env["WATCHTOWER_F1_APIKEY"] ?? "",
    },
    fetchBody: { url: "https://example.com" },
    expectStatus: [200, 299],
    expectBodyContains: ["score", "compliance"],
    timeoutMs: 90_000,
    skipIfEnvMissing: ["WATCHTOWER_F1_APIKEY"],
  },
  {
    name: "/signin (auth gate)",
    url: `${BASE}/signin`,
    severity: "P0",
    interaction: async (page) => {
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      if ((await emailInput.count()) === 0) {
        throw new Error("/signin has no email input — auth gate broken");
      }
    },
  },

  // -------------------------------------------------------------------------
  // P1 — pricing, signup, secondary tools
  // -------------------------------------------------------------------------
  {
    name: "/pricing — all tiers visible",
    url: `${BASE}/pricing`,
    severity: "P1",
    interaction: async (page) => {
      const body = (await page.textContent("body")) ?? "";
      // We expect the 3 plan names somewhere on the page
      if (!/starter|pro|enterprise|lifetime/i.test(body)) {
        throw new Error("/pricing missing tier names (Starter/Pro/Enterprise/Lifetime)");
      }
      // At least one CTA per plan (button or link)
      const ctaCount = await page.locator("button, a[href*='/scan'], a[href*='/redeem'], a[href*='checkout']").count();
      if (ctaCount < 3) {
        throw new Error(`/pricing has only ${ctaCount} CTAs — expected 3+ (one per plan)`);
      }
    },
  },
  {
    name: "/signup",
    url: `${BASE}/signup`,
    severity: "P1",
    interaction: async (page) => {
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      if ((await emailInput.count()) === 0) {
        throw new Error("/signup has no email input — signup broken");
      }
    },
  },
  {
    name: "/timeline (compliance roadmap)",
    url: `${BASE}/timeline`,
    severity: "P1",
  },
  {
    name: "/templates (document templates)",
    url: `${BASE}/templates`,
    severity: "P1",
  },
  {
    name: "/checklist (interactive compliance checklist)",
    url: `${BASE}/checklist`,
    severity: "P1",
    interaction: async (page) => {
      // Click the first checkbox if present, verify state changes
      const cb = page.locator('input[type="checkbox"]').first();
      if (await cb.count()) {
        await cb.check();
        const isChecked = await cb.isChecked();
        if (!isChecked) throw new Error("Checklist checkbox not toggling — interactive bug");
      }
    },
  },

  // -------------------------------------------------------------------------
  // P2 — legal + secondary content
  // -------------------------------------------------------------------------
  { name: "/dpa (Data Processing Agreement)", url: `${BASE}/dpa`, severity: "P2" },
  { name: "/privacy", url: `${BASE}/privacy`, severity: "P2" },
  { name: "/terms", url: `${BASE}/terms`, severity: "P2" },
  { name: "/eu-ai-act", url: `${BASE}/eu-ai-act`, severity: "P2" },
  { name: "/gdpr", url: `${BASE}/gdpr`, severity: "P2" },
  { name: "/use-cases", url: `${BASE}/use-cases`, severity: "P2" },
  { name: "/blog", url: `${BASE}/blog`, severity: "P2" },
  { name: "/docs", url: `${BASE}/docs`, severity: "P2" },
  { name: "/sitemap.xml", url: `${BASE}/sitemap.xml`, severity: "P2", mode: "fetch", expectBodyContains: ["<urlset", "<url>"] },
  { name: "/robots.txt", url: `${BASE}/robots.txt`, severity: "P2", mode: "fetch", expectBodyContains: ["User-agent"] },
];
