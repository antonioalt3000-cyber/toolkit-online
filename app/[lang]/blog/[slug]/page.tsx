'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type Locale } from '@/lib/translations';
import { blogArticles } from '@/lib/blog';

const backLabels: Record<Locale, string> = {
  en: 'Back to Blog',
  it: 'Torna al Blog',
  es: 'Volver al Blog',
  fr: 'Retour au Blog',
  de: 'Zuruck zum Blog',
  pt: 'Voltar ao Blog',
};

export default function BlogArticlePage() {
  const params = useParams();
  const lang = (params?.lang as Locale) || 'en';
  const slug = params?.slug as string;

  const article = blogArticles.find(a => a.slug === slug);
  if (!article) return <div className="text-center py-20 text-gray-500">Article not found</div>;

  const t = article.translations[lang];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: t.title,
    datePublished: article.date,
    author: { '@type': 'Organization', name: 'ToolKit Online' },
    publisher: { '@type': 'Organization', name: 'ToolKit Online', url: 'https://toolkitonline.vip' },
    description: t.excerpt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://toolkitonline.vip/${lang}/blog/${slug}` },
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href={`/${lang}/blog`} className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        ← {backLabels[lang]}
      </Link>
      <article className="prose prose-lg max-w-none">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">{article.category}</span>
          <time className="text-xs text-gray-400">{new Date(article.date).toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' })}</time>
        </div>
        <h1 className="text-3xl font-bold mb-6">{t.title}</h1>
        {t.content.split('\n\n').map((paragraph, i) => (
          <p key={i} className="text-gray-700 leading-relaxed mb-4">{paragraph}</p>
        ))}
      </article>
    </div>
  );
}
