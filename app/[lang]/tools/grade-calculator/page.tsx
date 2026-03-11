'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

interface GradeEntry {
  name: string;
  score: number;
  weight: number;
}

const labels: Record<string, Record<Locale, string>> = {
  subject: { en: 'Subject', it: 'Materia', es: 'Materia', fr: 'Matière', de: 'Fach', pt: 'Disciplina' },
  score: { en: 'Score', it: 'Voto', es: 'Nota', fr: 'Note', de: 'Note', pt: 'Nota' },
  weight: { en: 'Weight', it: 'Peso', es: 'Peso', fr: 'Coefficient', de: 'Gewicht', pt: 'Peso' },
  addGrade: { en: 'Add Grade', it: 'Aggiungi Voto', es: 'Añadir Nota', fr: 'Ajouter Note', de: 'Note Hinzufügen', pt: 'Adicionar Nota' },
  remove: { en: 'Remove', it: 'Rimuovi', es: 'Eliminar', fr: 'Supprimer', de: 'Entfernen', pt: 'Remover' },
  weightedAvg: { en: 'Weighted Average', it: 'Media Ponderata', es: 'Promedio Ponderado', fr: 'Moyenne Pondérée', de: 'Gewichteter Durchschnitt', pt: 'Média Ponderada' },
  simpleAvg: { en: 'Simple Average', it: 'Media Semplice', es: 'Promedio Simple', fr: 'Moyenne Simple', de: 'Einfacher Durchschnitt', pt: 'Média Simples' },
  gpa: { en: 'GPA (4.0 scale)', it: 'GPA (scala 4.0)', es: 'GPA (escala 4.0)', fr: 'GPA (échelle 4.0)', de: 'GPA (4.0 Skala)', pt: 'GPA (escala 4.0)' },
  totalWeight: { en: 'Total Weight', it: 'Peso Totale', es: 'Peso Total', fr: 'Coefficient Total', de: 'Gesamtgewicht', pt: 'Peso Total' },
  maxScore: { en: 'Max Score', it: 'Voto Massimo', es: 'Nota Máxima', fr: 'Note Maximum', de: 'Maximalnote', pt: 'Nota Máxima' },
};

export default function GradeCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['grade-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [maxScore, setMaxScore] = useState(100);
  const [grades, setGrades] = useState<GradeEntry[]>([
    { name: '', score: 0, weight: 1 },
    { name: '', score: 0, weight: 1 },
  ]);

  const updateGrade = (index: number, field: keyof GradeEntry, value: string | number) => {
    const newGrades = [...grades];
    newGrades[index] = { ...newGrades[index], [field]: value };
    setGrades(newGrades);
  };

  const addGrade = () => setGrades([...grades, { name: '', score: 0, weight: 1 }]);
  const removeGrade = (i: number) => {
    if (grades.length > 1) setGrades(grades.filter((_, idx) => idx !== i));
  };

  const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
  const weightedAvg = totalWeight > 0
    ? grades.reduce((sum, g) => sum + g.score * g.weight, 0) / totalWeight
    : 0;
  const simpleAvg = grades.length > 0
    ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length
    : 0;
  const gpa = maxScore > 0 ? (weightedAvg / maxScore) * 4 : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="w-40">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('maxScore')}</label>
          <input
            type="number"
            value={maxScore}
            onChange={(e) => setMaxScore(parseInt(e.target.value) || 100)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_80px_80px_40px] gap-2 text-sm font-medium text-gray-700">
            <span>{t('subject')}</span>
            <span className="text-center">{t('score')}</span>
            <span className="text-center">{t('weight')}</span>
            <span></span>
          </div>
          {grades.map((g, i) => (
            <div key={i} className="grid grid-cols-[1fr_80px_80px_40px] gap-2">
              <input
                type="text"
                value={g.name}
                onChange={(e) => updateGrade(i, 'name', e.target.value)}
                placeholder={`${t('subject')} ${i + 1}`}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                value={g.score}
                onChange={(e) => updateGrade(i, 'score', parseFloat(e.target.value) || 0)}
                min="0"
                max={maxScore}
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                value={g.weight}
                onChange={(e) => updateGrade(i, 'weight', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.5"
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => removeGrade(i)}
                className="text-red-500 hover:text-red-700 text-sm"
                disabled={grades.length <= 1}
              >
                X
              </button>
            </div>
          ))}
        </div>

        <button onClick={addGrade} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          + {t('addGrade')}
        </button>

        <div className="p-4 bg-blue-50 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">{t('totalWeight')}</span>
            <span className="font-semibold">{totalWeight}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('simpleAvg')}</span>
            <span className="font-semibold">{simpleAvg.toFixed(2)}</span>
          </div>
          <hr className="border-blue-200" />
          <div className="flex justify-between text-lg">
            <span className="font-bold text-gray-900">{t('weightedAvg')}</span>
            <span className="font-bold text-blue-600">{weightedAvg.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('gpa')}</span>
            <span className="font-semibold text-blue-600">{gpa.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
