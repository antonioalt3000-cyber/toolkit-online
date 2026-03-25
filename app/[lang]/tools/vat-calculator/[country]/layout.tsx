import type { Metadata } from 'next';
import { locales } from '@/lib/translations';
import { BASE_URL } from '@/lib/seo';

const COUNTRIES = ['spain', 'germany', 'france', 'italy', 'uk', 'netherlands', 'belgium', 'portugal', 'austria', 'sweden'] as const;

const countryMeta: Record<string, { rate: number; nameEN: string; names: Record<string, string>; vatTerm: Record<string, string> }> = {
  spain: { rate: 21, nameEN: 'Spain', names: { en: 'Spain', it: 'Spagna', es: 'España', fr: 'Espagne', de: 'Spanien', pt: 'Espanha' }, vatTerm: { en: 'VAT', it: 'IVA', es: 'IVA', fr: 'TVA', de: 'MwSt', pt: 'IVA' } },
  germany: { rate: 19, nameEN: 'Germany', names: { en: 'Germany', it: 'Germania', es: 'Alemania', fr: 'Allemagne', de: 'Deutschland', pt: 'Alemanha' }, vatTerm: { en: 'VAT', it: 'IVA', es: 'IVA', fr: 'TVA', de: 'MwSt', pt: 'IVA' } },
  france: { rate: 20, nameEN: 'France', names: { en: 'France', it: 'Francia', es: 'Francia', fr: 'France', de: 'Frankreich', pt: 'França' }, vatTerm: { en: 'VAT', it: 'IVA', es: 'IVA', fr: 'TVA', de: 'MwSt', pt: 'IVA' } },
  italy: { rate: 22, nameEN: 'Italy', names: { en: 'Italy', it: 'Italia', es: 'Italia', fr: 'Italie', de: 'Italien', pt: 'Itália' }, vatTerm: { en: 'VAT', it: 'IVA', es: 'IVA', fr: 'TVA', de: 'MwSt', pt: 'IVA' } },
  uk: { rate: 20, nameEN: 'United Kingdom', names: { en: 'United Kingdom', it: 'Regno Unito', es: 'Reino Unido', fr: 'Royaume-Uni', de: 'Vereinigtes Königreich', pt: 'Reino Unido' }, vatTerm: { en: 'VAT', it: 'IVA', es: 'IVA', fr: 'TVA', de: 'MwSt', pt: 'IVA' } },
  netherlands: { rate: 21, nameEN: 'Netherlands', names: { en: 'Netherlands', it: 'Paesi Bassi', es: 'Países Bajos', fr: 'Pays-Bas', de: 'Niederlande', pt: 'Países Baixos' }, vatTerm: { en: 'VAT', it: 'IVA', es: 'IVA', fr: 'TVA', de: 'MwSt', pt: 'IVA' } },
  belgium: { rate: 21, nameEN: 'Belgium', names: { en: 'Belgium', it: 'Belgio', es: 'Bélgica', fr: 'Belgique', de: 'Belgien', pt: 'Bélgica' }, vatTerm: { en: 'VAT', it: 'IVA', es: 'IVA', fr: 'TVA', de: 'MwSt', pt: 'IVA' } },
  portugal: { rate: 23, nameEN: 'Portugal', names: { en: 'Portugal', it: 'Portogallo', es: 'Portugal', fr: 'Portugal', de: 'Portugal', pt: 'Portugal' }, vatTerm: { en: 'VAT', it: 'IVA', es: 'IVA', fr: 'TVA', de: 'MwSt', pt: 'IVA' } },
  austria: { rate: 20, nameEN: 'Austria', names: { en: 'Austria', it: 'Austria', es: 'Austria', fr: 'Autriche', de: 'Österreich', pt: 'Áustria' }, vatTerm: { en: 'VAT', it: 'IVA', es: 'IVA', fr: 'TVA', de: 'MwSt', pt: 'IVA' } },
  sweden: { rate: 25, nameEN: 'Sweden', names: { en: 'Sweden', it: 'Svezia', es: 'Suecia', fr: 'Suède', de: 'Schweden', pt: 'Suécia' }, vatTerm: { en: 'VAT', it: 'IVA', es: 'IVA', fr: 'TVA', de: 'MwSt', pt: 'IVA' } },
};

export function generateStaticParams() {
  const params: { lang: string; country: string }[] = [];
  for (const lang of locales) {
    for (const country of COUNTRIES) {
      params.push({ lang, country });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; country: string }>;
}): Promise<Metadata> {
  const { lang, country } = await params;
  const meta = countryMeta[country];
  if (!meta) return {};

  const countryName = meta.names[lang] || meta.nameEN;
  const vat = meta.vatTerm[lang] || 'VAT';
  const canonicalUrl = `${BASE_URL}/${lang}/tools/vat-calculator/${country}`;

  const titles: Record<string, string> = {
    en: `${vat} Calculator for ${countryName} (${meta.rate}%) — Calculate VAT Online | ToolKit Online`,
    it: `Calcolo ${vat} ${countryName} (${meta.rate}%) — Calcolatore ${vat} Online | ToolKit Online`,
    es: `Calculadora de ${vat} ${countryName} (${meta.rate}%) — Calcular ${vat} Online | ToolKit Online`,
    fr: `Calculateur ${vat} ${countryName} (${meta.rate}%) — Calculer la ${vat} en Ligne | ToolKit Online`,
    de: `${vat}-Rechner ${countryName} (${meta.rate}%) — ${vat} Online Berechnen | ToolKit Online`,
    pt: `Calculadora de ${vat} ${countryName} (${meta.rate}%) — Calcular ${vat} Online | ToolKit Online`,
  };

  const descriptions: Record<string, string> = {
    en: `Free ${vat} calculator for ${countryName}. Calculate VAT at ${meta.rate}% standard rate plus reduced rates. Add or remove VAT instantly.`,
    it: `Calcolatore ${vat} gratuito per ${countryName}. Calcola l'${vat} al ${meta.rate}% e aliquote ridotte. Aggiungi o scorporo ${vat} istantaneamente.`,
    es: `Calculadora de ${vat} gratuita para ${countryName}. Calcula el ${vat} al ${meta.rate}% y tipos reducidos. Añade o quita ${vat} al instante.`,
    fr: `Calculateur ${vat} gratuit pour ${countryName}. Calculez la ${vat} à ${meta.rate}% et taux réduits. Ajoutez ou retirez la ${vat} instantanément.`,
    de: `Kostenloser ${vat}-Rechner für ${countryName}. Berechnen Sie die ${vat} mit ${meta.rate}% und ermäßigten Sätzen. ${vat} sofort hinzufügen oder entfernen.`,
    pt: `Calculadora de ${vat} gratuita para ${countryName}. Calcule o ${vat} a ${meta.rate}% e taxas reduzidas. Adicione ou remova ${vat} instantaneamente.`,
  };

  const title = titles[lang] || titles.en;
  const description = descriptions[lang] || descriptions.en;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}/tools/vat-calculator/${country}`])
        ),
        'x-default': `${BASE_URL}/en/tools/vat-calculator/${country}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'ToolKit Online',
      locale: lang,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function CountryVatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
