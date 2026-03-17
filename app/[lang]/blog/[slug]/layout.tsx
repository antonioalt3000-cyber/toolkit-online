import type { Metadata } from 'next';
import { blogArticles } from '@/lib/blog';
import { locales, type Locale } from '@/lib/translations';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolkitonline.vip';

export async function generateStaticParams() {
  return blogArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = (lang as Locale) || 'en';
  const article = blogArticles.find(a => a.slug === slug);
  if (!article) return {};
  const t = article.translations[locale];
  return {
    title: t.title,
    description: t.excerpt,
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog/${slug}`,
      languages: Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/blog/${slug}`])),
    },
    openGraph: {
      type: 'article',
      title: t.title,
      description: t.excerpt,
      url: `${BASE_URL}/${locale}/blog/${slug}`,
      publishedTime: article.date,
    },
  };
}

export default function BlogArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
