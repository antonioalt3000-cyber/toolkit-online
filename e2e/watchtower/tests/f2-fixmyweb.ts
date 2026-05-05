/**
 * Watchtower test plan — F2 FixMyWeb
 *
 * Coverage: WCAG scanner + 4 standalone tools (contrast / heading / alt-text /
 * aria) + statement + VPAT + pricing + dashboard + redeem + auth.
 * Original `qa-deep-f2.js` covered 9 pages; this expands to ~22 routes
 * with deeper interactive verification.
 */

import type { PageTest } from "../lib/types.js";

const BASE = "https://www.fixmyweb.dev";

export const F2_BASE_URL = BASE;
export const F2_NAME = "F2-FixMyWeb";

export const F2_PAGES: PageTest[] = [
  // -------------------------------------------------------------------------
  // P0
  // -------------------------------------------------------------------------
  {
    name: "Homepage",
    url: BASE,
    severity: "P0",
    interaction: async (page) => {
      const text = (await page.textContent("body")) ?? "";
      if (!/FixMyWeb|WCAG|accessibility|EAA|ADA/i.test(text)) {
        throw new Error("Homepage missing WCAG/accessibility messaging");
      }
    },
  },
  {
    name: "/scan tool — fill URL + submit + verify result",
    url: `${BASE}/scan`,
    severity: "P0",
    timeoutMs: 90_000,
    interaction: async (page) => {
      const input = page
        .locator('input[type="url"], input[placeholder*="url" i], input[placeholder*="website" i], input[name*="url" i]')
        .first();
      await input.waitFor({ state: "visible", timeout: 15_000 });
      await input.fill("https://example.com");
      const submit = page.locator('button[type="submit"], form button').first();
      await submit.click();
      await page.waitForTimeout(60_000);
      const body = (await page.textContent("body")) ?? "";
      if (!/score|issue|wcag|contrast|aria|accessib/i.test(body)) {
        throw new Error("WCAG scan result not rendered after 60s — scanner broken");
      }
    },
  },
  {
    name: "/dashboard",
    url: `${BASE}/dashboard`,
    severity: "P0",
    interaction: async (page) => {
      const body = (await page.textContent("body")) ?? "";
      if (body.trim().length < 50) {
        throw new Error("Dashboard renders blank — likely SSR exception");
      }
    },
  },
  {
    name: "/redeem (LTD coupon) — submit invalid expects error",
    url: `${BASE}/redeem`,
    severity: "P0",
    timeoutMs: 30_000,
    interaction: async (page) => {
      const couponInput = page.locator('input[placeholder*="coupon" i], input[placeholder*="code" i], input[name*="coupon" i], input[name*="code" i]').first();
      if ((await couponInput.count()) === 0) {
        throw new Error("/redeem has no coupon input field");
      }
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
          throw new Error("/redeem submit with invalid coupon did not produce error — backend chain may be broken");
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
    name: "/signin",
    url: `${BASE}/signin`,
    severity: "P0",
    interaction: async (page) => {
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      if ((await emailInput.count()) === 0) throw new Error("/signin missing email input");
    },
  },

  // -------------------------------------------------------------------------
  // P1 — standalone tools (each must have working input)
  // -------------------------------------------------------------------------
  {
    name: "/tools/contrast-checker — pickers visible",
    url: `${BASE}/tools/contrast-checker`,
    severity: "P1",
    interaction: async (page) => {
      // Should have at least one color input (could be type=color or text hex)
      const colorInputs = await page.locator('input[type="color"], input[placeholder*="hex" i], input[placeholder*="#" i]').count();
      if (colorInputs === 0) throw new Error("Contrast checker has no color input");
    },
  },
  {
    name: "/tools/heading-checker — fill URL + submit",
    url: `${BASE}/tools/heading-checker`,
    severity: "P1",
    timeoutMs: 60_000,
    interaction: async (page) => {
      const input = page.locator('input[type="url"], input[placeholder*="url" i], input[placeholder*="website" i]').first();
      if (await input.count()) {
        await input.fill("https://example.com");
        const submit = page.locator('button[type="submit"], form button').first();
        if (await submit.count()) {
          await submit.click();
          await page.waitForTimeout(20_000);
          const body = (await page.textContent("body")) ?? "";
          if (!/h1|heading|hierarchy/i.test(body)) {
            throw new Error("Heading checker did not render result");
          }
        }
      }
    },
  },
  {
    name: "/tools/alt-text-checker",
    url: `${BASE}/tools/alt-text-checker`,
    severity: "P1",
  },
  {
    name: "/tools/aria-validator",
    url: `${BASE}/tools/aria-validator`,
    severity: "P1",
  },
  {
    name: "/vpat (VPAT generator)",
    url: `${BASE}/vpat`,
    severity: "P1",
  },
  {
    name: "/statement (accessibility statement generator)",
    url: `${BASE}/statement`,
    severity: "P1",
  },
  {
    name: "/wcag-audit (paid audit landing)",
    url: `${BASE}/wcag-audit`,
    severity: "P1",
  },
  {
    name: "/pricing",
    url: `${BASE}/pricing`,
    severity: "P1",
    interaction: async (page) => {
      const body = (await page.textContent("body")) ?? "";
      if (!/free|pro|business|lifetime/i.test(body)) {
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

  // -------------------------------------------------------------------------
  // P2
  // -------------------------------------------------------------------------
  { name: "/eaa (European Accessibility Act page)", url: `${BASE}/eaa`, severity: "P2" },
  { name: "/ada (ADA compliance page)", url: `${BASE}/ada`, severity: "P2" },
  { name: "/blog", url: `${BASE}/blog`, severity: "P2" },
  { name: "/docs", url: `${BASE}/docs`, severity: "P2" },
  { name: "/privacy", url: `${BASE}/privacy`, severity: "P2" },
  { name: "/terms", url: `${BASE}/terms`, severity: "P2" },
  { name: "/dpa", url: `${BASE}/dpa`, severity: "P2" },
  { name: "/sitemap.xml", url: `${BASE}/sitemap.xml`, severity: "P2", mode: "fetch", expectBodyContains: ["<urlset", "<url>"] },
  { name: "/robots.txt", url: `${BASE}/robots.txt`, severity: "P2", mode: "fetch", expectBodyContains: ["User-agent"] },
];
