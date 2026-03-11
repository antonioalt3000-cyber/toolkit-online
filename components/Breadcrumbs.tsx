'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { tools, common, getToolsByCategory, type Locale } from '@/lib/translations';

const BASE_URL = 'https://toolkitonline.vip';

export default function Breadcrumbs({ toolSlug }: { toolSlug: string }) {
  const params = useParams();
  const lang = (params?.lang as Locale) || 'en';
  const t = common[lang];

  // Find the category for this tool
  const categories = getToolsByCategory();
  let categoryKey = '';
  for (const [cat, slugs] of Object.entries(categories)) {
    if (slugs.includes(toolSlug)) {
      categoryKey = cat;
      break;
    }
  }

  const categoryName = t.categories[categoryKey] || categoryKey;
  const toolName = tools[toolSlug]?.[lang]?.name || toolSlug;

  const breadcrumbItems = [
    { name: t.siteTitle, url: `${BASE_URL}/${lang}` },
    { name: categoryName, url: `${BASE_URL}/${lang}#${categoryKey}` },
    { name: toolName, url: `${BASE_URL}/${lang}/tools/${toolSlug}` },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex items-center text-sm text-gray-500 flex-wrap">
        <li>
          <Link href={`/${lang}`} className="text-blue-600 hover:underline">
            {t.siteTitle}
          </Link>
        </li>
        <li className="mx-2">
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </li>
        <li>
          <Link href={`/${lang}#${categoryKey}`} className="text-blue-600 hover:underline">
            {categoryName}
          </Link>
        </li>
        <li className="mx-2">
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </li>
        <li className="text-gray-700 font-medium">{toolName}</li>
      </ol>
    </nav>
  );
}
