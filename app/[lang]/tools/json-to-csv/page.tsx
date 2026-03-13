'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  jsonInput: { en: 'JSON Input', it: 'Input JSON', es: 'Entrada JSON', fr: 'Entrée JSON', de: 'JSON-Eingabe', pt: 'Entrada JSON' },
  csvOutput: { en: 'CSV Output', it: 'Output CSV', es: 'Salida CSV', fr: 'Sortie CSV', de: 'CSV-Ausgabe', pt: 'Saída CSV' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  error: { en: 'Invalid JSON input', it: 'Input JSON non valido', es: 'Entrada JSON inválida', fr: 'Entrée JSON invalide', de: 'Ungültige JSON-Eingabe', pt: 'Entrada JSON inválida' },
  errorNotArray: { en: 'JSON must be an array of objects', it: 'Il JSON deve essere un array di oggetti', es: 'El JSON debe ser un array de objetos', fr: 'Le JSON doit être un tableau d\'objets', de: 'JSON muss ein Array von Objekten sein', pt: 'O JSON deve ser um array de objetos' },
  errorEmpty: { en: 'Input is empty', it: 'L\'input è vuoto', es: 'La entrada está vacía', fr: 'L\'entrée est vide', de: 'Eingabe ist leer', pt: 'A entrada está vazia' },
  errorEmptyArray: { en: 'JSON array is empty', it: 'L\'array JSON è vuoto', es: 'El array JSON está vacío', fr: 'Le tableau JSON est vide', de: 'JSON-Array ist leer', pt: 'O array JSON está vazio' },
  rows: { en: 'Rows', it: 'Righe', es: 'Filas', fr: 'Lignes', de: 'Zeilen', pt: 'Linhas' },
  columns: { en: 'Columns', it: 'Colonne', es: 'Columnas', fr: 'Colonnes', de: 'Spalten', pt: 'Colunas' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  copyResult: { en: 'Copy Result', it: 'Copia risultato', es: 'Copiar resultado', fr: 'Copier le résultat', de: 'Ergebnis kopieren', pt: 'Copiar resultado' },
  downloadCsv: { en: 'Download CSV', it: 'Scarica CSV', es: 'Descargar CSV', fr: 'Télécharger CSV', de: 'CSV herunterladen', pt: 'Baixar CSV' },
  delimiter: { en: 'Delimiter', it: 'Delimitatore', es: 'Delimitador', fr: 'Délimiteur', de: 'Trennzeichen', pt: 'Delimitador' },
  comma: { en: 'Comma (,)', it: 'Virgola (,)', es: 'Coma (,)', fr: 'Virgule (,)', de: 'Komma (,)', pt: 'Vírgula (,)' },
  semicolon: { en: 'Semicolon (;)', it: 'Punto e virgola (;)', es: 'Punto y coma (;)', fr: 'Point-virgule (;)', de: 'Semikolon (;)', pt: 'Ponto e vírgula (;)' },
  tab: { en: 'Tab', it: 'Tabulazione', es: 'Tabulación', fr: 'Tabulation', de: 'Tabulator', pt: 'Tabulação' },
  includeHeaders: { en: 'Include headers', it: 'Includi intestazioni', es: 'Incluir encabezados', fr: 'Inclure les en-têtes', de: 'Kopfzeilen einschließen', pt: 'Incluir cabeçalhos' },
  options: { en: 'Options', it: 'Opzioni', es: 'Opciones', fr: 'Options', de: 'Optionen', pt: 'Opções' },
  history: { en: 'History', it: 'Cronologia', es: 'Historial', fr: 'Historique', de: 'Verlauf', pt: 'Histórico' },
  noHistory: { en: 'No conversions yet', it: 'Nessuna conversione', es: 'Sin conversiones aún', fr: 'Aucune conversion', de: 'Noch keine Konvertierungen', pt: 'Nenhuma conversão ainda' },
  clearHistory: { en: 'Clear history', it: 'Cancella cronologia', es: 'Borrar historial', fr: 'Effacer l\'historique', de: 'Verlauf löschen', pt: 'Limpar histórico' },
  jsonPlaceholder: {
    en: '[\n  {"name": "John", "age": 30, "city": "NYC"},\n  {"name": "Jane", "age": 25, "city": "LA"}\n]',
    it: '[\n  {"nome": "Mario", "età": 30, "città": "Roma"},\n  {"nome": "Lucia", "età": 25, "città": "Milano"}\n]',
    es: '[\n  {"nombre": "Juan", "edad": 30, "ciudad": "Madrid"},\n  {"nombre": "Ana", "edad": 25, "ciudad": "Barcelona"}\n]',
    fr: '[\n  {"nom": "Jean", "âge": 30, "ville": "Paris"},\n  {"nom": "Marie", "âge": 25, "ville": "Lyon"}\n]',
    de: '[\n  {"Name": "Hans", "Alter": 30, "Stadt": "Berlin"},\n  {"Name": "Anna", "Alter": 25, "Stadt": "München"}\n]',
    pt: '[\n  {"nome": "João", "idade": 30, "cidade": "Lisboa"},\n  {"nome": "Ana", "idade": 25, "cidade": "Porto"}\n]',
  },
  flattenNested: { en: 'Flatten nested objects (dot notation)', it: 'Appiattisci oggetti annidati (notazione punto)', es: 'Aplanar objetos anidados (notación punto)', fr: 'Aplatir les objets imbriqués (notation point)', de: 'Verschachtelte Objekte flachstellen (Punkt-Notation)', pt: 'Achatar objetos aninhados (notação ponto)' },
  preview: { en: 'Preview', it: 'Anteprima', es: 'Vista previa', fr: 'Aperçu', de: 'Vorschau', pt: 'Pré-visualização' },
};

type DelimiterKey = 'comma' | 'semicolon' | 'tab';
const delimiterMap: Record<DelimiterKey, string> = { comma: ',', semicolon: ';', tab: '\t' };

interface HistoryEntry {
  input: string;
  output: string;
  timestamp: number;
}

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey));
    } else if (Array.isArray(value)) {
      result[fullKey] = JSON.stringify(value);
    } else {
      result[fullKey] = value === null || value === undefined ? '' : String(value);
    }
  }
  return result;
}

