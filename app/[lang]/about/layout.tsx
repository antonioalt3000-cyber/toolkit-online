import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/translations';
import { BASE_URL } from '@/lib/seo';

const metaTitles: Record<Locale, string> = {
  en: 'About ToolKit Online | 143+ Free Online Tools in 6 Languages',
  it: 'Chi Siamo — ToolKit Online | 143+ Strumenti Online Gratuiti',
  es: 'Acerca de ToolKit Online | 143+ Herramientas Online Gratuitas',
  fr: 'A Propos de ToolKit Online | 143+ Outils en Ligne Gratuits',
  de: 'Uber ToolKit Online | 143+ Kostenlose Online-Tools',
  pt: 'Sobre o ToolKit Online | 143+ Ferramentas Online Gratuitas',
};

const metaDescriptions: Record<Locale, string> = {
  en: 'Learn about ToolKit Online: 143+ free online tools in 6 languages, built with Next.js. Privacy-first, no sign-up, 100% free. Trusted by thousands of users worldwide.',
  it: 'Scopri ToolKit Online: oltre 143 strumenti online gratuiti in 6 lingue, costruiti con Next.js. Privacy al primo posto, nessuna registrazione, 100% gratis.',
  es: 'Conoce ToolKit Online: mas de 143 herramientas online gratuitas en 6 idiomas, creadas con Next.js. Privacidad primero, sin registro, 100% gratis.',
  fr: 'Decouvrez ToolKit Online : plus de 143 outils en ligne gratuits en 6 langues, crees avec Next.js. Confidentialite d\'abord, sans inscription, 100% gratuit.',
  de: 'Erfahren Sie mehr uber ToolKit Online: uber 143 kostenlose Online-Tools in 6 Sprachen, erstellt mit Next.js. Datenschutz zuerst, keine Registrierung, 100% kostenlos.',
  pt: 'Conheca o ToolKit Online: mais de 143 ferramentas online gratuitas em 6 idiomas, criadas com Next.js. Privacidade em primeiro, sem registo, 100% gratis.',
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = (lang as Locale) || 'en';

  return {
    title: metaTitles[locale],
    description: metaDescriptions[locale],
    alternates: {
      canonical: `${BASE_URL}/${locale}/about`,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `${BASE_URL}/${l}/about`])),
        'x-default': `${BASE_URL}/en/about`,
      },
    },
    openGraph: {
      title: metaTitles[locale],
      description: metaDescriptions[locale],
      url: `${BASE_URL}/${locale}/about`,
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

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
