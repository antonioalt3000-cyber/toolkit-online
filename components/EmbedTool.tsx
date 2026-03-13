'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

const translations: Record<string, {
  title: string;
  copy: string;
  copied: string;
  description: string;
  preview: string;
}> = {
  en: {
    title: 'Embed this tool on your website',
    copy: 'Copy Code',
    copied: 'Copied!',
    description: 'Paste this code on your website to embed this tool for free.',
    preview: 'Preview',
  },
  it: {
    title: 'Incorpora questo strumento nel tuo sito web',
    copy: 'Copia Codice',
    copied: 'Copiato!',
    description: 'Incolla questo codice nel tuo sito web per incorporare questo strumento gratuitamente.',
    preview: 'Anteprima',
  },
  es: {
    title: 'Inserta esta herramienta en tu sitio web',
    copy: 'Copiar Código',
    copied: '¡Copiado!',
    description: 'Pega este código en tu sitio web para insertar esta herramienta gratis.',
    preview: 'Vista previa',
  },
  fr: {
    title: 'Intégrez cet outil sur votre site web',
    copy: 'Copier le Code',
    copied: 'Copié !',
    description: 'Collez ce code sur votre site web pour intégrer cet outil gratuitement.',
    preview: 'Aperçu',
  },
  de: {
    title: 'Betten Sie dieses Tool in Ihre Website ein',
    copy: 'Code kopieren',
    copied: 'Kopiert!',
    description: 'Fügen Sie diesen Code auf Ihrer Website ein, um dieses Tool kostenlos einzubetten.',
    preview: 'Vorschau',
  },
  pt: {
    title: 'Incorpore esta ferramenta no seu site',
    copy: 'Copiar Código',
    copied: 'Copiado!',
    description: 'Cole este código no seu site para incorporar esta ferramenta gratuitamente.',
    preview: 'Pré-visualização',
  },
};

interface EmbedToolProps {
  toolSlug: string;
}

export default function EmbedTool({ toolSlug }: EmbedToolProps) {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const t = translations[lang] || translations.en;

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedUrl = `https://toolkitonline.vip/${lang}/tools/${toolSlug}?embed=true`;
  const embedCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" style="border:1px solid #e5e7eb;border-radius:8px;" loading="lazy"></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = embedCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mt-8">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        {t.title}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="mt-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-3">{t.description}</p>

          <textarea
            readOnly
            value={embedCode}
            rows={3}
            className="w-full bg-white font-mono text-sm p-3 rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />

          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                copied
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {copied ? t.copied : t.copy}
            </button>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">{t.preview}</p>
            <div className="border border-gray-300 rounded-lg bg-white p-6 flex items-center justify-center text-sm text-gray-400">
              {toolSlug.replace(/-/g, ' ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