function escapeCSVField(field: string, delimiter: string): string {
  if (field.includes(delimiter) || field.includes('"') || field.includes('\n') || field.includes('\r')) {
    return '"' + field.replace(/"/g, '""') + '"';
  }
  return field;
}

function jsonToCsv(
  jsonStr: string,
  delimiter: string,
  includeHeaders: boolean,
  flatten: boolean
): { csv: string; rows: number; cols: number; error?: string } {
  const trimmed = jsonStr.trim();
  if (!trimmed) return { csv: '', rows: 0, cols: 0, error: 'errorEmpty' };

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { csv: '', rows: 0, cols: 0, error: 'error' };
  }

  if (!Array.isArray(parsed)) {
    return { csv: '', rows: 0, cols: 0, error: 'errorNotArray' };
  }

  if (parsed.length === 0) {
    return { csv: '', rows: 0, cols: 0, error: 'errorEmptyArray' };
  }

  // Flatten all objects if needed and collect all unique keys
  const flatRows: Record<string, string>[] = parsed.map((item) => {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      return { value: String(item) };
    }
    if (flatten) {
      return flattenObject(item as Record<string, unknown>);
    }
    const row: Record<string, string> = {};
    for (const key of Object.keys(item as Record<string, unknown>)) {
      const val = (item as Record<string, unknown>)[key];
      if (val !== null && typeof val === 'object') {
        row[key] = JSON.stringify(val);
      } else {
        row[key] = val === null || val === undefined ? '' : String(val);
      }
    }
    return row;
  });

  // Collect all unique headers in order of appearance
  const headersSet = new Set<string>();
  for (const row of flatRows) {
    for (const key of Object.keys(row)) {
      headersSet.add(key);
    }
  }
  const headers = Array.from(headersSet);

  const csvLines: string[] = [];
  if (includeHeaders) {
    csvLines.push(headers.map((h) => escapeCSVField(h, delimiter)).join(delimiter));
  }

  for (const row of flatRows) {
    const line = headers.map((h) => escapeCSVField(row[h] ?? '', delimiter)).join(delimiter);
    csvLines.push(line);
  }

  return { csv: csvLines.join('\n'), rows: flatRows.length, cols: headers.length };
}

