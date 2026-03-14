'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type HistoryEntry = {
  weight: number;
  height: number;
  age: number;
  gender: string;
  activity: string;
  tdee: number;
  unit: string;
};

export default function TdeeCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['tdee-calculator'][lang];

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activity, setActivity] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very-active'>('moderate');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<{ weight?: string; height?: string; age?: string }>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const labels = {
    weight: { en: 'Weight (kg)', it: 'Peso (kg)', es: 'Peso (kg)', fr: 'Poids (kg)', de: 'Gewicht (kg)', pt: 'Peso (kg)' },
    weightLbs: { en: 'Weight (lbs)', it: 'Peso (lbs)', es: 'Peso (lbs)', fr: 'Poids (lbs)', de: 'Gewicht (lbs)', pt: 'Peso (lbs)' },
    height: { en: 'Height (cm)', it: 'Altezza (cm)', es: 'Altura (cm)', fr: 'Taille (cm)', de: 'Gr\u00f6\u00dfe (cm)', pt: 'Altura (cm)' },
    heightIn: { en: 'Height (inches)', it: 'Altezza (pollici)', es: 'Altura (pulgadas)', fr: 'Taille (pouces)', de: 'Gr\u00f6\u00dfe (Zoll)', pt: 'Altura (polegadas)' },
    age: { en: 'Age (years)', it: 'Et\u00e0 (anni)', es: 'Edad (a\u00f1os)', fr: '\u00c2ge (ans)', de: 'Alter (Jahre)', pt: 'Idade (anos)' },
    male: { en: 'Male', it: 'Maschio', es: 'Masculino', fr: 'Homme', de: 'M\u00e4nnlich', pt: 'Masculino' },
    female: { en: 'Female', it: 'Femmina', es: 'Femenino', fr: 'Femme', de: 'Weiblich', pt: 'Feminino' },
    metric: { en: 'Metric (kg/cm)', it: 'Metrico (kg/cm)', es: 'M\u00e9trico (kg/cm)', fr: 'M\u00e9trique (kg/cm)', de: 'Metrisch (kg/cm)', pt: 'M\u00e9trico (kg/cm)' },
    imperial: { en: 'Imperial (lbs/in)', it: 'Imperiale (lbs/in)', es: 'Imperial (lbs/in)', fr: 'Imp\u00e9rial (lbs/in)', de: 'Imperial (lbs/in)', pt: 'Imperial (lbs/in)' },
    activityLevel: { en: 'Activity Level', it: 'Livello di Attivit\u00e0', es: 'Nivel de Actividad', fr: "Niveau d'Activit\u00e9", de: 'Aktivit\u00e4tslevel', pt: 'N\u00edvel de Atividade' },
    sedentary: { en: 'Sedentary (office job)', it: 'Sedentario (lavoro d\'ufficio)', es: 'Sedentario (trabajo de oficina)', fr: 'S\u00e9dentaire (travail de bureau)', de: 'Sitzend (B\u00fcrojob)', pt: 'Sedent\u00e1rio (trabalho de escrit\u00f3rio)' },
    light: { en: 'Light (1-3 days/week)', it: 'Leggero (1-3 giorni/sett.)', es: 'Ligero (1-3 d\u00edas/sem.)', fr: 'L\u00e9ger (1-3 jours/sem.)', de: 'Leicht (1-3 Tage/Woche)', pt: 'Leve (1-3 dias/sem.)' },
    moderate: { en: 'Moderate (3-5 days/week)', it: 'Moderato (3-5 giorni/sett.)', es: 'Moderado (3-5 d\u00edas/sem.)', fr: 'Mod\u00e9r\u00e9 (3-5 jours/sem.)', de: 'Moderat (3-5 Tage/Woche)', pt: 'Moderado (3-5 dias/sem.)' },
    active: { en: 'Active (6-7 days/week)', it: 'Attivo (6-7 giorni/sett.)', es: 'Activo (6-7 d\u00edas/sem.)', fr: 'Actif (6-7 jours/sem.)', de: 'Aktiv (6-7 Tage/Woche)', pt: 'Ativo (6-7 dias/sem.)' },
    veryActive: { en: 'Very Active (2x/day)', it: 'Molto Attivo (2x/giorno)', es: 'Muy Activo (2x/d\u00eda)', fr: 'Tr\u00e8s Actif (2x/jour)', de: 'Sehr Aktiv (2x/Tag)', pt: 'Muito Ativo (2x/dia)' },
    tdeeResult: { en: 'Your TDEE', it: 'Il Tuo TDEE', es: 'Tu TDEE', fr: 'Votre TDEE', de: 'Ihr TDEE', pt: 'Seu TDEE' },
    bmrResult: { en: 'Basal Metabolic Rate (BMR)', it: 'Metabolismo Basale (BMR)', es: 'Tasa Metab\u00f3lica Basal (TMB)', fr: 'M\u00e9tabolisme de Base (MB)', de: 'Grundumsatz (BMR)', pt: 'Taxa Metab\u00f3lica Basal (TMB)' },
    calsPerDay: { en: 'calories/day', it: 'calorie/giorno', es: 'calor\u00edas/d\u00eda', fr: 'calories/jour', de: 'Kalorien/Tag', pt: 'calorias/dia' },
    goals: { en: 'Calorie Goals', it: 'Obiettivi Calorici', es: 'Objetivos Cal\u00f3ricos', fr: 'Objectifs Caloriques', de: 'Kalorienziele', pt: 'Objetivos Cal\u00f3ricos' },
    loseFast: { en: 'Lose weight fast (-1 kg/wk)', it: 'Dimagrire veloce (-1 kg/sett.)', es: 'Perder r\u00e1pido (-1 kg/sem.)', fr: 'Perte rapide (-1 kg/sem.)', de: 'Schnell abnehmen (-1 kg/Wo.)', pt: 'Perder r\u00e1pido (-1 kg/sem.)' },
    loseSlow: { en: 'Lose weight (-0.5 kg/wk)', it: 'Dimagrire (-0,5 kg/sett.)', es: 'Perder peso (-0,5 kg/sem.)', fr: 'Perte de poids (-0,5 kg/sem.)', de: 'Abnehmen (-0,5 kg/Wo.)', pt: 'Perder peso (-0,5 kg/sem.)' },
    maintain: { en: 'Maintain weight', it: 'Mantenere il peso', es: 'Mantener peso', fr: 'Maintenir le poids', de: 'Gewicht halten', pt: 'Manter peso' },
    gainSlow: { en: 'Gain weight (+0.5 kg/wk)', it: 'Aumentare (+0,5 kg/sett.)', es: 'Ganar peso (+0,5 kg/sem.)', fr: 'Prise de poids (+0,5 kg/sem.)', de: 'Zunehmen (+0,5 kg/Wo.)', pt: 'Ganhar peso (+0,5 kg/sem.)' },
    gainFast: { en: 'Gain weight fast (+1 kg/wk)', it: 'Aumentare veloce (+1 kg/sett.)', es: 'Ganar r\u00e1pido (+1 kg/sem.)', fr: 'Prise rapide (+1 kg/sem.)', de: 'Schnell zunehmen (+1 kg/Wo.)', pt: 'Ganhar r\u00e1pido (+1 kg/sem.)' },
    reset: { en: 'Reset', it: 'Resetta', es: 'Restablecer', fr: 'R\u00e9initialiser', de: 'Zur\u00fccksetzen', pt: 'Redefinir' },
    copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier R\u00e9sultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copi\u00e9!', de: 'Kopiert!', pt: 'Copiado!' },
    history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'C\u00e1lculos Recientes', fr: 'Calculs R\u00e9cents', de: 'Letzte Berechnungen', pt: 'C\u00e1lculos Recentes' },
    invalidWeight: { en: 'Enter a valid weight', it: 'Inserisci un peso valido', es: 'Ingresa un peso v\u00e1lido', fr: 'Entrez un poids valide', de: 'G\u00fcltiges Gewicht eingeben', pt: 'Insira um peso v\u00e1lido' },
    invalidHeight: { en: 'Enter a valid height', it: 'Inserisci un\'altezza valida', es: 'Ingresa una altura v\u00e1lida', fr: 'Entrez une taille valide', de: 'G\u00fcltige Gr\u00f6\u00dfe eingeben', pt: 'Insira uma altura v\u00e1lida' },
    invalidAge: { en: 'Enter a valid age (15-100)', it: 'Inserisci un\'et\u00e0 valida (15-100)', es: 'Ingresa una edad v\u00e1lida (15-100)', fr: 'Entrez un \u00e2ge valide (15-100)', de: 'G\u00fcltiges Alter eingeben (15-100)', pt: 'Insira uma idade v\u00e1lida (15-100)' },
    gender: { en: 'Gender', it: 'Sesso', es: 'G\u00e9nero', fr: 'Sexe', de: 'Geschlecht', pt: 'Sexo' },
  } as Record<string, Record<Locale, string>>;

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    'very-active': 1.9,
  };

  // Convert to metric for calculation
  const wKg = unit === 'metric' ? (parseFloat(weight) || 0) : (parseFloat(weight) || 0) * 0.453592;
  const hCm = unit === 'metric' ? (parseFloat(height) || 0) : (parseFloat(height) || 0) * 2.54;
  const ageVal = parseInt(age) || 0;

  // Mifflin-St Jeor Equation
  const bmr = gender === 'male'
    ? (10 * wKg) + (6.25 * hCm) - (5 * ageVal) + 5
    : (10 * wKg) + (6.25 * hCm) - (5 * ageVal) - 161;

  const tdee = bmr * activityMultipliers[activity];

  const isValid = wKg > 0 && hCm > 0 && ageVal >= 15 && ageVal <= 100 && !errors.weight && !errors.height && !errors.age;

  const goalCalories = [
    { label: labels.loseFast[lang], cal: Math.round(tdee - 1000), color: 'text-red-600', bg: 'bg-red-50' },
    { label: labels.loseSlow[lang], cal: Math.round(tdee - 500), color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: labels.maintain[lang], cal: Math.round(tdee), color: 'text-green-600', bg: 'bg-green-50' },
    { label: labels.gainSlow[lang], cal: Math.round(tdee + 500), color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: labels.gainFast[lang], cal: Math.round(tdee + 1000), color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const validate = () => {
    const newErrors: { weight?: string; height?: string; age?: string } = {};
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    if (weight && (isNaN(w) || w <= 0)) newErrors.weight = labels.invalidWeight[lang];
    if (height && (isNaN(h) || h <= 0)) newErrors.height = labels.invalidHeight[lang];
    if (age && (isNaN(a) || a < 15 || a > 100)) newErrors.age = labels.invalidAge[lang];
    setErrors(newErrors);
  };

  const handleCalculation = () => {
    if (isValid && tdee > 0) {
      const activityLabels: Record<string, string> = {
        sedentary: labels.sedentary[lang],
        light: labels.light[lang],
        moderate: labels.moderate[lang],
        active: labels.active[lang],
        'very-active': labels.veryActive[lang],
      };
      const entry: HistoryEntry = {
        weight: parseFloat(weight),
        height: parseFloat(height),
        age: ageVal,
        gender: labels[gender][lang],
        activity: activityLabels[activity],
        tdee: Math.round(tdee),
        unit,
      };
      setHistory(prev => [entry, ...prev.filter((_, i) => i < 4)]);
    }
  };

  const handleReset = () => {
    setWeight('');
    setHeight('');
    setAge('');
    setGender('male');
    setActivity('moderate');
    setErrors({});
  };

  const copyResults = () => {
    const lines = [
      `TDEE: ${Math.round(tdee)} ${labels.calsPerDay[lang]}`,
      `BMR: ${Math.round(bmr)} ${labels.calsPerDay[lang]}`,
      '',
      ...goalCalories.map(g => `${g.label}: ${g.cal} ${labels.calsPerDay[lang]}`),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free TDEE Calculator – Calculate Your Total Daily Energy Expenditure Online',
      paragraphs: [
        'Total Daily Energy Expenditure (TDEE) represents the total number of calories your body burns in a single day, combining your Basal Metabolic Rate (BMR) with your physical activity level. Understanding your TDEE is the cornerstone of any effective nutrition plan, whether your goal is weight loss, muscle gain, or simply maintaining your current physique. Unlike static calorie recommendations, TDEE provides a personalized estimate tailored to your unique body composition and lifestyle.',
        'Our free TDEE calculator uses the Mifflin-St Jeor equation, widely recognized by nutritionists and sports scientists as the most accurate formula for estimating resting metabolic rate. The equation takes into account your weight, height, age, and gender to calculate your BMR, then multiplies it by an activity factor ranging from sedentary (office worker with no exercise) to very active (intense training twice daily). This approach gives you a reliable baseline for planning your daily calorie intake.',
        'Once you know your TDEE, you can create a strategic calorie deficit or surplus to reach your goals. For safe weight loss, most experts recommend a moderate deficit of 500 calories per day, which translates to roughly 0.5 kg (1 lb) of fat loss per week. For lean muscle gain, a modest surplus of 250-500 calories above TDEE, paired with resistance training, is typically recommended. Our calculator instantly shows you calorie targets for five different goals, from aggressive fat loss to rapid muscle building.',
        'Keep in mind that TDEE is an estimate and individual results may vary based on genetics, hormonal factors, body composition, and the thermic effect of food. It is best used as a starting point. Track your weight and energy levels over 2-3 weeks, then adjust your intake up or down by 100-200 calories as needed. For personalized advice, consult a registered dietitian or healthcare professional who can factor in your medical history and specific requirements.',
      ],
      faq: [
        { q: 'What is TDEE and why does it matter?', a: 'TDEE stands for Total Daily Energy Expenditure. It is the total number of calories your body burns per day, including your basal metabolic rate, physical activity, and the thermic effect of food. Knowing your TDEE helps you set accurate calorie goals for weight loss, maintenance, or muscle gain.' },
        { q: 'How is TDEE different from BMR?', a: 'BMR (Basal Metabolic Rate) is the number of calories your body burns at complete rest to maintain basic functions like breathing and circulation. TDEE includes BMR plus all additional calories burned through physical activity, exercise, and digesting food. TDEE is always higher than BMR.' },
        { q: 'Which equation does this calculator use?', a: 'This calculator uses the Mifflin-St Jeor equation, which is considered the most accurate formula for estimating resting metabolic rate by the Academy of Nutrition and Dietetics. For men: BMR = (10 x weight in kg) + (6.25 x height in cm) - (5 x age) + 5. For women: BMR = (10 x weight in kg) + (6.25 x height in cm) - (5 x age) - 161.' },
        { q: 'How do I choose the right activity level?', a: 'Choose Sedentary if you have a desk job and do no exercise. Light is for 1-3 days of light exercise per week. Moderate covers 3-5 days of moderate exercise. Active is for 6-7 days of hard exercise. Very Active is for athletes who train intensely twice per day or have a physically demanding job combined with exercise.' },
        { q: 'How many calories should I eat to lose weight?', a: 'For safe, sustainable weight loss, aim for a deficit of 500 calories below your TDEE, which typically results in about 0.5 kg (1 lb) of fat loss per week. Avoid going below 1,200 calories per day for women or 1,500 for men without medical supervision, as this can lead to nutrient deficiencies and metabolic slowdown.' },
      ],
    },
    it: {
      title: 'Calcolatore TDEE Gratuito – Calcola il Tuo Dispendio Energetico Giornaliero Totale Online',
      paragraphs: [
        'Il Dispendio Energetico Giornaliero Totale (TDEE) rappresenta il numero totale di calorie che il tuo corpo brucia in un singolo giorno, combinando il Metabolismo Basale (BMR) con il livello di attivit\u00e0 fisica. Comprendere il tuo TDEE \u00e8 la base di qualsiasi piano nutrizionale efficace, che il tuo obiettivo sia perdere peso, aumentare la massa muscolare o semplicemente mantenere il tuo fisico attuale. A differenza delle raccomandazioni caloriche statiche, il TDEE fornisce una stima personalizzata.',
        'Il nostro calcolatore TDEE gratuito utilizza l\'equazione di Mifflin-St Jeor, ampiamente riconosciuta da nutrizionisti e scienziati sportivi come la formula pi\u00f9 accurata per stimare il metabolismo a riposo. L\'equazione tiene conto di peso, altezza, et\u00e0 e sesso per calcolare il BMR, poi lo moltiplica per un fattore di attivit\u00e0 che va da sedentario a molto attivo. Questo approccio ti fornisce una base affidabile per pianificare l\'assunzione calorica giornaliera.',
        'Una volta conosciuto il tuo TDEE, puoi creare un deficit o surplus calorico strategico per raggiungere i tuoi obiettivi. Per una perdita di peso sicura, la maggior parte degli esperti raccomanda un deficit moderato di 500 calorie al giorno, che si traduce in circa 0,5 kg di perdita di grasso a settimana. Per l\'aumento di massa muscolare magra, un surplus modesto di 250-500 calorie sopra il TDEE, abbinato ad allenamento con i pesi, \u00e8 generalmente raccomandato.',
        'Tieni presente che il TDEE \u00e8 una stima e i risultati individuali possono variare in base a genetica, fattori ormonali, composizione corporea e l\'effetto termico del cibo. \u00c8 meglio usarlo come punto di partenza. Monitora il tuo peso e i livelli di energia per 2-3 settimane, poi regola l\'assunzione di 100-200 calorie secondo necessit\u00e0. Per consigli personalizzati, consulta un dietista o un professionista sanitario.',
      ],
      faq: [
        { q: 'Cos\'\u00e8 il TDEE e perch\u00e9 \u00e8 importante?', a: 'TDEE sta per Dispendio Energetico Giornaliero Totale. \u00c8 il numero totale di calorie che il tuo corpo brucia al giorno, incluso il metabolismo basale, l\'attivit\u00e0 fisica e l\'effetto termico del cibo. Conoscere il tuo TDEE ti aiuta a impostare obiettivi calorici accurati per perdita di peso, mantenimento o aumento muscolare.' },
        { q: 'Qual \u00e8 la differenza tra TDEE e BMR?', a: 'Il BMR (Metabolismo Basale) \u00e8 il numero di calorie che il corpo brucia a riposo completo per mantenere le funzioni vitali. Il TDEE include il BMR pi\u00f9 tutte le calorie bruciate tramite attivit\u00e0 fisica, esercizio e digestione. Il TDEE \u00e8 sempre superiore al BMR.' },
        { q: 'Quale equazione usa questo calcolatore?', a: 'Questo calcolatore usa l\'equazione di Mifflin-St Jeor, considerata la formula pi\u00f9 accurata per stimare il metabolismo a riposo. Per gli uomini: BMR = (10 x peso in kg) + (6,25 x altezza in cm) - (5 x et\u00e0) + 5. Per le donne: BMR = (10 x peso in kg) + (6,25 x altezza in cm) - (5 x et\u00e0) - 161.' },
        { q: 'Come scelgo il giusto livello di attivit\u00e0?', a: 'Scegli Sedentario se hai un lavoro d\'ufficio e non fai esercizio. Leggero \u00e8 per 1-3 giorni di esercizio leggero a settimana. Moderato copre 3-5 giorni. Attivo \u00e8 per 6-7 giorni di esercizio intenso. Molto Attivo \u00e8 per atleti che si allenano intensamente due volte al giorno.' },
        { q: 'Quante calorie devo mangiare per dimagrire?', a: 'Per una perdita di peso sicura e sostenibile, punta a un deficit di 500 calorie sotto il tuo TDEE, che tipicamente risulta in circa 0,5 kg di perdita di grasso a settimana. Evita di scendere sotto le 1.200 calorie al giorno per le donne o 1.500 per gli uomini senza supervisione medica.' },
      ],
    },
    es: {
      title: 'Calculadora TDEE Gratis \u2013 Calcula Tu Gasto Energ\u00e9tico Diario Total Online',
      paragraphs: [
        'El Gasto Energ\u00e9tico Diario Total (TDEE) representa el n\u00famero total de calor\u00edas que tu cuerpo quema en un solo d\u00eda, combinando tu Tasa Metab\u00f3lica Basal (TMB) con tu nivel de actividad f\u00edsica. Comprender tu TDEE es la piedra angular de cualquier plan nutricional efectivo, ya sea que tu objetivo sea perder peso, ganar m\u00fasculo o simplemente mantener tu f\u00edsico actual. A diferencia de las recomendaciones cal\u00f3ricas est\u00e1ticas, el TDEE proporciona una estimaci\u00f3n personalizada.',
        'Nuestra calculadora TDEE gratuita utiliza la ecuaci\u00f3n de Mifflin-St Jeor, ampliamente reconocida por nutricionistas y cient\u00edficos deportivos como la f\u00f3rmula m\u00e1s precisa para estimar el metabolismo en reposo. La ecuaci\u00f3n tiene en cuenta tu peso, altura, edad y sexo para calcular tu TMB, luego lo multiplica por un factor de actividad que va desde sedentario hasta muy activo.',
        'Una vez que conoces tu TDEE, puedes crear un d\u00e9ficit o super\u00e1vit cal\u00f3rico estrat\u00e9gico para alcanzar tus objetivos. Para una p\u00e9rdida de peso segura, la mayor\u00eda de expertos recomienda un d\u00e9ficit moderado de 500 calor\u00edas al d\u00eda, lo que se traduce en aproximadamente 0,5 kg de p\u00e9rdida de grasa por semana. Para ganar masa muscular magra, se recomienda un super\u00e1vit modesto de 250-500 calor\u00edas por encima del TDEE, combinado con entrenamiento de resistencia.',
        'Ten en cuenta que el TDEE es una estimaci\u00f3n y los resultados individuales pueden variar seg\u00fan la gen\u00e9tica, factores hormonales, composici\u00f3n corporal y el efecto t\u00e9rmico de los alimentos. Es mejor usarlo como punto de partida. Monitorea tu peso y niveles de energ\u00eda durante 2-3 semanas, luego ajusta tu ingesta en 100-200 calor\u00edas seg\u00fan sea necesario. Para consejos personalizados, consulta a un dietista o profesional de la salud.',
      ],
      faq: [
        { q: '\u00bfQu\u00e9 es el TDEE y por qu\u00e9 es importante?', a: 'TDEE significa Gasto Energ\u00e9tico Diario Total. Es el n\u00famero total de calor\u00edas que tu cuerpo quema por d\u00eda, incluyendo el metabolismo basal, la actividad f\u00edsica y el efecto t\u00e9rmico de los alimentos. Conocer tu TDEE te ayuda a establecer objetivos cal\u00f3ricos precisos.' },
        { q: '\u00bfCu\u00e1l es la diferencia entre TDEE y TMB?', a: 'La TMB es el n\u00famero de calor\u00edas que tu cuerpo quema en reposo completo para mantener funciones vitales. El TDEE incluye la TMB m\u00e1s todas las calor\u00edas quemadas por actividad f\u00edsica, ejercicio y digesti\u00f3n. El TDEE siempre es mayor que la TMB.' },
        { q: '\u00bfQu\u00e9 ecuaci\u00f3n usa esta calculadora?', a: 'Esta calculadora usa la ecuaci\u00f3n de Mifflin-St Jeor. Para hombres: TMB = (10 x peso en kg) + (6,25 x altura en cm) - (5 x edad) + 5. Para mujeres: TMB = (10 x peso en kg) + (6,25 x altura en cm) - (5 x edad) - 161.' },
        { q: '\u00bfC\u00f3mo elijo el nivel de actividad correcto?', a: 'Elige Sedentario si tienes un trabajo de oficina sin ejercicio. Ligero para 1-3 d\u00edas de ejercicio leve por semana. Moderado cubre 3-5 d\u00edas. Activo para 6-7 d\u00edas de ejercicio intenso. Muy Activo para atletas que entrenan intensamente dos veces al d\u00eda.' },
        { q: '\u00bfCu\u00e1ntas calor\u00edas debo comer para perder peso?', a: 'Para una p\u00e9rdida de peso segura, apunta a un d\u00e9ficit de 500 calor\u00edas por debajo de tu TDEE, lo que resulta en aproximadamente 0,5 kg de p\u00e9rdida de grasa por semana. Evita bajar de 1.200 calor\u00edas diarias para mujeres o 1.500 para hombres sin supervisi\u00f3n m\u00e9dica.' },
      ],
    },
    fr: {
      title: 'Calculateur TDEE Gratuit \u2013 Calculez Votre D\u00e9pense \u00c9nerg\u00e9tique Journali\u00e8re Totale en Ligne',
      paragraphs: [
        'La D\u00e9pense \u00c9nerg\u00e9tique Journali\u00e8re Totale (TDEE) repr\u00e9sente le nombre total de calories que votre corps br\u00fble en une seule journ\u00e9e, combinant votre M\u00e9tabolisme de Base (MB) avec votre niveau d\'activit\u00e9 physique. Comprendre votre TDEE est la pierre angulaire de tout plan nutritionnel efficace, que votre objectif soit de perdre du poids, gagner du muscle ou simplement maintenir votre physique actuel.',
        'Notre calculateur TDEE gratuit utilise l\'\u00e9quation de Mifflin-St Jeor, largement reconnue par les nutritionnistes et scientifiques du sport comme la formule la plus pr\u00e9cise pour estimer le m\u00e9tabolisme au repos. L\'\u00e9quation prend en compte votre poids, taille, \u00e2ge et sexe pour calculer votre MB, puis le multiplie par un facteur d\'activit\u00e9 allant de s\u00e9dentaire \u00e0 tr\u00e8s actif.',
        'Une fois votre TDEE connu, vous pouvez cr\u00e9er un d\u00e9ficit ou surplus calorique strat\u00e9gique pour atteindre vos objectifs. Pour une perte de poids s\u00fbre, la plupart des experts recommandent un d\u00e9ficit mod\u00e9r\u00e9 de 500 calories par jour, soit environ 0,5 kg de perte de graisse par semaine. Pour une prise de masse musculaire maigre, un surplus modeste de 250-500 calories au-dessus du TDEE, associ\u00e9 \u00e0 un entra\u00eenement en r\u00e9sistance, est g\u00e9n\u00e9ralement recommand\u00e9.',
        'Gardez \u00e0 l\'esprit que le TDEE est une estimation et les r\u00e9sultats individuels peuvent varier selon la g\u00e9n\u00e9tique, les facteurs hormonaux, la composition corporelle et l\'effet thermique des aliments. Utilisez-le comme point de d\u00e9part. Suivez votre poids et niveaux d\'\u00e9nergie pendant 2-3 semaines, puis ajustez votre apport de 100-200 calories selon les besoins. Pour des conseils personnalis\u00e9s, consultez un di\u00e9t\u00e9ticien ou un professionnel de sant\u00e9.',
      ],
      faq: [
        { q: 'Qu\'est-ce que le TDEE et pourquoi est-il important ?', a: 'TDEE signifie D\u00e9pense \u00c9nerg\u00e9tique Journali\u00e8re Totale. C\'est le nombre total de calories que votre corps br\u00fble par jour, incluant le m\u00e9tabolisme de base, l\'activit\u00e9 physique et l\'effet thermique des aliments. Conna\u00eetre votre TDEE vous aide \u00e0 d\u00e9finir des objectifs caloriques pr\u00e9cis.' },
        { q: 'Quelle est la diff\u00e9rence entre TDEE et MB ?', a: 'Le MB (M\u00e9tabolisme de Base) est le nombre de calories que le corps br\u00fble au repos complet pour maintenir les fonctions vitales. Le TDEE inclut le MB plus toutes les calories br\u00fbl\u00e9es par l\'activit\u00e9 physique, l\'exercice et la digestion. Le TDEE est toujours sup\u00e9rieur au MB.' },
        { q: 'Quelle \u00e9quation ce calculateur utilise-t-il ?', a: 'Ce calculateur utilise l\'\u00e9quation de Mifflin-St Jeor. Pour les hommes : MB = (10 x poids en kg) + (6,25 x taille en cm) - (5 x \u00e2ge) + 5. Pour les femmes : MB = (10 x poids en kg) + (6,25 x taille en cm) - (5 x \u00e2ge) - 161.' },
        { q: 'Comment choisir le bon niveau d\'activit\u00e9 ?', a: 'Choisissez S\u00e9dentaire si vous avez un travail de bureau sans exercice. L\u00e9ger pour 1-3 jours d\'exercice par semaine. Mod\u00e9r\u00e9 couvre 3-5 jours. Actif pour 6-7 jours d\'exercice intense. Tr\u00e8s Actif pour les athl\u00e8tes qui s\'entra\u00eenent intensivement deux fois par jour.' },
        { q: 'Combien de calories dois-je manger pour perdre du poids ?', a: 'Pour une perte de poids s\u00fbre, visez un d\u00e9ficit de 500 calories en dessous de votre TDEE, ce qui r\u00e9sulte en environ 0,5 kg de perte de graisse par semaine. \u00c9vitez de descendre en dessous de 1 200 calories par jour pour les femmes ou 1 500 pour les hommes sans supervision m\u00e9dicale.' },
      ],
    },
    de: {
      title: 'Kostenloser TDEE-Rechner \u2013 Berechnen Sie Ihren Gesamtenergieumsatz Online',
      paragraphs: [
        'Der Gesamtenergieumsatz (TDEE \u2013 Total Daily Energy Expenditure) stellt die Gesamtzahl der Kalorien dar, die Ihr K\u00f6rper an einem Tag verbrennt, indem er Ihren Grundumsatz (BMR) mit Ihrem k\u00f6rperlichen Aktivit\u00e4tsniveau kombiniert. Das Verst\u00e4ndnis Ihres TDEE ist der Grundstein jedes effektiven Ern\u00e4hrungsplans, ob Ihr Ziel Gewichtsverlust, Muskelaufbau oder einfach die Beibehaltung Ihres aktuellen K\u00f6rperbaus ist.',
        'Unser kostenloser TDEE-Rechner verwendet die Mifflin-St Jeor-Gleichung, die von Ern\u00e4hrungswissenschaftlern und Sportmedizinern als die genaueste Formel zur Sch\u00e4tzung des Ruhestoffwechsels anerkannt ist. Die Gleichung ber\u00fccksichtigt Gewicht, Gr\u00f6\u00dfe, Alter und Geschlecht zur Berechnung des BMR und multipliziert diesen mit einem Aktivit\u00e4tsfaktor von sitzend bis sehr aktiv.',
        'Wenn Sie Ihren TDEE kennen, k\u00f6nnen Sie ein strategisches Kaloriendefizit oder einen \u00dcberschuss schaffen. F\u00fcr sicheren Gewichtsverlust empfehlen die meisten Experten ein moderates Defizit von 500 Kalorien pro Tag, was etwa 0,5 kg Fettverlust pro Woche entspricht. F\u00fcr mageren Muskelaufbau wird ein moderater \u00dcberschuss von 250-500 Kalorien \u00fcber dem TDEE in Kombination mit Krafttraining empfohlen.',
        'Bedenken Sie, dass der TDEE eine Sch\u00e4tzung ist und individuelle Ergebnisse je nach Genetik, hormonellen Faktoren, K\u00f6rperzusammensetzung und thermischem Effekt der Nahrung variieren k\u00f6nnen. Verwenden Sie ihn als Ausgangspunkt. Verfolgen Sie Ihr Gewicht und Energieniveau \u00fcber 2-3 Wochen und passen Sie dann Ihre Aufnahme um 100-200 Kalorien an. F\u00fcr pers\u00f6nliche Beratung konsultieren Sie einen Ern\u00e4hrungsberater.',
      ],
      faq: [
        { q: 'Was ist der TDEE und warum ist er wichtig?', a: 'TDEE steht f\u00fcr Gesamtenergieumsatz (Total Daily Energy Expenditure). Es ist die Gesamtzahl der Kalorien, die Ihr K\u00f6rper pro Tag verbrennt, einschlie\u00dflich Grundumsatz, k\u00f6rperlicher Aktivit\u00e4t und thermischem Effekt der Nahrung. Die Kenntnis Ihres TDEE hilft bei der Festlegung pr\u00e4ziser Kalorienziele.' },
        { q: 'Was ist der Unterschied zwischen TDEE und BMR?', a: 'Der BMR (Grundumsatz) ist die Kalorienzahl, die der K\u00f6rper in v\u00f6lliger Ruhe verbrennt. Der TDEE umfasst den BMR plus alle durch Aktivit\u00e4t, Training und Verdauung verbrannten Kalorien. Der TDEE ist immer h\u00f6her als der BMR.' },
        { q: 'Welche Gleichung verwendet dieser Rechner?', a: 'Dieser Rechner verwendet die Mifflin-St Jeor-Gleichung. F\u00fcr M\u00e4nner: BMR = (10 x Gewicht in kg) + (6,25 x Gr\u00f6\u00dfe in cm) - (5 x Alter) + 5. F\u00fcr Frauen: BMR = (10 x Gewicht in kg) + (6,25 x Gr\u00f6\u00dfe in cm) - (5 x Alter) - 161.' },
        { q: 'Wie w\u00e4hle ich das richtige Aktivit\u00e4tslevel?', a: 'W\u00e4hlen Sie Sitzend bei B\u00fcroarbeit ohne Sport. Leicht f\u00fcr 1-3 Tage leichten Sport pro Woche. Moderat f\u00fcr 3-5 Tage. Aktiv f\u00fcr 6-7 Tage intensiven Sports. Sehr Aktiv f\u00fcr Athleten mit zweimal t\u00e4glichem intensivem Training.' },
        { q: 'Wie viele Kalorien sollte ich essen, um abzunehmen?', a: 'F\u00fcr sicheren Gewichtsverlust streben Sie ein Defizit von 500 Kalorien unter Ihrem TDEE an, was etwa 0,5 kg Fettverlust pro Woche ergibt. Gehen Sie nicht unter 1.200 Kalorien t\u00e4glich f\u00fcr Frauen oder 1.500 f\u00fcr M\u00e4nner ohne \u00e4rztliche Aufsicht.' },
      ],
    },
    pt: {
      title: 'Calculadora TDEE Gr\u00e1tis \u2013 Calcule Seu Gasto Energ\u00e9tico Di\u00e1rio Total Online',
      paragraphs: [
        'O Gasto Energ\u00e9tico Di\u00e1rio Total (TDEE) representa o n\u00famero total de calorias que seu corpo queima em um \u00fanico dia, combinando sua Taxa Metab\u00f3lica Basal (TMB) com seu n\u00edvel de atividade f\u00edsica. Compreender seu TDEE \u00e9 a base de qualquer plano nutricional eficaz, seja seu objetivo perder peso, ganhar m\u00fasculo ou simplesmente manter seu f\u00edsico atual. Diferentemente das recomenda\u00e7\u00f5es cal\u00f3ricas est\u00e1ticas, o TDEE fornece uma estimativa personalizada.',
        'Nossa calculadora TDEE gratuita utiliza a equa\u00e7\u00e3o de Mifflin-St Jeor, amplamente reconhecida por nutricionistas e cientistas esportivos como a f\u00f3rmula mais precisa para estimar o metabolismo em repouso. A equa\u00e7\u00e3o leva em conta peso, altura, idade e sexo para calcular a TMB, multiplicando-a por um fator de atividade que vai de sedent\u00e1rio a muito ativo.',
        'Depois de conhecer seu TDEE, voc\u00ea pode criar um d\u00e9ficit ou super\u00e1vit cal\u00f3rico estrat\u00e9gico para alcan\u00e7ar seus objetivos. Para perda de peso segura, a maioria dos especialistas recomenda um d\u00e9ficit moderado de 500 calorias por dia, o que resulta em aproximadamente 0,5 kg de perda de gordura por semana. Para ganho de massa muscular magra, um super\u00e1vit modesto de 250-500 calorias acima do TDEE, combinado com treino de resist\u00eancia, \u00e9 geralmente recomendado.',
        'Lembre-se de que o TDEE \u00e9 uma estimativa e os resultados individuais podem variar com base em gen\u00e9tica, fatores hormonais, composi\u00e7\u00e3o corporal e efeito t\u00e9rmico dos alimentos. Use-o como ponto de partida. Monitore seu peso e n\u00edveis de energia por 2-3 semanas e ajuste sua ingest\u00e3o em 100-200 calorias conforme necess\u00e1rio. Para orienta\u00e7\u00e3o personalizada, consulte um nutricionista ou profissional de sa\u00fade.',
      ],
      faq: [
        { q: 'O que \u00e9 TDEE e por que \u00e9 importante?', a: 'TDEE significa Gasto Energ\u00e9tico Di\u00e1rio Total. \u00c9 o n\u00famero total de calorias que seu corpo queima por dia, incluindo metabolismo basal, atividade f\u00edsica e efeito t\u00e9rmico dos alimentos. Conhecer seu TDEE ajuda a definir metas cal\u00f3ricas precisas para perda de peso, manuten\u00e7\u00e3o ou ganho muscular.' },
        { q: 'Qual \u00e9 a diferen\u00e7a entre TDEE e TMB?', a: 'A TMB (Taxa Metab\u00f3lica Basal) \u00e9 o n\u00famero de calorias que o corpo queima em repouso completo para manter fun\u00e7\u00f5es vitais. O TDEE inclui a TMB mais todas as calorias queimadas por atividade f\u00edsica, exerc\u00edcio e digest\u00e3o. O TDEE \u00e9 sempre maior que a TMB.' },
        { q: 'Qual equa\u00e7\u00e3o esta calculadora usa?', a: 'Esta calculadora usa a equa\u00e7\u00e3o de Mifflin-St Jeor. Para homens: TMB = (10 x peso em kg) + (6,25 x altura em cm) - (5 x idade) + 5. Para mulheres: TMB = (10 x peso em kg) + (6,25 x altura em cm) - (5 x idade) - 161.' },
        { q: 'Como escolho o n\u00edvel de atividade correto?', a: 'Escolha Sedent\u00e1rio se tem trabalho de escrit\u00f3rio sem exerc\u00edcio. Leve para 1-3 dias de exerc\u00edcio por semana. Moderado para 3-5 dias. Ativo para 6-7 dias de exerc\u00edcio intenso. Muito Ativo para atletas que treinam intensamente duas vezes ao dia.' },
        { q: 'Quantas calorias devo comer para perder peso?', a: 'Para perda de peso segura, mire um d\u00e9ficit de 500 calorias abaixo do seu TDEE, resultando em aproximadamente 0,5 kg de perda de gordura por semana. Evite ficar abaixo de 1.200 calorias di\u00e1rias para mulheres ou 1.500 para homens sem supervis\u00e3o m\u00e9dica.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="tdee-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Unit toggle */}
          <div className="flex gap-2">
            <button onClick={() => { setUnit('metric'); setWeight(''); setHeight(''); setErrors({}); }} className={`flex-1 py-2 rounded-lg font-medium text-sm ${unit === 'metric' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{labels.metric[lang]}</button>
            <button onClick={() => { setUnit('imperial'); setWeight(''); setHeight(''); setErrors({}); }} className={`flex-1 py-2 rounded-lg font-medium text-sm ${unit === 'imperial' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{labels.imperial[lang]}</button>
          </div>

          {/* Gender toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.gender[lang]}</label>
            <div className="flex gap-2">
              <button onClick={() => setGender('male')} className={`flex-1 py-2 rounded-lg font-medium text-sm ${gender === 'male' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{labels.male[lang]}</button>
              <button onClick={() => setGender('female')} className={`flex-1 py-2 rounded-lg font-medium text-sm ${gender === 'female' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{labels.female[lang]}</button>
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{unit === 'metric' ? labels.weight[lang] : labels.weightLbs[lang]}</label>
            <input type="number" value={weight} onChange={(e) => { setWeight(e.target.value); validate(); }} onBlur={() => { validate(); handleCalculation(); }} placeholder={unit === 'metric' ? '70' : '154'} className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 ${errors.weight ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{unit === 'metric' ? labels.height[lang] : labels.heightIn[lang]}</label>
            <input type="number" value={height} onChange={(e) => { setHeight(e.target.value); validate(); }} onBlur={() => { validate(); handleCalculation(); }} placeholder={unit === 'metric' ? '175' : '69'} className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 ${errors.height ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.age[lang]}</label>
            <input type="number" value={age} onChange={(e) => { setAge(e.target.value); validate(); }} onBlur={() => { validate(); handleCalculation(); }} placeholder="30" className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 ${errors.age ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.activityLevel[lang]}</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value as typeof activity)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="sedentary">{labels.sedentary[lang]}</option>
              <option value="light">{labels.light[lang]}</option>
              <option value="moderate">{labels.moderate[lang]}</option>
              <option value="active">{labels.active[lang]}</option>
              <option value="very-active">{labels.veryActive[lang]}</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button onClick={handleReset} className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {labels.reset[lang]}
            </button>
          </div>

          {/* Results */}
          {isValid && tdee > 0 && (
            <>
              {/* BMR */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{labels.bmrResult[lang]}</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{Math.round(bmr)}</div>
                <div className="text-sm text-gray-500">{labels.calsPerDay[lang]}</div>
              </div>

              {/* TDEE */}
              <div className="p-5 rounded-xl bg-green-50 border border-green-200 text-center">
                <div className="text-xs font-medium text-green-600 uppercase tracking-wide">{labels.tdeeResult[lang]}</div>
                <div className="text-4xl font-bold text-gray-900 mt-1">{Math.round(tdee)}</div>
                <div className="text-sm text-green-600">{labels.calsPerDay[lang]}</div>
              </div>

              {/* Goal Breakdown */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">{labels.goals[lang]}</h3>
                {goalCalories.map((goal, i) => (
                  <div key={i} className={`flex justify-between items-center px-4 py-3 rounded-lg ${goal.bg}`}>
                    <span className={`text-sm font-medium ${goal.color}`}>{goal.label}</span>
                    <span className="text-lg font-bold text-gray-900">{goal.cal} <span className="text-xs font-normal text-gray-500">kcal</span></span>
                  </div>
                ))}
              </div>

              {/* Activity multiplier visualization */}
              <div className="relative pt-2">
                <div className="flex rounded-full h-3 overflow-hidden">
                  <div className="bg-blue-200 w-[20%]"></div>
                  <div className="bg-blue-300 w-[20%]"></div>
                  <div className="bg-blue-400 w-[20%]"></div>
                  <div className="bg-blue-500 w-[20%]"></div>
                  <div className="bg-blue-600 flex-1"></div>
                </div>
                <div className="absolute top-0 transition-all duration-500" style={{ left: `${({ sedentary: 10, light: 30, moderate: 50, active: 70, 'very-active': 90 } as Record<string, number>)[activity]}%` }}>
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-gray-800 -translate-x-1/2"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1.2x</span>
                  <span>1.375x</span>
                  <span>1.55x</span>
                  <span>1.725x</span>
                  <span>1.9x</span>
                </div>
              </div>

              <button onClick={copyResults} className="w-full py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                {copied ? (
                  <><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{labels.copied[lang]}</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>{labels.copy[lang]}</>
                )}
              </button>
            </>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{labels.history[lang]}</h3>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="px-3 py-2 rounded-lg bg-gray-50 flex justify-between items-center text-sm">
                  <span className="text-gray-600">{h.gender} | {h.age}y | {h.weight}{h.unit === 'metric' ? 'kg' : 'lbs'} / {h.height}{h.unit === 'metric' ? 'cm' : 'in'}</span>
                  <span className="font-medium text-gray-900">TDEE: {h.tdee} kcal</span>
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
