'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

export default function BmiCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['bmi-calculator'][lang];

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;
  const bmi = h > 0 ? w / ((h / 100) ** 2) : 0;

  const labels = {
    weight: { en: 'Weight (kg)', it: 'Peso (kg)', es: 'Peso (kg)', fr: 'Poids (kg)', de: 'Gewicht (kg)', pt: 'Peso (kg)' },
    height: { en: 'Height (cm)', it: 'Altezza (cm)', es: 'Altura (cm)', fr: 'Taille (cm)', de: 'Größe (cm)', pt: 'Altura (cm)' },
    underweight: { en: 'Underweight', it: 'Sottopeso', es: 'Bajo peso', fr: 'Insuffisance pondérale', de: 'Untergewicht', pt: 'Abaixo do peso' },
    normal: { en: 'Normal weight', it: 'Normopeso', es: 'Peso normal', fr: 'Poids normal', de: 'Normalgewicht', pt: 'Peso normal' },
    overweight: { en: 'Overweight', it: 'Sovrappeso', es: 'Sobrepeso', fr: 'Surpoids', de: 'Übergewicht', pt: 'Sobrepeso' },
    obese: { en: 'Obese', it: 'Obesità', es: 'Obesidad', fr: 'Obésité', de: 'Adipositas', pt: 'Obesidade' },
  } as Record<string, Record<Locale, string>>;

  const getCategory = () => {
    if (bmi < 18.5) return { text: labels.underweight[lang], color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (bmi < 25) return { text: labels.normal[lang], color: 'text-green-600', bg: 'bg-green-50' };
    if (bmi < 30) return { text: labels.overweight[lang], color: 'text-orange-600', bg: 'bg-orange-50' };
    return { text: labels.obese[lang], color: 'text-red-600', bg: 'bg-red-50' };
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{labels.weight[lang]}</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{labels.height[lang]}</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
        </div>

        {bmi > 0 && (
          <div className={`p-5 rounded-lg ${getCategory().bg} text-center`}>
            <div className="text-4xl font-bold text-gray-900">{bmi.toFixed(1)}</div>
            <div className={`text-lg font-semibold mt-1 ${getCategory().color}`}>{getCategory().text}</div>
          </div>
        )}

        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex justify-between"><span>{'< 18.5'}</span><span>{labels.underweight[lang]}</span></div>
          <div className="flex justify-between"><span>18.5 – 24.9</span><span>{labels.normal[lang]}</span></div>
          <div className="flex justify-between"><span>25 – 29.9</span><span>{labels.overweight[lang]}</span></div>
          <div className="flex justify-between"><span>{'≥ 30'}</span><span>{labels.obese[lang]}</span></div>
        </div>
      </div>
    </div>
  );
}
