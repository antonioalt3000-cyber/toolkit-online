'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

export default function Base64Converter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['base64-converter'][lang];

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);

  const labels = {
    encode: { en: 'Encode', it: 'Codifica', es: 'Codificar', fr: 'Encoder', de: 'Kodieren', pt: 'Codificar' },
    decode: { en: 'Decode', it: 'Decodifica', es: 'Decodificar', fr: 'Décoder', de: 'Dekodieren', pt: 'Decodificar' },
    inputPh: { en: 'Enter text to encode/decode...', it: 'Inserisci il testo da codificare/decodificare...', es: 'Ingresa texto para codificar/decodificar...', fr: 'Entrez le texte à encoder/décoder...', de: 'Text zum Kodieren/Dekodieren eingeben...', pt: 'Digite o texto para codificar/decodificar...' },
  } as Record<string, Record<Locale, string>>;

  const convert = () => {
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch {
      setOutput('Error: invalid input');
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setMode('encode')} className={`flex-1 py-2 rounded-lg font-medium ${mode === 'encode' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
            {labels.encode[lang]}
          </button>
          <button onClick={() => setMode('decode')} className={`flex-1 py-2 rounded-lg font-medium ${mode === 'decode' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
            {labels.decode[lang]}
          </button>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={labels.inputPh[lang]}
          className="w-full h-32 border border-gray-300 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500"
        />

        <button onClick={convert} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
          {mode === 'encode' ? labels.encode[lang] : labels.decode[lang]}
        </button>

        {output && (
          <div className="relative">
            <button onClick={copy} className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-white text-xs rounded">
              {copied ? '✓' : 'Copy'}
            </button>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap break-all">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
