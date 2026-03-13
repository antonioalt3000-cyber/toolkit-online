'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const PRESETS = [
  { label: 'Every minute', cron: '* * * * *' },
  { label: 'Every 5 minutes', cron: '*/5 * * * *' },
  { label: 'Every hour', cron: '0 * * * *' },
  { label: 'Every day at midnight', cron: '0 0 * * *' },
  { label: 'Every day at noon', cron: '0 12 * * *' },
  { label: 'Every Monday at 9 AM', cron: '0 9 * * 1' },
  { label: 'First day of month', cron: '0 0 1 * *' },
  { label: 'Every weekday at 8 AM', cron: '0 8 * * 1-5' },
  { label: 'Every Sunday at 3 AM', cron: '0 3 * * 0' },
  { label: 'Every 15 minutes', cron: '*/15 * * * *' },
];

const QUICK_PRESETS: Record<string, { labels: Record<string, string>; cron: string }> = {
  everyMinute: { labels: { en: 'Every Minute', it: 'Ogni Minuto', es: 'Cada Minuto', fr: 'Chaque Minute', de: 'Jede Minute', pt: 'Cada Minuto' }, cron: '* * * * *' },
  hourly: { labels: { en: 'Hourly', it: 'Ogni Ora', es: 'Cada Hora', fr: 'Chaque Heure', de: 'Stündlich', pt: 'A Cada Hora' }, cron: '0 * * * *' },
  daily: { labels: { en: 'Daily', it: 'Giornaliero', es: 'Diario', fr: 'Quotidien', de: 'Täglich', pt: 'Diário' }, cron: '0 0 * * *' },
  weekly: { labels: { en: 'Weekly', it: 'Settimanale', es: 'Semanal', fr: 'Hebdomadaire', de: 'Wöchentlich', pt: 'Semanal' }, cron: '0 0 * * 0' },
  monthly: { labels: { en: 'Monthly', it: 'Mensile', es: 'Mensual', fr: 'Mensuel', de: 'Monatlich', pt: 'Mensal' }, cron: '0 0 1 * *' },
  yearly: { labels: { en: 'Yearly', it: 'Annuale', es: 'Anual', fr: 'Annuel', de: 'Jährlich', pt: 'Anual' }, cron: '0 0 1 1 *' },
};

function parseCronField(field: string, type: 'minute' | 'hour' | 'day' | 'month' | 'weekday'): string {
  const names: Record<string, Record<Locale, string>> = {
    minute: { en: 'minute', it: 'minuto', es: 'minuto', fr: 'minute', de: 'Minute', pt: 'minuto' },
    hour: { en: 'hour', it: 'ora', es: 'hora', fr: 'heure', de: 'Stunde', pt: 'hora' },
    day: { en: 'day', it: 'giorno', es: 'día', fr: 'jour', de: 'Tag', pt: 'dia' },
    month: { en: 'month', it: 'mese', es: 'mes', fr: 'mois', de: 'Monat', pt: 'mês' },
    weekday: { en: 'weekday', it: 'giorno settimana', es: 'día semana', fr: 'jour semaine', de: 'Wochentag', pt: 'dia semana' },
  };
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  if (field === '*') return `every ${names[type].en}`;
  if (field.startsWith('*/')) return `every ${field.slice(2)} ${names[type].en}s`;
  if (field.includes(',')) return `${names[type].en}s ${field}`;
  if (field.includes('-')) return `${names[type].en}s ${field}`;
  if (type === 'weekday') {
    const idx = parseInt(field);
    return weekdays[idx] || field;
  }
  if (type === 'month') {
    const idx = parseInt(field);
    return months[idx] || field;
  }
  return `${names[type].en} ${field}`;
}

function validateCronField(field: string, min: number, max: number): boolean {
  if (field === '*') return true;
  if (field.startsWith('*/')) {
    const step = parseInt(field.slice(2));
    return !isNaN(step) && step >= 1 && step <= max;
  }
  if (field.includes(',')) {
    return field.split(',').every(v => {
      const n = parseInt(v.trim());
      return !isNaN(n) && n >= min && n <= max;
    });
  }
  if (field.includes('-')) {
    const parts = field.split('-');
    if (parts.length !== 2) return false;
    const [start, end] = parts.map(Number);
    return !isNaN(start) && !isNaN(end) && start >= min && end <= max && start <= end;
  }
  const val = parseInt(field);
  return !isNaN(val) && val >= min && val <= max;
}

