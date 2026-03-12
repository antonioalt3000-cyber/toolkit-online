'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface HistoryEntry {
  eventName: string;
  targetDate: string;
  createdAt: string;
}

const labels: Record<string, Record<Locale, string>> = {
  targetDate: { en: 'Target Date & Time', it: 'Data e Ora Obiettivo', es: 'Fecha y Hora Objetivo', fr: 'Date et Heure Cible', de: 'Zieldatum und -zeit', pt: 'Data e Hora Alvo' },
  eventName: { en: 'Event Name (optional)', it: 'Nome Evento (opzionale)', es: 'Nombre del Evento (opcional)', fr: 'Nom de l\'Événement (optionnel)', de: 'Ereignisname (optional)', pt: 'Nome do Evento (opcional)' },
  days: { en: 'Days', it: 'Giorni', es: 'Días', fr: 'Jours', de: 'Tage', pt: 'Dias' },
  hours: { en: 'Hours', it: 'Ore', es: 'Horas', fr: 'Heures', de: 'Stunden', pt: 'Horas' },
  minutes: { en: 'Minutes', it: 'Minuti', es: 'Minutos', fr: 'Minutes', de: 'Minuten', pt: 'Minutos' },
  seconds: { en: 'Seconds', it: 'Secondi', es: 'Segundos', fr: 'Secondes', de: 'Sekunden', pt: 'Segundos' },
  expired: { en: 'Countdown has ended!', it: 'Il conto alla rovescia è terminato!', es: '¡La cuenta regresiva ha terminado!', fr: 'Le compte à rebours est terminé !', de: 'Der Countdown ist abgelaufen!', pt: 'A contagem regressiva terminou!' },
  countingDown: { en: 'Counting down to', it: 'Conto alla rovescia per', es: 'Cuenta regresiva para', fr: 'Compte à rebours pour', de: 'Countdown bis', pt: 'Contagem regressiva para' },
  presets: { en: 'Quick Presets', it: 'Preimpostazioni', es: 'Preajustes Rápidos', fr: 'Préréglages', de: 'Schnellvorlagen', pt: 'Predefinições Rápidas' },
  newYear: { en: 'New Year', it: 'Capodanno', es: 'Año Nuevo', fr: 'Nouvel An', de: 'Neujahr', pt: 'Ano Novo' },
  christmas: { en: 'Christmas', it: 'Natale', es: 'Navidad', fr: 'Noël', de: 'Weihnachten', pt: 'Natal' },
  tomorrow: { en: 'Tomorrow', it: 'Domani', es: 'Mañana', fr: 'Demain', de: 'Morgen', pt: 'Amanhã' },
  copyResult: { en: 'Copy Result', it: 'Copia Risultato', es: 'Copiar Resultado', fr: 'Copier le Résultat', de: 'Ergebnis Kopieren', pt: 'Copiar Resultado' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  validationError: { en: 'Please select a future date', it: 'Seleziona una data futura', es: 'Selecciona una fecha futura', fr: 'Veuillez sélectionner une date future', de: 'Bitte wählen Sie ein zukünftiges Datum', pt: 'Selecione uma data futura' },
  history: { en: 'Recent Countdowns', it: 'Countdown Recenti', es: 'Cuentas Regresivas Recientes', fr: 'Comptes à Rebours Récents', de: 'Letzte Countdowns', pt: 'Contagens Regressivas Recentes' },
  clearHistory: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Löschen', pt: 'Limpar' },
  noHistory: { en: 'No recent countdowns', it: 'Nessun countdown recente', es: 'Sin cuentas regresivas recientes', fr: 'Aucun compte à rebours récent', de: 'Keine letzten Countdowns', pt: 'Sem contagens regressivas recentes' },
  progress: { en: 'Time Elapsed', it: 'Tempo Trascorso', es: 'Tiempo Transcurrido', fr: 'Temps Écoulé', de: 'Verstrichene Zeit', pt: 'Tempo Decorrido' },
  startCountdown: { en: 'Start Countdown', it: 'Avvia Countdown', es: 'Iniciar Cuenta Regresiva', fr: 'Démarrer le Compte à Rebours', de: 'Countdown Starten', pt: 'Iniciar Contagem' },
  halloween: { en: 'Halloween', it: 'Halloween', es: 'Halloween', fr: 'Halloween', de: 'Halloween', pt: 'Halloween' },
  valentines: { en: "Valentine's Day", it: 'San Valentino', es: 'San Valentín', fr: 'Saint-Valentin', de: 'Valentinstag', pt: 'Dia dos Namorados' },
};

const HISTORY_KEY = 'countdown-timer-history';

export default function CountdownTimer() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['countdown-timer'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  };

  const [targetDate, setTargetDate] = useState(getDefaultDate());
  const [eventName, setEventName] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
  const [validationError, setValidationError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const hasStartedRef = useRef(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const saveHistory = (entries: HistoryEntry[]) => {
    setHistory(entries);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(entries)); } catch { /* ignore */ }
  };

  const addToHistory = useCallback((name: string, date: string) => {
    if (!name.trim()) return;
    setHistory(prev => {
      const filtered = prev.filter(h => !(h.eventName === name && h.targetDate === date));
      const updated = [{ eventName: name, targetDate: date, createdAt: new Date().toISOString() }, ...filtered].slice(0, 5);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const validateDate = useCallback((dateStr: string): boolean => {
    const target = new Date(dateStr).getTime();
    if (target <= Date.now()) {
      setValidationError(t('validationError'));
      return false;
    }
    setValidationError('');
    return true;
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateTimeLeft = useCallback(() => {
    const target = new Date(targetDate).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      expired: false,
    };
  }, [targetDate]);

  // Calculate progress
  useEffect(() => {
    if (!startedAt) {
      setProgressPercent(0);
      return;
    }
    const target = new Date(targetDate).getTime();
    const totalDuration = target - startedAt;
    if (totalDuration <= 0) {
      setProgressPercent(100);
      return;
    }
    const elapsed = Date.now() - startedAt;
    const pct = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    setProgressPercent(pct);
  }, [timeLeft, startedAt, targetDate]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  // Set startedAt on initial mount
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      setStartedAt(Date.now());
    }
  }, []);

  const handleDateChange = (value: string) => {
    setTargetDate(value);
    const target = new Date(value).getTime();
    if (target > Date.now()) {
      setValidationError('');
      setStartedAt(Date.now());
    } else {
      setValidationError(t('validationError'));
    }
  };

  const setPreset = (type: string) => {
    const now = new Date();
    let target: Date;
    let name = '';
    if (type === 'newYear') {
      target = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
      name = t('newYear');
    } else if (type === 'christmas') {
      const christmas = new Date(now.getFullYear(), 11, 25, 0, 0, 0);
      target = christmas > now ? christmas : new Date(now.getFullYear() + 1, 11, 25, 0, 0, 0);
      name = t('christmas');
    } else if (type === 'halloween') {
      const halloween = new Date(now.getFullYear(), 9, 31, 0, 0, 0);
      target = halloween > now ? halloween : new Date(now.getFullYear() + 1, 9, 31, 0, 0, 0);
      name = t('halloween');
    } else if (type === 'valentines') {
      const valentines = new Date(now.getFullYear(), 1, 14, 0, 0, 0);
      target = valentines > now ? valentines : new Date(now.getFullYear() + 1, 1, 14, 0, 0, 0);
      name = t('valentines');
    } else {
      target = new Date(now);
      target.setDate(target.getDate() + 1);
      target.setHours(0, 0, 0, 0);
      name = t('tomorrow');
    }
    setEventName(name);
    setTargetDate(target.toISOString().slice(0, 16));
    setValidationError('');
    setStartedAt(Date.now());
    addToHistory(name, target.toISOString().slice(0, 16));
  };

  const handleStartCountdown = () => {
    if (!validateDate(targetDate)) return;
    setStartedAt(Date.now());
    if (eventName.trim()) {
      addToHistory(eventName, targetDate);
    }
  };

  const handleReset = () => {
    const defaultDate = getDefaultDate();
    setTargetDate(defaultDate);
    setEventName('');
    setValidationError('');
    setStartedAt(Date.now());
    setProgressPercent(0);
  };

  const handleCopy = () => {
    const { days, hours, minutes, seconds } = timeLeft;
    const parts = [
      `${days} ${t('days')}`,
      `${hours} ${t('hours')}`,
      `${minutes} ${t('minutes')}`,
      `${seconds} ${t('seconds')}`,
    ];
    const text = eventName
      ? `${eventName}: ${parts.join(', ')}`
      : parts.join(', ');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setEventName(entry.eventName);
    setTargetDate(entry.targetDate);
    setValidationError('');
    setStartedAt(Date.now());
  };

  const cardColors = [
    { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  ];

  const boxes = [
    { value: timeLeft.days, label: t('days'), color: cardColors[0] },
    { value: timeLeft.hours, label: t('hours'), color: cardColors[1] },
    { value: timeLeft.minutes, label: t('minutes'), color: cardColors[2] },
    { value: timeLeft.seconds, label: t('seconds'), color: cardColors[3] },
  ];

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Countdown Timer: Track Days, Hours, Minutes, and Seconds to Any Event',
      paragraphs: [
        'A countdown timer visually tracks the time remaining until a specific date and event. Unlike a simple clock, a countdown gives you an instant sense of urgency or anticipation, breaking down the wait into days, hours, minutes, and seconds. This makes it a popular tool for holidays, product launches, weddings, exams, and personal milestones.',
        'Our countdown timer updates in real time, ticking down every second. You can set any future date and time as your target, and optionally name the event for a personal touch. The timer calculates the exact difference between now and your target, accounting for local time zones automatically through your browser.',
        'Quick presets let you instantly set countdowns to popular dates like New Year\'s Eve and Christmas. These are great for social media sharing, classroom activities, or embedding in presentations. The "Tomorrow" preset shows how much time is left in the current day, useful for deadline tracking.',
        'Once the countdown reaches zero, a clear message indicates that the event has arrived. The timer continues to show all zeros rather than counting negative time, providing a clean endpoint. You can then set a new date to start another countdown immediately.'
      ],
      faq: [
        { q: 'Does the countdown timer work across different time zones?', a: 'The timer uses your browser\'s local time zone. When you set a target date and time, it interprets it in your local time zone. If you share the page with someone in a different time zone, they will see a slightly different countdown because their local time differs.' },
        { q: 'Will the countdown continue if I close the browser?', a: 'The countdown recalculates from scratch each time you open the page. It does not run in the background. However, since it compares the target date to the current time, it will always show the correct remaining time when you reopen the page.' },
        { q: 'Can I set a countdown for a past date?', a: 'If you set a date in the past, the timer will immediately show "Countdown has ended!" with all values at zero. The tool does not count up from a past date.' },
        { q: 'How accurate is the countdown to the second?', a: 'The timer updates once per second using JavaScript\'s setInterval. There may be a variance of up to one second due to browser scheduling, but for practical purposes it is accurate enough for everyday countdown needs.' },
        { q: 'Can I use this countdown timer for a New Year\'s Eve party?', a: 'Yes! Click the "New Year" preset to automatically set the countdown to January 1st of the next year at midnight. The event name will be filled in automatically. Display it on a screen during your party for a live countdown.' }
      ]
    },
    it: {
      title: 'Timer Conto alla Rovescia: Monitora Giorni, Ore, Minuti e Secondi fino a Qualsiasi Evento',
      paragraphs: [
        'Un timer conto alla rovescia traccia visivamente il tempo rimanente fino a una data e un evento specifici. A differenza di un semplice orologio, un conto alla rovescia dà un senso immediato di urgenza o attesa, suddividendo l\'attesa in giorni, ore, minuti e secondi. È uno strumento popolare per festività, lanci di prodotti, matrimoni, esami e traguardi personali.',
        'Il nostro timer si aggiorna in tempo reale, scorrendo ogni secondo. Puoi impostare qualsiasi data e ora futura come obiettivo, e opzionalmente dare un nome all\'evento. Il timer calcola la differenza esatta tra adesso e il tuo obiettivo, tenendo conto automaticamente del fuso orario locale.',
        'Le preimpostazioni rapide permettono di impostare istantaneamente conti alla rovescia per date popolari come Capodanno e Natale. La preimpostazione "Domani" mostra quanto tempo resta nella giornata corrente, utile per monitorare le scadenze.',
        'Quando il conto alla rovescia raggiunge lo zero, un messaggio chiaro indica che l\'evento è arrivato. Il timer mostra tutti zeri anziché contare in negativo. Puoi poi impostare una nuova data per avviare immediatamente un altro conto alla rovescia.'
      ],
      faq: [
        { q: 'Il timer funziona con fusi orari diversi?', a: 'Il timer usa il fuso orario locale del tuo browser. Quando imposti una data, viene interpretata nel tuo fuso orario locale. Se condividi la pagina con qualcuno in un altro fuso orario, vedrà un conto alla rovescia leggermente diverso.' },
        { q: 'Il conto alla rovescia continua se chiudo il browser?', a: 'Il timer ricalcola tutto ogni volta che apri la pagina. Non funziona in background. Tuttavia, poiché confronta la data obiettivo con l\'ora attuale, mostrerà sempre il tempo rimanente corretto quando riapri la pagina.' },
        { q: 'Posso impostare un conto alla rovescia per una data passata?', a: 'Se imposti una data nel passato, il timer mostrerà immediatamente "Il conto alla rovescia è terminato!" con tutti i valori a zero.' },
        { q: 'Quanto è preciso il conto alla rovescia al secondo?', a: 'Il timer si aggiorna una volta al secondo usando setInterval di JavaScript. Potrebbe esserci una variazione fino a un secondo, ma per scopi pratici è sufficientemente preciso.' },
        { q: 'Posso usare questo timer per una festa di Capodanno?', a: 'Sì! Clicca la preimpostazione "Capodanno" per impostare automaticamente il conto alla rovescia al 1° gennaio dell\'anno successivo a mezzanotte. Proiettalo su uno schermo durante la festa!' }
      ]
    },
    es: {
      title: 'Temporizador de Cuenta Regresiva: Rastrea Días, Horas, Minutos y Segundos hasta Cualquier Evento',
      paragraphs: [
        'Un temporizador de cuenta regresiva rastrea visualmente el tiempo restante hasta una fecha y evento específicos. A diferencia de un simple reloj, una cuenta regresiva da una sensación inmediata de urgencia o anticipación, desglosando la espera en días, horas, minutos y segundos. Es popular para festividades, lanzamientos de productos, bodas, exámenes e hitos personales.',
        'Nuestro temporizador se actualiza en tiempo real, avanzando cada segundo. Puedes establecer cualquier fecha y hora futura como objetivo, y opcionalmente nombrar el evento. El temporizador calcula la diferencia exacta entre ahora y tu objetivo, teniendo en cuenta automáticamente la zona horaria local.',
        'Los preajustes rápidos permiten configurar instantáneamente cuentas regresivas para fechas populares como Año Nuevo y Navidad. El preajuste "Mañana" muestra cuánto tiempo queda en el día actual, útil para rastrear plazos.',
        'Cuando la cuenta regresiva llega a cero, un mensaje claro indica que el evento ha llegado. El temporizador muestra todos los valores en cero en lugar de contar en negativo. Luego puedes establecer una nueva fecha para iniciar otra cuenta regresiva.'
      ],
      faq: [
        { q: '¿El temporizador funciona con diferentes zonas horarias?', a: 'El temporizador usa la zona horaria local de tu navegador. Cuando estableces una fecha, se interpreta en tu zona horaria local. Si compartes la página con alguien en otra zona horaria, verá una cuenta regresiva ligeramente diferente.' },
        { q: '¿La cuenta regresiva continúa si cierro el navegador?', a: 'El temporizador recalcula todo cada vez que abres la página. No funciona en segundo plano. Sin embargo, siempre mostrará el tiempo restante correcto al reabrir la página.' },
        { q: '¿Puedo establecer una cuenta regresiva para una fecha pasada?', a: 'Si estableces una fecha pasada, el temporizador mostrará inmediatamente "¡La cuenta regresiva ha terminado!" con todos los valores en cero.' },
        { q: '¿Qué tan preciso es el temporizador al segundo?', a: 'Se actualiza una vez por segundo usando setInterval de JavaScript. Puede haber una variación de hasta un segundo, pero es suficientemente preciso para uso cotidiano.' },
        { q: '¿Puedo usar este temporizador para una fiesta de Año Nuevo?', a: '¡Sí! Haz clic en el preajuste "Año Nuevo" para configurar automáticamente la cuenta regresiva al 1 de enero a medianoche. ¡Proyéctalo en una pantalla durante tu fiesta!' }
      ]
    },
    fr: {
      title: 'Compte à Rebours : Suivez les Jours, Heures, Minutes et Secondes jusqu\'à Tout Événement',
      paragraphs: [
        'Un compte à rebours suit visuellement le temps restant jusqu\'à une date et un événement spécifiques. Contrairement à une simple horloge, il donne un sens immédiat d\'urgence ou d\'anticipation, décomposant l\'attente en jours, heures, minutes et secondes. C\'est un outil populaire pour les fêtes, lancements de produits, mariages, examens et jalons personnels.',
        'Notre minuterie se met à jour en temps réel, décomptant chaque seconde. Vous pouvez définir n\'importe quelle date et heure future comme cible, et optionnellement nommer l\'événement. Le minuteur calcule la différence exacte entre maintenant et votre cible.',
        'Les préréglages rapides permettent de configurer instantanément des comptes à rebours pour des dates populaires comme le Nouvel An et Noël. Le préréglage "Demain" montre combien de temps il reste dans la journée, utile pour suivre les échéances.',
        'Lorsque le compte à rebours atteint zéro, un message clair indique que l\'événement est arrivé. Le minuteur affiche tous les zéros plutôt que de compter en négatif. Vous pouvez ensuite définir une nouvelle date pour lancer immédiatement un autre compte à rebours.'
      ],
      faq: [
        { q: 'Le minuteur fonctionne-t-il avec différents fuseaux horaires ?', a: 'Le minuteur utilise le fuseau horaire local de votre navigateur. Quand vous définissez une date, elle est interprétée dans votre fuseau local.' },
        { q: 'Le compte à rebours continue-t-il si je ferme le navigateur ?', a: 'Le minuteur recalcule tout à chaque ouverture de la page. Il ne fonctionne pas en arrière-plan, mais affichera toujours le temps restant correct à la réouverture.' },
        { q: 'Puis-je définir un compte à rebours pour une date passée ?', a: 'Si vous définissez une date passée, le minuteur affichera immédiatement "Le compte à rebours est terminé !" avec toutes les valeurs à zéro.' },
        { q: 'Quelle est la précision du compte à rebours à la seconde ?', a: 'Il se met à jour une fois par seconde. Il peut y avoir une variation d\'une seconde, mais c\'est suffisamment précis pour un usage quotidien.' },
        { q: 'Puis-je utiliser ce minuteur pour une fête du Nouvel An ?', a: 'Oui ! Cliquez sur le préréglage "Nouvel An" pour configurer automatiquement le compte à rebours au 1er janvier à minuit. Affichez-le sur un écran pendant votre fête !' }
      ]
    },
    de: {
      title: 'Countdown-Timer: Verfolgen Sie Tage, Stunden, Minuten und Sekunden bis zu Jedem Ereignis',
      paragraphs: [
        'Ein Countdown-Timer verfolgt visuell die verbleibende Zeit bis zu einem bestimmten Datum und Ereignis. Im Gegensatz zu einer einfachen Uhr vermittelt ein Countdown ein sofortiges Gefühl von Dringlichkeit oder Vorfreude, indem er die Wartezeit in Tage, Stunden, Minuten und Sekunden aufschlüsselt. Beliebt für Feiertage, Produkteinführungen, Hochzeiten, Prüfungen und persönliche Meilensteine.',
        'Unser Timer aktualisiert sich in Echtzeit und zählt jede Sekunde herunter. Sie können jedes zukünftige Datum und jede Uhrzeit als Ziel festlegen und optional das Ereignis benennen. Der Timer berechnet die genaue Differenz zwischen jetzt und Ihrem Ziel.',
        'Schnellvorlagen ermöglichen sofortige Countdowns zu beliebten Daten wie Silvester und Weihnachten. Die Vorlage "Morgen" zeigt, wie viel Zeit im aktuellen Tag verbleibt — nützlich für die Fristenverfolgung.',
        'Wenn der Countdown Null erreicht, zeigt eine klare Nachricht an, dass das Ereignis eingetroffen ist. Der Timer zeigt alle Nullen statt negative Zeit. Sie können dann ein neues Datum setzen, um sofort einen weiteren Countdown zu starten.'
      ],
      faq: [
        { q: 'Funktioniert der Timer mit verschiedenen Zeitzonen?', a: 'Der Timer verwendet die lokale Zeitzone Ihres Browsers. Wenn Sie ein Datum festlegen, wird es in Ihrer lokalen Zeitzone interpretiert.' },
        { q: 'Läuft der Countdown weiter, wenn ich den Browser schließe?', a: 'Der Timer berechnet alles bei jedem Seitenaufruf neu. Er läuft nicht im Hintergrund, zeigt aber beim erneuten Öffnen immer die korrekte verbleibende Zeit an.' },
        { q: 'Kann ich einen Countdown für ein vergangenes Datum setzen?', a: 'Wenn Sie ein vergangenes Datum setzen, zeigt der Timer sofort "Der Countdown ist abgelaufen!" mit allen Werten auf Null.' },
        { q: 'Wie genau ist der Countdown auf die Sekunde?', a: 'Er aktualisiert sich einmal pro Sekunde. Es kann eine Abweichung von bis zu einer Sekunde geben, aber für den alltäglichen Gebrauch ist er genau genug.' },
        { q: 'Kann ich diesen Timer für eine Silvesterfeier verwenden?', a: 'Ja! Klicken Sie auf die Vorlage "Neujahr", um automatisch den Countdown zum 1. Januar um Mitternacht einzustellen. Zeigen Sie ihn auf einem Bildschirm während Ihrer Feier!' }
      ]
    },
    pt: {
      title: 'Temporizador Regressivo: Acompanhe Dias, Horas, Minutos e Segundos até Qualquer Evento',
      paragraphs: [
        'Um temporizador regressivo rastreia visualmente o tempo restante até uma data e evento específicos. Diferente de um simples relógio, uma contagem regressiva dá uma sensação imediata de urgência ou antecipação, dividindo a espera em dias, horas, minutos e segundos. É popular para feriados, lançamentos de produtos, casamentos, provas e marcos pessoais.',
        'Nosso temporizador se atualiza em tempo real, avançando a cada segundo. Você pode definir qualquer data e hora futura como alvo, e opcionalmente nomear o evento. O temporizador calcula a diferença exata entre agora e seu alvo, considerando automaticamente o fuso horário local.',
        'As predefinições rápidas permitem configurar instantaneamente contagens regressivas para datas populares como Ano Novo e Natal. A predefinição "Amanhã" mostra quanto tempo resta no dia atual, útil para acompanhar prazos.',
        'Quando a contagem regressiva chega a zero, uma mensagem clara indica que o evento chegou. O temporizador mostra todos os valores em zero em vez de contar em negativo. Você pode então definir uma nova data para iniciar outra contagem regressiva.'
      ],
      faq: [
        { q: 'O temporizador funciona com diferentes fusos horários?', a: 'O temporizador usa o fuso horário local do seu navegador. Quando você define uma data, ela é interpretada no seu fuso horário local.' },
        { q: 'A contagem regressiva continua se eu fechar o navegador?', a: 'O temporizador recalcula tudo cada vez que você abre a página. Não funciona em segundo plano, mas sempre mostrará o tempo restante correto ao reabrir.' },
        { q: 'Posso definir uma contagem regressiva para uma data passada?', a: 'Se você definir uma data passada, o temporizador mostrará imediatamente "A contagem regressiva terminou!" com todos os valores em zero.' },
        { q: 'Qual a precisão do temporizador ao segundo?', a: 'Ele se atualiza uma vez por segundo. Pode haver uma variação de até um segundo, mas é preciso o suficiente para uso cotidiano.' },
        { q: 'Posso usar este temporizador para uma festa de Ano Novo?', a: 'Sim! Clique na predefinição "Ano Novo" para configurar automaticamente a contagem regressiva para 1º de janeiro à meia-noite. Projete numa tela durante sua festa!' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="countdown-timer" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('eventName')}</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('targetDate')}</label>
            <input
              type="datetime-local"
              value={targetDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            />
            {validationError && (
              <p className="mt-1 text-sm text-red-500">{validationError}</p>
            )}
          </div>

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('presets')}</label>
            <div className="flex flex-wrap gap-2">
              {['newYear', 'christmas', 'halloween', 'valentines', 'tomorrow'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setPreset(preset)}
                  className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {t(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleStartCountdown}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {t('startCountdown')}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              {t('reset')}
            </button>
          </div>

          {/* Counting Down Label */}
          {eventName && (
            <p className="text-center text-gray-600">
              {t('countingDown')} <strong>{eventName}</strong>
            </p>
          )}

          {/* Result Cards */}
          {timeLeft.expired ? (
            <div className="p-6 bg-green-50 rounded-lg text-center border border-green-200">
              <p className="text-xl font-bold text-green-600">{t('expired')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {boxes.map(({ value, label, color }) => (
                <div key={label} className={`${color.bg} border ${color.border} rounded-xl p-4 text-center shadow-sm`}>
                  <div className={`text-4xl font-bold ${color.text} font-mono`}>
                    {String(value).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-600 mt-1 uppercase tracking-wide">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Progress Bar */}
          {startedAt && !timeLeft.expired && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{t('progress')}</span>
                <span>{progressPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Copy Result Button */}
          {!timeLeft.expired && (
            <button
              onClick={handleCopy}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                copied
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {copied ? t('copied') : t('copyResult')}
            </button>
          )}
        </div>

        {/* History Section */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">{t('history')}</h3>
            {history.length > 0 && (
              <button
                onClick={() => saveHistory([])}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                {t('clearHistory')}
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400">{t('noHistory')}</p>
          ) : (
            <div className="space-y-2">
              {history.map((entry, i) => {
                const targetD = new Date(entry.targetDate);
                const isPast = targetD.getTime() <= Date.now();
                return (
                  <button
                    key={i}
                    onClick={() => loadFromHistory(entry)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      isPast
                        ? 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                        : 'bg-blue-50 text-gray-700 hover:bg-blue-100'
                    }`}
                  >
                    <span className="font-medium">{entry.eventName}</span>
                    <span className="text-gray-400 ml-2">
                      {targetD.toLocaleDateString(lang, { year: 'numeric', month: 'short', day: 'numeric' })}
                      {' '}
                      {targetD.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isPast && <span className="ml-2 text-xs text-gray-400">({t('expired').replace('!', '')})</span>}
                  </button>
                );
              })}
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
