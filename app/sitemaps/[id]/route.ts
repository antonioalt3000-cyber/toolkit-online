import { NextResponse } from 'next/server';
import { locales, getToolsByCategory } from '@/lib/translations';
import { blogSlugs } from '@/lib/blog';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://toolkitonline.vip';
const categories = ['finance', 'text', 'health', 'conversion', 'dev', 'math', 'images'] as const;
const VAT_COUNTRIES = ['spain', 'germany', 'france', 'italy', 'uk', 'netherlands', 'belgium', 'portugal', 'austria', 'sweden'] as const;

function buildUrl(loc: string, priority: number, alternates: Record<string, string>, lastmod: string = '2026-03-20'): string {
  // Always add x-default pointing to English version
  const xDefault = alternates['en'] ? `<xhtml:link rel="alternate" hreflang="x-default" href="${alternates['en']}" />` : '';
  const hreflangs = Object.entries(alternates)
    .map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />`)
    .join('\n') + (xDefault ? '\n' + xDefault : '');
  return `<url>
<loc>${loc}</loc>
<lastmod>${lastmod}</lastmod>
${hreflangs}
<changefreq>weekly</changefreq>
<priority>${priority}</priority>
</url>`;
}

function generateStaticSitemap(): string {
  const urls: string[] = [];

  // Home pages — prioritize IT and EN
  for (const locale of locales) {
    const priority = (locale === 'it' || locale === 'en') ? 1.0 : 0.5;
    urls.push(buildUrl(`${BASE_URL}/${locale}`, priority,
      Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}`])), '2026-03-23'));
  }

  // Tools listing — prioritize IT and EN
  for (const locale of locales) {
    const priority = (locale === 'it' || locale === 'en') ? 0.9 : 0.4;
    urls.push(buildUrl(`${BASE_URL}/${locale}/tools`, priority,
      Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/tools`])), '2026-03-23'));
  }

  // Category hubs — prioritize IT and EN
  for (const cat of categories) {
    for (const locale of locales) {
      const priority = (locale === 'it' || locale === 'en') ? 0.9 : 0.4;
      urls.push(buildUrl(`${BASE_URL}/${locale}/tools/category/${cat}`, priority,
        Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/tools/category/${cat}`])), '2026-03-23'));
    }
  }

  // Static pages
  for (const page of ['about', 'contact', 'faq', 'privacy', 'terms']) {
    for (const locale of locales) {
      urls.push(buildUrl(`${BASE_URL}/${locale}/${page}`, 0.3,
        Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/${page}`])), '2026-03-01'));
    }
  }

  return urls.join('\n');
}

function getToolPriority(locale: string): number {
  // Focus crawl budget on IT and EN pages first
  if (locale === 'it' || locale === 'en') return 0.9;
  return 0.3;
}

function generateCategorySitemap(category: string): string {
  const toolsByCategory = getToolsByCategory();
  const tools = toolsByCategory[category] || [];
  const urls: string[] = [];

  for (const tool of tools) {
    for (const locale of locales) {
      urls.push(buildUrl(
        `${BASE_URL}/${locale}/tools/${tool}`,
        getToolPriority(locale),
        Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/tools/${tool}`])),
        '2026-03-23'
      ));
    }
  }

  // Add VAT calculator country pages for finance category
  if (category === 'finance') {
    for (const country of VAT_COUNTRIES) {
      for (const locale of locales) {
        urls.push(buildUrl(
          `${BASE_URL}/${locale}/tools/vat-calculator/${country}`,
          getToolPriority(locale),
          Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/tools/vat-calculator/${country}`])),
          '2026-03-25'
        ));
      }
    }
  }

  return urls.join('\n');
}

function generateBlogSitemap(): string {
  const urls: string[] = [];

  for (const locale of locales) {
    urls.push(buildUrl(`${BASE_URL}/${locale}/blog`, 0.8,
      Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/blog`]))));
  }

  for (const slug of blogSlugs) {
    for (const locale of locales) {
      urls.push(buildUrl(`${BASE_URL}/${locale}/blog/${slug}`, 0.7,
        Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/blog/${slug}`]))));
    }
  }

  return urls.join('\n');
}

const VALID_IDS = ['static', ...categories, 'blog'] as const;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!VALID_IDS.includes(id as typeof VALID_IDS[number])) {
    return new NextResponse('Not found', { status: 404 });
  }

  let content: string;

  if (id === 'static') {
    content = generateStaticSitemap();
  } else if (id === 'blog') {
    content = generateBlogSitemap();
  } else {
    content = generateCategorySitemap(id);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${content}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
