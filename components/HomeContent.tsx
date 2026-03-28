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

const categoryIcons: Record<string, React.ReactNode> = {
  finance: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  ),
  text: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  health: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  conversion: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  dev: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  math: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  images: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

const categoryAccent: Record<string, string> = {
  finance: 'text-emerald-400',
  text: 'text-blue-400',
  health: 'text-rose-400',
  conversion: 'text-violet-400',
  dev: 'text-amber-400',
  math: 'text-cyan-400',
  images: 'text-pink-400',
};

const categoryAccentBg: Record<string, string> = {
  finance: 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50',
  text: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50',
  health: 'bg-rose-500/10 border-rose-500/20 hover:border-rose-500/50',
  conversion: 'bg-violet-500/10 border-violet-500/20 hover:border-violet-500/50',
  dev: 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/50',
  math: 'bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/50',
  images: 'bg-pink-500/10 border-pink-500/20 hover:border-pink-500/50',
};

export default function HomeContent({ categories, toolsData, locale, common: t }: HomeContentProps) {
  const [search, setSearch] = useState('');

  const query = search.toLowerCase().trim();

  // Tool of the Day
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
    <div className="text-zinc-100">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 mb-12 overflow-hidden">
        {/* Radial glow background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-blue-300 text-sm font-medium">143+ free tools · No signup required</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05] mb-5">
            {t.heroTitle}
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.siteDescription}
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <label htmlFor="tool-search" className="sr-only">{t.searchPlaceholder}</label>
              <input
                id="tool-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-zinc-900 border border-zinc-700/60 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 text-base transition-all shadow-lg"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
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
                className={`flex items-center gap-1.5 border rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                  categoryAccentBg[catKey] || 'bg-zinc-800 border-zinc-700 hover:border-zinc-500'
                } ${categoryAccent[catKey] || 'text-zinc-300'}`}
              >
                {categoryIcons[catKey]}
                <span>{t.categories[catKey] || catKey}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="relative z-10 mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { value: '143+', label: t.statsTools },
            { value: '6', label: t.statsLanguages },
            { value: '900+', label: 'Pages' },
            { value: '100%', label: t.statsFree },
          ].map(({ value, label }) => (
            <div key={label} className="text-center bg-zinc-900/60 border border-zinc-800/60 backdrop-blur-sm rounded-xl px-4 py-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{value}</div>
              <div className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tool of the Day */}
      {todayTool && !query && (
        <section className="mb-10">
          <a
            href={`/${locale}/tools/${todayToolSlug}`}
            className="group flex items-center gap-4 bg-zinc-900/60 border border-zinc-800 hover:border-yellow-500/30 rounded-xl p-4 transition-all hover:bg-zinc-900"
          >
            <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l2.09 6.26L20.18 9.27l-5.09 3.9L16.18 19.27 12 16l-4.18 3.27 1.09-6.1-5.09-3.9 6.09-1.01z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-yellow-400 font-semibold uppercase tracking-wider mb-0.5">{t.toolOfTheDay}</div>
              <h3 className="font-semibold text-white group-hover:text-yellow-300 transition-colors">{todayTool.name}</h3>
              <p className="text-sm text-zinc-500 truncate">{todayTool.description}</p>
            </div>
            <svg className="w-4 h-4 text-zinc-600 group-hover:text-yellow-400 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </section>
      )}

      {/* Ad */}
      <AdPlaceholder slot="SLOT_HOME_TOP" format="horizontal" className="mb-10" />

      {/* Tool Categories */}
      {filteredCategories.map(([catKey, toolSlugs], index) => (
        <div key={catKey}>
          {index > 0 && index % 2 === 0 && (
            <AdPlaceholder slot="SLOT_HOME_INTERSTITIAL" format="horizontal" className="my-6" />
          )}
          <section id={`cat-${catKey}`} className="mb-14 scroll-mt-20">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${categoryAccentBg[catKey]?.split(' ')[0] || 'bg-zinc-800'}`}>
                <span className={categoryAccent[catKey] || 'text-zinc-400'}>{categoryIcons[catKey]}</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {t.categories[catKey] || catKey}
              </h2>
              <span className="text-xs font-medium bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full border border-zinc-700">
                {toolSlugs.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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

      {/* No results */}
      {filteredCategories.length === 0 && search && (
        <div className="text-center py-20 text-zinc-600">
          <svg className="w-14 h-14 mx-auto mb-4 text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg font-medium text-zinc-500">No tools found for &ldquo;{search}&rdquo;</p>
        </div>
      )}

      {/* Blog Section */}
      {!query && (
        <section className="mt-4 mb-10 pt-10 border-t border-zinc-800/60">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">{t.blogTitle}</h2>
            <a href={`/${locale}/blog`} className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
              {t.blogReadMore} →
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {blogArticles.slice(0, 3).map((article) => {
              const at = article.translations[locale as 'en' | 'it' | 'es' | 'fr' | 'de' | 'pt'];
              if (!at) return null;
              return (
                <a
                  key={article.slug}
                  href={`/${locale}/blog/${article.slug}`}
                  className="group block bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 transition-all hover:bg-zinc-900"
                >
                  <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {article.category}
                  </span>
                  <h3 className="mt-2.5 font-semibold text-zinc-100 group-hover:text-white line-clamp-2 transition-colors">{at.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{at.excerpt}</p>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* About Section */}
      {!query && (
        <section className="mt-4 mb-10 pt-10 border-t border-zinc-800/60">
          <h2 className="text-xl font-bold text-white mb-4">{t.introTitle}</h2>
          <div className="max-w-none text-zinc-400 leading-relaxed space-y-3 text-sm">
            <p>{t.introText1}</p>
            <p>{t.introText2}</p>
            <p>{t.introText3}</p>
          </div>
        </section>
      )}
    </div>
  );
}
