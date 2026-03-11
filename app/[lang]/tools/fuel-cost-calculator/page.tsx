'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<Locale, string>> = {
  distance: { en: 'Distance', it: 'Distanza', es: 'Distancia', fr: 'Distance', de: 'Entfernung', pt: 'Distância' },
  consumption: { en: 'Fuel Consumption', it: 'Consumo Carburante', es: 'Consumo de Combustible', fr: 'Consommation', de: 'Kraftstoffverbrauch', pt: 'Consumo de Combustível' },
  fuelPrice: { en: 'Fuel Price', it: 'Prezzo Carburante', es: 'Precio Combustible', fr: 'Prix du Carburant', de: 'Kraftstoffpreis', pt: 'Preço Combustível' },
  tripCost: { en: 'Trip Cost', it: 'Costo Viaggio', es: 'Costo del Viaje', fr: 'Coût du Trajet', de: 'Fahrtkosten', pt: 'Custo da Viagem' },
  fuelUsed: { en: 'Fuel Used', it: 'Carburante Usato', es: 'Combustible Usado', fr: 'Carburant Utilisé', de: 'Verbrauchter Kraftstoff', pt: 'Combustível Usado' },
  metric: { en: 'Metric (L/100km)', it: 'Metrico (L/100km)', es: 'Métrico (L/100km)', fr: 'Métrique (L/100km)', de: 'Metrisch (L/100km)', pt: 'Métrico (L/100km)' },
  imperial: { en: 'Imperial (MPG)', it: 'Imperiale (MPG)', es: 'Imperial (MPG)', fr: 'Impérial (MPG)', de: 'Imperial (MPG)', pt: 'Imperial (MPG)' },
  km: { en: 'km', it: 'km', es: 'km', fr: 'km', de: 'km', pt: 'km' },
  miles: { en: 'miles', it: 'miglia', es: 'millas', fr: 'miles', de: 'Meilen', pt: 'milhas' },
  perLiter: { en: '/liter', it: '/litro', es: '/litro', fr: '/litre', de: '/Liter', pt: '/litro' },
  perGallon: { en: '/gallon', it: '/gallone', es: '/galón', fr: '/gallon', de: '/Gallone', pt: '/galão' },
  liters: { en: 'liters', it: 'litri', es: 'litros', fr: 'litres', de: 'Liter', pt: 'litros' },
  gallons: { en: 'gallons', it: 'galloni', es: 'galones', fr: 'gallons', de: 'Gallonen', pt: 'galões' },
  roundTrip: { en: 'Round Trip', it: 'Andata e Ritorno', es: 'Ida y Vuelta', fr: 'Aller-Retour', de: 'Hin- und Rückfahrt', pt: 'Ida e Volta' },
};

export default function FuelCostCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['fuel-cost-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [mode, setMode] = useState<'metric' | 'imperial'>('metric');
  const [distance, setDistance] = useState('100');
  const [consumption, setConsumption] = useState(mode === 'metric' ? '7' : '35');
  const [fuelPrice, setFuelPrice] = useState(mode === 'metric' ? '1.80' : '3.50');
  const [roundTrip, setRoundTrip] = useState(false);

  const dist = (parseFloat(distance) || 0) * (roundTrip ? 2 : 1);
  const cons = parseFloat(consumption) || 0;
  const price = parseFloat(fuelPrice) || 0;

  let fuelUsed = 0;
  let tripCost = 0;

  if (mode === 'metric') {
    // L/100km
    fuelUsed = (dist * cons) / 100;
    tripCost = fuelUsed * price;
  } else {
    // MPG (US gallons)
    fuelUsed = cons > 0 ? dist / cons : 0;
    tripCost = fuelUsed * price;
  }

  const switchMode = (newMode: 'metric' | 'imperial') => {
    setMode(newMode);
    if (newMode === 'metric') {
      setConsumption('7');
      setFuelPrice('1.80');
    } else {
      setConsumption('35');
      setFuelPrice('3.50');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => switchMode('metric')}
            className={`flex-1 py-2 rounded-lg font-medium ${mode === 'metric' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('metric')}
          </button>
          <button
            onClick={() => switchMode('imperial')}
            className={`flex-1 py-2 rounded-lg font-medium ${mode === 'imperial' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('imperial')}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('distance')} ({mode === 'metric' ? t('km') : t('miles')})
          </label>
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('consumption')} ({mode === 'metric' ? 'L/100km' : 'MPG'})
          </label>
          <input
            type="number"
            value={consumption}
            onChange={(e) => setConsumption(e.target.value)}
            step="0.1"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('fuelPrice')} ({mode === 'metric' ? t('perLiter') : t('perGallon')})
          </label>
          <input
            type="number"
            value={fuelPrice}
            onChange={(e) => setFuelPrice(e.target.value)}
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={roundTrip} onChange={(e) => setRoundTrip(e.target.checked)} className="rounded" />
          <span className="text-sm text-gray-700">{t('roundTrip')}</span>
        </label>

        {dist > 0 && cons > 0 && price > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('distance')}</span>
              <span className="font-semibold">{dist.toFixed(1)} {mode === 'metric' ? t('km') : t('miles')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('fuelUsed')}</span>
              <span className="font-semibold">{fuelUsed.toFixed(2)} {mode === 'metric' ? t('liters') : t('gallons')}</span>
            </div>
            <hr className="border-blue-200" />
            <div className="flex justify-between text-lg">
              <span className="font-bold text-gray-900">{t('tripCost')}</span>
              <span className="font-bold text-blue-600">{tripCost.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
