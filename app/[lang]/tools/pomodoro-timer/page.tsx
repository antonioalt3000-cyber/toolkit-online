'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type Phase = 'work' | 'shortBreak' | 'longBreak';

interface DayLog {
  date: string;
  completed: number;
  focusMinutes: number;
}

const labels: Record<string, Record<Locale, string>> = {
  work: { en: 'Work', it: 'Lavoro', es: 'Trabajo', fr: 'Travail', de: 'Arbeit', pt: 'Trabalho' },
  shortBreak: { en: 'Short Break', it: 'Pausa Breve', es: 'Pausa Corta', fr: 'Pause Courte', de: 'Kurze Pause', pt: 'Pausa Curta' },
  longBreak: { en: 'Long Break', it: 'Pausa Lunga', es: 'Pausa Larga', fr: 'Longue Pause', de: 'Lange Pause', pt: 'Pausa Longa' },
  start: { en: 'Start', it: 'Avvia', es: 'Iniciar', fr: 'Démarrer', de: 'Starten', pt: 'Iniciar' },
  pause: { en: 'Pause', it: 'Pausa', es: 'Pausar', fr: 'Pause', de: 'Pause', pt: 'Pausar' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  completedSessions: { en: 'Completed Sessions', it: 'Sessioni Completate', es: 'Sesiones Completadas', fr: 'Sessions Terminées', de: 'Abgeschlossene Sitzungen', pt: 'Sessões Concluídas' },
  currentPhase: { en: 'Current Phase', it: 'Fase Attuale', es: 'Fase Actual', fr: 'Phase Actuelle', de: 'Aktuelle Phase', pt: 'Fase Atual' },
  totalFocusTime: { en: 'Total Focus Time', it: 'Tempo Totale di Focus', es: 'Tiempo Total de Enfoque', fr: 'Temps Total de Concentration', de: 'Gesamte Fokuszeit', pt: 'Tempo Total de Foco' },
  minutes: { en: 'min', it: 'min', es: 'min', fr: 'min', de: 'Min', pt: 'min' },
  settings: { en: 'Settings', it: 'Impostazioni', es: 'Configuración', fr: 'Paramètres', de: 'Einstellungen', pt: 'Configurações' },
  workDuration: { en: 'Work Duration (min)', it: 'Durata Lavoro (min)', es: 'Duración Trabajo (min)', fr: 'Durée Travail (min)', de: 'Arbeitsdauer (Min)', pt: 'Duração Trabalho (min)' },
  shortBreakDuration: { en: 'Short Break (min)', it: 'Pausa Breve (min)', es: 'Pausa Corta (min)', fr: 'Pause Courte (min)', de: 'Kurze Pause (Min)', pt: 'Pausa Curta (min)' },
  longBreakDuration: { en: 'Long Break (min)', it: 'Pausa Lunga (min)', es: 'Pausa Larga (min)', fr: 'Longue Pause (min)', de: 'Lange Pause (Min)', pt: 'Pausa Longa (min)' },
  dailyGoal: { en: 'Daily Goal (pomodoros)', it: 'Obiettivo Giornaliero (pomodori)', es: 'Meta Diaria (pomodoros)', fr: 'Objectif Journalier (pomodoros)', de: 'Tagesziel (Pomodoros)', pt: 'Meta Diária (pomodoros)' },
  goalProgress: { en: 'Goal Progress', it: 'Progresso Obiettivo', es: 'Progreso de Meta', fr: 'Progression de l\'Objectif', de: 'Zielfortschritt', pt: 'Progresso da Meta' },
  copyStats: { en: 'Copy Stats', it: 'Copia Statistiche', es: 'Copiar Estadísticas', fr: 'Copier les Stats', de: 'Statistiken Kopieren', pt: 'Copiar Estatísticas' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  history: { en: 'Session History', it: 'Cronologia Sessioni', es: 'Historial de Sesiones', fr: 'Historique des Sessions', de: 'Sitzungsverlauf', pt: 'Histórico de Sessões' },
  clearHistory: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Löschen', pt: 'Limpar' },
  noHistory: { en: 'No sessions yet', it: 'Nessuna sessione', es: 'Sin sesiones aún', fr: 'Aucune session', de: 'Noch keine Sitzungen', pt: 'Nenhuma sessão ainda' },
  pomodoros: { en: 'pomodoros', it: 'pomodori', es: 'pomodoros', fr: 'pomodoros', de: 'Pomodoros', pt: 'pomodoros' },
  focusTime: { en: 'focus time', it: 'tempo di focus', es: 'tiempo de enfoque', fr: 'temps de concentration', de: 'Fokuszeit', pt: 'tempo de foco' },
  spaceToStartPause: { en: 'Press Space to start/pause', it: 'Premi Spazio per avviare/pausa', es: 'Presiona Espacio para iniciar/pausar', fr: 'Appuyez sur Espace pour démarrer/pause', de: 'Leertaste zum Starten/Pausieren', pt: 'Pressione Espaço para iniciar/pausar' },
  today: { en: 'Today', it: 'Oggi', es: 'Hoy', fr: "Aujourd'hui", de: 'Heute', pt: 'Hoje' },
};

const STORAGE_KEY = 'pomodoro-timer-data';

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function PomodoroTimer() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['pomodoro-timer'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  // Settings
  const [workMin, setWorkMin] = useState(25);
  const [shortBreakMin, setShortBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);
  const [dailyGoal, setDailyGoal] = useState(8);

  // Timer state
  const [phase, setPhase] = useState<Phase>('work');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);
  const [totalFocusMin, setTotalFocusMin] = useState(0);
  const [pomodoroCount, setPomodoroCount] = useState(0); // count within cycle (0-3)
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<DayLog[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Compute total duration for the current phase
  const getPhaseDuration = useCallback((p: Phase) => {
    if (p === 'work') return workMin * 60;
    if (p === 'shortBreak') return shortBreakMin * 60;
    return longBreakMin * 60;
  }, [workMin, shortBreakMin, longBreakMin]);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.history) setHistory(data.history);
        if (data.todayDate === getTodayStr()) {
          setCompletedToday(data.completedToday || 0);
          setTotalFocusMin(data.totalFocusMin || 0);
          setPomodoroCount(data.pomodoroCount || 0);
        }
        if (data.workMin) setWorkMin(data.workMin);
        if (data.shortBreakMin) setShortBreakMin(data.shortBreakMin);
        if (data.longBreakMin) setLongBreakMin(data.longBreakMin);
        if (data.dailyGoal) setDailyGoal(data.dailyGoal);
      }
    } catch { /* ignore */ }
  }, []);

  // Save to localStorage
  const saveData = useCallback((updates: Partial<{ completedToday: number; totalFocusMin: number; pomodoroCount: number; history: DayLog[]; workMin: number; shortBreakMin: number; longBreakMin: number; dailyGoal: number }>) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : {};
      const merged = {
        ...data,
        todayDate: getTodayStr(),
        ...updates,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch { /* ignore */ }
  }, []);

  // Play beep using Web Audio API
  const playBeep = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.8);
    } catch { /* ignore */ }
  }, []);

  // Timer tick
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          // Timer ended
          playBeep();
          if (phase === 'work') {
            const newCompleted = completedToday + 1;
            const newFocus = totalFocusMin + workMin;
            const newPomCount = pomodoroCount + 1;
            setCompletedToday(newCompleted);
            setTotalFocusMin(newFocus);
            setPomodoroCount(newPomCount);

            // Update history
            const today = getTodayStr();
            setHistory(prev => {
              const existing = prev.find(h => h.date === today);
              let updated: DayLog[];
              if (existing) {
                updated = prev.map(h => h.date === today ? { ...h, completed: newCompleted, focusMinutes: newFocus } : h);
              } else {
                updated = [{ date: today, completed: newCompleted, focusMinutes: newFocus }, ...prev].slice(0, 30);
              }
              saveData({ completedToday: newCompleted, totalFocusMin: newFocus, pomodoroCount: newPomCount, history: updated });
              return updated;
            });

            // Determine next phase
            if (newPomCount % 4 === 0) {
              setPhase('longBreak');
              return longBreakMin * 60;
            } else {
              setPhase('shortBreak');
              return shortBreakMin * 60;
            }
          } else {
            // Break ended, switch to work
            setPhase('work');
            return workMin * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, phase, completedToday, totalFocusMin, pomodoroCount, workMin, shortBreakMin, longBreakMin, playBeep, saveData]);

  // Keyboard shortcut: Space to start/pause
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        setIsRunning(r => !r);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleStartPause = () => setIsRunning(r => !r);

  const handleReset = () => {
    setIsRunning(false);
    setPhase('work');
    setSecondsLeft(workMin * 60);
    setPomodoroCount(0);
  };

  const handleSettingsChange = (key: 'workMin' | 'shortBreakMin' | 'longBreakMin' | 'dailyGoal', value: number) => {
    const clamped = Math.max(1, Math.min(120, value));
    if (key === 'workMin') {
      setWorkMin(clamped);
      if (!isRunning && phase === 'work') setSecondsLeft(clamped * 60);
      saveData({ workMin: clamped });
    } else if (key === 'shortBreakMin') {
      setShortBreakMin(clamped);
      if (!isRunning && phase === 'shortBreak') setSecondsLeft(clamped * 60);
      saveData({ shortBreakMin: clamped });
    } else if (key === 'longBreakMin') {
      setLongBreakMin(clamped);
      if (!isRunning && phase === 'longBreak') setSecondsLeft(clamped * 60);
      saveData({ longBreakMin: clamped });
    } else {
      const goalClamped = Math.max(1, Math.min(50, value));
      setDailyGoal(goalClamped);
      saveData({ dailyGoal: goalClamped });
    }
  };

  const handleCopyStats = () => {
    const text = `Pomodoro: ${completedToday}/${dailyGoal} ${t('pomodoros')} | ${totalFocusMin} ${t('minutes')} ${t('focusTime')}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    setCompletedToday(0);
    setTotalFocusMin(0);
    setPomodoroCount(0);
    saveData({ completedToday: 0, totalFocusMin: 0, pomodoroCount: 0, history: [] });
  };

  // Format seconds as MM:SS
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // SVG circle progress
  const totalSeconds = getPhaseDuration(phase);
  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference * (1 - progress);

  const phaseColors: Record<Phase, { ring: string; bg: string; text: string }> = {
    work: { ring: 'stroke-red-500', bg: 'bg-red-50', text: 'text-red-600' },
    shortBreak: { ring: 'stroke-green-500', bg: 'bg-green-50', text: 'text-green-600' },
    longBreak: { ring: 'stroke-blue-500', bg: 'bg-blue-50', text: 'text-blue-600' },
  };

  const currentColors = phaseColors[phase];
  const goalPercent = dailyGoal > 0 ? Math.min(100, (completedToday / dailyGoal) * 100) : 0;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Pomodoro Timer: Boost Productivity with Focused Work Sessions',
      paragraphs: [
        'The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. It breaks work into focused intervals, traditionally 25 minutes long, separated by short breaks. After four consecutive work sessions, a longer break is taken. This simple yet powerful approach combats procrastination, reduces mental fatigue, and helps maintain high levels of concentration throughout the day.',
        'Our free online Pomodoro timer implements the classic technique with modern enhancements. You get a large, visually appealing circular timer that counts down each session, automatically transitioning between work periods and breaks. An audio notification alerts you when each interval ends, so you can stay focused without constantly watching the clock. The timer tracks your completed sessions and total focus time, giving you clear insights into your daily productivity.',
        'Customization is key to making the Pomodoro Technique work for you. You can adjust the work duration, short break length, and long break length to match your personal rhythm. Some people find that 50-minute work sessions with 10-minute breaks suit deep work better, while others prefer shorter 15-minute sprints. The daily goal feature lets you set a target number of pomodoros and track your progress with a visual progress bar, keeping you motivated throughout the day.',
        'Session history is stored locally in your browser, allowing you to review your productivity patterns over time. The keyboard shortcut (Space bar) makes it effortless to start and pause the timer without breaking your flow. Whether you are studying for exams, working on a project, writing, coding, or tackling household tasks, the Pomodoro Timer helps you work smarter by balancing intense focus with regular recovery breaks.'
      ],
      faq: [
        { q: 'What is the Pomodoro Technique and how does it work?', a: 'The Pomodoro Technique divides work into focused 25-minute intervals called "pomodoros," each followed by a 5-minute short break. After completing four pomodoros, you take a longer 15-minute break. This cycle helps maintain concentration and prevents burnout by ensuring regular rest periods.' },
        { q: 'Can I customize the timer durations?', a: 'Yes, all three intervals are fully customizable. You can set the work duration from 1 to 120 minutes, and adjust both the short break and long break durations independently. Your settings are saved automatically in your browser.' },
        { q: 'Does the timer make a sound when a session ends?', a: 'Yes, the timer plays an audio beep using the Web Audio API when each interval ends. This works in all modern browsers without requiring any additional plugins or downloads.' },
        { q: 'Will my progress be saved if I close the browser?', a: 'Your daily session count, total focus time, and settings are saved to your browser\'s local storage. When you reopen the page on the same day, your progress will be restored. History is kept for up to 30 days.' },
        { q: 'What keyboard shortcuts are available?', a: 'Press the Space bar to start or pause the timer. This lets you control the timer without using your mouse, which is especially useful when you want to minimize distractions during a work session.' }
      ]
    },
    it: {
      title: 'Timer Pomodoro: Aumenta la Produttività con Sessioni di Lavoro Concentrato',
      paragraphs: [
        'La Tecnica del Pomodoro è un metodo di gestione del tempo sviluppato da Francesco Cirillo alla fine degli anni \'80. Suddivide il lavoro in intervalli concentrati, tradizionalmente di 25 minuti, separati da brevi pause. Dopo quattro sessioni consecutive, si fa una pausa più lunga. Questo approccio semplice ma potente combatte la procrastinazione, riduce l\'affaticamento mentale e aiuta a mantenere alti livelli di concentrazione durante la giornata.',
        'Il nostro timer Pomodoro gratuito implementa la tecnica classica con miglioramenti moderni. Disponi di un grande timer circolare visivamente accattivante che conta alla rovescia ogni sessione, passando automaticamente tra periodi di lavoro e pause. Una notifica audio ti avvisa quando ogni intervallo termina, così puoi restare concentrato senza guardare costantemente l\'orologio. Il timer tiene traccia delle sessioni completate e del tempo totale di concentrazione.',
        'La personalizzazione è fondamentale per far funzionare la Tecnica del Pomodoro. Puoi regolare la durata del lavoro, la lunghezza della pausa breve e della pausa lunga per adattarle al tuo ritmo personale. Alcune persone preferiscono sessioni di lavoro di 50 minuti con pause di 10 minuti per il lavoro profondo, mentre altre preferiscono sprint più brevi di 15 minuti. La funzione obiettivo giornaliero ti permette di impostare un target e monitorare i progressi.',
        'La cronologia delle sessioni viene salvata localmente nel browser, permettendoti di rivedere i tuoi pattern di produttività nel tempo. La scorciatoia da tastiera (barra spaziatrice) rende semplice avviare e mettere in pausa il timer senza interrompere il flusso. Che tu stia studiando, lavorando a un progetto, scrivendo o programmando, il Timer Pomodoro ti aiuta a lavorare in modo più intelligente.'
      ],
      faq: [
        { q: 'Cos\'è la Tecnica del Pomodoro e come funziona?', a: 'La Tecnica del Pomodoro divide il lavoro in intervalli concentrati di 25 minuti chiamati "pomodori", ciascuno seguito da una pausa breve di 5 minuti. Dopo quattro pomodori, si fa una pausa lunga di 15 minuti. Questo ciclo mantiene la concentrazione e previene il burnout.' },
        { q: 'Posso personalizzare le durate del timer?', a: 'Sì, tutti e tre gli intervalli sono completamente personalizzabili. Puoi impostare la durata del lavoro da 1 a 120 minuti e regolare indipendentemente sia la pausa breve che quella lunga. Le impostazioni vengono salvate automaticamente nel browser.' },
        { q: 'Il timer emette un suono quando una sessione finisce?', a: 'Sì, il timer riproduce un beep audio usando la Web Audio API quando ogni intervallo termina. Funziona in tutti i browser moderni senza richiedere plugin aggiuntivi.' },
        { q: 'I miei progressi vengono salvati se chiudo il browser?', a: 'Il conteggio delle sessioni giornaliere, il tempo totale di concentrazione e le impostazioni vengono salvati nel localStorage del browser. Riaprendo la pagina lo stesso giorno, i progressi verranno ripristinati. La cronologia viene conservata fino a 30 giorni.' },
        { q: 'Quali scorciatoie da tastiera sono disponibili?', a: 'Premi la barra spaziatrice per avviare o mettere in pausa il timer. Questo ti permette di controllare il timer senza usare il mouse, utile quando vuoi minimizzare le distrazioni.' }
      ]
    },
    es: {
      title: 'Temporizador Pomodoro: Aumenta la Productividad con Sesiones de Trabajo Enfocado',
      paragraphs: [
        'La Técnica Pomodoro es un método de gestión del tiempo desarrollado por Francesco Cirillo a finales de los años 80. Divide el trabajo en intervalos concentrados, tradicionalmente de 25 minutos, separados por breves descansos. Después de cuatro sesiones consecutivas, se toma un descanso más largo. Este enfoque simple pero poderoso combate la procrastinación, reduce la fatiga mental y ayuda a mantener altos niveles de concentración durante el día.',
        'Nuestro temporizador Pomodoro gratuito implementa la técnica clásica con mejoras modernas. Dispones de un gran temporizador circular visualmente atractivo que cuenta regresivamente cada sesión, alternando automáticamente entre períodos de trabajo y descansos. Una notificación de audio te alerta cuando cada intervalo termina, para que puedas mantenerte enfocado sin mirar constantemente el reloj.',
        'La personalización es clave para que la Técnica Pomodoro funcione para ti. Puedes ajustar la duración del trabajo, la duración del descanso corto y del descanso largo según tu ritmo personal. Algunas personas prefieren sesiones de 50 minutos con descansos de 10 para trabajo profundo, mientras que otras prefieren sprints más cortos de 15 minutos. La función de meta diaria te permite establecer un objetivo y seguir tu progreso.',
        'El historial de sesiones se almacena localmente en tu navegador, permitiéndote revisar tus patrones de productividad. El atajo de teclado (barra espaciadora) facilita iniciar y pausar el temporizador sin interrumpir tu flujo. Ya sea que estés estudiando, trabajando en un proyecto, escribiendo o programando, el Temporizador Pomodoro te ayuda a trabajar de forma más inteligente.'
      ],
      faq: [
        { q: '¿Qué es la Técnica Pomodoro y cómo funciona?', a: 'La Técnica Pomodoro divide el trabajo en intervalos concentrados de 25 minutos llamados "pomodoros", cada uno seguido de un descanso corto de 5 minutos. Después de cuatro pomodoros, se toma un descanso largo de 15 minutos. Este ciclo mantiene la concentración y previene el agotamiento.' },
        { q: '¿Puedo personalizar las duraciones del temporizador?', a: 'Sí, los tres intervalos son completamente personalizables. Puedes configurar la duración del trabajo de 1 a 120 minutos y ajustar independientemente los descansos cortos y largos. La configuración se guarda automáticamente en tu navegador.' },
        { q: '¿El temporizador emite un sonido cuando una sesión termina?', a: 'Sí, el temporizador reproduce un pitido usando la Web Audio API cuando cada intervalo termina. Funciona en todos los navegadores modernos sin necesidad de complementos adicionales.' },
        { q: '¿Se guarda mi progreso si cierro el navegador?', a: 'El conteo de sesiones diarias, el tiempo total de enfoque y la configuración se guardan en el almacenamiento local del navegador. Al reabrir la página el mismo día, tu progreso se restaurará. El historial se conserva hasta 30 días.' },
        { q: '¿Qué atajos de teclado están disponibles?', a: 'Presiona la barra espaciadora para iniciar o pausar el temporizador. Esto te permite controlar el temporizador sin usar el ratón, útil cuando quieres minimizar las distracciones.' }
      ]
    },
    fr: {
      title: 'Minuteur Pomodoro : Boostez votre Productivité avec des Sessions de Travail Concentré',
      paragraphs: [
        'La Technique Pomodoro est une méthode de gestion du temps développée par Francesco Cirillo à la fin des années 1980. Elle découpe le travail en intervalles concentrés, traditionnellement de 25 minutes, séparés par de courtes pauses. Après quatre sessions consécutives, une pause plus longue est prise. Cette approche simple mais puissante combat la procrastination, réduit la fatigue mentale et aide à maintenir des niveaux élevés de concentration tout au long de la journée.',
        'Notre minuteur Pomodoro gratuit implémente la technique classique avec des améliorations modernes. Vous disposez d\'un grand minuteur circulaire visuellement attrayant qui décompte chaque session, alternant automatiquement entre les périodes de travail et les pauses. Une notification sonore vous alerte à la fin de chaque intervalle, vous permettant de rester concentré sans regarder constamment l\'horloge.',
        'La personnalisation est essentielle pour adapter la Technique Pomodoro à vos besoins. Vous pouvez ajuster la durée du travail, la durée de la pause courte et de la pause longue selon votre rythme personnel. Certaines personnes préfèrent des sessions de 50 minutes avec des pauses de 10 minutes pour le travail en profondeur. La fonction d\'objectif journalier vous permet de définir un nombre cible de pomodoros et de suivre votre progression.',
        'L\'historique des sessions est stocké localement dans votre navigateur, vous permettant de revoir vos tendances de productivité. Le raccourci clavier (barre d\'espace) rend facile le démarrage et la pause du minuteur sans interrompre votre flux. Que vous étudiiez, travailliez sur un projet, écriviez ou codiez, le Minuteur Pomodoro vous aide à travailler plus intelligemment.'
      ],
      faq: [
        { q: 'Qu\'est-ce que la Technique Pomodoro et comment fonctionne-t-elle ?', a: 'La Technique Pomodoro divise le travail en intervalles concentrés de 25 minutes appelés « pomodoros », chacun suivi d\'une courte pause de 5 minutes. Après quatre pomodoros, une pause longue de 15 minutes est prise. Ce cycle maintient la concentration et prévient l\'épuisement.' },
        { q: 'Puis-je personnaliser les durées du minuteur ?', a: 'Oui, les trois intervalles sont entièrement personnalisables. Vous pouvez régler la durée du travail de 1 à 120 minutes et ajuster indépendamment les pauses courtes et longues. Les paramètres sont sauvegardés automatiquement dans votre navigateur.' },
        { q: 'Le minuteur émet-il un son à la fin d\'une session ?', a: 'Oui, le minuteur joue un bip audio utilisant la Web Audio API à la fin de chaque intervalle. Cela fonctionne dans tous les navigateurs modernes sans nécessiter de plugins supplémentaires.' },
        { q: 'Ma progression est-elle sauvegardée si je ferme le navigateur ?', a: 'Le décompte des sessions quotidiennes, le temps total de concentration et les paramètres sont sauvegardés dans le stockage local du navigateur. En rouvrant la page le même jour, votre progression sera restaurée. L\'historique est conservé jusqu\'à 30 jours.' },
        { q: 'Quels raccourcis clavier sont disponibles ?', a: 'Appuyez sur la barre d\'espace pour démarrer ou mettre en pause le minuteur. Cela vous permet de contrôler le minuteur sans utiliser la souris, utile lorsque vous voulez minimiser les distractions.' }
      ]
    },
    de: {
      title: 'Pomodoro-Timer: Steigern Sie Ihre Produktivität mit Fokussierten Arbeitssitzungen',
      paragraphs: [
        'Die Pomodoro-Technik ist eine Zeitmanagement-Methode, die von Francesco Cirillo Ende der 1980er Jahre entwickelt wurde. Sie teilt die Arbeit in fokussierte Intervalle von traditionell 25 Minuten, getrennt durch kurze Pausen. Nach vier aufeinanderfolgenden Sitzungen wird eine längere Pause eingelegt. Dieser einfache aber wirkungsvolle Ansatz bekämpft Prokrastination, reduziert geistige Ermüdung und hilft, hohe Konzentrationsniveaus den ganzen Tag über aufrechtzuerhalten.',
        'Unser kostenloser Online-Pomodoro-Timer implementiert die klassische Technik mit modernen Verbesserungen. Sie erhalten einen großen, visuell ansprechenden kreisförmigen Timer, der jede Sitzung herunterzählt und automatisch zwischen Arbeitsphasen und Pausen wechselt. Eine Audio-Benachrichtigung alarmiert Sie am Ende jedes Intervalls, sodass Sie fokussiert bleiben können, ohne ständig auf die Uhr zu schauen.',
        'Anpassung ist der Schlüssel, damit die Pomodoro-Technik für Sie funktioniert. Sie können die Arbeitsdauer, die Länge der kurzen Pause und der langen Pause an Ihren persönlichen Rhythmus anpassen. Manche Menschen finden 50-Minuten-Arbeitssitzungen mit 10-Minuten-Pausen besser für Tiefenarbeit, während andere kürzere 15-Minuten-Sprints bevorzugen. Die Tagesziel-Funktion ermöglicht es Ihnen, ein Ziel festzulegen und Ihren Fortschritt zu verfolgen.',
        'Die Sitzungshistorie wird lokal in Ihrem Browser gespeichert, sodass Sie Ihre Produktivitätsmuster im Zeitverlauf überprüfen können. Die Tastenkombination (Leertaste) macht es mühelos, den Timer zu starten und zu pausieren, ohne Ihren Arbeitsfluss zu unterbrechen. Ob Sie studieren, an einem Projekt arbeiten, schreiben oder programmieren — der Pomodoro-Timer hilft Ihnen, intelligenter zu arbeiten.'
      ],
      faq: [
        { q: 'Was ist die Pomodoro-Technik und wie funktioniert sie?', a: 'Die Pomodoro-Technik teilt die Arbeit in fokussierte 25-Minuten-Intervalle namens "Pomodoros", jeweils gefolgt von einer 5-minütigen kurzen Pause. Nach vier Pomodoros wird eine 15-minütige lange Pause eingelegt. Dieser Zyklus erhält die Konzentration und beugt Burnout vor.' },
        { q: 'Kann ich die Timer-Dauern anpassen?', a: 'Ja, alle drei Intervalle sind vollständig anpassbar. Sie können die Arbeitsdauer von 1 bis 120 Minuten einstellen und sowohl die kurze als auch die lange Pause unabhängig voneinander anpassen. Ihre Einstellungen werden automatisch im Browser gespeichert.' },
        { q: 'Gibt der Timer ein Geräusch aus, wenn eine Sitzung endet?', a: 'Ja, der Timer spielt einen Audio-Piepton über die Web Audio API ab, wenn jedes Intervall endet. Dies funktioniert in allen modernen Browsern ohne zusätzliche Plugins.' },
        { q: 'Wird mein Fortschritt gespeichert, wenn ich den Browser schließe?', a: 'Die tägliche Sitzungsanzahl, die Gesamtfokuszeit und die Einstellungen werden im lokalen Speicher des Browsers gespeichert. Wenn Sie die Seite am selben Tag erneut öffnen, wird Ihr Fortschritt wiederhergestellt. Die Historie wird bis zu 30 Tage aufbewahrt.' },
        { q: 'Welche Tastenkombinationen sind verfügbar?', a: 'Drücken Sie die Leertaste, um den Timer zu starten oder zu pausieren. So können Sie den Timer ohne Maus steuern, was besonders nützlich ist, wenn Sie Ablenkungen minimieren möchten.' }
      ]
    },
    pt: {
      title: 'Timer Pomodoro: Aumente a Produtividade com Sessões de Trabalho Focado',
      paragraphs: [
        'A Técnica Pomodoro é um método de gestão do tempo desenvolvido por Francesco Cirillo no final dos anos 1980. Ela divide o trabalho em intervalos focados, tradicionalmente de 25 minutos, separados por pausas curtas. Após quatro sessões consecutivas, uma pausa mais longa é feita. Esta abordagem simples mas poderosa combate a procrastinação, reduz a fadiga mental e ajuda a manter altos níveis de concentração ao longo do dia.',
        'Nosso timer Pomodoro gratuito implementa a técnica clássica com melhorias modernas. Você tem um grande timer circular visualmente atraente que faz a contagem regressiva de cada sessão, alternando automaticamente entre períodos de trabalho e pausas. Uma notificação sonora alerta quando cada intervalo termina, para que você possa manter o foco sem olhar constantemente para o relógio.',
        'A personalização é fundamental para fazer a Técnica Pomodoro funcionar para você. Você pode ajustar a duração do trabalho, a duração da pausa curta e da pausa longa para corresponder ao seu ritmo pessoal. Algumas pessoas preferem sessões de 50 minutos com pausas de 10 para trabalho profundo, enquanto outras preferem sprints mais curtos de 15 minutos. A função de meta diária permite definir um objetivo e acompanhar seu progresso.',
        'O histórico de sessões é armazenado localmente no seu navegador, permitindo revisar seus padrões de produtividade ao longo do tempo. O atalho de teclado (barra de espaço) torna fácil iniciar e pausar o timer sem interromper seu fluxo. Seja estudando, trabalhando em um projeto, escrevendo ou programando, o Timer Pomodoro ajuda você a trabalhar de forma mais inteligente.'
      ],
      faq: [
        { q: 'O que é a Técnica Pomodoro e como funciona?', a: 'A Técnica Pomodoro divide o trabalho em intervalos focados de 25 minutos chamados "pomodoros", cada um seguido de uma pausa curta de 5 minutos. Após quatro pomodoros, uma pausa longa de 15 minutos é feita. Este ciclo mantém a concentração e previne o esgotamento.' },
        { q: 'Posso personalizar as durações do timer?', a: 'Sim, os três intervalos são totalmente personalizáveis. Você pode definir a duração do trabalho de 1 a 120 minutos e ajustar independentemente as pausas curtas e longas. Suas configurações são salvas automaticamente no navegador.' },
        { q: 'O timer emite um som quando uma sessão termina?', a: 'Sim, o timer reproduz um bipe usando a Web Audio API quando cada intervalo termina. Funciona em todos os navegadores modernos sem necessidade de plugins adicionais.' },
        { q: 'Meu progresso é salvo se eu fechar o navegador?', a: 'A contagem de sessões diárias, o tempo total de foco e as configurações são salvos no armazenamento local do navegador. Ao reabrir a página no mesmo dia, seu progresso será restaurado. O histórico é mantido por até 30 dias.' },
        { q: 'Quais atalhos de teclado estão disponíveis?', a: 'Pressione a barra de espaço para iniciar ou pausar o timer. Isso permite controlar o timer sem usar o mouse, útil quando você quer minimizar distrações durante uma sessão de trabalho.' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="pomodoro-timer" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Timer Display */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Phase Indicator */}
          <div className="text-center">
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${currentColors.bg} ${currentColors.text} transition-colors`}>
              {t(phase)}
            </span>
          </div>

          {/* Circular Timer */}
          <div className="flex justify-center">
            <div className="relative w-64 h-64">
              <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 280 280">
                {/* Background circle */}
                <circle cx="140" cy="140" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
                {/* Progress arc */}
                <circle
                  cx="140" cy="140" r={radius}
                  fill="none"
                  className={`${currentColors.ring} transition-all duration-1000 ease-linear`}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold font-mono text-gray-900">{formatTime(secondsLeft)}</span>
                <span className="text-sm text-gray-500 mt-1">#{pomodoroCount % 4 + 1} / 4</span>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleStartPause}
              className={`px-6 py-2.5 rounded-lg font-medium text-white transition-colors ${
                isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isRunning ? t('pause') : t('start')}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              {t('reset')}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400">{t('spaceToStartPause')}</p>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-green-600 font-mono">{completedToday}</div>
              <div className="text-xs text-gray-600 mt-1">{t('completedSessions')}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-blue-600 font-mono">{t(phase)}</div>
              <div className="text-xs text-gray-600 mt-1">{t('currentPhase')}</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-purple-600 font-mono">{totalFocusMin}</div>
              <div className="text-xs text-gray-600 mt-1">{t('totalFocusTime')} ({t('minutes')})</div>
            </div>
          </div>

          {/* Goal Progress */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{t('goalProgress')}</span>
              <span>{completedToday}/{dailyGoal} {t('pomodoros')}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>

          {/* Copy Stats */}
          <button
            onClick={handleCopyStats}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              copied
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {copied ? t('copied') : t('copyStats')}
          </button>
        </div>

        {/* Settings */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">{t('settings')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('workDuration')}</label>
              <input
                type="number"
                value={workMin}
                onChange={(e) => handleSettingsChange('workMin', parseInt(e.target.value) || 25)}
                min={1} max={120}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('shortBreakDuration')}</label>
              <input
                type="number"
                value={shortBreakMin}
                onChange={(e) => handleSettingsChange('shortBreakMin', parseInt(e.target.value) || 5)}
                min={1} max={120}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('longBreakDuration')}</label>
              <input
                type="number"
                value={longBreakMin}
                onChange={(e) => handleSettingsChange('longBreakMin', parseInt(e.target.value) || 15)}
                min={1} max={120}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('dailyGoal')}</label>
              <input
                type="number"
                value={dailyGoal}
                onChange={(e) => handleSettingsChange('dailyGoal', parseInt(e.target.value) || 8)}
                min={1} max={50}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* History */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">{t('history')}</h3>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
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
              {history.slice(0, 10).map((entry, i) => {
                const isToday = entry.date === getTodayStr();
                return (
                  <div
                    key={i}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      isToday ? 'bg-blue-50 text-gray-700' : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    <span className="font-medium">{isToday ? t('today') : entry.date}</span>
                    <span className="text-gray-400 ml-2">
                      {entry.completed} {t('pomodoros')} &middot; {entry.focusMinutes} {t('minutes')} {t('focusTime')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
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
