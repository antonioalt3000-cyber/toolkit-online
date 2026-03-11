'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { common, tools, type Locale } from '@/lib/translations';

const vatRates: Record<string, number[]> = {
  it: [22, 10, 5, 4],
  es: [21, 10, 4],
  fr: [20, 10, 5.5, 2.1],
  de: [19, 7],
  pt: [23, 13, 6],
  en: [20, 15, 10, 5],
};

export default function VatCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const t = common[lang];
  const toolT = tools['vat-calculator'][lang];
  const rates = vatRates[lang] || vatRates.en;

  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(rates[0]);
  const [mode, setMode] = useState<'add' | 'remove'>('add');

  const num = parseFloat(amount) || 0;
  const vatAmount = mode === 'add' ? num * (rate / 100) : num - num / (1 + rate / 100);
  const total = mode === 'add' ? num + num * (rate / 100) : num / (1 + rate / 100);

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('add')}
            className={`flex-1 py-2 rounded-lg font-medium ${mode === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            + {lang === 'it' ? 'Aggiungi IVA' : lang === 'es' ? 'Añadir IVA' : lang === 'fr' ? 'Ajouter TVA' : lang === 'de' ? 'MwSt hinzufügen' : lang === 'pt' ? 'Adicionar IVA' : 'Add VAT'}
          </button>
          <button
            onClick={() => setMode('remove')}
            className={`flex-1 py-2 rounded-lg font-medium ${mode === 'remove' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            − {lang === 'it' ? 'Scorporo IVA' : lang === 'es' ? 'Quitar IVA' : lang === 'fr' ? 'Retirer TVA' : lang === 'de' ? 'MwSt entfernen' : lang === 'pt' ? 'Remover IVA' : 'Remove VAT'}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {lang === 'it' ? 'Importo (€)' : lang === 'es' ? 'Cantidad (€)' : lang === 'fr' ? 'Montant (€)' : lang === 'de' ? 'Betrag (€)' : lang === 'pt' ? 'Valor (€)' : 'Amount'}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {lang === 'it' ? 'Aliquota IVA' : lang === 'es' ? 'Tipo de IVA' : lang === 'fr' ? 'Taux TVA' : lang === 'de' ? 'MwSt-Satz' : lang === 'pt' ? 'Taxa IVA' : 'VAT Rate'}
          </label>
          <div className="flex gap-2">
            {rates.map((r) => (
              <button
                key={r}
                onClick={() => setRate(r)}
                className={`px-4 py-2 rounded-lg font-medium ${r === rate ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>

        {num > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{mode === 'add' ? (lang === 'it' ? 'Importo netto' : 'Net amount') : (lang === 'it' ? 'Importo con IVA' : 'Amount with VAT')}</span>
              <span className="font-semibold">€{num.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{lang === 'it' ? 'IVA' : 'VAT'} ({rate}%)</span>
              <span className="font-semibold">€{vatAmount.toFixed(2)}</span>
            </div>
            <hr className="border-blue-200" />
            <div className="flex justify-between text-lg">
              <span className="font-bold text-gray-900">{mode === 'add' ? (lang === 'it' ? 'Totale con IVA' : 'Total with VAT') : (lang === 'it' ? 'Importo netto' : 'Net amount')}</span>
              <span className="font-bold text-blue-600">€{total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
