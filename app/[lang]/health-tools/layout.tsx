import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/translations';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolkitonline.vip';

const meta: Record<string, { title: string; description: string }> = {
  en: { title: 'Free Health & Fitness Calculators | ToolKit Online', description: 'BMI calculator, calorie counter, body fat calculator, sleep calculator and 15+ free health tools. No signup required.' },
  it: { title: 'Calcolatori Salute e Fitness Gratuiti | ToolKit Online', description: 'Calcolatore BMI, contatore calorie, calcolatore grasso corporeo, calcolatore sonno e oltre 15 strumenti salute gratuiti.' },
  es: { title: 'Calculadoras de Salud y Fitness Gratuitas | ToolKit Online', description: 'Calculadora de IMC, contador de calorias, calculadora de grasa corporal, calculadora de sueno y mas de 15 herramientas de salud gratuitas.' },
  fr: { title: 'Calculatrices Sante et Fitness Gratuites | ToolKit Online', description: 'Calculatrice IMC, compteur de calories, calculatrice de graisse corporelle, calculatrice de sommeil et plus de 15 outils sante gratuits.' },
  de: { title: 'Kostenlose Gesundheits- & Fitness-Rechner | ToolKit Online', description: 'BMI-Rechner, Kalorienzaehler, Koerperfettrechner, Schlafrechner und ueber 15 kostenlose Gesundheitstools.' },
  pt: { title: 'Calculadoras de Saude e Fitness Gratuitas | ToolKit Online', description: 'Calculadora de IMC, contador de calorias, calculadora de gordura corporal, calculadora de sono e mais de 15 ferramentas de saude gratuitas.' },
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = (lang as Locale) || 'en';
  const t = meta[locale] || meta.en;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/health-tools`,
      languages: Object.fromEntries(locales.map((l) => [l, `${BASE_URL}/${l}/health-tools`])),
    },
    openGraph: { type: 'website', siteName: 'ToolKit Online', title: t.title, description: t.description, url: `${BASE_URL}/${locale}/health-tools` },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
