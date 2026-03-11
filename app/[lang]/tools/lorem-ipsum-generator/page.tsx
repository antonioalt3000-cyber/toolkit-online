'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<string, string>> = {
  paragraphs: { en: 'Number of Paragraphs', it: 'Numero di Paragrafi', es: 'Número de Párrafos', fr: 'Nombre de Paragraphes', de: 'Anzahl Absätze', pt: 'Número de Parágrafos' },
  generate: { en: 'Generate', it: 'Genera', es: 'Generar', fr: 'Générer', de: 'Generieren', pt: 'Gerar' },
  copy: { en: 'Copy to Clipboard', it: 'Copia negli Appunti', es: 'Copiar al Portapapeles', fr: 'Copier dans le Presse-papiers', de: 'In Zwischenablage kopieren', pt: 'Copiar para Área de Transferência' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
};

const loremSentences = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Curabitur pretium tincidunt lacus, nec gravida nisi vehicula at.',
  'Proin eget tortor risus, vitae dapibus turpis gravida ut.',
  'Maecenas sed diam eget risus varius blandit sit amet non magna.',
  'Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh.',
  'Donec id elit non mi porta gravida at eget metus.',
  'Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.',
  'Aenean lacinia bibendum nulla sed consectetur.',
  'Nullam quis risus eget urna mollis ornare vel eu leo.',
  'Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
  'Praesent commodo cursus magna, vel scelerisque nisl consectetur et.',
  'Morbi leo risus, porta ac consectetur ac, vestibulum at eros.',
  'Cras mattis consectetur purus sit amet fermentum.',
  'Etiam porta sem malesuada magna mollis euismod.',
  'Vestibulum id ligula porta felis euismod semper.',
  'Nulla vitae elit libero, a pharetra augue.',
];

function generateParagraph(index: number): string {
  const count = 3 + (index % 4);
  const sentences: string[] = [];
  for (let i = 0; i < count; i++) {
    sentences.push(loremSentences[(index * count + i) % loremSentences.length]);
  }
  return sentences.join(' ');
}

export default function LoremIpsumGenerator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['lorem-ipsum-generator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [count, setCount] = useState(3);
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const paragraphs: string[] = [];
    for (let i = 0; i < count; i++) {
      paragraphs.push(generateParagraph(i));
    }
    setText(paragraphs.join('\n\n'));
    setCopied(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('paragraphs')}: {count}</label>
          <input type="range" min="1" max="20" value={count} onChange={(e) => setCount(parseInt(e.target.value))}
            className="w-full" />
        </div>

        <button onClick={handleGenerate}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          {t('generate')}
        </button>

        {text && (
          <>
            <div className="relative">
              <textarea readOnly value={text} rows={12}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 bg-gray-50 resize-none" />
            </div>
            <button onClick={handleCopy}
              className={`w-full py-2 rounded-lg font-medium transition-colors ${copied ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {copied ? t('copied') : t('copy')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
