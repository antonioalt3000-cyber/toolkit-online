'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type Locale } from '@/lib/translations';
import { blogArticles } from '@/lib/blog';

const labels: Record<Locale, { title: string; subtitle: string; readMore: string }> = {
  en: { title: 'Blog', subtitle: 'Tips, guides, and insights about online tools and productivity.', readMore: 'Read more' },
  it: { title: 'Blog', subtitle: 'Consigli, guide e approfondimenti su strumenti online e produttivita.', readMore: 'Leggi di piu' },
  es: { title: 'Blog', subtitle: 'Consejos, guias y articulos sobre herramientas en linea y productividad.', readMore: 'Leer mas' },
  fr: { title: 'Blog', subtitle: 'Conseils, guides et articles sur les outils en ligne et la productivite.', readMore: 'Lire la suite' },
  de: { title: 'Blog', subtitle: 'Tipps, Anleitungen und Einblicke zu Online-Tools und Produktivitat.', readMore: 'Weiterlesen' },
  pt: { title: 'Blog', subtitle: 'Dicas, guias e artigos sobre ferramentas online e produtividade.', readMore: 'Leia mais' },
};

export default function BlogPage() {
  const params = useParams();
  const lang = (params?.lang as Locale) || 'en';
  const l = labels[lang];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{l.title}</h1>
      <p className="text-gray-500 mb-10">{l.subtitle}</p>
      <div className="grid gap-8">
        {blogArticles.map((article) => {
          const t = article.translations[lang];
          return (
            <Link key={article.slug} href={`/${lang}/blog/${article.slug}`} className="block group">
              <article className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">{article.category}</span>
                  <time className="text-xs text-gray-400">{new Date(article.date).toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                </div>
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">{t.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed">{t.excerpt}</p>
                <span className="inline-block mt-4 text-sm font-semibold text-blue-600">{l.readMore} →</span>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
