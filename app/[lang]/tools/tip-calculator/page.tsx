'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<string, string>> = {
  billAmount: { en: 'Bill Amount', it: 'Importo Conto', es: 'Monto de la Cuenta', fr: 'Montant de la Note', de: 'Rechnungsbetrag', pt: 'Valor da Conta' },
  tipPercent: { en: 'Tip Percentage (%)', it: 'Percentuale Mancia (%)', es: 'Porcentaje de Propina (%)', fr: 'Pourcentage Pourboire (%)', de: 'Trinkgeld-Prozent (%)', pt: 'Percentual de Gorjeta (%)' },
  numPeople: { en: 'Number of People', it: 'Numero di Persone', es: 'Número de Personas', fr: 'Nombre de Personnes', de: 'Anzahl Personen', pt: 'Número de Pessoas' },
  tipAmount: { en: 'Tip Amount', it: 'Mancia Totale', es: 'Propina Total', fr: 'Pourboire Total', de: 'Trinkgeld Gesamt', pt: 'Gorjeta Total' },
  totalAmount: { en: 'Total Amount', it: 'Importo Totale', es: 'Monto Total', fr: 'Montant Total', de: 'Gesamtbetrag', pt: 'Valor Total' },
  tipPerPerson: { en: 'Tip per Person', it: 'Mancia per Persona', es: 'Propina por Persona', fr: 'Pourboire par Personne', de: 'Trinkgeld pro Person', pt: 'Gorjeta por Pessoa' },
  totalPerPerson: { en: 'Total per Person', it: 'Totale per Persona', es: 'Total por Persona', fr: 'Total par Personne', de: 'Gesamt pro Person', pt: 'Total por Pessoa' },
};

export default function TipCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['tip-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [bill, setBill] = useState('');
  const [tipPct, setTipPct] = useState('15');
  const [people, setPeople] = useState('1');

  const billNum = parseFloat(bill) || 0;
  const tipNum = parseFloat(tipPct) || 0;
  const peopleNum = Math.max(parseInt(people) || 1, 1);

  const tipAmount = billNum * (tipNum / 100);
  const total = billNum + tipAmount;
  const tipPerPerson = tipAmount / peopleNum;
  const totalPerPerson = total / peopleNum;

  const presets = [10, 15, 18, 20, 25];

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('billAmount')}</label>
          <input type="number" value={bill} onChange={(e) => setBill(e.target.value)} placeholder="0.00"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('tipPercent')}</label>
          <div className="flex gap-2 mb-2">
            {presets.map((p) => (
              <button key={p} onClick={() => setTipPct(String(p))}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${String(p) === tipPct ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {p}%
              </button>
            ))}
          </div>
          <input type="number" value={tipPct} onChange={(e) => setTipPct(e.target.value)} placeholder="15"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('numPeople')}</label>
          <input type="number" value={people} onChange={(e) => setPeople(e.target.value)} min="1" placeholder="1"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        {billNum > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('tipAmount')}</span>
              <span className="font-semibold">${tipAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('totalAmount')}</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            {peopleNum > 1 && (
              <>
                <hr className="border-blue-200" />
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('tipPerPerson')}</span>
                  <span className="font-semibold">${tipPerPerson.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('totalPerPerson')}</span>
                  <span className="font-bold text-blue-600 text-lg">${totalPerPerson.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
