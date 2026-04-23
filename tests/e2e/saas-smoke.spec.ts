import { test, expect } from "@playwright/test";

/**
 * Synthetic E2E smoke tests — run 2x/day (05:00 and 17:00 UTC) against production.
 *
 * These are REAL browser tests: open each SaaS, verify rendering, content,
 * and that key interactive elements exist. Catches regressions that
 * HTTP-status-only monitors miss (blank page 200, client-side crash, missing CTA).
 */

const SAAS = [
  {
    name: "F1 CompliPilot",
    url: "https://complipilot.dev",
    titleContains: /compli/i,
    mustHave: ["scan", "compliance"],
  },
  {
    name: "F2 FixMyWeb",
    url: "https://fixmyweb.dev",
    titleContains: /accessibil|fixmyweb|scan/i,
    mustHave: ["scan", "accessibility"],
  },
  {
    name: "F3 PaymentRescue",
    url: "https://paymentrescue.dev",
    titleContains: /payment|rescue|churn/i,
    mustHave: ["churn", "stripe"],
  },
  {
    name: "F4 ParseFlow",
    url: "https://parseflow.dev",
    titleContains: /parse|extract|document/i,
    mustHave: ["api", "json"],
  },
  {
    name: "B7 CaptureAPI",
    url: "https://captureapi.dev",
    titleContains: /capture|screenshot|api/i,
    mustHave: ["screenshot", "api"],
  },
];

for (const saas of SAAS) {
  test.describe(saas.name, () => {
    test(`homepage renders with expected title`, async ({ page }) => {
      await page.goto(saas.url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await expect(page).toHaveTitle(saas.titleContains);
    });

    test(`homepage body contains key keywords`, async ({ page }) => {
      await page.goto(saas.url, { waitUntil: "domcontentloaded", timeout: 30000 });
      const body = (await page.textContent("body")) ?? "";
      for (const keyword of saas.mustHave) {
        expect(body.toLowerCase()).toContain(keyword.toLowerCase());
      }
    });

    test(`pricing or features link exists`, async ({ page }) => {
      await page.goto(saas.url, { waitUntil: "domcontentloaded", timeout: 30000 });
      const hasPricing = await page.locator('a[href*="pricing"], a[href*="plans"], a[href*="features"]').count();
      expect(hasPricing).toBeGreaterThan(0);
    });

    test(`/api/health responds 200 with status field`, async ({ request }) => {
      const res = await request.get(`${saas.url}/api/health`, { timeout: 15000 });
      expect([200, 503]).toContain(res.status()); // 503 is acceptable if degraded, but not 5xx crash
      const body = await res.json();
      expect(body).toHaveProperty("status");
    });

    test(`DSAR endpoints exist (GET)`, async ({ request }) => {
      const exportRes = await request.get(`${saas.url}/api/user/export`, { timeout: 10000 });
      const deleteRes = await request.get(`${saas.url}/api/user/delete`, { timeout: 10000 });
      // GET returns documentation (200) for both
      expect(exportRes.status()).toBe(200);
      expect(deleteRes.status()).toBe(200);
    });

    test(`no console errors on homepage`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      await page.goto(saas.url, { waitUntil: "networkidle", timeout: 30000 });
      // Filter noise: ad blocker, third-party analytics, etc.
      const meaningful = errors.filter(
        (e) =>
          !e.includes("google-analytics") &&
          !e.includes("gtag") &&
          !e.includes("adsbygoogle") &&
          !e.includes("ERR_BLOCKED_BY_CLIENT") &&
          !e.includes("Failed to load resource"),
      );
      expect(meaningful, `Console errors on ${saas.name}: ${meaningful.join(" | ")}`).toHaveLength(0);
    });
  });
}
