'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type Phase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut';

interface Pattern {
  name: Record<Locale, string>;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
}

const PATTERNS: Pattern[] = [
  { name: { en: '4-7-8 Relaxation', it: 'Rilassamento 4-7-8', es: 'Relajación 4-7-8', fr: 'Relaxation 4-7-8', de: '4-7-8 Entspannung', pt: 'Relaxamento 4-7-8' }, inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
  { name: { en: 'Box Breathing (4-4-4-4)', it: 'Respirazione a Scatola (4-4-4-4)', es: 'Respiración Cuadrada (4-4-4-4)', fr: 'Respiration Carrée (4-4-4-4)', de: 'Box-Atmung (4-4-4-4)', pt: 'Respiração Quadrada (4-4-4-4)' }, inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
  { name: { en: 'Calm Breathing (4-4)', it: 'Respirazione Calma (4-4)', es: 'Respiración Calmada (4-4)', fr: 'Respiration Calme (4-4)', de: 'Ruhiges Atmen (4-4)', pt: 'Respiração Calma (4-4)' }, inhale: 4, holdIn: 0, exhale: 4, holdOut: 0 },
  { name: { en: 'Energizing (2-2)', it: 'Energizzante (2-2)', es: 'Energizante (2-2)', fr: 'Énergisant (2-2)', de: 'Belebend (2-2)', pt: 'Energizante (2-2)' }, inhale: 2, holdIn: 0, exhale: 2, holdOut: 0 },
];

const labels: Record<string, Record<Locale, string>> = {
  breatheIn: { en: 'Breathe In', it: 'Inspira', es: 'Inhala', fr: 'Inspirez', de: 'Einatmen', pt: 'Inspire' },
  hold: { en: 'Hold', it: 'Trattieni', es: 'Mantén', fr: 'Retenez', de: 'Halten', pt: 'Segure' },
  breatheOut: { en: 'Breathe Out', it: 'Espira', es: 'Exhala', fr: 'Expirez', de: 'Ausatmen', pt: 'Expire' },
  start: { en: 'Start', it: 'Avvia', es: 'Iniciar', fr: 'Démarrer', de: 'Starten', pt: 'Iniciar' },
  stop: { en: 'Stop', it: 'Ferma', es: 'Detener', fr: 'Arrêter', de: 'Stopp', pt: 'Parar' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  cycles: { en: 'Cycles', it: 'Cicli', es: 'Ciclos', fr: 'Cycles', de: 'Zyklen', pt: 'Ciclos' },
  sessionTime: { en: 'Session Time', it: 'Durata Sessione', es: 'Tiempo de Sesión', fr: 'Durée de Session', de: 'Sitzungsdauer', pt: 'Tempo de Sessão' },
  pattern: { en: 'Pattern', it: 'Modello', es: 'Patrón', fr: 'Modèle', de: 'Muster', pt: 'Padrão' },
  custom: { en: 'Custom', it: 'Personalizzato', es: 'Personalizado', fr: 'Personnalisé', de: 'Benutzerdefiniert', pt: 'Personalizado' },
  inhale: { en: 'Inhale (s)', it: 'Inspira (s)', es: 'Inhalar (s)', fr: 'Inspirer (s)', de: 'Einatmen (s)', pt: 'Inspirar (s)' },
  holdIn: { en: 'Hold In (s)', it: 'Trattieni (s)', es: 'Mantener (s)', fr: 'Retenir (s)', de: 'Halten (s)', pt: 'Segurar (s)' },
  exhale: { en: 'Exhale (s)', it: 'Espira (s)', es: 'Exhalar (s)', fr: 'Expirer (s)', de: 'Ausatmen (s)', pt: 'Expirar (s)' },
  holdOut: { en: 'Hold Out (s)', it: 'Pausa (s)', es: 'Pausa (s)', fr: 'Pause (s)', de: 'Pause (s)', pt: 'Pausa (s)' },
  sound: { en: 'Sound', it: 'Suono', es: 'Sonido', fr: 'Son', de: 'Ton', pt: 'Som' },
  totalSessions: { en: 'Total Sessions Today', it: 'Sessioni Totali Oggi', es: 'Sesiones Totales Hoy', fr: 'Sessions Totales Aujourd\'hui', de: 'Sitzungen Heute', pt: 'Sessões Totais Hoje' },
  totalMinutes: { en: 'Total Minutes Today', it: 'Minuti Totali Oggi', es: 'Minutos Totales Hoy', fr: 'Minutes Totales Aujourd\'hui', de: 'Minuten Heute', pt: 'Minutos Totais Hoje' },
  getReady: { en: 'Get Ready', it: 'Preparati', es: 'Prepárate', fr: 'Préparez-vous', de: 'Mach dich bereit', pt: 'Prepare-se' },
  stats: { en: 'Today\'s Stats', it: 'Statistiche di Oggi', es: 'Estadísticas de Hoy', fr: 'Statistiques du Jour', de: 'Heutige Statistiken', pt: 'Estatísticas de Hoje' },
};

const STORAGE_KEY = 'breathing-exercise-data';

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function BreathingExercise() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['breathing-exercise'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [selectedPattern, setSelectedPattern] = useState(0);
  const [customInhale, setCustomInhale] = useState(4);
  const [customHoldIn, setCustomHoldIn] = useState(4);
  const [customExhale, setCustomExhale] = useState(4);
  const [customHoldOut, setCustomHoldOut] = useState(4);
  const [isCustom, setIsCustom] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [phaseDuration, setPhaseDuration] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [totalSessionsToday, setTotalSessionsToday] = useState(0);
  const [totalMinutesToday, setTotalMinutesToday] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getPattern = useCallback(() => {
    if (isCustom) {
      return { inhale: customInhale, holdIn: customHoldIn, exhale: customExhale, holdOut: customHoldOut };
    }
    const p = PATTERNS[selectedPattern];
    return { inhale: p.inhale, holdIn: p.holdIn, exhale: p.exhale, holdOut: p.holdOut };
  }, [isCustom, customInhale, customHoldIn, customExhale, customHoldOut, selectedPattern]);

  // Load stats from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.date === getTodayStr()) {
          setTotalSessionsToday(data.sessions || 0);
          setTotalMinutesToday(data.minutes || 0);
        }
      }
    } catch { /* ignore */ }
  }, []);

  const saveStats = useCallback((sessions: number, minutes: number) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        date: getTodayStr(),
        sessions,
        minutes,
      }));
    } catch { /* ignore */ }
  }, []);

  const playTone = useCallback((freq: number, duration: number) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch { /* ignore */ }
  }, [soundEnabled]);

  const getNextPhase = useCallback((current: Phase): Phase => {
    const pat = getPattern();
    if (current === 'inhale') return pat.holdIn > 0 ? 'holdIn' : 'exhale';
    if (current === 'holdIn') return 'exhale';
    if (current === 'exhale') return pat.holdOut > 0 ? 'holdOut' : 'inhale';
    return 'inhale'; // holdOut -> inhale
  }, [getPattern]);

  const getPhaseDurationSec = useCallback((p: Phase): number => {
    const pat = getPattern();
    if (p === 'inhale') return pat.inhale;
    if (p === 'holdIn') return pat.holdIn;
    if (p === 'exhale') return pat.exhale;
    return pat.holdOut;
  }, [getPattern]);

  const phaseTonesMap: Record<Phase, number> = {
    inhale: 396,
    holdIn: 528,
    exhale: 432,
    holdOut: 528,
  };

  // Start exercise
  const handleStart = () => {
    const pat = getPattern();
    const firstPhase: Phase = 'inhale';
    const dur = pat.inhale;
    setPhase(firstPhase);
    setPhaseDuration(dur);
    setPhaseTimeLeft(dur);
    setCycleCount(0);
    setSessionSeconds(0);
    setIsRunning(true);
    playTone(phaseTonesMap[firstPhase], 0.5);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);

    // Save stats
    if (sessionSeconds > 5) {
      const newSessions = totalSessionsToday + 1;
      const newMinutes = totalMinutesToday + Math.round(sessionSeconds / 60);
      setTotalSessionsToday(newSessions);
      setTotalMinutesToday(newMinutes);
      saveStats(newSessions, newMinutes);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
    setPhase('inhale');
    setPhaseTimeLeft(0);
    setPhaseDuration(0);
    setCycleCount(0);
    setSessionSeconds(0);
  };

  // Session timer
  useEffect(() => {
    if (!isRunning) {
      if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
      return;
    }
    sessionIntervalRef.current = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
    }, 1000);
    return () => { if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current); };
  }, [isRunning]);

  // Phase timer
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setPhaseTimeLeft(prev => {
        if (prev <= 1) {
          // Move to next phase
          const next = getNextPhase(phase);
          const dur = getPhaseDurationSec(next);

          // If we loop back to inhale, increment cycle
          if (next === 'inhale') {
            setCycleCount(c => c + 1);
          }

          // Skip phases with 0 duration
          if (dur === 0) {
            const nextNext = getNextPhase(next);
            const durNext = getPhaseDurationSec(nextNext);
            if (nextNext === 'inhale') {
              setCycleCount(c => c + 1);
            }
            setPhase(nextNext);
            setPhaseDuration(durNext);
            playTone(phaseTonesMap[nextNext], 0.5);
            return durNext;
          }

          setPhase(next);
          setPhaseDuration(dur);
          playTone(phaseTonesMap[next], 0.5);
          return dur;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, phase, getNextPhase, getPhaseDurationSec, playTone]);

  // Animated circle scale
  const progress = phaseDuration > 0 ? (phaseDuration - phaseTimeLeft) / phaseDuration : 0;
  let scale = 0.5;
  if (phase === 'inhale') {
    scale = 0.5 + 0.5 * progress; // grow from 0.5 to 1.0
  } else if (phase === 'exhale') {
    scale = 1.0 - 0.5 * progress; // shrink from 1.0 to 0.5
  } else if (phase === 'holdIn') {
    scale = 1.0; // fully expanded
  } else {
    scale = 0.5; // fully contracted
  }

  const phaseColors: Record<Phase, { bg: string; text: string; circle: string }> = {
    inhale: { bg: 'bg-blue-50', text: 'text-blue-600', circle: '#3b82f6' },
    holdIn: { bg: 'bg-purple-50', text: 'text-purple-600', circle: '#8b5cf6' },
    exhale: { bg: 'bg-green-50', text: 'text-green-600', circle: '#22c55e' },
    holdOut: { bg: 'bg-purple-50', text: 'text-purple-600', circle: '#8b5cf6' },
  };

  const phaseLabel = (p: Phase) => {
    if (p === 'inhale') return t('breatheIn');
    if (p === 'holdIn' || p === 'holdOut') return t('hold');
    return t('breatheOut');
  };

  const currentColors = phaseColors[phase];

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Breathing Exercise: Guided Relaxation Timer for Stress Relief',
      paragraphs: [
        'Breathing exercises are one of the most effective, science-backed techniques for reducing stress, lowering anxiety, and improving overall well-being. Controlled breathing activates the parasympathetic nervous system, slowing the heart rate and promoting a state of calm. Our free online breathing exercise tool provides a visually guided experience that makes it easy to follow proven breathing patterns without any prior training.',
        'The tool features four popular breathing patterns used by therapists, military personnel, and meditation practitioners worldwide. The 4-7-8 Relaxation technique, developed by Dr. Andrew Weil, is particularly effective for falling asleep and calming the nervous system. Box Breathing (4-4-4-4), used by Navy SEALs, helps maintain composure under pressure. Calm Breathing (4-4) offers a gentle, beginner-friendly rhythm, while Energizing Breathing (2-2) provides a quick pick-me-up during afternoon slumps.',
        'A large animated circle guides your breathing visually — it expands as you inhale and contracts as you exhale. Color changes indicate each phase: blue for inhale, purple for hold, and green for exhale. An optional gentle tone powered by the Web Audio API marks phase transitions, helping you stay in rhythm even with your eyes closed. The cycle counter and session timer let you track your practice duration at a glance.',
        'You can also create custom breathing patterns by setting your own inhale, hold, exhale, and hold durations in seconds. Daily statistics including total sessions and minutes practiced are saved locally in your browser, allowing you to build a consistent breathing practice over time. Whether you use it for pre-sleep relaxation, mid-day stress relief, meditation warm-up, or anxiety management, this breathing exercise tool is your pocket wellness companion.'
      ],
      faq: [
        { q: 'What is the 4-7-8 breathing technique?', a: 'The 4-7-8 technique involves inhaling through your nose for 4 seconds, holding your breath for 7 seconds, and exhaling slowly through your mouth for 8 seconds. Developed by Dr. Andrew Weil, it activates the parasympathetic nervous system and is especially effective for reducing anxiety and helping you fall asleep.' },
        { q: 'What is Box Breathing and who uses it?', a: 'Box Breathing (also called square breathing) follows a 4-4-4-4 pattern: inhale for 4 seconds, hold for 4, exhale for 4, hold for 4. It is used by Navy SEALs, first responders, and athletes to maintain calm and focus under high-pressure situations.' },
        { q: 'How often should I practice breathing exercises?', a: 'For best results, practice 2-3 times daily for at least 3-5 minutes per session. Many people find it helpful to do a session upon waking, during a midday break, and before bed. Even a single 1-minute session can noticeably reduce acute stress.' },
        { q: 'Can I create my own breathing pattern?', a: 'Yes, the Custom pattern option lets you set individual durations in seconds for each phase: inhale, hold in, exhale, and hold out. Set any hold phase to 0 seconds to skip it entirely. This allows you to experiment and find the rhythm that works best for you.' },
        { q: 'Is the sound notification required?', a: 'No, the sound is optional and can be toggled on or off with the Sound button. The gentle tones use the Web Audio API and play directly in your browser with no downloads needed. The visual circle animation works perfectly on its own for silent sessions.' }
      ]
    },
    it: {
      title: 'Esercizio di Respirazione: Timer di Rilassamento Guidato per Ridurre lo Stress',
      paragraphs: [
        'Gli esercizi di respirazione sono una delle tecniche più efficaci e scientificamente provate per ridurre lo stress, abbassare l\'ansia e migliorare il benessere generale. La respirazione controllata attiva il sistema nervoso parasimpatico, rallentando il battito cardiaco e promuovendo uno stato di calma. Il nostro strumento gratuito di esercizi di respirazione online offre un\'esperienza guidata visivamente che rende facile seguire schemi di respirazione comprovati senza alcuna formazione precedente.',
        'Lo strumento presenta quattro modelli di respirazione popolari utilizzati da terapeuti, militari e praticanti di meditazione in tutto il mondo. La tecnica di Rilassamento 4-7-8, sviluppata dal Dr. Andrew Weil, è particolarmente efficace per addormentarsi e calmare il sistema nervoso. La Respirazione a Scatola (4-4-4-4), usata dai Navy SEALs, aiuta a mantenere la compostezza sotto pressione. La Respirazione Calma (4-4) offre un ritmo dolce adatto ai principianti, mentre la Respirazione Energizzante (2-2) fornisce una rapida ricarica durante i cali pomeridiani.',
        'Un grande cerchio animato guida visivamente la respirazione — si espande durante l\'inspirazione e si contrae durante l\'espirazione. I cambiamenti di colore indicano ogni fase: blu per inspirare, viola per trattenere, verde per espirare. Un tono opzionale delicato alimentato dalla Web Audio API segna le transizioni di fase, aiutandoti a mantenere il ritmo anche ad occhi chiusi. Il contatore di cicli e il timer della sessione ti permettono di monitorare la durata della pratica.',
        'Puoi anche creare modelli di respirazione personalizzati impostando le durate di inspirazione, trattenimento, espirazione e pausa in secondi. Le statistiche giornaliere, incluse sessioni totali e minuti praticati, vengono salvate localmente nel browser, permettendoti di costruire una pratica respiratoria costante. Che tu lo usi per il rilassamento prima di dormire, il sollievo dallo stress durante la giornata o la gestione dell\'ansia, questo strumento è il tuo compagno di benessere tascabile.'
      ],
      faq: [
        { q: 'Cos\'è la tecnica di respirazione 4-7-8?', a: 'La tecnica 4-7-8 consiste nell\'inspirare per 4 secondi, trattenere il respiro per 7 secondi ed espirare lentamente per 8 secondi. Sviluppata dal Dr. Andrew Weil, attiva il sistema nervoso parasimpatico ed è particolarmente efficace per ridurre l\'ansia e favorire il sonno.' },
        { q: 'Cos\'è la Respirazione a Scatola e chi la usa?', a: 'La Respirazione a Scatola segue uno schema 4-4-4-4: inspira per 4 secondi, trattieni per 4, espira per 4, trattieni per 4. È utilizzata dai Navy SEALs, dai primi soccorritori e dagli atleti per mantenere calma e concentrazione sotto pressione.' },
        { q: 'Quanto spesso dovrei praticare gli esercizi di respirazione?', a: 'Per i migliori risultati, pratica 2-3 volte al giorno per almeno 3-5 minuti per sessione. Molte persone trovano utile fare una sessione al risveglio, durante la pausa pranzo e prima di dormire. Anche una singola sessione di 1 minuto può ridurre notevolmente lo stress acuto.' },
        { q: 'Posso creare il mio modello di respirazione?', a: 'Sì, l\'opzione Personalizzato ti permette di impostare durate individuali in secondi per ogni fase: inspirazione, trattenimento, espirazione e pausa. Imposta qualsiasi fase di trattenimento a 0 secondi per saltarla. Questo ti permette di sperimentare e trovare il ritmo migliore per te.' },
        { q: 'Il suono di notifica è obbligatorio?', a: 'No, il suono è opzionale e può essere attivato o disattivato con il pulsante Suono. I toni delicati utilizzano la Web Audio API e vengono riprodotti direttamente nel browser senza download. L\'animazione visiva del cerchio funziona perfettamente da sola per sessioni silenziose.' }
      ]
    },
    es: {
      title: 'Ejercicio de Respiración: Temporizador de Relajación Guiada para Aliviar el Estrés',
      paragraphs: [
        'Los ejercicios de respiración son una de las técnicas más efectivas y respaldadas por la ciencia para reducir el estrés, disminuir la ansiedad y mejorar el bienestar general. La respiración controlada activa el sistema nervioso parasimpático, ralentizando el ritmo cardíaco y promoviendo un estado de calma. Nuestra herramienta gratuita de ejercicios de respiración en línea proporciona una experiencia guiada visualmente que facilita seguir patrones de respiración comprobados sin formación previa.',
        'La herramienta presenta cuatro patrones populares de respiración utilizados por terapeutas, personal militar y practicantes de meditación en todo el mundo. La técnica de Relajación 4-7-8, desarrollada por el Dr. Andrew Weil, es particularmente efectiva para conciliar el sueño y calmar el sistema nervioso. La Respiración Cuadrada (4-4-4-4), usada por los Navy SEALs, ayuda a mantener la compostura bajo presión. La Respiración Calmada (4-4) ofrece un ritmo suave para principiantes, mientras que la Respiración Energizante (2-2) proporciona un rápido impulso durante las caídas vespertinas.',
        'Un gran círculo animado guía tu respiración visualmente — se expande al inhalar y se contrae al exhalar. Los cambios de color indican cada fase: azul para inhalar, púrpura para sostener y verde para exhalar. Un tono suave opcional impulsado por la Web Audio API marca las transiciones de fase, ayudándote a mantener el ritmo incluso con los ojos cerrados. El contador de ciclos y el temporizador de sesión te permiten rastrear la duración de tu práctica.',
        'También puedes crear patrones personalizados estableciendo tus propias duraciones de inhalación, retención, exhalación y pausa en segundos. Las estadísticas diarias, incluyendo sesiones totales y minutos practicados, se guardan localmente en tu navegador, permitiéndote construir una práctica de respiración consistente. Ya sea para relajación antes de dormir, alivio del estrés o gestión de la ansiedad, esta herramienta es tu compañero de bienestar de bolsillo.'
      ],
      faq: [
        { q: '¿Qué es la técnica de respiración 4-7-8?', a: 'La técnica 4-7-8 consiste en inhalar por 4 segundos, mantener la respiración por 7 segundos y exhalar lentamente por 8 segundos. Desarrollada por el Dr. Andrew Weil, activa el sistema nervioso parasimpático y es especialmente efectiva para reducir la ansiedad y ayudar a conciliar el sueño.' },
        { q: '¿Qué es la Respiración Cuadrada y quién la usa?', a: 'La Respiración Cuadrada sigue un patrón 4-4-4-4: inhalar por 4 segundos, sostener por 4, exhalar por 4, sostener por 4. Es utilizada por los Navy SEALs, socorristas y atletas para mantener la calma y el enfoque bajo presión.' },
        { q: '¿Con qué frecuencia debo practicar ejercicios de respiración?', a: 'Para mejores resultados, practica 2-3 veces al día durante al menos 3-5 minutos por sesión. Muchas personas encuentran útil hacer una sesión al despertar, durante el descanso del mediodía y antes de dormir. Incluso una sesión de 1 minuto puede reducir notablemente el estrés agudo.' },
        { q: '¿Puedo crear mi propio patrón de respiración?', a: 'Sí, la opción Personalizado te permite establecer duraciones individuales en segundos para cada fase: inhalación, retención, exhalación y pausa. Establece cualquier fase de retención en 0 segundos para omitirla. Esto te permite experimentar y encontrar el ritmo que mejor funcione para ti.' },
        { q: '¿Es obligatoria la notificación de sonido?', a: 'No, el sonido es opcional y puede activarse o desactivarse con el botón Sonido. Los tonos suaves usan la Web Audio API y se reproducen directamente en el navegador sin descargas. La animación visual del círculo funciona perfectamente por sí sola para sesiones silenciosas.' }
      ]
    },
    fr: {
      title: 'Exercice de Respiration : Minuteur de Relaxation Guidée pour Soulager le Stress',
      paragraphs: [
        'Les exercices de respiration sont l\'une des techniques les plus efficaces et scientifiquement prouvées pour réduire le stress, diminuer l\'anxiété et améliorer le bien-être général. La respiration contrôlée active le système nerveux parasympathique, ralentit le rythme cardiaque et favorise un état de calme. Notre outil gratuit d\'exercices de respiration en ligne offre une expérience guidée visuellement qui facilite le suivi de schémas de respiration éprouvés sans formation préalable.',
        'L\'outil propose quatre modèles de respiration populaires utilisés par les thérapeutes, le personnel militaire et les pratiquants de méditation dans le monde entier. La technique de Relaxation 4-7-8, développée par le Dr Andrew Weil, est particulièrement efficace pour s\'endormir et calmer le système nerveux. La Respiration Carrée (4-4-4-4), utilisée par les Navy SEALs, aide à garder son sang-froid sous pression. La Respiration Calme (4-4) offre un rythme doux adapté aux débutants, tandis que la Respiration Énergisante (2-2) fournit un coup de fouet rapide pendant les baisses de régime de l\'après-midi.',
        'Un grand cercle animé guide visuellement votre respiration — il s\'agrandit à l\'inspiration et se contracte à l\'expiration. Les changements de couleur indiquent chaque phase : bleu pour inspirer, violet pour retenir et vert pour expirer. Un ton doux optionnel alimenté par la Web Audio API marque les transitions de phase, vous aidant à rester dans le rythme même les yeux fermés. Le compteur de cycles et le minuteur de session vous permettent de suivre la durée de votre pratique.',
        'Vous pouvez également créer des modèles de respiration personnalisés en définissant vos propres durées d\'inspiration, de rétention, d\'expiration et de pause en secondes. Les statistiques quotidiennes, y compris le nombre total de sessions et les minutes pratiquées, sont enregistrées localement dans votre navigateur, vous permettant de construire une pratique respiratoire régulière. Que vous l\'utilisiez pour la relaxation avant le sommeil, le soulagement du stress ou la gestion de l\'anxiété, cet outil est votre compagnon de bien-être de poche.'
      ],
      faq: [
        { q: 'Qu\'est-ce que la technique de respiration 4-7-8 ?', a: 'La technique 4-7-8 consiste à inspirer pendant 4 secondes, retenir sa respiration pendant 7 secondes et expirer lentement pendant 8 secondes. Développée par le Dr Andrew Weil, elle active le système nerveux parasympathique et est particulièrement efficace pour réduire l\'anxiété et aider à s\'endormir.' },
        { q: 'Qu\'est-ce que la Respiration Carrée et qui l\'utilise ?', a: 'La Respiration Carrée suit un schéma 4-4-4-4 : inspirer pendant 4 secondes, retenir pendant 4, expirer pendant 4, retenir pendant 4. Elle est utilisée par les Navy SEALs, les premiers intervenants et les athlètes pour maintenir le calme et la concentration sous pression.' },
        { q: 'À quelle fréquence dois-je pratiquer les exercices de respiration ?', a: 'Pour de meilleurs résultats, pratiquez 2 à 3 fois par jour pendant au moins 3 à 5 minutes par session. Beaucoup de gens trouvent utile de faire une session au réveil, pendant la pause du midi et avant de dormir. Même une seule session d\'1 minute peut réduire notablement le stress aigu.' },
        { q: 'Puis-je créer mon propre modèle de respiration ?', a: 'Oui, l\'option Personnalisé vous permet de définir des durées individuelles en secondes pour chaque phase : inspiration, rétention, expiration et pause. Définissez toute phase de rétention à 0 seconde pour la sauter. Cela vous permet d\'expérimenter et de trouver le rythme qui vous convient le mieux.' },
        { q: 'La notification sonore est-elle obligatoire ?', a: 'Non, le son est optionnel et peut être activé ou désactivé avec le bouton Son. Les tons doux utilisent la Web Audio API et sont joués directement dans votre navigateur sans téléchargement. L\'animation visuelle du cercle fonctionne parfaitement seule pour des sessions silencieuses.' }
      ]
    },
    de: {
      title: 'Atemübung: Geführter Entspannungs-Timer zur Stressreduzierung',
      paragraphs: [
        'Atemübungen gehören zu den effektivsten, wissenschaftlich fundierten Techniken zur Stressreduzierung, Angstminderung und Verbesserung des allgemeinen Wohlbefindens. Kontrolliertes Atmen aktiviert das parasympathische Nervensystem, verlangsamt die Herzfrequenz und fördert einen Zustand der Ruhe. Unser kostenloses Online-Tool für Atemübungen bietet ein visuell geführtes Erlebnis, das es einfach macht, bewährten Atemmustern ohne Vorkenntnisse zu folgen.',
        'Das Tool bietet vier beliebte Atemmuster, die von Therapeuten, Militärpersonal und Meditationspraktizierenden weltweit verwendet werden. Die 4-7-8 Entspannungstechnik, entwickelt von Dr. Andrew Weil, ist besonders wirksam zum Einschlafen und Beruhigen des Nervensystems. Die Box-Atmung (4-4-4-4), die von Navy SEALs verwendet wird, hilft, unter Druck die Fassung zu bewahren. Ruhiges Atmen (4-4) bietet einen sanften, anfängerfreundlichen Rhythmus, während Belebendes Atmen (2-2) einen schnellen Energieschub am Nachmittag liefert.',
        'Ein großer animierter Kreis führt visuell durch die Atmung — er dehnt sich beim Einatmen aus und zieht sich beim Ausatmen zusammen. Farbwechsel zeigen jede Phase an: Blau zum Einatmen, Lila zum Halten und Grün zum Ausatmen. Ein optionaler sanfter Ton, der von der Web Audio API angetrieben wird, markiert Phasenübergänge und hilft Ihnen, im Rhythmus zu bleiben, auch mit geschlossenen Augen. Der Zykluszähler und der Sitzungstimer ermöglichen es Ihnen, Ihre Übungsdauer im Blick zu behalten.',
        'Sie können auch benutzerdefinierte Atemmuster erstellen, indem Sie Ihre eigenen Einatem-, Halte-, Ausatem- und Pausendauern in Sekunden festlegen. Tägliche Statistiken einschließlich Gesamtsitzungen und geübter Minuten werden lokal in Ihrem Browser gespeichert, sodass Sie eine konsistente Atempraxis aufbauen können. Ob Sie es zur Entspannung vor dem Schlaf, zur Stressreduzierung, zum Aufwärmen für die Meditation oder zum Angstmanagement verwenden — dieses Tool ist Ihr Wellness-Begleiter für unterwegs.'
      ],
      faq: [
        { q: 'Was ist die 4-7-8 Atemtechnik?', a: 'Die 4-7-8 Technik besteht aus 4 Sekunden Einatmen, 7 Sekunden Anhalten und 8 Sekunden langsamem Ausatmen. Von Dr. Andrew Weil entwickelt, aktiviert sie das parasympathische Nervensystem und ist besonders wirksam zur Angstreduktion und zum Einschlafen.' },
        { q: 'Was ist Box-Atmung und wer verwendet sie?', a: 'Box-Atmung (auch Quadratatmung) folgt einem 4-4-4-4 Muster: 4 Sekunden einatmen, 4 halten, 4 ausatmen, 4 halten. Sie wird von Navy SEALs, Ersthelfer und Athleten verwendet, um unter Hochdrucksituationen Ruhe und Fokus zu bewahren.' },
        { q: 'Wie oft sollte ich Atemübungen praktizieren?', a: 'Für beste Ergebnisse üben Sie 2-3 Mal täglich für mindestens 3-5 Minuten pro Sitzung. Viele Menschen finden es hilfreich, eine Sitzung beim Aufwachen, in der Mittagspause und vor dem Schlafengehen durchzuführen. Selbst eine einzelne 1-Minuten-Sitzung kann akuten Stress spürbar reduzieren.' },
        { q: 'Kann ich mein eigenes Atemmuster erstellen?', a: 'Ja, die benutzerdefinierte Option ermöglicht es Ihnen, individuelle Dauern in Sekunden für jede Phase festzulegen: Einatmen, Anhalten, Ausatmen und Pause. Setzen Sie jede Haltephase auf 0 Sekunden, um sie zu überspringen. So können Sie experimentieren und den für Sie besten Rhythmus finden.' },
        { q: 'Ist die Tonbenachrichtigung erforderlich?', a: 'Nein, der Ton ist optional und kann mit der Ton-Schaltfläche ein- oder ausgeschaltet werden. Die sanften Töne verwenden die Web Audio API und werden direkt im Browser ohne Downloads abgespielt. Die visuelle Kreisanimation funktioniert allein perfekt für stille Sitzungen.' }
      ]
    },
    pt: {
      title: 'Exercício de Respiração: Temporizador de Relaxamento Guiado para Alívio do Estresse',
      paragraphs: [
        'Exercícios de respiração são uma das técnicas mais eficazes e comprovadas cientificamente para reduzir o estresse, diminuir a ansiedade e melhorar o bem-estar geral. A respiração controlada ativa o sistema nervoso parassimpático, desacelerando os batimentos cardíacos e promovendo um estado de calma. Nossa ferramenta gratuita de exercícios de respiração online proporciona uma experiência guiada visualmente que facilita seguir padrões de respiração comprovados sem treinamento prévio.',
        'A ferramenta apresenta quatro padrões populares de respiração usados por terapeutas, militares e praticantes de meditação em todo o mundo. A técnica de Relaxamento 4-7-8, desenvolvida pelo Dr. Andrew Weil, é particularmente eficaz para adormecer e acalmar o sistema nervoso. A Respiração Quadrada (4-4-4-4), usada pelos Navy SEALs, ajuda a manter a compostura sob pressão. A Respiração Calma (4-4) oferece um ritmo suave para iniciantes, enquanto a Respiração Energizante (2-2) fornece um impulso rápido durante as quedas da tarde.',
        'Um grande círculo animado guia sua respiração visualmente — ele se expande ao inspirar e se contrai ao expirar. Mudanças de cor indicam cada fase: azul para inspirar, roxo para segurar e verde para expirar. Um tom suave opcional alimentado pela Web Audio API marca as transições de fase, ajudando você a manter o ritmo mesmo com os olhos fechados. O contador de ciclos e o temporizador de sessão permitem acompanhar a duração da sua prática.',
        'Você também pode criar padrões de respiração personalizados definindo suas próprias durações de inspiração, retenção, expiração e pausa em segundos. Estatísticas diárias, incluindo sessões totais e minutos praticados, são salvas localmente no seu navegador, permitindo construir uma prática respiratória consistente. Seja para relaxamento antes de dormir, alívio do estresse, aquecimento para meditação ou gerenciamento de ansiedade, esta ferramenta é seu companheiro de bem-estar de bolso.'
      ],
      faq: [
        { q: 'O que é a técnica de respiração 4-7-8?', a: 'A técnica 4-7-8 consiste em inspirar por 4 segundos, segurar a respiração por 7 segundos e expirar lentamente por 8 segundos. Desenvolvida pelo Dr. Andrew Weil, ativa o sistema nervoso parassimpático e é especialmente eficaz para reduzir a ansiedade e ajudar a adormecer.' },
        { q: 'O que é Respiração Quadrada e quem a usa?', a: 'A Respiração Quadrada segue um padrão 4-4-4-4: inspirar por 4 segundos, segurar por 4, expirar por 4, segurar por 4. É usada por Navy SEALs, socorristas e atletas para manter a calma e o foco sob situações de alta pressão.' },
        { q: 'Com que frequência devo praticar exercícios de respiração?', a: 'Para melhores resultados, pratique 2-3 vezes por dia durante pelo menos 3-5 minutos por sessão. Muitas pessoas acham útil fazer uma sessão ao acordar, durante o intervalo do meio-dia e antes de dormir. Mesmo uma única sessão de 1 minuto pode reduzir notavelmente o estresse agudo.' },
        { q: 'Posso criar meu próprio padrão de respiração?', a: 'Sim, a opção Personalizado permite definir durações individuais em segundos para cada fase: inspiração, retenção, expiração e pausa. Defina qualquer fase de retenção como 0 segundos para pulá-la. Isso permite experimentar e encontrar o ritmo que melhor funciona para você.' },
        { q: 'A notificação sonora é obrigatória?', a: 'Não, o som é opcional e pode ser ativado ou desativado com o botão Som. Os tons suaves usam a Web Audio API e são reproduzidos diretamente no navegador sem downloads. A animação visual do círculo funciona perfeitamente sozinha para sessões silenciosas.' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="breathing-exercise" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Main breathing area */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Phase indicator */}
          <div className="text-center">
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${currentColors.bg} ${currentColors.text} transition-colors`}>
              {isRunning ? phaseLabel(phase) : t('getReady')}
            </span>
          </div>

          {/* Animated breathing circle */}
          <div className="flex justify-center">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div
                className="rounded-full transition-all duration-1000 ease-in-out"
                style={{
                  width: `${scale * 240}px`,
                  height: `${scale * 240}px`,
                  background: `radial-gradient(circle, ${currentColors.circle}40, ${currentColors.circle}20)`,
                  border: `3px solid ${currentColors.circle}`,
                  boxShadow: `0 0 ${scale * 40}px ${currentColors.circle}30`,
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold font-mono text-gray-900">
                  {isRunning ? phaseTimeLeft : '--'}
                </span>
                <span className="text-sm text-gray-500 mt-1 font-medium">
                  {isRunning ? phaseLabel(phase) : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3 justify-center">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {t('start')}
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="px-6 py-2.5 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                {t('stop')}
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              {t('reset')}
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                soundEnabled
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}
            >
              {t('sound')} {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-blue-600 font-mono">{cycleCount}</div>
              <div className="text-xs text-gray-600 mt-1">{t('cycles')}</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-green-600 font-mono">{formatDuration(sessionSeconds)}</div>
              <div className="text-xs text-gray-600 mt-1">{t('sessionTime')}</div>
            </div>
          </div>
        </div>

        {/* Pattern Selection */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">{t('pattern')}</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {PATTERNS.map((p, i) => (
              <button
                key={i}
                onClick={() => { setSelectedPattern(i); setIsCustom(false); }}
                disabled={isRunning}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !isCustom && selectedPattern === i
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {p.name[lang]}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsCustom(true)}
            disabled={isRunning}
            className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-4 ${
              isCustom
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {t('custom')}
          </button>

          {isCustom && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('inhale')}</label>
                <input
                  type="number"
                  value={customInhale}
                  onChange={(e) => setCustomInhale(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                  min={1} max={30}
                  disabled={isRunning}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('holdIn')}</label>
                <input
                  type="number"
                  value={customHoldIn}
                  onChange={(e) => setCustomHoldIn(Math.max(0, Math.min(30, parseInt(e.target.value) || 0)))}
                  min={0} max={30}
                  disabled={isRunning}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('exhale')}</label>
                <input
                  type="number"
                  value={customExhale}
                  onChange={(e) => setCustomExhale(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                  min={1} max={30}
                  disabled={isRunning}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('holdOut')}</label>
                <input
                  type="number"
                  value={customHoldOut}
                  onChange={(e) => setCustomHoldOut(Math.max(0, Math.min(30, parseInt(e.target.value) || 0)))}
                  min={0} max={30}
                  disabled={isRunning}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Daily Stats */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">{t('stats')}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-purple-600 font-mono">{totalSessionsToday}</div>
              <div className="text-xs text-gray-600 mt-1">{t('totalSessions')}</div>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-indigo-600 font-mono">{totalMinutesToday}</div>
              <div className="text-xs text-gray-600 mt-1">{t('totalMinutes')}</div>
            </div>
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
