'use client';

import { useState } from 'react';
import ToolCard from '@/components/ToolCard';
import AdPlaceholder from '@/components/AdPlaceholder';
import { blogArticles } from '@/lib/blog';

type ToolData = {
  name: string;
  description: string;
};

type CommonData = {
  siteDescription: string;
  heroTitle: string;
  statsTools: string;
  statsLanguages: string;
  statsFree: string;
  searchPlaceholder: string;
  categories: Record<string, string>;
  toolOfTheDay: string;
  introTitle: string;
  introText1: string;
  introText2: string;
  introText3: string;
  blogTitle: string;
  blogReadMore: string;
};

interface HomeContentProps {
  categories: Record<string, string[]>;
  toolsData: Record<string, ToolData>;
  locale: string;
  common: CommonData;
}

export default function HomeContent({ categories, toolsData, locale, common: t }: HomeContentProps) {
  const [search, setSearch] = useState('');

  const query = search.toLowerCase().trim();

  // Tool of the Day — deterministic based on day of year
  const allToolSlugs = Object.values(categories).flat();
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const todayToolSlug = allToolSlugs[dayOfYear % allToolSlugs.length];
  const todayTool = toolsData[todayToolSlug];

  const filteredCategories = Object.entries(categories)
    .map(([catKey, toolSlugs]) => {
      const filtered = toolSlugs.filter((slug) => {
        if (!query) return true;
        const tool = toolsData[slug];
        if (!tool) return false;
        return (
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query)
        );
      });
      return [catKey, filtered] as [string, string[]];
    })
    .filter(([, slugs]) => slugs.length > 0);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white px-6 py-14 mb-10 overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
            {t.heroTitle}
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t.siteDescription}
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-base"
              />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative z-10 mt-10 flex flex-wrap justify-center gap-6 sm:gap-12">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="font-semibold text-blue-100">{t.statsTools}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-blue-100">{t.statsLanguages}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-blue-100">{t.statsFree}</span>
          </div>
        </div>
      </section>

      {/* Tool of the Day */}
      {todayTool && !query && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l2.09 6.26L20.18 9.27l-5.09 3.9L16.18 19.27 12 16l-4.18 3.27 1.09-6.1-5.09-3.9 6.09-1.01z" />
            </svg>
            {t.toolOfTheDay}
          </h2>
          <a
            href={`/${locale}/tools/${todayToolSlug}`}
            className="block rounded-xl p-[2px] bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 hover:shadow-lg transition-shadow"
          >
            <div className="bg-white rounded-[10px] p-5 flex items-center gap-4">
              <div className="shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l2.09 6.26L20.18 9.27l-5.09 3.9L16.18 19.27 12 16l-4.18 3.27 1.09-6.1-5.09-3.9 6.09-1.01z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{todayTool.name}</h3>
                <p className="text-sm text-gray-500">{todayTool.description}</p>
              </div>
            </div>
          </a>
        </section>
      )}

      {/* Ad: between hero and categories */}
      <AdPlaceholder
        slot="SLOT_HOME_TOP"
        format="horizontal"
        className="mb-10"
      />

      {/* Tool Categories with interstitial ads every 2 categories */}
      {filteredCategories.map(([catKey, toolSlugs], index) => (
        <div key={catKey}>
          {index > 0 && index % 2 === 0 && (
            <AdPlaceholder
              slot="SLOT_HOME_INTERSTITIAL"
              format="horizontal"
              className="my-6"
            />
          )}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {t.categories[catKey] || catKey}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {toolSlugs.map((slug) => {
                const tool = toolsData[slug];
                if (!tool) return null;
                return (
                  <ToolCard
                    key={slug}
                    slug={slug}
                    name={tool.name}
                    description={tool.description}
                    lang={locale}
                    category={catKey}
                  />
                );
              })}
            </div>
          </section>
        </div>
      ))}

      {filteredCategories.length === 0 && search && (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg">No tools found for &ldquo;{search}&rdquo;</p>
        </div>
      )}

      {/* Latest from Blog */}
      {!query && (
        <section className="mt-12 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{t.blogTitle}</h2>
            <a href={`/${locale}/blog`} className="text-sm font-semibold text-blue-600 hover:underline">{t.blogReadMore} →</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {blogArticles.slice(0, 3).map((article) => {
              const at = article.translations[locale as 'en' | 'it' | 'es' | 'fr' | 'de' | 'pt'];
              if (!at) return null;
              return (
                <a key={article.slug} href={`/${locale}/blog/${article.slug}`} className="block border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{article.category}</span>
                  <h3 className="mt-2 font-bold text-gray-900 line-clamp-2">{at.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{at.excerpt}</p>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* About Section - Editorial Content for SEO */}
      {!query && (
        <section className="mt-16 mb-8 bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.introTitle}</h2>
          <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-4">
            <p>{t.introText1}</p>
            <p>{t.introText2}</p>
            <p>{t.introText3}</p>
          </div>
        </section>
      )}
    </div>
  );
}
