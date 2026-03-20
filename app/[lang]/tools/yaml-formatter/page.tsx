'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

function parseYaml(input: string): { data: unknown; error: string | null } {
  try {
    const lines = input.split('\n');
    const result: Record<string, unknown> = {};
    let currentKey = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^([^:]+):\s*(.*)/);
      if (match) {
        currentKey = match[1].trim();
        const value = match[2].trim();
        if (value) {
          if (value === 'true') result[currentKey] = true;
          else if (value === 'false') result[currentKey] = false;
          else if (value === 'null') result[currentKey] = null;
          else if (!isNaN(Number(value))) result[currentKey] = Number(value);
          else result[currentKey] = value.replace(/^['"]|['"]$/g, '');
        } else {
          result[currentKey] = {};
        }
      }
    }
    return { data: result, error: null };
  } catch {
    return { data: null, error: 'Invalid YAML' };
  }
}

export default function YamlFormatter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['yaml-formatter'][lang];

  const [input, setInput] = useState('');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);
  const [outputMode, setOutputMode] = useState<'yaml' | 'json'>('yaml');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data, error } = input.trim() ? parseYaml(input) : { data: null, error: null };

  let output = '';
  if (data && !error) {
    if (outputMode === 'json') {
      output = JSON.stringify(data, null, indent);
    } else {
      output = Object.entries(data as Record<string, unknown>).map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return `${key}:\n${Object.entries(value as Record<string, unknown>).map(([k, v]) => `${' '.repeat(indent)}${k}: ${v}`).join('\n')}`;
        }
        return `${key}: ${value}`;
      }).join('\n');
    }
  }

  const handleCopy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const labels = {
    inputLabel: { en: 'Paste your YAML', it: 'Incolla il tuo YAML', es: 'Pega tu YAML', fr: 'Collez votre YAML', de: 'F\u00fcgen Sie Ihr YAML ein', pt: 'Cole seu YAML' },
    outputLabel: { en: 'Formatted Output', it: 'Output Formattato', es: 'Salida Formateada', fr: 'Sortie Format\u00e9e', de: 'Formatierte Ausgabe', pt: 'Sa\u00edda Formatada' },
    indentSize: { en: 'Indent Size', it: 'Dimensione Indentazione', es: 'Tama\u00f1o de Indentaci\u00f3n', fr: 'Taille d\'Indentation', de: 'Einr\u00fcckungsgr\u00f6\u00dfe', pt: 'Tamanho da Indenta\u00e7\u00e3o' },
    copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
    copied: { en: 'Copied!', it: 'Copiato!', es: '\u00a1Copiado!', fr: 'Copi\u00e9!', de: 'Kopiert!', pt: 'Copiado!' },
    valid: { en: 'Valid YAML', it: 'YAML Valido', es: 'YAML V\u00e1lido', fr: 'YAML Valide', de: 'G\u00fcltiges YAML', pt: 'YAML V\u00e1lido' },
    invalid: { en: 'Invalid YAML', it: 'YAML Non Valido', es: 'YAML Inv\u00e1lido', fr: 'YAML Invalide', de: 'Ung\u00fcltiges YAML', pt: 'YAML Inv\u00e1lido' },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free YAML Formatter \u2014 Format, Validate & Convert YAML Online',
      paragraphs: [
        'The YAML Formatter helps you format, validate, and beautify YAML data. YAML (YAML Ain\'t Markup Language) is widely used for configuration files in Docker, Kubernetes, GitHub Actions, and many other tools.',
        'Paste your YAML and instantly see it formatted with proper indentation. You can also convert YAML to JSON format for use in APIs and JavaScript applications.',
        'The tool validates your YAML in real-time, showing you whether your data is valid or contains errors. This is invaluable when debugging configuration files.',
        'Everything runs in your browser \u2014 your data never leaves your computer.',
      ],
      faq: [
        { q: 'What is YAML used for?', a: 'YAML is commonly used for configuration files (Docker, Kubernetes, CI/CD pipelines), data serialization, and settings files. It\'s human-readable and more concise than XML or JSON.' },
        { q: 'What\'s the difference between YAML and JSON?', a: 'YAML uses indentation instead of braces, supports comments, and is more human-readable. JSON is more widely supported in programming languages and APIs.' },
        { q: 'Can I convert YAML to JSON?', a: 'Yes! Toggle the output mode to JSON to see your YAML data converted to JSON format instantly.' },
        { q: 'Is my data secure?', a: 'Yes, all processing happens in your browser. No data is sent to any server.' },
      ],
    },
    it: {
      title: 'Formattatore YAML Gratuito \u2014 Formatta, Valida e Converti YAML Online',
      paragraphs: ['Il Formattatore YAML ti aiuta a formattare, validare e abbellire dati YAML.', 'Incolla il tuo YAML e vedilo formattato con indentazione corretta.', 'Lo strumento valida il YAML in tempo reale.', 'Tutto funziona nel browser \u2014 i tuoi dati non lasciano mai il tuo computer.'],
      faq: [
        { q: 'A cosa serve YAML?', a: 'YAML \u00e8 usato per file di configurazione (Docker, Kubernetes, CI/CD), serializzazione dati e file di impostazioni.' },
        { q: 'Qual \u00e8 la differenza tra YAML e JSON?', a: 'YAML usa l\'indentazione, supporta commenti ed \u00e8 pi\u00f9 leggibile. JSON \u00e8 pi\u00f9 supportato nelle API.' },
        { q: 'Posso convertire YAML in JSON?', a: 'S\u00ec! Cambia la modalit\u00e0 di output a JSON per la conversione istantanea.' },
        { q: 'I miei dati sono sicuri?', a: 'S\u00ec, tutto avviene nel browser. Nessun dato viene inviato a server.' },
      ],
    },
    es: {
      title: 'Formateador YAML Gratis \u2014 Formatear, Validar y Convertir YAML',
      paragraphs: ['El Formateador YAML te ayuda a formatear y validar datos YAML.', 'Pega tu YAML y v\u00e9elo formateado instant\u00e1neamente.', 'La herramienta valida en tiempo real.', 'Todo funciona en tu navegador.'],
      faq: [
        { q: '\u00bfPara qu\u00e9 se usa YAML?', a: 'Para archivos de configuraci\u00f3n, serializaci\u00f3n de datos y configuraciones.' },
        { q: '\u00bfCu\u00e1l es la diferencia entre YAML y JSON?', a: 'YAML usa indentaci\u00f3n, soporta comentarios y es m\u00e1s legible.' },
        { q: '\u00bfPuedo convertir YAML a JSON?', a: '\u00a1S\u00ed! Cambia el modo de salida a JSON.' },
        { q: '\u00bfMis datos est\u00e1n seguros?', a: 'S\u00ed, todo se procesa en tu navegador.' },
      ],
    },
    fr: {
      title: 'Formateur YAML Gratuit \u2014 Formatez, Validez et Convertissez YAML',
      paragraphs: ['Le Formateur YAML vous aide \u00e0 formater et valider vos donn\u00e9es YAML.', 'Collez votre YAML et voyez-le format\u00e9 instantan\u00e9ment.', 'L\'outil valide en temps r\u00e9el.', 'Tout fonctionne dans votre navigateur.'],
      faq: [
        { q: '\u00c0 quoi sert YAML ?', a: 'Pour les fichiers de configuration, la s\u00e9rialisation et les param\u00e8tres.' },
        { q: 'Quelle diff\u00e9rence entre YAML et JSON ?', a: 'YAML utilise l\'indentation, supporte les commentaires et est plus lisible.' },
        { q: 'Puis-je convertir YAML en JSON ?', a: 'Oui ! Changez le mode de sortie en JSON.' },
        { q: 'Mes donn\u00e9es sont-elles s\u00e9curis\u00e9es ?', a: 'Oui, tout se passe dans votre navigateur.' },
      ],
    },
    de: {
      title: 'Kostenloser YAML-Formatierer \u2014 YAML Formatieren und Validieren',
      paragraphs: ['Der YAML-Formatierer hilft Ihnen, YAML-Daten zu formatieren und zu validieren.', 'F\u00fcgen Sie Ihr YAML ein und sehen Sie es sofort formatiert.', 'Das Tool validiert in Echtzeit.', 'Alles funktioniert im Browser.'],
      faq: [
        { q: 'Wof\u00fcr wird YAML verwendet?', a: 'F\u00fcr Konfigurationsdateien, Datenserialisierung und Einstellungen.' },
        { q: 'Was ist der Unterschied zwischen YAML und JSON?', a: 'YAML verwendet Einr\u00fcckung, unterst\u00fctzt Kommentare und ist lesbarer.' },
        { q: 'Kann ich YAML in JSON konvertieren?', a: 'Ja! Wechseln Sie den Ausgabemodus zu JSON.' },
        { q: 'Sind meine Daten sicher?', a: 'Ja, alles passiert in Ihrem Browser.' },
      ],
    },
    pt: {
      title: 'Formatador YAML Gr\u00e1tis \u2014 Formate, Valide e Converta YAML',
      paragraphs: ['O Formatador YAML ajuda a formatar e validar dados YAML.', 'Cole seu YAML e veja formatado instantaneamente.', 'A ferramenta valida em tempo real.', 'Tudo funciona no navegador.'],
      faq: [
        { q: 'Para que serve YAML?', a: 'Para arquivos de configura\u00e7\u00e3o, serializa\u00e7\u00e3o de dados e configura\u00e7\u00f5es.' },
        { q: 'Qual a diferen\u00e7a entre YAML e JSON?', a: 'YAML usa indenta\u00e7\u00e3o, suporta coment\u00e1rios e \u00e9 mais leg\u00edvel.' },
        { q: 'Posso converter YAML para JSON?', a: 'Sim! Mude o modo de sa\u00edda para JSON.' },
        { q: 'Meus dados est\u00e3o seguros?', a: 'Sim, tudo acontece no seu navegador.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="yaml-formatter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.inputLabel[lang]}</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={'name: John\nage: 30\ncity: New York'} rows={6} className="w-full border border-gray-300 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 resize-y" />
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <button onClick={() => setOutputMode('yaml')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${outputMode === 'yaml' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>YAML</button>
              <button onClick={() => setOutputMode('json')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${outputMode === 'json' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>JSON</button>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500">{labels.indentSize[lang]}: {indent}</label>
              <input type="range" min={2} max={8} value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="w-full" />
            </div>
          </div>

          {input.trim() && (
            <div className="flex items-center gap-2 text-sm">
              {error ? (
                <><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="text-red-600">{labels.invalid[lang]}</span></>
              ) : (
                <><span className="w-2 h-2 rounded-full bg-green-500"></span><span className="text-green-600">{labels.valid[lang]}</span></>
              )}
            </div>
          )}

          {output && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">{labels.outputLabel[lang]}</label>
                <button onClick={handleCopy} className="text-sm text-blue-600 hover:text-blue-800">{copied ? labels.copied[lang] : labels.copy[lang]}</button>
              </div>
              <pre className="bg-gray-900 text-green-400 rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre">{output}</pre>
            </div>
          )}
        </div>

        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>)}
        </article>

        <section className="mt-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQ</h2>
          <div className="space-y-2">
            {seo.faq.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-4 py-3 font-medium text-gray-900 flex justify-between items-center">
                  {item.q}
                  <span className="text-gray-400">{openFaq === i ? '\u2212' : '+'}</span>
                </button>
                {openFaq === i && <div className="px-4 pb-3 text-gray-600">{item.a}</div>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </ToolPageWrapper>
  );
}
