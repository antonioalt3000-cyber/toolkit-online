import type { MetadataRoute } from 'next';
import { toolList, locales, getToolsByCategory } from '@/lib/translations';
import { blogSlugs } from '@/lib/blog';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolkitonline.vip';

const categories = ['finance', 'text', 'health', 'conversion', 'dev', 'math', 'images'] as const;

// Next.js generateSitemaps() creates a sitemap index automatically
// Each id maps to /sitemap/[id].xml
export async function generateSitemaps() {
  return [
    { id: 'static' },
    ...categories.map((cat) => ({ id: cat })),
    { id: 'blog' },
  ];
}

export default function sitemap({ id }: { id: string }): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  if (id === 'static') {
    // Home pages
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}`])
          ),
        },
      });
    }

    // Tools listing page
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/tools`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}/tools`])
          ),
        },
      });
    }

    // Category hub pages
    for (const category of categories) {
      for (const locale of locales) {
        entries.push({
          url: `${BASE_URL}/${locale}/tools/category/${category}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
          alternates: {
            languages: Object.fromEntries(
              locales.map((l) => [l, `${BASE_URL}/${l}/tools/category/${category}`])
            ),
          },
        });
      }
    }

    // Static pages (about, contact, faq, privacy, terms)
    for (const page of ['about', 'contact', 'faq', 'privacy', 'terms']) {
      for (const locale of locales) {
        entries.push({
          url: `${BASE_URL}/${locale}/${page}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: {
            languages: Object.fromEntries(
              locales.map((l) => [l, `${BASE_URL}/${l}/${page}`])
            ),
          },
        });
      }
    }

    return entries;
  }

  if (id === 'blog') {
    // Blog index
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}/blog`])
          ),
        },
      });
    }

    // Blog articles
    for (const slug of blogSlugs) {
      for (const locale of locales) {
        entries.push({
          url: `${BASE_URL}/${locale}/blog/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.7,
          alternates: {
            languages: Object.fromEntries(
              locales.map((l) => [l, `${BASE_URL}/${l}/blog/${slug}`])
            ),
          },
        });
      }
    }

    return entries;
  }

  // Category-specific sitemaps: tools grouped by category
  const toolsByCategory = getToolsByCategory();
  const categoryTools = toolsByCategory[id] || [];

  for (const tool of categoryTools) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/tools/${tool}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        // Italian pages get higher priority (best performing locale)
        priority: locale === 'it' ? 0.8 : 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}/tools/${tool}`])
          ),
        },
      });
    }
  }

  return entries;
}
