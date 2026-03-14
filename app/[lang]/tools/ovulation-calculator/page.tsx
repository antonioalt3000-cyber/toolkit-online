'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type HistoryEntry = { lastPeriod: string; cycleLength: number; ovulationDate: string; fertileStart: string; fertileEnd: string };

export default function OvulationCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['ovulation-calculator'][lang];

  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const labels = {
    lastPeriod: { en: 'First Day of Last Period', it: 'Primo Giorno dell\'Ultimo Ciclo', es: 'Primer Día de la Última Regla', fr: 'Premier Jour des Dernières Règles', de: 'Erster Tag der Letzten Periode', pt: 'Primeiro Dia da Última Menstruação' },
    cycleLength: { en: 'Average Cycle Length (days)', it: 'Durata Media del Ciclo (giorni)', es: 'Duración Media del Ciclo (días)', fr: 'Durée Moyenne du Cycle (jours)', de: 'Durchschnittliche Zykluslänge (Tage)', pt: 'Duração Média do Ciclo (dias)' },
    ovulationDate: { en: 'Estimated Ovulation Date', it: 'Data Stimata di Ovulazione', es: 'Fecha Estimada de Ovulación', fr: 'Date Estimée d\'Ovulation', de: 'Geschätzter Eisprungtermin', pt: 'Data Estimada de Ovulação' },
    fertileWindow: { en: 'Fertile Window', it: 'Finestra Fertile', es: 'Ventana Fértil', fr: 'Fenêtre de Fertilité', de: 'Fruchtbares Fenster', pt: 'Janela Fértil' },
    nextPeriod: { en: 'Next Period Expected', it: 'Prossimo Ciclo Previsto', es: 'Próxima Regla Esperada', fr: 'Prochaines Règles Prévues', de: 'Nächste Periode Erwartet', pt: 'Próxima Menstruação Prevista' },
    fertileStart: { en: 'Fertile Start', it: 'Inizio Fertilità', es: 'Inicio Fértil', fr: 'Début Fertile', de: 'Fruchtbarkeit Beginn', pt: 'Início Fértil' },
    fertileEnd: { en: 'Fertile End', it: 'Fine Fertilità', es: 'Fin Fértil', fr: 'Fin Fertile', de: 'Fruchtbarkeit Ende', pt: 'Fim Fértil' },
    cycleTimeline: { en: 'Cycle Timeline', it: 'Cronologia del Ciclo', es: 'Cronología del Ciclo', fr: 'Chronologie du Cycle', de: 'Zyklus-Zeitleiste', pt: 'Cronologia do Ciclo' },
    menstruation: { en: 'Menstruation', it: 'Mestruazione', es: 'Menstruación', fr: 'Menstruation', de: 'Menstruation', pt: 'Menstruação' },
    follicular: { en: 'Follicular Phase', it: 'Fase Follicolare', es: 'Fase Folicular', fr: 'Phase Folliculaire', de: 'Follikelphase', pt: 'Fase Folicular' },
    ovulation: { en: 'Ovulation', it: 'Ovulazione', es: 'Ovulación', fr: 'Ovulation', de: 'Eisprung', pt: 'Ovulação' },
    luteal: { en: 'Luteal Phase', it: 'Fase Luteale', es: 'Fase Lútea', fr: 'Phase Lutéale', de: 'Lutealphase', pt: 'Fase Lútea' },
    fertile: { en: 'Fertile', it: 'Fertile', es: 'Fértil', fr: 'Fertile', de: 'Fruchtbar', pt: 'Fértil' },
    days: { en: 'days', it: 'giorni', es: 'días', fr: 'jours', de: 'Tage', pt: 'dias' },
    to: { en: 'to', it: 'a', es: 'a', fr: 'au', de: 'bis', pt: 'a' },
    calculate: { en: 'Calculate', it: 'Calcola', es: 'Calcular', fr: 'Calculer', de: 'Berechnen', pt: 'Calcular' },
    reset: { en: 'Reset', it: 'Reset', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Reiniciar' },
    copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
    disclaimer: { en: 'This calculator provides estimates only and should not be used as a form of birth control. Consult your healthcare provider for medical advice.', it: 'Questo calcolatore fornisce solo stime e non deve essere usato come metodo contraccettivo. Consulta il tuo medico per consigli medici.', es: 'Esta calculadora solo proporciona estimaciones y no debe usarse como método anticonceptivo. Consulta a tu médico.', fr: 'Ce calculateur fournit des estimations uniquement et ne doit pas être utilisé comme contraception. Consultez votre médecin.', de: 'Dieser Rechner liefert nur Schätzungen und sollte nicht zur Verhütung verwendet werden. Konsultieren Sie Ihren Arzt.', pt: 'Esta calculadora fornece apenas estimativas e não deve ser usada como método contraceptivo. Consulte seu médico.' },
    highFertility: { en: 'High Fertility', it: 'Alta Fertilità', es: 'Alta Fertilidad', fr: 'Haute Fertilité', de: 'Hohe Fruchtbarkeit', pt: 'Alta Fertilidade' },
    peakFertility: { en: 'Peak Fertility', it: 'Fertilità Massima', es: 'Fertilidad Máxima', fr: 'Fertilité Maximale', de: 'Maximale Fruchtbarkeit', pt: 'Fertilidade Máxima' },
    lowFertility: { en: 'Low Fertility', it: 'Bassa Fertilità', es: 'Baja Fertilidad', fr: 'Faible Fertilité', de: 'Niedrige Fruchtbarkeit', pt: 'Baixa Fertilidade' },
  } as Record<string, Record<Locale, string>>;

  const addDays = (dateStr: string, days: number): Date => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d;
  };

  const formatDate = (d: Date) => d.toLocaleDateString(lang === 'en' ? 'en-US' : lang, { year: 'numeric', month: 'long', day: 'numeric' });
  const formatShort = (d: Date) => d.toLocaleDateString(lang === 'en' ? 'en-US' : lang, { month: 'short', day: 'numeric' });

  // Ovulation typically occurs 14 days before the next period (luteal phase is ~14 days)
  const ovulationDay = cycleLength - 14;
  const ovulationDate = lastPeriod ? addDays(lastPeriod, ovulationDay) : null;
  const fertileStart = lastPeriod ? addDays(lastPeriod, ovulationDay - 5) : null;
  const fertileEnd = lastPeriod ? addDays(lastPeriod, ovulationDay + 1) : null;
  const nextPeriodDate = lastPeriod ? addDays(lastPeriod, cycleLength) : null;

  const hasResult = lastPeriod && ovulationDate && fertileStart && fertileEnd && nextPeriodDate;

  const handleCalculate = () => {
    if (hasResult && ovulationDate && fertileStart && fertileEnd) {
      const entry: HistoryEntry = {
        lastPeriod,
        cycleLength,
        ovulationDate: formatDate(ovulationDate),
        fertileStart: formatDate(fertileStart),
        fertileEnd: formatDate(fertileEnd),
      };
      setHistory(prev => [entry, ...prev.filter((_, i) => i < 4)]);
    }
  };

  const copyResults = () => {
    if (!ovulationDate || !fertileStart || !fertileEnd || !nextPeriodDate) return;
    const text = `${labels.ovulationDate[lang]}: ${formatDate(ovulationDate)}\n${labels.fertileWindow[lang]}: ${formatDate(fertileStart)} ${labels.to[lang]} ${formatDate(fertileEnd)}\n${labels.nextPeriod[lang]}: ${formatDate(nextPeriodDate)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Generate cycle day markers for visual timeline
  const getCycleDays = () => {
    if (!lastPeriod) return [];
    const days = [];
    for (let i = 0; i < cycleLength; i++) {
      const d = addDays(lastPeriod, i);
      let phase: 'menstruation' | 'follicular' | 'fertile' | 'ovulation' | 'luteal' = 'follicular';
      if (i < 5) phase = 'menstruation';
      else if (i >= ovulationDay - 5 && i < ovulationDay) phase = 'fertile';
      else if (i === ovulationDay) phase = 'ovulation';
      else if (i > ovulationDay) phase = 'luteal';
      days.push({ day: i + 1, date: d, phase });
    }
    return days;
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'menstruation': return 'bg-red-400';
      case 'follicular': return 'bg-yellow-300';
      case 'fertile': return 'bg-green-400';
      case 'ovulation': return 'bg-green-600';
      case 'luteal': return 'bg-blue-300';
      default: return 'bg-gray-200';
    }
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Ovulation Calculator – Track Your Fertile Window Online',
      paragraphs: [
        'An ovulation calculator is an essential tool for anyone trying to conceive or wanting to understand their menstrual cycle better. Ovulation is the process by which a mature egg is released from the ovary and travels down the fallopian tube, where it can be fertilized by sperm. This typically occurs once per cycle and marks the peak of fertility.',
        'Our ovulation calculator uses the calendar method to estimate your most fertile days. Based on the first day of your last menstrual period and your average cycle length, it calculates the likely ovulation date. In a typical 28-day cycle, ovulation occurs around day 14. The key principle is that the luteal phase (the time between ovulation and the next period) is relatively constant at about 14 days, regardless of total cycle length.',
        'The fertile window spans approximately six days: the five days before ovulation and the day of ovulation itself. Sperm can survive in the female reproductive tract for up to five days, while an egg remains viable for 12-24 hours after release. This means the best chance of conception occurs when intercourse takes place in the days leading up to ovulation. Our calculator highlights this window clearly, along with a visual cycle timeline showing menstruation, follicular phase, fertile days, ovulation day, and luteal phase.',
        'While this calculator provides helpful estimates for family planning, remember that many factors can affect ovulation timing, including stress, illness, weight changes, and hormonal imbalances. For more precise tracking, consider combining this tool with basal body temperature monitoring, cervical mucus observation, or ovulation predictor kits. Always consult a healthcare provider for personalized fertility advice.',
      ],
      faq: [
        { q: 'How does the ovulation calculator work?', a: 'The calculator estimates your ovulation date based on your cycle length. Since the luteal phase (after ovulation) is typically 14 days, ovulation is estimated at cycle length minus 14 days from the start of your period. For a 28-day cycle, that is day 14. The fertile window includes the 5 days before ovulation and the ovulation day itself.' },
        { q: 'When is the best time to conceive?', a: 'The best time to conceive is during your fertile window, particularly the 2-3 days before ovulation and the day of ovulation itself. Sperm can survive up to 5 days in the reproductive tract, so having intercourse before ovulation gives sperm time to reach the egg.' },
        { q: 'Can I use this calculator as birth control?', a: 'No. This calculator provides estimates based on average cycle patterns and should never be relied upon as a method of contraception. Ovulation timing can vary significantly from cycle to cycle due to stress, illness, hormonal changes, and other factors. Consult your healthcare provider for reliable contraception methods.' },
        { q: 'What if my cycle is irregular?', a: 'If your cycles vary significantly in length, the calendar method is less reliable. Consider tracking ovulation with additional methods such as basal body temperature charting, cervical mucus monitoring, or over-the-counter ovulation predictor kits (OPKs) that detect the LH surge before ovulation.' },
        { q: 'How accurate is this ovulation estimate?', a: 'This estimate is most accurate for people with regular cycles. Studies show that ovulation can vary by several days even in regular cycles. The calculator gives a useful planning guide, but for maximum accuracy, combine it with physical signs of ovulation or medical testing.' },
      ],
    },
    it: {
      title: 'Calcolatore di Ovulazione Gratuito – Monitora la Tua Finestra Fertile',
      paragraphs: [
        'Un calcolatore di ovulazione è uno strumento essenziale per chi cerca di concepire o vuole comprendere meglio il proprio ciclo mestruale. L\'ovulazione è il processo in cui un ovulo maturo viene rilasciato dall\'ovaio e percorre la tuba di Falloppio, dove può essere fecondato. Questo avviene tipicamente una volta per ciclo e segna il picco di fertilità.',
        'Il nostro calcolatore di ovulazione utilizza il metodo del calendario per stimare i giorni più fertili. Basandosi sul primo giorno dell\'ultimo ciclo mestruale e sulla durata media del ciclo, calcola la data probabile di ovulazione. In un ciclo tipico di 28 giorni, l\'ovulazione avviene intorno al giorno 14. Il principio chiave è che la fase luteale (il tempo tra l\'ovulazione e il ciclo successivo) è relativamente costante a circa 14 giorni.',
        'La finestra fertile si estende per circa sei giorni: i cinque giorni prima dell\'ovulazione e il giorno dell\'ovulazione stessa. Gli spermatozoi possono sopravvivere nel tratto riproduttivo fino a cinque giorni, mentre l\'ovulo rimane vitale per 12-24 ore dopo il rilascio. Il nostro calcolatore evidenzia questa finestra con una linea temporale visiva che mostra mestruazione, fase follicolare, giorni fertili, ovulazione e fase luteale.',
        'Sebbene questo calcolatore fornisca stime utili per la pianificazione familiare, molti fattori possono influenzare i tempi dell\'ovulazione, tra cui stress, malattie e variazioni di peso. Per un monitoraggio più preciso, combina questo strumento con la misurazione della temperatura basale o i kit predittori dell\'ovulazione. Consulta sempre un medico per consigli personalizzati sulla fertilità.',
      ],
      faq: [
        { q: 'Come funziona il calcolatore di ovulazione?', a: 'Il calcolatore stima la data di ovulazione basandosi sulla durata del ciclo. Poiché la fase luteale dura tipicamente 14 giorni, l\'ovulazione è stimata a (durata del ciclo meno 14) giorni dall\'inizio del ciclo. La finestra fertile include i 5 giorni prima dell\'ovulazione e il giorno stesso.' },
        { q: 'Qual è il momento migliore per concepire?', a: 'Il momento migliore è durante la finestra fertile, in particolare i 2-3 giorni prima dell\'ovulazione e il giorno dell\'ovulazione. Gli spermatozoi possono sopravvivere fino a 5 giorni, quindi avere rapporti prima dell\'ovulazione dà il tempo agli spermatozoi di raggiungere l\'ovulo.' },
        { q: 'Posso usare questo calcolatore come contraccettivo?', a: 'No. Questo calcolatore fornisce stime basate su modelli medi del ciclo e non deve mai essere usato come metodo contraccettivo. I tempi dell\'ovulazione possono variare significativamente. Consulta il tuo medico per metodi contraccettivi affidabili.' },
        { q: 'Cosa fare se il mio ciclo è irregolare?', a: 'Se i tuoi cicli variano significativamente, il metodo del calendario è meno affidabile. Considera il monitoraggio con metodi aggiuntivi come la temperatura basale, l\'osservazione del muco cervicale o i kit predittori dell\'ovulazione.' },
        { q: 'Quanto è accurata questa stima dell\'ovulazione?', a: 'La stima è più accurata per chi ha cicli regolari. L\'ovulazione può variare di diversi giorni anche in cicli regolari. Per la massima accuratezza, combina il calcolatore con segni fisici dell\'ovulazione o esami medici.' },
      ],
    },
    es: {
      title: 'Calculadora de Ovulación Gratis – Rastrea Tu Ventana Fértil Online',
      paragraphs: [
        'Una calculadora de ovulación es una herramienta esencial para quienes intentan concebir o desean comprender mejor su ciclo menstrual. La ovulación es el proceso por el cual un óvulo maduro se libera del ovario y viaja por la trompa de Falopio, donde puede ser fertilizado. Esto ocurre típicamente una vez por ciclo y marca el pico de fertilidad.',
        'Nuestra calculadora utiliza el método del calendario para estimar los días más fértiles. Basándose en el primer día de tu última regla y la duración media de tu ciclo, calcula la fecha probable de ovulación. En un ciclo típico de 28 días, la ovulación ocurre alrededor del día 14. La fase lútea (entre la ovulación y la siguiente regla) es relativamente constante en unos 14 días.',
        'La ventana fértil abarca aproximadamente seis días: los cinco días antes de la ovulación y el día de la ovulación. Los espermatozoides pueden sobrevivir hasta cinco días en el tracto reproductivo, mientras que el óvulo permanece viable 12-24 horas. Nuestra calculadora destaca esta ventana con una línea temporal visual que muestra menstruación, fase folicular, días fértiles, ovulación y fase lútea.',
        'Aunque esta calculadora proporciona estimaciones útiles, muchos factores pueden afectar el momento de la ovulación, como el estrés, enfermedades y cambios de peso. Para un seguimiento más preciso, combina esta herramienta con la medición de temperatura basal o los kits predictores de ovulación. Consulta siempre a un profesional de la salud.',
      ],
      faq: [
        { q: '¿Cómo funciona la calculadora de ovulación?', a: 'La calculadora estima la fecha de ovulación según la duración del ciclo. Como la fase lútea dura típicamente 14 días, la ovulación se estima en (duración del ciclo menos 14) días desde el inicio del período. La ventana fértil incluye los 5 días antes de la ovulación y el día mismo.' },
        { q: '¿Cuál es el mejor momento para concebir?', a: 'El mejor momento es durante la ventana fértil, especialmente los 2-3 días antes de la ovulación y el día de la ovulación. Los espermatozoides pueden sobrevivir hasta 5 días, así que tener relaciones antes de la ovulación da tiempo a los espermatozoides para llegar al óvulo.' },
        { q: '¿Puedo usar esta calculadora como anticonceptivo?', a: 'No. Esta calculadora proporciona estimaciones basadas en patrones promedio del ciclo y nunca debe usarse como método anticonceptivo. Los tiempos de ovulación pueden variar significativamente. Consulta a tu médico para métodos anticonceptivos confiables.' },
        { q: '¿Qué pasa si mi ciclo es irregular?', a: 'Si tus ciclos varían significativamente, el método del calendario es menos confiable. Considera métodos adicionales como la temperatura basal, la observación del moco cervical o los kits predictores de ovulación.' },
        { q: '¿Qué tan precisa es esta estimación?', a: 'La estimación es más precisa para personas con ciclos regulares. La ovulación puede variar varios días incluso en ciclos regulares. Para mayor precisión, combina la calculadora con signos físicos de ovulación o pruebas médicas.' },
      ],
    },
    fr: {
      title: 'Calculateur d\'Ovulation Gratuit – Suivez Votre Fenêtre de Fertilité',
      paragraphs: [
        'Un calculateur d\'ovulation est un outil essentiel pour toute personne essayant de concevoir ou souhaitant mieux comprendre son cycle menstruel. L\'ovulation est le processus par lequel un ovule mature est libéré de l\'ovaire et se déplace dans la trompe de Fallope, où il peut être fécondé. Cela se produit généralement une fois par cycle et marque le pic de fertilité.',
        'Notre calculateur utilise la méthode du calendrier pour estimer vos jours les plus fertiles. En se basant sur le premier jour de vos dernières règles et la durée moyenne de votre cycle, il calcule la date probable d\'ovulation. Dans un cycle typique de 28 jours, l\'ovulation survient vers le jour 14. La phase lutéale (entre l\'ovulation et les règles suivantes) est relativement constante à environ 14 jours.',
        'La fenêtre de fertilité s\'étend sur environ six jours : les cinq jours avant l\'ovulation et le jour de l\'ovulation elle-même. Les spermatozoïdes peuvent survivre jusqu\'à cinq jours dans le tractus reproductif, tandis que l\'ovule reste viable 12-24 heures. Notre calculateur met en évidence cette fenêtre avec une chronologie visuelle montrant les menstruations, la phase folliculaire, les jours fertiles, l\'ovulation et la phase lutéale.',
        'Bien que ce calculateur fournisse des estimations utiles, de nombreux facteurs peuvent affecter le moment de l\'ovulation, comme le stress, la maladie et les changements de poids. Pour un suivi plus précis, combinez cet outil avec la mesure de la température basale ou les kits prédicteurs d\'ovulation. Consultez toujours un professionnel de santé.',
      ],
      faq: [
        { q: 'Comment fonctionne le calculateur d\'ovulation ?', a: 'Le calculateur estime la date d\'ovulation selon la durée du cycle. La phase lutéale durant typiquement 14 jours, l\'ovulation est estimée à (durée du cycle moins 14) jours après le début des règles. La fenêtre fertile inclut les 5 jours avant l\'ovulation et le jour même.' },
        { q: 'Quel est le meilleur moment pour concevoir ?', a: 'Le meilleur moment est pendant la fenêtre fertile, en particulier les 2-3 jours avant l\'ovulation et le jour de l\'ovulation. Les spermatozoïdes peuvent survivre jusqu\'à 5 jours, donc les rapports avant l\'ovulation donnent le temps aux spermatozoïdes d\'atteindre l\'ovule.' },
        { q: 'Puis-je utiliser ce calculateur comme contraception ?', a: 'Non. Ce calculateur fournit des estimations basées sur des modèles de cycle moyens et ne doit jamais être utilisé comme méthode contraceptive. Le moment de l\'ovulation peut varier considérablement. Consultez votre médecin pour des méthodes contraceptives fiables.' },
        { q: 'Que faire si mon cycle est irrégulier ?', a: 'Si vos cycles varient significativement, la méthode du calendrier est moins fiable. Envisagez des méthodes supplémentaires comme la température basale, l\'observation de la glaire cervicale ou les tests d\'ovulation.' },
        { q: 'Quelle est la précision de cette estimation ?', a: 'L\'estimation est plus précise pour les personnes ayant des cycles réguliers. L\'ovulation peut varier de plusieurs jours même dans les cycles réguliers. Pour une précision maximale, combinez le calculateur avec les signes physiques d\'ovulation ou des tests médicaux.' },
      ],
    },
    de: {
      title: 'Kostenloser Eisprungrechner – Verfolgen Sie Ihr Fruchtbares Fenster',
      paragraphs: [
        'Ein Eisprungrechner ist ein unverzichtbares Werkzeug für alle, die schwanger werden möchten oder ihren Menstruationszyklus besser verstehen wollen. Der Eisprung ist der Prozess, bei dem eine reife Eizelle vom Eierstock freigesetzt wird und durch den Eileiter wandert, wo sie von Spermien befruchtet werden kann. Dies geschieht typischerweise einmal pro Zyklus und markiert den Höhepunkt der Fruchtbarkeit.',
        'Unser Eisprungrechner verwendet die Kalendermethode, um Ihre fruchtbarsten Tage zu schätzen. Basierend auf dem ersten Tag Ihrer letzten Periode und Ihrer durchschnittlichen Zykluslänge berechnet er das wahrscheinliche Eisprungdatum. In einem typischen 28-Tage-Zyklus findet der Eisprung um Tag 14 statt. Die Lutealphase (die Zeit zwischen Eisprung und nächster Periode) ist mit etwa 14 Tagen relativ konstant.',
        'Das fruchtbare Fenster umfasst etwa sechs Tage: die fünf Tage vor dem Eisprung und den Tag des Eisprungs selbst. Spermien können bis zu fünf Tage im Fortpflanzungstrakt überleben, während die Eizelle 12-24 Stunden lebensfähig bleibt. Unser Rechner hebt dieses Fenster mit einer visuellen Zeitleiste hervor, die Menstruation, Follikelphase, fruchtbare Tage, Eisprung und Lutealphase zeigt.',
        'Obwohl dieser Rechner nützliche Schätzungen liefert, können viele Faktoren den Zeitpunkt des Eisprungs beeinflussen, darunter Stress, Krankheit und Gewichtsveränderungen. Für eine genauere Überwachung kombinieren Sie dieses Tool mit der Basaltemperaturmessung oder Ovulationstests. Konsultieren Sie immer einen Arzt für persönliche Fruchtbarkeitsberatung.',
      ],
      faq: [
        { q: 'Wie funktioniert der Eisprungrechner?', a: 'Der Rechner schätzt das Eisprungdatum anhand der Zykluslänge. Da die Lutealphase typischerweise 14 Tage dauert, wird der Eisprung auf (Zykluslänge minus 14) Tage nach Periodenbeginn geschätzt. Das fruchtbare Fenster umfasst die 5 Tage vor dem Eisprung und den Tag selbst.' },
        { q: 'Wann ist die beste Zeit zum Schwangerwerden?', a: 'Die beste Zeit ist während des fruchtbaren Fensters, besonders die 2-3 Tage vor dem Eisprung und der Eisprungstag selbst. Spermien können bis zu 5 Tage überleben, daher gibt Geschlechtsverkehr vor dem Eisprung den Spermien Zeit, die Eizelle zu erreichen.' },
        { q: 'Kann ich diesen Rechner als Verhütung nutzen?', a: 'Nein. Dieser Rechner liefert Schätzungen basierend auf durchschnittlichen Zyklusmustern und sollte niemals als Verhütungsmethode verwendet werden. Der Eisprungzeitpunkt kann erheblich variieren. Konsultieren Sie Ihren Arzt für zuverlässige Verhütungsmethoden.' },
        { q: 'Was tun bei unregelmäßigem Zyklus?', a: 'Bei stark variierenden Zyklen ist die Kalendermethode weniger zuverlässig. Erwägen Sie zusätzliche Methoden wie Basaltemperaturmessung, Zervixschleimbeobachtung oder Ovulationstests (LH-Tests).' },
        { q: 'Wie genau ist diese Eisprungschätzung?', a: 'Die Schätzung ist bei regelmäßigen Zyklen am genauesten. Der Eisprung kann selbst bei regelmäßigen Zyklen um mehrere Tage variieren. Für maximale Genauigkeit kombinieren Sie den Rechner mit physischen Eisprungszeichen oder medizinischen Tests.' },
      ],
    },
    pt: {
      title: 'Calculadora de Ovulação Grátis – Acompanhe Sua Janela Fértil Online',
      paragraphs: [
        'Uma calculadora de ovulação é uma ferramenta essencial para quem está tentando engravidar ou deseja entender melhor seu ciclo menstrual. A ovulação é o processo pelo qual um óvulo maduro é liberado do ovário e percorre a trompa de Falópio, onde pode ser fertilizado. Isso ocorre tipicamente uma vez por ciclo e marca o pico de fertilidade.',
        'Nossa calculadora de ovulação utiliza o método do calendário para estimar seus dias mais férteis. Com base no primeiro dia da sua última menstruação e na duração média do seu ciclo, ela calcula a data provável de ovulação. Em um ciclo típico de 28 dias, a ovulação ocorre por volta do dia 14. A fase lútea (entre a ovulação e a próxima menstruação) é relativamente constante em cerca de 14 dias.',
        'A janela fértil abrange aproximadamente seis dias: os cinco dias antes da ovulação e o dia da ovulação. Os espermatozoides podem sobreviver até cinco dias no trato reprodutivo, enquanto o óvulo permanece viável por 12-24 horas. Nossa calculadora destaca esta janela com uma linha do tempo visual mostrando menstruação, fase folicular, dias férteis, ovulação e fase lútea.',
        'Embora esta calculadora forneça estimativas úteis para o planejamento familiar, muitos fatores podem afetar o momento da ovulação, incluindo estresse, doenças e mudanças de peso. Para um acompanhamento mais preciso, combine esta ferramenta com a medição da temperatura basal ou testes de ovulação. Sempre consulte um profissional de saúde para orientação personalizada sobre fertilidade.',
      ],
      faq: [
        { q: 'Como funciona a calculadora de ovulação?', a: 'A calculadora estima a data de ovulação com base na duração do ciclo. Como a fase lútea dura tipicamente 14 dias, a ovulação é estimada em (duração do ciclo menos 14) dias após o início da menstruação. A janela fértil inclui os 5 dias antes da ovulação e o dia da ovulação.' },
        { q: 'Qual o melhor momento para engravidar?', a: 'O melhor momento é durante a janela fértil, especialmente os 2-3 dias antes da ovulação e o dia da ovulação. Os espermatozoides podem sobreviver até 5 dias, então relações antes da ovulação dão tempo para os espermatozoides alcançarem o óvulo.' },
        { q: 'Posso usar esta calculadora como método contraceptivo?', a: 'Não. Esta calculadora fornece estimativas baseadas em padrões médios do ciclo e nunca deve ser usada como método contraceptivo. O momento da ovulação pode variar significativamente. Consulte seu médico para métodos contraceptivos confiáveis.' },
        { q: 'E se meu ciclo for irregular?', a: 'Se seus ciclos variam significativamente, o método do calendário é menos confiável. Considere métodos adicionais como temperatura basal, observação do muco cervical ou testes de ovulação.' },
        { q: 'Qual a precisão desta estimativa?', a: 'A estimativa é mais precisa para pessoas com ciclos regulares. A ovulação pode variar vários dias mesmo em ciclos regulares. Para máxima precisão, combine a calculadora com sinais físicos de ovulação ou exames médicos.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const cycleDays = getCycleDays();

  return (
    <ToolPageWrapper toolSlug="ovulation-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.lastPeriod[lang]}</label>
            <input type="date" value={lastPeriod} onChange={(e) => setLastPeriod(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.cycleLength[lang]}</label>
            <div className="flex items-center gap-3">
              <input type="range" min={21} max={40} value={cycleLength} onChange={(e) => setCycleLength(Number(e.target.value))} className="flex-1" />
              <span className="text-lg font-semibold text-gray-900 w-16 text-center">{cycleLength} {labels.days[lang]}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleCalculate} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              {labels.calculate[lang]}
            </button>
            <button onClick={() => { setLastPeriod(''); setCycleLength(28); }} className="flex-1 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
              {labels.reset[lang]}
            </button>
          </div>

          {hasResult && ovulationDate && fertileStart && fertileEnd && nextPeriodDate && (
            <div className="space-y-4">
              {/* Main result */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-5 rounded-xl border border-pink-200 text-center">
                <div className="text-sm text-gray-500">{labels.ovulationDate[lang]}</div>
                <div className="text-3xl font-bold text-pink-700">{formatDate(ovulationDate)}</div>
              </div>

              {/* Fertile window & next period */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center">
                  <div className="text-xs text-gray-500">{labels.fertileWindow[lang]}</div>
                  <div className="text-sm font-bold text-green-700 mt-1">{formatShort(fertileStart)} {labels.to[lang]} {formatShort(fertileEnd)}</div>
                  <div className="text-xs text-green-600 mt-1">{labels.highFertility[lang]}</div>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
                  <div className="text-xs text-gray-500">{labels.nextPeriod[lang]}</div>
                  <div className="text-sm font-bold text-blue-700 mt-1">{formatDate(nextPeriodDate)}</div>
                </div>
              </div>

              {/* Cycle timeline */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">{labels.cycleTimeline[lang]}</h3>
                <div className="flex flex-wrap gap-1">
                  {cycleDays.map((d) => (
                    <div key={d.day} className="relative group">
                      <div className={`w-7 h-7 rounded-full ${getPhaseColor(d.phase)} flex items-center justify-center text-xs font-medium ${d.phase === 'ovulation' ? 'text-white ring-2 ring-green-800' : 'text-gray-800'}`}>
                        {d.day}
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                        {formatShort(d.date)}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-400" />{labels.menstruation[lang]}</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-300" />{labels.follicular[lang]}</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-400" />{labels.fertile[lang]}</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-600" />{labels.ovulation[lang]}</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-300" />{labels.luteal[lang]}</div>
                </div>
              </div>

              {/* Copy button */}
              <button onClick={copyResults} className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">
                {copied ? labels.copied[lang] : labels.copy[lang]}
              </button>

              {/* Disclaimer */}
              <div className="text-xs text-red-500 italic text-center p-3 bg-red-50 rounded-lg border border-red-100">
                {labels.disclaimer[lang]}
              </div>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">{labels.history[lang]}</h3>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-0">
                  <div className="text-gray-600">
                    {h.lastPeriod} ({h.cycleLength} {labels.days[lang]})
                  </div>
                  <div className="text-pink-700 font-medium">{h.ovulationDate}</div>
                </div>
              ))}
            </div>
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
