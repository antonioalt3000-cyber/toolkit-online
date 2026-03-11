'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<string, string>> = {
  amount: { en: 'Loan Amount', it: 'Importo Prestito', es: 'Monto del Préstamo', fr: 'Montant du Prêt', de: 'Darlehensbetrag', pt: 'Valor do Empréstimo' },
  rate: { en: 'Annual Interest Rate (%)', it: 'Tasso Annuo (%)', es: 'Tasa Anual (%)', fr: 'Taux Annuel (%)', de: 'Jahreszins (%)', pt: 'Taxa Anual (%)' },
  years: { en: 'Loan Term (years)', it: 'Durata (anni)', es: 'Plazo (años)', fr: 'Durée (années)', de: 'Laufzeit (Jahre)', pt: 'Prazo (anos)' },
  monthly: { en: 'Monthly Payment', it: 'Rata Mensile', es: 'Pago Mensual', fr: 'Mensualité', de: 'Monatliche Rate', pt: 'Pagamento Mensal' },
  totalPaid: { en: 'Total Paid', it: 'Totale Pagato', es: 'Total Pagado', fr: 'Total Payé', de: 'Gesamtbetrag', pt: 'Total Pago' },
  totalInterest: { en: 'Total Interest', it: 'Interessi Totali', es: 'Interés Total', fr: 'Intérêts Totaux', de: 'Gesamtzinsen', pt: 'Juros Totais' },
  amortization: { en: 'Amortization Summary', it: 'Riepilogo Ammortamento', es: 'Resumen de Amortización', fr: 'Résumé Amortissement', de: 'Tilgungsübersicht', pt: 'Resumo da Amortização' },
  year: { en: 'Year', it: 'Anno', es: 'Año', fr: 'Année', de: 'Jahr', pt: 'Ano' },
  principal: { en: 'Principal', it: 'Capitale', es: 'Capital', fr: 'Capital', de: 'Tilgung', pt: 'Capital' },
  interest: { en: 'Interest', it: 'Interessi', es: 'Interés', fr: 'Intérêts', de: 'Zinsen', pt: 'Juros' },
  balance: { en: 'Balance', it: 'Saldo', es: 'Saldo', fr: 'Solde', de: 'Restschuld', pt: 'Saldo' },
};

export default function LoanCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['loan-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');

  const principal = parseFloat(amount) || 0;
  const annualRate = parseFloat(rate) || 0;
  const term = parseInt(years) || 0;
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = term * 12;

  let monthlyPayment = 0;
  let totalPaid = 0;
  let totalInterest = 0;

  if (principal > 0 && annualRate > 0 && term > 0) {
    monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    totalPaid = monthlyPayment * numPayments;
    totalInterest = totalPaid - principal;
  } else if (principal > 0 && annualRate === 0 && term > 0) {
    monthlyPayment = principal / numPayments;
    totalPaid = principal;
    totalInterest = 0;
  }

  const amortizationByYear: { year: number; principalPaid: number; interestPaid: number; balance: number }[] = [];
  if (monthlyPayment > 0 && annualRate > 0) {
    let bal = principal;
    for (let y = 1; y <= term; y++) {
      let yPrincipal = 0;
      let yInterest = 0;
      for (let m = 0; m < 12; m++) {
        const intPart = bal * monthlyRate;
        const prinPart = monthlyPayment - intPart;
        yInterest += intPart;
        yPrincipal += prinPart;
        bal -= prinPart;
      }
      amortizationByYear.push({ year: y, principalPaid: yPrincipal, interestPaid: yInterest, balance: Math.max(bal, 0) });
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {[
          { key: 'amount', value: amount, setter: setAmount, type: 'number' },
          { key: 'rate', value: rate, setter: setRate, type: 'number' },
          { key: 'years', value: years, setter: setYears, type: 'number' },
        ].map(({ key, value, setter, type }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t(key)}</label>
            <input
              type={type}
              value={value}
              onChange={(e) => setter(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ))}

        {monthlyPayment > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('monthly')}</span>
              <span className="font-bold text-blue-600 text-lg">${monthlyPayment.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('totalPaid')}</span>
              <span className="font-semibold">${totalPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('totalInterest')}</span>
              <span className="font-semibold text-red-600">${totalInterest.toFixed(2)}</span>
            </div>
          </div>
        )}

        {amortizationByYear.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-900 mb-2">{t('amortization')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 py-1 text-left">{t('year')}</th>
                    <th className="px-2 py-1 text-right">{t('principal')}</th>
                    <th className="px-2 py-1 text-right">{t('interest')}</th>
                    <th className="px-2 py-1 text-right">{t('balance')}</th>
                  </tr>
                </thead>
                <tbody>
                  {amortizationByYear.map((row) => (
                    <tr key={row.year} className="border-t border-gray-100">
                      <td className="px-2 py-1">{row.year}</td>
                      <td className="px-2 py-1 text-right">${row.principalPaid.toFixed(2)}</td>
                      <td className="px-2 py-1 text-right">${row.interestPaid.toFixed(2)}</td>
                      <td className="px-2 py-1 text-right">${row.balance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
