'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<Locale, string>> = {
  targetDate: { en: 'Target Date & Time', it: 'Data e Ora Obiettivo', es: 'Fecha y Hora Objetivo', fr: 'Date et Heure Cible', de: 'Zieldatum und -zeit', pt: 'Data e Hora Alvo' },
  eventName: { en: 'Event Name (optional)', it: 'Nome Evento (opzionale)', es: 'Nombre del Evento (opcional)', fr: 'Nom de l\'Événement (optionnel)', de: 'Ereignisname (optional)', pt: 'Nome do Evento (opcional)' },
  days: { en: 'Days', it: 'Giorni', es: 'Días', fr: 'Jours', de: 'Tage', pt: 'Dias' },
  hours: { en: 'Hours', it: 'Ore', es: 'Horas', fr: 'Heures', de: 'Stunden', pt: 'Horas' },
  minutes: { en: 'Minutes', it: 'Minuti', es: 'Minutos', fr: 'Minutes', de: 'Minuten', pt: 'Minutos' },
  seconds: { en: 'Seconds', it: 'Secondi', es: 'Segundos', fr: 'Secondes', de: 'Sekunden', pt: 'Segundos' },
  expired: { en: 'Countdown has ended!', it: 'Il conto alla rovescia è terminato!', es: '¡La cuenta regresiva ha terminado!', fr: 'Le compte à rebours est terminé !', de: 'Der Countdown ist abgelaufen!', pt: 'A contagem regressiva terminou!' },
  countingDown: { en: 'Counting down to', it: 'Conto alla rovescia per', es: 'Cuenta regresiva para', fr: 'Compte à rebours pour', de: 'Countdown bis', pt: 'Contagem regressiva para' },
  presets: { en: 'Quick Presets', it: 'Preimpostazioni', es: 'Preajustes Rápidos', fr: 'Préréglages', de: 'Schnellvorlagen', pt: 'Predefinições Rápidas' },
  newYear: { en: 'New Year', it: 'Capodanno', es: 'Año Nuevo', fr: 'Nouvel An', de: 'Neujahr', pt: 'Ano Novo' },
  christmas: { en: 'Christmas', it: 'Natale', es: 'Navidad', fr: 'Noël', de: 'Weihnachten', pt: 'Natal' },
  tomorrow: { en: 'Tomorrow', it: 'Domani', es: 'Mañana', fr: 'Demain', de: 'Morgen', pt: 'Amanhã' },
};

export default function CountdownTimer() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['countdown-timer'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  };

  const [targetDate, setTargetDate] = useState(getDefaultDate());
  const [eventName, setEventName] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  const calculateTimeLeft = useCallback(() => {
    const target = new Date(targetDate).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      expired: false,
    };
  }, [targetDate]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  const setPreset = (type: string) => {
    const now = new Date();
    let target: Date;
    if (type === 'newYear') {
      target = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
      setEventName(t('newYear'));
    } else if (type === 'christmas') {
      const christmas = new Date(now.getFullYear(), 11, 25, 0, 0, 0);
      target = christmas > now ? christmas : new Date(now.getFullYear() + 1, 11, 25, 0, 0, 0);
      setEventName(t('christmas'));
    } else {
      target = new Date(now);
      target.setDate(target.getDate() + 1);
      target.setHours(0, 0, 0, 0);
      setEventName(t('tomorrow'));
    }
    setTargetDate(target.toISOString().slice(0, 16));
  };

  const boxes = [
    { value: timeLeft.days, label: t('days') },
    { value: timeLeft.hours, label: t('hours') },
    { value: timeLeft.minutes, label: t('minutes') },
    { value: timeLeft.seconds, label: t('seconds') },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('eventName')}</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('targetDate')}</label>
          <input
            type="datetime-local"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('presets')}</label>
          <div className="flex gap-2">
            {['newYear', 'christmas', 'tomorrow'].map((preset) => (
              <button
                key={preset}
                onClick={() => setPreset(preset)}
                className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
              >
                {t(preset)}
              </button>
            ))}
          </div>
        </div>

        {eventName && (
          <p className="text-center text-gray-600">
            {t('countingDown')} <strong>{eventName}</strong>
          </p>
        )}

        {timeLeft.expired ? (
          <div className="p-6 bg-green-50 rounded-lg text-center">
            <p className="text-xl font-bold text-green-600">{t('expired')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {boxes.map(({ value, label }) => (
              <div key={label} className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-4xl font-bold text-blue-600 font-mono">
                  {String(value).padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-600 mt-1 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
