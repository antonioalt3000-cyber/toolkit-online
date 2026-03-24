import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/translations';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolkitonline.vip';

const meta: Record<string, { title: string; description: string }> = {
  en: { title: 'Free Math Calculators & Tools Online | ToolKit Online', description: 'Scientific calculator, age calculator, fraction calculator, GPA calculator and 20+ free math tools online. No signup required.' },
  it: { title: 'Calcolatori Matematici Gratuiti Online | ToolKit Online', description: 'Calcolatrice scientifica, calcolatore eta, calcolatore frazioni, calcolatore GPA e oltre 20 strumenti matematici gratuiti.' },
  es: { title: 'Calculadoras Matematicas Gratuitas Online | ToolKit Online', description: 'Calculadora cientifica, calculadora de edad, calculadora de fracciones, calculadora GPA y mas de 20 herramientas matematicas gratuitas.' },
  fr: { title: 'Calculatrices Mathematiques Gratuites | ToolKit Online', description: 'Calculatrice scientifique, calculateur d age, calculateur de fractions, calculateur GPA et plus de 20 outils mathematiques gratuits.' },
  de: { title: 'Kostenlose Mathe-Rechner Online | ToolKit Online', description: 'Wissenschaftlicher Taschenrechner, Altersrechner, Bruchrechner, GPA-Rechner und ueber 20 kostenlose Mathe-Tools.' },
  pt: { title: 'Calculadoras Matematicas Gratuitas Online | ToolKit Online', description: 'Calculadora cientifica, calculadora de idade, calculadora de fracoes, calculadora GPA e mais de 20 ferramentas matematicas gratuitas.' },
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = (lang as Locale) || 'en';
  const t = meta[locale] || meta.en;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/math-tools`,
      languages: Object.fromEntries(locales.map((l) => [l, `${BASE_URL}/${l}/math-tools`])),
    },
    openGraph: { type: 'website', siteName: 'ToolKit Online', title: t.title, description: t.description, url: `${BASE_URL}/${locale}/math-tools` },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
