'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<Locale, string>> = {
  propertyValue: { en: 'Property Value', it: 'Valore Immobile', es: 'Valor de la Propiedad', fr: 'Valeur du Bien', de: 'Immobilienwert', pt: 'Valor do Imóvel' },
  downPayment: { en: 'Down Payment', it: 'Anticipo', es: 'Entrada', fr: 'Apport', de: 'Anzahlung', pt: 'Entrada' },
  interestRate: { en: 'Interest Rate (%/year)', it: 'Tasso d\'Interesse (%/anno)', es: 'Tasa de Interés (%/año)', fr: 'Taux d\'Intérêt (%/an)', de: 'Zinssatz (%/Jahr)', pt: 'Taxa de Juros (%/ano)' },
  years: { en: 'Loan Term (years)', it: 'Durata (anni)', es: 'Plazo (años)', fr: 'Durée (années)', de: 'Laufzeit (Jahre)', pt: 'Prazo (anos)' },
  monthlyPayment: { en: 'Monthly Payment', it: 'Rata Mensile', es: 'Pago Mensual', fr: 'Mensualité', de: 'Monatliche Rate', pt: 'Parcela Mensal' },
  loanAmount: { en: 'Loan Amount', it: 'Importo Prestito', es: 'Monto del Préstamo', fr: 'Montant du Prêt', de: 'Darlehensbetrag', pt: 'Valor do Empréstimo' },
  totalInterest: { en: 'Total Interest', it: 'Interessi Totali', es: 'Interés Total', fr: 'Intérêts Totaux', de: 'Gesamtzinsen', pt: 'Juros Totais' },
  totalCost: { en: 'Total Cost', it: 'Costo Totale', es: 'Costo Total', fr: 'Coût Total', de: 'Gesamtkosten', pt: 'Custo Total' },
};

export default function MortgageCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['mortgage-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [propertyValue, setPropertyValue] = useState('300000');
  const [downPayment, setDownPayment] = useState('60000');
  const [interestRate, setInterestRate] = useState('3.5');
  const [years, setYears] = useState('25');

  const pv = parseFloat(propertyValue) || 0;
  const dp = parseFloat(downPayment) || 0;
  const rate = (parseFloat(interestRate) || 0) / 100 / 12;
  const n = (parseInt(years) || 0) * 12;
  const loanAmount = Math.max(pv - dp, 0);

  let monthlyPayment = 0;
  if (rate > 0 && n > 0 && loanAmount > 0) {
    monthlyPayment = loanAmount * (rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
  } else if (n > 0 && loanAmount > 0) {
    monthlyPayment = loanAmount / n;
  }

  const totalCost = monthlyPayment * n;
  const totalInterest = totalCost - loanAmount;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {[
          { label: t('propertyValue'), value: propertyValue, setter: setPropertyValue },
          { label: t('downPayment'), value: downPayment, setter: setDownPayment },
          { label: t('interestRate'), value: interestRate, setter: setInterestRate },
          { label: t('years'), value: years, setter: setYears },
        ].map(({ label, value, setter }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ))}

        {loanAmount > 0 && n > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('loanAmount')}</span>
              <span className="font-semibold">{loanAmount.toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('totalInterest')}</span>
              <span className="font-semibold">{totalInterest.toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('totalCost')}</span>
              <span className="font-semibold">{totalCost.toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <hr className="border-blue-200" />
            <div className="flex justify-between text-lg">
              <span className="font-bold text-gray-900">{t('monthlyPayment')}</span>
              <span className="font-bold text-blue-600">{monthlyPayment.toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
