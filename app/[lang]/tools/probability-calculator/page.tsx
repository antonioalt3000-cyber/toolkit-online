'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type Mode = 'single' | 'combined' | 'conditional' | 'permcomb';

export default function ProbabilityCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['probability-calculator'][lang];

  const [mode, setMode] = useState<Mode>('single');
  const [favorable, setFavorable] = useState('');
  const [total, setTotal] = useState('');
  const [probA, setProbA] = useState('');
  const [probB, setProbB] = useState('');
  const [combType, setCombType] = useState<'and' | 'or'>('and');
  const [probBA, setProbBA] = useState('');
  const [n, setN] = useState('');
  const [r, setR] = useState('');
  const [pcType, setPcType] = useState<'perm' | 'comb'>('perm');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const labels: Record<string, Record<Locale, string>> = {
    single: { en: 'Single Event', it: 'Evento Singolo', es: 'Evento Simple', fr: 'Événement Simple', de: 'Einzelereignis', pt: 'Evento Simples' },
    combined: { en: 'Combined Events', it: 'Eventi Combinati', es: 'Eventos Combinados', fr: 'Événements Combinés', de: 'Kombinierte Ereignisse', pt: 'Eventos Combinados' },
    conditional: { en: 'Conditional', it: 'Condizionale', es: 'Condicional', fr: 'Conditionnel', de: 'Bedingt', pt: 'Condicional' },
    permcomb: { en: 'Perm & Comb', it: 'Perm & Comb', es: 'Perm y Comb', fr: 'Perm & Comb', de: 'Perm & Komb', pt: 'Perm e Comb' },
    favorable: { en: 'Favorable outcomes', it: 'Esiti favorevoli', es: 'Resultados favorables', fr: 'Résultats favorables', de: 'Günstige Ergebnisse', pt: 'Resultados favoráveis' },
    totalOutcomes: { en: 'Total outcomes', it: 'Esiti totali', es: 'Resultados totales', fr: 'Résultats totaux', de: 'Gesamtergebnisse', pt: 'Resultados totais' },
    probability: { en: 'Probability', it: 'Probabilità', es: 'Probabilidad', fr: 'Probabilité', de: 'Wahrscheinlichkeit', pt: 'Probabilidade' },
    formula: { en: 'Formula', it: 'Formula', es: 'Fórmula', fr: 'Formule', de: 'Formel', pt: 'Fórmula' },
    result: { en: 'Result', it: 'Risultato', es: 'Resultado', fr: 'Résultat', de: 'Ergebnis', pt: 'Resultado' },
    probOfA: { en: 'P(A) — Probability of A', it: 'P(A) — Probabilità di A', es: 'P(A) — Probabilidad de A', fr: 'P(A) — Probabilité de A', de: 'P(A) — Wahrscheinlichkeit von A', pt: 'P(A) — Probabilidade de A' },
    probOfB: { en: 'P(B) — Probability of B', it: 'P(B) — Probabilità di B', es: 'P(B) — Probabilidad de B', fr: 'P(B) — Probabilité de B', de: 'P(B) — Wahrscheinlichkeit von B', pt: 'P(B) — Probabilidade de B' },
    aAndB: { en: 'A AND B (independent)', it: 'A E B (indipendenti)', es: 'A Y B (independientes)', fr: 'A ET B (indépendants)', de: 'A UND B (unabhängig)', pt: 'A E B (independentes)' },
    aOrB: { en: 'A OR B (mutually exclusive)', it: 'A O B (mutuamente esclusivi)', es: 'A O B (mutuamente excluyentes)', fr: 'A OU B (mutuellement exclusifs)', de: 'A ODER B (sich ausschließend)', pt: 'A OU B (mutuamente exclusivos)' },
    probBALabel: { en: 'P(B|A) — Probability of B given A', it: 'P(B|A) — Probabilità di B dato A', es: 'P(B|A) — Probabilidad de B dado A', fr: 'P(B|A) — Probabilité de B sachant A', de: 'P(B|A) — Wahrscheinlichkeit von B gegeben A', pt: 'P(B|A) — Probabilidade de B dado A' },
    condResult: { en: 'P(A and B) = P(A) × P(B|A)', it: 'P(A e B) = P(A) × P(B|A)', es: 'P(A y B) = P(A) × P(B|A)', fr: 'P(A et B) = P(A) × P(B|A)', de: 'P(A und B) = P(A) × P(B|A)', pt: 'P(A e B) = P(A) × P(B|A)' },
    nTotal: { en: 'n (total items)', it: 'n (elementi totali)', es: 'n (elementos totales)', fr: 'n (éléments totaux)', de: 'n (Gesamtelemente)', pt: 'n (elementos totais)' },
    rChosen: { en: 'r (chosen items)', it: 'r (elementi scelti)', es: 'r (elementos elegidos)', fr: 'r (éléments choisis)', de: 'r (gewählte Elemente)', pt: 'r (elementos escolhidos)' },
    permutation: { en: 'Permutation P(n,r)', it: 'Permutazione P(n,r)', es: 'Permutación P(n,r)', fr: 'Permutation P(n,r)', de: 'Permutation P(n,r)', pt: 'Permutação P(n,r)' },
    combination: { en: 'Combination C(n,r)', it: 'Combinazione C(n,r)', es: 'Combinación C(n,r)', fr: 'Combinaison C(n,r)', de: 'Kombination C(n,r)', pt: 'Combinação C(n,r)' },
    enterValues: { en: 'Enter values to see the result', it: 'Inserisci i valori per vedere il risultato', es: 'Ingresa valores para ver el resultado', fr: 'Entrez les valeurs pour voir le résultat', de: 'Werte eingeben um Ergebnis zu sehen', pt: 'Insira valores para ver o resultado' },
    percentage: { en: 'Percentage', it: 'Percentuale', es: 'Porcentaje', fr: 'Pourcentage', de: 'Prozentsatz', pt: 'Percentagem' },
  };

  const factorial = (num: number): number => {
    if (num <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= num; i++) result *= i;
    return result;
  };

  const computeSingle = () => {
    const f = parseFloat(favorable);
    const t = parseFloat(total);
    if (isNaN(f) || isNaN(t) || t <= 0 || f < 0 || f > t) return null;
    const p = f / t;
    return { probability: p, formula: `P = ${f} / ${t}`, percentage: (p * 100).toFixed(2) };
  };

  const computeCombined = () => {
    const a = parseFloat(probA);
    const b = parseFloat(probB);
    if (isNaN(a) || isNaN(b) || a < 0 || a > 1 || b < 0 || b > 1) return null;
    if (combType === 'and') {
      const p = a * b;
      return { probability: p, formula: `P(A ∩ B) = ${a} × ${b}`, percentage: (p * 100).toFixed(2) };
    } else {
      const p = a + b;
      return { probability: Math.min(p, 1), formula: `P(A ∪ B) = ${a} + ${b}`, percentage: (Math.min(p, 1) * 100).toFixed(2) };
    }
  };

  const computeConditional = () => {
    const a = parseFloat(probA);
    const ba = parseFloat(probBA);
    if (isNaN(a) || isNaN(ba) || a < 0 || a > 1 || ba < 0 || ba > 1) return null;
    const p = a * ba;
    return { probability: p, formula: `P(A ∩ B) = ${a} × ${ba}`, percentage: (p * 100).toFixed(2) };
  };

  const computePermComb = () => {
    const nVal = parseInt(n);
    const rVal = parseInt(r);
    if (isNaN(nVal) || isNaN(rVal) || nVal < 0 || rVal < 0 || rVal > nVal || nVal > 170) return null;
    if (pcType === 'perm') {
      const result = factorial(nVal) / factorial(nVal - rVal);
      return { probability: result, formula: `P(${nVal},${rVal}) = ${nVal}! / (${nVal}-${rVal})!`, percentage: result.toLocaleString() };
    } else {
      const result = factorial(nVal) / (factorial(rVal) * factorial(nVal - rVal));
      return { probability: result, formula: `C(${nVal},${rVal}) = ${nVal}! / (${rVal}! × (${nVal}-${rVal})!)`, percentage: result.toLocaleString() };
    }
  };

  const getResult = () => {
    switch (mode) {
      case 'single': return computeSingle();
      case 'combined': return computeCombined();
      case 'conditional': return computeConditional();
      case 'permcomb': return computePermComb();
      default: return null;
    }
  };

  const result = getResult();

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'How to Calculate Probability: Complete Guide with Formulas',
      paragraphs: [
        'Probability is the branch of mathematics that measures the likelihood of an event occurring. It ranges from 0 (impossible) to 1 (certain) and is fundamental to statistics, data science, gambling, insurance, weather forecasting, and everyday decision-making. Understanding probability helps you assess risk and make informed choices.',
        'The basic formula for probability is P(E) = favorable outcomes / total outcomes. For example, the probability of rolling a 3 on a fair die is 1/6. When dealing with multiple events, you need to consider whether they are independent or dependent, and whether they are mutually exclusive.',
        'For independent events, the probability of both occurring (A AND B) equals P(A) times P(B). For mutually exclusive events, the probability of either occurring (A OR B) equals P(A) plus P(B). Conditional probability P(A|B) measures the likelihood of A given that B has already occurred, calculated as P(A and B) / P(B).',
        'Permutations and combinations are counting techniques used in probability. Permutations count arrangements where order matters: P(n,r) = n!/(n-r)!. Combinations count selections where order does not matter: C(n,r) = n!/(r!(n-r)!). These are essential for lottery odds, card games, and combinatorial problems.'
      ],
      faq: [
        { q: 'What is the difference between permutation and combination?', a: 'Permutations count arrangements where order matters (ABC is different from CBA). Combinations count selections where order does not matter (ABC equals CBA). Use permutations for rankings or sequences, and combinations for groups or teams.' },
        { q: 'How do I calculate the probability of two independent events both happening?', a: 'Multiply their individual probabilities: P(A and B) = P(A) × P(B). For example, the chance of flipping heads twice in a row is 0.5 × 0.5 = 0.25, or 25%.' },
        { q: 'What is conditional probability and when do I use it?', a: 'Conditional probability P(A|B) is the probability of event A occurring given that event B has already occurred. Use it when the outcome of one event affects the likelihood of another, such as drawing cards without replacement.' },
        { q: 'Can probability be greater than 1 or less than 0?', a: 'No. Probability always ranges from 0 (impossible event) to 1 (certain event). If your calculation yields a value outside this range, there is an error in your inputs or assumptions.' },
        { q: 'Is my data stored or sent anywhere?', a: 'No. All probability calculations run entirely in your browser using JavaScript. No data is sent to any server or stored anywhere.' }
      ]
    },
    it: {
      title: 'Come Calcolare la Probabilità: Guida Completa con Formule',
      paragraphs: [
        'La probabilità è il ramo della matematica che misura la possibilità che un evento si verifichi. Varia da 0 (impossibile) a 1 (certo) ed è fondamentale per statistica, data science, giochi d\'azzardo, assicurazioni, previsioni meteorologiche e decisioni quotidiane.',
        'La formula base della probabilità è P(E) = esiti favorevoli / esiti totali. Ad esempio, la probabilità di ottenere un 3 lanciando un dado equilibrato è 1/6. Quando si tratta di eventi multipli, bisogna considerare se sono indipendenti o dipendenti, e se sono mutuamente esclusivi.',
        'Per eventi indipendenti, la probabilità che entrambi si verifichino (A E B) è P(A) per P(B). Per eventi mutuamente esclusivi, la probabilità che uno dei due si verifichi (A O B) è P(A) più P(B). La probabilità condizionata P(A|B) misura la possibilità di A dato che B si è già verificato.',
        'Permutazioni e combinazioni sono tecniche di conteggio usate nella probabilità. Le permutazioni contano disposizioni dove l\'ordine conta: P(n,r) = n!/(n-r)!. Le combinazioni contano selezioni dove l\'ordine non conta: C(n,r) = n!/(r!(n-r)!). Sono essenziali per lotterie, giochi di carte e problemi combinatori.'
      ],
      faq: [
        { q: 'Qual è la differenza tra permutazione e combinazione?', a: 'Le permutazioni contano disposizioni dove l\'ordine conta (ABC è diverso da CBA). Le combinazioni contano selezioni dove l\'ordine non conta. Usa le permutazioni per classifiche o sequenze, le combinazioni per gruppi o squadre.' },
        { q: 'Come calcolo la probabilità che due eventi indipendenti accadano entrambi?', a: 'Moltiplica le probabilità individuali: P(A e B) = P(A) × P(B). Ad esempio, la probabilità di ottenere testa due volte di fila è 0,5 × 0,5 = 0,25, cioè il 25%.' },
        { q: 'Cos\'è la probabilità condizionata e quando si usa?', a: 'La probabilità condizionata P(A|B) è la probabilità che l\'evento A si verifichi dato che B si è già verificato. Si usa quando il risultato di un evento influenza la probabilità di un altro.' },
        { q: 'La probabilità può essere maggiore di 1 o minore di 0?', a: 'No. La probabilità varia sempre da 0 (evento impossibile) a 1 (evento certo). Se il calcolo dà un valore fuori da questo intervallo, c\'è un errore negli input.' },
        { q: 'I miei dati vengono salvati o inviati?', a: 'No. Tutti i calcoli avvengono interamente nel browser. Nessun dato viene inviato a server o memorizzato.' }
      ]
    },
    es: {
      title: 'Cómo Calcular Probabilidad: Guía Completa con Fórmulas',
      paragraphs: [
        'La probabilidad es la rama de las matemáticas que mide la posibilidad de que ocurra un evento. Va de 0 (imposible) a 1 (seguro) y es fundamental para estadística, ciencia de datos, juegos de azar, seguros, pronósticos meteorológicos y decisiones cotidianas.',
        'La fórmula básica es P(E) = resultados favorables / resultados totales. Por ejemplo, la probabilidad de sacar un 3 en un dado justo es 1/6. Al tratar con múltiples eventos, debes considerar si son independientes o dependientes, y si son mutuamente excluyentes.',
        'Para eventos independientes, la probabilidad de que ambos ocurran (A Y B) es P(A) por P(B). Para eventos mutuamente excluyentes, la probabilidad de que ocurra uno u otro (A O B) es P(A) más P(B). La probabilidad condicional P(A|B) mide la posibilidad de A dado que B ya ocurrió.',
        'Permutaciones y combinaciones son técnicas de conteo usadas en probabilidad. Las permutaciones cuentan arreglos donde importa el orden: P(n,r) = n!/(n-r)!. Las combinaciones cuentan selecciones donde el orden no importa: C(n,r) = n!/(r!(n-r)!). Son esenciales para loterías y juegos de cartas.'
      ],
      faq: [
        { q: '¿Cuál es la diferencia entre permutación y combinación?', a: 'Las permutaciones cuentan arreglos donde importa el orden (ABC es diferente de CBA). Las combinaciones cuentan selecciones donde el orden no importa. Usa permutaciones para rankings, combinaciones para grupos.' },
        { q: '¿Cómo calculo la probabilidad de que dos eventos independientes ocurran?', a: 'Multiplica sus probabilidades individuales: P(A y B) = P(A) × P(B). La probabilidad de obtener cara dos veces seguidas es 0.5 × 0.5 = 0.25, o 25%.' },
        { q: '¿Qué es la probabilidad condicional?', a: 'P(A|B) es la probabilidad de que A ocurra dado que B ya ocurrió. Se usa cuando el resultado de un evento afecta la probabilidad de otro, como sacar cartas sin reemplazo.' },
        { q: '¿La probabilidad puede ser mayor que 1 o menor que 0?', a: 'No. La probabilidad siempre va de 0 (evento imposible) a 1 (evento seguro). Si tu cálculo da un valor fuera de este rango, hay un error en los datos.' },
        { q: '¿Se almacenan mis datos?', a: 'No. Todos los cálculos se realizan en tu navegador. Ningún dato se envía a servidores ni se almacena.' }
      ]
    },
    fr: {
      title: 'Comment Calculer la Probabilité : Guide Complet avec Formules',
      paragraphs: [
        'La probabilité est la branche des mathématiques qui mesure la possibilité qu\'un événement se produise. Elle varie de 0 (impossible) à 1 (certain) et est fondamentale pour la statistique, la science des données, les jeux de hasard, l\'assurance et les prévisions météorologiques.',
        'La formule de base est P(E) = résultats favorables / résultats totaux. Par exemple, la probabilité d\'obtenir un 3 sur un dé équilibré est 1/6. Pour les événements multiples, il faut considérer s\'ils sont indépendants ou dépendants, et s\'ils sont mutuellement exclusifs.',
        'Pour les événements indépendants, la probabilité que les deux se produisent (A ET B) est P(A) fois P(B). Pour les événements mutuellement exclusifs, la probabilité que l\'un se produise (A OU B) est P(A) plus P(B). La probabilité conditionnelle P(A|B) mesure la possibilité de A sachant que B s\'est produit.',
        'Les permutations et combinaisons sont des techniques de dénombrement. Les permutations comptent les arrangements où l\'ordre compte : P(n,r) = n!/(n-r)!. Les combinaisons comptent les sélections où l\'ordre n\'importe pas : C(n,r) = n!/(r!(n-r)!). Essentielles pour les loteries et problèmes combinatoires.'
      ],
      faq: [
        { q: 'Quelle est la différence entre permutation et combinaison ?', a: 'Les permutations comptent les arrangements où l\'ordre compte (ABC diffère de CBA). Les combinaisons comptent les sélections où l\'ordre n\'importe pas. Utilisez les permutations pour les classements, les combinaisons pour les groupes.' },
        { q: 'Comment calculer la probabilité de deux événements indépendants ?', a: 'Multipliez leurs probabilités : P(A et B) = P(A) × P(B). La probabilité d\'obtenir face deux fois de suite est 0,5 × 0,5 = 0,25, soit 25%.' },
        { q: 'Qu\'est-ce que la probabilité conditionnelle ?', a: 'P(A|B) est la probabilité que A se produise sachant que B s\'est déjà produit. On l\'utilise quand un événement influence la probabilité d\'un autre.' },
        { q: 'La probabilité peut-elle être supérieure à 1 ou inférieure à 0 ?', a: 'Non. La probabilité varie toujours de 0 (impossible) à 1 (certain). Si votre calcul donne une valeur hors de cette plage, il y a une erreur dans vos données.' },
        { q: 'Mes données sont-elles stockées ?', a: 'Non. Tous les calculs se font dans votre navigateur. Aucune donnée n\'est envoyée à un serveur.' }
      ]
    },
    de: {
      title: 'Wahrscheinlichkeit Berechnen: Vollständige Anleitung mit Formeln',
      paragraphs: [
        'Wahrscheinlichkeit ist der Zweig der Mathematik, der die Möglichkeit misst, dass ein Ereignis eintritt. Sie reicht von 0 (unmöglich) bis 1 (sicher) und ist grundlegend für Statistik, Datenwissenschaft, Glücksspiel, Versicherungen und Wettervorhersagen.',
        'Die Grundformel lautet P(E) = günstige Ergebnisse / Gesamtergebnisse. Beispielsweise beträgt die Wahrscheinlichkeit, eine 3 mit einem fairen Würfel zu würfeln, 1/6. Bei mehreren Ereignissen muss man berücksichtigen, ob sie unabhängig oder abhängig sind.',
        'Für unabhängige Ereignisse ist die Wahrscheinlichkeit, dass beide eintreten (A UND B), P(A) mal P(B). Für sich ausschließende Ereignisse ist P(A ODER B) = P(A) plus P(B). Die bedingte Wahrscheinlichkeit P(A|B) misst die Möglichkeit von A, wenn B bereits eingetreten ist.',
        'Permutationen und Kombinationen sind Zähltechniken. Permutationen zählen Anordnungen, bei denen die Reihenfolge zählt: P(n,r) = n!/(n-r)!. Kombinationen zählen Auswahlen, bei denen die Reihenfolge egal ist: C(n,r) = n!/(r!(n-r)!). Unverzichtbar für Lotterien und kombinatorische Probleme.'
      ],
      faq: [
        { q: 'Was ist der Unterschied zwischen Permutation und Kombination?', a: 'Permutationen zählen Anordnungen, bei denen die Reihenfolge zählt (ABC unterscheidet sich von CBA). Kombinationen zählen Auswahlen, bei denen die Reihenfolge egal ist.' },
        { q: 'Wie berechne ich die Wahrscheinlichkeit zweier unabhängiger Ereignisse?', a: 'Multiplizieren Sie die Einzelwahrscheinlichkeiten: P(A und B) = P(A) × P(B). Die Wahrscheinlichkeit, zweimal hintereinander Kopf zu werfen, ist 0,5 × 0,5 = 0,25 oder 25%.' },
        { q: 'Was ist bedingte Wahrscheinlichkeit?', a: 'P(A|B) ist die Wahrscheinlichkeit von A, wenn B bereits eingetreten ist. Man verwendet sie, wenn ein Ereignis die Wahrscheinlichkeit eines anderen beeinflusst.' },
        { q: 'Kann die Wahrscheinlichkeit größer als 1 oder kleiner als 0 sein?', a: 'Nein. Die Wahrscheinlichkeit liegt immer zwischen 0 (unmöglich) und 1 (sicher). Ein Wert außerhalb dieses Bereichs deutet auf einen Eingabefehler hin.' },
        { q: 'Werden meine Daten gespeichert?', a: 'Nein. Alle Berechnungen erfolgen vollständig in Ihrem Browser. Es werden keine Daten an Server gesendet.' }
      ]
    },
    pt: {
      title: 'Como Calcular Probabilidade: Guia Completo com Fórmulas',
      paragraphs: [
        'Probabilidade é o ramo da matemática que mede a possibilidade de um evento ocorrer. Varia de 0 (impossível) a 1 (certo) e é fundamental para estatística, ciência de dados, jogos de azar, seguros e previsões meteorológicas.',
        'A fórmula básica é P(E) = resultados favoráveis / resultados totais. Por exemplo, a probabilidade de tirar um 3 em um dado justo é 1/6. Ao lidar com múltiplos eventos, é preciso considerar se são independentes ou dependentes, e se são mutuamente exclusivos.',
        'Para eventos independentes, a probabilidade de ambos ocorrerem (A E B) é P(A) vezes P(B). Para eventos mutuamente exclusivos, a probabilidade de um ou outro (A OU B) é P(A) mais P(B). A probabilidade condicional P(A|B) mede a possibilidade de A dado que B já ocorreu.',
        'Permutações e combinações são técnicas de contagem. Permutações contam arranjos onde a ordem importa: P(n,r) = n!/(n-r)!. Combinações contam seleções onde a ordem não importa: C(n,r) = n!/(r!(n-r)!). Essenciais para loterias e problemas combinatórios.'
      ],
      faq: [
        { q: 'Qual a diferença entre permutação e combinação?', a: 'Permutações contam arranjos onde a ordem importa (ABC é diferente de CBA). Combinações contam seleções onde a ordem não importa. Use permutações para rankings, combinações para grupos.' },
        { q: 'Como calculo a probabilidade de dois eventos independentes?', a: 'Multiplique as probabilidades individuais: P(A e B) = P(A) × P(B). A probabilidade de obter cara duas vezes seguidas é 0,5 × 0,5 = 0,25, ou 25%.' },
        { q: 'O que é probabilidade condicional?', a: 'P(A|B) é a probabilidade de A ocorrer dado que B já ocorreu. Usa-se quando um evento influencia a probabilidade de outro.' },
        { q: 'A probabilidade pode ser maior que 1 ou menor que 0?', a: 'Não. A probabilidade sempre varia de 0 (impossível) a 1 (certo). Um valor fora dessa faixa indica erro nos dados.' },
        { q: 'Meus dados são armazenados?', a: 'Não. Todos os cálculos ocorrem no seu navegador. Nenhum dado é enviado a servidores.' }
      ]
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="probability-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {/* Mode tabs */}
          <div className="flex flex-wrap gap-2">
            {(['single', 'combined', 'conditional', 'permcomb'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {labels[m][lang]}
              </button>
            ))}
          </div>

          {/* Single Event */}
          {mode === 'single' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{labels.favorable[lang]}</label>
                <input type="number" min="0" value={favorable} onChange={(e) => setFavorable(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" placeholder="e.g. 1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{labels.totalOutcomes[lang]}</label>
                <input type="number" min="1" value={total} onChange={(e) => setTotal(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" placeholder="e.g. 6" />
              </div>
            </div>
          )}

          {/* Combined Events */}
          {mode === 'combined' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{labels.probOfA[lang]}</label>
                <input type="number" min="0" max="1" step="0.01" value={probA} onChange={(e) => setProbA(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" placeholder="0.0 - 1.0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{labels.probOfB[lang]}</label>
                <input type="number" min="0" max="1" step="0.01" value={probB} onChange={(e) => setProbB(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" placeholder="0.0 - 1.0" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setCombType('and')} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${combType === 'and' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-600'}`}>
                  {labels.aAndB[lang]}
                </button>
                <button onClick={() => setCombType('or')} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${combType === 'or' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-600'}`}>
                  {labels.aOrB[lang]}
                </button>
              </div>
            </div>
          )}

          {/* Conditional */}
          {mode === 'conditional' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{labels.probOfA[lang]}</label>
                <input type="number" min="0" max="1" step="0.01" value={probA} onChange={(e) => setProbA(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" placeholder="0.0 - 1.0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{labels.probBALabel[lang]}</label>
                <input type="number" min="0" max="1" step="0.01" value={probBA} onChange={(e) => setProbBA(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" placeholder="0.0 - 1.0" />
              </div>
              <p className="text-xs text-gray-500">{labels.condResult[lang]}</p>
            </div>
          )}

          {/* Permutations & Combinations */}
          {mode === 'permcomb' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{labels.nTotal[lang]}</label>
                <input type="number" min="0" max="170" value={n} onChange={(e) => setN(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" placeholder="e.g. 10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{labels.rChosen[lang]}</label>
                <input type="number" min="0" value={r} onChange={(e) => setR(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" placeholder="e.g. 3" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPcType('perm')} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${pcType === 'perm' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-600'}`}>
                  {labels.permutation[lang]}
                </button>
                <button onClick={() => setPcType('comb')} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${pcType === 'comb' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-600'}`}>
                  {labels.combination[lang]}
                </button>
              </div>
            </div>
          )}

          {/* Result */}
          {result ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 space-y-3">
              <div>
                <div className="text-xs text-blue-600 font-medium uppercase">{labels.formula[lang]}</div>
                <div className="text-sm font-mono text-gray-800 mt-1">{result.formula}</div>
              </div>
              <div>
                <div className="text-xs text-blue-600 font-medium uppercase">{labels.result[lang]}</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">
                  {mode === 'permcomb' ? result.percentage : result.probability.toFixed(4)}
                </div>
                {mode !== 'permcomb' && (
                  <div className="text-sm text-gray-600">{result.percentage}%</div>
                )}
              </div>
              {mode !== 'permcomb' && (
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-3 rounded-full transition-all duration-300" style={{ width: `${Math.min(result.probability * 100, 100)}%` }} />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-6 text-sm">{labels.enterValues[lang]}</div>
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
