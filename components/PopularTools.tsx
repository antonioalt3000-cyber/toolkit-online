'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { tools, common, getToolsByCategory, type Locale } from '@/lib/translations';

const popularSlugs = [
  'percentage-calculator',
  'bmi-calculator',
  'password-generator',
  'unit-converter',
  'json-formatter',
  'loan-calculator',
  'qr-code-generator',
  'word-counter',
];

const sectionLabels: Record<string, string> = {
  en: 'Most Popular Tools',
  it: 'Strumenti più popolari',
  es: 'Herramientas más populares',
  fr: 'Outils les plus populaires',
  de: 'Beliebteste Tools',
  pt: 'Ferramentas mais populares',
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  finance: { bg: 'bg-green-50', text: 'text-green-700' },
  text: { bg: 'bg-blue-50', text: 'text-blue-700' },
  health: { bg: 'bg-red-50', text: 'text-red-700' },
  conversion: { bg: 'bg-purple-50', text: 'text-purple-700' },
  dev: { bg: 'bg-gray-100', text: 'text-gray-700' },
  math: { bg: 'bg-orange-50', text: 'text-orange-700' },
  images: { bg: 'bg-pink-50', text: 'text-pink-700' },
};

export default function PopularTools({ currentSlug }: { currentSlug: string }) {
  const params = useParams();
  const lang = (params?.lang as Locale) || 'en';
  const t = common[lang];
  const categories = getToolsByCategory();

  // Exclude current tool from popular list
  const filtered = popularSlugs.filter((s) => s !== currentSlug);

  function getCategoryForSlug(slug: string): string {
    for (const [cat, slugs] of Object.entries(categories)) {
      if (slugs.includes(slug)) return cat;
    }
    return '';
  }

  return (
    <section className="mt-10 pt-8 border-t border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l2.09 6.26L20.18 9.27l-5.09 3.9L16.18 19.27 12 16l-4.18 3.27 1.09-6.1-5.09-3.9 6.09-1.01z" />
        </svg>
        {sectionLabels[lang] || sectionLabels.en}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {filtered.map((slug) => {
          const toolData = tools[slug]?.[lang];
          if (!toolData) return null;
          const cat = getCategoryForSlug(slug);
          const colors = categoryColors[cat] || categoryColors.dev;
          return (
            <Link
              key={slug}
              href={`/${lang}/tools/${slug}`}
              className="group flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} mb-2`}>
                {t.categories[cat] || cat}
              </span>
              <h3 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                {toolData.name}
              </h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
