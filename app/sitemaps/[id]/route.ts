import { NextResponse } from 'next/server';
import { locales, getToolsByCategory } from '@/lib/translations';
import { blogSlugs } from '@/lib/blog';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://toolkitonline.vip';
const categories = ['finance', 'text', 'health', 'conversion', 'dev', 'math', 'images'] as const;

function buildUrl(loc: string, priority: number, alternates: Record<string, string>): string {
  const hreflangs = Object.entries(alternates)
    .map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />`)
    .join('\n');
  return `<url>
<loc>${loc}</loc>
${hreflangs}
<changefreq>weekly</changefreq>
<priority>${priority}</priority>
</url>`;
}

function generateStaticSitemap(): string {
  const urls: string[] = [];

  // Home pages
  for (const locale of locales) {
    urls.push(buildUrl(`${BASE_URL}/${locale}`, 1.0,
      Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}`]))));
  }

  // Tools listing
  for (const locale of locales) {
    urls.push(buildUrl(`${BASE_URL}/${locale}/tools`, 0.9,
      Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/tools`]))));
  }

  // Category hubs
  for (const cat of categories) {
    for (const locale of locales) {
      urls.push(buildUrl(`${BASE_URL}/${locale}/tools/category/${cat}`, 0.9,
        Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/tools/category/${cat}`]))));
    }
  }

  // Static pages
  for (const page of ['about', 'contact', 'faq', 'privacy', 'terms']) {
    for (const locale of locales) {
      urls.push(buildUrl(`${BASE_URL}/${locale}/${page}`, 0.6,
        Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/${page}`]))));
    }
  }

  return urls.join('\n');
}

function generateCategorySitemap(category: string): string {
  const toolsByCategory = getToolsByCategory();
  const tools = toolsByCategory[category] || [];
  const urls: string[] = [];

  for (const tool of tools) {
    for (const locale of locales) {
      urls.push(buildUrl(
        `${BASE_URL}/${locale}/tools/${tool}`,
        locale === 'it' ? 0.8 : 0.6,
        Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/tools/${tool}`]))
      ));
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
