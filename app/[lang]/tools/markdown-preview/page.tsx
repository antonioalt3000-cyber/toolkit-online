'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<Locale, string>> = {
  editor: { en: 'Markdown Editor', it: 'Editor Markdown', es: 'Editor Markdown', fr: 'Éditeur Markdown', de: 'Markdown-Editor', pt: 'Editor Markdown' },
  preview: { en: 'Preview', it: 'Anteprima', es: 'Vista Previa', fr: 'Aperçu', de: 'Vorschau', pt: 'Pré-visualização' },
  placeholder: { en: '# Hello World\n\nWrite some **markdown** here...\n\n- Item 1\n- Item 2\n\n> A blockquote\n\n`inline code`\n\n```\ncode block\n```', it: '# Ciao Mondo\n\nScrivi del **markdown** qui...', es: '# Hola Mundo\n\nEscribe algo de **markdown** aquí...', fr: '# Bonjour le Monde\n\nÉcrivez du **markdown** ici...', de: '# Hallo Welt\n\nSchreiben Sie hier **Markdown**...', pt: '# Olá Mundo\n\nEscreva algum **markdown** aqui...' },
};

function parseMarkdown(md: string): string {
  let html = md;

  // Escape HTML
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Code blocks (``` ... ```)
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 text-green-400 p-3 rounded-lg my-2 overflow-x-auto text-sm"><code>$1</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-600 px-1 rounded text-sm">$1</code>');

  // Headers
  html = html.replace(/^######\s+(.+)$/gm, '<h6 class="text-sm font-bold mt-3 mb-1">$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5 class="text-base font-bold mt-3 mb-1">$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="text-lg font-bold mt-3 mb-1">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-2xl font-bold mt-4 mb-2">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-3xl font-bold mt-4 mb-2">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Blockquotes
  html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2">$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="my-4 border-gray-300" />');

  // Unordered lists
  html = html.replace(/^[-*]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>');

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded my-2" />');

  // Paragraphs (double newlines)
  html = html.replace(/\n\n/g, '</p><p class="my-2">');
  html = '<p class="my-2">' + html + '</p>';

  // Single newlines -> <br>
  html = html.replace(/\n/g, '<br />');

  // Clean empty paragraphs
  html = html.replace(/<p class="my-2"><\/p>/g, '');

  return html;
}

export default function MarkdownPreview() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['markdown-preview'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [markdown, setMarkdown] = useState('');

  const rendered = useMemo(() => parseMarkdown(markdown || ''), [markdown]);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('editor')}</label>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full h-96 border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('preview')}</label>
          <div
            className="h-96 overflow-y-auto border border-gray-300 rounded-lg px-4 py-2 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        </div>
      </div>
    </div>
  );
}
