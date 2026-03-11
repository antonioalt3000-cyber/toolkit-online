'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<string, string>> = {
  min: { en: 'Minimum', it: 'Minimo', es: 'Mínimo', fr: 'Minimum', de: 'Minimum', pt: 'Mínimo' },
  max: { en: 'Maximum', it: 'Massimo', es: 'Máximo', fr: 'Maximum', de: 'Maximum', pt: 'Máximo' },
  quantity: { en: 'Quantity', it: 'Quantità', es: 'Cantidad', fr: 'Quantité', de: 'Anzahl', pt: 'Quantidade' },
  noDuplicates: { en: 'No Duplicates', it: 'Senza Duplicati', es: 'Sin Duplicados', fr: 'Sans Doublons', de: 'Ohne Duplikate', pt: 'Sem Duplicatas' },
  generate: { en: 'Generate', it: 'Genera', es: 'Generar', fr: 'Générer', de: 'Generieren', pt: 'Gerar' },
  results: { en: 'Results', it: 'Risultati', es: 'Resultados', fr: 'Résultats', de: 'Ergebnisse', pt: 'Resultados' },
  copy: { en: 'Copy All', it: 'Copia Tutto', es: 'Copiar Todo', fr: 'Copier Tout', de: 'Alle Kopieren', pt: 'Copiar Tudo' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  error: { en: 'Range too small for unique numbers', it: 'Intervallo troppo piccolo per numeri unici', es: 'Rango muy pequeño para números únicos', fr: 'Plage trop petite pour des nombres uniques', de: 'Bereich zu klein für eindeutige Zahlen', pt: 'Intervalo muito pequeno para números únicos' },
  sorted: { en: 'Sort Results', it: 'Ordina Risultati', es: 'Ordenar Resultados', fr: 'Trier les Résultats', de: 'Ergebnisse Sortieren', pt: 'Ordenar Resultados' },
};

export default function RandomNumberGenerator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['random-number-generator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [quantity, setQuantity] = useState('1');
  const [noDups, setNoDups] = useState(false);
  const [sorted, setSorted] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const minNum = parseInt(min) || 0;
    const maxNum = parseInt(max) || 0;
    const qty = Math.min(parseInt(quantity) || 1, 1000);
    const range = maxNum - minNum + 1;

    if (noDups && qty > range) {
      setError(t('error'));
      setResults([]);
      return;
    }
    setError('');

    if (noDups) {
      const pool: number[] = [];
      for (let i = minNum; i <= maxNum; i++) pool.push(i);
      // Fisher-Yates shuffle
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const nums = pool.slice(0, qty);
      setResults(sorted ? nums.sort((a, b) => a - b) : nums);
    } else {
      const nums: number[] = [];
      for (let i = 0; i < qty; i++) {
        nums.push(Math.floor(Math.random() * range) + minNum);
      }
      setResults(sorted ? nums.sort((a, b) => a - b) : nums);
    }
    setCopied(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(results.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('min')}</label>
            <input type="number" value={min} onChange={(e) => setMin(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('max')}</label>
            <input type="number" value={max} onChange={(e) => setMax(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('quantity')}</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" max="1000"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={noDups} onChange={(e) => setNoDups(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-700">{t('noDuplicates')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={sorted} onChange={(e) => setSorted(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-700">{t('sorted')}</span>
          </label>
        </div>

        <button onClick={handleGenerate}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          {t('generate')}
        </button>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        {results.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">{t('results')}</span>
              <button onClick={handleCopy}
                className={`text-xs px-2 py-1 rounded ${copied ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                {copied ? t('copied') : t('copy')}
              </button>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex flex-wrap gap-2">
                {results.map((num, i) => (
                  <span key={i} className="bg-white px-3 py-1 rounded-lg border border-blue-200 text-blue-600 font-mono font-semibold">
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
