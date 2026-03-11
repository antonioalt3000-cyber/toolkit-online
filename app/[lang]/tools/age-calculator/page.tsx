'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

export default function AgeCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['age-calculator'][lang];
  const [birthDate, setBirthDate] = useState('');

  const labels = {
    birthDate: { en: 'Birth date', it: 'Data di nascita', es: 'Fecha de nacimiento', fr: 'Date de naissance', de: 'Geburtsdatum', pt: 'Data de nascimento' },
    years: { en: 'Years', it: 'Anni', es: 'Años', fr: 'Ans', de: 'Jahre', pt: 'Anos' },
    months: { en: 'Months', it: 'Mesi', es: 'Meses', fr: 'Mois', de: 'Monate', pt: 'Meses' },
    days: { en: 'Days', it: 'Giorni', es: 'Días', fr: 'Jours', de: 'Tage', pt: 'Dias' },
    totalDays: { en: 'Total days lived', it: 'Giorni totali vissuti', es: 'Días totales vividos', fr: 'Jours totaux vécus', de: 'Gesamt gelebte Tage', pt: 'Dias totais vividos' },
    nextBday: { en: 'Next birthday in', it: 'Prossimo compleanno tra', es: 'Próximo cumpleaños en', fr: 'Prochain anniversaire dans', de: 'Nächster Geburtstag in', pt: 'Próximo aniversário em' },
  } as Record<string, Record<Locale, string>>;

  let age = { years: 0, months: 0, days: 0, totalDays: 0, nextBdayDays: 0 };

  if (birthDate) {
    const birth = new Date(birthDate);
    const now = new Date();

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

    let nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday <= now) nextBday = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
    const nextBdayDays = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    age = { years, months, days, totalDays, nextBdayDays };
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{labels.birthDate[lang]}</label>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
        </div>

        {birthDate && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: labels.years[lang], value: age.years },
                { label: labels.months[lang], value: age.months },
                { label: labels.days[lang], value: age.days },
              ].map((item) => (
                <div key={item.label} className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{item.value}</div>
                  <div className="text-sm text-gray-600">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{labels.totalDays[lang]}: <span className="font-semibold text-gray-900">{age.totalDays.toLocaleString()}</span></p>
              <p>{labels.nextBday[lang]}: <span className="font-semibold text-gray-900">{age.nextBdayDays} {labels.days[lang].toLowerCase()}</span></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
