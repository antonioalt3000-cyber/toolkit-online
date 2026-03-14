'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type HistoryEntry = { bac: number; timeToSober: number; drinks: number; weight: number; impairment: string };

export default function BloodAlcoholCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['blood-alcohol-calculator'][lang];

  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [drinks, setDrinks] = useState('');
  const [drinkType, setDrinkType] = useState<'beer' | 'wine' | 'spirits'>('beer');
  const [hours, setHours] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const labels = {
    weight: { en: 'Body Weight', it: 'Peso Corporeo', es: 'Peso Corporal', fr: 'Poids Corporel', de: 'Körpergewicht', pt: 'Peso Corporal' },
    kg: { en: 'kg', it: 'kg', es: 'kg', fr: 'kg', de: 'kg', pt: 'kg' },
    lbs: { en: 'lbs', it: 'lbs', es: 'lbs', fr: 'lbs', de: 'lbs', pt: 'lbs' },
    gender: { en: 'Gender', it: 'Sesso', es: 'Sexo', fr: 'Sexe', de: 'Geschlecht', pt: 'Sexo' },
    male: { en: 'Male', it: 'Maschio', es: 'Masculino', fr: 'Homme', de: 'Männlich', pt: 'Masculino' },
    female: { en: 'Female', it: 'Femmina', es: 'Femenino', fr: 'Femme', de: 'Weiblich', pt: 'Feminino' },
    drinks: { en: 'Number of Drinks', it: 'Numero di Bevande', es: 'Número de Bebidas', fr: 'Nombre de Verres', de: 'Anzahl der Getränke', pt: 'Número de Bebidas' },
    drinkType: { en: 'Drink Type', it: 'Tipo di Bevanda', es: 'Tipo de Bebida', fr: 'Type de Boisson', de: 'Getränkeart', pt: 'Tipo de Bebida' },
    beer: { en: 'Beer (5% ABV, 355ml)', it: 'Birra (5% ABV, 355ml)', es: 'Cerveza (5% ABV, 355ml)', fr: 'Bière (5% ABV, 355ml)', de: 'Bier (5% ABV, 355ml)', pt: 'Cerveja (5% ABV, 355ml)' },
    wine: { en: 'Wine (12% ABV, 150ml)', it: 'Vino (12% ABV, 150ml)', es: 'Vino (12% ABV, 150ml)', fr: 'Vin (12% ABV, 150ml)', de: 'Wein (12% ABV, 150ml)', pt: 'Vinho (12% ABV, 150ml)' },
    spirits: { en: 'Spirits (40% ABV, 45ml)', it: 'Superalcolici (40% ABV, 45ml)', es: 'Licores (40% ABV, 45ml)', fr: 'Spiritueux (40% ABV, 45ml)', de: 'Spirituosen (40% ABV, 45ml)', pt: 'Destilados (40% ABV, 45ml)' },
    timeDrinking: { en: 'Time Spent Drinking (hours)', it: 'Tempo di Consumo (ore)', es: 'Tiempo Bebiendo (horas)', fr: 'Durée de Consommation (heures)', de: 'Trinkdauer (Stunden)', pt: 'Tempo Bebendo (horas)' },
    estimatedBAC: { en: 'Estimated BAC', it: 'BAC Stimato', es: 'BAC Estimado', fr: 'BAC Estimé', de: 'Geschätzter BAC', pt: 'BAC Estimado' },
    timeToSober: { en: 'Estimated Time to Sober', it: 'Tempo Stimato per Smaltire', es: 'Tiempo Estimado para Estar Sobrio', fr: 'Temps Estimé pour Être Sobre', de: 'Geschätzte Zeit bis Nüchtern', pt: 'Tempo Estimado para Ficar Sóbrio' },
    impairment: { en: 'Impairment Level', it: 'Livello di Compromissione', es: 'Nivel de Deterioro', fr: 'Niveau d\'Affaiblissement', de: 'Beeinträchtigungsgrad', pt: 'Nível de Comprometimento' },
    legalLimit: { en: 'Legal Limit (most countries)', it: 'Limite Legale (maggior parte dei paesi)', es: 'Límite Legal (mayoría de países)', fr: 'Limite Légale (plupart des pays)', de: 'Gesetzliche Grenze (die meisten Länder)', pt: 'Limite Legal (maioria dos países)' },
    hoursLabel: { en: 'hours', it: 'ore', es: 'horas', fr: 'heures', de: 'Stunden', pt: 'horas' },
    minutesLabel: { en: 'minutes', it: 'minuti', es: 'minutos', fr: 'minutes', de: 'Minuten', pt: 'minutos' },
    calculate: { en: 'Calculate', it: 'Calcola', es: 'Calcular', fr: 'Calculer', de: 'Berechnen', pt: 'Calcular' },
    reset: { en: 'Reset', it: 'Reset', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Reiniciar' },
    copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
    sober: { en: 'Sober', it: 'Sobrio', es: 'Sobrio', fr: 'Sobre', de: 'Nüchtern', pt: 'Sóbrio' },
    minimal: { en: 'Minimal Impairment', it: 'Compromissione Minima', es: 'Deterioro Mínimo', fr: 'Affaiblissement Minimal', de: 'Minimale Beeinträchtigung', pt: 'Comprometimento Mínimo' },
    mild: { en: 'Mild Impairment', it: 'Compromissione Lieve', es: 'Deterioro Leve', fr: 'Affaiblissement Léger', de: 'Leichte Beeinträchtigung', pt: 'Comprometimento Leve' },
    significant: { en: 'Significant Impairment', it: 'Compromissione Significativa', es: 'Deterioro Significativo', fr: 'Affaiblissement Significatif', de: 'Erhebliche Beeinträchtigung', pt: 'Comprometimento Significativo' },
    severe: { en: 'Severe Impairment', it: 'Compromissione Grave', es: 'Deterioro Severo', fr: 'Affaiblissement Sévère', de: 'Schwere Beeinträchtigung', pt: 'Comprometimento Grave' },
    lifeThreatening: { en: 'Life-Threatening', it: 'Pericolo di Vita', es: 'Peligro de Vida', fr: 'Danger de Mort', de: 'Lebensbedrohlich', pt: 'Risco de Vida' },
    warning: { en: 'ABOVE LEGAL LIMIT', it: 'SOPRA IL LIMITE LEGALE', es: 'POR ENCIMA DEL LÍMITE LEGAL', fr: 'AU-DESSUS DE LA LIMITE LÉGALE', de: 'ÜBER DER GESETZLICHEN GRENZE', pt: 'ACIMA DO LIMITE LEGAL' },
    safe: { en: 'Below Legal Limit', it: 'Sotto il Limite Legale', es: 'Bajo el Límite Legal', fr: 'Sous la Limite Légale', de: 'Unter der Gesetzlichen Grenze', pt: 'Abaixo do Limite Legal' },
    disclaimer: { en: 'DISCLAIMER: This calculator provides rough estimates only. Actual BAC depends on many individual factors including metabolism, food intake, medications, and tolerance. NEVER drink and drive. When in doubt, do not drive. This tool is for educational purposes only.', it: 'AVVERTENZA: Questo calcolatore fornisce solo stime approssimative. Il BAC reale dipende da molti fattori individuali tra cui metabolismo, assunzione di cibo, farmaci e tolleranza. NON guidare mai dopo aver bevuto. In caso di dubbio, non guidare. Questo strumento è solo a scopo educativo.', es: 'AVISO: Esta calculadora proporciona solo estimaciones aproximadas. El BAC real depende de muchos factores individuales como metabolismo, ingesta de alimentos, medicamentos y tolerancia. NUNCA conduzcas después de beber. En caso de duda, no conduzcas. Esta herramienta es solo con fines educativos.', fr: 'AVERTISSEMENT : Ce calculateur fournit des estimations approximatives uniquement. Le taux réel dépend de nombreux facteurs individuels dont le métabolisme, l\'alimentation, les médicaments et la tolérance. Ne conduisez JAMAIS après avoir bu. En cas de doute, ne conduisez pas. Cet outil est à but éducatif uniquement.', de: 'WARNUNG: Dieser Rechner liefert nur grobe Schätzungen. Der tatsächliche BAK hängt von vielen individuellen Faktoren ab, darunter Stoffwechsel, Nahrungsaufnahme, Medikamente und Toleranz. Fahren Sie NIEMALS nach Alkoholkonsum. Im Zweifel: Nicht fahren. Dieses Tool dient nur zu Bildungszwecken.', pt: 'AVISO: Esta calculadora fornece apenas estimativas aproximadas. O BAC real depende de muitos fatores individuais incluindo metabolismo, ingestão de alimentos, medicamentos e tolerância. NUNCA dirija após beber. Em caso de dúvida, não dirija. Esta ferramenta é apenas para fins educativos.' },
    bacScale: { en: 'BAC Impairment Scale', it: 'Scala di Compromissione BAC', es: 'Escala de Deterioro BAC', fr: 'Échelle d\'Affaiblissement BAC', de: 'BAK-Beeinträchtigungsskala', pt: 'Escala de Comprometimento BAC' },
    standardDrink: { en: 'Each option equals approximately one standard drink (~14g pure alcohol).', it: 'Ogni opzione equivale a circa una bevanda standard (~14g di alcol puro).', es: 'Cada opción equivale aproximadamente a una bebida estándar (~14g de alcohol puro).', fr: 'Chaque option équivaut à environ un verre standard (~14g d\'alcool pur).', de: 'Jede Option entspricht etwa einem Standardgetränk (~14g reiner Alkohol).', pt: 'Cada opção equivale a aproximadamente uma bebida padrão (~14g de álcool puro).' },
  } as Record<string, Record<Locale, string>>;

  // Alcohol content per standard drink in grams
  // Beer: 355ml * 0.05 * 0.789 = ~14g
  // Wine: 150ml * 0.12 * 0.789 = ~14.2g
  // Spirits: 45ml * 0.40 * 0.789 = ~14.2g
  // All roughly equal to one standard drink (~14g pure alcohol)
  const ALCOHOL_PER_DRINK: Record<string, number> = {
    beer: 14.0,
    wine: 14.2,
    spirits: 14.2,
  };

  // Widmark r factor
  const WIDMARK_R: Record<string, number> = {
    male: 0.68,
    female: 0.55,
  };

  // Metabolism rate: ~0.015% BAC per hour
  const METABOLISM_RATE = 0.015;

  const weightInGrams = () => {
    const w = parseFloat(weight) || 0;
    if (weightUnit === 'lbs') return w * 453.592;
    return w * 1000;
  };

  const calculateBAC = () => {
    const w = weightInGrams();
    const numDrinks = parseFloat(drinks) || 0;
    const h = parseFloat(hours) || 0;
    const r = WIDMARK_R[gender];
    const alcoholGrams = numDrinks * ALCOHOL_PER_DRINK[drinkType];

    if (w <= 0 || numDrinks <= 0) return 0;

    // Widmark formula: BAC = (A / (W * r)) - (metabolism * H)
    // A = alcohol consumed in grams
    // W = body weight in grams
    // r = Widmark factor (0.68 for male, 0.55 for female)
    // H = hours since first drink
    const bac = (alcoholGrams / (w * r)) * 100 - METABOLISM_RATE * h;
    return Math.max(0, bac);
  };

  const bac = calculateBAC();

  const getTimeToSober = (bacValue: number): number => {
    if (bacValue <= 0) return 0;
    return bacValue / METABOLISM_RATE;
  };

  const timeToSober = getTimeToSober(bac);

  const getImpairmentLevel = (bacValue: number): { text: string; color: string; bg: string; border: string } => {
    if (bacValue <= 0) return { text: labels.sober[lang], color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' };
    if (bacValue < 0.02) return { text: labels.minimal[lang], color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (bacValue < 0.05) return { text: labels.mild[lang], color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (bacValue < 0.08) return { text: labels.significant[lang], color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    if (bacValue < 0.15) return { text: labels.severe[lang], color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    return { text: labels.lifeThreatening[lang], color: 'text-red-800', bg: 'bg-red-100', border: 'border-red-300' };
  };

  const impairment = getImpairmentLevel(bac);
  const isAboveLimit = bac >= 0.08;

  const hasResult = (parseFloat(weight) || 0) > 0 && (parseFloat(drinks) || 0) > 0;

  const handleCalculate = () => {
    if (hasResult) {
      const entry: HistoryEntry = {
        bac,
        timeToSober,
        drinks: parseFloat(drinks),
        weight: parseFloat(weight),
        impairment: impairment.text,
      };
      setHistory(prev => [entry, ...prev.filter((_, i) => i < 4)]);
    }
  };

  const handleReset = () => {
    setWeight('');
    setDrinks('');
    setHours('');
    setGender('male');
    setDrinkType('beer');
    setWeightUnit('kg');
  };

  const copyResults = () => {
    const text = `${labels.estimatedBAC[lang]}: ${bac.toFixed(3)}%\n${labels.impairment[lang]}: ${impairment.text}\n${labels.timeToSober[lang]}: ${Math.floor(timeToSober)}h ${Math.round((timeToSober % 1) * 60)}min`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // BAC gauge percentage (capped at 0.4% for display)
  const gaugePercent = Math.min((bac / 0.4) * 100, 100);
  const gaugeColor = bac <= 0 ? 'bg-green-500' : bac < 0.05 ? 'bg-yellow-500' : bac < 0.08 ? 'bg-orange-500' : 'bg-red-600';

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Blood Alcohol Calculator (BAC) – Estimate Your Blood Alcohol Content',
      paragraphs: [
        'A blood alcohol content (BAC) calculator is a tool that estimates the concentration of alcohol in your bloodstream based on several factors. Understanding your BAC is important for making responsible decisions about driving and recognizing the effects of alcohol on your body. Our calculator uses the Widmark formula, the most widely accepted scientific method for estimating BAC.',
        'The Widmark formula calculates BAC as: (alcohol consumed in grams) / (body weight in grams x Widmark factor) x 100, minus the metabolism rate (0.015% per hour) multiplied by time since the first drink. The Widmark factor accounts for differences in body water content: 0.68 for males and 0.55 for females, reflecting that women typically have a lower proportion of body water and therefore reach higher BAC levels from the same amount of alcohol.',
        'Each "standard drink" contains approximately 14 grams of pure alcohol — this is equivalent to a 355ml beer at 5% ABV, a 150ml glass of wine at 12% ABV, or a 45ml shot of spirits at 40% ABV. The body metabolizes alcohol at an average rate of about 0.015% BAC per hour, though this varies by individual. Factors such as food intake, liver health, medications, genetics, and hydration all affect actual alcohol processing.',
        'The legal driving limit in most countries is a BAC of 0.08%, though many jurisdictions have lower limits (0.05% in much of Europe and Australia, and 0.00% for commercial drivers and minors in many places). Even below the legal limit, any amount of alcohol impairs reaction time, judgment, and coordination. This calculator is for educational purposes only — never rely on any calculator to decide whether you are safe to drive. When in doubt, always arrange alternative transportation.',
      ],
      faq: [
        { q: 'How is BAC calculated?', a: 'BAC is estimated using the Widmark formula: BAC = (alcohol in grams / (body weight in grams x Widmark factor)) x 100 - (0.015 x hours). The Widmark factor is 0.68 for males and 0.55 for females. A standard drink contains about 14 grams of pure alcohol. The body metabolizes approximately 0.015% BAC per hour.' },
        { q: 'What BAC level is considered legally drunk?', a: 'In most US states and many countries, the legal limit is 0.08% BAC. However, many European countries set the limit at 0.05%, and some countries have zero-tolerance policies (0.00%). Commercial drivers and minors typically face stricter limits. Impairment begins well below any legal limit.' },
        { q: 'How long does it take for alcohol to leave your system?', a: 'The body eliminates alcohol at approximately 0.015% BAC per hour. For someone with a BAC of 0.08%, it would take about 5.3 hours to reach 0.00%. This rate is relatively constant and cannot be accelerated by coffee, cold showers, food, or exercise — only time eliminates alcohol from your blood.' },
        { q: 'Why do women reach higher BAC levels than men?', a: 'Women typically have a lower proportion of body water and higher proportion of body fat compared to men of the same weight. Since alcohol distributes in body water, women achieve higher concentrations from the same amount of alcohol. This is reflected in the different Widmark factors: 0.55 for women vs. 0.68 for men.' },
        { q: 'Is this BAC calculator accurate?', a: 'This calculator provides rough estimates based on the Widmark formula. Actual BAC depends on many individual factors including metabolism, stomach contents, medications, liver function, and tolerance. Laboratory blood tests are the only truly accurate method. Never use this calculator to determine whether you are safe to drive.' },
      ],
    },
    it: {
      title: 'Calcolatore di Alcolemia Gratuito (BAC) – Stima il Tuo Tasso Alcolemico',
      paragraphs: [
        'Un calcolatore del tasso alcolemico (BAC) è uno strumento che stima la concentrazione di alcol nel sangue basandosi su diversi fattori. Comprendere il proprio BAC è importante per prendere decisioni responsabili sulla guida e riconoscere gli effetti dell\'alcol sul corpo. Il nostro calcolatore utilizza la formula di Widmark, il metodo scientifico più ampiamente accettato per stimare il BAC.',
        'La formula di Widmark calcola il BAC come: (alcol consumato in grammi) / (peso corporeo in grammi x fattore di Widmark) x 100, meno il tasso metabolico (0,015% per ora) moltiplicato per il tempo dal primo drink. Il fattore di Widmark tiene conto delle differenze nel contenuto di acqua corporea: 0,68 per i maschi e 0,55 per le femmine.',
        'Ogni "bevanda standard" contiene circa 14 grammi di alcol puro — equivalente a una birra da 355ml al 5%, un bicchiere di vino da 150ml al 12%, o uno shot di superalcolico da 45ml al 40%. Il corpo metabolizza l\'alcol a un tasso medio di circa 0,015% BAC per ora, ma questo varia da individuo a individuo.',
        'Il limite legale per la guida nella maggior parte dei paesi è un BAC dello 0,08%, anche se molte giurisdizioni hanno limiti inferiori (0,05% in gran parte dell\'Europa). Anche sotto il limite legale, qualsiasi quantità di alcol compromette tempi di reazione, giudizio e coordinazione. Questo calcolatore è solo a scopo educativo — non affidatevi mai a un calcolatore per decidere se è sicuro guidare.',
      ],
      faq: [
        { q: 'Come si calcola il BAC?', a: 'Il BAC si stima con la formula di Widmark: BAC = (alcol in grammi / (peso in grammi x fattore Widmark)) x 100 - (0,015 x ore). Il fattore Widmark è 0,68 per i maschi e 0,55 per le femmine. Una bevanda standard contiene circa 14 grammi di alcol puro.' },
        { q: 'Quale livello di BAC è considerato illegale?', a: 'In Italia il limite legale è 0,05% BAC (0,50 g/l). In molti altri paesi europei il limite è simile, mentre negli USA è generalmente 0,08%. I neopatentati e i guidatori professionali hanno spesso limiti più severi.' },
        { q: 'Quanto tempo serve per smaltire l\'alcol?', a: 'Il corpo elimina l\'alcol a circa 0,015% BAC per ora. Con un BAC di 0,08%, servirebbero circa 5,3 ore per arrivare a 0,00%. Questo tasso è costante e non può essere accelerato da caffè, docce fredde o esercizio — solo il tempo elimina l\'alcol dal sangue.' },
        { q: 'Perché le donne raggiungono un BAC più alto degli uomini?', a: 'Le donne hanno generalmente una proporzione inferiore di acqua corporea rispetto agli uomini dello stesso peso. Poiché l\'alcol si distribuisce nell\'acqua corporea, le donne raggiungono concentrazioni più alte dalla stessa quantità di alcol.' },
        { q: 'Questo calcolatore è accurato?', a: 'Fornisce stime approssimative basate sulla formula di Widmark. Il BAC reale dipende da molti fattori individuali. Gli esami del sangue in laboratorio sono l\'unico metodo veramente accurato. Non usare mai questo calcolatore per decidere se è sicuro guidare.' },
      ],
    },
    es: {
      title: 'Calculadora de Alcohol en Sangre Gratis (BAC) – Estima Tu Nivel de Alcoholemia',
      paragraphs: [
        'Una calculadora de contenido de alcohol en sangre (BAC) es una herramienta que estima la concentración de alcohol en tu torrente sanguíneo basándose en varios factores. Comprender tu BAC es importante para tomar decisiones responsables sobre la conducción y reconocer los efectos del alcohol en tu cuerpo. Nuestra calculadora utiliza la fórmula de Widmark, el método científico más ampliamente aceptado.',
        'La fórmula de Widmark calcula el BAC como: (alcohol consumido en gramos) / (peso corporal en gramos x factor de Widmark) x 100, menos la tasa metabólica (0,015% por hora) multiplicada por el tiempo desde la primera bebida. El factor de Widmark es 0,68 para hombres y 0,55 para mujeres.',
        'Cada "bebida estándar" contiene aproximadamente 14 gramos de alcohol puro — equivalente a una cerveza de 355ml al 5%, una copa de vino de 150ml al 12%, o un trago de licor de 45ml al 40%. El cuerpo metaboliza el alcohol a una tasa promedio de 0,015% BAC por hora.',
        'El límite legal para conducir en la mayoría de los países es un BAC del 0,08%, aunque muchas jurisdicciones tienen límites más bajos (0,05% en gran parte de Europa). Incluso por debajo del límite legal, cualquier cantidad de alcohol afecta el tiempo de reacción y la coordinación. Esta calculadora es solo con fines educativos — nunca conduzcas después de beber.',
      ],
      faq: [
        { q: '¿Cómo se calcula el BAC?', a: 'El BAC se estima con la fórmula de Widmark: BAC = (alcohol en gramos / (peso en gramos x factor Widmark)) x 100 - (0,015 x horas). El factor Widmark es 0,68 para hombres y 0,55 para mujeres. Una bebida estándar contiene unos 14 gramos de alcohol puro.' },
        { q: '¿Qué nivel de BAC se considera ilegal?', a: 'En la mayoría de países de Europa y Latinoamérica el límite legal es 0,05% BAC, mientras que en EE.UU. es generalmente 0,08%. Los conductores novatos y profesionales suelen tener límites más estrictos.' },
        { q: '¿Cuánto tiempo tarda el cuerpo en eliminar el alcohol?', a: 'El cuerpo elimina el alcohol a aproximadamente 0,015% BAC por hora. Con un BAC de 0,08%, tardaría unas 5,3 horas en llegar a 0,00%. Esta tasa es constante y no se puede acelerar con café, duchas frías o ejercicio.' },
        { q: '¿Por qué las mujeres alcanzan un BAC más alto que los hombres?', a: 'Las mujeres tienen generalmente menor proporción de agua corporal que los hombres del mismo peso. Como el alcohol se distribuye en el agua corporal, las mujeres alcanzan concentraciones más altas con la misma cantidad de alcohol.' },
        { q: '¿Es precisa esta calculadora?', a: 'Proporciona estimaciones aproximadas basadas en la fórmula de Widmark. El BAC real depende de muchos factores individuales. Los análisis de sangre son el único método verdaderamente preciso. Nunca uses esta calculadora para decidir si es seguro conducir.' },
      ],
    },
    fr: {
      title: 'Calculateur d\'Alcoolémie Gratuit (BAC) – Estimez Votre Taux d\'Alcool dans le Sang',
      paragraphs: [
        'Un calculateur de taux d\'alcoolémie (BAC) est un outil qui estime la concentration d\'alcool dans votre sang en se basant sur plusieurs facteurs. Comprendre votre BAC est important pour prendre des décisions responsables concernant la conduite et reconnaître les effets de l\'alcool sur votre corps. Notre calculateur utilise la formule de Widmark, la méthode scientifique la plus largement acceptée.',
        'La formule de Widmark calcule le BAC comme : (alcool consommé en grammes) / (poids corporel en grammes x facteur de Widmark) x 100, moins le taux métabolique (0,015% par heure) multiplié par le temps écoulé depuis le premier verre. Le facteur de Widmark est de 0,68 pour les hommes et 0,55 pour les femmes.',
        'Chaque "verre standard" contient environ 14 grammes d\'alcool pur — soit une bière de 355ml à 5%, un verre de vin de 150ml à 12%, ou un verre de spiritueux de 45ml à 40%. Le corps métabolise l\'alcool à un taux moyen d\'environ 0,015% BAC par heure.',
        'La limite légale pour conduire dans la plupart des pays est un BAC de 0,05% en France et en Europe. Même en dessous de la limite légale, toute quantité d\'alcool altère le temps de réaction et la coordination. Ce calculateur est à but éducatif uniquement — ne conduisez jamais après avoir bu.',
      ],
      faq: [
        { q: 'Comment le BAC est-il calculé ?', a: 'Le BAC s\'estime avec la formule de Widmark : BAC = (alcool en grammes / (poids en grammes x facteur Widmark)) x 100 - (0,015 x heures). Le facteur Widmark est 0,68 pour les hommes et 0,55 pour les femmes. Un verre standard contient environ 14 grammes d\'alcool pur.' },
        { q: 'Quel taux de BAC est considéré comme illégal ?', a: 'En France et dans la plupart des pays européens, la limite légale est de 0,05% BAC (0,5 g/l). Pour les jeunes conducteurs en France, la limite est de 0,02% (0,2 g/l). Aux États-Unis, elle est généralement de 0,08%.' },
        { q: 'Combien de temps faut-il pour éliminer l\'alcool ?', a: 'Le corps élimine l\'alcool à environ 0,015% BAC par heure. Avec un BAC de 0,08%, il faudrait environ 5,3 heures pour atteindre 0,00%. Ce taux est constant et ne peut être accéléré par le café, les douches froides ou l\'exercice.' },
        { q: 'Pourquoi les femmes atteignent-elles un BAC plus élevé ?', a: 'Les femmes ont généralement une proportion d\'eau corporelle inférieure à celle des hommes de même poids. L\'alcool se distribuant dans l\'eau corporelle, les femmes atteignent des concentrations plus élevées avec la même quantité d\'alcool.' },
        { q: 'Ce calculateur est-il précis ?', a: 'Il fournit des estimations approximatives basées sur la formule de Widmark. Le BAC réel dépend de nombreux facteurs individuels. Les analyses de sang en laboratoire sont la seule méthode vraiment précise. N\'utilisez jamais ce calculateur pour décider s\'il est sûr de conduire.' },
      ],
    },
    de: {
      title: 'Kostenloser Blutalkoholrechner (BAK) – Schätzen Sie Ihren Blutalkoholgehalt',
      paragraphs: [
        'Ein Blutalkohol-Rechner (BAK) ist ein Werkzeug, das die Alkoholkonzentration in Ihrem Blut anhand verschiedener Faktoren schätzt. Ihren BAK zu kennen ist wichtig, um verantwortungsvolle Entscheidungen über das Fahren zu treffen und die Auswirkungen von Alkohol auf Ihren Körper zu erkennen. Unser Rechner verwendet die Widmark-Formel, die am weitesten akzeptierte wissenschaftliche Methode.',
        'Die Widmark-Formel berechnet den BAK als: (konsumierter Alkohol in Gramm) / (Körpergewicht in Gramm x Widmark-Faktor) x 100, minus die Abbaurate (0,015% pro Stunde) multipliziert mit der Zeit seit dem ersten Getränk. Der Widmark-Faktor beträgt 0,68 für Männer und 0,55 für Frauen.',
        'Jedes "Standardgetränk" enthält etwa 14 Gramm reinen Alkohol — das entspricht einem 355ml Bier mit 5%, einem 150ml Glas Wein mit 12% oder einem 45ml Shot Spirituosen mit 40%. Der Körper baut Alkohol mit einer durchschnittlichen Rate von etwa 0,015% BAK pro Stunde ab.',
        'Die gesetzliche Promillegrenze in Deutschland liegt bei 0,05% BAK (0,5 Promille). Selbst unter dem gesetzlichen Limit beeinträchtigt jede Menge Alkohol die Reaktionszeit und Koordination. Dieser Rechner dient nur zu Bildungszwecken — fahren Sie niemals nach Alkoholkonsum.',
      ],
      faq: [
        { q: 'Wie wird der BAK berechnet?', a: 'Der BAK wird mit der Widmark-Formel geschätzt: BAK = (Alkohol in Gramm / (Gewicht in Gramm x Widmark-Faktor)) x 100 - (0,015 x Stunden). Der Widmark-Faktor ist 0,68 für Männer und 0,55 für Frauen. Ein Standardgetränk enthält etwa 14 Gramm reinen Alkohol.' },
        { q: 'Welcher BAK-Wert gilt als illegal?', a: 'In Deutschland liegt die Promillegrenze bei 0,05% BAK (0,5 Promille). Für Fahranfänger und unter 21-Jährige gilt die 0,0-Promille-Grenze. In den USA liegt die Grenze generell bei 0,08%.' },
        { q: 'Wie lange braucht der Körper zum Alkoholabbau?', a: 'Der Körper baut Alkohol mit etwa 0,015% BAK pro Stunde ab. Bei einem BAK von 0,08% würde es etwa 5,3 Stunden dauern, bis 0,00% erreicht ist. Diese Rate ist konstant und kann nicht durch Kaffee, kalte Duschen oder Sport beschleunigt werden.' },
        { q: 'Warum erreichen Frauen einen höheren BAK?', a: 'Frauen haben im Allgemeinen einen geringeren Anteil an Körperwasser als Männer gleichen Gewichts. Da sich Alkohol im Körperwasser verteilt, erreichen Frauen bei gleicher Alkoholmenge höhere Konzentrationen.' },
        { q: 'Ist dieser Rechner genau?', a: 'Er liefert grobe Schätzungen basierend auf der Widmark-Formel. Der tatsächliche BAK hängt von vielen individuellen Faktoren ab. Laborbluttests sind die einzige wirklich genaue Methode. Verwenden Sie diesen Rechner niemals, um zu entscheiden, ob es sicher ist zu fahren.' },
      ],
    },
    pt: {
      title: 'Calculadora de Álcool no Sangue Grátis (BAC) – Estime Seu Nível de Alcoolemia',
      paragraphs: [
        'Uma calculadora de teor de álcool no sangue (BAC) é uma ferramenta que estima a concentração de álcool na sua corrente sanguínea com base em diversos fatores. Compreender seu BAC é importante para tomar decisões responsáveis sobre dirigir e reconhecer os efeitos do álcool no seu corpo. Nossa calculadora utiliza a fórmula de Widmark, o método científico mais amplamente aceito.',
        'A fórmula de Widmark calcula o BAC como: (álcool consumido em gramas) / (peso corporal em gramas x fator de Widmark) x 100, menos a taxa metabólica (0,015% por hora) multiplicada pelo tempo desde a primeira bebida. O fator de Widmark é 0,68 para homens e 0,55 para mulheres.',
        'Cada "bebida padrão" contém aproximadamente 14 gramas de álcool puro — equivalente a uma cerveja de 355ml a 5%, uma taça de vinho de 150ml a 12%, ou uma dose de destilado de 45ml a 40%. O corpo metaboliza o álcool a uma taxa média de cerca de 0,015% BAC por hora.',
        'O limite legal para dirigir na maioria dos países é um BAC de 0,05% no Brasil (2 dg/l). Mesmo abaixo do limite legal, qualquer quantidade de álcool prejudica o tempo de reação e a coordenação. Esta calculadora é apenas para fins educativos — nunca dirija após consumir bebidas alcoólicas.',
      ],
      faq: [
        { q: 'Como o BAC é calculado?', a: 'O BAC é estimado pela fórmula de Widmark: BAC = (álcool em gramas / (peso em gramas x fator Widmark)) x 100 - (0,015 x horas). O fator Widmark é 0,68 para homens e 0,55 para mulheres. Uma bebida padrão contém cerca de 14 gramas de álcool puro.' },
        { q: 'Qual nível de BAC é considerado ilegal?', a: 'No Brasil, a Lei Seca estabelece tolerância zero (0,00% BAC) para dirigir, embora a infração administrativa comece em 0,05% BAC. Na maioria dos países europeus o limite é 0,05%, e nos EUA geralmente 0,08%.' },
        { q: 'Quanto tempo o corpo leva para eliminar o álcool?', a: 'O corpo elimina o álcool a aproximadamente 0,015% BAC por hora. Com um BAC de 0,08%, levaria cerca de 5,3 horas para chegar a 0,00%. Essa taxa é constante e não pode ser acelerada por café, banhos frios ou exercício.' },
        { q: 'Por que as mulheres atingem um BAC mais alto?', a: 'As mulheres geralmente têm menor proporção de água corporal que homens do mesmo peso. Como o álcool se distribui na água corporal, as mulheres atingem concentrações mais altas com a mesma quantidade de álcool.' },
        { q: 'Esta calculadora é precisa?', a: 'Fornece estimativas aproximadas baseadas na fórmula de Widmark. O BAC real depende de muitos fatores individuais. Exames de sangue em laboratório são o único método verdadeiramente preciso. Nunca use esta calculadora para decidir se é seguro dirigir.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="blood-alcohol-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Disclaimer at top */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-700 font-medium">{labels.disclaimer[lang]}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Weight input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.weight[lang]}</label>
            <div className="flex gap-2">
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={weightUnit === 'kg' ? '70' : '154'} min="0" className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
              <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lbs')} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                <option value="kg">{labels.kg[lang]}</option>
                <option value="lbs">{labels.lbs[lang]}</option>
              </select>
            </div>
          </div>

          {/* Gender selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.gender[lang]}</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setGender('male')} className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${gender === 'male' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                {labels.male[lang]}
              </button>
              <button onClick={() => setGender('female')} className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${gender === 'female' ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                {labels.female[lang]}
              </button>
            </div>
          </div>

          {/* Drink type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.drinkType[lang]}</label>
            <select value={drinkType} onChange={(e) => setDrinkType(e.target.value as 'beer' | 'wine' | 'spirits')} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500">
              <option value="beer">{labels.beer[lang]}</option>
              <option value="wine">{labels.wine[lang]}</option>
              <option value="spirits">{labels.spirits[lang]}</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">{labels.standardDrink[lang]}</p>
          </div>

          {/* Number of drinks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.drinks[lang]}</label>
            <input type="number" value={drinks} onChange={(e) => setDrinks(e.target.value)} placeholder="3" min="0" step="0.5" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Time drinking */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.timeDrinking[lang]}</label>
            <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="2" min="0" step="0.5" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button onClick={handleCalculate} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              {labels.calculate[lang]}
            </button>
            <button onClick={handleReset} className="flex-1 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
              {labels.reset[lang]}
            </button>
          </div>

          {/* Results */}
          {hasResult && (
            <div className="space-y-4">
              {/* BAC display */}
              <div className={`p-5 rounded-xl border text-center ${isAboveLimit ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-200'}`}>
                <div className="text-sm text-gray-500">{labels.estimatedBAC[lang]}</div>
                <div className={`text-4xl font-bold ${isAboveLimit ? 'text-red-700' : 'text-green-700'}`}>{bac.toFixed(3)}%</div>
                {isAboveLimit && (
                  <div className="mt-2 text-sm font-bold text-red-600 bg-red-100 inline-block px-3 py-1 rounded-full">
                    {labels.warning[lang]}
                  </div>
                )}
                {!isAboveLimit && bac > 0 && (
                  <div className="mt-2 text-sm font-medium text-green-600">
                    {labels.safe[lang]}
                  </div>
                )}
              </div>

              {/* BAC gauge bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>0.00%</span>
                  <span className="text-red-500 font-medium">0.08% ({labels.legalLimit[lang]})</span>
                  <span>0.40%</span>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-4">
                  <div className={`${gaugeColor} h-4 rounded-full transition-all duration-500`} style={{ width: `${gaugePercent}%` }} />
                  {/* Legal limit marker */}
                  <div className="absolute top-0 h-4 border-r-2 border-red-600" style={{ left: '20%' }} />
                </div>
              </div>

              {/* Impairment and time to sober */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl ${impairment.bg} border ${impairment.border} text-center`}>
                  <div className="text-xs text-gray-500">{labels.impairment[lang]}</div>
                  <div className={`text-lg font-bold ${impairment.color} mt-1`}>{impairment.text}</div>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
                  <div className="text-xs text-gray-500">{labels.timeToSober[lang]}</div>
                  <div className="text-lg font-bold text-blue-700 mt-1">
                    {bac > 0 ? `${Math.floor(timeToSober)} ${labels.hoursLabel[lang]} ${Math.round((timeToSober % 1) * 60)} ${labels.minutesLabel[lang]}` : labels.sober[lang]}
                  </div>
                </div>
              </div>

              {/* Impairment scale */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">{labels.bacScale[lang]}</h3>
                <div className="space-y-1">
                  {[
                    { range: '0.00 - 0.02%', level: labels.minimal[lang], color: 'bg-green-200', active: bac >= 0 && bac < 0.02 },
                    { range: '0.02 - 0.05%', level: labels.mild[lang], color: 'bg-yellow-200', active: bac >= 0.02 && bac < 0.05 },
                    { range: '0.05 - 0.08%', level: labels.significant[lang], color: 'bg-orange-200', active: bac >= 0.05 && bac < 0.08 },
                    { range: '0.08 - 0.15%', level: labels.severe[lang], color: 'bg-red-200', active: bac >= 0.08 && bac < 0.15 },
                    { range: '0.15%+', level: labels.lifeThreatening[lang], color: 'bg-red-400', active: bac >= 0.15 },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${item.active ? item.color + ' font-bold ring-2 ring-gray-400' : 'bg-gray-50'}`}>
                      <span className="text-gray-700">{item.range}</span>
                      <span className="text-gray-600">{item.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Copy button */}
              <button onClick={copyResults} className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">
                {copied ? labels.copied[lang] : labels.copy[lang]}
              </button>
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
                    {h.drinks} {labels.drinks[lang].toLowerCase()} / {h.weight} {weightUnit}
                  </div>
                  <div className={`font-medium ${h.bac >= 0.08 ? 'text-red-600' : 'text-green-600'}`}>
                    BAC: {h.bac.toFixed(3)}% — {h.impairment}
                  </div>
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
