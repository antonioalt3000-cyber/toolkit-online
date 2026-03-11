'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<string, string>> = {
  age: { en: 'Age', it: 'Età', es: 'Edad', fr: 'Âge', de: 'Alter', pt: 'Idade' },
  gender: { en: 'Gender', it: 'Sesso', es: 'Género', fr: 'Sexe', de: 'Geschlecht', pt: 'Sexo' },
  male: { en: 'Male', it: 'Maschio', es: 'Masculino', fr: 'Homme', de: 'Männlich', pt: 'Masculino' },
  female: { en: 'Female', it: 'Femmina', es: 'Femenino', fr: 'Femme', de: 'Weiblich', pt: 'Feminino' },
  weight: { en: 'Weight (kg)', it: 'Peso (kg)', es: 'Peso (kg)', fr: 'Poids (kg)', de: 'Gewicht (kg)', pt: 'Peso (kg)' },
  height: { en: 'Height (cm)', it: 'Altezza (cm)', es: 'Altura (cm)', fr: 'Taille (cm)', de: 'Größe (cm)', pt: 'Altura (cm)' },
  activity: { en: 'Activity Level', it: 'Livello Attività', es: 'Nivel de Actividad', fr: "Niveau d'Activité", de: 'Aktivitätslevel', pt: 'Nível de Atividade' },
  sedentary: { en: 'Sedentary (little/no exercise)', it: 'Sedentario', es: 'Sedentario', fr: 'Sédentaire', de: 'Sitzend', pt: 'Sedentário' },
  light: { en: 'Light (1-3 days/week)', it: 'Leggero (1-3 giorni)', es: 'Ligero (1-3 días)', fr: 'Léger (1-3 jours)', de: 'Leicht (1-3 Tage)', pt: 'Leve (1-3 dias)' },
  moderate: { en: 'Moderate (3-5 days/week)', it: 'Moderato (3-5 giorni)', es: 'Moderado (3-5 días)', fr: 'Modéré (3-5 jours)', de: 'Mäßig (3-5 Tage)', pt: 'Moderado (3-5 dias)' },
  active: { en: 'Active (6-7 days/week)', it: 'Attivo (6-7 giorni)', es: 'Activo (6-7 días)', fr: 'Actif (6-7 jours)', de: 'Aktiv (6-7 Tage)', pt: 'Ativo (6-7 dias)' },
  veryActive: { en: 'Very Active (intense daily)', it: 'Molto Attivo (intenso)', es: 'Muy Activo (intenso)', fr: 'Très Actif (intense)', de: 'Sehr Aktiv (intensiv)', pt: 'Muito Ativo (intenso)' },
  bmr: { en: 'Basal Metabolic Rate (BMR)', it: 'Metabolismo Basale (BMR)', es: 'Metabolismo Basal (TMB)', fr: 'Métabolisme Basal (MB)', de: 'Grundumsatz (BMR)', pt: 'Metabolismo Basal (TMB)' },
  dailyCal: { en: 'Daily Calories Needed', it: 'Calorie Giornaliere', es: 'Calorías Diarias', fr: 'Calories Quotidiennes', de: 'Täglicher Kalorienbedarf', pt: 'Calorias Diárias' },
  lose: { en: 'To lose weight (~0.5 kg/week)', it: 'Per dimagrire (~0,5 kg/sett.)', es: 'Para perder peso (~0,5 kg/sem.)', fr: 'Pour perdre (~0,5 kg/sem.)', de: 'Zum Abnehmen (~0,5 kg/Wo.)', pt: 'Para emagrecer (~0,5 kg/sem.)' },
  maintain: { en: 'To maintain weight', it: 'Per mantenere il peso', es: 'Para mantener peso', fr: 'Pour maintenir le poids', de: 'Gewicht halten', pt: 'Para manter o peso' },
  gain: { en: 'To gain weight (~0.5 kg/week)', it: 'Per ingrassare (~0,5 kg/sett.)', es: 'Para ganar peso (~0,5 kg/sem.)', fr: 'Pour prendre (~0,5 kg/sem.)', de: 'Zum Zunehmen (~0,5 kg/Wo.)', pt: 'Para engordar (~0,5 kg/sem.)' },
  kcalDay: { en: 'kcal/day', it: 'kcal/giorno', es: 'kcal/día', fr: 'kcal/jour', de: 'kcal/Tag', pt: 'kcal/dia' },
};

const activityFactors = [
  { key: 'sedentary', factor: 1.2 },
  { key: 'light', factor: 1.375 },
  { key: 'moderate', factor: 1.55 },
  { key: 'active', factor: 1.725 },
  { key: 'veryActive', factor: 1.9 },
];

export default function CalorieCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['calorie-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState('moderate');

  const ageNum = parseInt(age) || 0;
  const weightNum = parseFloat(weight) || 0;
  const heightNum = parseFloat(height) || 0;
  const factor = activityFactors.find((a) => a.key === activity)?.factor || 1.55;

  let bmr = 0;
  if (ageNum > 0 && weightNum > 0 && heightNum > 0) {
    bmr = gender === 'male'
      ? 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5
      : 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
  }
  const dailyCal = Math.round(bmr * factor);

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('gender')}</label>
          <div className="flex gap-2">
            {(['male', 'female'] as const).map((g) => (
              <button key={g} onClick={() => setGender(g)}
                className={`flex-1 py-2 rounded-lg font-medium ${gender === g ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                {t(g)}
              </button>
            ))}
          </div>
        </div>

        {[
          { key: 'age', value: age, setter: setAge },
          { key: 'weight', value: weight, setter: setWeight },
          { key: 'height', value: height, setter: setHeight },
        ].map(({ key, value, setter }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t(key)}</label>
            <input type="number" value={value} onChange={(e) => setter(e.target.value)} placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('activity')}</label>
          <select value={activity} onChange={(e) => setActivity(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            {activityFactors.map((a) => (
              <option key={a.key} value={a.key}>{t(a.key)}</option>
            ))}
          </select>
        </div>

        {bmr > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('bmr')}</span>
              <span className="font-semibold">{Math.round(bmr)} {t('kcalDay')}</span>
            </div>
            <hr className="border-blue-200" />
            <div className="flex justify-between">
              <span className="text-gray-600">{t('lose')}</span>
              <span className="font-semibold text-green-600">{dailyCal - 500} {t('kcalDay')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('maintain')}</span>
              <span className="font-bold text-blue-600 text-lg">{dailyCal} {t('kcalDay')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('gain')}</span>
              <span className="font-semibold text-orange-600">{dailyCal + 500} {t('kcalDay')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
