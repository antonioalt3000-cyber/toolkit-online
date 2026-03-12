'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

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

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'CSV to JSON Converter: Transform Data Formats Instantly',
      paragraphs: [
        'Converting between CSV and JSON is one of the most common data transformation tasks in software development, data analysis, and system integration. CSV (Comma-Separated Values) is the standard format for spreadsheets and database exports, while JSON (JavaScript Object Notation) is the dominant format for web APIs and modern applications. Our free online converter handles both directions seamlessly.',
        'The CSV to JSON converter parses your comma-separated data, using the first row as field names and subsequent rows as data records. Each row becomes a JSON object with named properties, and the complete dataset is returned as an array. The JSON to CSV converter performs the reverse operation, extracting keys from the first object as headers and flattening the data into comma-separated rows.',
        'Data professionals use this tool for tasks like preparing API payloads from spreadsheet data, converting API responses to CSV for analysis in Excel or Google Sheets, migrating data between systems that use different formats, and generating test data. The real-time conversion means you can paste data and instantly see the transformed output.',
        'The converter handles standard CSV formatting with commas as delimiters. For best results, ensure your CSV data has a header row and consistent column counts across all rows. The JSON output is automatically formatted with indentation for readability, making it easy to inspect and validate your data before using it.',
      ],
      faq: [
        { q: 'What is the difference between CSV and JSON formats?', a: 'CSV is a flat, tabular format where data is organized in rows and columns separated by commas. JSON is a hierarchical format that supports nested objects and arrays. CSV is simpler but less flexible, while JSON can represent complex data structures.' },
        { q: 'How do I convert a CSV file from Excel to JSON?', a: 'Open your Excel file, save or export it as CSV, then copy the CSV text and paste it into this converter. The tool will automatically parse the headers and rows to produce a JSON array of objects.' },
        { q: 'Can this tool handle large CSV files?', a: 'This browser-based tool works well for CSV data up to several thousand rows. For very large datasets (millions of rows), consider using command-line tools like csvtojson or Python\'s pandas library for better performance.' },
        { q: 'What happens if my CSV has missing values?', a: 'Missing values in CSV rows are converted to empty strings in JSON. The converter handles rows with fewer columns than the header gracefully, filling missing positions with empty strings.' },
        { q: 'Does the JSON to CSV converter handle nested JSON objects?', a: 'This converter works with flat JSON arrays of objects (one level deep). Nested objects are converted to their string representation. For deeply nested JSON, you may need to flatten the structure first.' },
      ],
    },
    it: {
      title: 'Convertitore CSV a JSON: Trasforma i Formati Dati Istantaneamente',
      paragraphs: [
        'La conversione tra CSV e JSON è una delle operazioni di trasformazione dati più comuni nello sviluppo software, nell\'analisi dati e nell\'integrazione di sistemi. CSV (Comma-Separated Values) è il formato standard per fogli di calcolo ed esportazioni database, mentre JSON (JavaScript Object Notation) è il formato dominante per API web e applicazioni moderne.',
        'Il convertitore CSV a JSON analizza i tuoi dati separati da virgole, usando la prima riga come nomi dei campi e le righe successive come record di dati. Ogni riga diventa un oggetto JSON con proprietà nominate. Il convertitore JSON a CSV esegue l\'operazione inversa, estraendo le chiavi come intestazioni.',
        'I professionisti dei dati usano questo strumento per preparare payload API da dati di fogli di calcolo, convertire risposte API in CSV per l\'analisi in Excel o Google Sheets, migrare dati tra sistemi con formati diversi e generare dati di test.',
        'Il convertitore gestisce la formattazione CSV standard con virgole come delimitatori. Per i migliori risultati, assicurati che i tuoi dati CSV abbiano una riga di intestazione e conteggi di colonne coerenti. L\'output JSON è automaticamente formattato con indentazione per la leggibilità.',
      ],
      faq: [
        { q: 'Qual è la differenza tra i formati CSV e JSON?', a: 'CSV è un formato tabulare piatto con dati organizzati in righe e colonne separate da virgole. JSON è un formato gerarchico che supporta oggetti e array annidati. CSV è più semplice ma meno flessibile.' },
        { q: 'Come converto un file CSV da Excel a JSON?', a: 'Apri il file Excel, salva o esporta come CSV, poi copia il testo CSV e incollalo in questo convertitore. Lo strumento analizzerà automaticamente intestazioni e righe per produrre un array JSON di oggetti.' },
        { q: 'Questo strumento può gestire file CSV grandi?', a: 'Questo strumento basato su browser funziona bene per dati CSV fino a diverse migliaia di righe. Per dataset molto grandi, considera strumenti da riga di comando o la libreria pandas di Python.' },
        { q: 'Cosa succede se il mio CSV ha valori mancanti?', a: 'I valori mancanti nelle righe CSV vengono convertiti in stringhe vuote in JSON. Il convertitore gestisce righe con meno colonne dell\'intestazione, riempiendo le posizioni mancanti con stringhe vuote.' },
        { q: 'Il convertitore JSON a CSV gestisce oggetti JSON annidati?', a: 'Questo convertitore funziona con array JSON piatti di oggetti (un livello di profondità). Gli oggetti annidati vengono convertiti nella loro rappresentazione stringa.' },
      ],
    },
    es: {
      title: 'Convertidor CSV a JSON: Transforma Formatos de Datos al Instante',
      paragraphs: [
        'La conversión entre CSV y JSON es una de las tareas de transformación de datos más comunes en el desarrollo de software, análisis de datos e integración de sistemas. CSV es el formato estándar para hojas de cálculo y exportaciones de bases de datos, mientras que JSON es el formato dominante para APIs web y aplicaciones modernas.',
        'El convertidor CSV a JSON analiza tus datos separados por comas, usando la primera fila como nombres de campos y las filas siguientes como registros de datos. Cada fila se convierte en un objeto JSON con propiedades nombradas.',
        'Los profesionales de datos usan esta herramienta para preparar cargas útiles de API desde datos de hojas de cálculo, convertir respuestas de API a CSV para análisis en Excel, migrar datos entre sistemas con formatos diferentes y generar datos de prueba.',
        'El convertidor maneja el formato CSV estándar con comas como delimitadores. Para mejores resultados, asegúrate de que tus datos CSV tengan una fila de encabezado y conteos de columnas consistentes.',
      ],
      faq: [
        { q: '¿Cuál es la diferencia entre los formatos CSV y JSON?', a: 'CSV es un formato tabular plano con datos en filas y columnas separadas por comas. JSON es un formato jerárquico que soporta objetos y arrays anidados. CSV es más simple pero menos flexible.' },
        { q: '¿Cómo convierto un archivo CSV de Excel a JSON?', a: 'Abre tu archivo Excel, guárdalo como CSV, luego copia el texto CSV y pégalo en este convertidor. La herramienta analizará automáticamente los encabezados y filas.' },
        { q: '¿Puede esta herramienta manejar archivos CSV grandes?', a: 'Esta herramienta basada en navegador funciona bien para datos CSV de hasta varios miles de filas. Para conjuntos de datos muy grandes, considera herramientas de línea de comandos o la biblioteca pandas de Python.' },
        { q: '¿Qué pasa si mi CSV tiene valores faltantes?', a: 'Los valores faltantes en filas CSV se convierten en cadenas vacías en JSON. El convertidor maneja filas con menos columnas que el encabezado.' },
        { q: '¿El convertidor JSON a CSV maneja objetos JSON anidados?', a: 'Este convertidor funciona con arrays JSON planos de objetos. Los objetos anidados se convierten en su representación de cadena.' },
      ],
    },
    fr: {
      title: 'Convertisseur CSV vers JSON : Transformez les Formats de Données Instantanément',
      paragraphs: [
        'La conversion entre CSV et JSON est l\'une des tâches de transformation de données les plus courantes dans le développement logiciel, l\'analyse de données et l\'intégration de systèmes. CSV est le format standard pour les tableurs et exportations de bases de données, tandis que JSON est le format dominant pour les APIs web.',
        'Le convertisseur CSV vers JSON analyse vos données séparées par des virgules, utilisant la première ligne comme noms de champs et les lignes suivantes comme enregistrements. Chaque ligne devient un objet JSON avec des propriétés nommées.',
        'Les professionnels des données utilisent cet outil pour préparer des charges utiles d\'API à partir de données de tableurs, convertir des réponses API en CSV pour l\'analyse dans Excel, migrer des données entre systèmes avec différents formats.',
        'Le convertisseur gère le format CSV standard avec des virgules comme délimiteurs. Pour de meilleurs résultats, assurez-vous que vos données CSV ont une ligne d\'en-tête et des nombres de colonnes cohérents.',
      ],
      faq: [
        { q: 'Quelle est la différence entre les formats CSV et JSON ?', a: 'CSV est un format tabulaire plat avec des données en lignes et colonnes séparées par des virgules. JSON est un format hiérarchique qui supporte les objets et tableaux imbriqués.' },
        { q: 'Comment convertir un fichier CSV d\'Excel en JSON ?', a: 'Ouvrez votre fichier Excel, enregistrez-le en CSV, puis copiez le texte CSV et collez-le dans ce convertisseur.' },
        { q: 'Cet outil peut-il gérer de gros fichiers CSV ?', a: 'Cet outil basé sur le navigateur fonctionne bien pour les données CSV jusqu\'à plusieurs milliers de lignes. Pour de très grands ensembles de données, considérez des outils en ligne de commande.' },
        { q: 'Que se passe-t-il si mon CSV a des valeurs manquantes ?', a: 'Les valeurs manquantes dans les lignes CSV sont converties en chaînes vides en JSON.' },
        { q: 'Le convertisseur JSON vers CSV gère-t-il les objets JSON imbriqués ?', a: 'Ce convertisseur fonctionne avec des tableaux JSON plats d\'objets. Les objets imbriqués sont convertis en leur représentation de chaîne.' },
      ],
    },
    de: {
      title: 'CSV zu JSON Konverter: Datenformate Sofort Umwandeln',
      paragraphs: [
        'Die Konvertierung zwischen CSV und JSON ist eine der häufigsten Datentransformationsaufgaben in der Softwareentwicklung, Datenanalyse und Systemintegration. CSV ist das Standardformat für Tabellenkalkulationen und Datenbankexporte, während JSON das dominierende Format für Web-APIs und moderne Anwendungen ist.',
        'Der CSV-zu-JSON-Konverter parst Ihre kommagetrennten Daten und verwendet die erste Zeile als Feldnamen und die nachfolgenden Zeilen als Datensätze. Jede Zeile wird zu einem JSON-Objekt mit benannten Eigenschaften.',
        'Datenprofis nutzen dieses Tool, um API-Payloads aus Tabellendaten vorzubereiten, API-Antworten in CSV für die Analyse in Excel umzuwandeln und Daten zwischen Systemen mit verschiedenen Formaten zu migrieren.',
        'Der Konverter verarbeitet Standard-CSV-Formatierung mit Kommas als Trennzeichen. Für beste Ergebnisse stellen Sie sicher, dass Ihre CSV-Daten eine Kopfzeile und konsistente Spaltenanzahlen haben.',
      ],
      faq: [
        { q: 'Was ist der Unterschied zwischen CSV und JSON?', a: 'CSV ist ein flaches, tabellarisches Format mit Daten in Zeilen und Spalten, getrennt durch Kommas. JSON ist ein hierarchisches Format, das verschachtelte Objekte und Arrays unterstützt.' },
        { q: 'Wie konvertiere ich eine CSV-Datei aus Excel zu JSON?', a: 'Öffnen Sie Ihre Excel-Datei, speichern Sie sie als CSV, kopieren Sie den CSV-Text und fügen Sie ihn in diesen Konverter ein.' },
        { q: 'Kann dieses Tool große CSV-Dateien verarbeiten?', a: 'Dieses browserbasierte Tool funktioniert gut für CSV-Daten bis zu mehreren tausend Zeilen. Für sehr große Datensätze verwenden Sie Kommandozeilen-Tools oder Pythons pandas-Bibliothek.' },
        { q: 'Was passiert bei fehlenden Werten im CSV?', a: 'Fehlende Werte in CSV-Zeilen werden in JSON zu leeren Strings konvertiert.' },
        { q: 'Verarbeitet der JSON-zu-CSV-Konverter verschachtelte JSON-Objekte?', a: 'Dieser Konverter arbeitet mit flachen JSON-Arrays von Objekten. Verschachtelte Objekte werden in ihre String-Darstellung konvertiert.' },
      ],
    },
    pt: {
      title: 'Conversor CSV para JSON: Transforme Formatos de Dados Instantaneamente',
      paragraphs: [
        'A conversão entre CSV e JSON é uma das tarefas de transformação de dados mais comuns no desenvolvimento de software, análise de dados e integração de sistemas. CSV é o formato padrão para planilhas e exportações de banco de dados, enquanto JSON é o formato dominante para APIs web e aplicações modernas.',
        'O conversor CSV para JSON analisa seus dados separados por vírgulas, usando a primeira linha como nomes de campos e as linhas seguintes como registros de dados. Cada linha se torna um objeto JSON com propriedades nomeadas.',
        'Profissionais de dados usam esta ferramenta para preparar payloads de API a partir de dados de planilhas, converter respostas de API em CSV para análise no Excel, migrar dados entre sistemas com formatos diferentes e gerar dados de teste.',
        'O conversor lida com formatação CSV padrão com vírgulas como delimitadores. Para melhores resultados, certifique-se de que seus dados CSV tenham uma linha de cabeçalho e contagens de colunas consistentes.',
      ],
      faq: [
        { q: 'Qual é a diferença entre os formatos CSV e JSON?', a: 'CSV é um formato tabular plano com dados em linhas e colunas separadas por vírgulas. JSON é um formato hierárquico que suporta objetos e arrays aninhados.' },
        { q: 'Como converto um arquivo CSV do Excel para JSON?', a: 'Abra seu arquivo Excel, salve como CSV, depois copie o texto CSV e cole neste conversor.' },
        { q: 'Esta ferramenta pode lidar com arquivos CSV grandes?', a: 'Esta ferramenta baseada em navegador funciona bem para dados CSV de até vários milhares de linhas. Para conjuntos de dados muito grandes, considere ferramentas de linha de comando ou a biblioteca pandas do Python.' },
        { q: 'O que acontece se meu CSV tiver valores ausentes?', a: 'Valores ausentes em linhas CSV são convertidos em strings vazias no JSON.' },
        { q: 'O conversor JSON para CSV lida com objetos JSON aninhados?', a: 'Este conversor funciona com arrays JSON planos de objetos. Objetos aninhados são convertidos em sua representação de string.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="csv-to-json" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
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
                  <span className="text-gray-400">{openFaq === i ? '−' : '+'}</span>
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
