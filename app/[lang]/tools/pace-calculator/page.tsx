'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type CalcMode = 'pace' | 'time' | 'distance';

export default function PaceCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['pace-calculator'][lang];

  const [mode, setMode] = useState<CalcMode>('pace');
  const [distance, setDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>('km');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [paceMin, setPaceMin] = useState('');
  const [paceSec, setPaceSec] = useState('');
  const [copied, setCopied] = useState(false);
  const [historyList, setHistoryList] = useState<{ mode: string; result: string }[]>([]);

  const labels = {
    mode: { en: 'Calculate', it: 'Calcola', es: 'Calcular', fr: 'Calculer', de: 'Berechne', pt: 'Calcular' },
    pace: { en: 'Pace', it: 'Ritmo', es: 'Ritmo', fr: 'Allure', de: 'Tempo', pt: 'Ritmo' },
    time: { en: 'Time', it: 'Tempo', es: 'Tiempo', fr: 'Temps', de: 'Zeit', pt: 'Tempo' },
    distance: { en: 'Distance', it: 'Distanza', es: 'Distancia', fr: 'Distance', de: 'Distanz', pt: 'Distância' },
    hours: { en: 'Hours', it: 'Ore', es: 'Horas', fr: 'Heures', de: 'Stunden', pt: 'Horas' },
    minutes: { en: 'Minutes', it: 'Minuti', es: 'Minutos', fr: 'Minutes', de: 'Minuten', pt: 'Minutos' },
    seconds: { en: 'Seconds', it: 'Secondi', es: 'Segundos', fr: 'Secondes', de: 'Sekunden', pt: 'Segundos' },
    pacePerKm: { en: 'Pace (min/km)', it: 'Ritmo (min/km)', es: 'Ritmo (min/km)', fr: 'Allure (min/km)', de: 'Tempo (min/km)', pt: 'Ritmo (min/km)' },
    pacePerMi: { en: 'Pace (min/mi)', it: 'Ritmo (min/mi)', es: 'Ritmo (min/mi)', fr: 'Allure (min/mi)', de: 'Tempo (min/mi)', pt: 'Ritmo (min/mi)' },
    speed: { en: 'Speed', it: 'Velocità', es: 'Velocidad', fr: 'Vitesse', de: 'Geschwindigkeit', pt: 'Velocidade' },
    splits: { en: 'Splits', it: 'Parziali', es: 'Parciales', fr: 'Temps Intermédiaires', de: 'Zwischenzeiten', pt: 'Parciais' },
    result: { en: 'Result', it: 'Risultato', es: 'Resultado', fr: 'Résultat', de: 'Ergebnis', pt: 'Resultado' },
    commonDistances: { en: 'Common Distances', it: 'Distanze Comuni', es: 'Distancias Comunes', fr: 'Distances Courantes', de: 'Übliche Distanzen', pt: 'Distâncias Comuns' },
    reset: { en: 'Reset', it: 'Reset', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Reiniciar' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    copy: { en: 'Copy Result', it: 'Copia Risultato', es: 'Copiar Resultado', fr: 'Copier le Résultat', de: 'Ergebnis Kopieren', pt: 'Copiar Resultado' },
    historyLabel: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  } as Record<string, Record<Locale, string>>;

  const commonDist = [
    { label: '5K', km: 5, mi: 3.10686 },
    { label: '10K', km: 10, mi: 6.21371 },
    { label: 'Half Marathon', km: 21.0975, mi: 13.1094 },
    { label: 'Marathon', km: 42.195, mi: 26.2188 },
  ];

  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = Math.round(totalSec % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const formatPace = (secPerUnit: number) => {
    const m = Math.floor(secPerUnit / 60);
    const s = Math.round(secPerUnit % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // Calculate based on mode
  const dist = parseFloat(distance) || 0;
  const totalTimeSec = (parseFloat(hours) || 0) * 3600 + (parseFloat(minutes) || 0) * 60 + (parseFloat(seconds) || 0);
  const paceSecPerUnit = (parseFloat(paceMin) || 0) * 60 + (parseFloat(paceSec) || 0);

  let resultPaceKm = 0;
  let resultPaceMi = 0;
  let resultTimeSec = 0;
  let resultDist = 0;
  let speedKmh = 0;
  let speedMph = 0;
  let hasResult = false;

  if (mode === 'pace' && dist > 0 && totalTimeSec > 0) {
    const distKm = distanceUnit === 'km' ? dist : dist * 1.60934;
    const distMi = distanceUnit === 'mi' ? dist : dist / 1.60934;
    resultPaceKm = totalTimeSec / distKm;
    resultPaceMi = totalTimeSec / distMi;
    speedKmh = distKm / (totalTimeSec / 3600);
    speedMph = distMi / (totalTimeSec / 3600);
    resultTimeSec = totalTimeSec;
    resultDist = dist;
    hasResult = true;
  } else if (mode === 'time' && dist > 0 && paceSecPerUnit > 0) {
    resultTimeSec = dist * paceSecPerUnit;
    const distKm = distanceUnit === 'km' ? dist : dist * 1.60934;
    const distMi = distanceUnit === 'mi' ? dist : dist / 1.60934;
    resultPaceKm = resultTimeSec / distKm;
    resultPaceMi = resultTimeSec / distMi;
    speedKmh = distKm / (resultTimeSec / 3600);
    speedMph = distMi / (resultTimeSec / 3600);
    resultDist = dist;
    hasResult = true;
  } else if (mode === 'distance' && totalTimeSec > 0 && paceSecPerUnit > 0) {
    resultDist = totalTimeSec / paceSecPerUnit;
    const distKm = distanceUnit === 'km' ? resultDist : resultDist * 1.60934;
    const distMi = distanceUnit === 'mi' ? resultDist : resultDist / 1.60934;
    resultPaceKm = totalTimeSec / distKm;
    resultPaceMi = totalTimeSec / distMi;
    speedKmh = distKm / (totalTimeSec / 3600);
    speedMph = distMi / (totalTimeSec / 3600);
    resultTimeSec = totalTimeSec;
    hasResult = true;
  }

  // Generate splits
  const splits: { unit: number; time: string }[] = [];
  if (hasResult && resultPaceKm > 0) {
    const unitDist = distanceUnit === 'km' ? 1 : 1;
    const pacePerUnit = distanceUnit === 'km' ? resultPaceKm : resultPaceMi;
    const totalUnits = Math.ceil(resultDist);
    for (let i = 1; i <= Math.min(totalUnits, 50); i++) {
      splits.push({ unit: i, time: formatTime(i * pacePerUnit) });
    }
  }

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Pace Calculator — Calculate Running & Walking Pace Online',
      paragraphs: [
        'Whether you are training for your first 5K or preparing for a marathon, knowing your pace is essential for effective training and race planning. Pace, typically expressed as minutes per kilometer or minutes per mile, tells you how fast you are covering each unit of distance. Our pace calculator helps runners and walkers of all levels plan their workouts and races.',
        'The calculator offers three modes: calculate pace from distance and time, calculate finish time from distance and pace, or calculate distance from time and pace. Simply select your calculation mode, enter the known values, and get instant results including pace in both km and miles, speed in km/h and mph, and detailed split times for each kilometer or mile.',
        'Split times are particularly valuable for race planning. By knowing your target pace, you can plan exactly when you should reach each kilometer marker. This prevents the common mistake of starting too fast and "hitting the wall" later in the race. Consistent pacing is one of the most important strategies for achieving your best race time.',
        'The tool supports common race distances with one-click buttons: 5K (5 km), 10K (10 km), half marathon (21.1 km), and marathon (42.2 km). You can switch between metric (km) and imperial (miles) units at any time. Whether you are a beginner jogger or an experienced ultramarathoner, this calculator adapts to your needs.',
      ],
      faq: [
        { q: 'How is running pace calculated?', a: 'Pace is calculated by dividing total time by distance. For example, if you run 10 km in 50 minutes, your pace is 50/10 = 5:00 min/km. To convert to min/mile, multiply by 1.60934 (so 5:00 min/km = 8:03 min/mi).' },
        { q: 'What is a good running pace for beginners?', a: 'A comfortable pace for beginners is typically 6:00-7:00 min/km (9:40-11:15 min/mi). The key is finding a pace where you can hold a conversation. As fitness improves, pace naturally gets faster. Most important is consistency rather than speed.' },
        { q: 'How do I calculate my marathon finish time?', a: 'Enter your target pace and the marathon distance (42.195 km or 26.2 miles). The calculator will show your estimated finish time. For example, a 5:30 min/km pace gives a marathon finish of approximately 3:51:00.' },
        { q: 'What is the difference between pace and speed?', a: 'Pace is time per unit distance (e.g., 5:00 min/km) — how long it takes to cover a set distance. Speed is distance per unit time (e.g., 12 km/h) — how far you go in a set time. They are inverses of each other. Runners typically use pace, cyclists use speed.' },
        { q: 'How do I use splits for race pacing?', a: 'Splits show cumulative time at each kilometer/mile marker. During a race, compare your actual split times with the target splits to ensure you are on pace. If you are ahead of a split, you may be going too fast. If behind, you may need to pick up the pace slightly.' },
      ],
    },
    it: {
      title: 'Calcolatore Ritmo Gratuito — Calcola il Ritmo di Corsa e Camminata',
      paragraphs: [
        'Che tu stia allenandoti per la tua prima 5K o preparandoti per una maratona, conoscere il tuo ritmo è essenziale per un allenamento efficace. Il ritmo, espresso in minuti per chilometro o per miglio, indica quanto velocemente copri ogni unità di distanza. Il nostro calcolatore aiuta corridori e camminatori di tutti i livelli.',
        'Il calcolatore offre tre modalità: calcola il ritmo da distanza e tempo, calcola il tempo di arrivo da distanza e ritmo, o calcola la distanza da tempo e ritmo. Seleziona la modalità, inserisci i valori noti e ottieni risultati istantanei inclusi ritmo, velocità e tempi parziali dettagliati.',
        'I tempi parziali sono particolarmente preziosi per pianificare le gare. Conoscendo il tuo ritmo target, puoi pianificare esattamente quando dovresti raggiungere ogni chilometro. Questo previene l\'errore comune di partire troppo veloce.',
        'Lo strumento supporta le distanze comuni con pulsanti rapidi: 5K, 10K, mezza maratona e maratona. Puoi passare tra unità metriche e imperiali in qualsiasi momento.',
      ],
      faq: [
        { q: 'Come si calcola il ritmo di corsa?', a: 'Il ritmo si calcola dividendo il tempo totale per la distanza. Se corri 10 km in 50 minuti, il tuo ritmo è 50/10 = 5:00 min/km.' },
        { q: 'Qual è un buon ritmo per principianti?', a: 'Un ritmo confortevole per principianti è tipicamente 6:00-7:00 min/km. La chiave è trovare un ritmo dove puoi conversare. La costanza è più importante della velocità.' },
        { q: 'Come calcolo il tempo di arrivo di una maratona?', a: 'Inserisci il tuo ritmo target e la distanza della maratona (42,195 km). Il calcolatore mostrerà il tempo stimato. Un ritmo di 5:30 min/km dà un tempo di circa 3:51:00.' },
        { q: 'Qual è la differenza tra ritmo e velocità?', a: 'Il ritmo è tempo per unità di distanza (es. 5:00 min/km). La velocità è distanza per unità di tempo (es. 12 km/h). Sono l\'inverso l\'uno dell\'altro. I corridori usano il ritmo, i ciclisti la velocità.' },
      ],
    },
    es: {
      title: 'Calculadora de Ritmo Gratis — Calcula tu Ritmo de Carrera Online',
      paragraphs: [
        'Ya sea que entrenes para tu primera 5K o te prepares para un maratón, conocer tu ritmo es esencial para un entrenamiento efectivo. El ritmo, expresado en minutos por kilómetro o milla, indica qué tan rápido cubres cada unidad de distancia. Nuestra calculadora ayuda a corredores y caminantes de todos los niveles.',
        'La calculadora ofrece tres modos: calcula el ritmo a partir de distancia y tiempo, calcula el tiempo de llegada a partir de distancia y ritmo, o calcula la distancia a partir de tiempo y ritmo. Selecciona tu modo, ingresa los valores y obtén resultados instantáneos con splits detallados.',
        'Los splits son valiosos para planificar carreras. Conociendo tu ritmo objetivo, puedes planificar cuándo debes llegar a cada kilómetro. Esto previene el error de empezar demasiado rápido.',
        'La herramienta soporta distancias comunes: 5K, 10K, media maratón y maratón. Puedes cambiar entre unidades métricas e imperiales en cualquier momento.',
      ],
      faq: [
        { q: '¿Cómo se calcula el ritmo de carrera?', a: 'El ritmo se calcula dividiendo el tiempo total entre la distancia. Si corres 10 km en 50 minutos, tu ritmo es 50/10 = 5:00 min/km.' },
        { q: '¿Cuál es un buen ritmo para principiantes?', a: 'Un ritmo cómodo para principiantes es 6:00-7:00 min/km. Lo clave es encontrar un ritmo donde puedas conversar. La constancia es más importante que la velocidad.' },
        { q: '¿Cómo calculo mi tiempo de maratón?', a: 'Ingresa tu ritmo objetivo y la distancia del maratón (42,195 km). Un ritmo de 5:30 min/km da un tiempo aproximado de 3:51:00.' },
        { q: '¿Cuál es la diferencia entre ritmo y velocidad?', a: 'El ritmo es tiempo por distancia (5:00 min/km). La velocidad es distancia por tiempo (12 km/h). Son inversos entre sí.' },
      ],
    },
    fr: {
      title: 'Calculateur d\'Allure Gratuit — Calculez Votre Allure de Course en Ligne',
      paragraphs: [
        'Que vous vous entraîniez pour votre premier 5K ou prépariez un marathon, connaître votre allure est essentiel pour un entraînement efficace. L\'allure, exprimée en minutes par kilomètre ou par mile, indique à quelle vitesse vous parcourez chaque unité de distance. Notre calculateur aide coureurs et marcheurs de tous niveaux.',
        'Le calculateur offre trois modes : calculer l\'allure à partir de la distance et du temps, calculer le temps d\'arrivée, ou calculer la distance. Sélectionnez votre mode, entrez les valeurs et obtenez des résultats instantanés avec des temps intermédiaires détaillés.',
        'Les temps intermédiaires sont précieux pour planifier les courses. En connaissant votre allure cible, vous pouvez planifier exactement quand atteindre chaque kilomètre. Cela évite l\'erreur de partir trop vite.',
        'L\'outil supporte les distances courantes : 5K, 10K, semi-marathon et marathon. Vous pouvez basculer entre unités métriques et impériales.',
      ],
      faq: [
        { q: 'Comment calculer l\'allure de course ?', a: 'L\'allure se calcule en divisant le temps total par la distance. Si vous courez 10 km en 50 minutes, votre allure est 5:00 min/km.' },
        { q: 'Quelle allure pour un débutant ?', a: 'Une allure confortable pour débutant est 6:00-7:00 min/km. L\'essentiel est de pouvoir tenir une conversation. La régularité prime sur la vitesse.' },
        { q: 'Comment calculer mon temps de marathon ?', a: 'Entrez votre allure cible et la distance du marathon (42,195 km). Une allure de 5:30 min/km donne environ 3:51:00.' },
        { q: 'Quelle différence entre allure et vitesse ?', a: 'L\'allure est le temps par distance (5:00 min/km). La vitesse est la distance par temps (12 km/h). Ce sont des inverses.' },
      ],
    },
    de: {
      title: 'Kostenloser Tempo-Rechner — Lauf- und Gehtempo Online Berechnen',
      paragraphs: [
        'Ob Sie für Ihren ersten 5K trainieren oder sich auf einen Marathon vorbereiten — Ihr Tempo zu kennen ist für effektives Training unerlässlich. Das Tempo, ausgedrückt in Minuten pro Kilometer oder Meile, zeigt, wie schnell Sie jede Distanzeinheit zurücklegen. Unser Rechner hilft Läufern und Gehern aller Niveaus.',
        'Der Rechner bietet drei Modi: Tempo aus Distanz und Zeit berechnen, Zielzeit aus Distanz und Tempo berechnen, oder Distanz aus Zeit und Tempo berechnen. Wählen Sie Ihren Modus, geben Sie die Werte ein und erhalten Sie sofortige Ergebnisse mit detaillierten Zwischenzeiten.',
        'Zwischenzeiten sind besonders wertvoll für die Rennplanung. Mit Ihrem Zieltempo können Sie genau planen, wann Sie jeden Kilometer erreichen sollten. Dies verhindert den häufigen Fehler, zu schnell zu starten.',
        'Das Tool unterstützt gängige Renndistanzen: 5K, 10K, Halbmarathon und Marathon. Sie können jederzeit zwischen metrischen und imperialen Einheiten wechseln.',
      ],
      faq: [
        { q: 'Wie wird das Lauftempo berechnet?', a: 'Das Tempo wird berechnet, indem die Gesamtzeit durch die Distanz geteilt wird. Wenn Sie 10 km in 50 Minuten laufen, ist Ihr Tempo 5:00 min/km.' },
        { q: 'Was ist ein gutes Tempo für Anfänger?', a: 'Ein komfortables Tempo für Anfänger ist 6:00-7:00 min/km. Wichtig ist, in einem Tempo zu laufen, bei dem man sich unterhalten kann. Regelmäßigkeit ist wichtiger als Geschwindigkeit.' },
        { q: 'Wie berechne ich meine Marathon-Zielzeit?', a: 'Geben Sie Ihr Zieltempo und die Marathon-Distanz (42,195 km) ein. Ein Tempo von 5:30 min/km ergibt ca. 3:51:00.' },
        { q: 'Was ist der Unterschied zwischen Tempo und Geschwindigkeit?', a: 'Tempo ist Zeit pro Distanz (5:00 min/km). Geschwindigkeit ist Distanz pro Zeit (12 km/h). Sie sind gegenseitige Kehrwerte.' },
      ],
    },
    pt: {
      title: 'Calculadora de Ritmo Grátis — Calcule seu Ritmo de Corrida Online',
      paragraphs: [
        'Seja treinando para sua primeira 5K ou se preparando para uma maratona, conhecer seu ritmo é essencial para um treino eficaz. O ritmo, expresso em minutos por quilômetro ou milha, indica quão rápido você cobre cada unidade de distância. Nossa calculadora ajuda corredores e caminhantes de todos os níveis.',
        'A calculadora oferece três modos: calcular ritmo a partir de distância e tempo, calcular tempo de chegada, ou calcular distância. Selecione seu modo, insira os valores e obtenha resultados instantâneos com parciais detalhados.',
        'Os parciais são valiosos para planejar corridas. Conhecendo seu ritmo alvo, você pode planejar quando deve chegar a cada quilômetro. Isso previne o erro de começar rápido demais.',
        'A ferramenta suporta distâncias comuns: 5K, 10K, meia maratona e maratona. Você pode alternar entre unidades métricas e imperiais.',
      ],
      faq: [
        { q: 'Como se calcula o ritmo de corrida?', a: 'O ritmo é calculado dividindo o tempo total pela distância. Se você corre 10 km em 50 minutos, seu ritmo é 5:00 min/km.' },
        { q: 'Qual é um bom ritmo para iniciantes?', a: 'Um ritmo confortável para iniciantes é 6:00-7:00 min/km. O importante é manter um ritmo onde você consiga conversar. Consistência é mais importante que velocidade.' },
        { q: 'Como calculo meu tempo de maratona?', a: 'Insira seu ritmo alvo e a distância da maratona (42,195 km). Um ritmo de 5:30 min/km dá aproximadamente 3:51:00.' },
        { q: 'Qual a diferença entre ritmo e velocidade?', a: 'Ritmo é tempo por distância (5:00 min/km). Velocidade é distância por tempo (12 km/h). São inversos um do outro.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="pace-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Mode selector */}
          <div className="flex gap-2">
            {(['pace', 'time', 'distance'] as CalcMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {labels[m][lang]}
              </button>
            ))}
          </div>

          {/* Distance input (for pace and time modes) */}
          {(mode === 'pace' || mode === 'time') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.distance[lang]}</label>
              <div className="flex gap-2">
                <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="10" className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
                <select value={distanceUnit} onChange={(e) => setDistanceUnit(e.target.value as 'km' | 'mi')} className="border border-gray-300 rounded-lg px-3 py-2">
                  <option value="km">km</option>
                  <option value="mi">mi</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {commonDist.map((d) => (
                  <button key={d.label} onClick={() => setDistance(String(distanceUnit === 'km' ? d.km : d.mi))} className="text-xs bg-gray-100 hover:bg-blue-100 text-gray-600 px-3 py-1 rounded-full border border-gray-200">
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time input (for pace and distance modes) */}
          {(mode === 'pace' || mode === 'distance') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.time[lang]}</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0" min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-blue-500" />
                  <span className="text-xs text-gray-400 block text-center mt-1">{labels.hours[lang]}</span>
                </div>
                <div>
                  <input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="50" min="0" max="59" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-blue-500" />
                  <span className="text-xs text-gray-400 block text-center mt-1">{labels.minutes[lang]}</span>
                </div>
                <div>
                  <input type="number" value={seconds} onChange={(e) => setSeconds(e.target.value)} placeholder="0" min="0" max="59" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-blue-500" />
                  <span className="text-xs text-gray-400 block text-center mt-1">{labels.seconds[lang]}</span>
                </div>
              </div>
            </div>
          )}

          {/* Pace input (for time and distance modes) */}
          {(mode === 'time' || mode === 'distance') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {distanceUnit === 'km' ? labels.pacePerKm[lang] : labels.pacePerMi[lang]}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input type="number" value={paceMin} onChange={(e) => setPaceMin(e.target.value)} placeholder="5" min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-blue-500" />
                  <span className="text-xs text-gray-400 block text-center mt-1">{labels.minutes[lang]}</span>
                </div>
                <div>
                  <input type="number" value={paceSec} onChange={(e) => setPaceSec(e.target.value)} placeholder="0" min="0" max="59" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-blue-500" />
                  <span className="text-xs text-gray-400 block text-center mt-1">{labels.seconds[lang]}</span>
                </div>
              </div>
            </div>
          )}

          {/* Reset and Copy */}
          <div className="flex gap-2">
            <button onClick={() => { setDistance(''); setHours(''); setMinutes(''); setSeconds(''); setPaceMin(''); setPaceSec(''); }} className="flex-1 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
              {labels.reset[lang]}
            </button>
            {hasResult && (
              <button onClick={() => {
                let t = '';
                if (mode === 'pace') t = `${formatPace(resultPaceKm)} min/km | ${formatPace(resultPaceMi)} min/mi`;
                else if (mode === 'time') t = formatTime(resultTimeSec);
                else t = `${resultDist.toFixed(2)} ${distanceUnit}`;
                navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 1500);
              }} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">
                {copied ? labels.copied[lang] : labels.copy[lang]}
              </button>
            )}
          </div>

          {/* Results */}
          {hasResult && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {mode === 'pace' && (
                  <>
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-center">
                      <div className="text-xs text-gray-500">{labels.pacePerKm[lang]}</div>
                      <div className="text-2xl font-bold text-blue-700">{formatPace(resultPaceKm)}</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-center">
                      <div className="text-xs text-gray-500">{labels.pacePerMi[lang]}</div>
                      <div className="text-2xl font-bold text-blue-700">{formatPace(resultPaceMi)}</div>
                    </div>
                  </>
                )}
                {mode === 'time' && (
                  <div className="bg-green-50 p-3 rounded-xl border border-green-200 text-center col-span-2">
                    <div className="text-xs text-gray-500">{labels.time[lang]}</div>
                    <div className="text-3xl font-bold text-green-700">{formatTime(resultTimeSec)}</div>
                  </div>
                )}
                {mode === 'distance' && (
                  <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-center col-span-2">
                    <div className="text-xs text-gray-500">{labels.distance[lang]}</div>
                    <div className="text-3xl font-bold text-purple-700">{resultDist.toFixed(2)} {distanceUnit}</div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-xs text-gray-500">{labels.speed[lang]}</div>
                  <div className="text-lg font-bold text-gray-900">{speedKmh.toFixed(1)} km/h</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-xs text-gray-500">{labels.speed[lang]}</div>
                  <div className="text-lg font-bold text-gray-900">{speedMph.toFixed(1)} mph</div>
                </div>
              </div>

              {/* Splits */}
              {splits.length > 0 && splits.length <= 50 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">{labels.splits[lang]}</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-48 overflow-y-auto">
                    {splits.map((s) => (
                      <div key={s.unit} className="flex justify-between text-sm font-mono px-2 py-1 bg-white rounded">
                        <span className="text-gray-500">{s.unit} {distanceUnit}</span>
                        <span className="text-gray-900">{s.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save to history */}
              <button onClick={() => {
                let res = '';
                if (mode === 'pace') res = `${formatPace(resultPaceKm)} min/km`;
                else if (mode === 'time') res = formatTime(resultTimeSec);
                else res = `${resultDist.toFixed(2)} ${distanceUnit}`;
                setHistoryList(prev => [{ mode, result: res }, ...prev].slice(0, 5));
              }} className="w-full py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-700 transition-colors">
                + {labels.historyLabel[lang]}
              </button>
            </div>
          )}

          {/* History panel */}
          {historyList.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">{labels.historyLabel[lang]}</div>
              <div className="space-y-1">
                {historyList.map((h, i) => (
                  <div key={i} className="flex justify-between text-sm py-1 px-2 bg-white rounded">
                    <span className="text-gray-500 capitalize">{labels[h.mode]?.[lang] || h.mode}</span>
                    <span className="font-mono text-gray-900">{h.result}</span>
                  </div>
                ))}
              </div>
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
