'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<Locale, string>> = {
  encode: { en: 'Encode', it: 'Codifica', es: 'Codificar', fr: 'Encoder', de: 'Kodieren', pt: 'Codificar' },
  decode: { en: 'Decode', it: 'Decodifica', es: 'Decodificar', fr: 'Décoder', de: 'Dekodieren', pt: 'Decodificar' },
  input: { en: 'Input', it: 'Input', es: 'Entrada', fr: 'Entrée', de: 'Eingabe', pt: 'Entrada' },
  output: { en: 'Output', it: 'Output', es: 'Salida', fr: 'Sortie', de: 'Ausgabe', pt: 'Saída' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  encodePlaceholder: { en: 'Enter HTML to encode...', it: 'Inserisci HTML da codificare...', es: 'Ingresa HTML para codificar...', fr: 'Entrez du HTML à encoder...', de: 'HTML zum Kodieren eingeben...', pt: 'Digite HTML para codificar...' },
  decodePlaceholder: { en: 'Enter encoded HTML to decode...', it: 'Inserisci HTML codificato da decodificare...', es: 'Ingresa HTML codificado para decodificar...', fr: 'Entrez du HTML encodé à décoder...', de: 'Kodierten HTML zum Dekodieren eingeben...', pt: 'Digite HTML codificado para decodificar...' },
};

function encodeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function decodeHTML(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

export default function HtmlEncoder() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['html-encoder'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const output = input ? (mode === 'encode' ? encodeHTML(input) : decodeHTML(input)) : '';

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => { setMode('encode'); setInput(''); }}
            className={`flex-1 py-2 rounded-lg font-medium ${mode === 'encode' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('encode')}
          </button>
          <button
            onClick={() => { setMode('decode'); setInput(''); }}
            className={`flex-1 py-2 rounded-lg font-medium ${mode === 'decode' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('decode')}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('input')}</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? t('encodePlaceholder') : t('decodePlaceholder')}
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {output && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">{t('output')}</label>
              <button onClick={copyOutput} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                {copied ? t('copied') : t('copy')}
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              rows={5}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
