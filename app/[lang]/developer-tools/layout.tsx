import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/translations';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolkitonline.vip';

const meta: Record<string, { title: string; description: string }> = {
  en: { title: 'Free Developer Tools Online | ToolKit Online', description: 'JSON formatter, regex tester, color picker, QR code generator, password generator and 25+ free developer tools. No signup required.' },
  it: { title: 'Strumenti per Sviluppatori Gratuiti Online | ToolKit Online', description: 'Formattatore JSON, tester regex, selettore colori, generatore QR code, generatore password e oltre 25 strumenti sviluppatore gratuiti.' },
  es: { title: 'Herramientas para Desarrolladores Gratuitas | ToolKit Online', description: 'Formateador JSON, probador regex, selector de colores, generador QR, generador de contrasenas y mas de 25 herramientas para desarrolladores gratuitas.' },
  fr: { title: 'Outils Developpeur Gratuits en Ligne | ToolKit Online', description: 'Formateur JSON, testeur regex, selecteur de couleurs, generateur QR, generateur de mots de passe et plus de 25 outils developpeur gratuits.' },
  de: { title: 'Kostenlose Entwickler-Tools Online | ToolKit Online', description: 'JSON-Formatierer, Regex-Tester, Farbwaehler, QR-Code-Generator, Passwort-Generator und ueber 25 kostenlose Entwickler-Tools.' },
  pt: { title: 'Ferramentas para Desenvolvedores Gratuitas | ToolKit Online', description: 'Formatador JSON, testador regex, seletor de cores, gerador QR code, gerador de senhas e mais de 25 ferramentas para desenvolvedores gratuitas.' },
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = (lang as Locale) || 'en';
  const t = meta[locale] || meta.en;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/developer-tools`,
      languages: Object.fromEntries(locales.map((l) => [l, `${BASE_URL}/${l}/developer-tools`])),
    },
    openGraph: { type: 'website', siteName: 'ToolKit Online', title: t.title, description: t.description, url: `${BASE_URL}/${locale}/developer-tools` },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
