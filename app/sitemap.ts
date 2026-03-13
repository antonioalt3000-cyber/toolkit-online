import type { MetadataRoute } from 'next';
import { toolList, locales } from '@/lib/translations';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolkitonline.vip';

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Home pages for each locale (with hreflang alternates)
  for (const locale of locales) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date('2026-03-13'),
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
      lastModified: new Date('2026-03-13'),
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
        lastModified: new Date('2026-03-13'),
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

  return entries;
}
