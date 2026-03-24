import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/translations';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolkitonline.vip';

const meta: Record<string, { title: string; description: string }> = {
  en: { title: 'Free Finance Calculators & Tools | ToolKit Online', description: 'Calculate loans, mortgages, investments, taxes, insurance and more with our free online finance tools. No signup required.' },
  it: { title: 'Calcolatori Finanziari Gratuiti | ToolKit Online', description: 'Calcola prestiti, mutui, investimenti, tasse e assicurazioni con i nostri strumenti finanziari gratuiti online.' },
  es: { title: 'Calculadoras Financieras Gratuitas | ToolKit Online', description: 'Calcula prestamos, hipotecas, inversiones, impuestos y seguros con nuestras herramientas financieras gratuitas.' },
  fr: { title: 'Calculatrices Financieres Gratuites | ToolKit Online', description: 'Calculez prets, hypotheques, investissements, impots et assurances avec nos outils financiers gratuits en ligne.' },
  de: { title: 'Kostenlose Finanzrechner & Tools | ToolKit Online', description: 'Berechnen Sie Kredite, Hypotheken, Investitionen, Steuern und Versicherungen mit unseren kostenlosen Online-Finanztools.' },
  pt: { title: 'Calculadoras Financeiras Gratuitas | ToolKit Online', description: 'Calcule emprestimos, hipotecas, investimentos, impostos e seguros com nossas ferramentas financeiras gratuitas online.' },
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = (lang as Locale) || 'en';
  const t = meta[locale] || meta.en;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/finance-tools`,
      languages: Object.fromEntries(locales.map((l) => [l, `${BASE_URL}/${l}/finance-tools`])),
    },
    openGraph: { type: 'website', siteName: 'ToolKit Online', title: t.title, description: t.description, url: `${BASE_URL}/${locale}/finance-tools` },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
