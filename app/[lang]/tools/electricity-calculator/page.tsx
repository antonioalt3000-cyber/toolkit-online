'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<string, string>> = {
  watts: { en: 'Power (Watts)', it: 'Potenza (Watt)', es: 'Potencia (Vatios)', fr: 'Puissance (Watts)', de: 'Leistung (Watt)', pt: 'Potência (Watts)' },
  hoursPerDay: { en: 'Hours per Day', it: 'Ore al Giorno', es: 'Horas por Día', fr: 'Heures par Jour', de: 'Stunden pro Tag', pt: 'Horas por Dia' },
  days: { en: 'Number of Days', it: 'Numero di Giorni', es: 'Número de Días', fr: 'Nombre de Jours', de: 'Anzahl Tage', pt: 'Número de Dias' },
  rate: { en: 'Electricity Rate ($/kWh)', it: 'Tariffa (€/kWh)', es: 'Tarifa ($/kWh)', fr: 'Tarif (€/kWh)', de: 'Strompreis (€/kWh)', pt: 'Tarifa (R$/kWh)' },
  energyUsed: { en: 'Energy Used', it: 'Energia Consumata', es: 'Energía Utilizada', fr: 'Énergie Utilisée', de: 'Energieverbrauch', pt: 'Energia Utilizada' },
  dailyCost: { en: 'Daily Cost', it: 'Costo Giornaliero', es: 'Costo Diario', fr: 'Coût Journalier', de: 'Tägliche Kosten', pt: 'Custo Diário' },
  totalCost: { en: 'Total Cost', it: 'Costo Totale', es: 'Costo Total', fr: 'Coût Total', de: 'Gesamtkosten', pt: 'Custo Total' },
  monthlyCost: { en: 'Monthly Estimate (30 days)', it: 'Stima Mensile (30 giorni)', es: 'Estimación Mensual (30 días)', fr: 'Estimation Mensuelle (30 jours)', de: 'Monatliche Schätzung (30 Tage)', pt: 'Estimativa Mensal (30 dias)' },
  yearlyCost: { en: 'Yearly Estimate', it: 'Stima Annuale', es: 'Estimación Anual', fr: 'Estimation Annuelle', de: 'Jährliche Schätzung', pt: 'Estimativa Anual' },
};

export default function ElectricityCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['electricity-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [watts, setWatts] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('');
  const [days, setDays] = useState('30');
  const [rate, setRate] = useState('0.12');

  const w = parseFloat(watts) || 0;
  const h = parseFloat(hoursPerDay) || 0;
  const d = parseFloat(days) || 0;
  const r = parseFloat(rate) || 0;

  const kwhTotal = (w * h * d) / 1000;
  const kwhDaily = (w * h) / 1000;
  const totalCost = kwhTotal * r;
  const dailyCost = kwhDaily * r;
  const monthlyCost = kwhDaily * 30 * r;
  const yearlyCost = kwhDaily * 365 * r;

  const currency = lang === 'pt' ? 'R$' : ['it', 'fr', 'de'].includes(lang) ? '€' : '$';

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {[
          { key: 'watts', value: watts, setter: setWatts, placeholder: '100' },
          { key: 'hoursPerDay', value: hoursPerDay, setter: setHoursPerDay, placeholder: '8' },
          { key: 'days', value: days, setter: setDays, placeholder: '30' },
          { key: 'rate', value: rate, setter: setRate, placeholder: '0.12' },
        ].map(({ key, value, setter, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t(key)}</label>
            <input type="number" value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        ))}

        {w > 0 && h > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('energyUsed')}</span>
              <span className="font-semibold">{kwhTotal.toFixed(2)} kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('dailyCost')}</span>
              <span className="font-semibold">{currency}{dailyCost.toFixed(2)}</span>
            </div>
            <hr className="border-blue-200" />
            <div className="flex justify-between">
              <span className="text-gray-600">{t('totalCost')} ({d} {labels.days[lang] || 'days'})</span>
              <span className="font-bold text-blue-600 text-lg">{currency}{totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('monthlyCost')}</span>
              <span className="font-semibold">{currency}{monthlyCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('yearlyCost')}</span>
              <span className="font-semibold">{currency}{yearlyCost.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
