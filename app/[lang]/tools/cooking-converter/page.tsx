'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<Locale, string>> = {
  amount: { en: 'Amount', it: 'Quantità', es: 'Cantidad', fr: 'Quantité', de: 'Menge', pt: 'Quantidade' },
  from: { en: 'From', it: 'Da', es: 'De', fr: 'De', de: 'Von', pt: 'De' },
  to: { en: 'To', it: 'A', es: 'A', fr: 'À', de: 'Zu', pt: 'Para' },
  result: { en: 'Result', it: 'Risultato', es: 'Resultado', fr: 'Résultat', de: 'Ergebnis', pt: 'Resultado' },
  volume: { en: 'Volume', it: 'Volume', es: 'Volumen', fr: 'Volume', de: 'Volumen', pt: 'Volume' },
  weight: { en: 'Weight', it: 'Peso', es: 'Peso', fr: 'Poids', de: 'Gewicht', pt: 'Peso' },
  quickRef: { en: 'Quick Reference', it: 'Riferimento Rapido', es: 'Referencia Rápida', fr: 'Référence Rapide', de: 'Kurzübersicht', pt: 'Referência Rápida' },
};

// Volume units in ml
const volumeUnits: Record<string, { label: Record<Locale, string>; ml: number }> = {
  ml: { label: { en: 'Milliliters (ml)', it: 'Millilitri (ml)', es: 'Mililitros (ml)', fr: 'Millilitres (ml)', de: 'Milliliter (ml)', pt: 'Mililitros (ml)' }, ml: 1 },
  l: { label: { en: 'Liters (L)', it: 'Litri (L)', es: 'Litros (L)', fr: 'Litres (L)', de: 'Liter (L)', pt: 'Litros (L)' }, ml: 1000 },
  tsp: { label: { en: 'Teaspoons (tsp)', it: 'Cucchiaini (tsp)', es: 'Cucharaditas (tsp)', fr: 'Cuillères à café (cc)', de: 'Teelöffel (TL)', pt: 'Colheres de chá (cc)' }, ml: 4.929 },
  tbsp: { label: { en: 'Tablespoons (tbsp)', it: 'Cucchiai (tbsp)', es: 'Cucharadas (tbsp)', fr: 'Cuillères à soupe (cs)', de: 'Esslöffel (EL)', pt: 'Colheres de sopa (cs)' }, ml: 14.787 },
  cup: { label: { en: 'Cups', it: 'Tazze', es: 'Tazas', fr: 'Tasses', de: 'Tassen', pt: 'Xícaras' }, ml: 236.588 },
  floz: { label: { en: 'Fluid Ounces (fl oz)', it: 'Once Fluide (fl oz)', es: 'Onzas Fluidas (fl oz)', fr: 'Onces Liquides (fl oz)', de: 'Flüssigunzen (fl oz)', pt: 'Onças Fluidas (fl oz)' }, ml: 29.574 },
};

// Weight units in grams
const weightUnits: Record<string, { label: Record<Locale, string>; g: number }> = {
  g: { label: { en: 'Grams (g)', it: 'Grammi (g)', es: 'Gramos (g)', fr: 'Grammes (g)', de: 'Gramm (g)', pt: 'Gramas (g)' }, g: 1 },
  kg: { label: { en: 'Kilograms (kg)', it: 'Chilogrammi (kg)', es: 'Kilogramos (kg)', fr: 'Kilogrammes (kg)', de: 'Kilogramm (kg)', pt: 'Quilogramas (kg)' }, g: 1000 },
  oz: { label: { en: 'Ounces (oz)', it: 'Once (oz)', es: 'Onzas (oz)', fr: 'Onces (oz)', de: 'Unzen (oz)', pt: 'Onças (oz)' }, g: 28.3495 },
  lb: { label: { en: 'Pounds (lb)', it: 'Libbre (lb)', es: 'Libras (lb)', fr: 'Livres (lb)', de: 'Pfund (lb)', pt: 'Libras (lb)' }, g: 453.592 },
};

type Category = 'volume' | 'weight';

export default function CookingConverter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['cooking-converter'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [category, setCategory] = useState<Category>('volume');
  const [amount, setAmount] = useState('1');
  const [fromUnit, setFromUnit] = useState('cup');
  const [toUnit, setToUnit] = useState('ml');

  const num = parseFloat(amount) || 0;

  let result = 0;
  if (category === 'volume') {
    const fromMl = volumeUnits[fromUnit]?.ml || 1;
    const toMl = volumeUnits[toUnit]?.ml || 1;
    result = (num * fromMl) / toMl;
  } else {
    const fromG = weightUnits[fromUnit]?.g || 1;
    const toG = weightUnits[toUnit]?.g || 1;
    result = (num * fromG) / toG;
  }

  const units = category === 'volume' ? volumeUnits : weightUnits;

  const switchCategory = (cat: Category) => {
    setCategory(cat);
    if (cat === 'volume') { setFromUnit('cup'); setToUnit('ml'); }
    else { setFromUnit('g'); setToUnit('oz'); }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => switchCategory('volume')}
            className={`flex-1 py-2 rounded-lg font-medium ${category === 'volume' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('volume')}
          </button>
          <button
            onClick={() => switchCategory('weight')}
            className={`flex-1 py-2 rounded-lg font-medium ${category === 'weight' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('weight')}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('amount')}</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.1"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('from')}</label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(units).map(([key, unit]) => (
                <option key={key} value={key}>{unit.label[lang]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('to')}</label>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(units).map(([key, unit]) => (
                <option key={key} value={key}>{unit.label[lang]}</option>
              ))}
            </select>
          </div>
        </div>

        {num > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between text-lg">
              <span className="font-bold text-gray-900">{t('result')}</span>
              <span className="font-bold text-blue-600">
                {result < 0.01 ? result.toExponential(2) : result.toFixed(result < 10 ? 3 : 2)}
              </span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('quickRef')}</label>
          <div className="text-sm text-gray-600 space-y-1 bg-gray-50 rounded-lg p-3">
            <p>1 cup = 236.6 ml = 16 tbsp</p>
            <p>1 tbsp = 14.8 ml = 3 tsp</p>
            <p>1 fl oz = 29.6 ml</p>
            <p>1 oz = 28.3 g</p>
            <p>1 lb = 453.6 g</p>
          </div>
        </div>
      </div>
    </div>
  );
}
