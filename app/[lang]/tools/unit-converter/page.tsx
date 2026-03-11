'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const categories: Record<string, { units: string[]; toBase: Record<string, number> }> = {
  length: {
    units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
    toBase: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 },
  },
  weight: {
    units: ['mg', 'g', 'kg', 'lb', 'oz', 't'],
    toBase: { mg: 0.001, g: 1, kg: 1000, lb: 453.592, oz: 28.3495, t: 1000000 },
  },
  temperature: { units: ['°C', '°F', 'K'], toBase: {} },
  speed: {
    units: ['m/s', 'km/h', 'mph', 'knots'],
    toBase: { 'm/s': 1, 'km/h': 0.277778, mph: 0.44704, knots: 0.514444 },
  },
};

const catLabels: Record<string, Record<Locale, string>> = {
  length: { en: 'Length', it: 'Lunghezza', es: 'Longitud', fr: 'Longueur', de: 'Länge', pt: 'Comprimento' },
  weight: { en: 'Weight', it: 'Peso', es: 'Peso', fr: 'Poids', de: 'Gewicht', pt: 'Peso' },
  temperature: { en: 'Temperature', it: 'Temperatura', es: 'Temperatura', fr: 'Température', de: 'Temperatur', pt: 'Temperatura' },
  speed: { en: 'Speed', it: 'Velocità', es: 'Velocidad', fr: 'Vitesse', de: 'Geschwindigkeit', pt: 'Velocidade' },
};

function convertTemp(value: number, from: string, to: string): number {
  let celsius: number;
  if (from === '°C') celsius = value;
  else if (from === '°F') celsius = (value - 32) * 5 / 9;
  else celsius = value - 273.15;

  if (to === '°C') return celsius;
  if (to === '°F') return celsius * 9 / 5 + 32;
  return celsius + 273.15;
}

export default function UnitConverter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['unit-converter'][lang];

  const [cat, setCat] = useState('length');
  const [fromUnit, setFromUnit] = useState(categories.length.units[0]);
  const [toUnit, setToUnit] = useState(categories.length.units[2]);
  const [value, setValue] = useState('');

  const currentCat = categories[cat];
  const num = parseFloat(value) || 0;

  let result = 0;
  if (cat === 'temperature') {
    result = convertTemp(num, fromUnit, toUnit);
  } else {
    const baseValue = num * (currentCat.toBase[fromUnit] || 1);
    result = baseValue / (currentCat.toBase[toUnit] || 1);
  }

  const changeCat = (newCat: string) => {
    setCat(newCat);
    setFromUnit(categories[newCat].units[0]);
    setToUnit(categories[newCat].units[1]);
    setValue('');
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {Object.keys(categories).map((c) => (
            <button key={c} onClick={() => changeCat(c)} className={`px-4 py-2 rounded-lg text-sm font-medium ${c === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {catLabels[c]?.[lang] || c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2">
              {currentCat.units.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2">
              {currentCat.units.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <div className="w-full border border-gray-200 bg-blue-50 rounded-lg px-4 py-2 text-lg font-semibold text-blue-700">
              {num ? result.toLocaleString(lang, { maximumFractionDigits: 6 }) : '0'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
