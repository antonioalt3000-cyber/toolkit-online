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
  goal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  unit: string;
};

export default function MacroCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['macro-calculator'][lang];

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activity, setActivity] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very-active'>('moderate');
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');
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
    gender: { en: 'Gender', it: 'Sesso', es: 'G\u00e9nero', fr: 'Sexe', de: 'Geschlecht', pt: 'Sexo' },
    activityLevel: { en: 'Activity Level', it: 'Livello di Attivit\u00e0', es: 'Nivel de Actividad', fr: "Niveau d'Activit\u00e9", de: 'Aktivit\u00e4tslevel', pt: 'N\u00edvel de Atividade' },
    sedentary: { en: 'Sedentary (office job)', it: 'Sedentario (lavoro d\'ufficio)', es: 'Sedentario (trabajo de oficina)', fr: 'S\u00e9dentaire (travail de bureau)', de: 'Sitzend (B\u00fcrojob)', pt: 'Sedent\u00e1rio (trabalho de escrit\u00f3rio)' },
    light: { en: 'Light (1-3 days/week)', it: 'Leggero (1-3 giorni/sett.)', es: 'Ligero (1-3 d\u00edas/sem.)', fr: 'L\u00e9ger (1-3 jours/sem.)', de: 'Leicht (1-3 Tage/Woche)', pt: 'Leve (1-3 dias/sem.)' },
    moderate: { en: 'Moderate (3-5 days/week)', it: 'Moderato (3-5 giorni/sett.)', es: 'Moderado (3-5 d\u00edas/sem.)', fr: 'Mod\u00e9r\u00e9 (3-5 jours/sem.)', de: 'Moderat (3-5 Tage/Woche)', pt: 'Moderado (3-5 dias/sem.)' },
    active: { en: 'Active (6-7 days/week)', it: 'Attivo (6-7 giorni/sett.)', es: 'Activo (6-7 d\u00edas/sem.)', fr: 'Actif (6-7 jours/sem.)', de: 'Aktiv (6-7 Tage/Woche)', pt: 'Ativo (6-7 dias/sem.)' },
    veryActive: { en: 'Very Active (2x/day)', it: 'Molto Attivo (2x/giorno)', es: 'Muy Activo (2x/d\u00eda)', fr: 'Tr\u00e8s Actif (2x/jour)', de: 'Sehr Aktiv (2x/Tag)', pt: 'Muito Ativo (2x/dia)' },
    goalLabel: { en: 'Goal', it: 'Obiettivo', es: 'Objetivo', fr: 'Objectif', de: 'Ziel', pt: 'Objetivo' },
    lose: { en: 'Lose Weight', it: 'Perdere Peso', es: 'Perder Peso', fr: 'Perdre du Poids', de: 'Abnehmen', pt: 'Perder Peso' },
    maintain: { en: 'Maintain Weight', it: 'Mantenere il Peso', es: 'Mantener Peso', fr: 'Maintenir le Poids', de: 'Gewicht Halten', pt: 'Manter Peso' },
    gain: { en: 'Gain Muscle', it: 'Aumentare Massa', es: 'Ganar M\u00fasculo', fr: 'Prendre du Muscle', de: 'Muskelaufbau', pt: 'Ganhar M\u00fasculo' },
    dailyCalories: { en: 'Daily Calories', it: 'Calorie Giornaliere', es: 'Calor\u00edas Diarias', fr: 'Calories Journali\u00e8res', de: 'T\u00e4gliche Kalorien', pt: 'Calorias Di\u00e1rias' },
    macroBreakdown: { en: 'Macronutrient Breakdown', it: 'Ripartizione Macronutrienti', es: 'Desglose de Macronutrientes', fr: 'R\u00e9partition des Macronutriments', de: 'Makron\u00e4hrstoff-Aufteilung', pt: 'Distribui\u00e7\u00e3o de Macronutrientes' },
    protein: { en: 'Protein', it: 'Proteine', es: 'Prote\u00ednas', fr: 'Prot\u00e9ines', de: 'Protein', pt: 'Prote\u00ednas' },
    carbs: { en: 'Carbohydrates', it: 'Carboidrati', es: 'Carbohidratos', fr: 'Glucides', de: 'Kohlenhydrate', pt: 'Carboidratos' },
    fat: { en: 'Fat', it: 'Grassi', es: 'Grasas', fr: 'Lipides', de: 'Fett', pt: 'Gorduras' },
    grams: { en: 'grams', it: 'grammi', es: 'gramos', fr: 'grammes', de: 'Gramm', pt: 'gramas' },
    calsPerDay: { en: 'calories/day', it: 'calorie/giorno', es: 'calor\u00edas/d\u00eda', fr: 'calories/jour', de: 'Kalorien/Tag', pt: 'calorias/dia' },
    perGram: { en: 'per gram', it: 'per grammo', es: 'por gramo', fr: 'par gramme', de: 'pro Gramm', pt: 'por grama' },
    reset: { en: 'Reset', it: 'Resetta', es: 'Restablecer', fr: 'R\u00e9initialiser', de: 'Zur\u00fccksetzen', pt: 'Redefinir' },
    copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier R\u00e9sultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copi\u00e9!', de: 'Kopiert!', pt: 'Copiado!' },
    history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'C\u00e1lculos Recientes', fr: 'Calculs R\u00e9cents', de: 'Letzte Berechnungen', pt: 'C\u00e1lculos Recentes' },
    invalidWeight: { en: 'Enter a valid weight', it: 'Inserisci un peso valido', es: 'Ingresa un peso v\u00e1lido', fr: 'Entrez un poids valide', de: 'G\u00fcltiges Gewicht eingeben', pt: 'Insira um peso v\u00e1lido' },
    invalidHeight: { en: 'Enter a valid height', it: 'Inserisci un\'altezza valida', es: 'Ingresa una altura v\u00e1lida', fr: 'Entrez une taille valide', de: 'G\u00fcltige Gr\u00f6\u00dfe eingeben', pt: 'Insira uma altura v\u00e1lida' },
    invalidAge: { en: 'Enter a valid age (15-100)', it: 'Inserisci un\'et\u00e0 valida (15-100)', es: 'Ingresa una edad v\u00e1lida (15-100)', fr: 'Entrez un \u00e2ge valide (15-100)', de: 'G\u00fcltiges Alter eingeben (15-100)', pt: 'Insira uma idade v\u00e1lida (15-100)' },
    mealPlan: { en: 'Daily Meal Targets', it: 'Obiettivi Pasto Giornalieri', es: 'Metas de Comida Diarias', fr: 'Objectifs Repas Quotidiens', de: 'T\u00e4gliche Mahlzeitenziele', pt: 'Metas Di\u00e1rias de Refei\u00e7\u00e3o' },
    perMeal: { en: 'per meal (3 meals)', it: 'per pasto (3 pasti)', es: 'por comida (3 comidas)', fr: 'par repas (3 repas)', de: 'pro Mahlzeit (3 Mahlzeiten)', pt: 'por refei\u00e7\u00e3o (3 refei\u00e7\u00f5es)' },
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

  // Mifflin-St Jeor Equation for BMR
  const bmr = gender === 'male'
    ? (10 * wKg) + (6.25 * hCm) - (5 * ageVal) + 5
    : (10 * wKg) + (6.25 * hCm) - (5 * ageVal) - 161;

  const tdee = bmr * activityMultipliers[activity];

  // Adjust calories based on goal
  const goalCalories = goal === 'lose' ? tdee - 500 : goal === 'gain' ? tdee + 500 : tdee;
  const totalCals = Math.round(goalCalories);

  // Macro ratios based on goal
  const macroRatios = {
    lose: { protein: 0.40, carbs: 0.30, fat: 0.30 },
    maintain: { protein: 0.30, carbs: 0.40, fat: 0.30 },
    gain: { protein: 0.30, carbs: 0.45, fat: 0.25 },
  };

  const ratios = macroRatios[goal];
  const proteinCals = totalCals * ratios.protein;
  const carbsCals = totalCals * ratios.carbs;
  const fatCals = totalCals * ratios.fat;

  // Convert to grams (protein=4cal/g, carbs=4cal/g, fat=9cal/g)
  const proteinG = Math.round(proteinCals / 4);
  const carbsG = Math.round(carbsCals / 4);
  const fatG = Math.round(fatCals / 9);

  const isValid = wKg > 0 && hCm > 0 && ageVal >= 15 && ageVal <= 100 && !errors.weight && !errors.height && !errors.age;

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
    if (isValid && totalCals > 0) {
      const goalLabels: Record<string, string> = {
        lose: labels.lose[lang],
        maintain: labels.maintain[lang],
        gain: labels.gain[lang],
      };
      const entry: HistoryEntry = {
        weight: parseFloat(weight),
        height: parseFloat(height),
        age: ageVal,
        gender: labels[gender][lang],
        goal: goalLabels[goal],
        calories: totalCals,
        protein: proteinG,
        carbs: carbsG,
        fat: fatG,
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
    setGoal('maintain');
    setErrors({});
  };

  const copyResults = () => {
    const lines = [
      `${labels.dailyCalories[lang]}: ${totalCals} kcal`,
      '',
      `${labels.protein[lang]}: ${proteinG}g (${Math.round(ratios.protein * 100)}%)`,
      `${labels.carbs[lang]}: ${carbsG}g (${Math.round(ratios.carbs * 100)}%)`,
      `${labels.fat[lang]}: ${fatG}g (${Math.round(ratios.fat * 100)}%)`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const macros = [
    { name: labels.protein[lang], grams: proteinG, pct: Math.round(ratios.protein * 100), color: 'bg-red-500', lightBg: 'bg-red-50', textColor: 'text-red-600', calsPerG: 4 },
    { name: labels.carbs[lang], grams: carbsG, pct: Math.round(ratios.carbs * 100), color: 'bg-yellow-500', lightBg: 'bg-yellow-50', textColor: 'text-yellow-600', calsPerG: 4 },
    { name: labels.fat[lang], grams: fatG, pct: Math.round(ratios.fat * 100), color: 'bg-blue-500', lightBg: 'bg-blue-50', textColor: 'text-blue-600', calsPerG: 9 },
  ];

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Macro Calculator – Calculate Your Daily Macronutrient Needs Online',
      paragraphs: [
        'Macronutrients, commonly known as macros, are the three essential nutrients your body needs in large quantities: protein, carbohydrates, and fat. Each plays a unique and critical role in your health, performance, and body composition. Protein builds and repairs muscle tissue, carbohydrates provide energy for daily activities and exercise, and fat supports hormone production, brain function, and nutrient absorption. Balancing these macros correctly is the key to achieving your fitness and health goals.',
        'Our free macro calculator first estimates your Total Daily Energy Expenditure (TDEE) using the Mifflin-St Jeor equation, the gold standard formula recommended by nutrition professionals. It factors in your weight, height, age, gender, and physical activity level to determine how many calories you burn each day. Then, based on your chosen goal, it adjusts your calorie intake: a 500-calorie deficit for weight loss, maintenance calories for weight stability, or a 500-calorie surplus for muscle gain.',
        'Once your target calories are set, the calculator distributes them across the three macronutrients using evidence-based ratios optimized for each goal. For weight loss, a higher protein ratio (40%) helps preserve lean muscle mass during a caloric deficit, while moderate carbs (30%) and fat (30%) ensure sustained energy and hormonal health. For muscle gain, carbohydrates are elevated (45%) to fuel intense training, with adequate protein (30%) for muscle synthesis and reduced fat (25%) to minimize unwanted fat gain.',
        'Remember that these macro targets are personalized starting points, not rigid rules. Individual needs vary based on training intensity, food preferences, metabolic health, and body composition. Track your macros for 2-3 weeks using a food diary or app, monitor your progress, and adjust your ratios by small increments as needed. For specific dietary needs, medical conditions, or competition preparation, consulting a registered dietitian or sports nutritionist is highly recommended to fine-tune your nutrition plan.',
      ],
      faq: [
        { q: 'What are macronutrients and why do they matter?', a: 'Macronutrients are the three nutrients your body needs in large amounts: protein (4 cal/g), carbohydrates (4 cal/g), and fat (9 cal/g). They provide all of your dietary calories and each serves essential functions. Getting the right balance of macros helps optimize body composition, energy levels, athletic performance, and overall health.' },
        { q: 'How does this calculator determine my macro split?', a: 'The calculator first estimates your TDEE (Total Daily Energy Expenditure) using the Mifflin-St Jeor equation, then adjusts calories based on your goal. For weight loss it uses a 40/30/30 protein/carbs/fat split, for maintenance 30/40/30, and for muscle gain 30/45/25. These ratios are based on sports nutrition research and guidelines.' },
        { q: 'How much protein do I really need?', a: 'For most active adults, 1.6-2.2 grams of protein per kilogram of body weight per day is recommended for optimal muscle building and recovery. During weight loss, higher protein intake (up to 2.4 g/kg) helps preserve lean mass. Our calculator sets protein based on a percentage of total calories, which typically falls within these evidence-based ranges.' },
        { q: 'Should I track macros or just calories?', a: 'Tracking macros is more precise than tracking calories alone. Two diets with the same calories but different macro ratios can produce very different results. A high-protein diet preserves more muscle during weight loss, while adequate carbs fuel performance. If tracking all three feels overwhelming, start by focusing on protein and total calories first.' },
        { q: 'Can I adjust the macro ratios for keto or other diets?', a: 'This calculator provides balanced macro ratios suitable for most people. For specialized diets like keto (very low carb, high fat), you would need different ratios such as 25% protein, 5% carbs, and 70% fat. Use our calculated calorie target as your baseline and adjust the macro percentages to match your specific dietary approach.' },
      ],
    },
    it: {
      title: 'Calcolatore Macro Gratuito \u2013 Calcola i Tuoi Fabbisogni di Macronutrienti Giornalieri Online',
      paragraphs: [
        'I macronutrienti, comunemente noti come macro, sono i tre nutrienti essenziali di cui il corpo ha bisogno in grandi quantit\u00e0: proteine, carboidrati e grassi. Ognuno svolge un ruolo unico e fondamentale per la salute, le prestazioni e la composizione corporea. Le proteine costruiscono e riparano il tessuto muscolare, i carboidrati forniscono energia per le attivit\u00e0 quotidiane e l\'esercizio, e i grassi supportano la produzione ormonale, la funzione cerebrale e l\'assorbimento dei nutrienti.',
        'Il nostro calcolatore macro gratuito stima prima il Dispendio Energetico Giornaliero Totale (TDEE) usando l\'equazione di Mifflin-St Jeor, la formula gold standard raccomandata dai professionisti della nutrizione. Tiene conto di peso, altezza, et\u00e0, sesso e livello di attivit\u00e0 fisica per determinare quante calorie bruci ogni giorno. In base all\'obiettivo scelto, regola l\'apporto calorico: deficit di 500 calorie per dimagrire, mantenimento o surplus di 500 calorie per la massa muscolare.',
        'Una volta stabilite le calorie target, il calcolatore le distribuisce tra i tre macronutrienti usando rapporti basati sulle evidenze scientifiche. Per la perdita di peso, un rapporto proteico pi\u00f9 alto (40%) aiuta a preservare la massa muscolare magra durante il deficit calorico, mentre carboidrati (30%) e grassi (30%) moderati assicurano energia sostenuta e salute ormonale. Per l\'aumento muscolare, i carboidrati sono elevati (45%) per alimentare l\'allenamento intenso.',
        'Ricorda che questi obiettivi macro sono punti di partenza personalizzati, non regole rigide. Le esigenze individuali variano in base a intensit\u00e0 dell\'allenamento, preferenze alimentari, salute metabolica e composizione corporea. Monitora i tuoi macro per 2-3 settimane, controlla i progressi e regola i rapporti con piccoli incrementi. Per esigenze specifiche, consulta un dietista o nutrizionista sportivo.',
      ],
      faq: [
        { q: 'Cosa sono i macronutrienti e perch\u00e9 sono importanti?', a: 'I macronutrienti sono i tre nutrienti di cui il corpo ha bisogno in grandi quantit\u00e0: proteine (4 cal/g), carboidrati (4 cal/g) e grassi (9 cal/g). Forniscono tutte le calorie alimentari e ognuno ha funzioni essenziali. Il giusto equilibrio ottimizza composizione corporea, energia, prestazioni atletiche e salute generale.' },
        { q: 'Come determina il calcolatore la mia ripartizione macro?', a: 'Il calcolatore stima prima il TDEE usando l\'equazione di Mifflin-St Jeor, poi regola le calorie in base all\'obiettivo. Per la perdita di peso usa un rapporto 40/30/30 proteine/carboidrati/grassi, per il mantenimento 30/40/30 e per l\'aumento muscolare 30/45/25. Questi rapporti sono basati sulla ricerca in nutrizione sportiva.' },
        { q: 'Quante proteine mi servono davvero?', a: 'Per la maggior parte degli adulti attivi, si raccomandano 1,6-2,2 grammi di proteine per kg di peso corporeo al giorno. Durante la perdita di peso, un apporto proteico pi\u00f9 alto (fino a 2,4 g/kg) aiuta a preservare la massa magra. Il nostro calcolatore imposta le proteine come percentuale delle calorie totali, rientrando tipicamente in questi range.' },
        { q: 'Devo monitorare i macro o solo le calorie?', a: 'Monitorare i macro \u00e8 pi\u00f9 preciso che contare solo le calorie. Due diete con le stesse calorie ma rapporti macro diversi possono produrre risultati molto diversi. Se monitorare tutti e tre sembra troppo, inizia concentrandoti su proteine e calorie totali.' },
        { q: 'Posso adattare i rapporti macro per la dieta keto?', a: 'Questo calcolatore fornisce rapporti macro bilanciati adatti alla maggior parte delle persone. Per diete specializzate come la keto, servirebbero rapporti diversi come 25% proteine, 5% carboidrati e 70% grassi. Usa le calorie calcolate come base e adatta le percentuali macro.' },
      ],
    },
    es: {
      title: 'Calculadora de Macros Gratis \u2013 Calcula Tus Necesidades Diarias de Macronutrientes Online',
      paragraphs: [
        'Los macronutrientes, com\u00fanmente conocidos como macros, son los tres nutrientes esenciales que tu cuerpo necesita en grandes cantidades: prote\u00ednas, carbohidratos y grasas. Cada uno juega un papel \u00fanico y cr\u00edtico en tu salud, rendimiento y composici\u00f3n corporal. Las prote\u00ednas construyen y reparan el tejido muscular, los carbohidratos proporcionan energ\u00eda para las actividades diarias y el ejercicio, y las grasas apoyan la producci\u00f3n hormonal, la funci\u00f3n cerebral y la absorci\u00f3n de nutrientes.',
        'Nuestra calculadora de macros gratuita estima primero tu Gasto Energ\u00e9tico Diario Total (TDEE) usando la ecuaci\u00f3n de Mifflin-St Jeor, la f\u00f3rmula est\u00e1ndar recomendada por profesionales de la nutrici\u00f3n. Tiene en cuenta tu peso, altura, edad, sexo y nivel de actividad f\u00edsica. Luego, seg\u00fan tu objetivo, ajusta tu ingesta cal\u00f3rica: d\u00e9ficit de 500 calor\u00edas para perder peso, mantenimiento, o super\u00e1vit de 500 calor\u00edas para ganar m\u00fasculo.',
        'Una vez establecidas las calor\u00edas objetivo, la calculadora las distribuye entre los tres macronutrientes usando proporciones basadas en evidencia. Para perder peso, una proporci\u00f3n m\u00e1s alta de prote\u00ednas (40%) ayuda a preservar la masa muscular magra, mientras que carbohidratos (30%) y grasas (30%) moderados aseguran energ\u00eda sostenida. Para ganar m\u00fasculo, los carbohidratos se elevan (45%) para alimentar el entrenamiento intenso.',
        'Recuerda que estos objetivos de macros son puntos de partida personalizados, no reglas r\u00edgidas. Las necesidades individuales var\u00edan seg\u00fan la intensidad del entrenamiento, preferencias alimentarias y composici\u00f3n corporal. Monitorea tus macros durante 2-3 semanas, controla tu progreso y ajusta las proporciones con peque\u00f1os incrementos. Para necesidades espec\u00edficas, consulta a un dietista o nutricionista deportivo.',
      ],
      faq: [
        { q: '\u00bfQu\u00e9 son los macronutrientes y por qu\u00e9 importan?', a: 'Los macronutrientes son los tres nutrientes que tu cuerpo necesita en grandes cantidades: prote\u00ednas (4 cal/g), carbohidratos (4 cal/g) y grasas (9 cal/g). Proporcionan todas tus calor\u00edas alimentarias y cada uno cumple funciones esenciales. El equilibrio correcto optimiza la composici\u00f3n corporal, energ\u00eda y rendimiento.' },
        { q: '\u00bfC\u00f3mo determina la calculadora mi distribuci\u00f3n de macros?', a: 'La calculadora estima primero tu TDEE usando la ecuaci\u00f3n de Mifflin-St Jeor, luego ajusta las calor\u00edas seg\u00fan tu objetivo. Para perder peso usa 40/30/30 prote\u00ednas/carbohidratos/grasas, para mantenimiento 30/40/30, y para ganar m\u00fasculo 30/45/25.' },
        { q: '\u00bfCu\u00e1nta prote\u00edna necesito realmente?', a: 'Para adultos activos, se recomiendan 1,6-2,2 gramos de prote\u00edna por kg de peso corporal al d\u00eda. Durante la p\u00e9rdida de peso, una ingesta m\u00e1s alta (hasta 2,4 g/kg) ayuda a preservar la masa magra. Nuestra calculadora establece las prote\u00ednas como porcentaje de las calor\u00edas totales.' },
        { q: '\u00bfDebo contar macros o solo calor\u00edas?', a: 'Contar macros es m\u00e1s preciso que solo contar calor\u00edas. Dos dietas con las mismas calor\u00edas pero diferentes proporciones de macros pueden producir resultados muy diferentes. Si contar los tres parece abrumador, comienza enfoc\u00e1ndote en prote\u00ednas y calor\u00edas totales.' },
        { q: '\u00bfPuedo ajustar las proporciones para la dieta keto?', a: 'Esta calculadora proporciona proporciones de macros balanceadas. Para dietas especializadas como keto, necesitar\u00edas proporciones diferentes como 25% prote\u00ednas, 5% carbohidratos y 70% grasas. Usa las calor\u00edas calculadas como base y ajusta los porcentajes.' },
      ],
    },
    fr: {
      title: 'Calculateur de Macros Gratuit \u2013 Calculez Vos Besoins Quotidiens en Macronutriments en Ligne',
      paragraphs: [
        'Les macronutriments, commun\u00e9ment appel\u00e9s macros, sont les trois nutriments essentiels dont votre corps a besoin en grandes quantit\u00e9s : prot\u00e9ines, glucides et lipides. Chacun joue un r\u00f4le unique et essentiel dans votre sant\u00e9, vos performances et votre composition corporelle. Les prot\u00e9ines construisent et r\u00e9parent le tissu musculaire, les glucides fournissent l\'\u00e9nergie pour les activit\u00e9s quotidiennes et l\'exercice, et les lipides soutiennent la production hormonale et la fonction c\u00e9r\u00e9brale.',
        'Notre calculateur de macros gratuit estime d\'abord votre D\u00e9pense \u00c9nerg\u00e9tique Journali\u00e8re Totale (TDEE) en utilisant l\'\u00e9quation de Mifflin-St Jeor, la formule de r\u00e9f\u00e9rence recommand\u00e9e par les professionnels de la nutrition. Il prend en compte votre poids, taille, \u00e2ge, sexe et niveau d\'activit\u00e9 physique. Ensuite, selon votre objectif, il ajuste votre apport calorique : d\u00e9ficit de 500 calories pour la perte de poids, maintien, ou surplus de 500 calories pour la prise de muscle.',
        'Une fois les calories cibles d\u00e9finies, le calculateur les r\u00e9partit entre les trois macronutriments en utilisant des ratios fond\u00e9s sur des preuves scientifiques. Pour la perte de poids, un ratio prot\u00e9ique plus \u00e9lev\u00e9 (40%) aide \u00e0 pr\u00e9server la masse musculaire maigre, tandis que des glucides (30%) et lipides (30%) mod\u00e9r\u00e9s assurent une \u00e9nergie soutenue. Pour la prise de muscle, les glucides sont \u00e9lev\u00e9s (45%) pour alimenter l\'entra\u00eenement intense.',
        'N\'oubliez pas que ces objectifs de macros sont des points de d\u00e9part personnalis\u00e9s, pas des r\u00e8gles rigides. Les besoins individuels varient selon l\'intensit\u00e9 de l\'entra\u00eenement, les pr\u00e9f\u00e9rences alimentaires et la composition corporelle. Suivez vos macros pendant 2-3 semaines, surveillez vos progr\u00e8s et ajustez les ratios par petits incr\u00e9ments. Pour des besoins sp\u00e9cifiques, consultez un di\u00e9t\u00e9ticien ou nutritionniste sportif.',
      ],
      faq: [
        { q: 'Que sont les macronutriments et pourquoi sont-ils importants ?', a: 'Les macronutriments sont les trois nutriments dont le corps a besoin en grandes quantit\u00e9s : prot\u00e9ines (4 cal/g), glucides (4 cal/g) et lipides (9 cal/g). Ils fournissent toutes vos calories alimentaires et chacun remplit des fonctions essentielles. Le bon \u00e9quilibre optimise la composition corporelle, l\'\u00e9nergie et les performances.' },
        { q: 'Comment le calculateur d\u00e9termine-t-il ma r\u00e9partition de macros ?', a: 'Le calculateur estime d\'abord votre TDEE avec l\'\u00e9quation de Mifflin-St Jeor, puis ajuste les calories selon votre objectif. Pour la perte de poids : 40/30/30 prot\u00e9ines/glucides/lipides, pour le maintien 30/40/30, et pour la prise de muscle 30/45/25.' },
        { q: 'De combien de prot\u00e9ines ai-je vraiment besoin ?', a: 'Pour la plupart des adultes actifs, 1,6-2,2 grammes de prot\u00e9ines par kg de poids corporel par jour sont recommand\u00e9s. Pendant la perte de poids, un apport plus \u00e9lev\u00e9 (jusqu\'\u00e0 2,4 g/kg) aide \u00e0 pr\u00e9server la masse maigre. Notre calculateur d\u00e9finit les prot\u00e9ines comme pourcentage des calories totales.' },
        { q: 'Dois-je compter les macros ou seulement les calories ?', a: 'Compter les macros est plus pr\u00e9cis que compter uniquement les calories. Deux r\u00e9gimes avec les m\u00eames calories mais des ratios de macros diff\u00e9rents peuvent produire des r\u00e9sultats tr\u00e8s diff\u00e9rents. Si c\'est trop complexe, commencez par les prot\u00e9ines et les calories totales.' },
        { q: 'Puis-je adapter les ratios pour un r\u00e9gime c\u00e9to ?', a: 'Ce calculateur fournit des ratios \u00e9quilibr\u00e9s. Pour des r\u00e9gimes sp\u00e9cialis\u00e9s comme le c\u00e9to, il faudrait des ratios diff\u00e9rents comme 25% prot\u00e9ines, 5% glucides et 70% lipides. Utilisez les calories calcul\u00e9es comme base et ajustez les pourcentages.' },
      ],
    },
    de: {
      title: 'Kostenloser Makro-Rechner \u2013 Berechnen Sie Ihren T\u00e4glichen Makron\u00e4hrstoffbedarf Online',
      paragraphs: [
        'Makron\u00e4hrstoffe, allgemein als Makros bekannt, sind die drei essentiellen N\u00e4hrstoffe, die Ihr K\u00f6rper in gro\u00dfen Mengen ben\u00f6tigt: Protein, Kohlenhydrate und Fett. Jeder spielt eine einzigartige und entscheidende Rolle f\u00fcr Ihre Gesundheit, Leistung und K\u00f6rperzusammensetzung. Protein baut Muskelgewebe auf und repariert es, Kohlenhydrate liefern Energie f\u00fcr t\u00e4gliche Aktivit\u00e4ten und Training, und Fett unterst\u00fctzt die Hormonproduktion und Gehirnfunktion.',
        'Unser kostenloser Makro-Rechner sch\u00e4tzt zun\u00e4chst Ihren Gesamtenergieumsatz (TDEE) mit der Mifflin-St Jeor-Gleichung, der Goldstandard-Formel, die von Ern\u00e4hrungsexperten empfohlen wird. Er ber\u00fccksichtigt Gewicht, Gr\u00f6\u00dfe, Alter, Geschlecht und Aktivit\u00e4tsniveau. Je nach Ziel passt er dann die Kalorienzufuhr an: 500-Kalorien-Defizit zum Abnehmen, Erhaltung oder 500-Kalorien-\u00dcberschuss f\u00fcr Muskelaufbau.',
        'Sobald die Zielkalorien festgelegt sind, verteilt der Rechner sie auf die drei Makron\u00e4hrstoffe mit evidenzbasierten Verh\u00e4ltnissen. Zum Abnehmen hilft ein h\u00f6herer Proteinanteil (40%) die Muskelmasse zu erhalten, w\u00e4hrend moderate Kohlenhydrate (30%) und Fett (30%) nachhaltige Energie sichern. F\u00fcr Muskelaufbau werden Kohlenhydrate (45%) erh\u00f6ht, um intensives Training zu unterst\u00fctzen.',
        'Bedenken Sie, dass diese Makro-Ziele personalisierte Ausgangspunkte sind, keine starren Regeln. Individuelle Bed\u00fcrfnisse variieren nach Trainingsintensit\u00e4t, Ern\u00e4hrungsvorlieben und K\u00f6rperzusammensetzung. Verfolgen Sie Ihre Makros 2-3 Wochen lang, kontrollieren Sie Ihren Fortschritt und passen Sie die Verh\u00e4ltnisse in kleinen Schritten an. F\u00fcr spezielle Bed\u00fcrfnisse konsultieren Sie einen Ern\u00e4hrungsberater.',
      ],
      faq: [
        { q: 'Was sind Makron\u00e4hrstoffe und warum sind sie wichtig?', a: 'Makron\u00e4hrstoffe sind die drei N\u00e4hrstoffe, die der K\u00f6rper in gro\u00dfen Mengen braucht: Protein (4 kcal/g), Kohlenhydrate (4 kcal/g) und Fett (9 kcal/g). Sie liefern alle Nahrungskalorien und erf\u00fcllen jeweils essentielle Funktionen. Die richtige Balance optimiert K\u00f6rperzusammensetzung, Energie und Leistung.' },
        { q: 'Wie bestimmt der Rechner meine Makro-Aufteilung?', a: 'Der Rechner sch\u00e4tzt zun\u00e4chst den TDEE mit der Mifflin-St Jeor-Gleichung und passt die Kalorien an das Ziel an. Zum Abnehmen: 40/30/30 Protein/Kohlenhydrate/Fett, zur Erhaltung 30/40/30 und zum Muskelaufbau 30/45/25.' },
        { q: 'Wie viel Protein brauche ich wirklich?', a: 'F\u00fcr aktive Erwachsene werden 1,6-2,2 Gramm Protein pro kg K\u00f6rpergewicht pro Tag empfohlen. Beim Abnehmen hilft eine h\u00f6here Zufuhr (bis 2,4 g/kg) die Muskelmasse zu erhalten. Unser Rechner legt Protein als Prozentsatz der Gesamtkalorien fest.' },
        { q: 'Soll ich Makros oder nur Kalorien z\u00e4hlen?', a: 'Makros zu z\u00e4hlen ist pr\u00e4ziser als nur Kalorien. Zwei Di\u00e4ten mit gleichen Kalorien aber verschiedenen Makro-Verh\u00e4ltnissen k\u00f6nnen sehr unterschiedliche Ergebnisse liefern. Wenn alles drei zu viel ist, beginnen Sie mit Protein und Gesamtkalorien.' },
        { q: 'Kann ich die Makro-Verh\u00e4ltnisse f\u00fcr Keto anpassen?', a: 'Dieser Rechner bietet ausgewogene Makro-Verh\u00e4ltnisse. F\u00fcr spezialisierte Di\u00e4ten wie Keto br\u00e4uchten Sie andere Verh\u00e4ltnisse wie 25% Protein, 5% Kohlenhydrate und 70% Fett. Verwenden Sie die berechneten Kalorien als Basis und passen Sie die Prozente an.' },
      ],
    },
    pt: {
      title: 'Calculadora de Macros Gr\u00e1tis \u2013 Calcule Suas Necessidades Di\u00e1rias de Macronutrientes Online',
      paragraphs: [
        'Macronutrientes, comumente conhecidos como macros, s\u00e3o os tr\u00eas nutrientes essenciais que seu corpo precisa em grandes quantidades: prote\u00ednas, carboidratos e gorduras. Cada um desempenha um papel \u00fanico e cr\u00edtico na sua sa\u00fade, desempenho e composi\u00e7\u00e3o corporal. As prote\u00ednas constroem e reparam tecido muscular, os carboidratos fornecem energia para atividades di\u00e1rias e exerc\u00edcios, e as gorduras apoiam a produ\u00e7\u00e3o hormonal e fun\u00e7\u00e3o cerebral.',
        'Nossa calculadora de macros gratuita estima primeiro seu Gasto Energ\u00e9tico Di\u00e1rio Total (TDEE) usando a equa\u00e7\u00e3o de Mifflin-St Jeor, a f\u00f3rmula padr\u00e3o-ouro recomendada por profissionais de nutri\u00e7\u00e3o. Leva em conta peso, altura, idade, sexo e n\u00edvel de atividade f\u00edsica. Em seguida, com base no seu objetivo, ajusta a ingest\u00e3o cal\u00f3rica: d\u00e9ficit de 500 calorias para perda de peso, manuten\u00e7\u00e3o ou super\u00e1vit de 500 calorias para ganho muscular.',
        'Uma vez definidas as calorias alvo, a calculadora as distribui entre os tr\u00eas macronutrientes usando propor\u00e7\u00f5es baseadas em evid\u00eancias. Para perda de peso, uma propor\u00e7\u00e3o maior de prote\u00ednas (40%) ajuda a preservar massa muscular magra, enquanto carboidratos (30%) e gorduras (30%) moderados garantem energia sustentada. Para ganho muscular, os carboidratos s\u00e3o elevados (45%) para alimentar treinos intensos.',
        'Lembre-se de que esses objetivos de macros s\u00e3o pontos de partida personalizados, n\u00e3o regras r\u00edgidas. As necessidades individuais variam de acordo com intensidade do treino, prefer\u00eancias alimentares e composi\u00e7\u00e3o corporal. Acompanhe seus macros por 2-3 semanas, monitore seu progresso e ajuste as propor\u00e7\u00f5es com pequenos incrementos. Para necessidades espec\u00edficas, consulte um nutricionista esportivo.',
      ],
      faq: [
        { q: 'O que s\u00e3o macronutrientes e por que s\u00e3o importantes?', a: 'Macronutrientes s\u00e3o os tr\u00eas nutrientes que o corpo precisa em grandes quantidades: prote\u00ednas (4 cal/g), carboidratos (4 cal/g) e gorduras (9 cal/g). Fornecem todas as calorias alimentares e cada um cumpre fun\u00e7\u00f5es essenciais. O equil\u00edbrio correto otimiza composi\u00e7\u00e3o corporal, energia e desempenho.' },
        { q: 'Como a calculadora determina minha distribui\u00e7\u00e3o de macros?', a: 'A calculadora estima primeiro o TDEE usando a equa\u00e7\u00e3o de Mifflin-St Jeor, depois ajusta as calorias conforme o objetivo. Para perda de peso: 40/30/30 prote\u00ednas/carboidratos/gorduras, para manuten\u00e7\u00e3o 30/40/30, e para ganho muscular 30/45/25.' },
        { q: 'Quanta prote\u00edna eu realmente preciso?', a: 'Para adultos ativos, recomenda-se 1,6-2,2 gramas de prote\u00edna por kg de peso corporal por dia. Durante a perda de peso, uma ingest\u00e3o maior (at\u00e9 2,4 g/kg) ajuda a preservar massa magra. Nossa calculadora define prote\u00ednas como porcentagem das calorias totais.' },
        { q: 'Devo contar macros ou s\u00f3 calorias?', a: 'Contar macros \u00e9 mais preciso do que s\u00f3 contar calorias. Duas dietas com as mesmas calorias mas propor\u00e7\u00f5es de macros diferentes podem produzir resultados muito diferentes. Se parece dif\u00edcil, comece focando em prote\u00ednas e calorias totais.' },
        { q: 'Posso ajustar as propor\u00e7\u00f5es para a dieta keto?', a: 'Esta calculadora fornece propor\u00e7\u00f5es equilibradas. Para dietas especializadas como keto, seriam necess\u00e1rias propor\u00e7\u00f5es diferentes como 25% prote\u00ednas, 5% carboidratos e 70% gorduras. Use as calorias calculadas como base e ajuste as porcentagens.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="macro-calculator" faqItems={seo.faq}>
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

          {/* Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.goalLabel[lang]}</label>
            <div className="flex gap-2">
              <button onClick={() => setGoal('lose')} className={`flex-1 py-2 rounded-lg font-medium text-sm ${goal === 'lose' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{labels.lose[lang]}</button>
              <button onClick={() => setGoal('maintain')} className={`flex-1 py-2 rounded-lg font-medium text-sm ${goal === 'maintain' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{labels.maintain[lang]}</button>
              <button onClick={() => setGoal('gain')} className={`flex-1 py-2 rounded-lg font-medium text-sm ${goal === 'gain' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{labels.gain[lang]}</button>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleReset} className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {labels.reset[lang]}
            </button>
          </div>

          {/* Results */}
          {isValid && totalCals > 0 && (
            <>
              {/* Total Calories */}
              <div className="p-5 rounded-xl bg-green-50 border border-green-200 text-center">
                <div className="text-xs font-medium text-green-600 uppercase tracking-wide">{labels.dailyCalories[lang]}</div>
                <div className="text-4xl font-bold text-gray-900 mt-1">{totalCals}</div>
                <div className="text-sm text-green-600">{labels.calsPerDay[lang]}</div>
              </div>

              {/* Macro Breakdown Header */}
              <h3 className="text-sm font-medium text-gray-700">{labels.macroBreakdown[lang]}</h3>

              {/* Visual Bar */}
              <div className="flex rounded-full h-5 overflow-hidden">
                {macros.map((m, i) => (
                  <div key={i} className={`${m.color} flex items-center justify-center text-xs font-bold text-white`} style={{ width: `${m.pct}%` }}>
                    {m.pct}%
                  </div>
                ))}
              </div>

              {/* Macro Cards */}
              <div className="space-y-3">
                {macros.map((m, i) => (
                  <div key={i} className={`${m.lightBg} rounded-xl p-4 border border-opacity-20`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-semibold ${m.textColor}`}>{m.name}</span>
                      <span className="text-xs text-gray-500">{m.pct}% | {m.calsPerG} cal/{labels.perGram[lang]}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">{m.grams}</span>
                      <span className="text-sm text-gray-500">{labels.grams[lang]}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{m.grams * m.calsPerG} kcal</div>
                    {/* Progress bar */}
                    <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Per Meal Breakdown */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">{labels.mealPlan[lang]}</h4>
                <p className="text-xs text-gray-500 mb-2">{labels.perMeal[lang]}</p>
                <div className="grid grid-cols-3 gap-3">
                  {macros.map((m, i) => (
                    <div key={i} className="text-center">
                      <div className={`text-xs font-medium ${m.textColor}`}>{m.name}</div>
                      <div className="text-lg font-bold text-gray-900">{Math.round(m.grams / 3)}g</div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">{labels.dailyCalories[lang]}</div>
                  <div className="text-lg font-bold text-gray-900">{Math.round(totalCals / 3)} kcal</div>
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
                <div key={i} className="px-3 py-2 rounded-lg bg-gray-50 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{h.gender} | {h.age}y | {h.goal}</span>
                    <span className="font-medium text-gray-900">{h.calories} kcal</span>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    <span className="text-red-500">P: {h.protein}g</span>
                    <span className="text-yellow-600">C: {h.carbs}g</span>
                    <span className="text-blue-500">F: {h.fat}g</span>
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
