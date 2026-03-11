'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { tools, common, getToolsByCategory, type Locale } from '@/lib/translations';

export default function RelatedTools({ currentSlug }: { currentSlug: string }) {
  const params = useParams();
  const lang = (params?.lang as Locale) || 'en';
  const t = common[lang];

  // Find the category for the current tool
  const categories = getToolsByCategory();
  let categoryKey = '';
  for (const [cat, slugs] of Object.entries(categories)) {
    if (slugs.includes(currentSlug)) {
      categoryKey = cat;
      break;
    }
  }

  if (!categoryKey) return null;

  // Get up to 4 tools from the same category, excluding the current one
  const related = (categories[categoryKey] || [])
    .filter((slug) => slug !== currentSlug)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.relatedTools}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {related.map((slug) => {
          const toolData = tools[slug]?.[lang];
          if (!toolData) return null;
          return (
            <Link
              key={slug}
              href={`/${lang}/tools/${slug}`}
              className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <h3 className="font-medium text-sm text-gray-900">{toolData.name}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{toolData.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
