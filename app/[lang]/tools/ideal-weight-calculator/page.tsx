'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface HistoryEntry {
  height: number;
  gender: string;
  avg: number;
  unit: string;
  timestamp: string;
}

export default function IdealWeightCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['ideal-weight-calculator'][lang];

  const [height, setHeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const labels = {
    height: { en: 'Height (cm)', it: 'Altezza (cm)', es: 'Altura (cm)', fr: 'Taille (cm)', de: 'Größe (cm)', pt: 'Altura (cm)' },
    heightFt: { en: 'Height (ft)', it: 'Altezza (ft)', es: 'Altura (ft)', fr: 'Taille (ft)', de: 'Größe (ft)', pt: 'Altura (ft)' },
    heightIn: { en: 'Height (in)', it: 'Altezza (in)', es: 'Altura (in)', fr: 'Taille (in)', de: 'Größe (in)', pt: 'Altura (in)' },
    gender: { en: 'Gender', it: 'Sesso', es: 'Género', fr: 'Sexe', de: 'Geschlecht', pt: 'Sexo' },
    male: { en: 'Male', it: 'Maschio', es: 'Masculino', fr: 'Homme', de: 'Männlich', pt: 'Masculino' },
    female: { en: 'Female', it: 'Femmina', es: 'Femenino', fr: 'Femme', de: 'Weiblich', pt: 'Feminino' },
    formula: { en: 'Formula', it: 'Formula', es: 'Fórmula', fr: 'Formule', de: 'Formel', pt: 'Fórmula' },
    idealWeight: { en: 'Ideal Weight (kg)', it: 'Peso ideale (kg)', es: 'Peso ideal (kg)', fr: 'Poids idéal (kg)', de: 'Idealgewicht (kg)', pt: 'Peso ideal (kg)' },
    bmiRange: { en: 'BMI Healthy Range', it: 'Range BMI sano', es: 'Rango IMC saludable', fr: 'Plage IMC saine', de: 'BMI Gesundbereich', pt: 'Faixa IMC saudável' },
    metric: { en: 'Metric (cm)', it: 'Metrico (cm)', es: 'Métrico (cm)', fr: 'Métrique (cm)', de: 'Metrisch (cm)', pt: 'Métrico (cm)' },
    imperial: { en: 'Imperial (ft/in)', it: 'Imperiale (ft/in)', es: 'Imperial (ft/in)', fr: 'Impérial (ft/in)', de: 'Imperial (ft/in)', pt: 'Imperial (ft/in)' },
    average: { en: 'Average', it: 'Media', es: 'Promedio', fr: 'Moyenne', de: 'Durchschnitt', pt: 'Média' },
    reset: { en: 'Reset', it: 'Reimposta', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
    copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier les Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié!', de: 'Kopiert!', pt: 'Copiado!' },
    history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
    invalidHeight: { en: 'Height must be 130-230 cm', it: 'Altezza: 130-230 cm', es: 'Altura: 130-230 cm', fr: 'Taille: 130-230 cm', de: 'Größe: 130-230 cm', pt: 'Altura: 130-230 cm' },
  } as Record<string, Record<Locale, string>>;

  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');

  const heightCm = unit === 'metric'
    ? parseFloat(height) || 0
    : ((parseFloat(feet) || 0) * 12 + (parseFloat(inches) || 0)) * 2.54;

  const h = heightCm;
  const inchesTotal = h / 2.54;
  const over60 = Math.max(0, inchesTotal - 60);

  const devine = gender === 'male' ? 50 + 2.3 * over60 : 45.5 + 2.3 * over60;
  const robinson = gender === 'male' ? 52 + 1.9 * over60 : 49 + 1.7 * over60;
  const miller = gender === 'male' ? 56.2 + 1.41 * over60 : 53.1 + 1.36 * over60;
  const hamwi = gender === 'male' ? 48 + 2.7 * over60 : 45.5 + 2.2 * over60;

  const hm = h / 100;
  const bmiLow = 18.5 * hm * hm;
  const bmiHigh = 24.9 * hm * hm;
  const average = (devine + robinson + miller + hamwi) / 4;

  const hasResult = h >= 130 && h <= 230;
  const showInvalidHeight = height !== '' && unit === 'metric' && (h < 130 || h > 230) && h > 0;

  const convertWeight = (kg: number) => unit === 'imperial' ? kg * 2.205 : kg;
  const weightUnit = unit === 'imperial' ? 'lbs' : 'kg';

  const resetAll = () => {
    setHeight('');
    setFeet('');
    setInches('');
    setGender('male');
    setCopied(false);
  };

  const copyResults = () => {
    if (!hasResult) return;
    const text = `Devine: ${convertWeight(devine).toFixed(1)} ${weightUnit} | Robinson: ${convertWeight(robinson).toFixed(1)} ${weightUnit} | Miller: ${convertWeight(miller).toFixed(1)} ${weightUnit} | Hamwi: ${convertWeight(hamwi).toFixed(1)} ${weightUnit} | BMI Range: ${convertWeight(bmiLow).toFixed(1)}-${convertWeight(bmiHigh).toFixed(1)} ${weightUnit}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveToHistory = () => {
    if (!hasResult) return;
    const entry: HistoryEntry = { height: h, gender, avg: average, unit: weightUnit, timestamp: new Date().toLocaleTimeString() };
    setHistory(prev => [entry, ...prev].slice(0, 5));
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Ideal Weight Calculator – Find Your Optimal Weight Online',
      paragraphs: [
        'Knowing your ideal body weight is an important step toward better health. Unlike a single magic number, the ideal weight depends on your height, gender, body frame, and overall fitness. Our calculator uses four of the most respected medical formulas to give you a comprehensive range: Devine, Robinson, Miller, and Hamwi.',
        'The Devine formula, created in 1974 by Dr. B.J. Devine, was originally designed for calculating medicinal dosages based on body weight, but it quickly became a popular method for estimating ideal weight. The Robinson formula (1983) is considered one of the most accurate modifications, while the Miller formula (1983) tends to give slightly higher values for both genders. The Hamwi formula, published in 1964, was one of the earliest and simplest approaches.',
        'All four formulas share a common structure: they start with a base weight for someone who is 5 feet (152 cm) tall and then add a fixed number of kilograms for every additional inch of height. The results vary somewhat, giving you a range rather than a single number, which is more realistic. We also display the BMI-based healthy range (18.5 to 24.9), which provides an additional reference.',
        'Remember, ideal weight calculators are guides, not diagnoses. Factors like muscle mass, bone density, age, and ethnicity influence what is truly ideal for you. Athletes may weigh more than the formula suggests while being perfectly healthy. Use these results as a starting point and consult a healthcare professional for personalized advice.',
      ],
      faq: [
        { q: 'Which ideal weight formula is the most accurate?', a: 'The Robinson formula (1983) is often considered the most accurate modification of the original Devine formula. However, no single formula is perfect for everyone. Comparing all four formulas gives you a realistic range. The BMI-based healthy range (18.5-24.9) provides an additional cross-reference.' },
        { q: 'How does the Devine formula work?', a: 'The Devine formula (1974) calculates ideal weight starting from a base value at 5 feet tall: 50 kg for men, 45.5 kg for women. For each additional inch above 60 inches, it adds 2.3 kg. It was originally used for drug dosage calculations but became widely adopted for weight estimation.' },
        { q: 'Is ideal weight the same as healthy weight?', a: 'Not exactly. Ideal weight formulas provide an estimate based on height and gender only. Healthy weight also considers muscle mass, bone density, body fat percentage, age, and overall fitness. Someone with high muscle mass may weigh more than the ideal weight but still be very healthy.' },
        { q: 'Does the ideal weight calculator work for all heights?', a: 'These formulas were designed primarily for adults of average frame size. They work best for heights between approximately 150 cm and 200 cm. For very short or very tall individuals, the BMI-based range may be more reliable than the classical formulas.' },
        { q: 'Should I aim for the exact number the calculator shows?', a: 'No. The calculator shows a range from four formulas and the BMI-based range. Aim for a weight within this general range. The best approach is to combine this estimate with body fat percentage measurements and advice from a healthcare provider.' },
      ],
    },
    it: {
      title: 'Calcolatore Peso Ideale Gratuito – Trova il Tuo Peso Ottimale Online',
      paragraphs: [
        'Conoscere il proprio peso ideale è un passo importante verso una salute migliore. A differenza di un singolo numero magico, il peso ideale dipende da altezza, sesso, struttura corporea e forma fisica complessiva. Il nostro calcolatore utilizza quattro delle formule mediche più autorevoli per darti un intervallo completo: Devine, Robinson, Miller e Hamwi.',
        'La formula di Devine, creata nel 1974, era originariamente pensata per calcolare dosaggi medicinali in base al peso corporeo, ma è rapidamente diventata un metodo popolare per stimare il peso ideale. La formula di Robinson (1983) è considerata una delle modifiche più accurate, mentre la formula di Miller (1983) tende a dare valori leggermente più alti per entrambi i sessi.',
        'Tutte e quattro le formule condividono una struttura comune: partono da un peso base per qualcuno alto 5 piedi (152 cm) e aggiungono un numero fisso di chilogrammi per ogni pollice aggiuntivo di altezza. I risultati variano leggermente, offrendoti un range piuttosto che un singolo numero, il che è più realistico.',
        'Ricorda, i calcolatori di peso ideale sono guide, non diagnosi. Fattori come massa muscolare, densità ossea, età e etnia influenzano ciò che è veramente ideale per te. Usa questi risultati come punto di partenza e consulta un professionista sanitario.',
      ],
      faq: [
        { q: 'Quale formula per il peso ideale è la più accurata?', a: 'La formula di Robinson (1983) è spesso considerata la modifica più accurata della formula originale di Devine. Tuttavia, nessuna formula è perfetta per tutti. Confrontare tutte e quattro le formule offre un intervallo realistico.' },
        { q: 'Come funziona la formula di Devine?', a: 'La formula di Devine (1974) calcola il peso ideale partendo da un valore base a 5 piedi di altezza: 50 kg per gli uomini, 45,5 kg per le donne. Per ogni pollice aggiuntivo sopra i 60 pollici, aggiunge 2,3 kg.' },
        { q: 'Il peso ideale è uguale al peso sano?', a: 'Non esattamente. Le formule del peso ideale forniscono una stima basata solo su altezza e sesso. Il peso sano considera anche massa muscolare, densità ossea, percentuale di grasso corporeo ed età.' },
        { q: 'Il calcolatore funziona per tutte le altezze?', a: 'Queste formule sono state progettate principalmente per adulti di corporatura media. Funzionano meglio per altezze tra circa 150 cm e 200 cm. Per persone molto basse o molto alte, il range basato sul BMI potrebbe essere più affidabile.' },
        { q: 'Devo puntare al numero esatto mostrato dal calcolatore?', a: 'No. Il calcolatore mostra un intervallo da quattro formule e il range BMI. Punta a un peso entro questo range generale e consulta un professionista sanitario per consigli personalizzati.' },
      ],
    },
    es: {
      title: 'Calculadora de Peso Ideal Gratis – Encuentra Tu Peso Óptimo Online',
      paragraphs: [
        'Conocer tu peso ideal es un paso importante hacia una mejor salud. A diferencia de un solo número mágico, el peso ideal depende de la altura, género, estructura corporal y condición física general. Nuestra calculadora utiliza cuatro de las fórmulas médicas más respetadas: Devine, Robinson, Miller y Hamwi.',
        'La fórmula de Devine, creada en 1974, fue originalmente diseñada para calcular dosis de medicamentos basadas en el peso corporal, pero rápidamente se convirtió en un método popular para estimar el peso ideal. La fórmula de Robinson (1983) se considera una de las modificaciones más precisas.',
        'Las cuatro fórmulas comparten una estructura común: comienzan con un peso base para alguien que mide 5 pies (152 cm) y luego agregan un número fijo de kilogramos por cada pulgada adicional de altura. Los resultados varían un poco, dándote un rango en lugar de un solo número.',
        'Recuerda, las calculadoras de peso ideal son guías, no diagnósticos. Factores como masa muscular, densidad ósea, edad y etnia influyen en lo que es verdaderamente ideal para ti. Consulta a un profesional de la salud para consejos personalizados.',
      ],
      faq: [
        { q: '¿Cuál fórmula de peso ideal es la más precisa?', a: 'La fórmula de Robinson (1983) se considera a menudo la modificación más precisa de la fórmula original de Devine. Sin embargo, ninguna fórmula es perfecta para todos. Comparar las cuatro fórmulas da un rango realista.' },
        { q: '¿Cómo funciona la fórmula de Devine?', a: 'La fórmula de Devine (1974) calcula el peso ideal partiendo de un valor base a 5 pies: 50 kg para hombres, 45,5 kg para mujeres. Por cada pulgada adicional sobre 60 pulgadas, agrega 2,3 kg.' },
        { q: '¿El peso ideal es lo mismo que el peso saludable?', a: 'No exactamente. Las fórmulas de peso ideal proporcionan una estimación basada solo en altura y género. El peso saludable también considera masa muscular, densidad ósea y porcentaje de grasa corporal.' },
        { q: '¿La calculadora funciona para todas las alturas?', a: 'Estas fórmulas fueron diseñadas principalmente para adultos de estructura media. Funcionan mejor para alturas entre aproximadamente 150 cm y 200 cm.' },
        { q: '¿Debo apuntar al número exacto que muestra la calculadora?', a: 'No. La calculadora muestra un rango de cuatro fórmulas y el rango IMC. Apunta a un peso dentro de este rango general y consulta a un profesional de la salud.' },
      ],
    },
    fr: {
      title: 'Calculateur de Poids Idéal Gratuit – Trouvez Votre Poids Optimal en Ligne',
      paragraphs: [
        'Connaître votre poids idéal est une étape importante vers une meilleure santé. Contrairement à un seul chiffre magique, le poids idéal dépend de votre taille, sexe, ossature et condition physique générale. Notre calculateur utilise quatre des formules médicales les plus respectées : Devine, Robinson, Miller et Hamwi.',
        'La formule de Devine, créée en 1974, était à l\'origine conçue pour calculer les posologies médicamenteuses en fonction du poids corporel, mais elle est rapidement devenue une méthode populaire pour estimer le poids idéal. La formule de Robinson (1983) est considérée comme l\'une des modifications les plus précises.',
        'Les quatre formules partagent une structure commune : elles partent d\'un poids de base pour une personne mesurant 5 pieds (152 cm) puis ajoutent un nombre fixe de kilogrammes pour chaque pouce supplémentaire. Les résultats varient légèrement, vous donnant une fourchette plutôt qu\'un seul nombre.',
        'N\'oubliez pas que les calculateurs de poids idéal sont des guides, pas des diagnostics. Des facteurs comme la masse musculaire, la densité osseuse, l\'âge et l\'origine ethnique influencent ce qui est vraiment idéal pour vous. Consultez un professionnel de santé.',
      ],
      faq: [
        { q: 'Quelle formule de poids idéal est la plus précise ?', a: 'La formule de Robinson (1983) est souvent considérée comme la modification la plus précise de la formule originale de Devine. Cependant, aucune formule n\'est parfaite pour tout le monde.' },
        { q: 'Comment fonctionne la formule de Devine ?', a: 'La formule de Devine (1974) calcule le poids idéal à partir d\'une valeur de base à 5 pieds : 50 kg pour les hommes, 45,5 kg pour les femmes. Pour chaque pouce supplémentaire au-dessus de 60 pouces, elle ajoute 2,3 kg.' },
        { q: 'Le poids idéal est-il identique au poids santé ?', a: 'Pas exactement. Les formules de poids idéal fournissent une estimation basée uniquement sur la taille et le sexe. Le poids santé prend également en compte la masse musculaire et la densité osseuse.' },
        { q: 'Le calculateur fonctionne-t-il pour toutes les tailles ?', a: 'Ces formules ont été conçues principalement pour les adultes de corpulence moyenne. Elles fonctionnent mieux pour des tailles entre environ 150 cm et 200 cm.' },
        { q: 'Dois-je viser le nombre exact affiché par le calculateur ?', a: 'Non. Le calculateur affiche une fourchette issue de quatre formules et la plage IMC. Visez un poids dans cette fourchette générale et consultez un professionnel de santé.' },
      ],
    },
    de: {
      title: 'Kostenloser Idealgewicht-Rechner – Finden Sie Ihr Optimales Gewicht Online',
      paragraphs: [
        'Ihr Idealgewicht zu kennen ist ein wichtiger Schritt zu besserer Gesundheit. Im Gegensatz zu einer einzelnen magischen Zahl hängt das Idealgewicht von Größe, Geschlecht, Körperbau und allgemeiner Fitness ab. Unser Rechner verwendet vier der anerkanntesten medizinischen Formeln: Devine, Robinson, Miller und Hamwi.',
        'Die Devine-Formel, 1974 erstellt, war ursprünglich für die Berechnung von Medikamentendosierungen basierend auf dem Körpergewicht gedacht, wurde aber schnell zu einer beliebten Methode zur Schätzung des Idealgewichts. Die Robinson-Formel (1983) gilt als eine der genauesten Modifikationen.',
        'Alle vier Formeln teilen eine gemeinsame Struktur: Sie beginnen mit einem Basisgewicht für jemanden, der 5 Fuß (152 cm) groß ist, und addieren dann eine feste Anzahl von Kilogramm für jeden zusätzlichen Zoll Körpergröße. Die Ergebnisse variieren etwas und geben Ihnen einen Bereich statt einer einzelnen Zahl.',
        'Denken Sie daran, dass Idealgewicht-Rechner Richtwerte sind, keine Diagnosen. Faktoren wie Muskelmasse, Knochendichte, Alter und Ethnizität beeinflussen, was für Sie wirklich ideal ist. Konsultieren Sie einen Gesundheitsfachmann für personalisierte Beratung.',
      ],
      faq: [
        { q: 'Welche Idealgewicht-Formel ist am genauesten?', a: 'Die Robinson-Formel (1983) gilt oft als die genaueste Modifikation der ursprünglichen Devine-Formel. Keine Formel ist jedoch perfekt für alle. Der Vergleich aller vier Formeln gibt einen realistischen Bereich.' },
        { q: 'Wie funktioniert die Devine-Formel?', a: 'Die Devine-Formel (1974) berechnet das Idealgewicht ausgehend von einem Basiswert bei 5 Fuß Größe: 50 kg für Männer, 45,5 kg für Frauen. Für jeden zusätzlichen Zoll über 60 Zoll werden 2,3 kg addiert.' },
        { q: 'Ist das Idealgewicht das gleiche wie das gesunde Gewicht?', a: 'Nicht genau. Idealgewicht-Formeln liefern eine Schätzung basierend nur auf Größe und Geschlecht. Das gesunde Gewicht berücksichtigt auch Muskelmasse, Knochendichte und Körperfettanteil.' },
        { q: 'Funktioniert der Rechner für alle Körpergrößen?', a: 'Diese Formeln wurden hauptsächlich für Erwachsene mit durchschnittlichem Körperbau entwickelt. Sie funktionieren am besten für Größen zwischen etwa 150 cm und 200 cm.' },
        { q: 'Sollte ich die exakte Zahl anstreben, die der Rechner zeigt?', a: 'Nein. Der Rechner zeigt einen Bereich aus vier Formeln und den BMI-Bereich. Streben Sie ein Gewicht innerhalb dieses allgemeinen Bereichs an und konsultieren Sie einen Gesundheitsfachmann.' },
      ],
    },
    pt: {
      title: 'Calculadora de Peso Ideal Grátis – Encontre Seu Peso Ótimo Online',
      paragraphs: [
        'Conhecer seu peso ideal é um passo importante para uma saúde melhor. Diferente de um único número mágico, o peso ideal depende da altura, sexo, estrutura corporal e condição física geral. Nossa calculadora utiliza quatro das fórmulas médicas mais respeitadas: Devine, Robinson, Miller e Hamwi.',
        'A fórmula de Devine, criada em 1974, foi originalmente projetada para calcular dosagens de medicamentos com base no peso corporal, mas rapidamente se tornou um método popular para estimar o peso ideal. A fórmula de Robinson (1983) é considerada uma das modificações mais precisas.',
        'Todas as quatro fórmulas compartilham uma estrutura comum: começam com um peso base para alguém com 5 pés (152 cm) de altura e adicionam um número fixo de quilogramas para cada polegada adicional de altura. Os resultados variam um pouco, fornecendo uma faixa em vez de um único número.',
        'Lembre-se, calculadoras de peso ideal são guias, não diagnósticos. Fatores como massa muscular, densidade óssea, idade e etnia influenciam o que é verdadeiramente ideal para você. Consulte um profissional de saúde para orientação personalizada.',
      ],
      faq: [
        { q: 'Qual fórmula de peso ideal é a mais precisa?', a: 'A fórmula de Robinson (1983) é frequentemente considerada a modificação mais precisa da fórmula original de Devine. No entanto, nenhuma fórmula é perfeita para todos.' },
        { q: 'Como funciona a fórmula de Devine?', a: 'A fórmula de Devine (1974) calcula o peso ideal a partir de um valor base a 5 pés: 50 kg para homens, 45,5 kg para mulheres. Para cada polegada adicional acima de 60 polegadas, adiciona 2,3 kg.' },
        { q: 'O peso ideal é o mesmo que peso saudável?', a: 'Não exatamente. As fórmulas de peso ideal fornecem uma estimativa baseada apenas em altura e sexo. O peso saudável também considera massa muscular, densidade óssea e percentual de gordura corporal.' },
        { q: 'A calculadora funciona para todas as alturas?', a: 'Essas fórmulas foram projetadas principalmente para adultos de estrutura média. Funcionam melhor para alturas entre aproximadamente 150 cm e 200 cm.' },
        { q: 'Devo mirar no número exato que a calculadora mostra?', a: 'Não. A calculadora mostra uma faixa de quatro fórmulas e a faixa de IMC. Mire em um peso dentro dessa faixa geral e consulte um profissional de saúde.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formulas = [
    { name: 'Devine', val: devine, color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { name: 'Robinson', val: robinson, color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
    { name: 'Miller', val: miller, color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { name: 'Hamwi', val: hamwi, color: 'bg-violet-50 border-violet-200 text-violet-700' },
  ];

  return (
    <ToolPageWrapper toolSlug="ideal-weight-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Unit Toggle */}
          <div className="flex gap-2 mb-2">
            <button onClick={() => { setUnit('metric'); setHeight(''); setFeet(''); setInches(''); }}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${unit === 'metric' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {t('metric')}
            </button>
            <button onClick={() => { setUnit('imperial'); setHeight(''); setFeet(''); setInches(''); }}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${unit === 'imperial' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {t('imperial')}
            </button>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('gender')}</label>
            <div className="flex gap-3">
              <button onClick={() => setGender('male')} className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${gender === 'male' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                {t('male')}
              </button>
              <button onClick={() => setGender('female')} className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${gender === 'female' ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                {t('female')}
              </button>
            </div>
          </div>

          {/* Height Input */}
          {unit === 'metric' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('height')}</label>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175"
                className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 ${showInvalidHeight ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
              {showInvalidHeight && <p className="text-red-500 text-xs mt-1">{t('invalidHeight')}</p>}
            </div>
          ) : (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('heightFt')}</label>
                <input type="number" value={feet} onChange={(e) => setFeet(e.target.value)} placeholder="5"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('heightIn')}</label>
                <input type="number" value={inches} onChange={(e) => setInches(e.target.value)} placeholder="9"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {hasResult && (
              <>
                <button onClick={copyResults} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                  {copied ? t('copied') : t('copy')}
                </button>
                <button onClick={saveToHistory} className="px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium text-blue-700 transition-colors">
                  + {t('history')}
                </button>
              </>
            )}
            <button onClick={resetAll} className="px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-600 transition-colors ml-auto">
              {t('reset')}
            </button>
          </div>

          {hasResult && (
            <div className="space-y-3 mt-4">
              {/* Formula Results */}
              <div className="grid grid-cols-2 gap-3">
                {formulas.map((f) => (
                  <div key={f.name} className={`rounded-xl p-4 text-center border ${f.color}`}>
                    <div className="text-xs font-medium opacity-70">{f.name}</div>
                    <div className="text-2xl font-bold">{convertWeight(f.val).toFixed(1)} {weightUnit}</div>
                  </div>
                ))}
              </div>

              {/* Average */}
              <div className="bg-blue-100 border border-blue-300 rounded-xl p-4 text-center">
                <div className="text-xs text-blue-600 font-medium">{t('average')}</div>
                <div className="text-2xl font-bold text-blue-800">{convertWeight(average).toFixed(1)} {weightUnit}</div>
              </div>

              {/* BMI Range */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="text-xs text-green-600 font-medium">{t('bmiRange')} (18.5 - 24.9)</div>
                <div className="text-xl font-bold text-green-800">{convertWeight(bmiLow).toFixed(1)} - {convertWeight(bmiHigh).toFixed(1)} {weightUnit}</div>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('history')}</h3>
              <div className="space-y-1">
                {history.map((entry, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-600 bg-white rounded px-3 py-1.5 border border-gray-100">
                    <span>{entry.height.toFixed(0)} cm - {entry.gender === 'male' ? t('male') : t('female')}</span>
                    <span className="font-semibold">{convertWeight(entry.avg).toFixed(1)} {entry.unit}</span>
                    <span className="text-gray-400">{entry.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
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
