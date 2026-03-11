'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<string, string>> = {
  grossSalary: { en: 'Gross Annual Salary', it: 'Stipendio Lordo Annuo', es: 'Salario Bruto Anual', fr: 'Salaire Brut Annuel', de: 'Bruttojahresgehalt', pt: 'Salário Bruto Anual' },
  taxBrackets: { en: 'Tax Brackets Applied', it: 'Scaglioni Fiscali', es: 'Tramos Fiscales', fr: 'Tranches Fiscales', de: 'Steuerstufen', pt: 'Faixas de Imposto' },
  totalTax: { en: 'Total Tax', it: 'Tasse Totali', es: 'Impuestos Totales', fr: 'Impôts Totaux', de: 'Gesamtsteuer', pt: 'Impostos Totais' },
  effectiveRate: { en: 'Effective Tax Rate', it: 'Aliquota Effettiva', es: 'Tasa Efectiva', fr: 'Taux Effectif', de: 'Effektiver Steuersatz', pt: 'Taxa Efetiva' },
  netAnnual: { en: 'Net Annual Salary', it: 'Stipendio Netto Annuo', es: 'Salario Neto Anual', fr: 'Salaire Net Annuel', de: 'Nettojahresgehalt', pt: 'Salário Líquido Anual' },
  netMonthly: { en: 'Net Monthly Salary', it: 'Stipendio Netto Mensile', es: 'Salario Neto Mensual', fr: 'Salaire Net Mensuel', de: 'Nettomonatsgehalt', pt: 'Salário Líquido Mensal' },
  bracket: { en: 'Bracket', it: 'Scaglione', es: 'Tramo', fr: 'Tranche', de: 'Stufe', pt: 'Faixa' },
  rate: { en: 'Rate', it: 'Aliquota', es: 'Tasa', fr: 'Taux', de: 'Satz', pt: 'Taxa' },
  taxable: { en: 'Taxable', it: 'Imponibile', es: 'Base Imponible', fr: 'Imposable', de: 'Steuerpflichtig', pt: 'Tributável' },
  tax: { en: 'Tax', it: 'Tassa', es: 'Impuesto', fr: 'Impôt', de: 'Steuer', pt: 'Imposto' },
};

const brackets = [
  { min: 0, max: 15000, rate: 10 },
  { min: 15000, max: 30000, rate: 15 },
  { min: 30000, max: 50000, rate: 25 },
  { min: 50000, max: 80000, rate: 30 },
  { min: 80000, max: Infinity, rate: 35 },
];

export default function SalaryCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['salary-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [gross, setGross] = useState('');
  const grossNum = parseFloat(gross) || 0;

  const taxDetails: { min: number; max: number; rate: number; taxable: number; tax: number }[] = [];
  let remaining = grossNum;
  let totalTax = 0;

  for (const b of brackets) {
    if (remaining <= 0) break;
    const width = b.max === Infinity ? remaining : b.max - b.min;
    const taxable = Math.min(remaining, width);
    const tax = taxable * (b.rate / 100);
    taxDetails.push({ ...b, taxable, tax });
    totalTax += tax;
    remaining -= taxable;
  }

  const netAnnual = grossNum - totalTax;
  const netMonthly = netAnnual / 12;
  const effectiveRate = grossNum > 0 ? (totalTax / grossNum) * 100 : 0;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('grossSalary')}</label>
          <input type="number" value={gross} onChange={(e) => setGross(e.target.value)} placeholder="0"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        {grossNum > 0 && (
          <>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">{t('taxBrackets')}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-2 py-1 text-left">{t('bracket')}</th>
                      <th className="px-2 py-1 text-right">{t('rate')}</th>
                      <th className="px-2 py-1 text-right">{t('taxable')}</th>
                      <th className="px-2 py-1 text-right">{t('tax')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxDetails.map((d, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-2 py-1">${d.min.toLocaleString()} - {d.max === Infinity ? '...' : `$${d.max.toLocaleString()}`}</td>
                        <td className="px-2 py-1 text-right">{d.rate}%</td>
                        <td className="px-2 py-1 text-right">${d.taxable.toFixed(2)}</td>
                        <td className="px-2 py-1 text-right">${d.tax.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('totalTax')}</span>
                <span className="font-semibold text-red-600">${totalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('effectiveRate')}</span>
                <span className="font-semibold">{effectiveRate.toFixed(1)}%</span>
              </div>
              <hr className="border-blue-200" />
              <div className="flex justify-between">
                <span className="text-gray-600">{t('netAnnual')}</span>
                <span className="font-bold text-blue-600 text-lg">${netAnnual.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('netMonthly')}</span>
                <span className="font-bold text-green-600 text-lg">${netMonthly.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
