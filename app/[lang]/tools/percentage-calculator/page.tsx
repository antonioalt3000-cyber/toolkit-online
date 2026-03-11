'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

export default function PercentageCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['percentage-calculator'][lang];

  const [val1, setVal1] = useState('');
  const [pct1, setPct1] = useState('');
  const [val2a, setVal2a] = useState('');
  const [val2b, setVal2b] = useState('');
  const [val3a, setVal3a] = useState('');
  const [val3b, setVal3b] = useState('');

  const labels = {
    whatIs: { en: 'What is', it: 'Quanto è il', es: 'Cuánto es el', fr: 'Combien est', de: 'Was ist', pt: 'Quanto é' },
    of: { en: 'of', it: 'di', es: 'de', fr: 'de', de: 'von', pt: 'de' },
    isWhatPct: { en: 'is what % of', it: 'è che % di', es: 'es qué % de', fr: 'est quel % de', de: 'ist wieviel % von', pt: 'é qual % de' },
    pctChange: { en: 'Percentage change from', it: 'Variazione percentuale da', es: 'Cambio porcentual de', fr: 'Changement en pourcentage de', de: 'Prozentuale Änderung von', pt: 'Mudança percentual de' },
    to: { en: 'to', it: 'a', es: 'a', fr: 'à', de: 'zu', pt: 'para' },
  } as Record<string, Record<Locale, string>>;

  const r1 = val1 && pct1 ? ((parseFloat(pct1) / 100) * parseFloat(val1)).toFixed(2) : '';
  const r2 = val2a && val2b ? ((parseFloat(val2a) / parseFloat(val2b)) * 100).toFixed(2) + '%' : '';
  const r3 = val3a && val3b ? (((parseFloat(val3b) - parseFloat(val3a)) / parseFloat(val3a)) * 100).toFixed(2) + '%' : '';

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-700">{labels.whatIs[lang]}</span>
            <input type="number" value={pct1} onChange={(e) => setPct1(e.target.value)} className="w-20 border border-gray-300 rounded px-2 py-1" placeholder="10" />
            <span className="text-gray-700">% {labels.of[lang]}</span>
            <input type="number" value={val1} onChange={(e) => setVal1(e.target.value)} className="w-28 border border-gray-300 rounded px-2 py-1" placeholder="200" />
            {r1 && <span className="text-lg font-bold text-blue-600">= {r1}</span>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 flex-wrap">
            <input type="number" value={val2a} onChange={(e) => setVal2a(e.target.value)} className="w-24 border border-gray-300 rounded px-2 py-1" placeholder="50" />
            <span className="text-gray-700">{labels.isWhatPct[lang]}</span>
            <input type="number" value={val2b} onChange={(e) => setVal2b(e.target.value)} className="w-24 border border-gray-300 rounded px-2 py-1" placeholder="200" />
            {r2 && <span className="text-lg font-bold text-blue-600">= {r2}</span>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-700">{labels.pctChange[lang]}</span>
            <input type="number" value={val3a} onChange={(e) => setVal3a(e.target.value)} className="w-24 border border-gray-300 rounded px-2 py-1" placeholder="100" />
            <span className="text-gray-700">{labels.to[lang]}</span>
            <input type="number" value={val3b} onChange={(e) => setVal3b(e.target.value)} className="w-24 border border-gray-300 rounded px-2 py-1" placeholder="150" />
            {r3 && <span className="text-lg font-bold text-blue-600">= {r3}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
