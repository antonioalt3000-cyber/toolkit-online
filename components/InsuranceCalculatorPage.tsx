'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface FieldConfig {
  key: string;
  labels: Record<string, string>;
  defaultValue: string;
  min?: number;
  max?: number;
  step?: number;
}

interface ResultConfig {
  key: string;
  labels: Record<string, string>;
  color: 'blue' | 'green' | 'red' | 'gray';
  format?: 'currency' | 'percent' | 'number' | 'years';
}

interface SeoData {
  title: string;
  paragraphs: string[];
  faq: { q: string; a: string }[];
}

interface CalculatorPageProps {
  toolSlug: string;
  fields: FieldConfig[];
  results: ResultConfig[];
  calculate: (values: Record<string, number>) => Record<string, number>;
  seoContent: Record<Locale, SeoData>;
}

const commonLabels: Record<string, Record<string, string>> = {
  reset: { en: 'Reset', it: 'Reimposta', es: 'Reiniciar', fr: 'Reinitialiser', de: 'Zuruecksetzen', pt: 'Redefinir' },
  copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier Resultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copie!', de: 'Kopiert!', pt: 'Copiado!' },
};

const colorMap = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', label: 'text-blue-600', value: 'text-blue-700' },
  green: { bg: 'bg-green-50', border: 'border-green-200', label: 'text-green-600', value: 'text-green-700' },
  red: { bg: 'bg-red-50', border: 'border-red-200', label: 'text-red-600', value: 'text-red-700' },
  gray: { bg: 'bg-gray-50', border: 'border-gray-200', label: 'text-gray-500', value: 'text-gray-900' },
};

export default function InsuranceCalculatorPage({ toolSlug, fields, results, calculate, seoContent }: CalculatorPageProps) {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools[toolSlug]?.[lang];

  const defaultValues: Record<string, string> = {};
  fields.forEach(f => { defaultValues[f.key] = f.defaultValue; });

  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const numericValues: Record<string, number> = {};
  fields.forEach(f => { numericValues[f.key] = parseFloat(values[f.key]) || 0; });

  const calculatedResults = calculate(numericValues);
  const hasResults = Object.values(calculatedResults).some(v => v > 0);

  const formatValue = (value: number, format?: string): string => {
    switch (format) {
      case 'currency': return `$${Math.round(value).toLocaleString()}`;
      case 'percent': return `${(Math.round(value * 10) / 10)}%`;
      case 'years': return `${(Math.round(value * 10) / 10)} yr`;
      default: return Math.round(value).toLocaleString();
    }
  };

  const resetAll = () => { setValues(defaultValues); setCopied(false); };

  const copyResults = () => {
    const text = results.map(r => {
      const label = r.labels[lang] || r.labels.en;
      return `${label}: ${formatValue(calculatedResults[r.key] || 0, r.format)}`;
    }).join(' | ');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seo = seoContent[lang] || seoContent.en;
  const tCommon = (key: string) => commonLabels[key]?.[lang] || commonLabels[key]?.en || key;

  if (!toolT) return null;

  return (
    <ToolPageWrapper toolSlug={toolSlug} faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {fields.map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.labels[lang] || field.labels.en}
              </label>
              <input
                type="number"
                value={values[field.key]}
                onChange={(e) => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                min={field.min}
                max={field.max}
                step={field.step}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}

          <div className="flex gap-2">
            {hasResults && (
              <button onClick={copyResults} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                {copied ? tCommon('copied') : tCommon('copy')}
              </button>
            )}
            <button onClick={resetAll} className="px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-600 transition-colors ml-auto">
              {tCommon('reset')}
            </button>
          </div>

          {hasResults && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.map(r => {
                const c = colorMap[r.color];
                return (
                  <div key={r.key} className={`${c.bg} border ${c.border} rounded-xl p-4 text-center`}>
                    <div className={`text-xs ${c.label} font-medium`}>{r.labels[lang] || r.labels.en}</div>
                    <div className={`text-2xl font-bold ${c.value}`}>
                      {formatValue(calculatedResults[r.key] || 0, r.format)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <article className="mt-10 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\$\{lang\}/g, lang) }} />
          ))}
        </article>

        <div className="mt-8 space-y-3">
          <h2 className="text-xl font-bold text-gray-900">FAQ</h2>
          {seo.faq.map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-lg">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-4 py-3 font-medium text-gray-900 flex justify-between items-center">
                {item.q}
                <span className="text-gray-400">{openFaq === i ? '\u2212' : '+'}</span>
              </button>
              {openFaq === i && <div className="px-4 pb-3 text-gray-600 text-sm">{item.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </ToolPageWrapper>
  );
}
