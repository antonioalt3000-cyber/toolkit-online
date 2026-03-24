import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/translations';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolkitonline.vip';

const meta: Record<string, { title: string; description: string }> = {
  en: { title: 'Free Image Tools & Editors | ToolKit Online', description: 'Compress, resize, convert, and edit images online for free. No signup required, all processing in your browser.' },
  it: { title: 'Strumenti Immagine Gratuiti | ToolKit Online', description: 'Comprimi, ridimensiona, converti e modifica immagini online gratuitamente. Nessuna registrazione, tutto nel browser.' },
  es: { title: 'Herramientas de Imagen Gratuitas | ToolKit Online', description: 'Comprime, redimensiona, convierte y edita imagenes en linea gratis. Sin registro, todo en tu navegador.' },
  fr: { title: 'Outils Image Gratuits | ToolKit Online', description: 'Compressez, redimensionnez, convertissez et editez des images en ligne gratuitement. Sans inscription.' },
  de: { title: 'Kostenlose Bild-Tools | ToolKit Online', description: 'Komprimieren, skalieren, konvertieren und bearbeiten Sie Bilder kostenlos online. Keine Registrierung erforderlich.' },
  pt: { title: 'Ferramentas de Imagem Gratuitas | ToolKit Online', description: 'Comprima, redimensione, converta e edite imagens online gratuitamente. Sem registro, tudo no navegador.' },
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = (lang as Locale) || 'en';
  const t = meta[locale] || meta.en;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/image-tools`,
      languages: Object.fromEntries(locales.map((l) => [l, `${BASE_URL}/${l}/image-tools`])),
    },
    openGraph: { type: 'website', siteName: 'ToolKit Online', title: t.title, description: t.description, url: `${BASE_URL}/${locale}/image-tools` },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
