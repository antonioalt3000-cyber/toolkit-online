'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  modeToDate: { en: 'Timestamp to Date', it: 'Timestamp a Data', es: 'Timestamp a Fecha', fr: 'Timestamp vers Date', de: 'Timestamp zu Datum', pt: 'Timestamp para Data' },
  modeToTimestamp: { en: 'Date to Timestamp', it: 'Data a Timestamp', es: 'Fecha a Timestamp', fr: 'Date vers Timestamp', de: 'Datum zu Timestamp', pt: 'Data para Timestamp' },
  currentTimestamp: { en: 'Current Unix Timestamp', it: 'Timestamp Unix Attuale', es: 'Timestamp Unix Actual', fr: 'Timestamp Unix Actuel', de: 'Aktueller Unix-Timestamp', pt: 'Timestamp Unix Atual' },
  enterTimestamp: { en: 'Enter Unix Timestamp', it: 'Inserisci Timestamp Unix', es: 'Ingresa Timestamp Unix', fr: 'Entrez le Timestamp Unix', de: 'Unix-Timestamp eingeben', pt: 'Insira o Timestamp Unix' },
  seconds: { en: 'Seconds', it: 'Secondi', es: 'Segundos', fr: 'Secondes', de: 'Sekunden', pt: 'Segundos' },
  milliseconds: { en: 'Milliseconds', it: 'Millisecondi', es: 'Milisegundos', fr: 'Millisecondes', de: 'Millisekunden', pt: 'Milissegundos' },
  localTime: { en: 'Local Time', it: 'Ora Locale', es: 'Hora Local', fr: 'Heure Locale', de: 'Ortszeit', pt: 'Hora Local' },
  utcTime: { en: 'UTC Time', it: 'Ora UTC', es: 'Hora UTC', fr: 'Heure UTC', de: 'UTC-Zeit', pt: 'Hora UTC' },
  isoFormat: { en: 'ISO 8601', it: 'ISO 8601', es: 'ISO 8601', fr: 'ISO 8601', de: 'ISO 8601', pt: 'ISO 8601' },
  relativeTime: { en: 'Relative', it: 'Relativo', es: 'Relativo', fr: 'Relatif', de: 'Relativ', pt: 'Relativo' },
  selectDateTime: { en: 'Select Date & Time', it: 'Seleziona Data e Ora', es: 'Selecciona Fecha y Hora', fr: 'Sélectionner Date et Heure', de: 'Datum und Uhrzeit wählen', pt: 'Selecionar Data e Hora' },
  timestampResult: { en: 'Unix Timestamp', it: 'Timestamp Unix', es: 'Timestamp Unix', fr: 'Timestamp Unix', de: 'Unix-Timestamp', pt: 'Timestamp Unix' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  presets: { en: 'Quick Presets', it: 'Preset Rapidi', es: 'Preselecciones Rápidas', fr: 'Préréglages Rapides', de: 'Schnellvorlagen', pt: 'Predefinições Rápidas' },
  now: { en: 'Now', it: 'Adesso', es: 'Ahora', fr: 'Maintenant', de: 'Jetzt', pt: 'Agora' },
  startOfDay: { en: 'Start of Day', it: 'Inizio Giornata', es: 'Inicio del Día', fr: 'Début de Journée', de: 'Tagesbeginn', pt: 'Início do Dia' },
  startOfYear: { en: 'Start of Year', it: 'Inizio Anno', es: 'Inicio del Año', fr: 'Début d\'Année', de: 'Jahresbeginn', pt: 'Início do Ano' },
  epoch: { en: 'Unix Epoch (0)', it: 'Epoca Unix (0)', es: 'Época Unix (0)', fr: 'Époque Unix (0)', de: 'Unix-Epoche (0)', pt: 'Época Unix (0)' },
  y2k: { en: 'Y2K (2000-01-01)', it: 'Y2K (2000-01-01)', es: 'Y2K (2000-01-01)', fr: 'Y2K (2000-01-01)', de: 'Y2K (2000-01-01)', pt: 'Y2K (2000-01-01)' },
  history: { en: 'Recent Conversions', it: 'Conversioni Recenti', es: 'Conversiones Recientes', fr: 'Conversions Récentes', de: 'Letzte Umwandlungen', pt: 'Conversões Recentes' },
  clearHistory: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Löschen', pt: 'Limpar' },
  invalidTimestamp: { en: 'Invalid timestamp', it: 'Timestamp non valido', es: 'Timestamp inválido', fr: 'Timestamp invalide', de: 'Ungültiger Timestamp', pt: 'Timestamp inválido' },
  ago: { en: 'ago', it: 'fa', es: 'atrás', fr: 'il y a', de: 'vor', pt: 'atrás' },
  fromNow: { en: 'from now', it: 'da adesso', es: 'a partir de ahora', fr: 'à partir de maintenant', de: 'ab jetzt', pt: 'a partir de agora' },
  justNow: { en: 'just now', it: 'adesso', es: 'justo ahora', fr: 'à l\'instant', de: 'gerade eben', pt: 'agora mesmo' },
  daysUnit: { en: 'days', it: 'giorni', es: 'días', fr: 'jours', de: 'Tage', pt: 'dias' },
  hoursUnit: { en: 'hours', it: 'ore', es: 'horas', fr: 'heures', de: 'Stunden', pt: 'horas' },
  minutesUnit: { en: 'minutes', it: 'minuti', es: 'minutos', fr: 'minutes', de: 'Minuten', pt: 'minutos' },
  secondsUnit: { en: 'seconds', it: 'secondi', es: 'segundos', fr: 'secondes', de: 'Sekunden', pt: 'segundos' },
  yearsUnit: { en: 'years', it: 'anni', es: 'años', fr: 'années', de: 'Jahre', pt: 'anos' },
  monthsUnit: { en: 'months', it: 'mesi', es: 'meses', fr: 'mois', de: 'Monate', pt: 'meses' },
};

