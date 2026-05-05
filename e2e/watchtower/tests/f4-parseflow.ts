/**
 * Watchtower test plan — F4 ParseFlow
 *
 * Coverage: homepage + /playground (real "Try Sample Invoice" → click "Extract"
 * → verify JSON-ish result rendered) + /docs/* + /formats + /document-ocr +
 * /batch + /tools/json-preview + /api + /free + /faq + /dashboard + redeem.
 */

import type { PageTest } from "../lib/types.js";

const BASE = "https://www.parseflow.dev";

export const F4_BASE_URL = BASE;
export const F4_NAME = "F4-ParseFlow";

export const F4_PAGES: PageTest[] = [
  // -------------------------------------------------------------------------
  // P0
  // -------------------------------------------------------------------------
  {
    name: "Homepage",
    url: BASE,
    severity: "P0",
    interaction: async (page) => {
      const text = (await page.textContent("body")) ?? "";
      if (!/ParseFlow|PDF|invoice|extract|parse|OCR/i.test(text)) {
        throw new Error("Homepage missing ParseFlow/PDF/invoice messaging");
      }
    },
  },
  {
    name: "/playground — Try Sample Invoice + Extract → JSON",
    url: `${BASE}/playground`,
    severity: "P0",
    timeoutMs: 90_000,
    interaction: async (page) => {
      // Click "Try Sample Invoice" button if present
      const trySample = page.locator('button:has-text("Try Sample"), button:has-text("Sample Invoice"), button:has-text("Sample")').first();
      if (await trySample.count()) {
        await trySample.click();
        await page.waitForTimeout(2_500);
      }
      // Click "Extract Data" or similar action — actual prod label is "Extract Data"
      const extract = page.locator('button:has-text("Extract Data"), button:has-text("Extract")').first();
      if (await extract.count()) {
        await extract.click();
        // Extraction may take ~30s (LLM call). Allow up to 45s and poll for
        // the result-text pattern to fail fast when it actually arrives.
        const deadline = Date.now() + 45_000;
        let matched = false;
        while (Date.now() < deadline) {
          await page.waitForTimeout(2_000);
          const body = (await page.textContent("body")) ?? "";
          if (/processingtimems|confidence|invoice|extracted|amount|total|line item|"createdat"/i.test(body)) {
            matched = true;
            break;
          }
        }
        if (!matched) {
          throw new Error("Playground: Extract clicked but no parsed result rendered within 45s");
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
    name: "/redeem (LTD coupon)",
    url: `${BASE}/redeem`,
    severity: "P0",
    interaction: async (page) => {
      const input = page.locator(
        'input[placeholder*="coupon" i], input[placeholder*="code" i], input[name*="coupon" i], input[name*="code" i]',
      );
      if ((await input.count()) === 0) throw new Error("/redeem has no coupon input");
    },
  },
  {
    name: "/api/health",
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
  // P1
  // -------------------------------------------------------------------------
  {
    name: "/pricing",
    url: `${BASE}/pricing`,
    severity: "P1",
    interaction: async (page) => {
      const body = (await page.textContent("body")) ?? "";
      if (!/free|pro|business|lifetime|enterprise/i.test(body)) {
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
    name: "/document-ocr",
    url: `${BASE}/document-ocr`,
    severity: "P1",
  },
  {
    name: "/batch (batch processing)",
    url: `${BASE}/batch`,
    severity: "P1",
  },
  {
    name: "/tools/json-preview",
    url: `${BASE}/tools/json-preview`,
    severity: "P1",
  },
  {
    name: "/formats (supported formats)",
    url: `${BASE}/formats`,
    severity: "P1",
  },
  {
    name: "/api (API landing)",
    url: `${BASE}/api`,
    severity: "P1",
  },

  // -------------------------------------------------------------------------
  // P2
  // -------------------------------------------------------------------------
  { name: "/docs", url: `${BASE}/docs`, severity: "P2" },
  { name: "/docs/getting-started", url: `${BASE}/docs/getting-started`, severity: "P2" },
  { name: "/docs/api-reference", url: `${BASE}/docs/api-reference`, severity: "P2" },
  { name: "/faq", url: `${BASE}/faq`, severity: "P2" },
  { name: "/blog", url: `${BASE}/blog`, severity: "P2" },
  { name: "/use-cases/invoice", url: `${BASE}/use-cases/invoice`, severity: "P2" },
  { name: "/use-cases/receipt", url: `${BASE}/use-cases/receipt`, severity: "P2" },
  { name: "/privacy", url: `${BASE}/privacy`, severity: "P2" },
  { name: "/terms", url: `${BASE}/terms`, severity: "P2" },
  { name: "/dpa", url: `${BASE}/dpa`, severity: "P2" },
  { name: "/sitemap.xml", url: `${BASE}/sitemap.xml`, severity: "P2", mode: "fetch", expectBodyContains: ["<urlset", "<url>"] },
  { name: "/robots.txt", url: `${BASE}/robots.txt`, severity: "P2", mode: "fetch", expectBodyContains: ["User-agent"] },
];
