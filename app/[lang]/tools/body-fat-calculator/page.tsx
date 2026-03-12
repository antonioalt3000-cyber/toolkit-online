'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type HistoryEntry = { bodyFat: number; category: string; fatMass: number; leanMass: number };

export default function BodyFatCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['body-fat-calculator'][lang];

  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [height, setHeight] = useState('');
  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [weight, setWeight] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toMetric = (val: string, isHeight = false) => {
    const v = parseFloat(val) || 0;
    return unit === 'imperial' ? (isHeight ? v * 2.54 : v * 2.54) : v;
  };
  const toMetricWeight = (val: string) => {
    const v = parseFloat(val) || 0;
    return unit === 'imperial' ? v * 0.453592 : v;
  };

  const h = toMetric(height, true);
  const n = toMetric(neck);
  const w = toMetric(waist);
  const hi = toMetric(hip);
  const wt = toMetricWeight(weight);

  let bodyFat = 0;
  let valid = false;

  if (gender === 'male' && h > 0 && n > 0 && w > 0 && w > n) {
    bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
    valid = true;
  } else if (gender === 'female' && h > 0 && n > 0 && w > 0 && hi > 0 && (w + hi - n) > 0) {
    bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(w + hi - n) + 0.22100 * Math.log10(h)) - 450;
    valid = true;
  }

  bodyFat = Math.max(0, Math.min(bodyFat, 60));
  const fatMass = valid && wt > 0 ? (bodyFat / 100) * wt : 0;
  const leanMass = valid && wt > 0 ? wt - fatMass : 0;

  const getCategory = () => {
    if (gender === 'male') {
      if (bodyFat < 6) return { key: 'essential', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: '🔴' };
      if (bodyFat < 14) return { key: 'athletic', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: '💪' };
      if (bodyFat < 18) return { key: 'fit', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: '✅' };
      if (bodyFat < 25) return { key: 'average', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '📊' };
      return { key: 'obese', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: '⚠️' };
    } else {
      if (bodyFat < 14) return { key: 'essential', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: '🔴' };
      if (bodyFat < 21) return { key: 'athletic', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: '💪' };
      if (bodyFat < 25) return { key: 'fit', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: '✅' };
      if (bodyFat < 32) return { key: 'average', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '📊' };
      return { key: 'obese', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: '⚠️' };
    }
  };

  const labels = {
    height: { en: 'Height (cm)', it: 'Altezza (cm)', es: 'Altura (cm)', fr: 'Taille (cm)', de: 'Größe (cm)', pt: 'Altura (cm)' },
    heightIn: { en: 'Height (inches)', it: 'Altezza (pollici)', es: 'Altura (pulgadas)', fr: 'Taille (pouces)', de: 'Größe (Zoll)', pt: 'Altura (polegadas)' },
    gender: { en: 'Gender', it: 'Sesso', es: 'Género', fr: 'Sexe', de: 'Geschlecht', pt: 'Sexo' },
    male: { en: 'Male', it: 'Maschio', es: 'Masculino', fr: 'Homme', de: 'Männlich', pt: 'Masculino' },
    female: { en: 'Female', it: 'Femmina', es: 'Femenino', fr: 'Femme', de: 'Weiblich', pt: 'Feminino' },
    neck: { en: 'Neck (cm)', it: 'Collo (cm)', es: 'Cuello (cm)', fr: 'Cou (cm)', de: 'Hals (cm)', pt: 'Pescoço (cm)' },
    neckIn: { en: 'Neck (inches)', it: 'Collo (pollici)', es: 'Cuello (pulgadas)', fr: 'Cou (pouces)', de: 'Hals (Zoll)', pt: 'Pescoço (polegadas)' },
    waist: { en: 'Waist (cm)', it: 'Vita (cm)', es: 'Cintura (cm)', fr: 'Tour de taille (cm)', de: 'Taille (cm)', pt: 'Cintura (cm)' },
    waistIn: { en: 'Waist (inches)', it: 'Vita (pollici)', es: 'Cintura (pulgadas)', fr: 'Tour de taille (pouces)', de: 'Taille (Zoll)', pt: 'Cintura (polegadas)' },
    hip: { en: 'Hip (cm)', it: 'Fianchi (cm)', es: 'Cadera (cm)', fr: 'Hanches (cm)', de: 'Hüfte (cm)', pt: 'Quadril (cm)' },
    hipIn: { en: 'Hip (inches)', it: 'Fianchi (pollici)', es: 'Cadera (pulgadas)', fr: 'Hanches (pouces)', de: 'Hüfte (Zoll)', pt: 'Quadril (polegadas)' },
    weight: { en: 'Weight (kg)', it: 'Peso (kg)', es: 'Peso (kg)', fr: 'Poids (kg)', de: 'Gewicht (kg)', pt: 'Peso (kg)' },
    weightLbs: { en: 'Weight (lbs)', it: 'Peso (lbs)', es: 'Peso (lbs)', fr: 'Poids (lbs)', de: 'Gewicht (lbs)', pt: 'Peso (lbs)' },
    bodyFat: { en: 'Body Fat', it: 'Grasso corporeo', es: 'Grasa corporal', fr: 'Graisse corporelle', de: 'Körperfett', pt: 'Gordura corporal' },
    fatMass: { en: 'Fat Mass', it: 'Massa grassa', es: 'Masa grasa', fr: 'Masse grasse', de: 'Fettmasse', pt: 'Massa gorda' },
    leanMass: { en: 'Lean Mass', it: 'Massa magra', es: 'Masa magra', fr: 'Masse maigre', de: 'Magermasse', pt: 'Massa magra' },
    essential: { en: 'Essential Fat', it: 'Grasso essenziale', es: 'Grasa esencial', fr: 'Graisse essentielle', de: 'Essentielles Fett', pt: 'Gordura essencial' },
    athletic: { en: 'Athletic', it: 'Atletico', es: 'Atlético', fr: 'Athlétique', de: 'Athletisch', pt: 'Atlético' },
    fit: { en: 'Fit', it: 'In forma', es: 'En forma', fr: 'En forme', de: 'Fit', pt: 'Em forma' },
    average: { en: 'Average', it: 'Nella media', es: 'Promedio', fr: 'Moyen', de: 'Durchschnittlich', pt: 'Médio' },
    obese: { en: 'Obese', it: 'Obeso', es: 'Obeso', fr: 'Obèse', de: 'Adipös', pt: 'Obeso' },
    metricLabel: { en: 'Metric (cm/kg)', it: 'Metrico (cm/kg)', es: 'Métrico (cm/kg)', fr: 'Métrique (cm/kg)', de: 'Metrisch (cm/kg)', pt: 'Métrico (cm/kg)' },
    imperialLabel: { en: 'Imperial (in/lbs)', it: 'Imperiale (in/lbs)', es: 'Imperial (in/lbs)', fr: 'Impérial (in/lbs)', de: 'Imperial (in/lbs)', pt: 'Imperial (in/lbs)' },
    reset: { en: 'Reset', it: 'Resetta', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
    copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié!', de: 'Kopiert!', pt: 'Copiado!' },
    historyLabel: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
    invalidValue: { en: 'Enter a positive number', it: 'Inserisci un numero positivo', es: 'Ingresa un número positivo', fr: 'Entrez un nombre positif', de: 'Positive Zahl eingeben', pt: 'Insira um número positivo' },
  } as Record<string, Record<Locale, string>>;

  const handleReset = () => {
    setHeight(''); setNeck(''); setWaist(''); setHip(''); setWeight(''); setErrors({});
  };

  const addToHistory = () => {
    if (valid) {
      const cat = getCategory();
      setHistory(prev => [{ bodyFat, category: labels[cat.key][lang], fatMass, leanMass }, ...prev].slice(0, 5));
    }
  };

  const copyResults = () => {
    const cat = getCategory();
    const text = `${labels.bodyFat[lang]}: ${bodyFat.toFixed(1)}% (${labels[cat.key][lang]})\n${labels.fatMass[lang]}: ${fatMass.toFixed(1)} kg\n${labels.leanMass[lang]}: ${leanMass.toFixed(1)} kg`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputField = (key: string, value: string, setter: (v: string) => void, placeholder: string) => {
    const metricKey = key;
    const imperialKey = key + 'In';
    const label = unit === 'imperial' && labels[imperialKey] ? labels[imperialKey][lang] : labels[metricKey][lang];
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input type="number" value={value} onChange={(e) => { setter(e.target.value); if (errors[key]) setErrors(prev => { const n = {...prev}; delete n[key]; return n; }); }} onBlur={addToHistory} placeholder={placeholder} className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 ${errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
        {errors[key] && <p className="text-red-500 text-sm mt-1">{errors[key]}</p>}
      </div>
    );
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: { title: 'Free Body Fat Calculator – Estimate Your Body Fat Percentage Online', paragraphs: ['Body fat percentage is one of the most meaningful indicators of overall health and fitness. Unlike BMI, which only considers weight and height, body fat percentage tells you exactly how much of your body is composed of fat versus lean tissue like muscle, bone, and organs. Our calculator uses the U.S. Navy method, a well-validated circumference-based formula.','The U.S. Navy method requires just a few simple measurements: neck circumference, waist circumference, and for women, hip circumference, along with your height. The formula uses logarithmic calculations to estimate body fat percentage with surprising accuracy. Studies have shown it correlates well with more expensive methods like hydrostatic weighing and DEXA scans.','Understanding your body fat category is essential. For men, essential fat is 2-5%, athletic is 6-13%, fit is 14-17%, average is 18-24%, and obese is 25% or higher. For women, the ranges are higher: essential fat is 10-13%, athletic is 14-20%, fit is 21-24%, average is 25-31%, and obese is 32% or higher. Women naturally carry more body fat due to hormonal and reproductive functions.','Our calculator also shows your fat mass and lean mass in kilograms when you enter your weight. This breakdown helps you set realistic fitness goals. For instance, if you want to reduce body fat, knowing your lean mass helps determine how much weight you can safely lose. Always consult a fitness professional or healthcare provider before making significant changes to your diet or exercise routine.'], faq: [{ q: 'How does the US Navy body fat method work?', a: 'The US Navy method estimates body fat using circumference measurements. For men, it uses neck and waist measurements with height. For women, it adds hip circumference. The formula applies logarithmic calculations to these measurements to estimate body fat percentage. It has been validated against more expensive methods like DEXA scans.' },{ q: 'How accurate is the US Navy body fat calculator?', a: 'The US Navy method is generally accurate within 3-4% of more precise methods like DEXA scans or hydrostatic weighing. It works best for people with average body compositions. For very lean athletes or very obese individuals, the margin of error may be slightly larger.' },{ q: 'What is a healthy body fat percentage?', a: 'For men, a healthy body fat range is typically 10-20%. For women, it is 18-28%. Athletes may have lower percentages (6-13% for men, 14-20% for women). Essential fat levels (below 5% for men, below 13% for women) are necessary for basic physiological functions and should not be targeted.' },{ q: 'Why do women have higher body fat percentages than men?', a: 'Women naturally carry more body fat due to estrogen, which promotes fat storage for reproductive functions. Essential fat for women includes fat in breasts, hips, and thighs that supports pregnancy and hormone production. This is why healthy ranges are approximately 8-10% higher for women than men.' },{ q: 'How should I measure my waist and neck for this calculator?', a: 'Measure your neck just below the larynx (Adam\'s apple) with the tape sloping slightly downward to the front. Measure your waist at the narrowest point, typically at the navel level for men. For women, also measure hips at the widest point. Use a flexible tape measure and keep it snug but not tight.' }] },
    it: { title: 'Calcolatore Grasso Corporeo Gratuito – Stima la Tua Percentuale di Grasso Online', paragraphs: ['La percentuale di grasso corporeo è uno degli indicatori più significativi di salute e forma fisica. A differenza del BMI, che considera solo peso e altezza, la percentuale di grasso corporeo ti dice esattamente quanta parte del tuo corpo è composta da grasso rispetto al tessuto magro. Il nostro calcolatore utilizza il metodo della Marina USA, una formula ben validata basata sulle circonferenze.','Il metodo della Marina USA richiede solo alcune semplici misurazioni: circonferenza del collo, della vita e, per le donne, dei fianchi, insieme all\'altezza. La formula usa calcoli logaritmici per stimare la percentuale di grasso corporeo con sorprendente accuratezza.','Comprendere la tua categoria di grasso corporeo è essenziale. Per gli uomini, il grasso essenziale è 2-5%, atletico 6-13%, in forma 14-17%, nella media 18-24% e obeso 25% o più. Per le donne i range sono più alti: essenziale 10-13%, atletico 14-20%, in forma 21-24%, nella media 25-31% e obeso 32% o più.','Il nostro calcolatore mostra anche la massa grassa e magra in chilogrammi quando inserisci il peso. Questa suddivisione ti aiuta a fissare obiettivi di fitness realistici. Consulta sempre un professionista prima di apportare cambiamenti significativi alla dieta o all\'esercizio fisico.'], faq: [{ q: 'Come funziona il metodo della Marina USA per il grasso corporeo?', a: 'Il metodo della Marina USA stima il grasso corporeo usando misurazioni delle circonferenze. Per gli uomini usa collo e vita con l\'altezza. Per le donne aggiunge la circonferenza dei fianchi. La formula applica calcoli logaritmici a queste misurazioni.' },{ q: 'Quanto è accurato il calcolatore del grasso corporeo?', a: 'Il metodo della Marina USA è generalmente accurato entro il 3-4% rispetto a metodi più precisi come la DEXA. Funziona meglio per persone con composizioni corporee nella media.' },{ q: 'Qual è una percentuale di grasso corporeo sana?', a: 'Per gli uomini, un range sano è tipicamente 10-20%. Per le donne, 18-28%. Gli atleti possono avere percentuali più basse (6-13% uomini, 14-20% donne).' },{ q: 'Perché le donne hanno percentuali di grasso più alte degli uomini?', a: 'Le donne portano naturalmente più grasso corporeo a causa degli estrogeni, che promuovono l\'accumulo di grasso per le funzioni riproduttive. Questo è il motivo per cui i range sani sono circa 8-10% più alti per le donne.' },{ q: 'Come devo misurare vita e collo per questo calcolatore?', a: 'Misura il collo appena sotto la laringe con il metro leggermente inclinato verso il basso. Misura la vita nel punto più stretto, tipicamente all\'altezza dell\'ombelico. Per le donne, misura anche i fianchi nel punto più largo.' }] },
    es: { title: 'Calculadora de Grasa Corporal Gratis – Estima Tu Porcentaje de Grasa Online', paragraphs: ['El porcentaje de grasa corporal es uno de los indicadores más significativos de salud y condición física. A diferencia del IMC, que solo considera peso y altura, el porcentaje de grasa corporal te dice exactamente cuánto de tu cuerpo está compuesto por grasa versus tejido magro. Nuestra calculadora utiliza el método de la Marina de EE.UU.','El método de la Marina de EE.UU. requiere solo unas pocas mediciones simples: circunferencia del cuello, cintura y, para mujeres, cadera, junto con la altura. La fórmula usa cálculos logarítmicos para estimar el porcentaje de grasa corporal con sorprendente precisión.','Para hombres, la grasa esencial es 2-5%, atlético 6-13%, en forma 14-17%, promedio 18-24% y obeso 25% o más. Para mujeres: esencial 10-13%, atlético 14-20%, en forma 21-24%, promedio 25-31% y obeso 32% o más.','Nuestra calculadora también muestra tu masa grasa y masa magra en kilogramos. Este desglose te ayuda a establecer objetivos de fitness realistas. Consulta siempre a un profesional antes de hacer cambios significativos en tu dieta o rutina de ejercicios.'], faq: [{ q: '¿Cómo funciona el método de la Marina de EE.UU.?', a: 'El método estima la grasa corporal usando mediciones de circunferencia. Para hombres usa cuello y cintura con la altura. Para mujeres agrega la circunferencia de cadera. La fórmula aplica cálculos logarítmicos a estas mediciones.' },{ q: '¿Qué tan precisa es esta calculadora?', a: 'El método de la Marina de EE.UU. es generalmente preciso dentro del 3-4% respecto a métodos más precisos como la DEXA. Funciona mejor para personas con composiciones corporales promedio.' },{ q: '¿Cuál es un porcentaje de grasa corporal saludable?', a: 'Para hombres, un rango saludable es típicamente 10-20%. Para mujeres, 18-28%. Los atletas pueden tener porcentajes más bajos.' },{ q: '¿Por qué las mujeres tienen mayor porcentaje de grasa?', a: 'Las mujeres llevan naturalmente más grasa corporal debido al estrógeno, que promueve el almacenamiento de grasa para funciones reproductivas.' },{ q: '¿Cómo debo medir mi cintura y cuello?', a: 'Mide el cuello justo debajo de la laringe. Mide la cintura en el punto más estrecho, típicamente a la altura del ombligo. Para mujeres, mide también la cadera en el punto más ancho.' }] },
    fr: { title: 'Calculateur de Graisse Corporelle Gratuit – Estimez Votre Pourcentage en Ligne', paragraphs: ['Le pourcentage de graisse corporelle est l\'un des indicateurs les plus significatifs de santé et de forme physique. Contrairement à l\'IMC, qui ne considère que le poids et la taille, le pourcentage de graisse corporelle vous dit exactement combien de votre corps est composé de graisse. Notre calculateur utilise la méthode de la Marine américaine.','La méthode de la Marine américaine nécessite quelques mesures simples : tour de cou, tour de taille et, pour les femmes, tour de hanches, ainsi que la taille. La formule utilise des calculs logarithmiques pour estimer le pourcentage de graisse corporelle.','Pour les hommes, la graisse essentielle est de 2-5%, athlétique 6-13%, en forme 14-17%, moyen 18-24% et obèse 25% ou plus. Pour les femmes : essentielle 10-13%, athlétique 14-20%, en forme 21-24%, moyen 25-31% et obèse 32% ou plus.','Notre calculateur affiche également votre masse grasse et maigre en kilogrammes. Cette répartition vous aide à fixer des objectifs de fitness réalistes. Consultez toujours un professionnel avant de modifier significativement votre régime ou exercice.'], faq: [{ q: 'Comment fonctionne la méthode de la Marine américaine ?', a: 'La méthode estime la graisse corporelle à partir de mesures de circonférence. Pour les hommes : cou et taille avec la hauteur. Pour les femmes : on ajoute le tour de hanches. La formule applique des calculs logarithmiques.' },{ q: 'Quelle est la précision de ce calculateur ?', a: 'La méthode est généralement précise à 3-4% près par rapport à des méthodes plus précises comme la DEXA. Elle fonctionne mieux pour les personnes de composition corporelle moyenne.' },{ q: 'Quel est un pourcentage de graisse corporelle sain ?', a: 'Pour les hommes, une fourchette saine est typiquement 10-20%. Pour les femmes, 18-28%. Les athlètes peuvent avoir des pourcentages plus bas.' },{ q: 'Pourquoi les femmes ont-elles plus de graisse corporelle ?', a: 'Les femmes portent naturellement plus de graisse corporelle en raison des œstrogènes, qui favorisent le stockage des graisses pour les fonctions reproductives.' },{ q: 'Comment mesurer mon tour de taille et de cou ?', a: 'Mesurez le cou juste en dessous du larynx. Mesurez la taille au point le plus étroit, typiquement au niveau du nombril. Pour les femmes, mesurez aussi les hanches au point le plus large.' }] },
    de: { title: 'Kostenloser Körperfett-Rechner – Schätzen Sie Ihren Körperfettanteil Online', paragraphs: ['Der Körperfettanteil ist einer der aussagekräftigsten Indikatoren für Gesundheit und Fitness. Im Gegensatz zum BMI, der nur Gewicht und Größe berücksichtigt, sagt Ihnen der Körperfettanteil genau, wie viel Ihres Körpers aus Fett besteht. Unser Rechner verwendet die US-Navy-Methode, eine gut validierte umfangsbasierte Formel.','Die US-Navy-Methode erfordert nur wenige einfache Messungen: Hals-, Taillen- und bei Frauen Hüftumfang zusammen mit der Körpergröße. Die Formel verwendet logarithmische Berechnungen zur Schätzung des Körperfettanteils.','Für Männer: essentielles Fett 2-5%, athletisch 6-13%, fit 14-17%, durchschnittlich 18-24% und adipös 25% oder mehr. Für Frauen: essentiell 10-13%, athletisch 14-20%, fit 21-24%, durchschnittlich 25-31% und adipös 32% oder mehr.','Unser Rechner zeigt auch Ihre Fett- und Magermasse in Kilogramm. Diese Aufschlüsselung hilft Ihnen, realistische Fitnessziele zu setzen. Konsultieren Sie immer einen Fachmann, bevor Sie Ihre Ernährung oder Ihr Training wesentlich ändern.'], faq: [{ q: 'Wie funktioniert die US-Navy-Methode?', a: 'Die Methode schätzt den Körperfettanteil anhand von Umfangsmessungen. Für Männer werden Hals- und Taillenumfang mit der Größe verwendet. Für Frauen kommt der Hüftumfang hinzu.' },{ q: 'Wie genau ist dieser Rechner?', a: 'Die US-Navy-Methode ist im Allgemeinen auf 3-4% genau im Vergleich zu präziseren Methoden wie DEXA. Sie funktioniert am besten für Personen mit durchschnittlicher Körperzusammensetzung.' },{ q: 'Was ist ein gesunder Körperfettanteil?', a: 'Für Männer liegt ein gesunder Bereich typischerweise bei 10-20%. Für Frauen bei 18-28%. Sportler können niedrigere Werte haben.' },{ q: 'Warum haben Frauen einen höheren Körperfettanteil?', a: 'Frauen tragen natürlich mehr Körperfett aufgrund von Östrogen, das die Fettspeicherung für reproduktive Funktionen fördert.' },{ q: 'Wie messe ich Taille und Hals für diesen Rechner?', a: 'Messen Sie den Hals knapp unterhalb des Kehlkopfes. Messen Sie die Taille an der schmalsten Stelle, typischerweise auf Nabelhöhe. Für Frauen messen Sie auch die Hüfte an der breitesten Stelle.' }] },
    pt: { title: 'Calculadora de Gordura Corporal Grátis – Estime Sua Porcentagem Online', paragraphs: ['A porcentagem de gordura corporal é um dos indicadores mais significativos de saúde e condição física. Diferente do IMC, que só considera peso e altura, a porcentagem de gordura corporal diz exatamente quanto do seu corpo é composto por gordura. Nossa calculadora usa o método da Marinha dos EUA.','O método da Marinha dos EUA requer apenas algumas medições simples: circunferência do pescoço, cintura e, para mulheres, quadril, junto com a altura. A fórmula usa cálculos logarítmicos para estimar a porcentagem de gordura corporal.','Para homens: gordura essencial 2-5%, atlético 6-13%, em forma 14-17%, médio 18-24% e obeso 25% ou mais. Para mulheres: essencial 10-13%, atlético 14-20%, em forma 21-24%, médio 25-31% e obeso 32% ou mais.','Nossa calculadora também mostra sua massa gorda e magra em quilogramas. Essa divisão ajuda a definir metas de fitness realistas. Consulte sempre um profissional antes de fazer mudanças significativas na dieta ou exercícios.'], faq: [{ q: 'Como funciona o método da Marinha dos EUA?', a: 'O método estima a gordura corporal usando medições de circunferência. Para homens usa pescoço e cintura com a altura. Para mulheres adiciona a circunferência do quadril.' },{ q: 'Qual a precisão desta calculadora?', a: 'O método da Marinha dos EUA é geralmente preciso dentro de 3-4% em relação a métodos mais precisos como DEXA. Funciona melhor para pessoas com composição corporal média.' },{ q: 'Qual é uma porcentagem de gordura corporal saudável?', a: 'Para homens, uma faixa saudável é tipicamente 10-20%. Para mulheres, 18-28%. Atletas podem ter porcentagens mais baixas.' },{ q: 'Por que mulheres têm maior porcentagem de gordura?', a: 'Mulheres carregam naturalmente mais gordura corporal devido ao estrogênio, que promove o armazenamento de gordura para funções reprodutivas.' },{ q: 'Como devo medir minha cintura e pescoço?', a: 'Meça o pescoço logo abaixo da laringe. Meça a cintura no ponto mais estreito, tipicamente na altura do umbigo. Para mulheres, meça também o quadril no ponto mais largo.' }] },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="body-fat-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Unit toggle */}
          <div className="flex gap-2">
            <button onClick={() => { setUnit('metric'); handleReset(); }} className={`flex-1 py-2 rounded-lg font-medium text-sm ${unit === 'metric' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{labels.metricLabel[lang]}</button>
            <button onClick={() => { setUnit('imperial'); handleReset(); }} className={`flex-1 py-2 rounded-lg font-medium text-sm ${unit === 'imperial' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{labels.imperialLabel[lang]}</button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.gender[lang]}</label>
            <div className="flex gap-3">
              <button onClick={() => setGender('male')} className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${gender === 'male' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{labels.male[lang]}</button>
              <button onClick={() => setGender('female')} className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${gender === 'female' ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{labels.female[lang]}</button>
            </div>
          </div>

          {inputField('height', height, setHeight, unit === 'metric' ? '175' : '69')}
          {inputField('neck', neck, setNeck, unit === 'metric' ? '38' : '15')}
          {inputField('waist', waist, setWaist, unit === 'metric' ? '85' : '33')}
          {gender === 'female' && inputField('hip', hip, setHip, unit === 'metric' ? '95' : '37')}
          {inputField('weight', weight, setWeight, unit === 'metric' ? '75' : '165')}

          <div className="flex justify-end">
            <button onClick={handleReset} className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {labels.reset[lang]}
            </button>
          </div>

          {valid && (
            <div className="space-y-3 mt-4">
              <div className={`p-5 rounded-xl ${getCategory().bg} border ${getCategory().border} text-center`}>
                <div className="text-2xl mb-1">{getCategory().icon}</div>
                <div className="text-4xl font-bold text-gray-900">{bodyFat.toFixed(1)}%</div>
                <div className={`text-lg font-semibold mt-1 ${getCategory().color}`}>{labels[getCategory().key][lang]}</div>
              </div>

              {/* Body fat progress bar */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min((bodyFat / 50) * 100, 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
              </div>

              {wt > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                    <span className="text-2xl">🔥</span>
                    <div className="text-xs text-orange-600 font-medium mt-1">{labels.fatMass[lang]}</div>
                    <div className="text-xl font-bold text-gray-900">{fatMass.toFixed(1)} kg</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <span className="text-2xl">💪</span>
                    <div className="text-xs text-green-600 font-medium mt-1">{labels.leanMass[lang]}</div>
                    <div className="text-xl font-bold text-gray-900">{leanMass.toFixed(1)} kg</div>
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
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{labels.historyLabel[lang]}</h3>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="px-3 py-2 rounded-lg bg-gray-50 flex justify-between items-center text-sm">
                  <span className="text-gray-600">{h.bodyFat.toFixed(1)}% - {h.category}</span>
                  <span className="font-medium text-gray-900">{h.fatMass.toFixed(1)}kg / {h.leanMass.toFixed(1)}kg</span>
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
