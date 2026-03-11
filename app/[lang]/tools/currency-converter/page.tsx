'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const rates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CHF: 0.88,
  CAD: 1.36,
  AUD: 1.53,
  CNY: 7.24,
};

const currencyNames: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CHF: 'Swiss Franc',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  CNY: 'Chinese Yuan',
};

const labels: Record<string, Record<Locale, string>> = {
  amount: { en: 'Amount', it: 'Importo', es: 'Cantidad', fr: 'Montant', de: 'Betrag', pt: 'Valor' },
  from: { en: 'From', it: 'Da', es: 'De', fr: 'De', de: 'Von', pt: 'De' },
  to: { en: 'To', it: 'A', es: 'A', fr: 'À', de: 'Zu', pt: 'Para' },
  result: { en: 'Result', it: 'Risultato', es: 'Resultado', fr: 'Résultat', de: 'Ergebnis', pt: 'Resultado' },
  swap: { en: 'Swap', it: 'Inverti', es: 'Invertir', fr: 'Inverser', de: 'Tauschen', pt: 'Inverter' },
  note: { en: 'Rates are approximate and for reference only.', it: 'I tassi sono approssimativi e solo indicativi.', es: 'Las tasas son aproximadas y solo de referencia.', fr: 'Les taux sont approximatifs et indicatifs uniquement.', de: 'Kurse sind ungefähre Richtwerte.', pt: 'As taxas são aproximadas e apenas para referência.' },
};

export default function CurrencyConverter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['currency-converter'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');

  const num = parseFloat(amount) || 0;
  const inUsd = num / rates[fromCurrency];
  const converted = inUsd * rates[toCurrency];
  const exchangeRate = rates[toCurrency] / rates[fromCurrency];

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const currencies = Object.keys(rates);

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('amount')}</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('from')}</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>{c} - {currencyNames[c]}</option>
              ))}
            </select>
          </div>
          <button
            onClick={swap}
            className="mb-0.5 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium text-gray-700"
          >
            &#8646;
          </button>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('to')}</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>{c} - {currencyNames[c]}</option>
              ))}
            </select>
          </div>
        </div>

        {num > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>1 {fromCurrency} =</span>
              <span>{exchangeRate.toFixed(4)} {toCurrency}</span>
            </div>
            <hr className="border-blue-200" />
            <div className="flex justify-between text-lg">
              <span className="font-bold text-gray-900">{num.toFixed(2)} {fromCurrency}</span>
              <span className="font-bold text-blue-600">{converted.toFixed(2)} {toCurrency}</span>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">{t('note')}</p>
      </div>
    </div>
  );
}
