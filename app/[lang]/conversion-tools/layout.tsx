import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/translations';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolkitonline.vip';

const meta: Record<string, { title: string; description: string }> = {
  en: { title: 'Free Online Converters & Conversion Tools | ToolKit Online', description: 'Unit converter, Base64 converter, time zone converter, CSV to JSON, PDF tools and 15+ free conversion tools online.' },
  it: { title: 'Convertitori Online Gratuiti | ToolKit Online', description: 'Convertitore unita, convertitore Base64, convertitore fuso orario, CSV in JSON, strumenti PDF e oltre 15 strumenti di conversione gratuiti.' },
  es: { title: 'Conversores Online Gratuitos | ToolKit Online', description: 'Conversor de unidades, conversor Base64, conversor de zona horaria, CSV a JSON, herramientas PDF y mas de 15 herramientas de conversion gratuitas.' },
  fr: { title: 'Convertisseurs en Ligne Gratuits | ToolKit Online', description: 'Convertisseur d unites, convertisseur Base64, convertisseur de fuseau horaire, CSV vers JSON, outils PDF et plus de 15 outils de conversion gratuits.' },
  de: { title: 'Kostenlose Online-Umrechner & Konvertierungstools | ToolKit Online', description: 'Einheitenumrechner, Base64-Konverter, Zeitzonen-Umrechner, CSV zu JSON, PDF-Tools und ueber 15 kostenlose Konvertierungstools.' },
  pt: { title: 'Conversores Online Gratuitos | ToolKit Online', description: 'Conversor de unidades, conversor Base64, conversor de fuso horario, CSV para JSON, ferramentas PDF e mais de 15 ferramentas de conversao gratuitas.' },
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = (lang as Locale) || 'en';
  const t = meta[locale] || meta.en;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/conversion-tools`,
      languages: Object.fromEntries(locales.map((l) => [l, `${BASE_URL}/${l}/conversion-tools`])),
    },
    openGraph: { type: 'website', siteName: 'ToolKit Online', title: t.title, description: t.description, url: `${BASE_URL}/${locale}/conversion-tools` },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
