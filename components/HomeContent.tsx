'use client';

import { useState, useRef } from 'react';
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

const categoryIconsLg: Record<string, React.ReactNode> = {
  finance: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  ),
  text: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  health: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  conversion: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  dev: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  math: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  images: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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

const bentoAccent: Record<string, { border: string; bg: string; text: string }> = {
  finance: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  dev: { border: 'border-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  text: { border: 'border-blue-500/20', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  health: { border: 'border-rose-500/20', bg: 'bg-rose-500/10', text: 'text-rose-400' },
  conversion: { border: 'border-violet-500/20', bg: 'bg-violet-500/10', text: 'text-violet-400' },
  math: { border: 'border-cyan-500/20', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  images: { border: 'border-pink-500/20', bg: 'bg-pink-500/10', text: 'text-pink-400' },
};

// Top 3 categories for medium bento cards
const TOP_CATEGORIES = ['finance', 'dev', 'text'] as const;

export default function HomeContent({ categories, toolsData, locale, common: t }: HomeContentProps) {
  const [search, setSearch] = useState('');
  const carouselRef = useRef<HTMLDivElement>(null);

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

  // Remaining categories for small bento cards (exclude top 3)
  const smallCategories = Object.keys(categories).filter(
    (k) => !TOP_CATEGORIES.includes(k as typeof TOP_CATEGORIES[number])
  );

  // Popular tools for carousel (pick first 2 from each category)
  const popularTools: { slug: string; name: string; description: string; category: string }[] = [];
  for (const [catKey, slugs] of Object.entries(categories)) {
    for (const slug of slugs.slice(0, 2)) {
      const tool = toolsData[slug];
      if (tool) {
        popularTools.push({ slug, name: tool.name, description: tool.description, category: catKey });
      }
    }
  }

  function scrollCarousel(direction: 'left' | 'right'): void {
    if (!carouselRef.current) return;
    const amount = 300;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }

  return (
    <div className="text-zinc-100">
      {/* ===== HERO — Aurora gradient mesh ===== */}
      <section className="relative pt-16 pb-20 mb-12 overflow-hidden bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.1),transparent_50%)]">
        {/* Secondary glow orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-violet-600/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-blue-300 text-sm font-medium">143+ free tools &middot; No signup required</span>
          </div>

          {/* Gradient headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-5 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Your Free Digital Toolkit
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            143+ professional tools, zero cost, zero signup.
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
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-zinc-900/80 border border-zinc-700/60 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 text-base transition-all shadow-lg backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Social proof counter */}
          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-zinc-500">
            <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            <span>Used by 50,000+ people in 180+ countries</span>
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
            <div key={label} className="text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{value}</div>
              <div className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BENTO GRID — Asymmetric layout (no search active) ===== */}
      {!query && todayTool && (
        <section className="mb-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Large card — Tool of the Day (span 2 cols + 2 rows) */}
            <a
              href={`/${locale}/tools/${todayToolSlug}`}
              className="group lg:col-span-2 lg:row-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between transition-all hover:border-yellow-500/30 hover:bg-white/[0.07] min-h-[280px]"
            >
              <div>
                <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 py-1 mb-4">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l2.09 6.26L20.18 9.27l-5.09 3.9L16.18 19.27 12 16l-4.18 3.27 1.09-6.1-5.09-3.9 6.09-1.01z" />
                  </svg>
                  <span className="text-yellow-300 text-xs font-semibold uppercase tracking-wider">{t.toolOfTheDay}</span>
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-yellow-300 transition-colors mb-2">
                  {todayTool.name}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">{todayTool.description}</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm text-yellow-400 group-hover:text-yellow-300 transition-colors">
                <span>Try now</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </a>

            {/* Three medium cards — top categories */}
            {TOP_CATEGORIES.map((catKey) => {
              const slugs = categories[catKey] || [];
              const accent = bentoAccent[catKey] || bentoAccent.finance;
              const topToolNames = slugs
                .slice(0, 3)
                .map((s) => toolsData[s]?.name)
                .filter(Boolean);
              return (
                <a
                  key={catKey}
                  href={`#cat-${catKey}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSearch('');
                    const el = document.getElementById(`cat-${catKey}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 transition-all hover:bg-white/[0.07] hover:${accent.border}`}
                >
                  <div className={`w-10 h-10 rounded-xl ${accent.bg} flex items-center justify-center mb-3`}>
                    <span className={accent.text}>{categoryIconsLg[catKey]}</span>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">{t.categories[catKey] || catKey}</h3>
                  <span className="text-xs text-zinc-500 font-medium">{slugs.length} tools</span>
                  <ul className="mt-2.5 space-y-1">
                    {topToolNames.map((name) => (
                      <li key={name} className="text-xs text-zinc-400 flex items-center gap-1.5">
                        <span className={`w-1 h-1 rounded-full ${accent.bg}`} />
                        {name}
                      </li>
                    ))}
                  </ul>
                </a>
              );
            })}

            {/* Four small cards — remaining categories */}
            {smallCategories.slice(0, 4).map((catKey) => {
              const slugs = categories[catKey] || [];
              const accent = bentoAccent[catKey] || bentoAccent.finance;
              return (
                <a
                  key={catKey}
                  href={`#cat-${catKey}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSearch('');
                    const el = document.getElementById(`cat-${catKey}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/[0.07] flex items-center gap-3"
                >
                  <div className={`w-9 h-9 rounded-lg ${accent.bg} flex items-center justify-center shrink-0`}>
                    <span className={accent.text}>{categoryIcons[catKey]}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{t.categories[catKey] || catKey}</h3>
                    <span className="text-xs text-zinc-500">{slugs.length} tools</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== SOCIAL PROOF BAR ===== */}
      {!query && (
        <section className="mb-14">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-sm font-medium text-zinc-400 shrink-0">Trusted by teams worldwide</p>
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-20 h-7 bg-zinc-700/40 rounded"
                  aria-hidden="true"
                />
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-zinc-300 font-medium">4.9/5</span>
              <span className="text-xs text-zinc-500">from 2,000+ reviews</span>
            </div>
          </div>
        </section>
      )}

      {/* ===== HOW IT WORKS ===== */}
      {!query && (
        <section className="mb-14">
          <h2 className="text-xl font-bold text-white text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
            {/* Dotted connectors (visible on sm+) */}
            <div className="hidden sm:block absolute top-1/2 left-[calc(33.33%-8px)] w-[calc(33.33%+16px)] border-t-2 border-dashed border-zinc-700/50 -translate-y-1/2 z-0" style={{ left: '20%', width: '60%' }} />

            {[
              {
                step: '1',
                title: 'Search',
                desc: 'Find your tool',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
              },
              {
                step: '2',
                title: 'Use',
                desc: 'Get instant results',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                step: '3',
                title: 'Done',
                desc: 'Copy, save or export',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4 text-blue-400">
                  {icon}
                </div>
                <div className="text-xs text-blue-400 font-semibold mb-1">Step {step}</div>
                <h3 className="text-base font-bold text-white mb-1">{title}</h3>
                <p className="text-sm text-zinc-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== POPULAR TOOLS — Horizontal scroll carousel ===== */}
      {!query && (
        <section className="mb-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">Popular Tools</h2>
            <div className="flex gap-2">
              <button
                onClick={() => scrollCarousel('left')}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Scroll left"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Scroll right"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div
            ref={carouselRef}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {popularTools.map(({ slug, name, description, category }) => {
              const accent = bentoAccent[category] || bentoAccent.finance;
              return (
                <a
                  key={slug}
                  href={`/${locale}/tools/${slug}`}
                  className={`group shrink-0 w-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/[0.07] border-l-2 ${accent.border}`}
                >
                  <h3 className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors mb-1">{name}</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-3">{description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${accent.text}`}>{t.categories[category] || category}</span>
                    <svg className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Ad */}
      <AdPlaceholder slot="SLOT_HOME_TOP" format="horizontal" className="mb-10" />

      {/* ===== TOOL CATEGORIES — Full grid (always shown) ===== */}
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
                  className="group block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 transition-all hover:bg-white/[0.07]"
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