interface HistoryEntry {
  id: number;
  timestamp: number;
  date: string;
}

function getRelativeTime(timestampMs: number, lang: string, t: (key: string) => string): string {
  const now = Date.now();
  const diffMs = now - timestampMs;
  const absDiff = Math.abs(diffMs);
  const suffix = diffMs >= 0 ? t('ago') : t('fromNow');

  if (absDiff < 60000) return t('justNow');

  const minutes = Math.floor(absDiff / 60000);
  if (minutes < 60) {
    if (lang === 'fr' || lang === 'de') return `${suffix} ${minutes} ${t('minutesUnit')}`;
    return `${minutes} ${t('minutesUnit')} ${suffix}`;
  }

  const hours = Math.floor(absDiff / 3600000);
  if (hours < 24) {
    if (lang === 'fr' || lang === 'de') return `${suffix} ${hours} ${t('hoursUnit')}`;
    return `${hours} ${t('hoursUnit')} ${suffix}`;
  }

  const days = Math.floor(absDiff / 86400000);
  if (days < 30) {
    if (lang === 'fr' || lang === 'de') return `${suffix} ${days} ${t('daysUnit')}`;
    return `${days} ${t('daysUnit')} ${suffix}`;
  }

  const months = Math.floor(days / 30.44);
  if (months < 12) {
    if (lang === 'fr' || lang === 'de') return `${suffix} ${months} ${t('monthsUnit')}`;
    return `${months} ${t('monthsUnit')} ${suffix}`;
  }

  const years = Math.floor(days / 365.25);
  if (lang === 'fr' || lang === 'de') return `${suffix} ${years} ${t('yearsUnit')}`;
  return `${years} ${t('yearsUnit')} ${suffix}`;
}

