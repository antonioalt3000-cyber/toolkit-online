'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<string, string>> = {
  inputText: { en: 'Enter your text', it: 'Inserisci il testo', es: 'Ingresa tu texto', fr: 'Entrez votre texte', de: 'Text eingeben', pt: 'Digite seu texto' },
  uppercase: { en: 'UPPERCASE', it: 'MAIUSCOLO', es: 'MAYÚSCULAS', fr: 'MAJUSCULES', de: 'GROSSBUCHSTABEN', pt: 'MAIÚSCULAS' },
  lowercase: { en: 'lowercase', it: 'minuscolo', es: 'minúsculas', fr: 'minuscules', de: 'kleinbuchstaben', pt: 'minúsculas' },
  titleCase: { en: 'Title Case', it: 'Prima Maiuscola', es: 'Tipo Título', fr: 'Casse Titre', de: 'Titelform', pt: 'Primeira Maiúscula' },
  sentenceCase: { en: 'Sentence case', it: 'Frase normale', es: 'Tipo oración', fr: 'Casse phrase', de: 'Satzform', pt: 'Primeira frase' },
  camelCase: { en: 'camelCase', it: 'camelCase', es: 'camelCase', fr: 'camelCase', de: 'camelCase', pt: 'camelCase' },
  kebabCase: { en: 'kebab-case', it: 'kebab-case', es: 'kebab-case', fr: 'kebab-case', de: 'kebab-case', pt: 'kebab-case' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
};

function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}
function toSentenceCase(s: string) {
  return s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
}
function toCamelCase(s: string) {
  return s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
}
function toKebabCase(s: string) {
  return s.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function TextCaseConverter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['text-case-converter'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [text, setText] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const conversions = [
    { key: 'uppercase', fn: (s: string) => s.toUpperCase() },
    { key: 'lowercase', fn: (s: string) => s.toLowerCase() },
    { key: 'titleCase', fn: toTitleCase },
    { key: 'sentenceCase', fn: toSentenceCase },
    { key: 'camelCase', fn: toCamelCase },
    { key: 'kebabCase', fn: toKebabCase },
  ];

  const handleCopy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('inputText')}</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4}
            placeholder="The Quick Brown Fox Jumps Over The Lazy Dog"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
        </div>

        {text && (
          <div className="space-y-3">
            {conversions.map(({ key, fn }) => {
              const result = fn(text);
              return (
                <div key={key} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600">{t(key)}</span>
                    <button onClick={() => handleCopy(key, result)}
                      className={`text-xs px-2 py-1 rounded ${copiedKey === key ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                      {copiedKey === key ? t('copied') : t('copy')}
                    </button>
                  </div>
                  <div className="text-gray-900 text-sm font-mono break-all">{result}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
