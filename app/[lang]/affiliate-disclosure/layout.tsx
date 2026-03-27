import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/translations';
import { BASE_URL } from '@/lib/seo';

const metaTitles: Record<Locale, string> = {
  en: 'Affiliate Disclosure | ToolKit Online',
  it: 'Divulgazione Affiliazione | ToolKit Online',
  es: 'Divulgacion de Afiliacion | ToolKit Online',
  fr: 'Divulgation d\'Affiliation | ToolKit Online',
  de: 'Affiliate-Offenlegung | ToolKit Online',
  pt: 'Divulgacao de Afiliados | ToolKit Online',
};

const metaDescriptions: Record<Locale, string> = {
  en: 'Learn how ToolKit Online uses affiliate links. Our tools are 100% free — affiliate partnerships help keep them that way.',
  it: 'Scopri come ToolKit Online utilizza i link di affiliazione. I nostri strumenti sono 100% gratuiti — le partnership di affiliazione aiutano a mantenerli tali.',
  es: 'Descubre como ToolKit Online utiliza enlaces de afiliados. Nuestras herramientas son 100% gratuitas — las asociaciones de afiliados ayudan a mantenerlas asi.',
  fr: 'Decouvrez comment ToolKit Online utilise les liens d\'affiliation. Nos outils sont 100% gratuits — les partenariats d\'affiliation aident a les maintenir ainsi.',
  de: 'Erfahren Sie, wie ToolKit Online Affiliate-Links verwendet. Unsere Tools sind 100% kostenlos — Affiliate-Partnerschaften helfen, sie so zu halten.',
  pt: 'Saiba como o ToolKit Online usa links de afiliados. Nossas ferramentas sao 100% gratuitas — parcerias de afiliados ajudam a mante-las assim.',
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = (lang as Locale) || 'en';

  return {
    title: metaTitles[locale],
    description: metaDescriptions[locale],
    alternates: {
      canonical: `${BASE_URL}/${locale}/affiliate-disclosure`,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `${BASE_URL}/${l}/affiliate-disclosure`])),
        'x-default': `${BASE_URL}/en/affiliate-disclosure`,
      },
    },
    openGraph: {
      title: metaTitles[locale],
      description: metaDescriptions[locale],
      url: `${BASE_URL}/${locale}/affiliate-disclosure`,
      siteName: 'ToolKit Online',
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: metaTitles[locale],
      description: metaDescriptions[locale],
    },
  };
}

export default function AffiliateDisclosureLayout({ children }: { children: React.ReactNode }) {
  return children;
}
