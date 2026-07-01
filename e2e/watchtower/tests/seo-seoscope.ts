/**
 * Watchtower test plan — SEO SEOScope
 *
 * Coverage: homepage + /redeem (LTD coupon) + /api/health backend ping +
 * pricing/docs/signup + legal pages + sitemap/robots.
 *
 * Only routes verified live (2xx) on 2026-07-01 are included. Routes that
 * 404 (/login, /blog, /features, /audit, /scan, /demo, /dpa, /api/v1/health)
 * are intentionally omitted to keep the monitor from false-redding.
 *
 * Severity assignment guide:
 *   P0 = revenue-blocking (homepage, redeem, health)
 *   P1 = degraded UX (pricing, docs, signup)
 *   P2 = warning (legal page, sitemap, robots)
 */

import type { PageTest } from '../lib/types.js';

const BASE = 'https://seoscope.dev';

export const SEO_BASE_URL = BASE;
export const SEO_NAME = 'SEO-SEOScope';

export const SEO_PAGES: PageTest[] = [
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
      if (!/SEOScope|SEO|Core Web Vitals|on-page|audit/i.test(text)) {
        throw new Error('Homepage does not mention SEOScope/SEO/audit — content broken');
      }
      // At least one CTA link/button (homepage links to /signup, /redeem, /pricing, /docs).
      const ctas = await page.locator('a[href], button').count();
      if (ctas < 1) throw new Error('No CTA link/button found on homepage');
    },
  },
  {
    name: '/redeem (LTD coupon entry page)',
    url: `${BASE}/redeem`,
    severity: 'P0',
    interaction: async (page) => {
      // Production form: email + coupon input with placeholder "SEO-DM-XXXX-XXXX"
      // (no "coupon"/"code" word), plus an Activate/Redeem button. Match broadly.
      const input = page.locator(
        'input[placeholder*="coupon" i], input[placeholder*="code" i], input[placeholder*="XXXX" i], input[placeholder*="SEO-" i], input[name*="coupon" i], input[name*="code" i]'
      );
      const activate = page.locator('button:has-text("Activate"), button:has-text("Redeem")');
      if ((await input.count()) === 0 && (await activate.count()) === 0) {
        throw new Error(
          '/redeem page has no coupon input or activate button — LTD redemption broken'
        );
      }
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

  // -------------------------------------------------------------------------
  // P1 — pricing, docs, signup
  // -------------------------------------------------------------------------
  {
    name: '/pricing — tiers visible',
    url: `${BASE}/pricing`,
    severity: 'P1',
    interaction: async (page) => {
      const body = (await page.textContent('body')) ?? '';
      if (!/free|pro|business|team|lifetime|enterprise|starter/i.test(body)) {
        throw new Error('/pricing missing tier names');
      }
    },
  },
  {
    name: '/signup',
    url: `${BASE}/signup`,
    severity: 'P1',
    interaction: async (page) => {
      // Simple load — assert it renders rather than a blank SSR exception.
      const body = (await page.textContent('body')) ?? '';
      if (body.trim().length < 50) throw new Error('/signup renders blank');
    },
  },
  {
    name: '/docs',
    url: `${BASE}/docs`,
    severity: 'P1',
    interaction: async (page) => {
      const body = (await page.textContent('body')) ?? '';
      if (body.trim().length < 50) throw new Error('/docs renders blank');
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
