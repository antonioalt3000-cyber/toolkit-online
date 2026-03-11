'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

export default function JsonFormatter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['json-formatter'][lang];

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const labels = {
    format: { en: 'Format', it: 'Formatta', es: 'Formatear', fr: 'Formater', de: 'Formatieren', pt: 'Formatar' },
    minify: { en: 'Minify', it: 'Minimizza', es: 'Minimizar', fr: 'Minifier', de: 'Minimieren', pt: 'Minificar' },
    placeholder: { en: 'Paste your JSON here...', it: 'Incolla il tuo JSON qui...', es: 'Pega tu JSON aquí...', fr: 'Collez votre JSON ici...', de: 'JSON hier einfügen...', pt: 'Cole seu JSON aqui...' },
    valid: { en: 'Valid JSON', it: 'JSON valido', es: 'JSON válido', fr: 'JSON valide', de: 'Gültiges JSON', pt: 'JSON válido' },
    invalid: { en: 'Invalid JSON', it: 'JSON non valido', es: 'JSON no válido', fr: 'JSON invalide', de: 'Ungültiges JSON', pt: 'JSON inválido' },
  } as Record<string, Record<Locale, string>>;

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (e) {
      setError(labels.invalid[lang] + ': ' + (e as Error).message);
      setOutput('');
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError('');
    } catch (e) {
      setError(labels.invalid[lang] + ': ' + (e as Error).message);
      setOutput('');
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={labels.placeholder[lang]}
        className="w-full h-48 border border-gray-300 rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 mb-3"
      />

      <div className="flex gap-2 mb-4">
        <button onClick={format} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{labels.format[lang]}</button>
        <button onClick={minify} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">{labels.minify[lang]}</button>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg mb-3 text-sm">{error}</div>}

      {output && (
        <div className="relative">
          <button onClick={copy} className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600">
            {copied ? '✓' : 'Copy'}
          </button>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto text-sm font-mono">{output}</pre>
        </div>
      )}
    </div>
  );
}
