import type { MetadataRoute } from 'next';
import { toolList, locales } from '@/lib/translations';
import { blogSlugs } from '@/lib/blog';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolkitonline.vip';

const categories = ['finance', 'text', 'health', 'conversion', 'dev', 'math', 'images'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Home pages for each locale (with hreflang alternates)
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

  // Tools listing page for each locale
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

  // Tool pages for each locale (with hreflang alternates)
  for (const tool of toolList) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/tools/${tool}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}/tools/${tool}`])
          ),
        },
      });
    }
  }

  // Category hub pages for each locale
  for (const category of categories) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/tools/category/${category}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.85,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}/tools/category/${category}`])
          ),
        },
      });
    }
  }

  // Static pages (about, contact, faq, privacy, terms) for each locale
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

  // Blog index page for each locale
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

  // Blog article pages for each locale
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