function validateCron(expression: string): { valid: boolean; error: string } {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return { valid: false, error: 'Must have exactly 5 fields' };

  const [minute, hour, day, month, weekday] = parts;
  const checks = [
    { field: minute, min: 0, max: 59, name: 'Minute' },
    { field: hour, min: 0, max: 23, name: 'Hour' },
    { field: day, min: 1, max: 31, name: 'Day' },
    { field: month, min: 1, max: 12, name: 'Month' },
    { field: weekday, min: 0, max: 7, name: 'Weekday' },
  ];

  for (const c of checks) {
    if (!validateCronField(c.field, c.min, c.max)) {
      return { valid: false, error: `Invalid ${c.name}: ${c.field}` };
    }
  }
  return { valid: true, error: '' };
}

function explainCron(expression: string): string {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return 'Invalid cron expression (need 5 fields)';

  const [minute, hour, day, month, weekday] = parts;

  // Validate basic ranges
  const ranges = [
    { field: minute, min: 0, max: 59, name: 'minute' },
    { field: hour, min: 0, max: 23, name: 'hour' },
    { field: day, min: 1, max: 31, name: 'day' },
    { field: month, min: 1, max: 12, name: 'month' },
    { field: weekday, min: 0, max: 7, name: 'weekday' },
  ];

  for (const r of ranges) {
    if (r.field !== '*' && !r.field.includes('/') && !r.field.includes(',') && !r.field.includes('-')) {
      const val = parseInt(r.field);
      if (isNaN(val) || val < r.min || val > r.max) return `Invalid ${r.name} value: ${r.field}`;
    }
  }

  const pieces: string[] = [];

  if (minute === '*' && hour === '*') {
    pieces.push('Every minute');
  } else if (minute.startsWith('*/')) {
    pieces.push(`Every ${minute.slice(2)} minutes`);
  } else if (hour === '*') {
    pieces.push(`At minute ${minute} of every hour`);
  } else if (minute === '0' && hour !== '*') {
    if (hour.startsWith('*/')) {
      pieces.push(`Every ${hour.slice(2)} hours`);
    } else {
      pieces.push(`At ${hour.padStart(2, '0')}:00`);
    }
  } else {
    pieces.push(`At ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`);
  }

  if (day !== '*') {
    if (day.includes(',')) pieces.push(`on days ${day} of the month`);
    else if (day.includes('-')) pieces.push(`on days ${day} of the month`);
    else pieces.push(`on day ${day} of the month`);
  }

  if (month !== '*') {
    const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    if (month.includes(',')) {
      const ms = month.split(',').map(m => months[parseInt(m)] || m).join(', ');
      pieces.push(`in ${ms}`);
    } else {
      const idx = parseInt(month);
      pieces.push(`in ${months[idx] || month}`);
    }
  }

  if (weekday !== '*') {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (weekday.includes('-')) {
      const [start, end] = weekday.split('-').map(Number);
      pieces.push(`on ${weekdays[start]} through ${weekdays[end]}`);
    } else if (weekday.includes(',')) {
      const ds = weekday.split(',').map(d => weekdays[parseInt(d)] || d).join(', ');
      pieces.push(`on ${ds}`);
    } else {
      const idx = parseInt(weekday);
      pieces.push(`on ${weekdays[idx] || weekday}`);
    }
  }

  return pieces.join(', ');
}

