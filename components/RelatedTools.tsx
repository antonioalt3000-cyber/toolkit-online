'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { tools, common, getToolsByCategory, type Locale } from '@/lib/translations';

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  finance: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  text: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  health: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  conversion: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  dev: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  math: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  images: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
};

const alsoLikeLabels: Record<string, string> = {
  en: 'You Might Also Like',
  it: 'Potrebbe anche piacerti',
  es: 'También te puede gustar',
  fr: 'Vous aimerez aussi',
  de: 'Das könnte dir auch gefallen',
  pt: 'Você também pode gostar',
};

// Simple deterministic hash from a string
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getCategoryForSlug(slug: string, categories: Record<string, string[]>): string {
  for (const [cat, slugs] of Object.entries(categories)) {
    if (slugs.includes(slug)) return cat;
  }
  return '';
}

export default function RelatedTools({ currentSlug }: { currentSlug: string }) {
  const params = useParams();
  const lang = (params?.lang as Locale) || 'en';
  const t = common[lang];

  const categories = getToolsByCategory();
  const categoryKey = getCategoryForSlug(currentSlug, categories);

  if (!categoryKey) return null;

  // Get up to 6 tools from the same category, excluding the current one
  const related = (categories[categoryKey] || [])
    .filter((slug) => slug !== currentSlug)
    .slice(0, 6);

  // Get 3 tools from OTHER categories (deterministic based on slug)
  const otherCategoryTools: { slug: string; category: string }[] = [];
  const otherSlugs: { slug: string; category: string }[] = [];
  for (const [cat, slugs] of Object.entries(categories)) {
    if (cat === categoryKey) continue;
    for (const slug of slugs) {
      otherSlugs.push({ slug, category: cat });
    }
  }
  // Deterministic shuffle based on current slug
  const seed = hashCode(currentSlug);
  const sorted = [...otherSlugs].sort((a, b) => {
    const ha = hashCode(a.slug + currentSlug) % 10000;
    const hb = hashCode(b.slug + currentSlug) % 10000;
    return ha - hb;
  });
  for (let i = 0; i < Math.min(3, sorted.length); i++) {
    otherCategoryTools.push(sorted[i]);
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 space-y-10">
      {/* Related Tools (same category) */}
      {related.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.relatedTools}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {related.map((slug) => {
              const toolData = tools[slug]?.[lang];
              if (!toolData) return null;
              const colors = categoryColors[categoryKey] || categoryColors.dev;
              return (
                <Link
                  key={slug}
                  href={`/${lang}/tools/${slug}`}
                  className="group block p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                      {toolData.name}
                    </h3>
                    <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} ${colors.border} border`}>
                      {t.categories[categoryKey] || categoryKey}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{toolData.description}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* You Might Also Like (other categories) */}
      {otherCategoryTools.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {alsoLikeLabels[lang] || alsoLikeLabels.en}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {otherCategoryTools.map(({ slug, category }) => {
              const toolData = tools[slug]?.[lang];
              if (!toolData) return null;
              const colors = categoryColors[category] || categoryColors.dev;
              return (
                <Link
                  key={slug}
                  href={`/${lang}/tools/${slug}`}
                  className="group block p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                      {toolData.name}
                    </h3>
                    <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} ${colors.border} border`}>
                      {t.categories[category] || category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{toolData.description}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
