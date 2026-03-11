import { common, tools, type Locale, getToolsByCategory } from '@/lib/translations';
import HomeContent from '@/components/HomeContent';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const t = common[locale];
  const categories = getToolsByCategory();

  // Build a flat map of slug -> { name, description } for the current locale
  const toolsData: Record<string, { name: string; description: string }> = {};
  for (const [slug, translations] of Object.entries(tools)) {
    const toolT = translations[locale];
    if (toolT) {
      toolsData[slug] = { name: toolT.name, description: toolT.description };
    }
  }

  return (
    <HomeContent
      categories={categories}
      toolsData={toolsData}
      locale={lang}
      common={{
        siteDescription: t.siteDescription,
        heroTitle: t.heroTitle,
        statsTools: t.statsTools,
        statsLanguages: t.statsLanguages,
        statsFree: t.statsFree,
        searchPlaceholder: t.searchPlaceholder,
        categories: t.categories,
      }}
    />
  );
}
