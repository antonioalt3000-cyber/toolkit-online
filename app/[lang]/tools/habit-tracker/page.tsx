'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type Frequency = 'daily' | 'weekly';

interface Habit {
  id: string;
  name: string;
  frequency: Frequency;
  completions: Record<string, boolean>; // date string -> completed
  createdAt: string;
}

const labels: Record<string, Record<Locale, string>> = {
  addHabit: { en: 'Add Habit', it: 'Aggiungi Abitudine', es: 'Agregar Hábito', fr: 'Ajouter une Habitude', de: 'Gewohnheit Hinzufügen', pt: 'Adicionar Hábito' },
  habitName: { en: 'Habit name', it: 'Nome abitudine', es: 'Nombre del hábito', fr: 'Nom de l\'habitude', de: 'Name der Gewohnheit', pt: 'Nome do hábito' },
  frequency: { en: 'Frequency', it: 'Frequenza', es: 'Frecuencia', fr: 'Fréquence', de: 'Häufigkeit', pt: 'Frequência' },
  daily: { en: 'Daily', it: 'Giornaliero', es: 'Diario', fr: 'Quotidien', de: 'Täglich', pt: 'Diário' },
  weekly: { en: 'Weekly', it: 'Settimanale', es: 'Semanal', fr: 'Hebdomadaire', de: 'Wöchentlich', pt: 'Semanal' },
  remove: { en: 'Remove', it: 'Rimuovi', es: 'Eliminar', fr: 'Supprimer', de: 'Entfernen', pt: 'Remover' },
  currentStreak: { en: 'Current Streak', it: 'Serie Attuale', es: 'Racha Actual', fr: 'Série Actuelle', de: 'Aktuelle Serie', pt: 'Sequência Atual' },
  longestStreak: { en: 'Longest Streak', it: 'Serie più Lunga', es: 'Racha más Larga', fr: 'Plus Longue Série', de: 'Längste Serie', pt: 'Maior Sequência' },
  completionRate: { en: 'Completion Rate', it: 'Tasso Completamento', es: 'Tasa de Completado', fr: 'Taux de Complétion', de: 'Abschlussrate', pt: 'Taxa de Conclusão' },
  stats: { en: 'Statistics', it: 'Statistiche', es: 'Estadísticas', fr: 'Statistiques', de: 'Statistiken', pt: 'Estatísticas' },
  last30Days: { en: 'Last 30 Days', it: 'Ultimi 30 Giorni', es: 'Últimos 30 Días', fr: '30 Derniers Jours', de: 'Letzte 30 Tage', pt: 'Últimos 30 Dias' },
  noHabits: { en: 'No habits yet. Add your first habit above!', it: 'Nessuna abitudine. Aggiungi la tua prima abitudine!', es: 'Sin hábitos aún. ¡Agrega tu primer hábito!', fr: 'Aucune habitude. Ajoutez votre première habitude !', de: 'Noch keine Gewohnheiten. Fügen Sie oben Ihre erste hinzu!', pt: 'Nenhum hábito ainda. Adicione seu primeiro hábito!' },
  maxReached: { en: 'Maximum 10 habits reached', it: 'Massimo 10 abitudini raggiunto', es: 'Máximo de 10 hábitos alcanzado', fr: 'Maximum de 10 habitudes atteint', de: 'Maximum von 10 Gewohnheiten erreicht', pt: 'Máximo de 10 hábitos atingido' },
  days: { en: 'days', it: 'giorni', es: 'días', fr: 'jours', de: 'Tage', pt: 'dias' },
  today: { en: 'Today', it: 'Oggi', es: 'Hoy', fr: "Aujourd'hui", de: 'Heute', pt: 'Hoje' },
  markComplete: { en: 'Mark Complete', it: 'Segna Completato', es: 'Marcar Completado', fr: 'Marquer Terminé', de: 'Als Erledigt Markieren', pt: 'Marcar Concluído' },
  completed: { en: 'Completed', it: 'Completato', es: 'Completado', fr: 'Terminé', de: 'Erledigt', pt: 'Concluído' },
};

