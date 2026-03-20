import type { Metadata } from 'next';
import { tools, locales, type Locale } from '@/lib/translations';

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolkitonline.vip';

export function generateToolMetadata(toolSlug: string, lang: string): Metadata {
  const locale = (lang as Locale) || 'en';
  const toolData = tools[toolSlug]?.[locale] || tools[toolSlug]?.['en'];

  if (!toolData) {
    return {};
  }

  const canonicalUrl = `${BASE_URL}/${locale}/tools/${toolSlug}`;

  return {
    title: toolData.metaTitle,
    description: toolData.metaDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}/tools/${toolSlug}`])
        ),
        'x-default': `${BASE_URL}/en/tools/${toolSlug}`,
      },
    },
    openGraph: {
      title: toolData.metaTitle,
      description: toolData.metaDescription,
      url: canonicalUrl,
      siteName: 'ToolKit Online',
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: toolData.metaTitle,
      description: toolData.metaDescription,
    },
  };
}

export function generateToolJsonLd(toolSlug: string, lang: string) {
  const locale = (lang as Locale) || 'en';
  const toolData = tools[toolSlug]?.[locale] || tools[toolSlug]?.['en'];

  if (!toolData) {
    return null;
  }

  const canonicalUrl = `${BASE_URL}/${locale}/tools/${toolSlug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: toolData.name,
    description: toolData.metaDescription,
    url: canonicalUrl,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    inLanguage: locales as unknown as string[],
  };
}