export default function JsonToCsv() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['json-to-csv'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [delimiterKey, setDelimiterKey] = useState<DelimiterKey>('comma');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [flatten, setFlatten] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const delimiter = delimiterMap[delimiterKey];

  let output = '';
  let error = '';
  let rowCount = 0;
  let colCount = 0;

  try {
    if (input.trim()) {
      const result = jsonToCsv(input, delimiter, includeHeaders, flatten);
      if (result.error) {
        error = t(result.error);
      } else {
        output = result.csv;
        rowCount = result.rows;
        colCount = result.cols;
      }
    }
  } catch {
    error = t('error');
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInput('');
    setCopied(false);
  };

  const downloadResult = () => {
    const blob = new Blob([output], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'result.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveToHistory = useCallback(() => {
    if (!output || error) return;
    setHistory((prev) => {
      const entry: HistoryEntry = { input, output, timestamp: Date.now() };
      const updated = [entry, ...prev.filter((h) => h.input !== input)].slice(0, 5);
      return updated;
    });
  }, [output, error, input]);

  // Save to history when output changes and is valid
  const prevOutputRef = useState<string>('');
  if (output && !error && output !== prevOutputRef[0]) {
    prevOutputRef[0] = output;
    queueMicrotask(() => saveToHistory());
  }

  const loadFromHistory = (entry: HistoryEntry) => {
    setInput(entry.input);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'JSON to CSV Converter: Transform JSON Data to Spreadsheet Format',
      paragraphs: [
        'Converting JSON data to CSV is an essential task for developers, data analysts, and anyone working with APIs and databases. JSON (JavaScript Object Notation) is the standard data interchange format for web applications, while CSV (Comma-Separated Values) remains the universal format for spreadsheets, data imports, and reporting tools. Our free online JSON to CSV converter bridges these two worlds instantly.',
        'This tool takes an array of JSON objects and transforms it into clean, well-formatted CSV output. It automatically detects all unique keys across your objects to build the column headers, handles missing values gracefully, and properly escapes fields that contain delimiters, quotes, or newlines. You can choose between comma, semicolon, or tab delimiters depending on your regional preferences or target application.',
        'One of the most powerful features is nested object flattening. When your JSON contains nested objects like {"address": {"city": "NYC", "zip": "10001"}}, the converter flattens them using dot notation (address.city, address.zip), creating clean flat columns perfect for spreadsheet analysis. Arrays within objects are serialized as JSON strings to preserve the data.',
        'Common use cases include exporting API response data into Excel or Google Sheets, preparing database records for CSV import into another system, generating reports from JSON log files, and converting configuration data into tabular format for review. The include/exclude headers toggle is useful when appending data to an existing CSV file.',
        'The converter runs entirely in your browser with no data sent to any server, ensuring complete privacy for sensitive data. It handles thousands of rows efficiently and provides instant preview of the CSV output. You can copy the result to your clipboard or download it directly as a .csv file ready for use in any spreadsheet application.',
      ],
      faq: [
        { q: 'What JSON format does this converter accept?', a: 'The converter accepts a JSON array of objects, like [{"name":"John","age":30},{"name":"Jane","age":25}]. Each object in the array becomes one row in the CSV output. All unique keys across all objects become column headers.' },
        { q: 'How does the converter handle nested JSON objects?', a: 'When the "Flatten nested objects" option is enabled, nested objects are flattened using dot notation. For example, {"user":{"name":"John","address":{"city":"NYC"}}} becomes columns user.name and user.address.city. Arrays are serialized as JSON strings.' },
        { q: 'Can I change the CSV delimiter from commas to something else?', a: 'Yes, you can choose between three delimiters: comma (standard CSV), semicolon (common in European locales where comma is the decimal separator), and tab (TSV format). Select your preferred delimiter from the options panel before converting.' },
        { q: 'What happens if JSON objects have different keys?', a: 'The converter collects all unique keys from every object in the array. If an object is missing a key that exists in other objects, the corresponding CSV cell will be empty. This ensures all data is preserved regardless of inconsistent object structures.' },
        { q: 'Is my data safe when using this converter?', a: 'Yes, absolutely. The conversion happens entirely in your browser using JavaScript. No data is sent to any external server. Your JSON data never leaves your computer, making it safe for sensitive or confidential information.' },
      ],
    },
    it: {
      title: 'Convertitore JSON a CSV: Trasforma Dati JSON in Formato Foglio di Calcolo',
      paragraphs: [
        'La conversione di dati JSON in CSV è un\'operazione essenziale per sviluppatori, analisti di dati e chiunque lavori con API e database. JSON (JavaScript Object Notation) è il formato standard di scambio dati per applicazioni web, mentre CSV (Comma-Separated Values) rimane il formato universale per fogli di calcolo, importazioni dati e strumenti di reporting. Il nostro convertitore gratuito online da JSON a CSV collega questi due mondi istantaneamente.',
        'Questo strumento prende un array di oggetti JSON e lo trasforma in un output CSV pulito e ben formattato. Rileva automaticamente tutte le chiavi uniche nei tuoi oggetti per costruire le intestazioni delle colonne, gestisce i valori mancanti in modo elegante e fa correttamente l\'escape dei campi che contengono delimitatori, virgolette o a capo. Puoi scegliere tra virgola, punto e virgola o tabulazione come delimitatore.',
        'Una delle funzionalità più potenti è l\'appiattimento degli oggetti annidati. Quando il tuo JSON contiene oggetti annidati come {"indirizzo": {"città": "Roma", "cap": "00100"}}, il convertitore li appiattisce usando la notazione punto (indirizzo.città, indirizzo.cap), creando colonne piatte perfette per l\'analisi su foglio di calcolo.',
        'I casi d\'uso comuni includono l\'esportazione di dati di risposta API in Excel o Google Sheets, la preparazione di record di database per l\'importazione CSV in un altro sistema, la generazione di report da file di log JSON e la conversione di dati di configurazione in formato tabulare. L\'opzione per includere o escludere le intestazioni è utile quando si aggiungono dati a un file CSV esistente.',
        'Il convertitore funziona interamente nel tuo browser senza inviare dati a nessun server, garantendo la completa privacy per i dati sensibili. Gestisce migliaia di righe in modo efficiente e fornisce un\'anteprima istantanea dell\'output CSV. Puoi copiare il risultato negli appunti o scaricarlo direttamente come file .csv.',
      ],
      faq: [
        { q: 'Quale formato JSON accetta questo convertitore?', a: 'Il convertitore accetta un array JSON di oggetti, come [{"nome":"Mario","età":30},{"nome":"Lucia","età":25}]. Ogni oggetto nell\'array diventa una riga nell\'output CSV. Tutte le chiavi uniche diventano intestazioni di colonna.' },
        { q: 'Come gestisce il convertitore gli oggetti JSON annidati?', a: 'Quando l\'opzione "Appiattisci oggetti annidati" è attiva, gli oggetti annidati vengono appiattiti usando la notazione punto. Ad esempio, {"utente":{"nome":"Mario","indirizzo":{"città":"Roma"}}} diventa le colonne utente.nome e utente.indirizzo.città. Gli array vengono serializzati come stringhe JSON.' },
        { q: 'Posso cambiare il delimitatore CSV dalla virgola a qualcos\'altro?', a: 'Sì, puoi scegliere tra tre delimitatori: virgola (CSV standard), punto e virgola (comune nei paesi europei dove la virgola è il separatore decimale) e tabulazione (formato TSV). Seleziona il delimitatore preferito dal pannello opzioni.' },
        { q: 'Cosa succede se gli oggetti JSON hanno chiavi diverse?', a: 'Il convertitore raccoglie tutte le chiavi uniche da ogni oggetto nell\'array. Se un oggetto manca di una chiave presente in altri oggetti, la cella CSV corrispondente sarà vuota. Questo garantisce che tutti i dati vengano preservati.' },
        { q: 'I miei dati sono al sicuro usando questo convertitore?', a: 'Sì, assolutamente. La conversione avviene interamente nel tuo browser usando JavaScript. Nessun dato viene inviato a server esterni. I tuoi dati JSON non lasciano mai il tuo computer.' },
      ],
    },
    es: {
      title: 'Convertidor JSON a CSV: Transforma Datos JSON a Formato de Hoja de Cálculo',
      paragraphs: [
        'Convertir datos JSON a CSV es una tarea esencial para desarrolladores, analistas de datos y cualquier persona que trabaje con APIs y bases de datos. JSON (JavaScript Object Notation) es el formato estándar de intercambio de datos para aplicaciones web, mientras que CSV (Comma-Separated Values) sigue siendo el formato universal para hojas de cálculo, importaciones de datos y herramientas de informes.',
        'Esta herramienta toma un array de objetos JSON y lo transforma en una salida CSV limpia y bien formateada. Detecta automáticamente todas las claves únicas en tus objetos para construir los encabezados de columna, maneja valores faltantes de manera elegante y escapa correctamente los campos que contienen delimitadores, comillas o saltos de línea.',
        'Una de las características más potentes es el aplanamiento de objetos anidados. Cuando tu JSON contiene objetos anidados como {"dirección": {"ciudad": "Madrid", "cp": "28001"}}, el convertidor los aplana usando notación de punto (dirección.ciudad, dirección.cp), creando columnas planas perfectas para el análisis en hojas de cálculo.',
        'Los casos de uso comunes incluyen exportar datos de respuesta de API a Excel o Google Sheets, preparar registros de base de datos para importación CSV, generar informes desde archivos de registro JSON y convertir datos de configuración en formato tabular. La opción de incluir o excluir encabezados es útil al agregar datos a un archivo CSV existente.',
        'El convertidor funciona completamente en tu navegador sin enviar datos a ningún servidor, garantizando privacidad total para datos sensibles. Maneja miles de filas eficientemente y proporciona una vista previa instantánea de la salida CSV.',
      ],
      faq: [
        { q: '¿Qué formato JSON acepta este convertidor?', a: 'El convertidor acepta un array JSON de objetos, como [{"nombre":"Juan","edad":30},{"nombre":"Ana","edad":25}]. Cada objeto en el array se convierte en una fila en la salida CSV. Todas las claves únicas se convierten en encabezados de columna.' },
        { q: '¿Cómo maneja el convertidor los objetos JSON anidados?', a: 'Cuando la opción "Aplanar objetos anidados" está activada, los objetos anidados se aplanan usando notación de punto. Por ejemplo, {"usuario":{"nombre":"Juan","dirección":{"ciudad":"Madrid"}}} se convierte en las columnas usuario.nombre y usuario.dirección.ciudad.' },
        { q: '¿Puedo cambiar el delimitador CSV de comas a otro?', a: 'Sí, puedes elegir entre tres delimitadores: coma (CSV estándar), punto y coma (común en países europeos donde la coma es el separador decimal) y tabulación (formato TSV).' },
        { q: '¿Qué pasa si los objetos JSON tienen claves diferentes?', a: 'El convertidor recopila todas las claves únicas de cada objeto en el array. Si un objeto carece de una clave que existe en otros objetos, la celda CSV correspondiente estará vacía.' },
        { q: '¿Mis datos están seguros al usar este convertidor?', a: 'Sí, absolutamente. La conversión ocurre completamente en tu navegador usando JavaScript. Ningún dato se envía a servidores externos. Tus datos JSON nunca salen de tu computadora.' },
      ],
    },
    fr: {
      title: 'Convertisseur JSON vers CSV : Transformez les Données JSON en Format Tableur',
      paragraphs: [
        'La conversion de données JSON en CSV est une tâche essentielle pour les développeurs, les analystes de données et toute personne travaillant avec des APIs et des bases de données. JSON (JavaScript Object Notation) est le format standard d\'échange de données pour les applications web, tandis que CSV (Comma-Separated Values) reste le format universel pour les tableurs, les importations de données et les outils de reporting.',
        'Cet outil prend un tableau d\'objets JSON et le transforme en une sortie CSV propre et bien formatée. Il détecte automatiquement toutes les clés uniques dans vos objets pour construire les en-têtes de colonnes, gère les valeurs manquantes avec élégance et échappe correctement les champs contenant des délimiteurs, des guillemets ou des retours à la ligne.',
        'L\'une des fonctionnalités les plus puissantes est l\'aplatissement des objets imbriqués. Lorsque votre JSON contient des objets imbriqués comme {"adresse": {"ville": "Paris", "cp": "75001"}}, le convertisseur les aplatit en utilisant la notation point (adresse.ville, adresse.cp), créant des colonnes plates parfaites pour l\'analyse en tableur.',
        'Les cas d\'utilisation courants incluent l\'exportation de données de réponse API vers Excel ou Google Sheets, la préparation de enregistrements de base de données pour l\'importation CSV, la génération de rapports à partir de fichiers de log JSON et la conversion de données de configuration en format tabulaire.',
        'Le convertisseur fonctionne entièrement dans votre navigateur sans envoyer de données à aucun serveur, garantissant une confidentialité totale pour les données sensibles. Il gère des milliers de lignes efficacement et fournit un aperçu instantané de la sortie CSV.',
      ],
      faq: [
        { q: 'Quel format JSON ce convertisseur accepte-t-il ?', a: 'Le convertisseur accepte un tableau JSON d\'objets, comme [{"nom":"Jean","âge":30},{"nom":"Marie","âge":25}]. Chaque objet du tableau devient une ligne dans la sortie CSV. Toutes les clés uniques deviennent des en-têtes de colonnes.' },
        { q: 'Comment le convertisseur gère-t-il les objets JSON imbriqués ?', a: 'Lorsque l\'option "Aplatir les objets imbriqués" est activée, les objets imbriqués sont aplatis en utilisant la notation point. Par exemple, {"utilisateur":{"nom":"Jean","adresse":{"ville":"Paris"}}} devient les colonnes utilisateur.nom et utilisateur.adresse.ville.' },
        { q: 'Puis-je changer le délimiteur CSV des virgules à autre chose ?', a: 'Oui, vous pouvez choisir entre trois délimiteurs : virgule (CSV standard), point-virgule (courant dans les pays européens où la virgule est le séparateur décimal) et tabulation (format TSV).' },
        { q: 'Que se passe-t-il si les objets JSON ont des clés différentes ?', a: 'Le convertisseur collecte toutes les clés uniques de chaque objet du tableau. Si un objet manque une clé présente dans d\'autres objets, la cellule CSV correspondante sera vide.' },
        { q: 'Mes données sont-elles en sécurité avec ce convertisseur ?', a: 'Oui, absolument. La conversion se fait entièrement dans votre navigateur en JavaScript. Aucune donnée n\'est envoyée à des serveurs externes. Vos données JSON ne quittent jamais votre ordinateur.' },
      ],
    },
    de: {
      title: 'JSON zu CSV Konverter: JSON-Daten in Tabellenformat Umwandeln',
      paragraphs: [
        'Die Konvertierung von JSON-Daten in CSV ist eine wesentliche Aufgabe für Entwickler, Datenanalysten und alle, die mit APIs und Datenbanken arbeiten. JSON (JavaScript Object Notation) ist das Standard-Datenaustauschformat für Webanwendungen, während CSV (Comma-Separated Values) das universelle Format für Tabellenkalkulationen, Datenimporte und Reporting-Tools bleibt.',
        'Dieses Tool nimmt ein Array von JSON-Objekten und wandelt es in eine saubere, gut formatierte CSV-Ausgabe um. Es erkennt automatisch alle eindeutigen Schlüssel in Ihren Objekten, um die Spaltenüberschriften zu erstellen, behandelt fehlende Werte elegant und escaped Felder korrekt, die Trennzeichen, Anführungszeichen oder Zeilenumbrüche enthalten.',
        'Eine der leistungsstärksten Funktionen ist das Flachstellen verschachtelter Objekte. Wenn Ihr JSON verschachtelte Objekte wie {"adresse": {"stadt": "Berlin", "plz": "10115"}} enthält, flacht der Konverter sie mit Punkt-Notation (adresse.stadt, adresse.plz) ab und erstellt flache Spalten, die perfekt für die Tabellenanalyse sind.',
        'Häufige Anwendungsfälle umfassen den Export von API-Antwortdaten nach Excel oder Google Sheets, die Vorbereitung von Datenbankeinträgen für den CSV-Import, die Erstellung von Berichten aus JSON-Logdateien und die Konvertierung von Konfigurationsdaten in tabellarisches Format.',
        'Der Konverter läuft vollständig in Ihrem Browser, ohne Daten an einen Server zu senden, und gewährleistet vollständige Privatsphäre für sensible Daten. Er verarbeitet Tausende von Zeilen effizient und bietet eine sofortige Vorschau der CSV-Ausgabe.',
      ],
      faq: [
        { q: 'Welches JSON-Format akzeptiert dieser Konverter?', a: 'Der Konverter akzeptiert ein JSON-Array von Objekten, wie [{"Name":"Hans","Alter":30},{"Name":"Anna","Alter":25}]. Jedes Objekt im Array wird zu einer Zeile in der CSV-Ausgabe. Alle eindeutigen Schlüssel werden zu Spaltenüberschriften.' },
        { q: 'Wie behandelt der Konverter verschachtelte JSON-Objekte?', a: 'Wenn die Option "Verschachtelte Objekte flachstellen" aktiviert ist, werden verschachtelte Objekte mit Punkt-Notation abgeflacht. Zum Beispiel wird {"benutzer":{"name":"Hans","adresse":{"stadt":"Berlin"}}} zu den Spalten benutzer.name und benutzer.adresse.stadt.' },
        { q: 'Kann ich das CSV-Trennzeichen von Kommas ändern?', a: 'Ja, Sie können zwischen drei Trennzeichen wählen: Komma (Standard-CSV), Semikolon (üblich in europäischen Ländern, wo das Komma als Dezimaltrennzeichen dient) und Tabulator (TSV-Format).' },
        { q: 'Was passiert, wenn JSON-Objekte unterschiedliche Schlüssel haben?', a: 'Der Konverter sammelt alle eindeutigen Schlüssel aus jedem Objekt im Array. Wenn einem Objekt ein Schlüssel fehlt, der in anderen Objekten vorhanden ist, bleibt die entsprechende CSV-Zelle leer.' },
        { q: 'Sind meine Daten bei der Verwendung dieses Konverters sicher?', a: 'Ja, absolut. Die Konvertierung erfolgt vollständig in Ihrem Browser mit JavaScript. Es werden keine Daten an externe Server gesendet. Ihre JSON-Daten verlassen niemals Ihren Computer.' },
      ],
    },
    pt: {
      title: 'Conversor JSON para CSV: Transforme Dados JSON em Formato de Planilha',
      paragraphs: [
        'Converter dados JSON para CSV é uma tarefa essencial para desenvolvedores, analistas de dados e qualquer pessoa que trabalhe com APIs e bancos de dados. JSON (JavaScript Object Notation) é o formato padrão de troca de dados para aplicações web, enquanto CSV (Comma-Separated Values) continua sendo o formato universal para planilhas, importações de dados e ferramentas de relatórios.',
        'Esta ferramenta pega um array de objetos JSON e o transforma em uma saída CSV limpa e bem formatada. Ela detecta automaticamente todas as chaves únicas em seus objetos para construir os cabeçalhos de coluna, lida com valores ausentes de forma elegante e faz o escape correto de campos que contêm delimitadores, aspas ou quebras de linha.',
        'Uma das funcionalidades mais poderosas é o achatamento de objetos aninhados. Quando seu JSON contém objetos aninhados como {"endereço": {"cidade": "Lisboa", "cep": "1000-001"}}, o conversor os achata usando notação de ponto (endereço.cidade, endereço.cep), criando colunas planas perfeitas para análise em planilhas.',
        'Os casos de uso comuns incluem exportar dados de resposta de API para Excel ou Google Sheets, preparar registros de banco de dados para importação CSV, gerar relatórios a partir de arquivos de log JSON e converter dados de configuração em formato tabular.',
        'O conversor funciona inteiramente no seu navegador sem enviar dados a nenhum servidor, garantindo privacidade total para dados sensíveis. Ele lida com milhares de linhas eficientemente e fornece uma pré-visualização instantânea da saída CSV.',
      ],
      faq: [
        { q: 'Qual formato JSON este conversor aceita?', a: 'O conversor aceita um array JSON de objetos, como [{"nome":"João","idade":30},{"nome":"Ana","idade":25}]. Cada objeto no array se torna uma linha na saída CSV. Todas as chaves únicas se tornam cabeçalhos de coluna.' },
        { q: 'Como o conversor lida com objetos JSON aninhados?', a: 'Quando a opção "Achatar objetos aninhados" está ativada, objetos aninhados são achatados usando notação de ponto. Por exemplo, {"usuário":{"nome":"João","endereço":{"cidade":"Lisboa"}}} se torna as colunas usuário.nome e usuário.endereço.cidade.' },
        { q: 'Posso mudar o delimitador CSV de vírgulas para outro?', a: 'Sim, você pode escolher entre três delimitadores: vírgula (CSV padrão), ponto e vírgula (comum em países europeus onde a vírgula é o separador decimal) e tabulação (formato TSV).' },
        { q: 'O que acontece se os objetos JSON tiverem chaves diferentes?', a: 'O conversor coleta todas as chaves únicas de cada objeto no array. Se um objeto não tiver uma chave que existe em outros objetos, a célula CSV correspondente ficará vazia.' },
        { q: 'Meus dados estão seguros ao usar este conversor?', a: 'Sim, absolutamente. A conversão acontece inteiramente no seu navegador usando JavaScript. Nenhum dado é enviado a servidores externos. Seus dados JSON nunca saem do seu computador.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="json-to-csv" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Options: delimiter + headers + flatten */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-700">{t('options')}</p>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">{t('delimiter')}:</label>
                <select
                  value={delimiterKey}
                  onChange={(e) => setDelimiterKey(e.target.value as DelimiterKey)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="comma">{t('comma')}</option>
                  <option value="semicolon">{t('semicolon')}</option>
                  <option value="tab">{t('tab')}</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHeaders}
                  onChange={(e) => setIncludeHeaders(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {t('includeHeaders')}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flatten}
                  onChange={(e) => setFlatten(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {t('flattenNested')}
              </label>
            </div>
          </div>

          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('jsonInput')}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('jsonPlaceholder')}
              rows={8}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Validation error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Result cards */}
          {output && !error && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-700">{rowCount}</p>
                <p className="text-sm text-blue-600">{t('rows')}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{colCount}</p>
                <p className="text-sm text-green-600">{t('columns')}</p>
              </div>
            </div>
          )}

          {/* Output */}
          {output && !error && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">
                  {t('csvOutput')}
                </label>
              </div>
              <textarea
                value={output}
                readOnly
                rows={8}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {output && !error && (
              <>
                <button
                  onClick={copyOutput}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {copied ? t('copied') : t('copyResult')}
                </button>
                <button
                  onClick={downloadResult}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  {t('downloadCsv')}
                </button>
              </>
            )}
            {input && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                {t('reset')}
              </button>
            )}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-700">{t('history')}</h3>
              <button
                onClick={() => setHistory([])}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                {t('clearHistory')}
              </button>
            </div>
            <div className="space-y-2">
              {history.map((entry) => (
                <button
                  key={entry.timestamp}
                  onClick={() => loadFromHistory(entry)}
                  className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-blue-600">
                      JSON → CSV
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate font-mono">
                    {entry.input.slice(0, 80)}{entry.input.length > 80 ? '...' : ''}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

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
