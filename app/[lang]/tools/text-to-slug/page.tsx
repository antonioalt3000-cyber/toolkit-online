'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<Locale, string>> = {
  inputText: { en: 'Input Text', it: 'Testo di Input', es: 'Texto de Entrada', fr: 'Texte d\'Entrée', de: 'Eingabetext', pt: 'Texto de Entrada' },
  slug: { en: 'Generated Slug', it: 'Slug Generato', es: 'Slug Generado', fr: 'Slug Généré', de: 'Generierter Slug', pt: 'Slug Gerado' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  placeholder: { en: 'Enter text to convert to slug...', it: 'Inserisci testo da convertire in slug...', es: 'Ingresa texto para convertir a slug...', fr: 'Entrez du texte à convertir en slug...', de: 'Text eingeben zum Konvertieren...', pt: 'Digite texto para converter em slug...' },
  separator: { en: 'Separator', it: 'Separatore', es: 'Separador', fr: 'Séparateur', de: 'Trennzeichen', pt: 'Separador' },
  lowercase: { en: 'Lowercase', it: 'Minuscolo', es: 'Minúsculas', fr: 'Minuscules', de: 'Kleinbuchstaben', pt: 'Minúsculas' },
};

function textToSlug(text: string, separator: string, lowercase: boolean): string {
  let slug = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, separator)
    .replace(new RegExp(`[${separator}]+`, 'g'), separator);

  if (lowercase) slug = slug.toLowerCase();
  return slug;
}

export default function TextToSlug() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['text-to-slug'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [input, setInput] = useState('');
  const [separator, setSeparator] = useState('-');
  const [lowercase, setLowercase] = useState(true);
  const [copied, setCopied] = useState(false);

  const slug = textToSlug(input, separator, lowercase);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('inputText')}</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('placeholder')}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('separator')}</label>
            <select
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="-">- (hyphen)</option>
              <option value="_">_ (underscore)</option>
              <option value=".">. (dot)</option>
            </select>
          </div>
          <label className="flex items-center gap-2 mt-5">
            <input type="checkbox" checked={lowercase} onChange={(e) => setLowercase(e.target.checked)} className="rounded" />
            <span className="text-sm text-gray-700">{t('lowercase')}</span>
          </label>
        </div>

        {input && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('slug')}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={slug}
                readOnly
                className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {copied ? t('copied') : t('copy')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
