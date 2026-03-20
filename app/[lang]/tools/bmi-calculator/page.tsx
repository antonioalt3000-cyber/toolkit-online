'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type HistoryEntry = { weight: number; height: number; bmi: number; category: string; unit: string };

export default function BmiCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['bmi-calculator'][lang];

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<{ weight?: string; height?: string }>({});

  const labels = {
    weight: { en: 'Weight (kg)', it: 'Peso (kg)', es: 'Peso (kg)', fr: 'Poids (kg)', de: 'Gewicht (kg)', pt: 'Peso (kg)' },
    weightLbs: { en: 'Weight (lbs)', it: 'Peso (lbs)', es: 'Peso (lbs)', fr: 'Poids (lbs)', de: 'Gewicht (lbs)', pt: 'Peso (lbs)' },
    height: { en: 'Height (cm)', it: 'Altezza (cm)', es: 'Altura (cm)', fr: 'Taille (cm)', de: 'Größe (cm)', pt: 'Altura (cm)' },
    heightIn: { en: 'Height (inches)', it: 'Altezza (pollici)', es: 'Altura (pulgadas)', fr: 'Taille (pouces)', de: 'Größe (Zoll)', pt: 'Altura (polegadas)' },
    underweight: { en: 'Underweight', it: 'Sottopeso', es: 'Bajo peso', fr: 'Insuffisance pondérale', de: 'Untergewicht', pt: 'Abaixo do peso' },
    normal: { en: 'Normal weight', it: 'Normopeso', es: 'Peso normal', fr: 'Poids normal', de: 'Normalgewicht', pt: 'Peso normal' },
    overweight: { en: 'Overweight', it: 'Sovrappeso', es: 'Sobrepeso', fr: 'Surpoids', de: 'Übergewicht', pt: 'Sobrepeso' },
    obese: { en: 'Obese', it: 'Obesità', es: 'Obesidad', fr: 'Obésité', de: 'Adipositas', pt: 'Obesidade' },
    metric: { en: 'Metric (kg/cm)', it: 'Metrico (kg/cm)', es: 'Métrico (kg/cm)', fr: 'Métrique (kg/cm)', de: 'Metrisch (kg/cm)', pt: 'Métrico (kg/cm)' },
    imperial: { en: 'Imperial (lbs/in)', it: 'Imperiale (lbs/in)', es: 'Imperial (lbs/in)', fr: 'Impérial (lbs/in)', de: 'Imperial (lbs/in)', pt: 'Imperial (lbs/in)' },
    reset: { en: 'Reset', it: 'Resetta', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
    copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié!', de: 'Kopiert!', pt: 'Copiado!' },
    history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
    healthyRange: { en: 'Healthy weight range', it: 'Range peso sano', es: 'Rango de peso saludable', fr: 'Plage de poids sain', de: 'Gesunder Gewichtsbereich', pt: 'Faixa de peso saudável' },
    invalidWeight: { en: 'Enter a valid weight', it: 'Inserisci un peso valido', es: 'Ingresa un peso válido', fr: 'Entrez un poids valide', de: 'Gültiges Gewicht eingeben', pt: 'Insira um peso válido' },
    invalidHeight: { en: 'Enter a valid height', it: 'Inserisci un\'altezza valida', es: 'Ingresa una altura válida', fr: 'Entrez une taille valide', de: 'Gültige Größe eingeben', pt: 'Insira uma altura válida' },
  } as Record<string, Record<Locale, string>>;

  // Convert to metric for calculation
  const wKg = unit === 'metric' ? (parseFloat(weight) || 0) : (parseFloat(weight) || 0) * 0.453592;
  const hCm = unit === 'metric' ? (parseFloat(height) || 0) : (parseFloat(height) || 0) * 2.54;
  const bmi = hCm > 0 ? wKg / ((hCm / 100) ** 2) : 0;

  const getCategory = () => {
    if (bmi < 18.5) return { text: labels.underweight[lang], color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '⚠️', pct: (bmi / 40) * 100 };
    if (bmi < 25) return { text: labels.normal[lang], color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: '✅', pct: (bmi / 40) * 100 };
    if (bmi < 30) return { text: labels.overweight[lang], color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: '⚠️', pct: (bmi / 40) * 100 };
    return { text: labels.obese[lang], color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: '🔴', pct: Math.min((bmi / 40) * 100, 100) };
  };

  const healthyWeightMin = unit === 'metric' ? (18.5 * ((hCm / 100) ** 2)).toFixed(1) : ((18.5 * ((hCm / 100) ** 2)) / 0.453592).toFixed(1);
  const healthyWeightMax = unit === 'metric' ? (24.9 * ((hCm / 100) ** 2)).toFixed(1) : ((24.9 * ((hCm / 100) ** 2)) / 0.453592).toFixed(1);

  const validate = () => {
    const newErrors: { weight?: string; height?: string } = {};
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (weight && (isNaN(w) || w <= 0)) newErrors.weight = labels.invalidWeight[lang];
    if (height && (isNaN(h) || h <= 0)) newErrors.height = labels.invalidHeight[lang];
    setErrors(newErrors);
  };

  const handleCalculation = () => {
    if (bmi > 0 && !errors.weight && !errors.height) {
      const cat = getCategory();
      const entry: HistoryEntry = { weight: parseFloat(weight), height: parseFloat(height), bmi, category: cat.text, unit };
      setHistory(prev => [entry, ...prev.filter((_, i) => i < 4)]);
    }
  };

  const handleReset = () => {
    setWeight('');
    setHeight('');
    setErrors({});
  };

  const copyResults = () => {
    const cat = getCategory();
    const unitLabel = unit === 'metric' ? 'kg/cm' : 'lbs/in';
    const text = `BMI: ${bmi.toFixed(1)} (${cat.text})\nWeight: ${weight} ${unitLabel.split('/')[0]}\nHeight: ${height} ${unitLabel.split('/')[1]}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free BMI Calculator – Calculate Your Body Mass Index Online',
      paragraphs: [
        'Body Mass Index (BMI) is a simple, widely-used screening tool that estimates whether a person has a healthy body weight relative to their height. Developed by Belgian mathematician Adolphe Quetelet in the 1830s, BMI remains one of the most common methods used by healthcare professionals for initial weight assessment.',
        'The formula is straightforward: BMI = weight (kg) / height (m)^2. Our calculator does the math for you — just enter your weight in kilograms and height in centimeters, and you instantly see your BMI along with the WHO classification: underweight (below 18.5), normal weight (18.5-24.9), overweight (25-29.9), or obese (30 and above).',
        'While BMI is useful as a quick screening tool, it has important limitations. It does not distinguish between muscle mass and fat mass, so athletes with high muscle density may be classified as overweight despite having low body fat. It also does not account for age, gender, ethnicity, or fat distribution.',
        'For a more complete picture of your health, consider combining BMI with other measurements. Our <a href="/en/tools/body-fat-calculator" class="text-blue-600 underline">body fat calculator</a> provides a more detailed assessment of your body composition, while the <a href="/en/tools/calorie-calculator" class="text-blue-600 underline">calorie calculator</a> helps you determine daily calorie needs based on your activity level. You can also check your <a href="/en/tools/ideal-weight-calculator" class="text-blue-600 underline">ideal weight</a> based on height and frame size. BMI is a starting point, not a diagnosis — consult a healthcare professional for personalized advice.',
      ],
      faq: [
        { q: 'How is BMI calculated?', a: 'BMI is calculated by dividing your weight in kilograms by your height in meters squared. The formula is: BMI = weight (kg) / (height (m))^2. For example, a person weighing 70 kg and measuring 175 cm tall has a BMI of 70 / (1.75)^2 = 22.9.' },
        { q: 'What is a healthy BMI range?', a: 'According to the World Health Organization (WHO), a BMI between 18.5 and 24.9 is considered normal weight. Below 18.5 is underweight, 25-29.9 is overweight, and 30 or above is classified as obese. These ranges apply to adults over 20 years old.' },
        { q: 'Is BMI accurate for athletes and muscular people?', a: 'No, BMI can be misleading for athletes and people with high muscle mass. Since muscle is denser than fat, muscular individuals may have a high BMI while having a healthy or low body fat percentage. Body fat percentage or DEXA scans are more accurate for these individuals.' },
        { q: 'Does BMI apply to children and teenagers?', a: 'BMI is calculated the same way for children, but it is interpreted differently using age- and sex-specific percentiles (BMI-for-age). A child\'s BMI is compared to other children of the same age and sex. This tool is designed for adult BMI calculation.' },
        { q: 'What should I do if my BMI indicates overweight or obese?', a: 'A BMI in the overweight or obese range suggests consulting a healthcare professional for a comprehensive evaluation. They can assess additional factors like blood pressure, cholesterol, blood sugar, and family history to provide personalized health recommendations.' },
      ],
    },
    it: {
      title: 'Calcolatore BMI Gratuito – Calcola il Tuo Indice di Massa Corporea Online',
      paragraphs: [
        'L\'Indice di Massa Corporea (BMI o IMC) è uno strumento di screening semplice e ampiamente utilizzato che stima se una persona ha un peso corporeo sano in relazione alla sua altezza. Sviluppato dal matematico belga Adolphe Quetelet negli anni 1830, il BMI rimane uno dei metodi più comuni usati dai professionisti sanitari.',
        'La formula è semplice: BMI = peso (kg) / altezza (m)^2. Il nostro calcolatore fa i calcoli per te — inserisci il peso in chilogrammi e l\'altezza in centimetri, e vedrai istantaneamente il tuo BMI con la classificazione OMS: sottopeso (sotto 18,5), normopeso (18,5-24,9), sovrappeso (25-29,9) o obesità (30 e oltre).',
        'Sebbene il BMI sia utile come strumento di screening rapido, ha importanti limitazioni. Non distingue tra massa muscolare e massa grassa, quindi atleti con alta densità muscolare potrebbero essere classificati come sovrappeso nonostante abbiano un basso grasso corporeo.',
        'Per un quadro più completo della tua salute, considera di combinare il BMI con altre misure. Il nostro <a href="/it/tools/body-fat-calculator" class="text-blue-600 underline">calcolatore di grasso corporeo</a> offre una valutazione più dettagliata della composizione corporea, mentre il <a href="/it/tools/calorie-calculator" class="text-blue-600 underline">calcolatore di calorie</a> ti aiuta a determinare il fabbisogno calorico giornaliero. Puoi anche verificare il tuo <a href="/it/tools/ideal-weight-calculator" class="text-blue-600 underline">peso ideale</a> in base ad altezza e struttura corporea.',
      ],
      faq: [
        { q: 'Come si calcola il BMI?', a: 'Il BMI si calcola dividendo il peso in chilogrammi per l\'altezza in metri al quadrato. La formula è: BMI = peso (kg) / (altezza (m))^2. Ad esempio, una persona di 70 kg alta 175 cm ha un BMI di 70 / (1,75)^2 = 22,9.' },
        { q: 'Qual è l\'intervallo BMI sano?', a: 'Secondo l\'OMS, un BMI tra 18,5 e 24,9 è considerato normopeso. Sotto 18,5 è sottopeso, 25-29,9 è sovrappeso e 30 o più è classificato come obesità. Questi intervalli si applicano agli adulti sopra i 20 anni.' },
        { q: 'Il BMI è accurato per atleti e persone muscolose?', a: 'No, il BMI può essere fuorviante per atleti e persone con alta massa muscolare. Poiché il muscolo è più denso del grasso, gli individui muscolosi possono avere un BMI alto pur avendo una bassa percentuale di grasso corporeo.' },
        { q: 'Il BMI si applica a bambini e adolescenti?', a: 'Il BMI si calcola allo stesso modo per i bambini, ma viene interpretato diversamente usando percentili specifici per età e sesso. Questo strumento è progettato per il calcolo del BMI degli adulti.' },
        { q: 'Cosa devo fare se il mio BMI indica sovrappeso o obesità?', a: 'Un BMI nella fascia di sovrappeso o obesità suggerisce di consultare un professionista sanitario per una valutazione completa che includa pressione sanguigna, colesterolo e glicemia.' },
      ],
    },
    es: {
      title: 'Calculadora de IMC Gratis – Calcula Tu Índice de Masa Corporal Online',
      paragraphs: [
        'El Índice de Masa Corporal (IMC) es una herramienta de evaluación simple y ampliamente utilizada que estima si una persona tiene un peso corporal saludable en relación con su altura. Desarrollado por el matemático belga Adolphe Quetelet en la década de 1830, el IMC sigue siendo uno de los métodos más comunes.',
        'La fórmula es sencilla: IMC = peso (kg) / altura (m)^2. Nuestra calculadora hace los cálculos por ti — solo ingresa tu peso en kilogramos y altura en centímetros, y verás instantáneamente tu IMC con la clasificación de la OMS.',
        'Aunque el IMC es útil como herramienta rápida, tiene limitaciones importantes. No distingue entre masa muscular y grasa, por lo que atletas con alta densidad muscular podrían clasificarse como sobrepeso a pesar de tener bajo porcentaje de grasa.',
        'Para una imagen más completa de tu salud, combina el IMC con otras herramientas. Nuestra <a href="/es/tools/body-fat-calculator" class="text-blue-600 underline">calculadora de grasa corporal</a> ofrece un análisis más detallado, y la <a href="/es/tools/calorie-calculator" class="text-blue-600 underline">calculadora de calorías</a> te ayuda a determinar tus necesidades calóricas diarias. También puedes verificar tu <a href="/es/tools/ideal-weight-calculator" class="text-blue-600 underline">peso ideal</a> según tu altura.',
      ],
      faq: [
        { q: '¿Cómo se calcula el IMC?', a: 'El IMC se calcula dividiendo el peso en kilogramos por la altura en metros al cuadrado. Por ejemplo, una persona de 70 kg que mide 175 cm tiene un IMC de 70 / (1,75)^2 = 22,9.' },
        { q: '¿Cuál es el rango de IMC saludable?', a: 'Según la OMS, un IMC entre 18,5 y 24,9 se considera peso normal. Menos de 18,5 es bajo peso, 25-29,9 es sobrepeso y 30 o más es obesidad.' },
        { q: '¿El IMC es preciso para atletas?', a: 'No, el IMC puede ser engañoso para atletas y personas con alta masa muscular. Como el músculo es más denso que la grasa, pueden tener un IMC alto con bajo porcentaje de grasa corporal.' },
        { q: '¿El IMC aplica para niños y adolescentes?', a: 'El IMC se calcula igual para niños, pero se interpreta usando percentiles por edad y sexo. Esta herramienta está diseñada para adultos.' },
        { q: '¿Qué debo hacer si mi IMC indica sobrepeso?', a: 'Un IMC en rango de sobrepeso sugiere consultar a un profesional de la salud para una evaluación completa que incluya presión arterial, colesterol y glucosa.' },
      ],
    },
    fr: {
      title: 'Calculateur IMC Gratuit – Calculez Votre Indice de Masse Corporelle en Ligne',
      paragraphs: [
        'L\'Indice de Masse Corporelle (IMC) est un outil de dépistage simple et largement utilisé qui estime si une personne a un poids corporel sain par rapport à sa taille. Développé par le mathématicien belge Adolphe Quetelet dans les années 1830, l\'IMC reste l\'une des méthodes les plus courantes.',
        'La formule est simple : IMC = poids (kg) / taille (m)^2. Notre calculateur fait le calcul pour vous — entrez votre poids en kilogrammes et votre taille en centimètres, et vous verrez instantanément votre IMC avec la classification OMS.',
        'Bien que l\'IMC soit utile comme outil rapide, il a des limitations importantes. Il ne distingue pas la masse musculaire de la masse grasse, donc les athlètes pourraient être classés en surpoids malgré un faible pourcentage de graisse corporelle.',
        'Pour une image plus complète de votre santé, combinez l\'IMC avec d\'autres outils. Notre <a href="/fr/tools/body-fat-calculator" class="text-blue-600 underline">calculateur de masse grasse</a> offre une évaluation plus détaillée, et le <a href="/fr/tools/calorie-calculator" class="text-blue-600 underline">calculateur de calories</a> vous aide à déterminer vos besoins caloriques. Vous pouvez aussi vérifier votre <a href="/fr/tools/ideal-weight-calculator" class="text-blue-600 underline">poids idéal</a> selon votre taille.',
      ],
      faq: [
        { q: 'Comment l\'IMC est-il calculé ?', a: 'L\'IMC se calcule en divisant le poids en kilogrammes par la taille en mètres au carré. Par exemple, une personne de 70 kg mesurant 175 cm a un IMC de 70 / (1,75)^2 = 22,9.' },
        { q: 'Quelle est la plage d\'IMC saine ?', a: 'Selon l\'OMS, un IMC entre 18,5 et 24,9 est considéré comme poids normal. En dessous de 18,5 est insuffisance pondérale, 25-29,9 est surpoids et 30 ou plus est obésité.' },
        { q: 'L\'IMC est-il précis pour les sportifs ?', a: 'Non, l\'IMC peut être trompeur pour les sportifs et les personnes musclées. Le muscle étant plus dense que la graisse, ils peuvent avoir un IMC élevé avec un faible pourcentage de graisse.' },
        { q: 'L\'IMC s\'applique-t-il aux enfants ?', a: 'L\'IMC se calcule de la même façon pour les enfants, mais s\'interprète avec des percentiles par âge et sexe. Cet outil est conçu pour les adultes.' },
        { q: 'Que faire si mon IMC indique un surpoids ?', a: 'Un IMC en zone de surpoids suggère de consulter un professionnel de santé pour une évaluation complète incluant tension artérielle, cholestérol et glycémie.' },
      ],
    },
    de: {
      title: 'Kostenloser BMI-Rechner – Berechnen Sie Ihren Body-Mass-Index Online',
      paragraphs: [
        'Der Body-Mass-Index (BMI) ist ein einfaches, weit verbreitetes Screening-Tool, das schätzt, ob eine Person ein gesundes Körpergewicht im Verhältnis zu ihrer Größe hat. Vom belgischen Mathematiker Adolphe Quetelet in den 1830er Jahren entwickelt, bleibt der BMI eine der häufigsten Methoden.',
        'Die Formel ist einfach: BMI = Gewicht (kg) / Größe (m)^2. Unser Rechner erledigt die Berechnung für Sie — geben Sie Ihr Gewicht in Kilogramm und Ihre Größe in Zentimetern ein, und Sie sehen sofort Ihren BMI mit der WHO-Klassifizierung.',
        'Obwohl der BMI als schnelles Screening-Tool nützlich ist, hat er wichtige Einschränkungen. Er unterscheidet nicht zwischen Muskelmasse und Fettmasse, sodass Sportler mit hoher Muskeldichte als übergewichtig eingestuft werden könnten.',
        'Für ein vollständigeres Bild Ihrer Gesundheit kombinieren Sie den BMI mit anderen Tools. Unser <a href="/de/tools/body-fat-calculator" class="text-blue-600 underline">Körperfett-Rechner</a> bietet eine detailliertere Bewertung, und der <a href="/de/tools/calorie-calculator" class="text-blue-600 underline">Kalorienrechner</a> hilft Ihnen, Ihren täglichen Kalorienbedarf zu bestimmen. Sie können auch Ihr <a href="/de/tools/ideal-weight-calculator" class="text-blue-600 underline">Idealgewicht</a> basierend auf Größe und Körperbau berechnen.',
      ],
      faq: [
        { q: 'Wie wird der BMI berechnet?', a: 'Der BMI wird berechnet, indem das Gewicht in Kilogramm durch die Größe in Metern zum Quadrat geteilt wird. Beispiel: Eine 70 kg schwere Person mit 175 cm hat einen BMI von 70 / (1,75)^2 = 22,9.' },
        { q: 'Was ist der gesunde BMI-Bereich?', a: 'Laut WHO gilt ein BMI zwischen 18,5 und 24,9 als Normalgewicht. Unter 18,5 ist Untergewicht, 25-29,9 ist Übergewicht und 30 oder mehr ist Adipositas.' },
        { q: 'Ist der BMI für Sportler genau?', a: 'Nein, der BMI kann für Sportler und muskulöse Menschen irreführend sein. Da Muskeln dichter als Fett sind, können sie einen hohen BMI bei niedrigem Körperfettanteil haben.' },
        { q: 'Gilt der BMI für Kinder und Jugendliche?', a: 'Der BMI wird für Kinder gleich berechnet, aber mit alters- und geschlechtsspezifischen Perzentilen interpretiert. Dieses Tool ist für Erwachsene konzipiert.' },
        { q: 'Was sollte ich tun, wenn mein BMI Übergewicht anzeigt?', a: 'Ein BMI im Übergewichtsbereich empfiehlt die Konsultation eines Gesundheitsfachmanns für eine umfassende Bewertung einschließlich Blutdruck, Cholesterin und Blutzucker.' },
      ],
    },
    pt: {
      title: 'Calculadora de IMC Grátis – Calcule Seu Índice de Massa Corporal Online',
      paragraphs: [
        'O Índice de Massa Corporal (IMC) é uma ferramenta de triagem simples e amplamente utilizada que estima se uma pessoa tem um peso corporal saudável em relação à sua altura. Desenvolvido pelo matemático belga Adolphe Quetelet na década de 1830, o IMC continua sendo um dos métodos mais comuns.',
        'A fórmula é direta: IMC = peso (kg) / altura (m)^2. Nossa calculadora faz a conta para você — basta inserir seu peso em quilogramas e altura em centímetros, e você verá instantaneamente seu IMC com a classificação da OMS.',
        'Embora o IMC seja útil como ferramenta rápida, ele tem limitações importantes. Não distingue entre massa muscular e gordura, então atletas com alta densidade muscular podem ser classificados como sobrepeso apesar de terem baixo percentual de gordura.',
        'Para uma visão mais completa da sua saúde, combine o IMC com outras ferramentas. Nossa <a href="/pt/tools/body-fat-calculator" class="text-blue-600 underline">calculadora de gordura corporal</a> oferece uma avaliação mais detalhada, e a <a href="/pt/tools/calorie-calculator" class="text-blue-600 underline">calculadora de calorias</a> ajuda a determinar suas necessidades calóricas diárias. Você também pode verificar seu <a href="/pt/tools/ideal-weight-calculator" class="text-blue-600 underline">peso ideal</a> com base na sua altura.',
      ],
      faq: [
        { q: 'Como o IMC é calculado?', a: 'O IMC é calculado dividindo o peso em quilogramas pela altura em metros ao quadrado. Por exemplo, uma pessoa de 70 kg com 175 cm tem um IMC de 70 / (1,75)^2 = 22,9.' },
        { q: 'Qual é a faixa de IMC saudável?', a: 'Segundo a OMS, um IMC entre 18,5 e 24,9 é considerado peso normal. Abaixo de 18,5 é abaixo do peso, 25-29,9 é sobrepeso e 30 ou mais é obesidade.' },
        { q: 'O IMC é preciso para atletas?', a: 'Não, o IMC pode ser enganoso para atletas e pessoas musculosas. Como o músculo é mais denso que a gordura, podem ter um IMC alto com baixo percentual de gordura corporal.' },
        { q: 'O IMC se aplica a crianças e adolescentes?', a: 'O IMC é calculado da mesma forma para crianças, mas interpretado com percentis por idade e sexo. Esta ferramenta é projetada para adultos.' },
        { q: 'O que devo fazer se meu IMC indica sobrepeso?', a: 'Um IMC na faixa de sobrepeso sugere consultar um profissional de saúde para uma avaliação completa incluindo pressão arterial, colesterol e glicemia.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="bmi-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Unit toggle */}
          <div className="flex gap-2">
            <button onClick={() => { setUnit('metric'); setWeight(''); setHeight(''); setErrors({}); }} className={`flex-1 py-2 rounded-lg font-medium text-sm ${unit === 'metric' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{labels.metric[lang]}</button>
            <button onClick={() => { setUnit('imperial'); setWeight(''); setHeight(''); setErrors({}); }} className={`flex-1 py-2 rounded-lg font-medium text-sm ${unit === 'imperial' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{labels.imperial[lang]}</button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{unit === 'metric' ? labels.weight[lang] : labels.weightLbs[lang]}</label>
            <input type="number" value={weight} onChange={(e) => { setWeight(e.target.value); validate(); }} onBlur={() => { validate(); handleCalculation(); }} placeholder={unit === 'metric' ? '70' : '154'} className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 ${errors.weight ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{unit === 'metric' ? labels.height[lang] : labels.heightIn[lang]}</label>
            <input type="number" value={height} onChange={(e) => { setHeight(e.target.value); validate(); }} onBlur={() => { validate(); handleCalculation(); }} placeholder={unit === 'metric' ? '175' : '69'} className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 ${errors.height ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
          </div>

          <div className="flex justify-end">
            <button onClick={handleReset} className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {labels.reset[lang]}
            </button>
          </div>

          {bmi > 0 && !errors.weight && !errors.height && (
            <>
              <div className={`p-5 rounded-xl ${getCategory().bg} border ${getCategory().border} text-center`}>
                <div className="text-lg mb-1">{getCategory().icon}</div>
                <div className="text-4xl font-bold text-gray-900">{bmi.toFixed(1)}</div>
                <div className={`text-lg font-semibold mt-1 ${getCategory().color}`}>{getCategory().text}</div>
              </div>

              {/* BMI Scale */}
              <div className="relative pt-2">
                <div className="flex rounded-full h-3 overflow-hidden">
                  <div className="bg-yellow-400 w-[23%]"></div>
                  <div className="bg-green-400 w-[16%]"></div>
                  <div className="bg-orange-400 w-[13%]"></div>
                  <div className="bg-red-400 flex-1"></div>
                </div>
                <div className="absolute top-0 transition-all duration-500" style={{ left: `${Math.min(Math.max((bmi / 40) * 100, 2), 98)}%` }}>
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-gray-800 -translate-x-1/2"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>18.5</span>
                  <span>25</span>
                  <span>30</span>
                  <span>40</span>
                </div>
              </div>

              {hCm > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
                  <span className="text-xl">📏</span>
                  <div>
                    <div className="text-xs text-blue-600 font-medium">{labels.healthyRange[lang]}</div>
                    <div className="text-sm font-semibold text-gray-900">{healthyWeightMin} - {healthyWeightMax} {unit === 'metric' ? 'kg' : 'lbs'}</div>
                  </div>
                </div>
              )}

              <button onClick={copyResults} className="w-full py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                {copied ? (
                  <><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{labels.copied[lang]}</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>{labels.copy[lang]}</>
                )}
              </button>
            </>
          )}

          <div className="text-xs text-gray-400 space-y-1 border-t pt-3">
            <div className="flex justify-between"><span>{'< 18.5'}</span><span className="text-yellow-600">{labels.underweight[lang]}</span></div>
            <div className="flex justify-between"><span>18.5 – 24.9</span><span className="text-green-600">{labels.normal[lang]}</span></div>
            <div className="flex justify-between"><span>25 – 29.9</span><span className="text-orange-600">{labels.overweight[lang]}</span></div>
            <div className="flex justify-between"><span>{'≥ 30'}</span><span className="text-red-600">{labels.obese[lang]}</span></div>
          </div>
        </div>

        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{labels.history[lang]}</h3>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="px-3 py-2 rounded-lg bg-gray-50 flex justify-between items-center text-sm">
                  <span className="text-gray-600">{h.weight}{h.unit === 'metric' ? 'kg' : 'lbs'} / {h.height}{h.unit === 'metric' ? 'cm' : 'in'}</span>
                  <span className="font-medium text-gray-900">BMI: {h.bmi.toFixed(1)} ({h.category})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: p }} />)}
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
