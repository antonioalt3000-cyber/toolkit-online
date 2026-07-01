/**
 * Watchtower test plan — HSH HeaderShield
 *
 * Coverage: homepage + /redeem (LTD coupon) + /api/health + pricing/docs/signup
 * + legal pages + sitemap/robots. Round-2 SaaS: API-key based, no public
 * core-action form asserted (avoids flaky-selector false-reds).
 *
 * Severity assignment guide:
 *   P0 = revenue-blocking (homepage, redeem, health)
 *   P1 = degraded UX (pricing, docs, signup)
 *   P2 = warning (legal page, sitemap, robots)
 *
 * Routes probed 2026-07-01 (only 2xx included):
 *   200: / /api/health /redeem /pricing /docs /signup /dashboard
 *        /privacy /terms /sitemap.xml /robots.txt
 *   404 (skipped): /api/v1/health /login /dpa /blog /features
 */

import type { PageTest } from '../lib/types.js';

const BASE = 'https://headershield.dev';

export const HSH_BASE_URL = BASE;
export const HSH_NAME = 'HSH-HeaderShield';

export const HSH_PAGES: PageTest[] = [
  // -------------------------------------------------------------------------
  // P0 — homepage + core revenue paths
  // -------------------------------------------------------------------------
  {
    name: 'Homepage',
    url: BASE,
    severity: 'P0',
    interaction: async (page) => {
      // The homepage MUST mention the brand/niche + expose an actionable CTA.
      const text = (await page.textContent('body')) ?? '';
      if (!/HeaderShield|security header|http header|tls/i.test(text)) {
        throw new Error(
          'Homepage does not mention HeaderShield/security headers/TLS — content broken'
        );
      }
      // At least one CTA link/button (pricing, signup, redeem, dashboard, ...).
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
      // Page must show a coupon input or an Activate button — the DealMirror flow.
      // Production placeholder is "HSH-DM-XXXX-XXXX" (no "coupon"/"code" word),
      // so match on the XXXX shape and HSH- prefix as well.
      const input = page.locator(
        'input[placeholder*="coupon" i], input[placeholder*="code" i], input[placeholder*="XXXX" i], input[placeholder*="HSH-" i], input[name*="coupon" i], input[name*="code" i]'
      );
      const activate = page.locator('button:has-text("Activate"), button:has-text("Redeem")');
      if ((await input.count()) === 0 && (await activate.count()) === 0) {
        throw new Error(
          '/redeem page has no coupon input or activate button — LTD redemption broken'
        );
      }
    },
  },

  // -------------------------------------------------------------------------
  // P1 — pricing, docs, signup
  // -------------------------------------------------------------------------
  {
    name: '/pricing — tiers visible',
    url: `${BASE}/pricing`,
    severity: 'P1',
    interaction: async (page) => {
      const body = (await page.textContent('body')) ?? '';
      if (!/free|pro|business|team|lifetime|enterprise/i.test(body)) {
        throw new Error('/pricing missing tier names (Free/Pro/Business/Lifetime/Enterprise)');
      }
    },
  },
  {
    name: '/docs',
    url: `${BASE}/docs`,
    severity: 'P1',
    interaction: async (page) => {
      const body = (await page.textContent('body')) ?? '';
      if (body.trim().length < 100)
        throw new Error('/docs renders near-empty — likely SSR exception');
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
  // P2 — legal + machine-readable endpoints
  // -------------------------------------------------------------------------
  { name: '/privacy', url: `${BASE}/privacy`, severity: 'P2' },
  { name: '/terms', url: `${BASE}/terms`, severity: 'P2' },
  {
    name: '/sitemap.xml',
    url: `${BASE}/sitemap.xml`,
    severity: 'P2',
    mode: 'fetch',
    expectBodyContains: ['<urlset', '<url'],
  },
  {
    name: '/robots.txt',
    url: `${BASE}/robots.txt`,
    severity: 'P2',
    mode: 'fetch',
    expectBodyContains: ['User-agent'],
  },
];
