/**
 * Watchtower test plan — CFG CardForge
 *
 * Coverage: homepage (brand + CTA) + /api/health + /redeem (LTD coupon) +
 * pricing/docs/signup + sitemap/robots. Routes were probed live on
 * 2026-07-01; only 2xx routes are included. /login, /playground, /demo,
 * /compare, /changelog, /blog and /api/v1/health all 404 and are skipped.
 *
 * Severity assignment guide:
 *   P0 = revenue-blocking (homepage, health, redeem)
 *   P1 = degraded UX (pricing, docs, signup)
 *   P2 = warning (sitemap, robots)
 */

import type { PageTest } from '../lib/types.js';

const BASE = 'https://getcardforge.dev';

export const CFG_BASE_URL = BASE;
export const CFG_NAME = 'CFG-CardForge';

export const CFG_PAGES: PageTest[] = [
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
      if (!/CardForge|social card|OG image|open graph/i.test(text)) {
        throw new Error(
          'Homepage does not mention CardForge/social card/OG image — content broken'
        );
      }
      // At least one prominent CTA link/button (Get free key, Pricing, Signup, etc.)
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
      // Production form: text input placeholder "CFG-DM-XXXX-XXXX" + email +
      // "Activate" button. Match on the XXXX / CFG- shape (no "coupon"/"code"
      // word in the placeholder) plus the Activate button as a broad fallback.
      const input = page.locator(
        'input[placeholder*="coupon" i], input[placeholder*="code" i], input[placeholder*="XXXX" i], input[placeholder*="CFG-" i], input[name*="coupon" i], input[name*="code" i]'
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
    name: '/pricing — tiers visible',
    url: `${BASE}/pricing`,
    severity: 'P1',
    interaction: async (page) => {
      const body = (await page.textContent('body')) ?? '';
      if (!/free|pro|lifetime|business|starter/i.test(body)) {
        throw new Error('/pricing missing tier names (Free/Pro/Lifetime)');
      }
    },
  },
  {
    name: '/docs (API documentation)',
    url: `${BASE}/docs`,
    severity: 'P1',
    interaction: async (page) => {
      const body = (await page.textContent('body')) ?? '';
      if (body.trim().length < 100)
        throw new Error('/docs renders near-blank — likely SSR exception');
    },
  },
  {
    name: '/signup (free API key)',
    url: `${BASE}/signup`,
    severity: 'P1',
    interaction: async (page) => {
      const body = (await page.textContent('body')) ?? '';
      if (body.trim().length < 100) throw new Error('/signup renders near-blank — signup broken');
    },
  },

  // -------------------------------------------------------------------------
  // P2 — sitemap + robots
  // -------------------------------------------------------------------------
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
