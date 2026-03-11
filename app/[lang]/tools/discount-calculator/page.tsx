'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<string, string>> = {
  originalPrice: { en: 'Original Price', it: 'Prezzo Originale', es: 'Precio Original', fr: 'Prix Original', de: 'Originalpreis', pt: 'Preço Original' },
  discountPercent: { en: 'Discount (%)', it: 'Sconto (%)', es: 'Descuento (%)', fr: 'Remise (%)', de: 'Rabatt (%)', pt: 'Desconto (%)' },
  finalPrice: { en: 'Final Price', it: 'Prezzo Finale', es: 'Precio Final', fr: 'Prix Final', de: 'Endpreis', pt: 'Preço Final' },
  youSave: { en: 'You Save', it: 'Risparmi', es: 'Ahorras', fr: 'Vous Économisez', de: 'Sie Sparen', pt: 'Você Economiza' },
};

export default function DiscountCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['discount-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');

  const priceNum = parseFloat(price) || 0;
  const discountNum = parseFloat(discount) || 0;
  const saved = priceNum * (discountNum / 100);
  const finalPrice = priceNum - saved;

  const presets = [10, 15, 20, 25, 30, 50];

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('originalPrice')}</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('discountPercent')}</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {presets.map((p) => (
              <button key={p} onClick={() => setDiscount(String(p))}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${String(p) === discount ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {p}%
              </button>
            ))}
          </div>
          <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        {priceNum > 0 && discountNum > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('youSave')}</span>
              <span className="font-semibold text-green-600">${saved.toFixed(2)}</span>
            </div>
            <hr className="border-blue-200" />
            <div className="flex justify-between text-lg">
              <span className="font-bold text-gray-900">{t('finalPrice')}</span>
              <span className="font-bold text-blue-600">${finalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
