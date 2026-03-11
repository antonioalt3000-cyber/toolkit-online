'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<string, string>> = {
  mode: { en: 'Calculate', it: 'Calcola', es: 'Calcular', fr: 'Calculer', de: 'Berechne', pt: 'Calcular' },
  speed: { en: 'Speed', it: 'Velocità', es: 'Velocidad', fr: 'Vitesse', de: 'Geschwindigkeit', pt: 'Velocidade' },
  distance: { en: 'Distance', it: 'Distanza', es: 'Distancia', fr: 'Distance', de: 'Entfernung', pt: 'Distância' },
  time: { en: 'Time', it: 'Tempo', es: 'Tiempo', fr: 'Temps', de: 'Zeit', pt: 'Tempo' },
  distanceUnit: { en: 'km', it: 'km', es: 'km', fr: 'km', de: 'km', pt: 'km' },
  speedUnit: { en: 'km/h', it: 'km/h', es: 'km/h', fr: 'km/h', de: 'km/h', pt: 'km/h' },
  hours: { en: 'hours', it: 'ore', es: 'horas', fr: 'heures', de: 'Stunden', pt: 'horas' },
  minutes: { en: 'minutes', it: 'minuti', es: 'minutos', fr: 'minutes', de: 'Minuten', pt: 'minutos' },
  result: { en: 'Result', it: 'Risultato', es: 'Resultado', fr: 'Résultat', de: 'Ergebnis', pt: 'Resultado' },
};

type Mode = 'speed' | 'distance' | 'time';

export default function SpeedCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['speed-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [mode, setMode] = useState<Mode>('speed');
  const [distance, setDistance] = useState('');
  const [speed, setSpeed] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');

  const distNum = parseFloat(distance) || 0;
  const spdNum = parseFloat(speed) || 0;
  const timeHrs = (parseFloat(hours) || 0) + (parseFloat(minutes) || 0) / 60;

  let result = '';
  if (mode === 'speed' && distNum > 0 && timeHrs > 0) {
    const s = distNum / timeHrs;
    result = `${s.toFixed(2)} ${t('speedUnit')}`;
  } else if (mode === 'distance' && spdNum > 0 && timeHrs > 0) {
    const d = spdNum * timeHrs;
    result = `${d.toFixed(2)} ${t('distanceUnit')}`;
  } else if (mode === 'time' && distNum > 0 && spdNum > 0) {
    const tHrs = distNum / spdNum;
    const h = Math.floor(tHrs);
    const m = Math.round((tHrs - h) * 60);
    result = `${h} ${t('hours')} ${m} ${t('minutes')}`;
  }

  const modes: { key: Mode; label: string }[] = [
    { key: 'speed', label: t('speed') },
    { key: 'distance', label: t('distance') },
    { key: 'time', label: t('time') },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('mode')}</label>
          <div className="flex gap-2">
            {modes.map((m) => (
              <button key={m.key} onClick={() => setMode(m.key)}
                className={`flex-1 py-2 rounded-lg font-medium ${mode === m.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {mode !== 'distance' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('distance')} ({t('distanceUnit')})</label>
            <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        )}

        {mode !== 'speed' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('speed')} ({t('speedUnit')})</label>
            <input type="number" value={speed} onChange={(e) => setSpeed(e.target.value)} placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        )}

        {mode !== 'time' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('time')}</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <span className="text-xs text-gray-500">{t('hours')}</span>
              </div>
              <div>
                <input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <span className="text-xs text-gray-500">{t('minutes')}</span>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">{t('result')}</div>
            <div className="text-2xl font-bold text-blue-600">{result}</div>
          </div>
        )}
      </div>
    </div>
  );
}
