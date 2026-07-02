/**
 * Watchtower test plan — HKL HookLab
 *
 * Coverage: homepage (brand + CTA) + /api/health JSON ping + /redeem LTD
 * coupon flow + /dashboard shape + /pricing tiers + /docs + /signup +
 * legal pages + sitemap/robots.
 *
 * Round-2 DealMirror SaaS — API/coupon-first, so this plan mirrors the
 * b7-captureapi shape (health endpoint + redeem coupon page) rather than a
 * deep public core-action form (webhook inspection requires an authenticated
 * inbox URL, so no reliable public form selector to assert on).
 *
 * Every route below was probed live (2026-07-01) and returns 2xx. Routes
 * that 404 (/login, /demo, /playground, /changelog, /blog) are intentionally
 * omitted to keep the monitor from false-redding.
 *
 * Severity assignment guide:
 *   P0 = revenue-blocking (homepage, health, redeem)
 *   P1 = degraded UX (dashboard, pricing, docs, signup)
 *   P2 = warning (legal page, sitemap, robots)
 */

import type { PageTest } from '../lib/types.js';

const BASE = 'https://gethooklab.dev';

export const HKL_BASE_URL = BASE;
export const HKL_NAME = 'HKL-HookLab';

export const HKL_PAGES: PageTest[] = [
  // -------------------------------------------------------------------------
  // P0 — homepage + core revenue paths
  // -------------------------------------------------------------------------
  {
    name: 'Homepage',
    url: BASE,
    severity: 'P0',
    interaction: async (page) => {
      // The homepage MUST mention the brand + niche keyword and expose a CTA.
      const text = (await page.textContent('body')) ?? '';
      if (!/HookLab|webhook|inspect|replay/i.test(text)) {
        throw new Error(
          'Homepage does not mention HookLab/webhook/inspect/replay — content broken'
        );
      }
      // At least one actionable CTA link/button (nav → /pricing, /redeem, /signup, /dashboard).
      const ctas = await page.locator('a[href], button').count();
      if (ctas < 1) throw new Error('No CTA link/button found on homepage');
    },
  },
  {
    name: '/api/health — backend ping',
    url: `${BASE}/api/health`,
    severity: 'P0',
    mode: 'fetch',
    expectBodyContains: ['ok'],
    timeoutMs: 15_000,
  },
  {
    name: '/redeem (LTD coupon entry page)',
    url: `${BASE}/redeem`,
    severity: 'P0',
    interaction: async (page) => {
      // Production form: email + coupon input with placeholder "HKL-DM-XXXX-XXXX"
      // (no "coupon"/"code" word in placeholder), plus an "Activate" submit.
      // Match on the XXXX shape and HKL- prefix as well as an Activate button.
      const input = page.locator(
        'input[placeholder*="coupon" i], input[placeholder*="code" i], input[placeholder*="XXXX" i], input[placeholder*="HKL-" i], input[name*="coupon" i], input[name*="code" i]'
      );
      const activate = page.locator('button:has-text("Activate")');
      if ((await input.count()) === 0 && (await activate.count()) === 0) {
        throw new Error(
          '/redeem page has no coupon input or activate button — LTD redemption broken'
        );
      }
    },
  },

  // -------------------------------------------------------------------------
  // P1 — dashboard, pricing, docs, signup
  // -------------------------------------------------------------------------
  {
    name: '/dashboard (authenticated area shape check)',
    url: `${BASE}/dashboard`,
    severity: 'P1',
    interaction: async (page) => {
      // Without auth this should redirect or show a sign-in CTA. What we DO
      // want to fail: unhandled error / blank page.
      const body = (await page.textContent('body')) ?? '';
      if (body.trim().length < 50) {
        throw new Error('Dashboard renders blank — likely SSR exception');
      }
    },
  },
  {
    name: '/pricing — tiers visible',
    url: `${BASE}/pricing`,
    severity: 'P1',
    interaction: async (page) => {
      const body = (await page.textContent('body')) ?? '';
      if (!/free|pro|team|business|lifetime|enterprise|developer/i.test(body)) {
        throw new Error('/pricing missing tier names');
      }
    },
  },
  {
    name: '/docs',
    url: `${BASE}/docs`,
    severity: 'P1',
    interaction: async (page) => {
      const body = (await page.textContent('body')) ?? '';
      if (body.trim().length < 100) throw new Error('/docs renders blank');
    },
  },
  {
    name: '/signup',
    url: `${BASE}/signup`,
    severity: 'P1',
    interaction: async (page) => {
      const body = (await page.textContent('body')) ?? '';
      if (body.trim().length < 50) throw new Error('/signup renders blank');
    },
  },

  // -------------------------------------------------------------------------
  // P2 — legal + machine-readable
  // -------------------------------------------------------------------------
  { name: '/privacy', url: `${BASE}/privacy`, severity: 'P2' },
  { name: '/terms', url: `${BASE}/terms`, severity: 'P2' },
  {
    name: '/sitemap.xml',
    url: `${BASE}/sitemap.xml`,
    severity: 'P2',
    mode: 'fetch',
    expectBodyContains: ['<urlset', '<url>'],
  },
  {
    name: '/robots.txt',
    url: `${BASE}/robots.txt`,
    severity: 'P2',
    mode: 'fetch',
    expectBodyContains: ['User-Agent'],
  },
];
