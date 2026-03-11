'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  age: { en: 'Age', it: 'Età', es: 'Edad', fr: 'Âge', de: 'Alter', pt: 'Idade' },
  gender: { en: 'Gender', it: 'Sesso', es: 'Género', fr: 'Sexe', de: 'Geschlecht', pt: 'Sexo' },
  male: { en: 'Male', it: 'Maschio', es: 'Masculino', fr: 'Homme', de: 'Männlich', pt: 'Masculino' },
  female: { en: 'Female', it: 'Femmina', es: 'Femenino', fr: 'Femme', de: 'Weiblich', pt: 'Feminino' },
  weight: { en: 'Weight (kg)', it: 'Peso (kg)', es: 'Peso (kg)', fr: 'Poids (kg)', de: 'Gewicht (kg)', pt: 'Peso (kg)' },
  height: { en: 'Height (cm)', it: 'Altezza (cm)', es: 'Altura (cm)', fr: 'Taille (cm)', de: 'Größe (cm)', pt: 'Altura (cm)' },
  activity: { en: 'Activity Level', it: 'Livello Attività', es: 'Nivel de Actividad', fr: "Niveau d'Activité", de: 'Aktivitätslevel', pt: 'Nível de Atividade' },
  sedentary: { en: 'Sedentary (little/no exercise)', it: 'Sedentario', es: 'Sedentario', fr: 'Sédentaire', de: 'Sitzend', pt: 'Sedentário' },
  light: { en: 'Light (1-3 days/week)', it: 'Leggero (1-3 giorni)', es: 'Ligero (1-3 días)', fr: 'Léger (1-3 jours)', de: 'Leicht (1-3 Tage)', pt: 'Leve (1-3 dias)' },
  moderate: { en: 'Moderate (3-5 days/week)', it: 'Moderato (3-5 giorni)', es: 'Moderado (3-5 días)', fr: 'Modéré (3-5 jours)', de: 'Mäßig (3-5 Tage)', pt: 'Moderado (3-5 dias)' },
  active: { en: 'Active (6-7 days/week)', it: 'Attivo (6-7 giorni)', es: 'Activo (6-7 días)', fr: 'Actif (6-7 jours)', de: 'Aktiv (6-7 Tage)', pt: 'Ativo (6-7 dias)' },
  veryActive: { en: 'Very Active (intense daily)', it: 'Molto Attivo (intenso)', es: 'Muy Activo (intenso)', fr: 'Très Actif (intense)', de: 'Sehr Aktiv (intensiv)', pt: 'Muito Ativo (intenso)' },
  bmr: { en: 'Basal Metabolic Rate (BMR)', it: 'Metabolismo Basale (BMR)', es: 'Metabolismo Basal (TMB)', fr: 'Métabolisme Basal (MB)', de: 'Grundumsatz (BMR)', pt: 'Metabolismo Basal (TMB)' },
  dailyCal: { en: 'Daily Calories Needed', it: 'Calorie Giornaliere', es: 'Calorías Diarias', fr: 'Calories Quotidiennes', de: 'Täglicher Kalorienbedarf', pt: 'Calorias Diárias' },
  lose: { en: 'To lose weight (~0.5 kg/week)', it: 'Per dimagrire (~0,5 kg/sett.)', es: 'Para perder peso (~0,5 kg/sem.)', fr: 'Pour perdre (~0,5 kg/sem.)', de: 'Zum Abnehmen (~0,5 kg/Wo.)', pt: 'Para emagrecer (~0,5 kg/sem.)' },
  maintain: { en: 'To maintain weight', it: 'Per mantenere il peso', es: 'Para mantener peso', fr: 'Pour maintenir le poids', de: 'Gewicht halten', pt: 'Para manter o peso' },
  gain: { en: 'To gain weight (~0.5 kg/week)', it: 'Per ingrassare (~0,5 kg/sett.)', es: 'Para ganar peso (~0,5 kg/sem.)', fr: 'Pour prendre (~0,5 kg/sem.)', de: 'Zum Zunehmen (~0,5 kg/Wo.)', pt: 'Para engordar (~0,5 kg/sem.)' },
  kcalDay: { en: 'kcal/day', it: 'kcal/giorno', es: 'kcal/día', fr: 'kcal/jour', de: 'kcal/Tag', pt: 'kcal/dia' },
};

