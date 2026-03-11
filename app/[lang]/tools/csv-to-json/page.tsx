'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<Locale, string>> = {
  csvInput: { en: 'CSV Input', it: 'Input CSV', es: 'Entrada CSV', fr: 'Entrée CSV', de: 'CSV-Eingabe', pt: 'Entrada CSV' },
  jsonOutput: { en: 'JSON Output', it: 'Output JSON', es: 'Salida JSON', fr: 'Sortie JSON', de: 'JSON-Ausgabe', pt: 'Saída JSON' },
  jsonInput: { en: 'JSON Input', it: 'Input JSON', es: 'Entrada JSON', fr: 'Entrée JSON', de: 'JSON-Eingabe', pt: 'Entrada JSON' },
  csvOutput: { en: 'CSV Output', it: 'Output CSV', es: 'Salida CSV', fr: 'Sortie CSV', de: 'CSV-Ausgabe', pt: 'Saída CSV' },
  csvToJson: { en: 'CSV to JSON', it: 'CSV a JSON', es: 'CSV a JSON', fr: 'CSV vers JSON', de: 'CSV zu JSON', pt: 'CSV para JSON' },
  jsonToCsv: { en: 'JSON to CSV', it: 'JSON a CSV', es: 'JSON a CSV', fr: 'JSON vers CSV', de: 'JSON zu CSV', pt: 'JSON para CSV' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  error: { en: 'Invalid input', it: 'Input non valido', es: 'Entrada inválida', fr: 'Entrée invalide', de: 'Ungültige Eingabe', pt: 'Entrada inválida' },
  csvPlaceholder: { en: 'name,age,city\nJohn,30,NYC\nJane,25,LA', it: 'nome,età,città\nMario,30,Roma\nLucia,25,Milano', es: 'nombre,edad,ciudad\nJuan,30,Madrid\nAna,25,Barcelona', fr: 'nom,âge,ville\nJean,30,Paris\nMarie,25,Lyon', de: 'Name,Alter,Stadt\nHans,30,Berlin\nAnna,25,München', pt: 'nome,idade,cidade\nJoão,30,Lisboa\nAna,25,Porto' },
};

function csvToJson(csv: string): string {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return '[]';
  const headers = lines[0].split(',').map((h) => h.trim());
  const result = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  });
  return JSON.stringify(result, null, 2);
}

function jsonToCsv(json: string): string {
  const arr = JSON.parse(json);
  if (!Array.isArray(arr) || arr.length === 0) return '';
  const headers = Object.keys(arr[0]);
  const lines = [headers.join(',')];
  arr.forEach((obj: Record<string, unknown>) => {
    lines.push(headers.map((h) => String(obj[h] ?? '')).join(','));
  });
  return lines.join('\n');
}

export default function CsvToJson() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['csv-to-json'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [mode, setMode] = useState<'csvToJson' | 'jsonToCsv'>('csvToJson');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  let output = '';
  let error = '';
  try {
    if (input.trim()) {
      output = mode === 'csvToJson' ? csvToJson(input) : jsonToCsv(input);
    }
  } catch {
    error = t('error');
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => { setMode('csvToJson'); setInput(''); }}
            className={`flex-1 py-2 rounded-lg font-medium ${mode === 'csvToJson' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('csvToJson')}
          </button>
          <button
            onClick={() => { setMode('jsonToCsv'); setInput(''); }}
            className={`flex-1 py-2 rounded-lg font-medium ${mode === 'jsonToCsv' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('jsonToCsv')}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {mode === 'csvToJson' ? t('csvInput') : t('jsonInput')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'csvToJson' ? t('csvPlaceholder') : '[{"name":"John","age":30}]'}
            rows={6}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {output && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">
                {mode === 'csvToJson' ? t('jsonOutput') : t('csvOutput')}
              </label>
              <button onClick={copyOutput} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                {copied ? t('copied') : t('copy')}
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              rows={8}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
