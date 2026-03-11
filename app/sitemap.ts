import type { MetadataRoute } from 'next';
import { toolList, locales } from '@/lib/translations';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolkitonline.vip';

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Home pages for each locale
  for (const locale of locales) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    });
  }

  // Tool pages for each locale
  for (const tool of toolList) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/tools/${tool}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  return entries;
}
