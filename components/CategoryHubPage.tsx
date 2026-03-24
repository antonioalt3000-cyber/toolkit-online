'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { tools, type Locale, common } from '@/lib/translations';

type CategoryKey = 'finance' | 'text' | 'health' | 'conversion' | 'dev' | 'math' | 'images';

interface CategoryHubConfig {
  categoryKey: CategoryKey;
  slug: string;
  toolSlugs: string[];
  otherCategories: { key: CategoryKey; slug: string }[];
  translations: Record<string, {
    title: string;
    metaTitle: string;
    description: string;
    article: string;
    toolsHeading: string;
    exploreOther: string;
  }>;
}

export default function CategoryHubPage({ config }: { config: CategoryHubConfig }) {
  const params = useParams();
  const lang = (params.lang as Locale) || 'en';
  const t = config.translations[lang] || config.translations.en;
  const c = common[lang] || common.en;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl text-white px-6 py-12 mb-10 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">{t.description}</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
            <span className="font-semibold">{config.toolSlugs.length}</span>
            <span>{lang === 'en' ? 'free tools' : lang === 'it' ? 'strumenti gratuiti' : lang === 'es' ? 'herramientas gratis' : lang === 'fr' ? 'outils gratuits' : lang === 'de' ? 'kostenlose Tools' : 'ferramentas gratis'}</span>
          </div>
        </div>
      </section>

      {/* Pillar Article */}
      <section className="prose prose-lg max-w-none mb-12 px-2">
        <div dangerouslySetInnerHTML={{ __html: t.article }} />
      </section>

      {/* Tools Grid */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.toolsHeading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {config.toolSlugs.map((slug) => {
            const toolT = tools[slug]?.[lang] || tools[slug]?.en;
            if (!toolT) return null;
            return (
              <Link
                key={slug}
                href={`/${lang}/tools/${slug}`}
                className="group flex flex-col p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                  {toolT.name}
                </h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{toolT.description}</p>
                <span className="mt-3 text-xs text-blue-600 font-medium group-hover:underline self-start">
                  {lang === 'en' ? 'Use tool' : lang === 'it' ? 'Usa strumento' : lang === 'es' ? 'Usar herramienta' : lang === 'fr' ? 'Utiliser' : lang === 'de' ? 'Tool nutzen' : 'Usar ferramenta'} &rarr;
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Cross-links to other categories */}
      <section className="mb-12 bg-gray-50 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t.exploreOther}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {config.otherCategories.map(({ key, slug }) => (
            <Link
              key={key}
              href={`/${lang}/${slug}`}
              className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <span>{c.categories[key] || key}</span>
              <svg className="w-4 h-4 ml-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* Back to Home */}
      <div className="text-center mb-8">
        <Link
          href={`/${lang}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {lang === 'en' ? 'Back to all tools' : lang === 'it' ? 'Torna a tutti gli strumenti' : lang === 'es' ? 'Volver a todas las herramientas' : lang === 'fr' ? 'Retour aux outils' : lang === 'de' ? 'Zurück zu allen Tools' : 'Voltar para todas as ferramentas'}
        </Link>
      </div>
    </div>
  );
}