function getNextRuns(expression: string, count: number = 5): string[] {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const [minF, hourF, dayF, monthF, wdayF] = parts;
  const results: string[] = [];
  const now = new Date();
  const check = new Date(now);

  const matchesField = (value: number, field: string): boolean => {
    if (field === '*') return true;
    if (field.startsWith('*/')) {
      const step = parseInt(field.slice(2));
      return value % step === 0;
    }
    if (field.includes(',')) return field.split(',').map(Number).includes(value);
    if (field.includes('-')) {
      const [start, end] = field.split('-').map(Number);
      return value >= start && value <= end;
    }
    return value === parseInt(field);
  };

  for (let i = 0; i < 525600 && results.length < count; i++) {
    check.setMinutes(check.getMinutes() + 1);
    const m = check.getMinutes();
    const h = check.getHours();
    const d = check.getDate();
    const mo = check.getMonth() + 1;
    const wd = check.getDay();

    if (matchesField(m, minF) && matchesField(h, hourF) && matchesField(d, dayF) && matchesField(mo, monthF) && (matchesField(wd, wdayF) || (wdayF === '7' && wd === 0))) {
      results.push(check.toLocaleString());
    }
  }

  return results;
}

interface HistoryEntry {
  expression: string;
  description: string;
  timestamp: number;
}

