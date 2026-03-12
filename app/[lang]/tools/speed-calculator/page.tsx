'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  mode: { en: 'Calculate', it: 'Calcola', es: 'Calcular', fr: 'Calculer', de: 'Berechne', pt: 'Calcular' },
  speed: { en: 'Speed', it: 'Velocità', es: 'Velocidad', fr: 'Vitesse', de: 'Geschwindigkeit', pt: 'Velocidade' },
  distance: { en: 'Distance', it: 'Distanza', es: 'Distancia', fr: 'Distance', de: 'Entfernung', pt: 'Distância' },
  time: { en: 'Time', it: 'Tempo', es: 'Tiempo', fr: 'Temps', de: 'Zeit', pt: 'Tempo' },
  hours: { en: 'hours', it: 'ore', es: 'horas', fr: 'heures', de: 'Stunden', pt: 'horas' },
  minutes: { en: 'minutes', it: 'minuti', es: 'minutos', fr: 'minutes', de: 'Minuten', pt: 'minutos' },
  result: { en: 'Result', it: 'Risultato', es: 'Resultado', fr: 'Résultat', de: 'Ergebnis', pt: 'Resultado' },
  reset: { en: 'Reset', it: 'Reset', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Reiniciar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  unit: { en: 'Unit System', it: 'Sistema di Unità', es: 'Sistema de Unidades', fr: 'Système d\'Unités', de: 'Einheitensystem', pt: 'Sistema de Unidades' },
  metric: { en: 'Metric (km)', it: 'Metrico (km)', es: 'Métrico (km)', fr: 'Métrique (km)', de: 'Metrisch (km)', pt: 'Métrico (km)' },
  imperial: { en: 'Imperial (mi)', it: 'Imperiale (mi)', es: 'Imperial (mi)', fr: 'Impérial (mi)', de: 'Imperial (mi)', pt: 'Imperial (mi)' },
  invalidDistance: { en: 'Enter a positive distance', it: 'Inserisci una distanza positiva', es: 'Ingresa una distancia positiva', fr: 'Entrez une distance positive', de: 'Geben Sie eine positive Entfernung ein', pt: 'Insira uma distância positiva' },
  invalidSpeed: { en: 'Enter a positive speed', it: 'Inserisci una velocità positiva', es: 'Ingresa una velocidad positiva', fr: 'Entrez une vitesse positive', de: 'Geben Sie eine positive Geschwindigkeit ein', pt: 'Insira uma velocidade positiva' },
  invalidTime: { en: 'Enter a valid time', it: 'Inserisci un tempo valido', es: 'Ingresa un tiempo válido', fr: 'Entrez un temps valide', de: 'Geben Sie eine gültige Zeit ein', pt: 'Insira um tempo válido' },
};

type Mode = 'speed' | 'distance' | 'time';

