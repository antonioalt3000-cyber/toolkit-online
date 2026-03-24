import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/translations';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolkitonline.vip';

const meta: Record<string, { title: string; description: string }> = {
  en: { title: 'Free Text Tools & Editors Online | ToolKit Online', description: 'Word counter, text case converter, markdown preview, lorem ipsum generator and 20+ free text tools. No signup required.' },
  it: { title: 'Strumenti di Testo Gratuiti Online | ToolKit Online', description: 'Conta parole, convertitore di testo, anteprima markdown, generatore lorem ipsum e oltre 20 strumenti di testo gratuiti.' },
  es: { title: 'Herramientas de Texto Gratuitas Online | ToolKit Online', description: 'Contador de palabras, conversor de texto, vista previa markdown, generador lorem ipsum y mas de 20 herramientas de texto gratuitas.' },
  fr: { title: 'Outils de Texte Gratuits en Ligne | ToolKit Online', description: 'Compteur de mots, convertisseur de casse, apercu markdown, generateur lorem ipsum et plus de 20 outils de texte gratuits.' },
  de: { title: 'Kostenlose Text-Tools Online | ToolKit Online', description: 'Wortzaehler, Text-Konverter, Markdown-Vorschau, Lorem-Ipsum-Generator und ueber 20 kostenlose Text-Tools.' },
  pt: { title: 'Ferramentas de Texto Gratuitas Online | ToolKit Online', description: 'Contador de palavras, conversor de texto, visualizacao markdown, gerador lorem ipsum e mais de 20 ferramentas de texto gratuitas.' },
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = (lang as Locale) || 'en';
  const t = meta[locale] || meta.en;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/text-tools`,
      languages: Object.fromEntries(locales.map((l) => [l, `${BASE_URL}/${l}/text-tools`])),
    },
    openGraph: { type: 'website', siteName: 'ToolKit Online', title: t.title, description: t.description, url: `${BASE_URL}/${locale}/text-tools` },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
