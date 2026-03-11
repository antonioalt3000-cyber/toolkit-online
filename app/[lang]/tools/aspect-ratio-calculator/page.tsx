'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<Locale, string>> = {
  width: { en: 'Width (px)', it: 'Larghezza (px)', es: 'Ancho (px)', fr: 'Largeur (px)', de: 'Breite (px)', pt: 'Largura (px)' },
  height: { en: 'Height (px)', it: 'Altezza (px)', es: 'Alto (px)', fr: 'Hauteur (px)', de: 'Höhe (px)', pt: 'Altura (px)' },
  commonRatios: { en: 'Common Ratios', it: 'Rapporti Comuni', es: 'Proporciones Comunes', fr: 'Ratios Courants', de: 'Gängige Verhältnisse', pt: 'Proporções Comuns' },
  customRatio: { en: 'Custom Ratio', it: 'Rapporto Personalizzato', es: 'Proporción Personalizada', fr: 'Ratio Personnalisé', de: 'Eigenes Verhältnis', pt: 'Proporção Personalizada' },
  ratioW: { en: 'Ratio W', it: 'Rapporto L', es: 'Proporción A', fr: 'Ratio L', de: 'Verhältnis B', pt: 'Proporção L' },
  ratioH: { en: 'Ratio H', it: 'Rapporto A', es: 'Proporción Al', fr: 'Ratio H', de: 'Verhältnis H', pt: 'Proporção A' },
  results: { en: 'Calculated Dimensions', it: 'Dimensioni Calcolate', es: 'Dimensiones Calculadas', fr: 'Dimensions Calculées', de: 'Berechnete Maße', pt: 'Dimensões Calculadas' },
  ratio: { en: 'Ratio', it: 'Rapporto', es: 'Proporción', fr: 'Ratio', de: 'Verhältnis', pt: 'Proporção' },
};

const commonRatios = [
  { name: '16:9', w: 16, h: 9 },
  { name: '4:3', w: 4, h: 3 },
  { name: '1:1', w: 1, h: 1 },
  { name: '21:9', w: 21, h: 9 },
  { name: '3:2', w: 3, h: 2 },
  { name: '9:16', w: 9, h: 16 },
];

export default function AspectRatioCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['aspect-ratio-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [width, setWidth] = useState('1920');
  const [customW, setCustomW] = useState('16');
  const [customH, setCustomH] = useState('9');

  const w = parseInt(width) || 0;
  const cw = parseInt(customW) || 1;
  const ch = parseInt(customH) || 1;

  const allRatios = [...commonRatios, { name: `${cw}:${ch}`, w: cw, h: ch }];

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('width')}</label>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('customRatio')}</label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={customW}
              onChange={(e) => setCustomW(e.target.value)}
              min="1"
              className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500 font-bold">:</span>
            <input
              type="number"
              value={customH}
              onChange={(e) => setCustomH(e.target.value)}
              min="1"
              className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {w > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('results')}</label>
            <div className="space-y-2">
              {allRatios.map((ratio) => {
                const height = Math.round(w * ratio.h / ratio.w);
                return (
                  <div key={ratio.name} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <span className="font-semibold text-gray-900">{ratio.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-blue-600 font-semibold">{w} x {height}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