export default function CronExpressionGenerator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['cron-expression-generator'][lang];

  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [day, setDay] = useState('*');
  const [month, setMonth] = useState('*');
  const [weekday, setWeekday] = useState('*');
  const [customInput, setCustomInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const labels: Record<string, Record<Locale, string>> = {
    minute: { en: 'Minute', it: 'Minuto', es: 'Minuto', fr: 'Minute', de: 'Minute', pt: 'Minuto' },
    hour: { en: 'Hour', it: 'Ora', es: 'Hora', fr: 'Heure', de: 'Stunde', pt: 'Hora' },
    dayMonth: { en: 'Day (Month)', it: 'Giorno (Mese)', es: 'Día (Mes)', fr: 'Jour (Mois)', de: 'Tag (Monat)', pt: 'Dia (Mês)' },
    month: { en: 'Month', it: 'Mese', es: 'Mes', fr: 'Mois', de: 'Monat', pt: 'Mês' },
    weekday: { en: 'Weekday', it: 'Giorno Settimana', es: 'Día Semana', fr: 'Jour Semaine', de: 'Wochentag', pt: 'Dia Semana' },
    explanation: { en: 'Explanation', it: 'Spiegazione', es: 'Explicación', fr: 'Explication', de: 'Erklärung', pt: 'Explicação' },
    nextRuns: { en: 'Next 5 runs', it: 'Prossime 5 esecuzioni', es: 'Próximas 5 ejecuciones', fr: '5 prochaines exécutions', de: 'Nächste 5 Ausführungen', pt: 'Próximas 5 execuções' },
    presets: { en: 'Common Presets', it: 'Preset Comuni', es: 'Presets Comunes', fr: 'Préréglages Courants', de: 'Gängige Vorlagen', pt: 'Presets Comuns' },
    quickPresets: { en: 'Quick Presets', it: 'Preset Rapidi', es: 'Presets Rápidos', fr: 'Préréglages Rapides', de: 'Schnellvorlagen', pt: 'Presets Rápidos' },
    parseCustom: { en: 'Parse Custom Expression', it: 'Analizza Espressione', es: 'Analizar Expresión', fr: 'Analyser Expression', de: 'Ausdruck Analysieren', pt: 'Analisar Expressão' },
    copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
    copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
    cronExpression: { en: 'Cron Expression', it: 'Espressione Cron', es: 'Expresión Cron', fr: 'Expression Cron', de: 'Cron-Ausdruck', pt: 'Expressão Cron' },
    valid: { en: 'Valid', it: 'Valida', es: 'Válida', fr: 'Valide', de: 'Gültig', pt: 'Válida' },
    invalid: { en: 'Invalid', it: 'Non valida', es: 'Inválida', fr: 'Invalide', de: 'Ungültig', pt: 'Inválida' },
    history: { en: 'History', it: 'Cronologia', es: 'Historial', fr: 'Historique', de: 'Verlauf', pt: 'Histórico' },
    saveToHistory: { en: 'Save to History', it: 'Salva in Cronologia', es: 'Guardar en Historial', fr: 'Sauvegarder', de: 'Speichern', pt: 'Salvar no Histórico' },
    clearHistory: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Löschen', pt: 'Limpar' },
    noHistory: { en: 'No saved expressions yet', it: 'Nessuna espressione salvata', es: 'Sin expresiones guardadas', fr: 'Aucune expression sauvegardée', de: 'Noch keine gespeicherten Ausdrücke', pt: 'Nenhuma expressão salva ainda' },
    use: { en: 'Use', it: 'Usa', es: 'Usar', fr: 'Utiliser', de: 'Verwenden', pt: 'Usar' },
    validation: { en: 'Validation', it: 'Validazione', es: 'Validación', fr: 'Validation', de: 'Validierung', pt: 'Validação' },
  };

  const expression = `${minute} ${hour} ${day} ${month} ${weekday}`;
  const validation = validateCron(expression);

  const applyPreset = (cron: string) => {
    const parts = cron.split(' ');
    setMinute(parts[0]);
    setHour(parts[1]);
    setDay(parts[2]);
    setMonth(parts[3]);
    setWeekday(parts[4]);
  };

  const resetFields = () => {
    setMinute('*');
    setHour('*');
    setDay('*');
    setMonth('*');
    setWeekday('*');
    setCustomInput('');
  };

  const parseCustom = () => {
    const parts = customInput.trim().split(/\s+/);
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDay(parts[2]);
      setMonth(parts[3]);
      setWeekday(parts[4]);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(expression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveToHistory = useCallback(() => {
    if (!validation.valid) return;
    const desc = explainCron(expression);
    setHistory(prev => {
      const exists = prev.some(h => h.expression === expression);
      if (exists) return prev;
      const next = [{ expression, description: desc, timestamp: Date.now() }, ...prev];
      return next.slice(0, 5);
    });
  }, [expression, validation.valid]);

  const loadFromHistory = (entry: HistoryEntry) => {
    applyPreset(entry.expression);
  };

  const nextRuns = getNextRuns(expression);

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Cron Expression Generator — Build & Explain Cron Jobs Online',
      paragraphs: [
        'Cron is a time-based job scheduling system used in Unix-like operating systems. Cron expressions define when scheduled tasks (cron jobs) should run, using a compact five-field format: minute, hour, day of month, month, and day of week. Understanding and writing cron expressions correctly is essential for system administrators, DevOps engineers, and backend developers.',
        'Our cron expression generator provides an intuitive interface to build cron expressions visually. Instead of memorizing the syntax, simply select values for each field using the input controls. The tool instantly generates the cron expression and provides a human-readable explanation of when the job will run, plus a preview of the next five scheduled execution times.',
        'The tool supports all standard cron syntax including wildcards (*), step values (*/5), ranges (1-5), and lists (1,3,5). Common presets like "every 5 minutes," "daily at midnight," or "every Monday at 9 AM" are available with one click. You can also paste an existing cron expression to parse and understand it.',
        'Whether you are setting up automated backups, scheduling email reports, or configuring CI/CD pipelines, getting the cron expression right is crucial. A wrong schedule can mean missed backups, duplicate emails, or wasted server resources. Use this tool to verify your cron expressions before deploying them to production.',
      ],
      faq: [
        { q: 'What is a cron expression?', a: 'A cron expression is a string of five fields separated by spaces that defines a schedule. The fields represent: minute (0-59), hour (0-23), day of month (1-31), month (1-12), and day of week (0-7, where 0 and 7 are Sunday). Special characters like * (any), */ (step), - (range), and , (list) modify the behavior.' },
        { q: 'How do I schedule a job to run every 5 minutes?', a: 'Use the cron expression */5 * * * *. The */5 in the minute field means "every 5th minute." The asterisks in the other fields mean "every hour, every day, every month, every weekday."' },
        { q: 'What is the difference between 5-field and 6-field cron?', a: 'Standard Unix cron uses 5 fields (minute, hour, day, month, weekday). Some systems like Quartz or Spring add a 6th field for seconds at the beginning. Our tool generates standard 5-field cron expressions compatible with most Unix/Linux systems.' },
        { q: 'Can I use cron expressions in cloud services?', a: 'Yes, most cloud platforms support cron expressions for scheduling. AWS CloudWatch Events, Google Cloud Scheduler, Azure Functions, and GitHub Actions all use cron-like syntax. Some may use slight variations, so check the specific documentation.' },
        { q: 'How do I run a job on weekdays only?', a: 'Set the weekday field to 1-5 (Monday through Friday). For example, 0 9 * * 1-5 runs a job at 9:00 AM every weekday.' },
      ],
    },
    it: {
      title: 'Generatore Cron Gratuito — Crea e Spiega Espressioni Cron Online',
      paragraphs: [
        'Cron è un sistema di pianificazione basato sul tempo usato nei sistemi operativi Unix. Le espressioni cron definiscono quando le attività pianificate devono essere eseguite, usando un formato compatto a cinque campi: minuto, ora, giorno del mese, mese e giorno della settimana. Comprendere e scrivere correttamente le espressioni cron è essenziale per amministratori di sistema, ingegneri DevOps e sviluppatori backend.',
        'Il nostro generatore di espressioni cron fornisce un\'interfaccia intuitiva per costruire espressioni cron visivamente. Invece di memorizzare la sintassi, seleziona semplicemente i valori per ogni campo. Lo strumento genera istantaneamente l\'espressione cron e fornisce una spiegazione leggibile, più un\'anteprima delle prossime cinque esecuzioni programmate.',
        'Lo strumento supporta tutta la sintassi cron standard inclusi wildcard (*), valori step (*/5), intervalli (1-5) e liste (1,3,5). I preset comuni come "ogni 5 minuti" o "ogni lunedì alle 9" sono disponibili con un clic. Puoi anche incollare un\'espressione cron esistente per analizzarla.',
        'Che tu stia configurando backup automatici, pianificando report email o configurando pipeline CI/CD, ottenere l\'espressione cron corretta è cruciale. Usa questo strumento per verificare le tue espressioni cron prima del deployment.',
      ],
      faq: [
        { q: 'Cos\'è un\'espressione cron?', a: 'Un\'espressione cron è una stringa di cinque campi separati da spazi che definisce una pianificazione. I campi rappresentano: minuto (0-59), ora (0-23), giorno del mese (1-31), mese (1-12) e giorno della settimana (0-7). Caratteri speciali come *, */, - e , modificano il comportamento.' },
        { q: 'Come pianifico un job ogni 5 minuti?', a: 'Usa l\'espressione cron */5 * * * *. Il */5 nel campo minuto significa "ogni 5 minuti". Gli asterischi negli altri campi significano "ogni ora, ogni giorno, ogni mese, ogni giorno della settimana".' },
        { q: 'Qual è la differenza tra cron a 5 e 6 campi?', a: 'Il cron Unix standard usa 5 campi. Alcuni sistemi come Quartz o Spring aggiungono un 6° campo per i secondi. Il nostro strumento genera espressioni a 5 campi compatibili con la maggior parte dei sistemi Unix/Linux.' },
        { q: 'Posso usare espressioni cron nei servizi cloud?', a: 'Sì, la maggior parte delle piattaforme cloud supporta espressioni cron. AWS CloudWatch, Google Cloud Scheduler, Azure Functions e GitHub Actions usano tutti sintassi simile a cron.' },
      ],
    },
    es: {
      title: 'Generador de Cron Gratis — Crea y Explica Expresiones Cron Online',
      paragraphs: [
        'Cron es un sistema de programación de tareas basado en el tiempo usado en sistemas Unix. Las expresiones cron definen cuándo deben ejecutarse las tareas programadas, usando un formato compacto de cinco campos: minuto, hora, día del mes, mes y día de la semana. Entender y escribir expresiones cron correctamente es esencial para administradores de sistemas y desarrolladores.',
        'Nuestro generador de expresiones cron proporciona una interfaz intuitiva para construir expresiones visualmente. En lugar de memorizar la sintaxis, selecciona valores para cada campo. La herramienta genera la expresión y una explicación legible, más una vista previa de las próximas cinco ejecuciones.',
        'La herramienta soporta toda la sintaxis cron estándar incluyendo comodines (*), valores de paso (*/5), rangos (1-5) y listas (1,3,5). Los presets comunes están disponibles con un clic. También puedes pegar una expresión existente para analizarla.',
        'Ya sea que configures backups automáticos, informes programados o pipelines CI/CD, obtener la expresión cron correcta es crucial. Usa esta herramienta para verificar tus expresiones antes del despliegue.',
      ],
      faq: [
        { q: '¿Qué es una expresión cron?', a: 'Una expresión cron es una cadena de cinco campos separados por espacios que define una programación. Los campos representan: minuto (0-59), hora (0-23), día del mes (1-31), mes (1-12) y día de la semana (0-7).' },
        { q: '¿Cómo programo un job cada 5 minutos?', a: 'Usa la expresión */5 * * * *. El */5 en el campo minuto significa "cada 5 minutos".' },
        { q: '¿Puedo usar expresiones cron en servicios cloud?', a: 'Sí, la mayoría de plataformas cloud soportan expresiones cron. AWS, Google Cloud, Azure y GitHub Actions usan sintaxis similar a cron.' },
        { q: '¿Cómo ejecuto un job solo en días laborables?', a: 'Configura el campo día de la semana a 1-5 (lunes a viernes). Por ejemplo, 0 9 * * 1-5 ejecuta un job a las 9:00 AM cada día laborable.' },
      ],
    },
    fr: {
      title: 'Générateur Cron Gratuit — Créez et Expliquez des Expressions Cron en Ligne',
      paragraphs: [
        'Cron est un système de planification basé sur le temps utilisé dans les systèmes Unix. Les expressions cron définissent quand les tâches planifiées doivent s\'exécuter, en utilisant un format compact à cinq champs : minute, heure, jour du mois, mois et jour de la semaine. Comprendre la syntaxe cron est essentiel pour les administrateurs système et développeurs.',
        'Notre générateur d\'expressions cron fournit une interface intuitive pour construire des expressions visuellement. Au lieu de mémoriser la syntaxe, sélectionnez les valeurs pour chaque champ. L\'outil génère l\'expression et une explication lisible, plus un aperçu des cinq prochaines exécutions.',
        'L\'outil supporte toute la syntaxe cron standard incluant les jokers (*), valeurs de pas (*/5), plages (1-5) et listes (1,3,5). Les préréglages courants sont disponibles en un clic. Vous pouvez aussi coller une expression existante pour l\'analyser.',
        'Que vous configuriez des sauvegardes automatiques, des rapports planifiés ou des pipelines CI/CD, obtenir la bonne expression cron est crucial. Utilisez cet outil pour vérifier vos expressions avant le déploiement.',
      ],
      faq: [
        { q: 'Qu\'est-ce qu\'une expression cron ?', a: 'Une expression cron est une chaîne de cinq champs séparés par des espaces définissant une planification. Les champs représentent : minute (0-59), heure (0-23), jour du mois (1-31), mois (1-12) et jour de la semaine (0-7).' },
        { q: 'Comment planifier une tâche toutes les 5 minutes ?', a: 'Utilisez l\'expression */5 * * * *. Le */5 dans le champ minute signifie "toutes les 5 minutes".' },
        { q: 'Puis-je utiliser les expressions cron dans le cloud ?', a: 'Oui, la plupart des plateformes cloud supportent les expressions cron. AWS, Google Cloud, Azure et GitHub Actions utilisent une syntaxe similaire.' },
        { q: 'Comment exécuter une tâche les jours ouvrés ?', a: 'Configurez le champ jour de la semaine à 1-5 (lundi à vendredi). Par exemple, 0 9 * * 1-5 exécute à 9h00 chaque jour ouvré.' },
      ],
    },
    de: {
      title: 'Kostenloser Cron-Generator — Cron-Ausdrücke Online Erstellen und Erklären',
      paragraphs: [
        'Cron ist ein zeitbasiertes Aufgabenplanungssystem in Unix-Systemen. Cron-Ausdrücke definieren, wann geplante Aufgaben ausgeführt werden sollen, in einem kompakten Fünf-Felder-Format: Minute, Stunde, Tag des Monats, Monat und Wochentag. Das korrekte Verstehen und Schreiben von Cron-Ausdrücken ist für Systemadministratoren und Entwickler unerlässlich.',
        'Unser Cron-Ausdrucksgenerator bietet eine intuitive Oberfläche zum visuellen Erstellen von Cron-Ausdrücken. Statt die Syntax auswendig zu lernen, wählen Sie einfach Werte für jedes Feld. Das Tool generiert den Ausdruck und eine verständliche Erklärung, plus eine Vorschau der nächsten fünf Ausführungen.',
        'Das Tool unterstützt die gesamte Standard-Cron-Syntax einschließlich Platzhalter (*), Schrittweiten (*/5), Bereiche (1-5) und Listen (1,3,5). Gängige Vorlagen sind mit einem Klick verfügbar. Sie können auch einen vorhandenen Ausdruck einfügen, um ihn zu analysieren.',
        'Ob Sie automatische Backups, geplante Berichte oder CI/CD-Pipelines konfigurieren — den richtigen Cron-Ausdruck zu haben ist entscheidend. Verwenden Sie dieses Tool zur Überprüfung vor dem Deployment.',
      ],
      faq: [
        { q: 'Was ist ein Cron-Ausdruck?', a: 'Ein Cron-Ausdruck ist eine Zeichenkette aus fünf durch Leerzeichen getrennten Feldern, die einen Zeitplan definiert. Die Felder repräsentieren: Minute (0-59), Stunde (0-23), Tag des Monats (1-31), Monat (1-12) und Wochentag (0-7).' },
        { q: 'Wie plane ich einen Job alle 5 Minuten?', a: 'Verwenden Sie den Ausdruck */5 * * * *. Das */5 im Minutenfeld bedeutet "alle 5 Minuten".' },
        { q: 'Kann ich Cron-Ausdrücke in Cloud-Diensten verwenden?', a: 'Ja, die meisten Cloud-Plattformen unterstützen Cron-Ausdrücke. AWS, Google Cloud, Azure und GitHub Actions verwenden ähnliche Syntax.' },
        { q: 'Wie führe ich einen Job nur an Werktagen aus?', a: 'Setzen Sie das Wochentagfeld auf 1-5 (Montag bis Freitag). Beispiel: 0 9 * * 1-5 führt einen Job um 9:00 Uhr an jedem Werktag aus.' },
      ],
    },
    pt: {
      title: 'Gerador de Cron Grátis — Crie e Explique Expressões Cron Online',
      paragraphs: [
        'Cron é um sistema de agendamento baseado em tempo usado em sistemas Unix. As expressões cron definem quando as tarefas agendadas devem ser executadas, usando um formato compacto de cinco campos: minuto, hora, dia do mês, mês e dia da semana. Entender e escrever expressões cron corretamente é essencial para administradores de sistemas e desenvolvedores.',
        'Nosso gerador de expressões cron fornece uma interface intuitiva para construir expressões visualmente. Em vez de memorizar a sintaxe, selecione valores para cada campo. A ferramenta gera a expressão e uma explicação legível, mais uma prévia das próximas cinco execuções.',
        'A ferramenta suporta toda a sintaxe cron padrão incluindo curingas (*), valores de passo (*/5), intervalos (1-5) e listas (1,3,5). Os presets comuns estão disponíveis com um clique. Você também pode colar uma expressão existente para analisá-la.',
        'Seja configurando backups automáticos, relatórios agendados ou pipelines CI/CD, ter a expressão cron correta é crucial. Use esta ferramenta para verificar suas expressões antes do deploy.',
      ],
      faq: [
        { q: 'O que é uma expressão cron?', a: 'Uma expressão cron é uma string de cinco campos separados por espaços que define um agendamento. Os campos representam: minuto (0-59), hora (0-23), dia do mês (1-31), mês (1-12) e dia da semana (0-7).' },
        { q: 'Como agendo um job a cada 5 minutos?', a: 'Use a expressão */5 * * * *. O */5 no campo minuto significa "a cada 5 minutos".' },
        { q: 'Posso usar expressões cron em serviços cloud?', a: 'Sim, a maioria das plataformas cloud suporta expressões cron. AWS, Google Cloud, Azure e GitHub Actions usam sintaxe similar.' },
        { q: 'Como executo um job apenas em dias úteis?', a: 'Configure o campo dia da semana para 1-5 (segunda a sexta). Exemplo: 0 9 * * 1-5 executa às 9:00 em cada dia útil.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="cron-expression-generator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Result Card */}
          <div className={`${validation.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-2 rounded-xl p-5`}>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{labels.cronExpression[lang]}</div>
            <div className="font-mono text-3xl font-bold text-gray-900 text-center mb-3 tracking-wider">
              {expression}
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${validation.valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {validation.valid ? labels.valid[lang] : labels.invalid[lang]}
              </span>
              {!validation.valid && (
                <span className="text-xs text-red-600">{validation.error}</span>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <button
                onClick={copyToClipboard}
                className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-colors ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {copied ? labels.copied[lang] : labels.copy[lang]}
              </button>
              <button
                onClick={resetFields}
                className="text-sm font-medium px-4 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
              >
                {labels.reset[lang]}
              </button>
              <button
                onClick={saveToHistory}
                disabled={!validation.valid}
                className="text-sm font-medium px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {labels.saveToHistory[lang]}
              </button>
            </div>
          </div>

          {/* Field labels */}
          <div className="grid grid-cols-5 gap-2 text-center text-xs text-gray-400 font-mono">
            <span>{labels.minute[lang]}</span>
            <span>{labels.hour[lang]}</span>
            <span>{labels.dayMonth[lang]}</span>
            <span>{labels.month[lang]}</span>
            <span>{labels.weekday[lang]}</span>
          </div>

          {/* Field inputs */}
          <div className="grid grid-cols-5 gap-2">
            <input type="text" value={minute} onChange={(e) => setMinute(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-2 text-center font-mono focus:ring-2 focus:ring-blue-500" />
            <input type="text" value={hour} onChange={(e) => setHour(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-2 text-center font-mono focus:ring-2 focus:ring-blue-500" />
            <input type="text" value={day} onChange={(e) => setDay(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-2 text-center font-mono focus:ring-2 focus:ring-blue-500" />
            <input type="text" value={month} onChange={(e) => setMonth(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-2 text-center font-mono focus:ring-2 focus:ring-blue-500" />
            <input type="text" value={weekday} onChange={(e) => setWeekday(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-2 text-center font-mono focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Explanation */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-1">{labels.explanation[lang]}</div>
            <div className="text-blue-900 font-semibold">{explainCron(expression)}</div>
          </div>

          {/* Quick Presets */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">{labels.quickPresets[lang]}</div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Object.entries(QUICK_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(preset.cron)}
                  className="text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 px-3 py-2 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                >
                  {preset.labels[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Next runs */}
          {validation.valid && nextRuns.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-800 mb-2">{labels.nextRuns[lang]}</div>
              <ul className="space-y-1">
                {nextRuns.map((run, i) => (
                  <li key={i} className="text-sm text-green-700 font-mono">{run}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Presets */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">{labels.presets[lang]}</div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset, i) => (
                <button key={i} onClick={() => applyPreset(preset.cron)} className="text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-1.5 rounded-full border border-gray-200 hover:border-blue-300 transition-colors">
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Parse custom */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">{labels.parseCustom[lang]}</div>
            <div className="flex gap-2">
              <input type="text" value={customInput} onChange={(e) => setCustomInput(e.target.value)} placeholder="*/5 * * * *" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-blue-500" />
              <button onClick={parseCustom} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
                Parse
              </button>
            </div>
          </div>

          {/* History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700">{labels.history[lang]}</div>
              {history.length > 0 && (
                <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:text-red-700 transition-colors">
                  {labels.clearHistory[lang]}
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-xs text-gray-400 italic">{labels.noHistory[lang]}</p>
            ) : (
              <div className="space-y-1.5">
                {history.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-sm text-gray-900 font-medium">{entry.expression}</span>
                      <span className="text-xs text-gray-500 ml-2 truncate">{entry.description}</span>
                    </div>
                    <button
                      onClick={() => loadFromHistory(entry)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 ml-2 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      {labels.use[lang]}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>)}
        </article>

        {/* FAQ Accordion */}
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