export default function SpeedCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['speed-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [mode, setMode] = useState<Mode>('speed');
  const [distance, setDistance] = useState('');
  const [speed, setSpeed] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [history, setHistory] = useState<{ label: string; value: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const distUnit = unitSystem === 'metric' ? 'km' : 'mi';
  const speedUnit = unitSystem === 'metric' ? 'km/h' : 'mph';

  const distNum = parseFloat(distance) || 0;
  const spdNum = parseFloat(speed) || 0;
  const timeHrs = (parseFloat(hours) || 0) + (parseFloat(minutes) || 0) / 60;

  const distError = touched.distance && distance !== '' && distNum <= 0;
  const speedError = touched.speed && speed !== '' && spdNum <= 0;
  const timeError = touched.time && (hours !== '' || minutes !== '') && timeHrs <= 0;

  let result = '';
  let resultIcon = '';
  if (mode === 'speed' && distNum > 0 && timeHrs > 0) {
    const s = distNum / timeHrs;
    result = `${s.toFixed(2)} ${speedUnit}`;
    resultIcon = '\u{1F3CE}\u{FE0F}';
  } else if (mode === 'distance' && spdNum > 0 && timeHrs > 0) {
    const d = spdNum * timeHrs;
    result = `${d.toFixed(2)} ${distUnit}`;
    resultIcon = '\u{1F4CF}';
  } else if (mode === 'time' && distNum > 0 && spdNum > 0) {
    const tHrs = distNum / spdNum;
    const h = Math.floor(tHrs);
    const m = Math.round((tHrs - h) * 60);
    result = `${h} ${t('hours')} ${m} ${t('minutes')}`;
    resultIcon = '\u{23F1}\u{FE0F}';
  }

  const handleReset = () => {
    setDistance('');
    setSpeed('');
    setHours('');
    setMinutes('');
    setTouched({});
  };

  const saveToHistory = () => {
    if (result) {
      setHistory(prev => [{ label: `${t(mode)}`, value: result }, ...prev].slice(0, 5));
    }
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Auto-save to history when result changes
  const prevResult = useState<string>('');
  if (result && result !== prevResult[0]) {
    prevResult[1](result);
    if (result) saveToHistory();
  }

  const modes: { key: Mode; label: string; icon: string }[] = [
    { key: 'speed', label: t('speed'), icon: '\u{1F3CE}\u{FE0F}' },
    { key: 'distance', label: t('distance'), icon: '\u{1F4CF}' },
    { key: 'time', label: t('time'), icon: '\u{23F1}\u{FE0F}' },
  ];

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Speed, Distance, and Time Calculator: The Complete Guide',
      paragraphs: [
        'The relationship between speed, distance, and time is one of the most fundamental concepts in physics and everyday life. The basic formula is simple: Speed = Distance / Time. From this single equation, you can derive the other two values — distance equals speed multiplied by time, and time equals distance divided by speed.',
        'Our speed calculator lets you solve for any of the three variables. Whether you are planning a road trip and want to know how long the drive will take, or you are a runner curious about your average pace, this tool gives you instant answers. Just select which variable you want to calculate, enter the other two values, and get your result.',
        'In practice, this calculation appears everywhere. Logistics companies use it to estimate delivery times. Athletes track their training speed to monitor progress. Pilots compute ground speed to manage fuel consumption. Even simple questions like "how long will my commute take at this speed?" rely on this formula.',
        'The tool supports hours and minutes for flexible time input. Results are displayed in km/h for speed, km for distance, and hours plus minutes for time. For quick conversions, remember that 1 km/h is approximately 0.621 mph, and 1 mile is about 1.609 km.'
      ],
      faq: [
        { q: 'How do I calculate average speed for a trip with varying speeds?', a: 'Divide the total distance of your trip by the total time taken. For example, if you drove 200 km in 3 hours (including stops), your average speed is 200/3 = 66.7 km/h, regardless of how fast you went at different points.' },
        { q: 'Can I use this calculator for running or cycling pace?', a: 'Yes. Enter your distance in kilometers and your time in hours and minutes. The speed result gives you your average pace in km/h. For per-kilometer pace, divide 60 by your speed in km/h to get minutes per km.' },
        { q: 'What is the difference between speed and velocity?', a: 'Speed is a scalar quantity — it only measures how fast something moves. Velocity is a vector quantity that includes both speed and direction. This calculator computes speed (magnitude only).' },
        { q: 'How do I convert km/h to mph?', a: 'Multiply the km/h value by 0.621371 to get mph. For example, 100 km/h equals approximately 62.14 mph. Conversely, multiply mph by 1.60934 to convert to km/h.' },
        { q: 'Why does the calculator show 0 when I leave a field empty?', a: 'The calculator requires both input values to compute a result. If either field is empty or zero, the formula cannot produce a meaningful answer, so no result is displayed.' }
      ]
    },
    it: {
      title: 'Calcolatore di Velocità, Distanza e Tempo: La Guida Completa',
      paragraphs: [
        'La relazione tra velocità, distanza e tempo è uno dei concetti più fondamentali della fisica e della vita quotidiana. La formula base è semplice: Velocità = Distanza / Tempo. Da questa singola equazione si possono ricavare gli altri due valori — la distanza è uguale alla velocità per il tempo, e il tempo è uguale alla distanza divisa per la velocità.',
        'Il nostro calcolatore di velocità ti permette di risolvere per ognuna delle tre variabili. Che tu stia pianificando un viaggio in auto e voglia sapere quanto durerà, o che sia un corridore curioso della propria andatura media, questo strumento ti dà risposte istantanee.',
        'In pratica, questo calcolo appare ovunque. Le aziende di logistica lo usano per stimare i tempi di consegna. Gli atleti monitorano la velocità di allenamento per verificare i progressi. I piloti calcolano la velocità al suolo per gestire il consumo di carburante.',
        'Lo strumento supporta ore e minuti per un inserimento flessibile del tempo. I risultati sono visualizzati in km/h per la velocità, km per la distanza e ore più minuti per il tempo. Per conversioni rapide, ricorda che 1 km/h equivale a circa 0,621 mph.'
      ],
      faq: [
        { q: 'Come calcolo la velocità media per un viaggio con velocità variabili?', a: 'Dividi la distanza totale del viaggio per il tempo totale impiegato. Ad esempio, se hai percorso 200 km in 3 ore (soste incluse), la velocità media è 200/3 = 66,7 km/h.' },
        { q: 'Posso usare questo calcolatore per la corsa o il ciclismo?', a: 'Sì. Inserisci la distanza in chilometri e il tempo in ore e minuti. Il risultato della velocità ti dà l\'andatura media in km/h. Per il passo al chilometro, dividi 60 per la velocità in km/h.' },
        { q: 'Qual è la differenza tra velocità scalare e vettoriale?', a: 'La velocità scalare misura solo quanto velocemente si muove qualcosa. La velocità vettoriale include sia la rapidità che la direzione. Questo calcolatore calcola la velocità scalare.' },
        { q: 'Come converto km/h in mph?', a: 'Moltiplica il valore in km/h per 0,621371 per ottenere mph. Ad esempio, 100 km/h equivalgono a circa 62,14 mph. Al contrario, moltiplica mph per 1,60934 per convertire in km/h.' },
        { q: 'Perché il calcolatore mostra 0 quando lascio un campo vuoto?', a: 'Il calcolatore richiede entrambi i valori di input per calcolare un risultato. Se uno dei campi è vuoto o zero, la formula non può produrre una risposta significativa.' }
      ]
    },
    es: {
      title: 'Calculadora de Velocidad, Distancia y Tiempo: Guía Completa',
      paragraphs: [
        'La relación entre velocidad, distancia y tiempo es uno de los conceptos más fundamentales de la física y la vida cotidiana. La fórmula básica es simple: Velocidad = Distancia / Tiempo. De esta única ecuación se pueden derivar los otros dos valores.',
        'Nuestra calculadora de velocidad te permite resolver cualquiera de las tres variables. Ya sea que estés planificando un viaje por carretera y quieras saber cuánto durará, o seas un corredor curioso sobre tu ritmo promedio, esta herramienta te da respuestas instantáneas.',
        'En la práctica, este cálculo aparece en todas partes. Las empresas de logística lo usan para estimar tiempos de entrega. Los atletas rastrean su velocidad de entrenamiento. Los pilotos calculan la velocidad sobre el terreno para gestionar el consumo de combustible.',
        'La herramienta admite horas y minutos para una entrada flexible del tiempo. Los resultados se muestran en km/h para velocidad, km para distancia y horas más minutos para tiempo. Para conversiones rápidas, recuerda que 1 km/h equivale aproximadamente a 0,621 mph.'
      ],
      faq: [
        { q: '¿Cómo calculo la velocidad media de un viaje con velocidades variables?', a: 'Divide la distancia total del viaje por el tiempo total empleado. Por ejemplo, si recorriste 200 km en 3 horas (incluyendo paradas), tu velocidad media es 200/3 = 66,7 km/h.' },
        { q: '¿Puedo usar esta calculadora para correr o andar en bicicleta?', a: 'Sí. Ingresa la distancia en kilómetros y el tiempo en horas y minutos. El resultado te da tu ritmo medio en km/h. Para el ritmo por kilómetro, divide 60 entre tu velocidad en km/h.' },
        { q: '¿Cuál es la diferencia entre rapidez y velocidad?', a: 'La rapidez es una magnitud escalar que solo mide qué tan rápido se mueve algo. La velocidad es vectorial e incluye rapidez y dirección. Esta calculadora calcula la rapidez.' },
        { q: '¿Cómo convierto km/h a mph?', a: 'Multiplica el valor en km/h por 0,621371 para obtener mph. Por ejemplo, 100 km/h equivalen a aproximadamente 62,14 mph.' },
        { q: '¿Por qué no aparece resultado cuando dejo un campo vacío?', a: 'La calculadora necesita ambos valores de entrada para calcular un resultado. Si un campo está vacío o es cero, la fórmula no puede producir una respuesta válida.' }
      ]
    },
    fr: {
      title: 'Calculateur de Vitesse, Distance et Temps : Le Guide Complet',
      paragraphs: [
        'La relation entre vitesse, distance et temps est l\'un des concepts les plus fondamentaux de la physique et de la vie quotidienne. La formule de base est simple : Vitesse = Distance / Temps. De cette seule équation, on peut dériver les deux autres valeurs.',
        'Notre calculateur de vitesse vous permet de résoudre n\'importe laquelle des trois variables. Que vous planifiiez un voyage en voiture ou que vous soyez un coureur curieux de votre allure moyenne, cet outil vous donne des réponses instantanées.',
        'En pratique, ce calcul apparaît partout. Les entreprises de logistique l\'utilisent pour estimer les délais de livraison. Les athlètes surveillent leur vitesse d\'entraînement. Les pilotes calculent la vitesse sol pour gérer la consommation de carburant.',
        'L\'outil prend en charge les heures et les minutes pour une saisie flexible du temps. Les résultats sont affichés en km/h pour la vitesse, km pour la distance, et heures plus minutes pour le temps. Pour les conversions rapides, sachez que 1 km/h vaut environ 0,621 mph.'
      ],
      faq: [
        { q: 'Comment calculer la vitesse moyenne d\'un trajet à vitesses variables ?', a: 'Divisez la distance totale par le temps total. Par exemple, si vous avez parcouru 200 km en 3 heures (arrêts compris), votre vitesse moyenne est de 200/3 = 66,7 km/h.' },
        { q: 'Puis-je utiliser ce calculateur pour la course ou le vélo ?', a: 'Oui. Entrez la distance en kilomètres et le temps en heures et minutes. Le résultat vous donne votre allure moyenne en km/h.' },
        { q: 'Quelle est la différence entre vitesse scalaire et vectorielle ?', a: 'La vitesse scalaire ne mesure que la rapidité du déplacement. La vitesse vectorielle inclut la rapidité et la direction. Ce calculateur calcule la vitesse scalaire.' },
        { q: 'Comment convertir km/h en mph ?', a: 'Multipliez la valeur en km/h par 0,621371 pour obtenir mph. Par exemple, 100 km/h équivalent à environ 62,14 mph.' },
        { q: 'Pourquoi aucun résultat ne s\'affiche quand un champ est vide ?', a: 'Le calculateur nécessite les deux valeurs d\'entrée pour calculer un résultat. Si un champ est vide ou à zéro, la formule ne peut pas produire de réponse valable.' }
      ]
    },
    de: {
      title: 'Geschwindigkeit, Entfernung und Zeit Rechner: Der Komplette Leitfaden',
      paragraphs: [
        'Die Beziehung zwischen Geschwindigkeit, Entfernung und Zeit ist eines der grundlegendsten Konzepte der Physik und des Alltags. Die Grundformel ist einfach: Geschwindigkeit = Entfernung / Zeit. Aus dieser einen Gleichung lassen sich die beiden anderen Werte ableiten.',
        'Unser Geschwindigkeitsrechner ermöglicht es Ihnen, jede der drei Variablen zu berechnen. Ob Sie eine Autofahrt planen und wissen möchten, wie lange sie dauert, oder ob Sie als Läufer Ihr Durchschnittstempo kennen möchten — dieses Tool gibt Ihnen sofortige Antworten.',
        'In der Praxis findet sich diese Berechnung überall. Logistikunternehmen nutzen sie zur Schätzung von Lieferzeiten. Sportler verfolgen ihre Trainingsgeschwindigkeit. Piloten berechnen die Bodengeschwindigkeit für das Treibstoffmanagement.',
        'Das Tool unterstützt Stunden und Minuten für flexible Zeiteingabe. Ergebnisse werden in km/h für Geschwindigkeit, km für Entfernung und Stunden plus Minuten für Zeit angezeigt. Zur schnellen Umrechnung: 1 km/h entspricht etwa 0,621 mph.'
      ],
      faq: [
        { q: 'Wie berechne ich die Durchschnittsgeschwindigkeit bei wechselnden Geschwindigkeiten?', a: 'Teilen Sie die Gesamtstrecke durch die Gesamtzeit. Wenn Sie beispielsweise 200 km in 3 Stunden (einschließlich Stopps) gefahren sind, beträgt Ihre Durchschnittsgeschwindigkeit 200/3 = 66,7 km/h.' },
        { q: 'Kann ich diesen Rechner zum Laufen oder Radfahren verwenden?', a: 'Ja. Geben Sie die Entfernung in Kilometern und die Zeit in Stunden und Minuten ein. Das Ergebnis zeigt Ihr Durchschnittstempo in km/h.' },
        { q: 'Was ist der Unterschied zwischen Geschwindigkeit und Tempo?', a: 'Geschwindigkeit ist eine skalare Größe, die nur misst, wie schnell sich etwas bewegt. Tempo (Velocity) ist eine Vektorgröße, die Geschwindigkeit und Richtung umfasst. Dieser Rechner berechnet die skalare Geschwindigkeit.' },
        { q: 'Wie rechne ich km/h in mph um?', a: 'Multiplizieren Sie den km/h-Wert mit 0,621371, um mph zu erhalten. Beispielsweise entsprechen 100 km/h etwa 62,14 mph.' },
        { q: 'Warum wird kein Ergebnis angezeigt, wenn ein Feld leer ist?', a: 'Der Rechner benötigt beide Eingabewerte. Wenn ein Feld leer oder null ist, kann die Formel kein sinnvolles Ergebnis liefern.' }
      ]
    },
    pt: {
      title: 'Calculadora de Velocidade, Distância e Tempo: O Guia Completo',
      paragraphs: [
        'A relação entre velocidade, distância e tempo é um dos conceitos mais fundamentais da física e do cotidiano. A fórmula básica é simples: Velocidade = Distância / Tempo. Desta única equação, podem-se derivar os outros dois valores.',
        'Nossa calculadora de velocidade permite resolver qualquer uma das três variáveis. Se você está planejando uma viagem de carro e quer saber quanto tempo levará, ou é um corredor curioso sobre seu ritmo médio, esta ferramenta dá respostas instantâneas.',
        'Na prática, esse cálculo aparece em todo lugar. Empresas de logística o usam para estimar prazos de entrega. Atletas monitoram sua velocidade de treino. Pilotos calculam a velocidade no solo para gerenciar o consumo de combustível.',
        'A ferramenta suporta horas e minutos para entrada flexível de tempo. Os resultados são exibidos em km/h para velocidade, km para distância e horas mais minutos para tempo. Para conversões rápidas, lembre-se de que 1 km/h equivale a aproximadamente 0,621 mph.'
      ],
      faq: [
        { q: 'Como calculo a velocidade média de uma viagem com velocidades variáveis?', a: 'Divida a distância total pelo tempo total. Por exemplo, se você percorreu 200 km em 3 horas (incluindo paradas), sua velocidade média é 200/3 = 66,7 km/h.' },
        { q: 'Posso usar esta calculadora para corrida ou ciclismo?', a: 'Sim. Insira a distância em quilômetros e o tempo em horas e minutos. O resultado mostra seu ritmo médio em km/h.' },
        { q: 'Qual é a diferença entre rapidez e velocidade?', a: 'Rapidez é uma grandeza escalar que mede apenas quão rápido algo se move. Velocidade é vetorial e inclui rapidez e direção. Esta calculadora calcula a rapidez.' },
        { q: 'Como converto km/h para mph?', a: 'Multiplique o valor em km/h por 0,621371 para obter mph. Por exemplo, 100 km/h equivalem a aproximadamente 62,14 mph.' },
        { q: 'Por que nenhum resultado aparece quando deixo um campo vazio?', a: 'A calculadora precisa dos dois valores de entrada para calcular um resultado. Se um campo estiver vazio ou zero, a fórmula não pode produzir uma resposta válida.' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="speed-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Unit system toggle */}
          <div className="flex gap-2">
            <button onClick={() => setUnitSystem('metric')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${unitSystem === 'metric' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t('metric')}
            </button>
            <button onClick={() => setUnitSystem('imperial')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${unitSystem === 'imperial' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t('imperial')}
            </button>
          </div>

          {/* Mode selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('mode')}</label>
            <div className="flex gap-2">
              {modes.map((m) => (
                <button key={m.key} onClick={() => setMode(m.key)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${mode === m.key ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  <span className="mr-1">{m.icon}</span> {m.label}
                </button>
              ))}
            </div>
          </div>

          {mode !== 'distance' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('distance')} ({distUnit})</label>
              <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} onBlur={() => setTouched(p => ({ ...p, distance: true }))} placeholder="0"
                className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${distError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
              {distError && <p className="text-red-500 text-xs mt-1">{t('invalidDistance')}</p>}
            </div>
          )}

          {mode !== 'speed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('speed')} ({speedUnit})</label>
              <input type="number" value={speed} onChange={(e) => setSpeed(e.target.value)} onBlur={() => setTouched(p => ({ ...p, speed: true }))} placeholder="0"
                className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${speedError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
              {speedError && <p className="text-red-500 text-xs mt-1">{t('invalidSpeed')}</p>}
            </div>
          )}

          {mode !== 'time' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('time')}</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} onBlur={() => setTouched(p => ({ ...p, time: true }))} placeholder="0"
                    className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${timeError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                  <span className="text-xs text-gray-500">{t('hours')}</span>
                </div>
                <div>
                  <input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} onBlur={() => setTouched(p => ({ ...p, time: true }))} placeholder="0"
                    className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${timeError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                  <span className="text-xs text-gray-500">{t('minutes')}</span>
                </div>
              </div>
              {timeError && <p className="text-red-500 text-xs mt-1">{t('invalidTime')}</p>}
            </div>
          )}

          {/* Reset button */}
          <button onClick={handleReset} className="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
            {t('reset')}
          </button>

          {result && (
            <div className="mt-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">{t('result')}</div>
                  <div className="text-3xl font-bold text-blue-700 flex items-center gap-2">
                    <span>{resultIcon}</span> {result}
                  </div>
                </div>
                <button onClick={copyResult} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  {copied ? t('copied') : t('copy')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">{t('history')}</h3>
              <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:text-red-700">Clear</button>
            </div>
            <div className="space-y-1">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between text-sm px-2 py-1.5 bg-gray-50 rounded">
                  <span className="text-gray-500">{h.label}</span>
                  <span className="font-semibold text-gray-900">{h.value}</span>
                </div>
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