export default function TimestampConverter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['timestamp-converter'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [mode, setMode] = useState<'toDate' | 'toTimestamp'>('toDate');
  const [inputTimestamp, setInputTimestamp] = useState('');
  const [unit, setUnit] = useState<'seconds' | 'milliseconds'>('seconds');
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [currentTs, setCurrentTs] = useState(Math.floor(Date.now() / 1000));
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyCounter, setHistoryCounter] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Live current timestamp
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTs(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('timestamp-converter-history');
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
        setHistoryCounter(parsed.length);
      }
    } catch { /* ignore */ }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      try {
        localStorage.setItem('timestamp-converter-history', JSON.stringify(history));
      } catch { /* ignore */ }
    }
  }, [history]);

  // Initialize date/time inputs
  useEffect(() => {
    const now = new Date();
    setDateInput(now.toISOString().split('T')[0]);
    setTimeInput(now.toTimeString().slice(0, 5));
  }, []);

  const addToHistory = useCallback((timestamp: number, dateStr: string) => {
    setHistoryCounter(prev => {
      const newId = prev + 1;
      setHistory(h => {
        const exists = h.some(e => e.timestamp === timestamp);
        if (exists) return h;
        const entry: HistoryEntry = { id: newId, timestamp, date: dateStr };
        return [entry, ...h].slice(0, 10);
      });
      return newId;
    });
  }, []);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Timestamp to date conversion
  const getTimestampMs = (): number | null => {
    const num = parseFloat(inputTimestamp);
    if (isNaN(num)) return null;
    return unit === 'seconds' ? num * 1000 : num;
  };

  const tsMs = getTimestampMs();
  const parsedDate = tsMs !== null ? new Date(tsMs) : null;
  const isValidDate = parsedDate !== null && !isNaN(parsedDate.getTime());

  // Date to timestamp conversion
  const dateTimeToTs = (): number | null => {
    if (!dateInput) return null;
    const dt = new Date(`${dateInput}T${timeInput || '00:00'}:00`);
    if (isNaN(dt.getTime())) return null;
    return dt.getTime();
  };

  const convertedTs = dateTimeToTs();

  const handlePreset = (ts: number) => {
    setMode('toDate');
    setUnit('seconds');
    setInputTimestamp(String(ts));
  };

  const handleHistoryClick = (entry: HistoryEntry) => {
    setMode('toDate');
    setUnit('seconds');
    setInputTimestamp(String(entry.timestamp));
  };

  const handleReset = () => {
    setInputTimestamp('');
    const now = new Date();
    setDateInput(now.toISOString().split('T')[0]);
    setTimeInput(now.toTimeString().slice(0, 5));
    setUnit('seconds');
  };

  const handleConvertAndSave = () => {
    if (mode === 'toDate' && isValidDate && parsedDate) {
      const tsSec = unit === 'seconds' ? parseFloat(inputTimestamp) : parseFloat(inputTimestamp) / 1000;
      addToHistory(Math.floor(tsSec), parsedDate.toISOString());
    } else if (mode === 'toTimestamp' && convertedTs !== null) {
      const tsSec = Math.floor(convertedTs / 1000);
      addToHistory(tsSec, new Date(convertedTs).toISOString());
    }
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => { copyToClipboard(text, field); handleConvertAndSave(); }}
      className="ml-2 px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0"
    >
      {copiedField === field ? (
        <span className="text-green-600">{t('copied')}</span>
      ) : (
        <span className="text-gray-600">{t('copy')}</span>
      )}
    </button>
  );

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Unix Timestamp Converter: Convert Epoch Time to Human-Readable Dates',
      paragraphs: [
        'A Unix timestamp (also known as Epoch time or POSIX time) represents the number of seconds that have elapsed since January 1, 1970 at 00:00:00 UTC. This system is widely used in computing because it provides a simple, unambiguous way to represent a specific point in time as a single number, regardless of time zones or calendar systems.',
        'Our timestamp converter makes it easy to work with Unix timestamps in both directions. Enter a numeric timestamp to instantly see the corresponding date and time in multiple formats, including local time, UTC, and ISO 8601. Or enter a date and time to get the equivalent Unix timestamp in both seconds and milliseconds.',
        'The tool also shows the current Unix timestamp with a live-updating display, making it perfect for developers who need to grab the current epoch time for logging, API calls, or database operations. Quick presets let you instantly convert common reference points like the Unix epoch, Y2K, or the start of the current day and year.',
        'Whether you are debugging API responses, working with database timestamps, analyzing log files, or converting between time formats in your code, this converter handles all the complexity of date arithmetic for you. It supports both second-precision and millisecond-precision timestamps, and shows relative time so you can quickly understand how far in the past or future a timestamp falls.'
      ],
      faq: [
        { q: 'What is a Unix timestamp?', a: 'A Unix timestamp (or Epoch time) is the number of seconds elapsed since January 1, 1970, 00:00:00 UTC. It is a universal way to represent time as a single number, used extensively in programming, databases, and APIs.' },
        { q: 'What is the difference between seconds and milliseconds timestamps?', a: 'A standard Unix timestamp counts seconds since the epoch (10 digits, e.g., 1700000000). A millisecond timestamp counts milliseconds (13 digits, e.g., 1700000000000). JavaScript Date.now() returns milliseconds, while many APIs and databases use seconds.' },
        { q: 'Will Unix timestamps run out?', a: 'The Year 2038 problem affects 32-bit systems, which can only store timestamps up to January 19, 2038. However, modern 64-bit systems can handle timestamps billions of years into the future, so this is mostly a legacy concern.' },
        { q: 'Why do developers use Unix timestamps instead of regular dates?', a: 'Unix timestamps are timezone-independent, easy to sort and compare, compact to store, and avoid ambiguity from different date formats (MM/DD vs DD/MM). They simplify date arithmetic since you can just add or subtract seconds.' },
        { q: 'How do I get the current Unix timestamp in my code?', a: 'In JavaScript: Math.floor(Date.now() / 1000). In Python: import time; int(time.time()). In PHP: time(). In Java: System.currentTimeMillis() / 1000. In Bash: date +%s.' }
      ]
    },
    it: {
      title: 'Convertitore Timestamp Unix: Converti Epoch Time in Date Leggibili',
      paragraphs: [
        'Un timestamp Unix (noto anche come Epoch time o tempo POSIX) rappresenta il numero di secondi trascorsi dal 1 gennaio 1970 alle 00:00:00 UTC. Questo sistema e ampiamente utilizzato nell\'informatica perche fornisce un modo semplice e univoco per rappresentare un momento specifico nel tempo come un singolo numero, indipendentemente dai fusi orari.',
        'Il nostro convertitore di timestamp rende facile lavorare con i timestamp Unix in entrambe le direzioni. Inserisci un timestamp numerico per vedere istantaneamente la data e l\'ora corrispondenti in piu formati, inclusi ora locale, UTC e ISO 8601. Oppure inserisci una data e un\'ora per ottenere il timestamp Unix equivalente.',
        'Lo strumento mostra anche il timestamp Unix corrente con aggiornamento in tempo reale, rendendolo perfetto per gli sviluppatori che devono ottenere il tempo epoch corrente per logging, chiamate API o operazioni su database. I preset rapidi permettono di convertire istantaneamente punti di riferimento comuni.',
        'Che tu stia debuggando risposte API, lavorando con timestamp di database, analizzando file di log o convertendo tra formati temporali nel tuo codice, questo convertitore gestisce tutta la complessita dell\'aritmetica delle date. Supporta timestamp sia in secondi che in millisecondi e mostra il tempo relativo.'
      ],
      faq: [
        { q: 'Cos\'e un timestamp Unix?', a: 'Un timestamp Unix (o Epoch time) e il numero di secondi trascorsi dal 1 gennaio 1970, 00:00:00 UTC. E un modo universale per rappresentare il tempo come un singolo numero, usato estensivamente in programmazione, database e API.' },
        { q: 'Qual e la differenza tra timestamp in secondi e millisecondi?', a: 'Un timestamp Unix standard conta i secondi dall\'epoch (10 cifre). Un timestamp in millisecondi conta i millisecondi (13 cifre). JavaScript Date.now() restituisce millisecondi, mentre molte API usano secondi.' },
        { q: 'I timestamp Unix finiranno?', a: 'Il problema dell\'anno 2038 riguarda i sistemi a 32 bit, che possono memorizzare timestamp solo fino al 19 gennaio 2038. I sistemi moderni a 64 bit possono gestire timestamp per miliardi di anni.' },
        { q: 'Perche gli sviluppatori usano i timestamp Unix?', a: 'I timestamp Unix sono indipendenti dal fuso orario, facili da ordinare e confrontare, compatti da memorizzare e evitano ambiguita dai diversi formati di data.' },
        { q: 'Come ottengo il timestamp Unix corrente nel mio codice?', a: 'In JavaScript: Math.floor(Date.now() / 1000). In Python: import time; int(time.time()). In PHP: time(). In Java: System.currentTimeMillis() / 1000. In Bash: date +%s.' }
      ]
    },
    es: {
      title: 'Convertidor de Timestamp Unix: Convierte Epoch Time a Fechas Legibles',
      paragraphs: [
        'Un timestamp Unix (tambien conocido como Epoch time o tiempo POSIX) representa el numero de segundos transcurridos desde el 1 de enero de 1970 a las 00:00:00 UTC. Este sistema se usa ampliamente en la informatica porque proporciona una forma simple e inequivoca de representar un momento especifico en el tiempo como un solo numero.',
        'Nuestro convertidor de timestamps facilita trabajar con timestamps Unix en ambas direcciones. Ingresa un timestamp numerico para ver instantaneamente la fecha y hora correspondientes en multiples formatos, incluyendo hora local, UTC e ISO 8601. O ingresa una fecha y hora para obtener el timestamp Unix equivalente.',
        'La herramienta tambien muestra el timestamp Unix actual con actualizacion en vivo, haciendola perfecta para desarrolladores que necesitan obtener el epoch time actual para logging, llamadas API u operaciones de base de datos. Los presets rapidos permiten convertir instantaneamente puntos de referencia comunes.',
        'Ya sea que estes depurando respuestas de API, trabajando con timestamps de bases de datos, analizando archivos de log o convirtiendo entre formatos de tiempo en tu codigo, este convertidor maneja toda la complejidad. Soporta timestamps en segundos y milisegundos, y muestra tiempo relativo.'
      ],
      faq: [
        { q: '¿Que es un timestamp Unix?', a: 'Un timestamp Unix (o Epoch time) es el numero de segundos transcurridos desde el 1 de enero de 1970, 00:00:00 UTC. Es una forma universal de representar el tiempo como un solo numero, usado extensivamente en programacion, bases de datos y APIs.' },
        { q: '¿Cual es la diferencia entre timestamps en segundos y milisegundos?', a: 'Un timestamp Unix estandar cuenta segundos desde el epoch (10 digitos). Un timestamp en milisegundos cuenta milisegundos (13 digitos). JavaScript Date.now() devuelve milisegundos, mientras que muchas APIs usan segundos.' },
        { q: '¿Los timestamps Unix se acabaran?', a: 'El problema del ano 2038 afecta a sistemas de 32 bits, que solo pueden almacenar timestamps hasta el 19 de enero de 2038. Los sistemas modernos de 64 bits pueden manejar timestamps por miles de millones de anos.' },
        { q: '¿Por que los desarrolladores usan timestamps Unix?', a: 'Los timestamps Unix son independientes de la zona horaria, faciles de ordenar y comparar, compactos de almacenar y evitan ambiguedades de diferentes formatos de fecha.' },
        { q: '¿Como obtengo el timestamp Unix actual en mi codigo?', a: 'En JavaScript: Math.floor(Date.now() / 1000). En Python: import time; int(time.time()). En PHP: time(). En Java: System.currentTimeMillis() / 1000. En Bash: date +%s.' }
      ]
    },
    fr: {
      title: 'Convertisseur de Timestamp Unix : Convertir le Temps Epoch en Dates Lisibles',
      paragraphs: [
        'Un timestamp Unix (egalement appele Epoch time ou temps POSIX) represente le nombre de secondes ecoulees depuis le 1er janvier 1970 a 00:00:00 UTC. Ce systeme est largement utilise en informatique car il fournit un moyen simple et sans ambiguite de representer un moment precis dans le temps sous forme d\'un seul nombre.',
        'Notre convertisseur de timestamps facilite le travail avec les timestamps Unix dans les deux sens. Entrez un timestamp numerique pour voir instantanement la date et l\'heure correspondantes dans plusieurs formats, y compris l\'heure locale, UTC et ISO 8601. Ou entrez une date et une heure pour obtenir le timestamp Unix equivalent.',
        'L\'outil affiche egalement le timestamp Unix actuel avec une mise a jour en direct, ce qui le rend parfait pour les developpeurs qui ont besoin d\'obtenir le temps epoch actuel pour la journalisation, les appels API ou les operations de base de donnees. Les preselections rapides permettent de convertir instantanement des points de reference courants.',
        'Que vous debuggiez des reponses API, travailliez avec des timestamps de base de donnees, analysiez des fichiers de log ou convertissiez entre formats de temps dans votre code, ce convertisseur gere toute la complexite. Il prend en charge les timestamps en secondes et millisecondes et affiche le temps relatif.'
      ],
      faq: [
        { q: 'Qu\'est-ce qu\'un timestamp Unix ?', a: 'Un timestamp Unix (ou Epoch time) est le nombre de secondes ecoulees depuis le 1er janvier 1970, 00:00:00 UTC. C\'est un moyen universel de representer le temps comme un seul nombre, utilise largement en programmation, bases de donnees et API.' },
        { q: 'Quelle est la difference entre les timestamps en secondes et en millisecondes ?', a: 'Un timestamp Unix standard compte les secondes depuis l\'epoch (10 chiffres). Un timestamp en millisecondes compte les millisecondes (13 chiffres). JavaScript Date.now() retourne des millisecondes, tandis que beaucoup d\'API utilisent des secondes.' },
        { q: 'Les timestamps Unix vont-ils expirer ?', a: 'Le probleme de l\'an 2038 affecte les systemes 32 bits, qui ne peuvent stocker des timestamps que jusqu\'au 19 janvier 2038. Les systemes modernes 64 bits peuvent gerer des timestamps pour des milliards d\'annees.' },
        { q: 'Pourquoi les developpeurs utilisent-ils les timestamps Unix ?', a: 'Les timestamps Unix sont independants du fuseau horaire, faciles a trier et comparer, compacts a stocker et evitent l\'ambiguite des differents formats de date.' },
        { q: 'Comment obtenir le timestamp Unix actuel dans mon code ?', a: 'En JavaScript : Math.floor(Date.now() / 1000). En Python : import time; int(time.time()). En PHP : time(). En Java : System.currentTimeMillis() / 1000. En Bash : date +%s.' }
      ]
    },
    de: {
      title: 'Unix-Timestamp-Konverter: Epoch-Zeit in Lesbare Daten Umwandeln',
      paragraphs: [
        'Ein Unix-Timestamp (auch Epoch-Zeit oder POSIX-Zeit genannt) stellt die Anzahl der Sekunden dar, die seit dem 1. Januar 1970 um 00:00:00 UTC vergangen sind. Dieses System wird in der Informatik weit verbreitet verwendet, da es eine einfache, eindeutige Moglichkeit bietet, einen bestimmten Zeitpunkt als einzelne Zahl darzustellen.',
        'Unser Timestamp-Konverter erleichtert die Arbeit mit Unix-Timestamps in beide Richtungen. Geben Sie einen numerischen Timestamp ein, um sofort das entsprechende Datum und die Uhrzeit in mehreren Formaten zu sehen, einschliesslich Ortszeit, UTC und ISO 8601. Oder geben Sie ein Datum und eine Uhrzeit ein, um den entsprechenden Unix-Timestamp zu erhalten.',
        'Das Tool zeigt auch den aktuellen Unix-Timestamp mit Live-Aktualisierung an, was es perfekt fur Entwickler macht, die den aktuellen Epoch-Zeitstempel fur Logging, API-Aufrufe oder Datenbankoperationen benotigen. Schnellvorlagen ermoglichen die sofortige Konvertierung gangiger Referenzpunkte.',
        'Ob Sie API-Antworten debuggen, mit Datenbank-Timestamps arbeiten, Logdateien analysieren oder zwischen Zeitformaten in Ihrem Code konvertieren, dieser Konverter ubernimmt die gesamte Komplexitat. Er unterstutzt Timestamps in Sekunden und Millisekunden und zeigt relative Zeitangaben an.'
      ],
      faq: [
        { q: 'Was ist ein Unix-Timestamp?', a: 'Ein Unix-Timestamp (oder Epoch-Zeit) ist die Anzahl der Sekunden seit dem 1. Januar 1970, 00:00:00 UTC. Es ist eine universelle Methode, Zeit als einzelne Zahl darzustellen, weit verbreitet in Programmierung, Datenbanken und APIs.' },
        { q: 'Was ist der Unterschied zwischen Sekunden- und Millisekunden-Timestamps?', a: 'Ein Standard-Unix-Timestamp zahlt Sekunden seit der Epoche (10 Ziffern). Ein Millisekunden-Timestamp zahlt Millisekunden (13 Ziffern). JavaScript Date.now() gibt Millisekunden zuruck, wahrend viele APIs Sekunden verwenden.' },
        { q: 'Werden Unix-Timestamps auslaufen?', a: 'Das Jahr-2038-Problem betrifft 32-Bit-Systeme, die Timestamps nur bis zum 19. Januar 2038 speichern konnen. Moderne 64-Bit-Systeme konnen Timestamps fur Milliarden von Jahren verarbeiten.' },
        { q: 'Warum verwenden Entwickler Unix-Timestamps?', a: 'Unix-Timestamps sind zeitzonen-unabhangig, einfach zu sortieren und zu vergleichen, kompakt zu speichern und vermeiden Mehrdeutigkeiten verschiedener Datumsformate.' },
        { q: 'Wie erhalte ich den aktuellen Unix-Timestamp in meinem Code?', a: 'In JavaScript: Math.floor(Date.now() / 1000). In Python: import time; int(time.time()). In PHP: time(). In Java: System.currentTimeMillis() / 1000. In Bash: date +%s.' }
      ]
    },
    pt: {
      title: 'Conversor de Timestamp Unix: Converta Epoch Time para Datas Legiveis',
      paragraphs: [
        'Um timestamp Unix (tambem conhecido como Epoch time ou tempo POSIX) representa o numero de segundos decorridos desde 1 de janeiro de 1970 as 00:00:00 UTC. Este sistema e amplamente utilizado na computacao porque fornece uma forma simples e inequivoca de representar um momento especifico no tempo como um unico numero.',
        'Nosso conversor de timestamps facilita o trabalho com timestamps Unix em ambas as direcoes. Insira um timestamp numerico para ver instantaneamente a data e hora correspondentes em varios formatos, incluindo hora local, UTC e ISO 8601. Ou insira uma data e hora para obter o timestamp Unix equivalente.',
        'A ferramenta tambem mostra o timestamp Unix atual com atualizacao ao vivo, tornando-a perfeita para desenvolvedores que precisam obter o epoch time atual para logging, chamadas de API ou operacoes de banco de dados. As predefinicoes rapidas permitem converter instantaneamente pontos de referencia comuns.',
        'Seja depurando respostas de API, trabalhando com timestamps de banco de dados, analisando arquivos de log ou convertendo entre formatos de tempo no seu codigo, este conversor lida com toda a complexidade. Suporta timestamps em segundos e milissegundos e mostra tempo relativo.'
      ],
      faq: [
        { q: 'O que e um timestamp Unix?', a: 'Um timestamp Unix (ou Epoch time) e o numero de segundos decorridos desde 1 de janeiro de 1970, 00:00:00 UTC. E uma forma universal de representar o tempo como um unico numero, usado extensivamente em programacao, bancos de dados e APIs.' },
        { q: 'Qual e a diferenca entre timestamps em segundos e milissegundos?', a: 'Um timestamp Unix padrao conta segundos desde o epoch (10 digitos). Um timestamp em milissegundos conta milissegundos (13 digitos). JavaScript Date.now() retorna milissegundos, enquanto muitas APIs usam segundos.' },
        { q: 'Os timestamps Unix vao acabar?', a: 'O problema do ano 2038 afeta sistemas de 32 bits, que so podem armazenar timestamps ate 19 de janeiro de 2038. Sistemas modernos de 64 bits podem lidar com timestamps por bilhoes de anos.' },
        { q: 'Por que os desenvolvedores usam timestamps Unix?', a: 'Os timestamps Unix sao independentes de fuso horario, faceis de ordenar e comparar, compactos de armazenar e evitam ambiguidades de diferentes formatos de data.' },
        { q: 'Como obtenho o timestamp Unix atual no meu codigo?', a: 'Em JavaScript: Math.floor(Date.now() / 1000). Em Python: import time; int(time.time()). Em PHP: time(). Em Java: System.currentTimeMillis() / 1000. Em Bash: date +%s.' }
      ]
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="timestamp-converter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Current timestamp live */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4 text-center">
          <div className="text-xs text-blue-600 font-medium mb-1">{t('currentTimestamp')}</div>
          <div className="text-3xl font-mono font-bold text-blue-700">{currentTs}</div>
          <div className="text-xs text-gray-500 mt-1">{new Date(currentTs * 1000).toISOString()}</div>
          <button
            onClick={() => copyToClipboard(String(currentTs), 'current')}
            className="mt-2 px-3 py-1 text-xs rounded border border-blue-300 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            {copiedField === 'current' ? t('copied') : t('copy')}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button onClick={() => setMode('toDate')}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${mode === 'toDate' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {t('modeToDate')}
            </button>
            <button onClick={() => setMode('toTimestamp')}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${mode === 'toTimestamp' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {t('modeToTimestamp')}
            </button>
          </div>

          {mode === 'toDate' ? (
            <>
              {/* Unit toggle */}
              <div className="flex gap-2">
                <button onClick={() => setUnit('seconds')}
                  className={`flex-1 py-1.5 rounded-lg text-sm transition-colors ${unit === 'seconds' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {t('seconds')} (s)
                </button>
                <button onClick={() => setUnit('milliseconds')}
                  className={`flex-1 py-1.5 rounded-lg text-sm transition-colors ${unit === 'milliseconds' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {t('milliseconds')} (ms)
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterTimestamp')}</label>
                <input
                  type="text"
                  value={inputTimestamp}
                  onChange={(e) => setInputTimestamp(e.target.value)}
                  placeholder={unit === 'seconds' ? '1700000000' : '1700000000000'}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {inputTimestamp && !isValidDate && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {t('invalidTimestamp')}
                </div>
              )}

              {isValidDate && parsedDate && (
                <>
                  <div className="space-y-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-blue-600 font-medium">{t('localTime')}</div>
                        <div className="font-mono text-sm text-blue-800">{parsedDate.toLocaleString(lang)}</div>
                      </div>
                      <CopyButton text={parsedDate.toLocaleString(lang)} field="local" />
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-green-600 font-medium">{t('utcTime')}</div>
                        <div className="font-mono text-sm text-green-800">{parsedDate.toUTCString()}</div>
                      </div>
                      <CopyButton text={parsedDate.toUTCString()} field="utc" />
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-purple-600 font-medium">{t('isoFormat')}</div>
                        <div className="font-mono text-sm text-purple-800">{parsedDate.toISOString()}</div>
                      </div>
                      <CopyButton text={parsedDate.toISOString()} field="iso" />
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-amber-600 font-medium">{t('relativeTime')}</div>
                        <div className="font-mono text-sm text-amber-800">{getRelativeTime(parsedDate.getTime(), lang, t)}</div>
                      </div>
                      <CopyButton text={getRelativeTime(parsedDate.getTime(), lang, t)} field="relative" />
                    </div>
                  </div>

                  {/* Cross-reference: show both seconds and ms */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-gray-600">{t('seconds')}</div>
                      <div className="text-right font-mono font-semibold text-gray-800">{Math.floor(parsedDate.getTime() / 1000)}</div>
                      <div className="text-gray-600">{t('milliseconds')}</div>
                      <div className="text-right font-mono font-semibold text-gray-800">{parsedDate.getTime()}</div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <button onClick={handleReset} className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  {t('reset')}
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('selectDateTime')}</label>
                <div className="flex gap-2">
                  <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <input type="time" value={timeInput} onChange={(e) => setTimeInput(e.target.value)}
                    className="w-32 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>

              {convertedTs !== null && (
                <>
                  <div className="space-y-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                      <div className="text-xs text-blue-600 font-medium mb-1">{t('timestampResult')} ({t('seconds')})</div>
                      <div className="text-2xl font-mono font-bold text-blue-700">{Math.floor(convertedTs / 1000)}</div>
                      <CopyButton text={String(Math.floor(convertedTs / 1000))} field="ts-sec" />
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <div className="text-xs text-green-600 font-medium mb-1">{t('timestampResult')} ({t('milliseconds')})</div>
                      <div className="text-2xl font-mono font-bold text-green-700">{convertedTs}</div>
                      <CopyButton text={String(convertedTs)} field="ts-ms" />
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="grid grid-cols-1 gap-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('isoFormat')}</span>
                        <span className="font-mono font-semibold text-gray-800">{new Date(convertedTs).toISOString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('utcTime')}</span>
                        <span className="font-mono text-xs font-semibold text-gray-800">{new Date(convertedTs).toUTCString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('relativeTime')}</span>
                        <span className="font-mono font-semibold text-gray-800">{getRelativeTime(convertedTs, lang, t)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => { copyToClipboard(String(Math.floor(convertedTs / 1000)), 'ts-both'); handleConvertAndSave(); }}
                      className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      {copiedField === 'ts-both' ? (
                        <><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{t('copied')}</>
                      ) : (
                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>{t('copy')}</>
                      )}
                    </button>
                    <button onClick={handleReset} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      {t('reset')}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Quick Presets */}
        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-3">{t('presets')}</div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handlePreset(Math.floor(Date.now() / 1000))} className="px-3 py-1.5 text-sm rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors">
              {t('now')}
            </button>
            <button onClick={() => { const d = new Date(); d.setHours(0,0,0,0); handlePreset(Math.floor(d.getTime() / 1000)); }} className="px-3 py-1.5 text-sm rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors">
              {t('startOfDay')}
            </button>
            <button onClick={() => { const d = new Date(); d.setMonth(0,1); d.setHours(0,0,0,0); handlePreset(Math.floor(d.getTime() / 1000)); }} className="px-3 py-1.5 text-sm rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors">
              {t('startOfYear')}
            </button>
            <button onClick={() => handlePreset(0)} className="px-3 py-1.5 text-sm rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors">
              {t('epoch')}
            </button>
            <button onClick={() => handlePreset(946684800)} className="px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors">
              {t('y2k')}
            </button>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-gray-500 uppercase">{t('history')}</div>
              <button onClick={() => { setHistory([]); localStorage.removeItem('timestamp-converter-history'); }} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">{t('clearHistory')}</button>
            </div>
            <div className="space-y-1.5">
              {history.map((entry) => (
                <button key={entry.id} onClick={() => handleHistoryClick(entry)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm flex justify-between items-center">
                  <span className="font-mono text-gray-600">{entry.timestamp}</span>
                  <span className="text-xs text-gray-500">{new Date(entry.timestamp * 1000).toLocaleString(lang)}</span>
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
