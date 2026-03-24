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

const categoryIcons: Record<string, string> = {
  finance: '💰',
  text: '📝',
  health: '❤️',
  conversion: '🔄',
  dev: '💻',
  math: '🔢',
  images: '🖼️',
};

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
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl text-white px-6 py-16 mb-10 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-300 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-5 tracking-tight leading-tight">
            {t.heroTitle}
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.siteDescription}
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative group">
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
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 bg-white shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300/50 text-base transition-shadow"
              />
            </div>
          </div>

          {/* Category Quick Nav */}
          <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
            {Object.entries(categories).map(([catKey]) => (
              <a
                key={catKey}
                href={`#cat-${catKey}`}
                onClick={(e) => {
                  e.preventDefault();
                  setSearch('');
                  const el = document.getElementById(`cat-${catKey}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-white transition-colors"
              >
                <span>{categoryIcons[catKey] || '🔧'}</span>
                <span>{t.categories[catKey] || catKey}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative z-10 mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">143+</div>
            <div className="text-xs sm:text-sm text-blue-200 font-medium mt-0.5">{t.statsTools}</div>
          </div>
          <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">6</div>
            <div className="text-xs sm:text-sm text-blue-200 font-medium mt-0.5">{t.statsLanguages}</div>
          </div>
          <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">900+</div>
            <div className="text-xs sm:text-sm text-blue-200 font-medium mt-0.5">Pages</div>
          </div>
          <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
            <div className="text-xs sm:text-sm text-blue-200 font-medium mt-0.5">{t.statsFree}</div>
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
            className="block rounded-xl p-[2px] bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            <div className="bg-white rounded-[10px] p-5 flex items-center gap-4">
              <div className="shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l2.09 6.26L20.18 9.27l-5.09 3.9L16.18 19.27 12 16l-4.18 3.27 1.09-6.1-5.09-3.9 6.09-1.01z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{todayTool.name}</h3>
                <p className="text-sm text-gray-500">{todayTool.description}</p>
              </div>
              <svg className="w-5 h-5 text-gray-300 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
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
          <section id={`cat-${catKey}`} className="mb-12 scroll-mt-4">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">{categoryIcons[catKey] || '🔧'}</span>
              <h2 className="text-2xl font-bold text-gray-800">
                {t.categories[catKey] || catKey}
              </h2>
              <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                {toolSlugs.length}
              </span>
            </div>
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
        <div className="text-center py-16 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg font-medium">No tools found for &ldquo;{search}&rdquo;</p>
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