const STORAGE_KEY = 'habit-tracker-data';
const MAX_HABITS = 10;

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.getDate().toString();
}

function computeCurrentStreak(habit: Habit): number {
  let streak = 0;
  const today = getTodayStr();
  // Start from today and go backwards
  for (let i = 0; i < 365; i++) {
    const dateStr = getDateStr(i);
    // Skip today if not completed yet (streak starts from yesterday or today)
    if (i === 0 && !habit.completions[dateStr]) {
      continue;
    }
    if (habit.completions[dateStr]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function computeLongestStreak(habit: Habit): number {
  // Collect all completion dates, sort them
  const dates = Object.keys(habit.completions).filter(d => habit.completions[d]).sort();
  if (dates.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + 'T12:00:00');
    const curr = new Date(dates[i] + 'T12:00:00');
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (Math.round(diff) === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}

function computeCompletionRate(habit: Habit): number {
  const createdDate = new Date(habit.createdAt + 'T12:00:00');
  const today = new Date(getTodayStr() + 'T12:00:00');
  const totalDays = Math.max(1, Math.round((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const daysToCheck = Math.min(totalDays, 30);
  let completedCount = 0;
  for (let i = 0; i < daysToCheck; i++) {
    const dateStr = getDateStr(i);
    if (habit.completions[dateStr]) completedCount++;
  }
  return Math.round((completedCount / daysToCheck) * 100);
}

export default function HabitTracker() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['habit-tracker'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [habits, setHabits] = useState<Habit[]>([]);
  const [newName, setNewName] = useState('');
  const [newFrequency, setNewFrequency] = useState<Frequency>('daily');
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (Array.isArray(data)) setHabits(data);
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  // Save to localStorage
  const saveHabits = useCallback((updated: Habit[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch { /* ignore */ }
  }, []);

  const handleAddHabit = () => {
    if (!newName.trim() || habits.length >= MAX_HABITS) return;
    const habit: Habit = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: newName.trim(),
      frequency: newFrequency,
      completions: {},
      createdAt: getTodayStr(),
    };
    const updated = [...habits, habit];
    setHabits(updated);
    saveHabits(updated);
    setNewName('');
  };

  const handleRemoveHabit = (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);
    saveHabits(updated);
  };

  const handleToggleCompletion = (id: string, dateStr: string) => {
    const updated = habits.map(h => {
      if (h.id !== id) return h;
      const newCompletions = { ...h.completions };
      if (newCompletions[dateStr]) {
        delete newCompletions[dateStr];
      } else {
        newCompletions[dateStr] = true;
      }
      return { ...h, completions: newCompletions };
    });
    setHabits(updated);
    saveHabits(updated);
  };

  // Generate last 30 days array
  const last30Days = Array.from({ length: 30 }, (_, i) => getDateStr(29 - i));
  const today = getTodayStr();

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Habit Tracker: Build Better Habits with Visual Tracking',
      paragraphs: [
        'Building good habits is one of the most effective ways to improve your life, but consistency is the hardest part. Research shows that tracking your habits significantly increases the likelihood of sticking with them. Our free Habit Tracker tool makes it easy to monitor your daily and weekly routines with a clean visual interface, streak counting, and a 30-day calendar heatmap that shows your progress at a glance.',
        'The science behind habit formation suggests that it takes an average of 66 days to form a new habit. During this period, visual feedback is crucial for maintaining motivation. The calendar heatmap provides an immediate visual representation of your consistency: green squares for completed days and gray for missed ones. This "don\'t break the chain" approach, popularized by Jerry Seinfeld, leverages the psychological power of streaks to keep you on track.',
        'Each habit you add can be set with a daily or weekly target frequency. The tool automatically calculates your current streak, longest streak, and overall completion rate. These statistics help you identify patterns in your behavior. You might discover that you\'re more consistent on weekdays or that certain habits are harder to maintain than others. This data-driven approach to self-improvement helps you make informed decisions about which habits to focus on.',
        'All your data is saved locally in your browser using localStorage, ensuring complete privacy. There is no account needed, no data sent to servers, and no limitations on usage. You can track up to 10 habits simultaneously, which research suggests is an optimal number to avoid overwhelm while still making meaningful progress across multiple areas of your life.'
      ],
      faq: [
        { q: 'How many habits can I track at once?', a: 'You can track up to 10 habits simultaneously. Research suggests focusing on a manageable number of habits rather than trying to change everything at once. Start with 2-3 key habits and add more as they become automatic.' },
        { q: 'Is my habit data private and secure?', a: 'Yes, all your data is stored exclusively in your browser\'s localStorage. Nothing is sent to any server. Your habit data stays on your device and is never shared with third parties.' },
        { q: 'What is the calendar heatmap and how do I read it?', a: 'The calendar heatmap shows the last 30 days as a grid of colored squares. Green squares indicate days where you completed the habit, while gray squares represent missed days. The darker the green, the more consistent you have been.' },
        { q: 'How are streaks calculated?', a: 'The current streak counts consecutive days from today (or yesterday if today is not yet completed) going backwards. The longest streak finds the maximum run of consecutive completed days in your entire history.' },
        { q: 'What happens if I clear my browser data?', a: 'Since habit data is stored in localStorage, clearing your browser data or cookies will also remove your habit tracking history. Consider noting important milestones externally as a backup.' }
      ]
    },
    it: {
      title: 'Habit Tracker: Costruisci Abitudini Migliori con il Tracciamento Visivo',
      paragraphs: [
        'Costruire buone abitudini è uno dei modi più efficaci per migliorare la propria vita, ma la costanza è la parte più difficile. La ricerca dimostra che tracciare le proprie abitudini aumenta significativamente la probabilità di mantenerle. Il nostro Habit Tracker gratuito rende facile monitorare le routine quotidiane e settimanali con un\'interfaccia visiva pulita, conteggio delle serie e una heatmap calendario di 30 giorni che mostra i progressi a colpo d\'occhio.',
        'La scienza della formazione delle abitudini suggerisce che servono in media 66 giorni per formare una nuova abitudine. Durante questo periodo, il feedback visivo è fondamentale per mantenere la motivazione. La heatmap del calendario fornisce una rappresentazione visiva immediata della tua costanza: quadrati verdi per i giorni completati e grigi per quelli mancati. Questo approccio "non spezzare la catena", reso popolare da Jerry Seinfeld, sfrutta il potere psicologico delle serie.',
        'Ogni abitudine aggiunta può essere impostata con frequenza giornaliera o settimanale. Lo strumento calcola automaticamente la serie attuale, la serie più lunga e il tasso di completamento complessivo. Queste statistiche aiutano a identificare pattern nel comportamento. Potresti scoprire di essere più costante nei giorni feriali o che certe abitudini sono più difficili da mantenere.',
        'Tutti i dati vengono salvati localmente nel browser usando localStorage, garantendo completa privacy. Non serve un account, nessun dato viene inviato a server e non ci sono limitazioni d\'uso. Puoi tracciare fino a 10 abitudini simultaneamente, un numero ottimale per evitare il sovraccarico pur facendo progressi significativi.'
      ],
      faq: [
        { q: 'Quante abitudini posso tracciare contemporaneamente?', a: 'Puoi tracciare fino a 10 abitudini simultaneamente. La ricerca suggerisce di concentrarsi su un numero gestibile piuttosto che cercare di cambiare tutto in una volta. Inizia con 2-3 abitudini chiave e aggiungine altre man mano che diventano automatiche.' },
        { q: 'I miei dati sulle abitudini sono privati e sicuri?', a: 'Sì, tutti i dati sono memorizzati esclusivamente nel localStorage del browser. Nulla viene inviato a nessun server. I dati restano sul tuo dispositivo e non vengono mai condivisi con terze parti.' },
        { q: 'Cos\'è la heatmap del calendario e come si legge?', a: 'La heatmap mostra gli ultimi 30 giorni come griglia di quadrati colorati. I quadrati verdi indicano i giorni in cui hai completato l\'abitudine, mentre quelli grigi rappresentano i giorni mancati.' },
        { q: 'Come vengono calcolate le serie?', a: 'La serie attuale conta i giorni consecutivi da oggi (o da ieri se oggi non è ancora completato) andando indietro. La serie più lunga trova la sequenza massima di giorni consecutivi completati nell\'intera cronologia.' },
        { q: 'Cosa succede se cancello i dati del browser?', a: 'Poiché i dati sono memorizzati nel localStorage, cancellare i dati del browser o i cookie rimuoverà anche la cronologia delle abitudini. Considera di annotare i traguardi importanti esternamente come backup.' }
      ]
    },
    es: {
      title: 'Rastreador de Hábitos: Construye Mejores Hábitos con Seguimiento Visual',
      paragraphs: [
        'Construir buenos hábitos es una de las formas más efectivas de mejorar tu vida, pero la constancia es la parte más difícil. La investigación muestra que rastrear tus hábitos aumenta significativamente la probabilidad de mantenerlos. Nuestro Rastreador de Hábitos gratuito facilita el monitoreo de rutinas diarias y semanales con una interfaz visual limpia, conteo de rachas y un mapa de calor de 30 días que muestra tu progreso de un vistazo.',
        'La ciencia detrás de la formación de hábitos sugiere que se necesitan un promedio de 66 días para formar un nuevo hábito. Durante este período, la retroalimentación visual es crucial para mantener la motivación. El mapa de calor del calendario proporciona una representación visual inmediata de tu constancia: cuadrados verdes para días completados y grises para los perdidos. Este enfoque popularizado por Jerry Seinfeld aprovecha el poder psicológico de las rachas.',
        'Cada hábito que agregas puede configurarse con frecuencia diaria o semanal. La herramienta calcula automáticamente tu racha actual, racha más larga y tasa de completado general. Estas estadísticas te ayudan a identificar patrones en tu comportamiento y tomar decisiones informadas sobre qué hábitos priorizar.',
        'Todos tus datos se guardan localmente en tu navegador usando localStorage, garantizando completa privacidad. No necesitas cuenta, no se envían datos a servidores y no hay limitaciones de uso. Puedes rastrear hasta 10 hábitos simultáneamente, un número óptimo para evitar la sobrecarga.'
      ],
      faq: [
        { q: '¿Cuántos hábitos puedo rastrear a la vez?', a: 'Puedes rastrear hasta 10 hábitos simultáneamente. La investigación sugiere enfocarse en un número manejable en lugar de intentar cambiar todo a la vez. Comienza con 2-3 hábitos clave y agrega más a medida que se vuelvan automáticos.' },
        { q: '¿Mis datos de hábitos son privados y seguros?', a: 'Sí, todos los datos se almacenan exclusivamente en el localStorage de tu navegador. Nada se envía a ningún servidor. Tus datos permanecen en tu dispositivo y nunca se comparten con terceros.' },
        { q: '¿Qué es el mapa de calor del calendario y cómo lo leo?', a: 'El mapa de calor muestra los últimos 30 días como una cuadrícula de cuadrados coloreados. Los cuadrados verdes indican días completados, mientras que los grises representan días perdidos.' },
        { q: '¿Cómo se calculan las rachas?', a: 'La racha actual cuenta días consecutivos desde hoy (o ayer si hoy no se ha completado) hacia atrás. La racha más larga encuentra la secuencia máxima de días consecutivos completados en todo tu historial.' },
        { q: '¿Qué pasa si borro los datos de mi navegador?', a: 'Como los datos se almacenan en localStorage, borrar los datos del navegador o las cookies también eliminará tu historial de hábitos. Considera anotar los hitos importantes externamente como respaldo.' }
      ]
    },
    fr: {
      title: 'Suivi d\'Habitudes : Construisez de Meilleures Habitudes avec un Suivi Visuel',
      paragraphs: [
        'Construire de bonnes habitudes est l\'un des moyens les plus efficaces d\'améliorer sa vie, mais la constance est la partie la plus difficile. La recherche montre que le suivi des habitudes augmente significativement la probabilité de les maintenir. Notre outil gratuit de suivi d\'habitudes facilite le suivi des routines quotidiennes et hebdomadaires avec une interface visuelle claire, le comptage des séries et une carte thermique de 30 jours montrant vos progrès en un coup d\'oeil.',
        'La science de la formation des habitudes suggère qu\'il faut en moyenne 66 jours pour former une nouvelle habitude. Pendant cette période, le retour visuel est crucial pour maintenir la motivation. La carte thermique du calendrier fournit une représentation visuelle immédiate de votre constance : carrés verts pour les jours complétés et gris pour les jours manqués. Cette approche popularisée par Jerry Seinfeld exploite le pouvoir psychologique des séries.',
        'Chaque habitude ajoutée peut être configurée avec une fréquence quotidienne ou hebdomadaire. L\'outil calcule automatiquement votre série actuelle, votre plus longue série et votre taux de complétion global. Ces statistiques vous aident à identifier des tendances dans votre comportement et à prendre des décisions éclairées.',
        'Toutes vos données sont sauvegardées localement dans votre navigateur via localStorage, garantissant une confidentialité totale. Aucun compte requis, aucune donnée envoyée à des serveurs. Vous pouvez suivre jusqu\'à 10 habitudes simultanément, un nombre optimal pour progresser sans surcharge.'
      ],
      faq: [
        { q: 'Combien d\'habitudes puis-je suivre en même temps ?', a: 'Vous pouvez suivre jusqu\'à 10 habitudes simultanément. La recherche suggère de se concentrer sur un nombre gérable plutôt que d\'essayer de tout changer d\'un coup. Commencez par 2-3 habitudes clés et ajoutez-en au fur et à mesure qu\'elles deviennent automatiques.' },
        { q: 'Mes données d\'habitudes sont-elles privées et sécurisées ?', a: 'Oui, toutes les données sont stockées exclusivement dans le localStorage de votre navigateur. Rien n\'est envoyé à aucun serveur. Vos données restent sur votre appareil et ne sont jamais partagées avec des tiers.' },
        { q: 'Qu\'est-ce que la carte thermique et comment la lire ?', a: 'La carte thermique montre les 30 derniers jours sous forme de grille de carrés colorés. Les carrés verts indiquent les jours où l\'habitude a été complétée, tandis que les gris représentent les jours manqués.' },
        { q: 'Comment les séries sont-elles calculées ?', a: 'La série actuelle compte les jours consécutifs depuis aujourd\'hui (ou hier si aujourd\'hui n\'est pas encore complété) en remontant. La plus longue série trouve la séquence maximale de jours consécutifs complétés dans tout votre historique.' },
        { q: 'Que se passe-t-il si j\'efface les données de mon navigateur ?', a: 'Puisque les données sont stockées dans le localStorage, effacer les données du navigateur supprimera également votre historique d\'habitudes. Pensez à noter les étapes importantes en externe comme sauvegarde.' }
      ]
    },
    de: {
      title: 'Gewohnheitstracker: Bessere Gewohnheiten mit Visuellem Tracking Aufbauen',
      paragraphs: [
        'Gute Gewohnheiten aufzubauen ist einer der effektivsten Wege, das Leben zu verbessern, aber Beständigkeit ist der schwierigste Teil. Forschung zeigt, dass das Tracken von Gewohnheiten die Wahrscheinlichkeit deutlich erhöht, sie beizubehalten. Unser kostenloser Gewohnheitstracker macht es einfach, tägliche und wöchentliche Routinen mit einer übersichtlichen visuellen Oberfläche, Serienzählung und einer 30-Tage-Kalender-Heatmap zu überwachen.',
        'Die Wissenschaft der Gewohnheitsbildung legt nahe, dass es durchschnittlich 66 Tage dauert, eine neue Gewohnheit zu bilden. Während dieser Zeit ist visuelles Feedback entscheidend für die Aufrechterhaltung der Motivation. Die Kalender-Heatmap bietet eine sofortige visuelle Darstellung Ihrer Beständigkeit: grüne Quadrate für erledigte Tage und graue für verpasste. Dieser von Jerry Seinfeld populär gemachte Ansatz nutzt die psychologische Kraft der Serien.',
        'Jede hinzugefügte Gewohnheit kann mit täglicher oder wöchentlicher Zielfrequenz eingestellt werden. Das Tool berechnet automatisch Ihre aktuelle Serie, längste Serie und Gesamtabschlussrate. Diese Statistiken helfen Ihnen, Muster in Ihrem Verhalten zu erkennen und fundierte Entscheidungen zu treffen.',
        'Alle Daten werden lokal in Ihrem Browser über localStorage gespeichert, was vollständige Privatsphäre gewährleistet. Kein Konto nötig, keine Daten an Server gesendet. Sie können bis zu 10 Gewohnheiten gleichzeitig verfolgen, eine optimale Anzahl für bedeutende Fortschritte ohne Überforderung.'
      ],
      faq: [
        { q: 'Wie viele Gewohnheiten kann ich gleichzeitig verfolgen?', a: 'Sie können bis zu 10 Gewohnheiten gleichzeitig verfolgen. Forschung empfiehlt, sich auf eine überschaubare Anzahl zu konzentrieren. Beginnen Sie mit 2-3 Schlüsselgewohnheiten und fügen Sie weitere hinzu, wenn diese automatisch werden.' },
        { q: 'Sind meine Gewohnheitsdaten privat und sicher?', a: 'Ja, alle Daten werden ausschließlich im localStorage Ihres Browsers gespeichert. Nichts wird an einen Server gesendet. Ihre Daten bleiben auf Ihrem Gerät und werden nie mit Dritten geteilt.' },
        { q: 'Was ist die Kalender-Heatmap und wie lese ich sie?', a: 'Die Heatmap zeigt die letzten 30 Tage als Raster farbiger Quadrate. Grüne Quadrate zeigen Tage an, an denen die Gewohnheit erledigt wurde, während graue verpasste Tage darstellen.' },
        { q: 'Wie werden Serien berechnet?', a: 'Die aktuelle Serie zählt aufeinanderfolgende Tage von heute (oder gestern, wenn heute noch nicht erledigt) rückwärts. Die längste Serie findet die maximale Folge aufeinanderfolgender erledigter Tage in Ihrer gesamten Historie.' },
        { q: 'Was passiert, wenn ich meine Browserdaten lösche?', a: 'Da die Daten im localStorage gespeichert werden, werden beim Löschen der Browserdaten auch Ihre Gewohnheitsdaten entfernt. Notieren Sie wichtige Meilensteine extern als Backup.' }
      ]
    },
    pt: {
      title: 'Rastreador de Hábitos: Construa Melhores Hábitos com Acompanhamento Visual',
      paragraphs: [
        'Construir bons hábitos é uma das formas mais eficazes de melhorar sua vida, mas a consistência é a parte mais difícil. Pesquisas mostram que rastrear seus hábitos aumenta significativamente a probabilidade de mantê-los. Nosso Rastreador de Hábitos gratuito facilita o monitoramento de rotinas diárias e semanais com uma interface visual limpa, contagem de sequências e um mapa de calor de 30 dias que mostra seu progresso de relance.',
        'A ciência por trás da formação de hábitos sugere que são necessários em média 66 dias para formar um novo hábito. Durante este período, o feedback visual é crucial para manter a motivação. O mapa de calor do calendário fornece uma representação visual imediata da sua consistência: quadrados verdes para dias completos e cinzas para os perdidos. Esta abordagem popularizada por Jerry Seinfeld aproveita o poder psicológico das sequências.',
        'Cada hábito adicionado pode ser configurado com frequência diária ou semanal. A ferramenta calcula automaticamente sua sequência atual, maior sequência e taxa de conclusão geral. Estas estatísticas ajudam a identificar padrões no seu comportamento e tomar decisões informadas.',
        'Todos os dados são salvos localmente no seu navegador usando localStorage, garantindo privacidade completa. Sem necessidade de conta, sem dados enviados a servidores. Você pode rastrear até 10 hábitos simultaneamente, um número ideal para progresso significativo sem sobrecarga.'
      ],
      faq: [
        { q: 'Quantos hábitos posso rastrear ao mesmo tempo?', a: 'Você pode rastrear até 10 hábitos simultaneamente. Pesquisas sugerem focar em um número gerenciável em vez de tentar mudar tudo de uma vez. Comece com 2-3 hábitos-chave e adicione mais à medida que se tornem automáticos.' },
        { q: 'Meus dados de hábitos são privados e seguros?', a: 'Sim, todos os dados são armazenados exclusivamente no localStorage do seu navegador. Nada é enviado a nenhum servidor. Seus dados permanecem no seu dispositivo e nunca são compartilhados com terceiros.' },
        { q: 'O que é o mapa de calor do calendário e como leio?', a: 'O mapa de calor mostra os últimos 30 dias como uma grade de quadrados coloridos. Quadrados verdes indicam dias em que o hábito foi concluído, enquanto cinzas representam dias perdidos.' },
        { q: 'Como as sequências são calculadas?', a: 'A sequência atual conta dias consecutivos de hoje (ou ontem se hoje ainda não foi concluído) para trás. A maior sequência encontra a sequência máxima de dias consecutivos concluídos em todo o seu histórico.' },
        { q: 'O que acontece se eu limpar os dados do navegador?', a: 'Como os dados são armazenados no localStorage, limpar os dados do navegador também removerá seu histórico de hábitos. Considere anotar marcos importantes externamente como backup.' }
      ]
    },
  };

  const seo = seoContent[lang];

  if (!loaded) return null;

  return (
    <ToolPageWrapper toolSlug="habit-tracker" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Add Habit Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">{t('addHabit')}</h3>
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs text-gray-500 mb-1">{t('habitName')}</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                placeholder={t('habitName')}
                maxLength={50}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="w-32">
              <label className="block text-xs text-gray-500 mb-1">{t('frequency')}</label>
              <select
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value as Frequency)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">{t('daily')}</option>
                <option value="weekly">{t('weekly')}</option>
              </select>
            </div>
            <button
              onClick={handleAddHabit}
              disabled={!newName.trim() || habits.length >= MAX_HABITS}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {t('addHabit')}
            </button>
          </div>
          {habits.length >= MAX_HABITS && (
            <p className="text-xs text-amber-600 mt-2">{t('maxReached')}</p>
          )}
        </div>

        {/* Habits List */}
        {habits.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center mb-6">
            <p className="text-gray-400">{t('noHabits')}</p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {habits.map((habit) => {
              const curStreak = computeCurrentStreak(habit);
              const longStreak = computeLongestStreak(habit);
              const rate = computeCompletionRate(habit);
              const isCompletedToday = !!habit.completions[today];

              return (
                <div key={habit.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{habit.name}</h3>
                      <span className="text-xs text-gray-400">{t(habit.frequency)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleCompletion(habit.id, today)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isCompletedToday
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        {isCompletedToday ? t('completed') : t('markComplete')}
                      </button>
                      <button
                        onClick={() => handleRemoveHabit(habit.id)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors px-2 py-1"
                      >
                        {t('remove')}
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-orange-600 font-mono">{curStreak}</div>
                      <div className="text-[10px] text-gray-600">{t('currentStreak')}</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-purple-600 font-mono">{longStreak}</div>
                      <div className="text-[10px] text-gray-600">{t('longestStreak')}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-blue-600 font-mono">{rate}%</div>
                      <div className="text-[10px] text-gray-600">{t('completionRate')}</div>
                    </div>
                  </div>

                  {/* Calendar Heatmap */}
                  <div>
                    <div className="text-xs text-gray-500 mb-2">{t('last30Days')}</div>
                    <div className="flex flex-wrap gap-1">
                      {last30Days.map((dateStr) => {
                        const isCompleted = !!habit.completions[dateStr];
                        const isToday = dateStr === today;
                        return (
                          <button
                            key={dateStr}
                            onClick={() => handleToggleCompletion(habit.id, dateStr)}
                            title={dateStr}
                            className={`w-7 h-7 rounded text-[9px] font-medium flex items-center justify-center transition-colors ${
                              isCompleted
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : isToday
                                  ? 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            {getDayLabel(dateStr)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
