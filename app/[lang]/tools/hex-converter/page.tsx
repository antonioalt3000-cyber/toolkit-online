'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<Locale, string>> = {
  decimal: { en: 'Decimal', it: 'Decimale', es: 'Decimal', fr: 'Décimal', de: 'Dezimal', pt: 'Decimal' },
  hexadecimal: { en: 'Hexadecimal', it: 'Esadecimale', es: 'Hexadecimal', fr: 'Hexadécimal', de: 'Hexadezimal', pt: 'Hexadecimal' },
  binary: { en: 'Binary', it: 'Binario', es: 'Binario', fr: 'Binaire', de: 'Binär', pt: 'Binário' },
  octal: { en: 'Octal', it: 'Ottale', es: 'Octal', fr: 'Octal', de: 'Oktal', pt: 'Octal' },
  inputAs: { en: 'Input as', it: 'Inserisci come', es: 'Entrada como', fr: 'Entrée en', de: 'Eingabe als', pt: 'Entrada como' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  invalid: { en: 'Invalid input', it: 'Input non valido', es: 'Entrada inválida', fr: 'Entrée invalide', de: 'Ungültige Eingabe', pt: 'Entrada inválida' },
};

type Base = 'decimal' | 'hexadecimal' | 'binary' | 'octal';

function parseInput(value: string, base: Base): number | null {
  if (!value.trim()) return null;
  try {
    let num: number;
    switch (base) {
      case 'decimal': num = parseInt(value, 10); break;
      case 'hexadecimal': num = parseInt(value.replace(/^0x/i, ''), 16); break;
      case 'binary': num = parseInt(value.replace(/^0b/i, ''), 2); break;
      case 'octal': num = parseInt(value.replace(/^0o/i, ''), 8); break;
    }
    return isNaN(num) ? null : num;
  } catch {
    return null;
  }
}

function formatOutput(num: number, base: Base): string {
  switch (base) {
    case 'decimal': return num.toString(10);
    case 'hexadecimal': return num.toString(16).toUpperCase();
    case 'binary': return num.toString(2);
    case 'octal': return num.toString(8);
  }
}

export default function HexConverter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['hex-converter'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [inputBase, setInputBase] = useState<Base>('decimal');
  const [input, setInput] = useState('255');
  const [copiedField, setCopiedField] = useState('');

  const num = parseInput(input, inputBase);
  const isValid = num !== null;

  const bases: Base[] = ['decimal', 'hexadecimal', 'binary', 'octal'];
  const prefixes: Record<Base, string> = {
    decimal: '',
    hexadecimal: '0x',
    binary: '0b',
    octal: '0o',
  };

  const copyValue = (base: Base) => {
    if (num === null) return;
    const val = prefixes[base] + formatOutput(num, base);
    navigator.clipboard.writeText(val);
    setCopiedField(base);
    setTimeout(() => setCopiedField(''), 2000);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('inputAs')}</label>
          <div className="flex gap-2 flex-wrap">
            {bases.map((base) => (
              <button
                key={base}
                onClick={() => {
                  if (num !== null) setInput(formatOutput(num, base));
                  setInputBase(base);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  inputBase === base ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t(base)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={inputBase === 'decimal' ? '255' : inputBase === 'hexadecimal' ? 'FF' : inputBase === 'binary' ? '11111111' : '377'}
            className={`w-full border rounded-lg px-4 py-2 text-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              input && !isValid ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {input && !isValid && <p className="text-red-500 text-sm mt-1">{t('invalid')}</p>}
        </div>

        {isValid && (
          <div className="space-y-2">
            {bases.map((base) => (
              <div key={base} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">{t(base)}</span>
                  <p className="font-mono font-semibold text-gray-900">
                    <span className="text-gray-400">{prefixes[base]}</span>
                    {formatOutput(num, base)}
                  </p>
                </div>
                <button
                  onClick={() => copyValue(base)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {copiedField === base ? t('copied') : t('copy')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
