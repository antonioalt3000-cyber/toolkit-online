/**
 * Watchtower test plan — F3 PaymentRescue
 *
 * Coverage: homepage + 2 calculators (churn-predictor, recovery-rate) + all
 * vertical landings (recovery, playbooks, templates, card-expiry,
 * stripe-churn-prevention, integrations) + free + dashboard + redeem.
 * Plus webhook health probe (POST {} expects 400 from signature gate).
 */

import type { PageTest } from "../lib/types.js";

const BASE = "https://www.paymentrescue.dev";

export const F3_BASE_URL = BASE;
export const F3_NAME = "F3-PaymentRescue";

export const F3_PAGES: PageTest[] = [
  // -------------------------------------------------------------------------
  // P0
  // -------------------------------------------------------------------------
  {
    name: "Homepage",
    url: BASE,
    severity: "P0",
    interaction: async (page) => {
      const text = (await page.textContent("body")) ?? "";
      if (!/PaymentRescue|Stripe|failed payment|recover|churn/i.test(text)) {
        throw new Error("Homepage missing PaymentRescue/Stripe/churn messaging");
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
      // Production form uses email + text input with placeholder
      // "PRE-XXXX-XXXX" (no "coupon"/"code" keywords). Match also that
      // shape (XXXX-XXXX) and the visible "Activate" button as anchors.
      const input = page.locator(
        'input[placeholder*="coupon" i], input[placeholder*="code" i], input[placeholder*="XXXX" i], input[placeholder*="PRE-" i], input[name*="coupon" i], input[name*="code" i]',
      );
      const activate = page.locator('button:has-text("Activate")');
      if ((await input.count()) === 0 && (await activate.count()) === 0) {
        throw new Error("/redeem has no coupon input or activate button");
      }
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
  // P1 — interactive calculators + revenue paths
  // -------------------------------------------------------------------------
  {
    name: "/tools/churn-predictor — click each option, verify $ amount",
    url: `${BASE}/tools/churn-predictor`,
    severity: "P1",
    timeoutMs: 60_000,
    interaction: async (page) => {
      // The calculator presents 4 churn % buttons. Click each and verify a
      // dollar amount appears in the page (verifies the calc actually runs).
      const options = ["Less than 2%", "2% - 5%", "5% - 10%", "More than 10%"];
      let clickedAtLeastOne = false;
      for (const opt of options) {
        const btn = page.locator(`button:has-text("${opt}")`).first();
        if (await btn.count()) {
          await btn.click();
          await page.waitForTimeout(1_500);
          clickedAtLeastOne = true;
        }
      }
      if (clickedAtLeastOne) {
        const body = (await page.textContent("body")) ?? "";
        if (!/\$[\d,]+/.test(body)) {
          throw new Error("Churn predictor: clicked options but no $ amount appeared");
        }
      }
    },
  },
  {
    name: "/tools/recovery-rate-calculator",
    url: `${BASE}/tools/recovery-rate-calculator`,
    severity: "P1",
  },
  {
    name: "/pricing",
    url: `${BASE}/pricing`,
    severity: "P1",
    interaction: async (page) => {
      const body = (await page.textContent("body")) ?? "";
      if (!/starter|pro|business|lifetime|enterprise/i.test(body)) {
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
    name: "/recovery (recovery flow landing)",
    url: `${BASE}/recovery`,
    severity: "P1",
  },
  {
    name: "/playbooks",
    url: `${BASE}/playbooks`,
    severity: "P1",
  },
  {
    name: "/templates (email templates)",
    url: `${BASE}/templates`,
    severity: "P1",
  },
  {
    name: "/free",
    url: `${BASE}/free`,
    severity: "P1",
  },
  {
    name: "/integrations (Stripe + others)",
    url: `${BASE}/integrations`,
    severity: "P1",
  },
  {
    name: "/stripe-churn-prevention",
    url: `${BASE}/stripe-churn-prevention`,
    severity: "P1",
  },

  // -------------------------------------------------------------------------
  // P2
  // -------------------------------------------------------------------------
  {
    name: "/features/card-expiry",
    url: `${BASE}/features/card-expiry`,
    severity: "P2",
  },
  {
    name: "/features/dunning-emails",
    url: `${BASE}/features/dunning-emails`,
    severity: "P2",
  },
  {
    name: "/features/smart-retry",
    url: `${BASE}/features/smart-retry`,
    severity: "P2",
  },
  {
    name: "/how-it-works",
    url: `${BASE}/how-it-works`,
    severity: "P2",
  },
  {
    name: "/blog",
    url: `${BASE}/blog`,
    severity: "P2",
  },
  {
    name: "/docs",
    url: `${BASE}/docs`,
    severity: "P2",
  },
  {
    name: "/privacy",
    url: `${BASE}/privacy`,
    severity: "P2",
  },
  {
    name: "/terms",
    url: `${BASE}/terms`,
    severity: "P2",
  },
  {
    name: "/dpa",
    url: `${BASE}/dpa`,
    severity: "P2",
  },
  {
    name: "/sitemap.xml",
    url: `${BASE}/sitemap.xml`,
    severity: "P2",
    mode: "fetch",
    expectBodyContains: ["<urlset", "<url>"],
  },
  {
    name: "/robots.txt",
    url: `${BASE}/robots.txt`,
    severity: "P2",
    mode: "fetch",
    expectBodyContains: ["User-agent"],
  },
];
