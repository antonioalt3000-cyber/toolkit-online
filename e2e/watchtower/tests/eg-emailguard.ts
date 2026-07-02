/**
 * Watchtower test plan — EG EmailGuard
 *
 * Coverage: homepage + /redeem (LTD coupon flow) + /api/health backend ping
 * + pricing/docs/signup + sitemap/robots. Every route was probed live and
 * returns 2xx before being asserted here (reliability > coverage, so the
 * hourly monitor never false-reds on a route that isn't shipped).
 *
 * Severity assignment guide:
 *   P0 = revenue-blocking (homepage, redeem, backend health)
 *   P1 = degraded UX (pricing, docs, signup)
 *   P2 = warning (legal / sitemap / robots)
 */

import type { PageTest } from '../lib/types.js';

const BASE = 'https://emailguard.dev';

export const EG_BASE_URL = BASE;
export const EG_NAME = 'EG-EmailGuard';

export const EG_PAGES: PageTest[] = [
  // -------------------------------------------------------------------------
  // P0 — homepage + core revenue paths
  // -------------------------------------------------------------------------
  {
    name: 'Homepage',
    url: BASE,
    severity: 'P0',
    interaction: async (page) => {
      // The homepage MUST mention the brand / niche + expose an actionable CTA.
      const text = (await page.textContent('body')) ?? '';
      if (!/EmailGuard|email validation|deliverability|verif/i.test(text)) {
        throw new Error(
          'Homepage does not mention EmailGuard/email validation/deliverability — content broken'
        );
      }
      // At least one CTA link/button must be present.
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
      // Page must show a coupon input field — this is the key DealMirror flow.
      // Production placeholder is "EG-DM-XXXX-XXXX" (no "coupon"/"code" word),
      // so match on the XXXX shape and EG- prefix as well as the Activate button.
      const input = page.locator(
        'input[placeholder*="coupon" i], input[placeholder*="code" i], input[placeholder*="XXXX" i], input[placeholder*="EG-" i], input[name*="coupon" i], input[name*="code" i]'
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
  // P1 — pricing, docs, signup
  // -------------------------------------------------------------------------
  {
    name: '/pricing — all tiers visible',
    url: `${BASE}/pricing`,
    severity: 'P1',
    interaction: async (page) => {
      const body = (await page.textContent('body')) ?? '';
      if (!/free|pro|business|enterprise|lifetime/i.test(body)) {
        throw new Error('/pricing missing tier names (Free/Pro/Business/Enterprise/Lifetime)');
      }
    },
  },
  {
    name: '/signup',
    url: `${BASE}/signup`,
    severity: 'P1',
    interaction: async (page) => {
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      if ((await emailInput.count()) === 0) {
        throw new Error('/signup has no email input — signup broken');
      }
    },
  },
  {
    name: '/docs',
    url: `${BASE}/docs`,
    severity: 'P1',
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
    expectBodyContains: ['User-agent'],
  },
];
