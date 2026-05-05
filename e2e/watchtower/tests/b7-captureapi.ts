/**
 * Watchtower test plan — B7 CaptureAPI
 *
 * Coverage: homepage + /playground (real Try It → screenshot capture →
 * verify image rendered) + viewport presets + /tools/meta-inspector +
 * docs (screenshot, pdf, og-image, authentication, webhooks) + /free +
 * /demo + /compare + /changelog + /dashboard + redeem.
 */

import type { PageTest } from "../lib/types.js";

const BASE = "https://www.captureapi.dev";

export const B7_BASE_URL = BASE;
export const B7_NAME = "B7-CaptureAPI";

export const B7_PAGES: PageTest[] = [
  // -------------------------------------------------------------------------
  // P0
  // -------------------------------------------------------------------------
  {
    name: "Homepage",
    url: BASE,
    severity: "P0",
    interaction: async (page) => {
      const text = (await page.textContent("body")) ?? "";
      if (!/CaptureAPI|screenshot|PDF|API|capture/i.test(text)) {
        throw new Error("Homepage missing CaptureAPI/screenshot/PDF messaging");
      }
    },
  },
  {
    name: "/playground — viewport presets + Try It → image rendered",
    url: `${BASE}/playground`,
    severity: "P0",
    timeoutMs: 60_000,
    interaction: async (page) => {
      // Click each viewport preset to verify they don't crash
      const presets = ["Mobile", "Tablet", "Desktop"];
      for (const p of presets) {
        const btn = page.locator(`button:has-text("${p}")`).first();
        if (await btn.count()) {
          await btn.click();
          await page.waitForTimeout(800);
        }
      }
      // Fill URL
      const input = page
        .locator('input[type="url"], input[placeholder*="url" i], input[placeholder*="website" i]')
        .first();
      if (await input.count()) {
        await input.fill("https://example.com");
      }
      // Click "Try It" / "Capture" / "Generate"
      const tryBtn = page
        .locator('button:has-text("Try It"), button:has-text("Capture"), button:has-text("Generate"), button:has-text("Try")')
        .first();
      if (await tryBtn.count()) {
        await tryBtn.click();
        await page.waitForTimeout(20_000);
        const hasImg =
          (await page
            .locator('img[src^="data:image"], img[src^="blob:"], img[src*=".png"], img[src*="screenshot"]')
            .count()) > 0;
        if (!hasImg) {
          throw new Error("Playground: Try It clicked but no image rendered after 20s");
        }
      }
    },
  },
  {
    name: "/dashboard",
    url: `${BASE}/dashboard`,
    severity: "P0",
    interaction: async (page) => {
      const body = (await page.textContent("body")) ?? "";
      if (body.trim().length < 50) throw new Error("Dashboard renders blank");
    },
  },
  {
    name: "/redeem (LTD coupon) — submit invalid expects error",
    url: `${BASE}/redeem`,
    severity: "P0",
    timeoutMs: 30_000,
    interaction: async (page) => {
      const couponInput = page
        .locator('input[placeholder*="coupon" i], input[placeholder*="code" i], input[name*="coupon" i], input[name*="code" i]')
        .first();
      if ((await couponInput.count()) === 0) throw new Error("/redeem has no coupon input");
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
        if (!/invalid|not found|expired|already|error|unrecogn/i.test(body)) {
          throw new Error("/redeem submit with invalid coupon did not produce error");
        }
      }
    },
  },
  {
    name: "/api/v1/health",
    url: `${BASE}/api/v1/health`,
    severity: "P0",
    mode: "fetch",
    expectBodyContains: ["ok"],
    timeoutMs: 15_000,
  },
  {
    name: "/signin",
    url: `${BASE}/signin`,
    severity: "P0",
    interaction: async (page) => {
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      if ((await emailInput.count()) === 0) throw new Error("/signin missing email input");
    },
  },

  // -------------------------------------------------------------------------
  // P1
  // -------------------------------------------------------------------------
  {
    name: "/tools/meta-inspector — fill URL + Analyze → meta rendered",
    url: `${BASE}/tools/meta-inspector`,
    severity: "P1",
    timeoutMs: 60_000,
    interaction: async (page) => {
      const input = page
        .locator('input[type="url"], input[placeholder*="url" i], input[placeholder*="website" i]')
        .first();
      if (await input.count()) {
        await input.fill("https://example.com");
        const analyze = page
          .locator(
            'button:has-text("Analyze"), button:has-text("Inspect"), button:has-text("Check")',
          )
          .first();
        if (await analyze.count()) {
          await analyze.click();
          await page.waitForTimeout(15_000);
          const body = (await page.textContent("body")) ?? "";
          if (!/og:|twitter:|description|meta|title/i.test(body)) {
            throw new Error("Meta inspector: clicked but no meta data rendered");
          }
        }
      }
    },
  },
  {
    name: "/pricing",
    url: `${BASE}/pricing`,
    severity: "P1",
    interaction: async (page) => {
      const body = (await page.textContent("body")) ?? "";
      if (!/free|pro|business|lifetime|enterprise|developer/i.test(body)) {
        throw new Error("/pricing missing tier names");
      }
    },
  },
  {
    name: "/signup",
    url: `${BASE}/signup`,
    severity: "P1",
  },
  {
    name: "/free (free tier landing)",
    url: `${BASE}/free`,
    severity: "P1",
  },
  {
    name: "/demo",
    url: `${BASE}/demo`,
    severity: "P1",
  },
  {
    name: "/compare",
    url: `${BASE}/compare`,
    severity: "P1",
  },

  // -------------------------------------------------------------------------
  // P2
  // -------------------------------------------------------------------------
  { name: "/docs", url: `${BASE}/docs`, severity: "P2" },
  { name: "/docs/screenshot", url: `${BASE}/docs/screenshot`, severity: "P2" },
  { name: "/docs/pdf", url: `${BASE}/docs/pdf`, severity: "P2" },
  { name: "/docs/og-image", url: `${BASE}/docs/og-image`, severity: "P2" },
  { name: "/docs/authentication", url: `${BASE}/docs/authentication`, severity: "P2" },
  { name: "/docs/webhooks", url: `${BASE}/docs/webhooks`, severity: "P2" },
  { name: "/docs/rate-limits", url: `${BASE}/docs/rate-limits`, severity: "P2" },
  { name: "/changelog", url: `${BASE}/changelog`, severity: "P2" },
  { name: "/blog", url: `${BASE}/blog`, severity: "P2" },
  { name: "/use-cases/og-images", url: `${BASE}/use-cases/og-images`, severity: "P2" },
  { name: "/use-cases/seo-monitoring", url: `${BASE}/use-cases/seo-monitoring`, severity: "P2" },
  { name: "/privacy", url: `${BASE}/privacy`, severity: "P2" },
  { name: "/terms", url: `${BASE}/terms`, severity: "P2" },
  { name: "/dpa", url: `${BASE}/dpa`, severity: "P2" },
  { name: "/sitemap.xml", url: `${BASE}/sitemap.xml`, severity: "P2", mode: "fetch", expectBodyContains: ["<urlset", "<url>"] },
  { name: "/robots.txt", url: `${BASE}/robots.txt`, severity: "P2", mode: "fetch", expectBodyContains: ["User-agent"] },
];
