'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type BPReading = {
  systolic: number;
  diastolic: number;
  pulse: number;
  category: string;
  color: string;
  timestamp: string;
};

const STORAGE_KEY = 'bp-tracker-readings';

export default function BloodPressureTracker() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['blood-pressure-tracker'][lang];

  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [readings, setReadings] = useState<BPReading[]>([]);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{ category: string; color: string; bg: string; border: string; text: string } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const labels: Record<string, Record<Locale, string>> = {
    systolic: { en: 'Systolic (mmHg)', it: 'Sistolica (mmHg)', es: 'Sistolica (mmHg)', fr: 'Systolique (mmHg)', de: 'Systolisch (mmHg)', pt: 'Sistolica (mmHg)' },
    diastolic: { en: 'Diastolic (mmHg)', it: 'Diastolica (mmHg)', es: 'Diastolica (mmHg)', fr: 'Diastolique (mmHg)', de: 'Diastolisch (mmHg)', pt: 'Diastolica (mmHg)' },
    pulse: { en: 'Pulse (bpm)', it: 'Polso (bpm)', es: 'Pulso (lpm)', fr: 'Pouls (bpm)', de: 'Puls (bpm)', pt: 'Pulso (bpm)' },
    calculate: { en: 'Classify', it: 'Classifica', es: 'Clasificar', fr: 'Classifier', de: 'Klassifizieren', pt: 'Classificar' },
    reset: { en: 'Reset', it: 'Resetta', es: 'Restablecer', fr: 'Reinitialiser', de: 'Zurucksetzen', pt: 'Redefinir' },
    copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier Resultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copie!', de: 'Kopiert!', pt: 'Copiado!' },
    normal: { en: 'Normal', it: 'Normale', es: 'Normal', fr: 'Normale', de: 'Normal', pt: 'Normal' },
    elevated: { en: 'Elevated', it: 'Elevata', es: 'Elevada', fr: 'Elevee', de: 'Erhoht', pt: 'Elevada' },
    highStage1: { en: 'High - Stage 1', it: 'Alta - Stadio 1', es: 'Alta - Etapa 1', fr: 'Haute - Stade 1', de: 'Hoch - Stufe 1', pt: 'Alta - Estagio 1' },
    highStage2: { en: 'High - Stage 2', it: 'Alta - Stadio 2', es: 'Alta - Etapa 2', fr: 'Haute - Stade 2', de: 'Hoch - Stufe 2', pt: 'Alta - Estagio 2' },
    crisis: { en: 'Hypertensive Crisis', it: 'Crisi Ipertensiva', es: 'Crisis Hipertensiva', fr: 'Crise Hypertensive', de: 'Hypertensive Krise', pt: 'Crise Hipertensiva' },
    history: { en: 'Reading History', it: 'Cronologia Letture', es: 'Historial de Lecturas', fr: 'Historique des Mesures', de: 'Messverlauf', pt: 'Historico de Leituras' },
    clearHistory: { en: 'Clear History', it: 'Cancella Cronologia', es: 'Borrar Historial', fr: 'Effacer Historique', de: 'Verlauf Loschen', pt: 'Limpar Historico' },
    exportCsv: { en: 'Export CSV', it: 'Esporta CSV', es: 'Exportar CSV', fr: 'Exporter CSV', de: 'CSV Exportieren', pt: 'Exportar CSV' },
    average: { en: 'Average', it: 'Media', es: 'Promedio', fr: 'Moyenne', de: 'Durchschnitt', pt: 'Media' },
    last10: { en: 'Last 10 Readings', it: 'Ultime 10 Letture', es: 'Ultimas 10 Lecturas', fr: '10 Dernieres Mesures', de: 'Letzte 10 Messungen', pt: 'Ultimas 10 Leituras' },
    disclaimer: {
      en: 'This tool is for informational purposes only. Consult a healthcare professional.',
      it: 'Questo strumento e solo a scopo informativo. Consulta un professionista sanitario.',
      es: 'Esta herramienta es solo para fines informativos. Consulte a un profesional de la salud.',
      fr: 'Cet outil est a titre informatif uniquement. Consultez un professionnel de sante.',
      de: 'Dieses Tool dient nur zu Informationszwecken. Konsultieren Sie einen Arzt.',
      pt: 'Esta ferramenta e apenas para fins informativos. Consulte um profissional de saude.',
    },
    noReadings: { en: 'No readings yet', it: 'Nessuna lettura', es: 'Sin lecturas', fr: 'Aucune mesure', de: 'Keine Messungen', pt: 'Sem leituras' },
    systolicLabel: { en: 'SYS', it: 'SIS', es: 'SIS', fr: 'SYS', de: 'SYS', pt: 'SIS' },
    diastolicLabel: { en: 'DIA', it: 'DIA', es: 'DIA', fr: 'DIA', de: 'DIA', pt: 'DIA' },
    pulseLabel: { en: 'PUL', it: 'POL', es: 'PUL', fr: 'POU', de: 'PUL', pt: 'PUL' },
    logReading: { en: 'Log Reading', it: 'Registra Lettura', es: 'Registrar Lectura', fr: 'Enregistrer Mesure', de: 'Messung Speichern', pt: 'Registrar Leitura' },
  };

  // Load readings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setReadings(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  // Save readings to localStorage
  const saveReadings = useCallback((r: BPReading[]) => {
    setReadings(r);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(r)); } catch { /* ignore */ }
  }, []);

  const classify = (sys: number, dia: number): { category: string; color: string; bg: string; border: string; colorHex: string } => {
    if (sys >= 180 || dia >= 120) return { category: labels.crisis[lang], color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300', colorHex: '#b91c1c' };
    if (sys >= 140 || dia >= 90) return { category: labels.highStage2[lang], color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', colorHex: '#dc2626' };
    if (sys >= 130 || dia >= 80) return { category: labels.highStage1[lang], color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', colorHex: '#ea580c' };
    if (sys >= 120 && dia < 80) return { category: labels.elevated[lang], color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', colorHex: '#ca8a04' };
    return { category: labels.normal[lang], color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', colorHex: '#16a34a' };
  };

  const classifyColorOnly = (sys: number, dia: number): string => {
    if (sys >= 180 || dia >= 120) return '#b91c1c';
    if (sys >= 140 || dia >= 90) return '#dc2626';
    if (sys >= 130 || dia >= 80) return '#ea580c';
    if (sys >= 120 && dia < 80) return '#ca8a04';
    return '#16a34a';
  };

  const handleClassify = () => {
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    if (isNaN(sys) || isNaN(dia) || sys <= 0 || dia <= 0) return;
    const c = classify(sys, dia);
    setResult({ category: c.category, color: c.color, bg: c.bg, border: c.border, text: c.category });
  };

  const handleLog = () => {
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    const pul = parseInt(pulse) || 0;
    if (isNaN(sys) || isNaN(dia) || sys <= 0 || dia <= 0) return;
    const c = classify(sys, dia);
    const reading: BPReading = {
      systolic: sys,
      diastolic: dia,
      pulse: pul,
      category: c.category,
      color: c.colorHex,
      timestamp: new Date().toISOString(),
    };
    saveReadings([reading, ...readings]);
    handleClassify();
  };

  const handleReset = () => {
    setSystolic('');
    setDiastolic('');
    setPulse('');
    setResult(null);
  };

  const handleClearHistory = () => {
    saveReadings([]);
  };

  const copyResults = () => {
    if (!result) return;
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    const pul = parseInt(pulse) || 0;
    const text = `Blood Pressure: ${sys}/${dia} mmHg\nPulse: ${pul} bpm\nClassification: ${result.category}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCsv = () => {
    if (readings.length === 0) return;
    const header = 'Date,Systolic,Diastolic,Pulse,Category\n';
    const rows = readings.map(r => {
      const d = new Date(r.timestamp);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()},${r.systolic},${r.diastolic},${r.pulse},${r.category}`;
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blood-pressure-readings.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate averages
  const avgSys = readings.length > 0 ? Math.round(readings.reduce((s, r) => s + r.systolic, 0) / readings.length) : 0;
  const avgDia = readings.length > 0 ? Math.round(readings.reduce((s, r) => s + r.diastolic, 0) / readings.length) : 0;
  const avgPulse = readings.length > 0 ? Math.round(readings.reduce((s, r) => s + r.pulse, 0) / readings.length) : 0;

  // Last 10 readings for chart (reversed so oldest is left)
  const chartData = readings.slice(0, 10).reverse();
  const chartMaxSys = chartData.length > 0 ? Math.max(...chartData.map(r => r.systolic), 180) : 180;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Blood Pressure Tracker — Monitor Your Blood Pressure Online',
      paragraphs: [
        'Blood pressure is one of the most critical vital signs for assessing cardiovascular health. It measures the force of blood pushing against the walls of your arteries as your heart pumps. Monitoring your blood pressure regularly is essential for detecting hypertension early, a condition that affects nearly half of all adults worldwide and is a leading risk factor for heart disease, stroke, and kidney disease.',
        'Blood pressure is recorded as two numbers: systolic (the pressure when your heart beats) over diastolic (the pressure when your heart rests between beats). A normal reading is generally below 120/80 mmHg. Elevated blood pressure falls between 120-129 systolic with diastolic below 80. High blood pressure Stage 1 is 130-139 systolic or 80-89 diastolic, while Stage 2 is 140 or higher systolic, or 90 or higher diastolic. A hypertensive crisis occurs when readings exceed 180/120 mmHg and requires immediate medical attention.',
        'Our free blood pressure tracker allows you to input your systolic and diastolic readings along with your pulse rate. The tool instantly classifies your reading according to the American Heart Association guidelines and provides a color-coded result for easy interpretation. Green indicates normal, yellow means elevated, orange signals Stage 1 hypertension, and red warns of Stage 2 hypertension or crisis.',
        'Beyond single readings, tracking your blood pressure over time is crucial. This tool stores your readings locally in your browser, displays a visual bar chart of your last 10 measurements, and calculates running averages. You can export your complete history as a CSV file to share with your healthcare provider. Regular monitoring at home, combined with professional medical advice, is one of the most effective strategies for managing blood pressure and reducing cardiovascular risk.',
        'Factors that influence blood pressure include diet (especially sodium intake), physical activity, stress levels, alcohol consumption, smoking, and genetics. Lifestyle modifications such as reducing salt intake, exercising regularly, maintaining a healthy weight, and managing stress can significantly improve blood pressure readings over time. However, many people also require medication to keep their blood pressure within a healthy range.',
        'Remember that home blood pressure monitoring is a supplement to, not a replacement for, regular check-ups with your healthcare provider. Single readings can be influenced by many temporary factors including caffeine intake, physical activity, stress, and even the time of day. Consistent tracking over weeks and months provides the most valuable data for understanding your cardiovascular health trends.',
      ],
      faq: [
        { q: 'What is a normal blood pressure reading?', a: 'A normal blood pressure reading is below 120/80 mmHg. The top number (systolic) measures pressure when your heart beats, and the bottom number (diastolic) measures pressure when your heart rests between beats. Readings consistently below these values indicate healthy blood pressure.' },
        { q: 'How often should I check my blood pressure?', a: 'The American Heart Association recommends checking blood pressure at least once a year for adults with normal readings. If you have elevated or high blood pressure, your doctor may recommend more frequent monitoring — potentially daily or several times a week. Consistency in timing (same time of day) improves accuracy.' },
        { q: 'What is a hypertensive crisis?', a: 'A hypertensive crisis occurs when blood pressure readings exceed 180/120 mmHg. This is a medical emergency that can lead to organ damage, stroke, or heart attack. If you measure a reading this high, wait 5 minutes and measure again. If still elevated, seek immediate medical attention or call emergency services.' },
        { q: 'Can blood pressure vary throughout the day?', a: 'Yes, blood pressure naturally fluctuates throughout the day. It is typically lowest during sleep and rises in the morning. Stress, physical activity, caffeine, meals, and even body position can cause temporary changes. This is why tracking multiple readings over time gives a more accurate picture than any single measurement.' },
        { q: 'Is this tool a substitute for medical advice?', a: 'No. This blood pressure tracker is for informational and self-monitoring purposes only. It does not diagnose or treat any medical condition. Always consult a qualified healthcare professional for interpretation of your readings, diagnosis of hypertension, and any treatment decisions. Share your tracked readings with your doctor for the most comprehensive care.' },
      ],
    },
    it: {
      title: 'Monitoraggio Pressione Arteriosa Gratuito — Controlla la Tua Pressione Online',
      paragraphs: [
        'La pressione arteriosa e uno dei segni vitali piu importanti per valutare la salute cardiovascolare. Misura la forza del sangue che spinge contro le pareti delle arterie mentre il cuore pompa. Monitorare regolarmente la pressione e essenziale per individuare precocemente l\'ipertensione, una condizione che colpisce quasi la meta degli adulti nel mondo ed e un fattore di rischio principale per malattie cardiache, ictus e malattie renali.',
        'La pressione si registra come due numeri: sistolica (la pressione quando il cuore batte) su diastolica (la pressione quando il cuore riposa tra un battito e l\'altro). Una lettura normale e generalmente inferiore a 120/80 mmHg. La pressione elevata si colloca tra 120-129 sistolica con diastolica sotto 80. L\'ipertensione di Stadio 1 e 130-139 sistolica o 80-89 diastolica, mentre lo Stadio 2 e 140 o piu sistolica, o 90 o piu diastolica. Una crisi ipertensiva si verifica quando le letture superano 180/120 mmHg.',
        'Il nostro tracker gratuito ti permette di inserire le letture sistoliche e diastoliche insieme alla frequenza del polso. Lo strumento classifica istantaneamente la tua lettura secondo le linee guida dell\'American Heart Association e fornisce un risultato con codice colore. Verde indica normale, giallo significa elevata, arancione segnala ipertensione di Stadio 1, rosso avverte di Stadio 2 o crisi.',
        'Oltre alle singole letture, monitorare la pressione nel tempo e fondamentale. Questo strumento memorizza le letture localmente nel browser, visualizza un grafico a barre delle ultime 10 misurazioni e calcola le medie. Puoi esportare la cronologia completa come file CSV da condividere con il tuo medico. Il monitoraggio regolare a casa, combinato con consigli medici professionali, e una delle strategie piu efficaci per gestire la pressione.',
        'I fattori che influenzano la pressione includono dieta (specialmente l\'assunzione di sodio), attivita fisica, livelli di stress, consumo di alcol, fumo e genetica. Modifiche dello stile di vita come ridurre il sale, fare esercizio regolarmente, mantenere un peso sano e gestire lo stress possono migliorare significativamente le letture della pressione nel tempo.',
        'Ricorda che il monitoraggio domiciliare della pressione e un supplemento, non un sostituto, dei controlli regolari con il medico. Le singole letture possono essere influenzate da molti fattori temporanei. Il monitoraggio costante nel corso di settimane e mesi fornisce i dati piu preziosi per comprendere le tendenze della tua salute cardiovascolare.',
      ],
      faq: [
        { q: 'Qual e una lettura normale della pressione?', a: 'Una lettura normale della pressione e inferiore a 120/80 mmHg. Il numero superiore (sistolica) misura la pressione quando il cuore batte, e il numero inferiore (diastolica) misura la pressione quando il cuore riposa. Letture costantemente sotto questi valori indicano una pressione sana.' },
        { q: 'Quanto spesso devo controllare la pressione?', a: 'L\'American Heart Association raccomanda di controllare la pressione almeno una volta all\'anno per adulti con letture normali. Se hai la pressione elevata o alta, il medico potrebbe raccomandare un monitoraggio piu frequente, potenzialmente giornaliero.' },
        { q: 'Cos\'e una crisi ipertensiva?', a: 'Una crisi ipertensiva si verifica quando le letture superano 180/120 mmHg. E un\'emergenza medica che puo portare a danni agli organi, ictus o infarto. Se misuri una lettura cosi alta, attendi 5 minuti e misura di nuovo. Se ancora elevata, cerca assistenza medica immediata.' },
        { q: 'La pressione puo variare durante il giorno?', a: 'Si, la pressione fluttua naturalmente durante il giorno. E tipicamente piu bassa durante il sonno e sale al mattino. Stress, attivita fisica, caffeina e pasti possono causare variazioni temporanee. Per questo monitorare piu letture nel tempo da un quadro piu accurato.' },
        { q: 'Questo strumento sostituisce il parere medico?', a: 'No. Questo tracker e solo a scopo informativo e di automonitoraggio. Non diagnostica ne tratta alcuna condizione medica. Consulta sempre un professionista sanitario qualificato per l\'interpretazione delle letture e qualsiasi decisione terapeutica.' },
      ],
    },
    es: {
      title: 'Monitor de Presion Arterial Gratuito — Controla Tu Presion en Linea',
      paragraphs: [
        'La presion arterial es uno de los signos vitales mas importantes para evaluar la salud cardiovascular. Mide la fuerza de la sangre empujando contra las paredes de las arterias mientras el corazon bombea. Monitorear la presion regularmente es esencial para detectar la hipertension tempranamente, una condicion que afecta a casi la mitad de los adultos en todo el mundo y es un factor de riesgo principal para enfermedades cardiacas, accidentes cerebrovasculares y enfermedades renales.',
        'La presion se registra como dos numeros: sistolica (la presion cuando el corazon late) sobre diastolica (la presion cuando el corazon descansa entre latidos). Una lectura normal es generalmente inferior a 120/80 mmHg. La presion elevada se encuentra entre 120-129 sistolica con diastolica por debajo de 80. La hipertension Etapa 1 es 130-139 sistolica o 80-89 diastolica, mientras que la Etapa 2 es 140 o mas sistolica, o 90 o mas diastolica.',
        'Nuestro monitor gratuito te permite ingresar tus lecturas sistolicas y diastolicas junto con tu frecuencia de pulso. La herramienta clasifica instantaneamente tu lectura segun las pautas de la American Heart Association y proporciona un resultado codificado por colores. Verde indica normal, amarillo significa elevada, naranja senala hipertension Etapa 1, y rojo advierte de Etapa 2 o crisis.',
        'Mas alla de lecturas individuales, rastrear tu presion a lo largo del tiempo es crucial. Esta herramienta almacena tus lecturas localmente en tu navegador, muestra un grafico de barras de tus ultimas 10 mediciones y calcula promedios. Puedes exportar tu historial completo como archivo CSV para compartir con tu medico.',
        'Los factores que influyen en la presion arterial incluyen la dieta (especialmente la ingesta de sodio), la actividad fisica, los niveles de estres, el consumo de alcohol, el tabaquismo y la genetica. Las modificaciones del estilo de vida como reducir la sal, hacer ejercicio regularmente y mantener un peso saludable pueden mejorar significativamente las lecturas de presion.',
        'Recuerda que el monitoreo domiciliario de la presion es un complemento, no un sustituto, de los chequeos regulares con tu medico. Las lecturas individuales pueden verse influenciadas por muchos factores temporales. El seguimiento constante durante semanas y meses proporciona los datos mas valiosos para comprender las tendencias de tu salud cardiovascular.',
      ],
      faq: [
        { q: 'Cual es una lectura normal de presion arterial?', a: 'Una lectura normal es inferior a 120/80 mmHg. El numero superior (sistolica) mide la presion cuando el corazon late, y el inferior (diastolica) cuando descansa. Lecturas consistentemente por debajo de estos valores indican presion saludable.' },
        { q: 'Con que frecuencia debo revisar mi presion?', a: 'La American Heart Association recomienda revisar la presion al menos una vez al ano para adultos con lecturas normales. Si tienes presion elevada o alta, tu medico puede recomendar monitoreo mas frecuente, potencialmente diario.' },
        { q: 'Que es una crisis hipertensiva?', a: 'Una crisis hipertensiva ocurre cuando las lecturas superan 180/120 mmHg. Es una emergencia medica que puede llevar a dano organico, accidente cerebrovascular o infarto. Si mides una lectura asi, espera 5 minutos y mide de nuevo. Si sigue elevada, busca atencion medica inmediata.' },
        { q: 'La presion puede variar durante el dia?', a: 'Si, la presion fluctua naturalmente durante el dia. Es tipicamente mas baja durante el sueno y sube por la manana. El estres, la actividad fisica, la cafeina y las comidas pueden causar cambios temporales.' },
        { q: 'Esta herramienta sustituye el consejo medico?', a: 'No. Este monitor es solo para fines informativos y de automonitoreo. No diagnostica ni trata ninguna condicion medica. Siempre consulta a un profesional de la salud calificado para la interpretacion de tus lecturas y decisiones de tratamiento.' },
      ],
    },
    fr: {
      title: 'Suivi de Tension Arterielle Gratuit — Surveillez Votre Tension en Ligne',
      paragraphs: [
        'La tension arterielle est l\'un des signes vitaux les plus importants pour evaluer la sante cardiovasculaire. Elle mesure la force du sang poussant contre les parois de vos arteres lorsque votre coeur pompe. Surveiller regulierement votre tension est essentiel pour detecter l\'hypertension precocement, une condition qui touche pres de la moitie des adultes dans le monde et constitue un facteur de risque majeur pour les maladies cardiaques, les accidents vasculaires cerebraux et les maladies renales.',
        'La tension est enregistree sous forme de deux chiffres : systolique (la pression quand le coeur bat) sur diastolique (la pression quand le coeur se repose entre les battements). Une lecture normale est generalement inferieure a 120/80 mmHg. La tension elevee se situe entre 120-129 systolique avec diastolique inferieure a 80. L\'hypertension de Stade 1 est de 130-139 systolique ou 80-89 diastolique, tandis que le Stade 2 est de 140 ou plus systolique, ou 90 ou plus diastolique.',
        'Notre outil gratuit vous permet de saisir vos mesures systoliques et diastoliques ainsi que votre frequence cardiaque. L\'outil classe instantanement votre mesure selon les directives de l\'American Heart Association et fournit un resultat code par couleur. Le vert indique normal, le jaune signifie elevee, l\'orange signale une hypertension de Stade 1, et le rouge avertit du Stade 2 ou d\'une crise.',
        'Au-dela des mesures individuelles, suivre votre tension au fil du temps est crucial. Cet outil stocke vos mesures localement dans votre navigateur, affiche un graphique a barres de vos 10 dernieres mesures et calcule des moyennes. Vous pouvez exporter votre historique complet en fichier CSV a partager avec votre medecin.',
        'Les facteurs qui influencent la tension arterielle comprennent l\'alimentation (surtout l\'apport en sodium), l\'activite physique, le niveau de stress, la consommation d\'alcool, le tabagisme et la genetique. Des modifications du mode de vie comme reduire le sel, faire de l\'exercice regulierement et maintenir un poids sain peuvent ameliorer significativement les lectures de tension.',
        'Rappelez-vous que la surveillance a domicile de la tension est un complement, pas un remplacement, des bilans reguliers avec votre medecin. Les mesures individuelles peuvent etre influencees par de nombreux facteurs temporaires. Le suivi constant sur des semaines et des mois fournit les donnees les plus precieuses pour comprendre les tendances de votre sante cardiovasculaire.',
      ],
      faq: [
        { q: 'Quelle est une lecture normale de tension arterielle ?', a: 'Une lecture normale est inferieure a 120/80 mmHg. Le chiffre superieur (systolique) mesure la pression quand le coeur bat, et l\'inferieur (diastolique) quand il se repose. Des lectures regulierement sous ces valeurs indiquent une tension saine.' },
        { q: 'A quelle frequence dois-je verifier ma tension ?', a: 'L\'American Heart Association recommande de verifier la tension au moins une fois par an pour les adultes avec des lectures normales. Si vous avez une tension elevee ou haute, votre medecin peut recommander une surveillance plus frequente.' },
        { q: 'Qu\'est-ce qu\'une crise hypertensive ?', a: 'Une crise hypertensive survient lorsque les mesures depassent 180/120 mmHg. C\'est une urgence medicale pouvant entrainer des dommages aux organes, un AVC ou une crise cardiaque. Si vous obtenez une telle mesure, attendez 5 minutes et mesurez a nouveau.' },
        { q: 'La tension peut-elle varier au cours de la journee ?', a: 'Oui, la tension fluctue naturellement au cours de la journee. Elle est generalement plus basse pendant le sommeil et augmente le matin. Le stress, l\'activite physique, la cafeine et les repas peuvent provoquer des variations temporaires.' },
        { q: 'Cet outil remplace-t-il un avis medical ?', a: 'Non. Ce suivi est uniquement a titre informatif et d\'autosurveillance. Il ne diagnostique ni ne traite aucune condition medicale. Consultez toujours un professionnel de sante qualifie pour l\'interpretation de vos mesures et toute decision therapeutique.' },
      ],
    },
    de: {
      title: 'Kostenloser Blutdruck-Tracker — Uberwachen Sie Ihren Blutdruck Online',
      paragraphs: [
        'Der Blutdruck ist eines der wichtigsten Vitalzeichen zur Beurteilung der kardiovaskularen Gesundheit. Er misst die Kraft des Blutes, das gegen die Wande Ihrer Arterien druckt, wahrend Ihr Herz pumpt. Die regelmaessige Uberwachung Ihres Blutdrucks ist entscheidend fur die fruhe Erkennung von Bluthochdruck, einer Erkrankung, die fast die Halfte aller Erwachsenen weltweit betrifft und ein fuehrender Risikofaktor fur Herzkrankheiten, Schlaganfall und Nierenerkrankungen ist.',
        'Der Blutdruck wird als zwei Zahlen aufgezeichnet: systolisch (der Druck beim Herzschlag) uber diastolisch (der Druck wenn das Herz zwischen den Schlaegen ruht). Ein normaler Wert liegt generell unter 120/80 mmHg. Erhohter Blutdruck liegt zwischen 120-129 systolisch bei diastolisch unter 80. Bluthochdruck Stufe 1 ist 130-139 systolisch oder 80-89 diastolisch, wahrend Stufe 2 bei 140 oder hoher systolisch oder 90 oder hoher diastolisch liegt.',
        'Unser kostenloses Tool ermoglicht es Ihnen, Ihre systolischen und diastolischen Werte zusammen mit Ihrer Pulsfrequenz einzugeben. Das Tool klassifiziert Ihre Messung sofort gemaess den Richtlinien der American Heart Association und liefert ein farbcodiertes Ergebnis. Grun zeigt normal an, Gelb bedeutet erhoht, Orange signalisiert Stufe 1, und Rot warnt vor Stufe 2 oder einer Krise.',
        'Uber einzelne Messungen hinaus ist die Verfolgung Ihres Blutdrucks im Laufe der Zeit entscheidend. Dieses Tool speichert Ihre Messungen lokal in Ihrem Browser, zeigt ein Balkendiagramm Ihrer letzten 10 Messungen an und berechnet Durchschnittswerte. Sie konnen Ihren vollstandigen Verlauf als CSV-Datei exportieren, um ihn mit Ihrem Arzt zu teilen.',
        'Faktoren, die den Blutdruck beeinflussen, umfassen Ernahrung (insbesondere Natriumaufnahme), korperliche Aktivitat, Stressniveau, Alkoholkonsum, Rauchen und Genetik. Lebensstilanderungen wie die Reduzierung von Salz, regelmaessige Bewegung und die Aufrechterhaltung eines gesunden Gewichts konnen die Blutdruckwerte im Laufe der Zeit erheblich verbessern.',
        'Denken Sie daran, dass die haeusliche Blutdruckuberwachung eine Erganzung und kein Ersatz fur regelmaessige Kontrolluntersuchungen bei Ihrem Arzt ist. Einzelne Messungen konnen von vielen vorubergehenden Faktoren beeinflusst werden. Die konsequente Verfolgung uber Wochen und Monate liefert die wertvollsten Daten zum Verstandnis Ihrer kardiovaskularen Gesundheitstrends.',
      ],
      faq: [
        { q: 'Was ist ein normaler Blutdruckwert?', a: 'Ein normaler Blutdruckwert liegt unter 120/80 mmHg. Die obere Zahl (systolisch) misst den Druck beim Herzschlag, die untere (diastolisch) den Druck in der Ruhephase. Werte konstant unter diesen Zahlen weisen auf gesunden Blutdruck hin.' },
        { q: 'Wie oft sollte ich meinen Blutdruck messen?', a: 'Die American Heart Association empfiehlt, den Blutdruck mindestens einmal jahrlich fur Erwachsene mit normalen Werten zu prufen. Bei erhohtem oder hohem Blutdruck kann Ihr Arzt haeufigere Messungen empfehlen, moglicherweise taeglich.' },
        { q: 'Was ist eine hypertensive Krise?', a: 'Eine hypertensive Krise tritt auf, wenn die Werte 180/120 mmHg uberschreiten. Dies ist ein medizinischer Notfall, der zu Organschaden, Schlaganfall oder Herzinfarkt fuhren kann. Wenn Sie einen solchen Wert messen, warten Sie 5 Minuten und messen Sie erneut.' },
        { q: 'Kann der Blutdruck im Tagesverlauf schwanken?', a: 'Ja, der Blutdruck schwankt naturlich im Tagesverlauf. Er ist typischerweise wahrend des Schlafs am niedrigsten und steigt morgens an. Stress, korperliche Aktivitat, Koffein und Mahlzeiten konnen vorubergehende Veranderungen verursachen.' },
        { q: 'Ersetzt dieses Tool den arztlichen Rat?', a: 'Nein. Dieser Tracker dient nur zu Informations- und Selbstuberwachungszwecken. Er diagnostiziert oder behandelt keine medizinische Erkrankung. Konsultieren Sie immer einen qualifizierten Arzt fur die Interpretation Ihrer Werte und Behandlungsentscheidungen.' },
      ],
    },
    pt: {
      title: 'Monitor de Pressao Arterial Gratuito — Acompanhe Sua Pressao Online',
      paragraphs: [
        'A pressao arterial e um dos sinais vitais mais importantes para avaliar a saude cardiovascular. Ela mede a forca do sangue empurrando contra as paredes das arterias enquanto o coracao bombeia. Monitorar a pressao regularmente e essencial para detectar a hipertensao precocemente, uma condicao que afeta quase metade dos adultos no mundo e e um fator de risco principal para doencas cardiacas, AVC e doencas renais.',
        'A pressao e registrada como dois numeros: sistolica (a pressao quando o coracao bate) sobre diastolica (a pressao quando o coracao descansa entre batimentos). Uma leitura normal e geralmente inferior a 120/80 mmHg. A pressao elevada fica entre 120-129 sistolica com diastolica abaixo de 80. A hipertensao Estagio 1 e 130-139 sistolica ou 80-89 diastolica, enquanto o Estagio 2 e 140 ou mais sistolica, ou 90 ou mais diastolica.',
        'Nosso monitor gratuito permite que voce insira suas leituras sistolicas e diastolicas junto com sua frequencia de pulso. A ferramenta classifica instantaneamente sua leitura de acordo com as diretrizes da American Heart Association e fornece um resultado codificado por cores. Verde indica normal, amarelo significa elevada, laranja sinaliza hipertensao Estagio 1, e vermelho alerta para Estagio 2 ou crise.',
        'Alem de leituras individuais, acompanhar sua pressao ao longo do tempo e crucial. Esta ferramenta armazena suas leituras localmente no navegador, exibe um grafico de barras das ultimas 10 medicoes e calcula medias. Voce pode exportar seu historico completo como arquivo CSV para compartilhar com seu medico.',
        'Os fatores que influenciam a pressao arterial incluem dieta (especialmente a ingestao de sodio), atividade fisica, niveis de estresse, consumo de alcool, tabagismo e genetica. Modificacoes no estilo de vida como reduzir o sal, exercitar-se regularmente e manter um peso saudavel podem melhorar significativamente as leituras de pressao ao longo do tempo.',
        'Lembre-se de que o monitoramento domiciliar da pressao e um complemento, nao um substituto, dos check-ups regulares com seu medico. Leituras individuais podem ser influenciadas por muitos fatores temporarios. O acompanhamento consistente ao longo de semanas e meses fornece os dados mais valiosos para entender as tendencias de sua saude cardiovascular.',
      ],
      faq: [
        { q: 'Qual e uma leitura normal de pressao arterial?', a: 'Uma leitura normal e inferior a 120/80 mmHg. O numero superior (sistolica) mede a pressao quando o coracao bate, e o inferior (diastolica) quando descansa. Leituras consistentemente abaixo desses valores indicam pressao saudavel.' },
        { q: 'Com que frequencia devo verificar minha pressao?', a: 'A American Heart Association recomenda verificar a pressao pelo menos uma vez por ano para adultos com leituras normais. Se voce tem pressao elevada ou alta, seu medico pode recomendar monitoramento mais frequente, potencialmente diario.' },
        { q: 'O que e uma crise hipertensiva?', a: 'Uma crise hipertensiva ocorre quando as leituras ultrapassam 180/120 mmHg. E uma emergencia medica que pode levar a danos em orgaos, AVC ou infarto. Se voce medir uma leitura assim, espere 5 minutos e meica novamente. Se ainda elevada, procure atendimento medico imediato.' },
        { q: 'A pressao pode variar ao longo do dia?', a: 'Sim, a pressao flutua naturalmente ao longo do dia. E tipicamente mais baixa durante o sono e sobe pela manha. Estresse, atividade fisica, cafeina e refeicoes podem causar mudancas temporarias.' },
        { q: 'Esta ferramenta substitui o conselho medico?', a: 'Nao. Este monitor e apenas para fins informativos e de automonitoramento. Nao diagnostica nem trata nenhuma condicao medica. Sempre consulte um profissional de saude qualificado para a interpretacao de suas leituras e decisoes de tratamento.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="blood-pressure-tracker" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex items-start gap-2">
          <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          <p className="text-sm text-amber-800">{labels.disclaimer[lang]}</p>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.systolic[lang]}</label>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="120"
                min="50"
                max="300"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.diastolic[lang]}</label>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="80"
                min="30"
                max="200"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.pulse[lang]}</label>
              <input
                type="number"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                placeholder="72"
                min="30"
                max="250"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleLog}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              {labels.logReading[lang]}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {labels.reset[lang]}
            </button>
          </div>

          {/* Result Card */}
          {result && (
            <div className={`p-5 rounded-xl ${result.bg} border ${result.border} text-center`}>
              <div className="text-sm text-gray-500 mb-1">{parseInt(systolic)}/{parseInt(diastolic)} mmHg</div>
              <div className={`text-2xl font-bold ${result.color}`}>{result.category}</div>
              {pulse && <div className="text-sm text-gray-500 mt-1">{labels.pulseLabel[lang]}: {pulse} bpm</div>}
            </div>
          )}

          {/* BP Classification Reference */}
          <div className="text-xs text-gray-400 space-y-1 border-t pt-3">
            <div className="flex justify-between"><span>{'< 120/80'}</span><span className="text-green-600">{labels.normal[lang]}</span></div>
            <div className="flex justify-between"><span>120-129 / {'< 80'}</span><span className="text-yellow-600">{labels.elevated[lang]}</span></div>
            <div className="flex justify-between"><span>130-139 / 80-89</span><span className="text-orange-600">{labels.highStage1[lang]}</span></div>
            <div className="flex justify-between"><span>140+ / 90+</span><span className="text-red-600">{labels.highStage2[lang]}</span></div>
            <div className="flex justify-between"><span>180+ / 120+</span><span className="text-red-700 font-semibold">{labels.crisis[lang]}</span></div>
          </div>

          {/* Copy Button */}
          {result && (
            <button onClick={copyResults} className="w-full py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              {copied ? (
                <><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{labels.copied[lang]}</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>{labels.copy[lang]}</>
              )}
            </button>
          )}
        </div>

        {/* Averages */}
        {readings.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{labels.average[lang]}</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">{labels.systolicLabel[lang]}</div>
                <div className="text-xl font-bold text-gray-900">{avgSys}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">{labels.diastolicLabel[lang]}</div>
                <div className="text-xl font-bold text-gray-900">{avgDia}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">{labels.pulseLabel[lang]}</div>
                <div className="text-xl font-bold text-gray-900">{avgPulse}</div>
              </div>
            </div>
          </div>
        )}

        {/* Bar Chart */}
        {chartData.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{labels.last10[lang]}</h3>
            <div className="flex items-end gap-1.5 h-40">
              {chartData.map((r, i) => {
                const sysH = (r.systolic / chartMaxSys) * 100;
                const diaH = (r.diastolic / chartMaxSys) * 100;
                const barColor = classifyColorOnly(r.systolic, r.diastolic);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                      {r.systolic}/{r.diastolic} | {r.pulse} bpm
                    </div>
                    {/* Systolic bar */}
                    <div
                      className="w-full rounded-t transition-all duration-300"
                      style={{ height: `${sysH}%`, backgroundColor: barColor, opacity: 0.9 }}
                    />
                    {/* Diastolic bar */}
                    <div
                      className="w-full rounded-b transition-all duration-300"
                      style={{ height: `${diaH}%`, backgroundColor: barColor, opacity: 0.5 }}
                    />
                    <span className="text-[9px] text-gray-400 mt-1 leading-none">
                      {new Date(r.timestamp).toLocaleDateString(lang, { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-400 opacity-90" /> {labels.systolicLabel[lang]}</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-400 opacity-50" /> {labels.diastolicLabel[lang]}</div>
            </div>
          </div>
        )}

        {/* Reading History */}
        {readings.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700">{labels.history[lang]}</h3>
              <div className="flex gap-2">
                <button onClick={exportCsv} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  {labels.exportCsv[lang]}
                </button>
                <button onClick={handleClearHistory} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  {labels.clearHistory[lang]}
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {readings.map((r, i) => {
                const d = new Date(r.timestamp);
                return (
                  <div key={i} className="px-3 py-2 rounded-lg bg-gray-50 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="text-gray-500 text-xs">{d.toLocaleDateString(lang)} {d.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-medium text-gray-900">{r.systolic}/{r.diastolic}</span>
                      <span className="text-gray-400 text-xs">{r.pulse} bpm</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>)}
        </article>

        {/* FAQ */}
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
