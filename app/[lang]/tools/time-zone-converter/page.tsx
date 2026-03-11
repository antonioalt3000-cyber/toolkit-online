'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<string, string>> = {
  fromZone: { en: 'From Time Zone', it: 'Da Fuso Orario', es: 'Desde Zona Horaria', fr: 'Fuseau Horaire Source', de: 'Von Zeitzone', pt: 'Do Fuso Horário' },
  toZone: { en: 'To Time Zone', it: 'A Fuso Orario', es: 'A Zona Horaria', fr: 'Fuseau Horaire Cible', de: 'Zu Zeitzone', pt: 'Para Fuso Horário' },
  time: { en: 'Time', it: 'Ora', es: 'Hora', fr: 'Heure', de: 'Uhrzeit', pt: 'Hora' },
  date: { en: 'Date', it: 'Data', es: 'Fecha', fr: 'Date', de: 'Datum', pt: 'Data' },
  convertedTime: { en: 'Converted Time', it: 'Ora Convertita', es: 'Hora Convertida', fr: 'Heure Convertie', de: 'Konvertierte Zeit', pt: 'Hora Convertida' },
};

const zones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Lisbon',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export default function TimeZoneConverter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['time-zone-converter'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const now = new Date();
  const [fromZone, setFromZone] = useState('Europe/London');
  const [toZone, setToZone] = useState('America/New_York');
  const [date, setDate] = useState(now.toISOString().split('T')[0]);
  const [time, setTime] = useState(now.toTimeString().slice(0, 5));

  const converted = useMemo(() => {
    try {
      const dateTimeStr = `${date}T${time}:00`;
      const fromFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: fromZone,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      });
      const toFormatter = new Intl.DateTimeFormat(lang, {
        timeZone: toZone,
        weekday: 'long',
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      });

      // Build a date in the source timezone
      // We parse the local input as if it were in the fromZone
      const tempDate = new Date(dateTimeStr);
      const utcStr = tempDate.toLocaleString('en-US', { timeZone: fromZone });
      const localStr = tempDate.toLocaleString('en-US', { timeZone: 'UTC' });
      const fromDate = new Date(utcStr);
      const utcDate = new Date(localStr);
      const offset = utcDate.getTime() - fromDate.getTime();
      const adjustedDate = new Date(tempDate.getTime() + offset);

      return toFormatter.format(adjustedDate);
    } catch {
      return '—';
    }
  }, [date, time, fromZone, toZone, lang]);

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('fromZone')}</label>
          <select value={fromZone} onChange={(e) => setFromZone(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            {zones.map((z) => <option key={z} value={z}>{z.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')}</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('time')}</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('toZone')}</label>
          <select value={toZone} onChange={(e) => setToZone(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            {zones.map((z) => <option key={z} value={z}>{z.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">{t('convertedTime')}</div>
          <div className="text-xl font-bold text-blue-600">{converted}</div>
        </div>
      </div>
    </div>
  );
}
