'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  modeBetween: { en: 'Days Between Dates', it: 'Giorni tra Date', es: 'Días entre Fechas', fr: 'Jours entre Dates', de: 'Tage zwischen Daten', pt: 'Dias entre Datas' },
  modeAdd: { en: 'Add/Subtract Days', it: 'Aggiungi/Sottrai Giorni', es: 'Sumar/Restar Días', fr: 'Ajouter/Soustraire Jours', de: 'Tage Addieren/Subtrahieren', pt: 'Adicionar/Subtrair Dias' },
  startDate: { en: 'Start Date', it: 'Data Inizio', es: 'Fecha Inicio', fr: 'Date de Début', de: 'Startdatum', pt: 'Data Início' },
  endDate: { en: 'End Date', it: 'Data Fine', es: 'Fecha Fin', fr: 'Date de Fin', de: 'Enddatum', pt: 'Data Fim' },
  date: { en: 'Date', it: 'Data', es: 'Fecha', fr: 'Date', de: 'Datum', pt: 'Data' },
  days: { en: 'Days', it: 'Giorni', es: 'Días', fr: 'Jours', de: 'Tage', pt: 'Dias' },
  addDays: { en: 'Days to Add (negative to subtract)', it: 'Giorni da Aggiungere (negativo per sottrarre)', es: 'Días a Sumar (negativo para restar)', fr: 'Jours à Ajouter (négatif pour soustraire)', de: 'Tage hinzufügen (negativ zum Subtrahieren)', pt: 'Dias a Adicionar (negativo para subtrair)' },
  resultDate: { en: 'Result Date', it: 'Data Risultato', es: 'Fecha Resultado', fr: 'Date Résultat', de: 'Ergebnisdatum', pt: 'Data Resultado' },
  difference: { en: 'Difference', it: 'Differenza', es: 'Diferencia', fr: 'Différence', de: 'Differenz', pt: 'Diferença' },
  weeks: { en: 'Weeks', it: 'Settimane', es: 'Semanas', fr: 'Semaines', de: 'Wochen', pt: 'Semanas' },
  months: { en: 'Months', it: 'Mesi', es: 'Meses', fr: 'Mois', de: 'Monate', pt: 'Meses' },
  years: { en: 'Years', it: 'Anni', es: 'Años', fr: 'Années', de: 'Jahre', pt: 'Anos' },
  hours: { en: 'Hours', it: 'Ore', es: 'Horas', fr: 'Heures', de: 'Stunden', pt: 'Horas' },
  minutes: { en: 'Minutes', it: 'Minuti', es: 'Minutos', fr: 'Minutes', de: 'Minuten', pt: 'Minutos' },
  businessDays: { en: 'Business Days', it: 'Giorni Lavorativi', es: 'Días Hábiles', fr: 'Jours Ouvrés', de: 'Arbeitstage', pt: 'Dias Úteis' },
  additionalInfo: { en: 'Additional Details', it: 'Dettagli Aggiuntivi', es: 'Detalles Adicionales', fr: 'Détails Supplémentaires', de: 'Zusätzliche Details', pt: 'Detalhes Adicionais' },
  reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  copy: { en: 'Copy Result', it: 'Copia Risultato', es: 'Copiar Resultado', fr: 'Copier Résultat', de: 'Ergebnis Kopieren', pt: 'Copiar Resultado' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  errorEndBeforeStart: { en: 'End date is before start date', it: 'La data di fine è precedente alla data di inizio', es: 'La fecha final es anterior a la fecha de inicio', fr: 'La date de fin est antérieure à la date de début', de: 'Das Enddatum liegt vor dem Startdatum', pt: 'A data final é anterior à data de início' },
  history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  quickPresets: { en: 'Quick Presets', it: 'Preset Rapidi', es: 'Preselecciones Rápidas', fr: 'Préréglages Rapides', de: 'Schnellvorlagen', pt: 'Predefinições Rápidas' },
  daysUntilEndOfYear: { en: 'Days until end of year', it: 'Giorni fino a fine anno', es: 'Días hasta fin de año', fr: "Jours jusqu'à fin d'année", de: 'Tage bis Jahresende', pt: 'Dias até o fim do ano' },
  daysSinceStartOfYear: { en: 'Days since start of year', it: "Giorni dall'inizio dell'anno", es: 'Días desde inicio de año', fr: "Jours depuis le début de l'année", de: 'Tage seit Jahresbeginn', pt: 'Dias desde o início do ano' },
  daysUntilNextBirthday: { en: 'Days until next birthday', it: 'Giorni al prossimo compleanno', es: 'Días hasta el próximo cumpleaños', fr: "Jours jusqu'au prochain anniversaire", de: 'Tage bis zum nächsten Geburtstag', pt: 'Dias até o próximo aniversário' },
  birthdayPrompt: { en: 'Enter your birthday (MM-DD)', it: 'Inserisci il tuo compleanno (MM-GG)', es: 'Ingresa tu cumpleaños (MM-DD)', fr: 'Entrez votre anniversaire (MM-JJ)', de: 'Geben Sie Ihren Geburtstag ein (MM-TT)', pt: 'Insira seu aniversário (MM-DD)' },
  approx: { en: 'approx', it: 'circa', es: 'aprox', fr: 'env.', de: 'ca.', pt: 'aprox.' },
  exclWeekends: { en: 'excl. weekends', it: 'escl. weekend', es: 'excl. fines de semana', fr: 'hors week-ends', de: 'ohne Wochenenden', pt: 'excl. fins de semana' },
  clearHistory: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Löschen', pt: 'Limpar' },
};

