import Link from 'next/link';
import type { Metadata } from 'next';
import { tools, common, locales, getToolsByCategory, type Locale } from '@/lib/translations';
import { BASE_URL } from '@/lib/seo';

const toolsPageMeta: Record<Locale, { title: string; description: string; h1: string; intro: string }> = {
  en: {
    title: 'All Free Online Tools — Calculators, Converters & More',
    description: 'Browse our complete collection of 69+ free online tools. Calculators, converters, text tools, developer utilities and more. No registration required.',
    h1: 'All Free Online Tools',
    intro: 'Browse our complete collection of free online tools. Find the right calculator, converter, or utility for your needs.',
  },
  it: {
    title: 'Tutti gli Strumenti Online Gratuiti — Calcolatori, Convertitori e Altro',
    description: 'Sfoglia la nostra raccolta completa di oltre 69 strumenti online gratuiti. Calcolatori, convertitori, strumenti di testo, utilità per sviluppatori e altro.',
    h1: 'Tutti gli Strumenti Online Gratuiti',
    intro: 'Sfoglia la nostra raccolta completa di strumenti online gratuiti. Trova il calcolatore, convertitore o utilità giusto per le tue esigenze.',
  },
  es: {
    title: 'Todas las Herramientas Online Gratuitas — Calculadoras, Convertidores y Más',
    description: 'Explora nuestra colección completa de más de 69 herramientas online gratuitas. Calculadoras, convertidores, herramientas de texto y más.',
    h1: 'Todas las Herramientas Online Gratuitas',
    intro: 'Explora nuestra colección completa de herramientas online gratuitas. Encuentra la calculadora, convertidor o utilidad adecuada para tus necesidades.',
  },
  fr: {
    title: 'Tous les Outils en Ligne Gratuits — Calculateurs, Convertisseurs et Plus',
    description: 'Parcourez notre collection complète de plus de 69 outils en ligne gratuits. Calculateurs, convertisseurs, outils texte et plus.',
    h1: 'Tous les Outils en Ligne Gratuits',
    intro: 'Parcourez notre collection complète d\'outils en ligne gratuits. Trouvez le calculateur, convertisseur ou utilitaire adapté à vos besoins.',
  },
  de: {
    title: 'Alle Kostenlosen Online-Tools — Rechner, Konverter und Mehr',
    description: 'Durchsuchen Sie unsere komplette Sammlung von über 69 kostenlosen Online-Tools. Rechner, Konverter, Texttools und mehr.',
    h1: 'Alle Kostenlosen Online-Tools',
    intro: 'Durchsuchen Sie unsere komplette Sammlung kostenloser Online-Tools. Finden Sie den richtigen Rechner, Konverter oder das passende Werkzeug.',
  },
  pt: {
    title: 'Todas as Ferramentas Online Gratuitas — Calculadoras, Conversores e Mais',
    description: 'Explore nossa coleção completa de mais de 69 ferramentas online gratuitas. Calculadoras, conversores, ferramentas de texto e mais.',
    h1: 'Todas as Ferramentas Online Gratuitas',
    intro: 'Explore nossa coleção completa de ferramentas online gratuitas. Encontre a calculadora, conversor ou utilitário certo para suas necessidades.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = (lang as Locale) || 'en';
  const meta = toolsPageMeta[locale];

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/tools`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${BASE_URL}/${l}/tools`])
      ),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${locale}/tools`,
      siteName: 'ToolKit Online',
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: meta.title,
      description: meta.description,
    },
  };
}

const categoryIcons: Record<string, string> = {
  finance: '💰',
  text: '📝',
  conversion: '🔄',
  health: '❤️',
  dev: '💻',
  math: '🔢',
  images: '🖼️',
};

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = (lang as Locale) || 'en';
  const t = common[locale];
  const meta = toolsPageMeta[locale];
  const categories = getToolsByCategory();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: meta.title,
    description: meta.description,
    url: `${BASE_URL}/${locale}/tools`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: Object.values(categories)
        .flat()
        .map((slug, index) => {
          const toolData = tools[slug]?.[locale];
          return {
            '@type': 'ListItem',
            position: index + 1,
            name: toolData?.name || slug,
            url: `${BASE_URL}/${locale}/tools/${slug}`,
          };
        }),
    },
  };

  return (
    <div className="max-w-5xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {meta.h1}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {meta.intro}
        </p>
      </div>

      {Object.entries(categories).map(([category, toolSlugs]) => (
        <section key={category} className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>{categoryIcons[category] || '🔧'}</span>
            {t.categories[category] || category}
            <span className="text-sm font-normal text-gray-500">
              ({toolSlugs.length})
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {toolSlugs.map((slug) => {
              const toolData = tools[slug]?.[locale];
              if (!toolData) return null;
              return (
                <Link
                  key={slug}
                  href={`/${locale}/tools/${slug}`}
                  className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
                >
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                    {toolData.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {toolData.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