const activityFactors = [
  { key: 'sedentary', factor: 1.2 },
  { key: 'light', factor: 1.375 },
  { key: 'moderate', factor: 1.55 },
  { key: 'active', factor: 1.725 },
  { key: 'veryActive', factor: 1.9 },
];

export default function CalorieCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['calorie-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState('moderate');

  const ageNum = parseInt(age) || 0;
  const weightNum = parseFloat(weight) || 0;
  const heightNum = parseFloat(height) || 0;
  const factor = activityFactors.find((a) => a.key === activity)?.factor || 1.55;

  let bmr = 0;
  if (ageNum > 0 && weightNum > 0 && heightNum > 0) {
    bmr = gender === 'male'
      ? 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5
      : 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
  }
  const dailyCal = Math.round(bmr * factor);

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Calorie Calculator – Find Your Daily Calorie Needs with the Mifflin-St Jeor Equation',
      paragraphs: [
        'Understanding how many calories your body needs each day is the foundation of any effective nutrition plan, whether your goal is weight loss, muscle gain, or simply maintaining a healthy weight. Our free calorie calculator uses the Mifflin-St Jeor equation, which research has shown to be the most accurate formula for estimating Basal Metabolic Rate (BMR) in most adults.',
        'Your BMR represents the number of calories your body burns at complete rest — just to keep vital functions like breathing, circulation, and cell production running. The Mifflin-St Jeor equation factors in your weight, height, age, and gender: for men it is (10 x weight) + (6.25 x height) - (5 x age) + 5, and for women the same formula minus 161 instead of plus 5.',
        'Once we have your BMR, we multiply it by an activity factor that ranges from 1.2 (sedentary) to 1.9 (very active) to calculate your Total Daily Energy Expenditure (TDEE). This is the number of calories you need to maintain your current weight. To lose weight, aim for 500 calories below your TDEE; to gain, add 500 calories.',
        'Keep in mind that calorie calculators provide estimates, not exact figures. Individual metabolism varies based on genetics, body composition, hormones, sleep quality, and stress levels. Use these numbers as a starting point and adjust based on your actual results over 2-4 weeks.',
      ],
      faq: [
        { q: 'What is the Mifflin-St Jeor equation?', a: 'The Mifflin-St Jeor equation is a formula developed in 1990 to estimate Basal Metabolic Rate (BMR). For men: BMR = (10 x weight in kg) + (6.25 x height in cm) - (5 x age) + 5. For women: BMR = (10 x weight in kg) + (6.25 x height in cm) - (5 x age) - 161. Studies have shown it to be more accurate than the older Harris-Benedict equation.' },
        { q: 'How many calories should I eat to lose weight?', a: 'To lose approximately 0.5 kg (1 pound) per week, you need a caloric deficit of about 500 calories per day below your TDEE (Total Daily Energy Expenditure). This calculator shows your maintenance calories and the recommended intake for weight loss. Never go below 1,200 calories/day for women or 1,500 for men without medical supervision.' },
        { q: 'What is the difference between BMR and TDEE?', a: 'BMR (Basal Metabolic Rate) is the calories your body needs at complete rest. TDEE (Total Daily Energy Expenditure) includes BMR plus the calories burned through physical activity, digestion, and non-exercise activity. TDEE is the number you should use for meal planning.' },
        { q: 'How accurate are online calorie calculators?', a: 'The Mifflin-St Jeor equation is accurate to within 10% for most adults. However, individual factors like muscle mass, genetics, hormones, and metabolic adaptations can cause variations. Use the calculator as a starting point and adjust based on real-world results after 2-4 weeks.' },
        { q: 'Should I eat back the calories I burn during exercise?', a: 'It depends on your goals. If you are trying to lose weight, eating back all exercise calories can slow progress. If you are maintaining or gaining, you may need those extra calories. A good middle ground is eating back about half of your exercise calories to avoid extreme deficits.' },
      ],
    },
    it: {
      title: 'Calcolatore di Calorie Gratuito – Trova il Tuo Fabbisogno Calorico con l\'Equazione di Mifflin-St Jeor',
      paragraphs: [
        'Capire quante calorie il tuo corpo necessita ogni giorno è la base di qualsiasi piano nutrizionale efficace, che il tuo obiettivo sia perdere peso, aumentare la massa muscolare o semplicemente mantenere un peso sano. Il nostro calcolatore di calorie gratuito usa l\'equazione di Mifflin-St Jeor, che la ricerca ha dimostrato essere la formula più accurata per stimare il Metabolismo Basale (BMR).',
        'Il tuo BMR rappresenta il numero di calorie che il tuo corpo brucia a riposo completo — solo per mantenere funzioni vitali come respirazione, circolazione e produzione cellulare. L\'equazione di Mifflin-St Jeor considera peso, altezza, età e sesso: per gli uomini è (10 x peso) + (6,25 x altezza) - (5 x età) + 5, per le donne la stessa formula con -161 invece di +5.',
        'Una volta calcolato il BMR, lo moltiplichiamo per un fattore di attività che va da 1,2 (sedentario) a 1,9 (molto attivo) per calcolare il Dispendio Energetico Totale Giornaliero (TDEE). Per perdere peso, punta a 500 calorie sotto il TDEE; per ingrassare, aggiungi 500 calorie.',
        'Ricorda che i calcolatori di calorie forniscono stime, non cifre esatte. Il metabolismo individuale varia in base a genetica, composizione corporea, ormoni e stress. Usa questi numeri come punto di partenza e aggiusta in base ai risultati reali.',
      ],
      faq: [
        { q: 'Cos\'è l\'equazione di Mifflin-St Jeor?', a: 'L\'equazione di Mifflin-St Jeor è una formula sviluppata nel 1990 per stimare il Metabolismo Basale (BMR). Per uomini: BMR = (10 x peso in kg) + (6,25 x altezza in cm) - (5 x età) + 5. Per donne: stessa formula con -161. Gli studi dimostrano che è più accurata della vecchia equazione di Harris-Benedict.' },
        { q: 'Quante calorie devo mangiare per dimagrire?', a: 'Per perdere circa 0,5 kg a settimana, serve un deficit calorico di circa 500 calorie al giorno sotto il TDEE. Non scendere mai sotto le 1.200 calorie/giorno per le donne o 1.500 per gli uomini senza supervisione medica.' },
        { q: 'Qual è la differenza tra BMR e TDEE?', a: 'Il BMR è le calorie necessarie a riposo completo. Il TDEE include il BMR più le calorie bruciate con l\'attività fisica e la digestione. Il TDEE è il numero da usare per pianificare i pasti.' },
        { q: 'Quanto sono accurati i calcolatori di calorie online?', a: 'L\'equazione di Mifflin-St Jeor è accurata entro il 10% per la maggior parte degli adulti. Fattori individuali come massa muscolare e genetica possono causare variazioni. Usa il calcolatore come punto di partenza.' },
        { q: 'Devo recuperare le calorie bruciate con l\'esercizio?', a: 'Dipende dai tuoi obiettivi. Se vuoi perdere peso, recuperare tutte le calorie dell\'esercizio può rallentare i progressi. Un buon compromesso è recuperare circa la metà delle calorie dell\'esercizio.' },
      ],
    },
    es: {
      title: 'Calculadora de Calorías Gratis – Encuentra Tu Necesidad Calórica con la Ecuación de Mifflin-St Jeor',
      paragraphs: [
        'Entender cuántas calorías necesita tu cuerpo cada día es la base de cualquier plan nutricional efectivo. Nuestra calculadora de calorías gratuita usa la ecuación de Mifflin-St Jeor, que la investigación ha demostrado ser la fórmula más precisa para estimar la Tasa Metabólica Basal (TMB).',
        'Tu TMB representa las calorías que tu cuerpo quema en reposo completo. La ecuación de Mifflin-St Jeor considera peso, altura, edad y sexo: para hombres es (10 x peso) + (6,25 x altura) - (5 x edad) + 5, para mujeres la misma fórmula con -161.',
        'Una vez calculada la TMB, la multiplicamos por un factor de actividad que va de 1,2 (sedentario) a 1,9 (muy activo) para calcular el Gasto Energético Total Diario (GETD). Para perder peso, apunta a 500 calorías debajo del GETD.',
        'Recuerda que las calculadoras proporcionan estimaciones. El metabolismo individual varía según genética, composición corporal y hormonas. Usa estos números como punto de partida y ajusta según tus resultados reales.',
      ],
      faq: [
        { q: '¿Qué es la ecuación de Mifflin-St Jeor?', a: 'Es una fórmula de 1990 para estimar la TMB. Para hombres: TMB = (10 x peso en kg) + (6,25 x altura en cm) - (5 x edad) + 5. Para mujeres: misma fórmula con -161. Es más precisa que la ecuación de Harris-Benedict.' },
        { q: '¿Cuántas calorías debo comer para perder peso?', a: 'Para perder ~0,5 kg por semana, necesitas un déficit de 500 calorías diarias bajo tu GETD. No bajes de 1.200 kcal/día para mujeres o 1.500 para hombres sin supervisión médica.' },
        { q: '¿Cuál es la diferencia entre TMB y GETD?', a: 'La TMB son las calorías en reposo total. El GETD incluye TMB más calorías quemadas por actividad física y digestión. El GETD es el número para planificar comidas.' },
        { q: '¿Qué tan precisas son las calculadoras de calorías?', a: 'La ecuación de Mifflin-St Jeor es precisa dentro del 10% para la mayoría de adultos. Factores individuales pueden causar variaciones. Úsala como punto de partida.' },
        { q: '¿Debo recuperar las calorías quemadas con ejercicio?', a: 'Depende de tus objetivos. Si quieres perder peso, recuperar todas las calorías puede ralentizar el progreso. Un buen punto medio es recuperar la mitad.' },
      ],
    },
    fr: {
      title: 'Calculateur de Calories Gratuit – Trouvez Vos Besoins Caloriques avec l\'Équation de Mifflin-St Jeor',
      paragraphs: [
        'Comprendre combien de calories votre corps a besoin chaque jour est la base de tout plan nutritionnel efficace. Notre calculateur de calories gratuit utilise l\'équation de Mifflin-St Jeor, la formule la plus précise pour estimer le Métabolisme Basal (MB).',
        'Votre MB représente les calories brûlées au repos complet. L\'équation de Mifflin-St Jeor prend en compte poids, taille, âge et sexe : pour les hommes (10 x poids) + (6,25 x taille) - (5 x âge) + 5, pour les femmes la même formule avec -161.',
        'Une fois le MB calculé, on le multiplie par un facteur d\'activité de 1,2 (sédentaire) à 1,9 (très actif) pour obtenir la Dépense Énergétique Totale Journalière (DETJ). Pour perdre du poids, visez 500 calories en dessous de la DETJ.',
        'N\'oubliez pas que les calculateurs fournissent des estimations. Le métabolisme individuel varie selon la génétique, la composition corporelle et les hormones. Utilisez ces chiffres comme point de départ.',
      ],
      faq: [
        { q: 'Qu\'est-ce que l\'équation de Mifflin-St Jeor ?', a: 'C\'est une formule de 1990 pour estimer le MB. Hommes : MB = (10 x poids) + (6,25 x taille) - (5 x âge) + 5. Femmes : même formule avec -161. Plus précise que l\'équation de Harris-Benedict.' },
        { q: 'Combien de calories pour perdre du poids ?', a: 'Pour perdre ~0,5 kg/semaine, il faut un déficit de 500 calories/jour sous la DETJ. Ne descendez jamais sous 1 200 kcal/jour pour les femmes ou 1 500 pour les hommes sans suivi médical.' },
        { q: 'Quelle différence entre MB et DETJ ?', a: 'Le MB représente les calories au repos. La DETJ inclut le MB plus les calories de l\'activité physique et la digestion. La DETJ est le chiffre pour planifier les repas.' },
        { q: 'Quelle est la précision des calculateurs en ligne ?', a: 'L\'équation de Mifflin-St Jeor est précise à 10% près pour la plupart des adultes. Des facteurs individuels peuvent causer des variations.' },
        { q: 'Dois-je manger les calories brûlées pendant l\'exercice ?', a: 'Cela dépend de vos objectifs. Pour perdre du poids, récupérer toutes les calories ralentit le progrès. Un bon compromis est d\'en récupérer la moitié.' },
      ],
    },
    de: {
      title: 'Kostenloser Kalorienrechner – Finden Sie Ihren Täglichen Kalorienbedarf mit der Mifflin-St-Jeor-Gleichung',
      paragraphs: [
        'Zu verstehen, wie viele Kalorien Ihr Körper täglich braucht, ist die Grundlage jedes effektiven Ernährungsplans. Unser kostenloser Kalorienrechner verwendet die Mifflin-St-Jeor-Gleichung, die von der Forschung als genaueste Formel zur Schätzung des Grundumsatzes (BMR) bestätigt wurde.',
        'Ihr BMR repräsentiert die Kalorien, die Ihr Körper in völliger Ruhe verbrennt. Die Mifflin-St-Jeor-Gleichung berücksichtigt Gewicht, Größe, Alter und Geschlecht: für Männer (10 x Gewicht) + (6,25 x Größe) - (5 x Alter) + 5, für Frauen dieselbe Formel mit -161.',
        'Nach der BMR-Berechnung multiplizieren wir mit einem Aktivitätsfaktor von 1,2 (sitzend) bis 1,9 (sehr aktiv) für den Gesamtenergieumsatz (TDEE). Zum Abnehmen 500 Kalorien unter dem TDEE anpeilen.',
        'Bedenken Sie, dass Kalorienrechner Schätzungen liefern. Der individuelle Stoffwechsel variiert je nach Genetik, Körperzusammensetzung und Hormonen. Nutzen Sie diese Zahlen als Ausgangspunkt.',
      ],
      faq: [
        { q: 'Was ist die Mifflin-St-Jeor-Gleichung?', a: 'Eine 1990 entwickelte Formel zur BMR-Schätzung. Männer: BMR = (10 x Gewicht) + (6,25 x Größe) - (5 x Alter) + 5. Frauen: gleiche Formel mit -161. Genauer als die Harris-Benedict-Gleichung.' },
        { q: 'Wie viele Kalorien zum Abnehmen?', a: 'Für ~0,5 kg/Woche Gewichtsverlust brauchen Sie ein Defizit von 500 Kalorien/Tag unter Ihrem TDEE. Gehen Sie nie unter 1.200 kcal/Tag (Frauen) oder 1.500 (Männer) ohne ärztliche Aufsicht.' },
        { q: 'Was ist der Unterschied zwischen BMR und TDEE?', a: 'BMR sind die Kalorien in völliger Ruhe. TDEE umfasst BMR plus Kalorien durch Aktivität und Verdauung. TDEE ist die Zahl für die Mahlzeitenplanung.' },
        { q: 'Wie genau sind Online-Kalorienrechner?', a: 'Die Mifflin-St-Jeor-Gleichung ist für die meisten Erwachsenen auf 10% genau. Individuelle Faktoren können Abweichungen verursachen.' },
        { q: 'Soll ich Trainingskalorien zurückessen?', a: 'Das hängt von Ihren Zielen ab. Zum Abnehmen kann das Zurückessen aller Trainingskalorien den Fortschritt verlangsamen. Ein guter Kompromiss ist, etwa die Hälfte zurückzuessen.' },
      ],
    },
    pt: {
      title: 'Calculadora de Calorias Grátis – Encontre Sua Necessidade Calórica com a Equação de Mifflin-St Jeor',
      paragraphs: [
        'Entender quantas calorias seu corpo precisa diariamente é a base de qualquer plano nutricional eficaz. Nossa calculadora de calorias gratuita usa a equação de Mifflin-St Jeor, que pesquisas demonstraram ser a fórmula mais precisa para estimar a Taxa Metabólica Basal (TMB).',
        'Sua TMB representa as calorias que seu corpo queima em repouso completo. A equação de Mifflin-St Jeor considera peso, altura, idade e sexo: para homens (10 x peso) + (6,25 x altura) - (5 x idade) + 5, para mulheres a mesma fórmula com -161.',
        'Após calcular a TMB, multiplicamos por um fator de atividade de 1,2 (sedentário) a 1,9 (muito ativo) para o Gasto Energético Total Diário (GETD). Para emagrecer, mire 500 calorias abaixo do GETD.',
        'Lembre-se que calculadoras fornecem estimativas. O metabolismo individual varia conforme genética, composição corporal e hormônios. Use esses números como ponto de partida.',
      ],
      faq: [
        { q: 'O que é a equação de Mifflin-St Jeor?', a: 'É uma fórmula de 1990 para estimar a TMB. Homens: TMB = (10 x peso) + (6,25 x altura) - (5 x idade) + 5. Mulheres: mesma fórmula com -161. Mais precisa que a equação de Harris-Benedict.' },
        { q: 'Quantas calorias para emagrecer?', a: 'Para perder ~0,5 kg/semana, precisa de um déficit de 500 calorias/dia abaixo do GETD. Nunca fique abaixo de 1.200 kcal/dia (mulheres) ou 1.500 (homens) sem acompanhamento médico.' },
        { q: 'Qual a diferença entre TMB e GETD?', a: 'TMB são as calorias em repouso total. GETD inclui TMB mais calorias da atividade física e digestão. GETD é o número para planejar refeições.' },
        { q: 'Quão precisas são as calculadoras online?', a: 'A equação de Mifflin-St Jeor é precisa dentro de 10% para a maioria dos adultos. Fatores individuais podem causar variações.' },
        { q: 'Devo repor as calorias queimadas no exercício?', a: 'Depende dos seus objetivos. Para emagrecer, repor todas as calorias pode desacelerar o progresso. Um bom meio-termo é repor cerca da metade.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="calorie-calculator">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('gender')}</label>
            <div className="flex gap-2">
              {(['male', 'female'] as const).map((g) => (
                <button key={g} onClick={() => setGender(g)}
                  className={`flex-1 py-2 rounded-lg font-medium ${gender === g ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {t(g)}
                </button>
              ))}
            </div>
          </div>

          {[
            { key: 'age', value: age, setter: setAge },
            { key: 'weight', value: weight, setter: setWeight },
            { key: 'height', value: height, setter: setHeight },
          ].map(({ key, value, setter }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(key)}</label>
              <input type="number" value={value} onChange={(e) => setter(e.target.value)} placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('activity')}</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {activityFactors.map((a) => (
                <option key={a.key} value={a.key}>{t(a.key)}</option>
              ))}
            </select>
          </div>

          {bmr > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('bmr')}</span>
                <span className="font-semibold">{Math.round(bmr)} {t('kcalDay')}</span>
              </div>
              <hr className="border-blue-200" />
              <div className="flex justify-between">
                <span className="text-gray-600">{t('lose')}</span>
                <span className="font-semibold text-green-600">{dailyCal - 500} {t('kcalDay')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('maintain')}</span>
                <span className="font-bold text-blue-600 text-lg">{dailyCal} {t('kcalDay')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('gain')}</span>
                <span className="font-semibold text-orange-600">{dailyCal + 500} {t('kcalDay')}</span>
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