interface HistoryEntry {
  id: number;
  from: string;
  to: string;
  days: number;
}

function countBusinessDays(start: Date, end: Date): number {
  let count = 0;
  const d = new Date(start);
  const direction = end >= start ? 1 : -1;
  const target = new Date(end);
  if (direction === 1) {
    while (d < target) {
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) count++;
      d.setDate(d.getDate() + 1);
    }
  } else {
    while (d > target) {
      d.setDate(d.getDate() - 1);
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) count++;
    }
  }
  return count;
}

export default function DateCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['date-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const today = new Date().toISOString().split('T')[0];
  const [mode, setMode] = useState<'between' | 'add'>('between');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [baseDate, setBaseDate] = useState(today);
  const [daysToAdd, setDaysToAdd] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyCounter, setHistoryCounter] = useState(0);

  // Days between
  const d1 = new Date(startDate);
  const d2 = new Date(endDate);
  const diffMs = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = (Math.abs(diffDays) / 7).toFixed(1);
  const diffMonths = (Math.abs(diffDays) / 30.44).toFixed(1);
  const diffYears = (Math.abs(diffDays) / 365.25).toFixed(2);
  const diffHours = Math.abs(diffDays) * 24;
  const diffMinutes = diffHours * 60;
  const bDays = countBusinessDays(d1, d2);
  const endBeforeStart = diffDays < 0;

  // Add days
  const addNum = parseInt(daysToAdd) || 0;
  const resultDate = new Date(baseDate);
  resultDate.setDate(resultDate.getDate() + addNum);
  const resultStr = resultDate.toISOString().split('T')[0];

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const addToHistory = useCallback((from: string, to: string, days: number) => {
    setHistoryCounter(prev => {
      const newId = prev + 1;
      setHistory(h => {
        const exists = h.some(e => e.from === from && e.to === to);
        if (exists) return h;
        const entry: HistoryEntry = { id: newId, from, to, days };
        return [entry, ...h].slice(0, 5);
      });
      return newId;
    });
  }, []);

  const [copied, setCopied] = useState(false);

  const handleReset = () => {
    const t = new Date().toISOString().split('T')[0];
    setStartDate(t); setEndDate(t); setBaseDate(t); setDaysToAdd('');
  };

  const copyResults = () => {
    let text = '';
    if (mode === 'between') {
      text = `${t('difference')}: ${Math.abs(diffDays)} ${t('days')} (${diffWeeks} ${t('weeks')}, ${diffMonths} ${t('months')}, ${diffYears} ${t('years')}) | ${t('businessDays')}: ${bDays} | ${t('hours')}: ${diffHours.toLocaleString()} | ${t('minutes')}: ${diffMinutes.toLocaleString()}`;
      addToHistory(startDate, endDate, Math.abs(diffDays));
    } else {
      text = `${t('resultDate')}: ${formatDate(resultStr)} (${resultStr})`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick presets
  const handleEndOfYear = () => {
    const now = new Date();
    const endOfYear = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
    setMode('between');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(endOfYear);
  };

  const handleStartOfYear = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    setMode('between');
    setStartDate(startOfYear);
    setEndDate(new Date().toISOString().split('T')[0]);
  };

  const handleNextBirthday = () => {
    const input = prompt(t('birthdayPrompt'));
    if (!input) return;
    const parts = input.split('-');
    if (parts.length !== 2) return;
    const month = parseInt(parts[0]) - 1;
    const day = parseInt(parts[1]);
    if (isNaN(month) || isNaN(day)) return;
    const now = new Date();
    let bday = new Date(now.getFullYear(), month, day);
    if (bday <= now) bday = new Date(now.getFullYear() + 1, month, day);
    setMode('between');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(bday.toISOString().split('T')[0]);
  };

  const handleHistoryClick = (entry: HistoryEntry) => {
    setMode('between');
    setStartDate(entry.from);
    setEndDate(entry.to);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Date Calculator: Find Days Between Dates or Add Days to a Date',
      paragraphs: [
        'A date calculator is an essential tool for anyone who needs to count the number of days between two dates or determine a future or past date by adding or subtracting days. While this sounds simple, manual calculations can be tricky due to months of varying length, leap years, and the difficulty of counting across year boundaries.',
        'Our date calculator offers two modes. The first mode calculates the exact number of days between any two dates, also showing the equivalent in weeks and approximate months. This is useful for project planning, tracking pregnancy weeks, calculating contract durations, or figuring out how many days until a deadline.',
        'The second mode lets you add or subtract a specific number of days from any starting date. Enter a negative number to go backward in time. This is perfect for computing due dates, warranty expiration, notice periods, or any scenario where you need to know "what date is X days from now?"',
        'All results are computed instantly using your browser\'s built-in date handling, which correctly accounts for daylight saving time transitions, leap years, and month boundaries. The result date is displayed both in a localized long format (with day of the week) and in ISO format for easy reference.'
      ],
      faq: [
        { q: 'Does the date calculator account for leap years?', a: 'Yes. The calculator uses the JavaScript Date object, which correctly handles leap years. February 29 is included in calculations when applicable, and the day count between dates is always accurate.' },
        { q: 'How do I calculate business days (excluding weekends)?', a: 'This calculator counts all calendar days including weekends and holidays. For business days only, you would need to manually subtract weekends (roughly 2 days per 7) or use a specialized business day calculator.' },
        { q: 'Can I calculate dates far in the past or future?', a: 'Yes. The JavaScript Date object supports dates from approximately 271,821 BCE to 275,760 CE, so you can calculate date differences across centuries without any issues.' },
        { q: 'Why does the months count say "approx"?', a: 'Because months have different lengths (28-31 days), converting a day count to months requires an approximation. We use 30.44 days per month (365.25/12), which is the average month length over a four-year cycle.' },
        { q: 'How do I find the date 90 days from today?', a: 'Switch to the "Add/Subtract Days" mode, make sure today\'s date is selected, type 90 in the days field, and the result date will appear instantly below.' }
      ]
    },
    it: {
      title: 'Calcolatore di Date: Trova i Giorni tra Due Date o Aggiungi Giorni',
      paragraphs: [
        'Un calcolatore di date è uno strumento essenziale per chiunque abbia bisogno di contare il numero di giorni tra due date o determinare una data futura o passata aggiungendo o sottraendo giorni. Anche se sembra semplice, i calcoli manuali possono essere complicati a causa dei mesi di diversa durata e degli anni bisestili.',
        'Il nostro calcolatore offre due modalità. La prima calcola il numero esatto di giorni tra due date qualsiasi, mostrando anche l\'equivalente in settimane e mesi approssimativi. È utile per la pianificazione di progetti, il monitoraggio delle settimane di gravidanza, il calcolo della durata dei contratti o per sapere quanti giorni mancano a una scadenza.',
        'La seconda modalità permette di aggiungere o sottrarre un numero specifico di giorni da qualsiasi data di partenza. Inserisci un numero negativo per andare indietro nel tempo. Perfetto per calcolare date di scadenza, fine garanzia o periodi di preavviso.',
        'Tutti i risultati sono calcolati istantaneamente dal browser, che gestisce correttamente le transizioni dell\'ora legale, gli anni bisestili e i confini dei mesi. La data risultante è mostrata sia in formato lungo localizzato che in formato ISO.'
      ],
      faq: [
        { q: 'Il calcolatore tiene conto degli anni bisestili?', a: 'Sì. Il calcolatore utilizza l\'oggetto Date di JavaScript che gestisce correttamente gli anni bisestili. Il 29 febbraio è incluso nei calcoli quando applicabile.' },
        { q: 'Come calcolo i giorni lavorativi (esclusi i weekend)?', a: 'Questo calcolatore conta tutti i giorni di calendario inclusi weekend e festivi. Per i soli giorni lavorativi, è necessario sottrarre manualmente i weekend (circa 2 giorni ogni 7).' },
        { q: 'Posso calcolare date molto lontane nel passato o nel futuro?', a: 'Sì. L\'oggetto Date di JavaScript supporta date dal 271.821 a.C. al 275.760 d.C., quindi puoi calcolare differenze di date attraverso i secoli senza problemi.' },
        { q: 'Perché il conteggio dei mesi dice "circa"?', a: 'Poiché i mesi hanno durate diverse (28-31 giorni), la conversione in mesi richiede un\'approssimazione. Usiamo 30,44 giorni per mese (365,25/12), la durata media di un mese in un ciclo quadriennale.' },
        { q: 'Come trovo la data tra 90 giorni da oggi?', a: 'Passa alla modalità "Aggiungi/Sottrai Giorni", assicurati che sia selezionata la data odierna, digita 90 nel campo giorni e la data risultante apparirà istantaneamente.' }
      ]
    },
    es: {
      title: 'Calculadora de Fechas: Encuentra Días entre Fechas o Suma Días',
      paragraphs: [
        'Una calculadora de fechas es una herramienta esencial para cualquiera que necesite contar el número de días entre dos fechas o determinar una fecha futura o pasada sumando o restando días. Aunque parezca simple, los cálculos manuales pueden ser complicados por los meses de diferente duración y los años bisiestos.',
        'Nuestra calculadora ofrece dos modos. El primero calcula el número exacto de días entre dos fechas, mostrando también el equivalente en semanas y meses aproximados. Es útil para planificación de proyectos, seguimiento de semanas de embarazo, cálculo de duración de contratos o para saber cuántos días faltan para una fecha límite.',
        'El segundo modo permite sumar o restar un número específico de días desde cualquier fecha. Ingresa un número negativo para retroceder en el tiempo. Perfecto para calcular fechas de vencimiento, fin de garantía o períodos de preaviso.',
        'Todos los resultados se calculan instantáneamente usando el manejo de fechas del navegador, que tiene en cuenta correctamente el horario de verano, los años bisiestos y los límites de los meses.'
      ],
      faq: [
        { q: '¿La calculadora tiene en cuenta los años bisiestos?', a: 'Sí. Usa el objeto Date de JavaScript que maneja correctamente los años bisiestos. El 29 de febrero se incluye en los cálculos cuando corresponde.' },
        { q: '¿Cómo calculo días hábiles (excluyendo fines de semana)?', a: 'Esta calculadora cuenta todos los días calendario incluyendo fines de semana y festivos. Para días hábiles, restarías manualmente los fines de semana (aproximadamente 2 días cada 7).' },
        { q: '¿Puedo calcular fechas muy lejanas en el pasado o futuro?', a: 'Sí. El objeto Date de JavaScript soporta fechas desde aproximadamente el año 271.821 a.C. hasta el 275.760 d.C.' },
        { q: '¿Por qué el conteo de meses dice "aprox"?', a: 'Como los meses tienen diferentes duraciones (28-31 días), la conversión a meses requiere una aproximación. Usamos 30,44 días por mes (365,25/12), la duración promedio mensual.' },
        { q: '¿Cómo encuentro la fecha dentro de 90 días?', a: 'Cambia al modo "Sumar/Restar Días", asegúrate de que esté seleccionada la fecha de hoy, escribe 90 en el campo de días y la fecha resultado aparecerá al instante.' }
      ]
    },
    fr: {
      title: 'Calculateur de Dates : Trouvez les Jours entre Deux Dates ou Ajoutez des Jours',
      paragraphs: [
        'Un calculateur de dates est un outil essentiel pour quiconque a besoin de compter le nombre de jours entre deux dates ou de déterminer une date future ou passée en ajoutant ou soustrayant des jours. Bien que cela semble simple, les calculs manuels peuvent être délicats en raison des mois de longueur variable et des années bissextiles.',
        'Notre calculateur offre deux modes. Le premier calcule le nombre exact de jours entre deux dates, affichant aussi l\'équivalent en semaines et mois approximatifs. Utile pour la planification de projets, le suivi des semaines de grossesse, le calcul de la durée des contrats ou pour savoir combien de jours avant une échéance.',
        'Le second mode permet d\'ajouter ou soustraire un nombre de jours à partir de n\'importe quelle date. Entrez un nombre négatif pour remonter dans le temps. Parfait pour calculer des dates d\'échéance, des fins de garantie ou des délais de préavis.',
        'Tous les résultats sont calculés instantanément par le navigateur, qui gère correctement les transitions heure d\'été/hiver, les années bissextiles et les changements de mois.'
      ],
      faq: [
        { q: 'Le calculateur tient-il compte des années bissextiles ?', a: 'Oui. Il utilise l\'objet Date de JavaScript qui gère correctement les années bissextiles. Le 29 février est inclus dans les calculs quand applicable.' },
        { q: 'Comment calculer les jours ouvrés (hors week-ends) ?', a: 'Ce calculateur compte tous les jours calendaires, y compris les week-ends et jours fériés. Pour les jours ouvrés uniquement, il faut soustraire manuellement les week-ends.' },
        { q: 'Puis-je calculer des dates très lointaines ?', a: 'Oui. L\'objet Date de JavaScript prend en charge les dates d\'environ 271 821 av. J.-C. à 275 760 ap. J.-C.' },
        { q: 'Pourquoi le décompte des mois indique-t-il "env." ?', a: 'Les mois ayant des durées différentes (28-31 jours), la conversion en mois nécessite une approximation. Nous utilisons 30,44 jours par mois (365,25/12).' },
        { q: 'Comment trouver la date dans 90 jours ?', a: 'Passez au mode "Ajouter/Soustraire Jours", vérifiez que la date d\'aujourd\'hui est sélectionnée, tapez 90 et la date résultat apparaîtra instantanément.' }
      ]
    },
    de: {
      title: 'Datumsrechner: Tage zwischen Daten Berechnen oder Tage Addieren',
      paragraphs: [
        'Ein Datumsrechner ist ein unverzichtbares Werkzeug für alle, die die Anzahl der Tage zwischen zwei Daten zählen oder ein zukünftiges oder vergangenes Datum durch Addieren oder Subtrahieren von Tagen bestimmen müssen. Obwohl es einfach klingt, können manuelle Berechnungen wegen unterschiedlicher Monatslängen und Schaltjahren schwierig sein.',
        'Unser Rechner bietet zwei Modi. Der erste berechnet die genaue Anzahl der Tage zwischen zwei Daten und zeigt auch die Entsprechung in Wochen und ungefähren Monaten. Nützlich für Projektplanung, Schwangerschaftswochen, Vertragsdauer oder die Berechnung von Tagen bis zu einer Frist.',
        'Der zweite Modus ermöglicht das Addieren oder Subtrahieren einer bestimmten Anzahl von Tagen. Geben Sie eine negative Zahl ein, um in der Zeit zurückzugehen. Perfekt für Fälligkeitstermine, Garantieablauf oder Kündigungsfristen.',
        'Alle Ergebnisse werden sofort berechnet. Der Browser berücksichtigt korrekt Sommerzeit-Umstellungen, Schaltjahre und Monatsgrenzen.'
      ],
      faq: [
        { q: 'Berücksichtigt der Rechner Schaltjahre?', a: 'Ja. Er verwendet JavaScripts Date-Objekt, das Schaltjahre korrekt behandelt. Der 29. Februar wird bei Bedarf in die Berechnungen einbezogen.' },
        { q: 'Wie berechne ich Arbeitstage (ohne Wochenenden)?', a: 'Dieser Rechner zählt alle Kalendertage einschließlich Wochenenden und Feiertage. Für reine Arbeitstage müssen Wochenenden manuell abgezogen werden.' },
        { q: 'Kann ich weit zurückliegende oder zukünftige Daten berechnen?', a: 'Ja. Das Date-Objekt unterstützt Daten von etwa 271.821 v. Chr. bis 275.760 n. Chr.' },
        { q: 'Warum steht beim Monatswert "ca."?', a: 'Da Monate unterschiedliche Längen haben (28-31 Tage), erfordert die Umrechnung eine Näherung. Wir verwenden 30,44 Tage pro Monat (365,25/12).' },
        { q: 'Wie finde ich das Datum in 90 Tagen?', a: 'Wechseln Sie zum Modus "Tage Addieren/Subtrahieren", stellen Sie sicher, dass das heutige Datum ausgewählt ist, geben Sie 90 ein und das Ergebnisdatum erscheint sofort.' }
      ]
    },
    pt: {
      title: 'Calculadora de Datas: Encontre Dias entre Datas ou Adicione Dias',
      paragraphs: [
        'Uma calculadora de datas é uma ferramenta essencial para quem precisa contar o número de dias entre duas datas ou determinar uma data futura ou passada adicionando ou subtraindo dias. Embora pareça simples, cálculos manuais podem ser complicados devido aos meses de diferentes durações e anos bissextos.',
        'Nossa calculadora oferece dois modos. O primeiro calcula o número exato de dias entre duas datas, mostrando também o equivalente em semanas e meses aproximados. Útil para planejamento de projetos, acompanhamento de semanas de gravidez, cálculo de duração de contratos ou para saber quantos dias faltam para um prazo.',
        'O segundo modo permite adicionar ou subtrair um número específico de dias a partir de qualquer data. Insira um número negativo para voltar no tempo. Perfeito para calcular datas de vencimento, fim de garantia ou períodos de aviso prévio.',
        'Todos os resultados são calculados instantaneamente pelo navegador, que lida corretamente com transições de horário de verão, anos bissextos e limites de meses.'
      ],
      faq: [
        { q: 'A calculadora considera anos bissextos?', a: 'Sim. Usa o objeto Date do JavaScript que trata corretamente anos bissextos. O 29 de fevereiro é incluído nos cálculos quando aplicável.' },
        { q: 'Como calculo dias úteis (excluindo fins de semana)?', a: 'Esta calculadora conta todos os dias do calendário, incluindo fins de semana e feriados. Para dias úteis, seria necessário subtrair manualmente os fins de semana.' },
        { q: 'Posso calcular datas muito distantes no passado ou futuro?', a: 'Sim. O objeto Date do JavaScript suporta datas de aproximadamente 271.821 a.C. a 275.760 d.C.' },
        { q: 'Por que a contagem de meses diz "aprox."?', a: 'Como os meses têm durações diferentes (28-31 dias), a conversão em meses requer uma aproximação. Usamos 30,44 dias por mês (365,25/12).' },
        { q: 'Como encontro a data daqui a 90 dias?', a: 'Mude para o modo "Adicionar/Subtrair Dias", certifique-se de que a data de hoje está selecionada, digite 90 e a data resultado aparecerá instantaneamente.' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="date-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button onClick={() => setMode('between')}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${mode === 'between' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {t('modeBetween')}
            </button>
            <button onClick={() => setMode('add')}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${mode === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {t('modeAdd')}
            </button>
          </div>

          {mode === 'between' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('startDate')}</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('endDate')}</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              {/* Validation error */}
              {endBeforeStart && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {t('errorEndBeforeStart')}
                </div>
              )}

              {/* Result cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="text-xs text-blue-600 font-medium mb-1">{t('days')}</div>
                  <div className="text-2xl font-bold text-blue-700">{Math.abs(diffDays).toLocaleString()}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-xs text-green-600 font-medium mb-1">{t('weeks')}</div>
                  <div className="text-2xl font-bold text-green-700">{diffWeeks}</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <div className="text-xs text-purple-600 font-medium mb-1">{t('months')} ({t('approx')})</div>
                  <div className="text-2xl font-bold text-purple-700">{diffMonths}</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <div className="text-xs text-amber-600 font-medium mb-1">{t('years')} ({t('approx')})</div>
                  <div className="text-2xl font-bold text-amber-700">{diffYears}</div>
                </div>
              </div>

              {/* Additional info */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('additionalInfo')}</div>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-gray-600">{t('businessDays')} <span className="text-xs text-gray-400">({t('exclWeekends')})</span></div>
                  <div className="text-right font-semibold text-gray-800">{bDays.toLocaleString()}</div>
                  <div className="text-gray-600">{t('hours')}</div>
                  <div className="text-right font-semibold text-gray-800">{diffHours.toLocaleString()}</div>
                  <div className="text-gray-600">{t('minutes')}</div>
                  <div className="text-right font-semibold text-gray-800">{diffMinutes.toLocaleString()}</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button onClick={copyResults} className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  {copied ? (
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
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')}</label>
                <input type="date" value={baseDate} onChange={(e) => setBaseDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('addDays')}</label>
                <input type="number" value={daysToAdd} onChange={(e) => setDaysToAdd(e.target.value)} placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              {addNum !== 0 && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                    <div className="text-xs text-blue-600 font-medium mt-1">{t('resultDate')}</div>
                    <div className="text-xl font-bold text-blue-700">{formatDate(resultStr)}</div>
                    <div className="text-sm text-gray-500 mt-1">{resultStr}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={copyResults} className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      {copied ? (
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
          <div className="text-xs font-semibold text-gray-500 uppercase mb-3">{t('quickPresets')}</div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleEndOfYear} className="px-3 py-1.5 text-sm rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors">
              {t('daysUntilEndOfYear')}
            </button>
            <button onClick={handleStartOfYear} className="px-3 py-1.5 text-sm rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors">
              {t('daysSinceStartOfYear')}
            </button>
            <button onClick={handleNextBirthday} className="px-3 py-1.5 text-sm rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors">
              {t('daysUntilNextBirthday')}
            </button>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-gray-500 uppercase">{t('history')}</div>
              <button onClick={() => setHistory([])} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">{t('clearHistory')}</button>
            </div>
            <div className="space-y-1.5">
              {history.map((entry) => (
                <button key={entry.id} onClick={() => handleHistoryClick(entry)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm flex justify-between items-center">
                  <span className="text-gray-600">{entry.from} &rarr; {entry.to}</span>
                  <span className="font-semibold text-gray-800">{entry.days} {t('days')}</span>
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
