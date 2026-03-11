import { common, tools, type Locale, getToolsByCategory } from '@/lib/translations';
import ToolCard from '@/components/ToolCard';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const t = common[locale];
  const categories = getToolsByCategory();

  return (
    <div>
      <section className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">{t.siteTitle}</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t.siteDescription}</p>
      </section>

      {Object.entries(categories).map(([catKey, toolSlugs]) => (
        <section key={catKey} className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {t.categories[catKey] || catKey}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {toolSlugs.map((slug) => {
              const toolT = tools[slug]?.[locale];
              if (!toolT) return null;
              return (
                <ToolCard
                  key={slug}
                  slug={slug}
                  name={toolT.name}
                  description={toolT.description}
                  lang={lang}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
