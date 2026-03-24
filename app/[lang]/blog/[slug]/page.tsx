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

function renderBlock(block: string, index: number, lang: string): React.ReactNode {
  const trimmed = block.trim();

  // H2 heading
  if (trimmed.startsWith('## ')) {
    return (
      <h2 key={index} className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
        {trimmed.slice(3)}
      </h2>
    );
  }

  // Unordered list block
  if (trimmed.split('\n').every(line => line.trim().startsWith('- ') || line.trim() === '')) {
    const items = trimmed.split('\n').filter(line => line.trim().startsWith('- '));
    return (
      <ul key={index} className="list-disc list-inside space-y-1 mb-4 text-gray-700 dark:text-gray-300">
        {items.map((item, j) => (
          <li key={j} dangerouslySetInnerHTML={{ __html: convertInlineMarkdown(item.trim().slice(2), lang) }} />
        ))}
      </ul>
    );
  }

  // Regular paragraph
  return (
    <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: convertInlineMarkdown(trimmed, lang) }} />
  );
}

function convertInlineMarkdown(text: string, lang: string): string {
  let html = text;
  // Bold **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Links [text](url) — fix lang-specific paths
  html = html.replace(/\[([^\]]+)\]\(\/en\/([^)]+)\)/g, `<a href="/${lang}/$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>`);
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>');
  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>');
  return html;
}

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

  const blocks = t.content.split('\n\n');

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href={`/${lang}/blog`} className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        &larr; {backLabels[lang]}
      </Link>
      <article className="prose prose-lg max-w-none">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">{article.category}</span>
          <time className="text-xs text-gray-400">{new Date(article.date).toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' })}</time>
        </div>
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t.title}</h1>
        {blocks.map((block, i) => renderBlock(block, i, lang))}
      </article>
    </div>
  );
}
