'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<string, string>> = {
  modeBetween: { en: 'Days Between Dates', it: 'Giorni tra Date', es: 'Días entre Fechas', fr: 'Jours entre Dates', de: 'Tage zwischen Daten', pt: 'Dias entre Datas' },
  modeAdd: { en: 'Add/Subtract Days', it: 'Aggiungi/Sottrai Giorni', es: 'Sumar/Restar Días', fr: 'Ajouter/Soustraire Jours', de: 'Tage Addieren/Subtrahieren', pt: 'Adicionar/Subtrair Dias' },
  startDate: { en: 'Start Date', it: 'Data Inizio', es: 'Fecha Inicio', fr: 'Date de Début', de: 'Startdatum', pt: 'Data Início' },
  endDate: { en: 'End Date', it: 'Data Fine', es: 'Fecha Fin', fr: 'Date de Fin', de: 'Enddatum', pt: 'Data Fim' },
  date: { en: 'Date', it: 'Data', es: 'Fecha', fr: 'Date', de: 'Datum', pt: 'Data' },
  days: { en: 'Days', it: 'Giorni', es: 'Días', fr: 'Jours', de: 'Tage', pt: 'Dias' },
  addDays: { en: 'Days to Add (negative to subtract)', it: 'Giorni da Aggiungere (negativo per sottrarre)', es: 'Días a Sumar (negativo para restar)', fr: 'Jours à Ajouter (négatif pour soustraire)', de: 'Tage hinzufügen (negativ zum Subtrahieren)', pt: 'Dias a Adicionar (negativo para subtrair)' },
  resultDate: { en: 'Result Date', it: 'Data Risultato', es: 'Fecha Resultado', fr: 'Date Résultat', de: 'Ergebnisdatum', pt: 'Data Resultado' },
  difference: { en: 'Difference', it: 'Differenza', es: 'Diferencia', fr: 'Différence', de: 'Differenz', pt: 'Diferença' },
  weeks: { en: 'weeks', it: 'settimane', es: 'semanas', fr: 'semaines', de: 'Wochen', pt: 'semanas' },
  months: { en: 'months (approx)', it: 'mesi (circa)', es: 'meses (aprox)', fr: 'mois (env.)', de: 'Monate (ca.)', pt: 'meses (aprox.)' },
};

export default function DateCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['date-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const today = new Date().toISOString().split('T')[0];
  const [mode, setMode] = useState<'between' | 'add'>('between');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [baseDate, setBaseDate] = useState(today);
  const [daysToAdd, setDaysToAdd] = useState('');

  // Days between
  const d1 = new Date(startDate);
  const d2 = new Date(endDate);
  const diffMs = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = (diffDays / 7).toFixed(1);
  const diffMonths = (diffDays / 30.44).toFixed(1);

  // Add days
  const addNum = parseInt(daysToAdd) || 0;
  const resultDate = new Date(baseDate);
  resultDate.setDate(resultDate.getDate() + addNum);
  const resultStr = resultDate.toISOString().split('T')[0];

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setMode('between')}
            className={`flex-1 py-2 rounded-lg font-medium text-sm ${mode === 'between' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
            {t('modeBetween')}
          </button>
          <button onClick={() => setMode('add')}
            className={`flex-1 py-2 rounded-lg font-medium text-sm ${mode === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
            {t('modeAdd')}
          </button>
        </div>

        {mode === 'between' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('startDate')}</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('endDate')}</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div className="p-4 bg-blue-50 rounded-lg space-y-2">
              <div className="text-sm text-gray-600">{t('difference')}</div>
              <div className="text-2xl font-bold text-blue-600">{Math.abs(diffDays)} {t('days')}</div>
              <div className="text-sm text-gray-500">{diffWeeks} {t('weeks')} &middot; {diffMonths} {t('months')}</div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')}</label>
              <input type="date" value={baseDate} onChange={(e) => setBaseDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('addDays')}</label>
              <input type="number" value={daysToAdd} onChange={(e) => setDaysToAdd(e.target.value)} placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            {addNum !== 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">{t('resultDate')}</div>
                <div className="text-xl font-bold text-blue-600">{formatDate(resultStr)}</div>
                <div className="text-sm text-gray-500">{resultStr}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
