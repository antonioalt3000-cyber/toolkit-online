import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolkitonline.vip';

const SITEMAP_IDS = ['static', 'finance', 'text', 'health', 'conversion', 'dev', 'math', 'images', 'blog'];

export default function sitemap(): MetadataRoute.Sitemap {
  return SITEMAP_IDS.map((id) => ({
    url: `${BASE_URL}/sitemaps/${id}`,
    lastModified: new Date().toISOString(),
  }));
}
