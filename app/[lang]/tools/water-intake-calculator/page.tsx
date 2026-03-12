'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function WaterIntakeCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['water-intake-calculator'][lang];

  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('moderate');
  const [climate, setClimate] = useState('temperate');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ weight: string; result: string }[]>([]);
  const [touched, setTouched] = useState(false);

  const rawWeight = parseFloat(weight) || 0;
  const w = unitSystem === 'imperial' ? rawWeight * 0.453592 : rawWeight;

  const activityMultiplier: Record<string, number> = {
    sedentary: 0.033, light: 0.037, moderate: 0.04, active: 0.044, veryActive: 0.048,
  };

  const climateMultiplier: Record<string, number> = {
    cold: 0.9, temperate: 1.0, hot: 1.15, veryHot: 1.3,
  };

  const baseLiters = w * (activityMultiplier[activity] || 0.04);
  const totalLiters = baseLiters * (climateMultiplier[climate] || 1.0);
  const totalOz = totalLiters * 33.814;
  const glasses = Math.ceil(totalLiters / 0.25);
  const hasResult = w >= 30 && w <= 250;
  const weightError = touched && weight !== '' && (rawWeight <= 0 || w < 20 || w > 300);

  const labels = {
    weight: { en: 'Weight', it: 'Peso', es: 'Peso', fr: 'Poids', de: 'Gewicht', pt: 'Peso' },
    kg: { en: 'kg', it: 'kg', es: 'kg', fr: 'kg', de: 'kg', pt: 'kg' },
    lbs: { en: 'lbs', it: 'lbs', es: 'lbs', fr: 'lbs', de: 'lbs', pt: 'lbs' },
    metric: { en: 'Metric (kg)', it: 'Metrico (kg)', es: 'Métrico (kg)', fr: 'Métrique (kg)', de: 'Metrisch (kg)', pt: 'Métrico (kg)' },
    imperial: { en: 'Imperial (lbs)', it: 'Imperiale (lbs)', es: 'Imperial (lbs)', fr: 'Impérial (lbs)', de: 'Imperial (lbs)', pt: 'Imperial (lbs)' },
    activity: { en: 'Activity Level', it: 'Livello di attività', es: 'Nivel de actividad', fr: 'Niveau d\'activité', de: 'Aktivitätsniveau', pt: 'Nível de atividade' },
    climate: { en: 'Climate', it: 'Clima', es: 'Clima', fr: 'Climat', de: 'Klima', pt: 'Clima' },
    sedentary: { en: 'Sedentary', it: 'Sedentario', es: 'Sedentario', fr: 'Sédentaire', de: 'Sitzend', pt: 'Sedentário' },
    light: { en: 'Light Exercise', it: 'Esercizio leggero', es: 'Ejercicio ligero', fr: 'Exercice léger', de: 'Leichte Bewegung', pt: 'Exercício leve' },
    moderate: { en: 'Moderate Exercise', it: 'Esercizio moderato', es: 'Ejercicio moderado', fr: 'Exercice modéré', de: 'Moderate Bewegung', pt: 'Exercício moderado' },
    active: { en: 'Active / Sports', it: 'Attivo / Sport', es: 'Activo / Deportes', fr: 'Actif / Sport', de: 'Aktiv / Sport', pt: 'Ativo / Esportes' },
    veryActive: { en: 'Very Active / Athlete', it: 'Molto attivo / Atleta', es: 'Muy activo / Atleta', fr: 'Très actif / Athlète', de: 'Sehr aktiv / Sportler', pt: 'Muito ativo / Atleta' },
    cold: { en: 'Cold', it: 'Freddo', es: 'Frío', fr: 'Froid', de: 'Kalt', pt: 'Frio' },
    temperate: { en: 'Temperate', it: 'Temperato', es: 'Templado', fr: 'Tempéré', de: 'Gemäßigt', pt: 'Temperado' },
    hot: { en: 'Hot', it: 'Caldo', es: 'Caluroso', fr: 'Chaud', de: 'Heiß', pt: 'Quente' },
    veryHot: { en: 'Very Hot / Humid', it: 'Molto caldo / Umido', es: 'Muy caluroso / Húmedo', fr: 'Très chaud / Humide', de: 'Sehr heiß / Feucht', pt: 'Muito quente / Úmido' },
    dailyIntake: { en: 'Daily Water Intake', it: 'Assunzione giornaliera', es: 'Ingesta diaria', fr: 'Apport quotidien', de: 'Tägliche Wasserzufuhr', pt: 'Ingestão diária' },
    glassesPerDay: { en: 'glasses/day (250ml each)', it: 'bicchieri/giorno (250ml ciascuno)', es: 'vasos/día (250ml cada uno)', fr: 'verres/jour (250ml chacun)', de: 'Gläser/Tag (je 250ml)', pt: 'copos/dia (250ml cada)' },
    tips: { en: 'Tips', it: 'Consigli', es: 'Consejos', fr: 'Conseils', de: 'Tipps', pt: 'Dicas' },
    reset: { en: 'Reset', it: 'Reset', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Reiniciar' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    copy: { en: 'Copy Result', it: 'Copia Risultato', es: 'Copiar Resultado', fr: 'Copier le Résultat', de: 'Ergebnis Kopieren', pt: 'Copiar Resultado' },
    history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
    invalidWeight: { en: 'Enter a valid weight (30-250 kg)', it: 'Inserisci un peso valido (30-250 kg)', es: 'Ingresa un peso válido (30-250 kg)', fr: 'Entrez un poids valide (30-250 kg)', de: 'Geben Sie ein gültiges Gewicht ein (30-250 kg)', pt: 'Insira um peso válido (30-250 kg)' },
    ounces: { en: 'fl oz/day', it: 'fl oz/giorno', es: 'fl oz/día', fr: 'fl oz/jour', de: 'fl oz/Tag', pt: 'fl oz/dia' },
    hydrationLevel: { en: 'Hydration Target', it: 'Obiettivo Idratazione', es: 'Objetivo de Hidratación', fr: 'Objectif d\'Hydratation', de: 'Hydratationsziel', pt: 'Meta de Hidratação' },
  } as Record<string, Record<Locale, string>>;

  const tipsByActivity: Record<string, Record<Locale, string>> = {
    sedentary: {
      en: 'Even with low activity, staying hydrated improves focus and energy. Keep a water bottle at your desk.',
      it: 'Anche con poca attività, restare idratati migliora concentrazione ed energia. Tieni una bottiglia sulla scrivania.',
      es: 'Incluso con poca actividad, mantenerse hidratado mejora el enfoque y la energía. Mantén una botella en tu escritorio.',
      fr: 'Même avec peu d\'activité, rester hydraté améliore la concentration et l\'énergie. Gardez une bouteille sur votre bureau.',
      de: 'Auch bei geringer Aktivität verbessert Hydratation Fokus und Energie. Halten Sie eine Flasche am Schreibtisch.',
      pt: 'Mesmo com pouca atividade, manter-se hidratado melhora o foco e a energia. Mantenha uma garrafa na sua mesa.',
    },
    light: {
      en: 'Drink a glass of water before and after exercise. Spread intake evenly throughout the day.',
      it: 'Bevi un bicchiere d\'acqua prima e dopo l\'esercizio. Distribuisci l\'assunzione uniformemente durante la giornata.',
      es: 'Bebe un vaso de agua antes y después del ejercicio. Distribuye la ingesta uniformemente durante el día.',
      fr: 'Buvez un verre d\'eau avant et après l\'exercice. Répartissez l\'apport uniformément tout au long de la journée.',
      de: 'Trinken Sie vor und nach dem Training ein Glas Wasser. Verteilen Sie die Aufnahme gleichmäßig über den Tag.',
      pt: 'Beba um copo de água antes e depois do exercício. Distribua a ingestão uniformemente ao longo do dia.',
    },
    moderate: {
      en: 'With moderate exercise, increase intake around workouts. Consider electrolyte-enhanced water for sessions over 1 hour.',
      it: 'Con esercizio moderato, aumenta l\'assunzione durante gli allenamenti. Considera acqua con elettroliti per sessioni oltre 1 ora.',
      es: 'Con ejercicio moderado, aumenta la ingesta durante los entrenamientos. Considera agua con electrolitos para sesiones de más de 1 hora.',
      fr: 'Avec un exercice modéré, augmentez l\'apport pendant les entraînements. Envisagez l\'eau enrichie en électrolytes pour les séances de plus d\'1 heure.',
      de: 'Bei moderatem Training erhöhen Sie die Zufuhr rund um das Training. Erwägen Sie elektrolytreiches Wasser für Einheiten über 1 Stunde.',
      pt: 'Com exercício moderado, aumente a ingestão durante os treinos. Considere água com eletrólitos para sessões acima de 1 hora.',
    },
    active: {
      en: 'Active individuals lose significant water through sweat. Drink 500ml extra per hour of intense activity. Monitor urine color — pale yellow is ideal.',
      it: 'Le persone attive perdono molta acqua con il sudore. Bevi 500ml extra per ogni ora di attività intensa. Controlla il colore dell\'urina — giallo chiaro è ideale.',
      es: 'Las personas activas pierden mucha agua por el sudor. Bebe 500ml extra por hora de actividad intensa. Monitorea el color de la orina — amarillo pálido es ideal.',
      fr: 'Les personnes actives perdent beaucoup d\'eau par la transpiration. Buvez 500ml supplémentaires par heure d\'activité intense. Surveillez la couleur de l\'urine.',
      de: 'Aktive Menschen verlieren viel Wasser durch Schweiß. Trinken Sie 500ml extra pro Stunde intensiver Aktivität. Überwachen Sie die Urinfarbe — blassgelb ist ideal.',
      pt: 'Pessoas ativas perdem muita água pelo suor. Beba 500ml extra por hora de atividade intensa. Monitore a cor da urina — amarelo claro é ideal.',
    },
    veryActive: {
      en: 'Athletes need strategic hydration. Drink 500-750ml before, 200ml every 15min during, and 1.5x fluid lost after intense sessions. Use sports drinks for activities over 90 minutes.',
      it: 'Gli atleti necessitano di idratazione strategica. Bevi 500-750ml prima, 200ml ogni 15min durante, e 1,5x i liquidi persi dopo sessioni intense.',
      es: 'Los atletas necesitan hidratación estratégica. Bebe 500-750ml antes, 200ml cada 15min durante, y 1,5x los líquidos perdidos después de sesiones intensas.',
      fr: 'Les athlètes ont besoin d\'une hydratation stratégique. Buvez 500-750ml avant, 200ml toutes les 15min pendant, et 1,5x les fluides perdus après les séances intenses.',
      de: 'Sportler brauchen strategische Hydratation. Trinken Sie 500-750ml vorher, 200ml alle 15min während, und 1,5x der verlorenen Flüssigkeit nach intensiven Einheiten.',
      pt: 'Atletas precisam de hidratação estratégica. Beba 500-750ml antes, 200ml a cada 15min durante, e 1,5x dos líquidos perdidos após sessões intensas.',
    },
  };

  const handleReset = () => {
    setWeight('');
    setActivity('moderate');
    setClimate('temperate');
    setTouched(false);
  };

  const copyResult = () => {
    if (hasResult) {
      const text = `${totalLiters.toFixed(1)} L (${glasses} ${labels.glassesPerDay[lang]})`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Track history
  const prevWeight = useState('');
  if (hasResult && weight !== prevWeight[0]) {
    prevWeight[1](weight);
    setHistory(prev => [{ weight: `${rawWeight} ${unitSystem === 'metric' ? 'kg' : 'lbs'}`, result: `${totalLiters.toFixed(1)} L` }, ...prev].slice(0, 5));
  }

  // Progress toward 8 glasses (2L) minimum
  const hydrationPct = Math.min(100, (totalLiters / 3.5) * 100);

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: { title: 'Free Water Intake Calculator – How Much Water Should You Drink Daily?', paragraphs: ['Proper hydration is essential for nearly every bodily function, from regulating temperature and transporting nutrients to lubricating joints and removing waste. Yet many people do not drink enough water daily. Our water intake calculator provides a personalized recommendation based on your weight, activity level, and climate conditions.', 'The general guideline of "8 glasses a day" is a rough estimate that does not account for individual differences. In reality, a 60 kg sedentary person in a cool climate needs far less water than a 90 kg athlete training in hot weather. Our calculator uses a weight-based formula adjusted for activity intensity and environmental heat, providing a much more accurate recommendation.', 'Activity level significantly impacts water needs. During exercise, the body loses water through sweat at rates of 0.5 to 2 liters per hour depending on intensity and conditions. Even mild dehydration of just 2% body weight loss can reduce physical performance by up to 25% and impair cognitive function. Climate adds another layer — hot and humid environments increase sweat rates and insensible water loss through breathing.', 'Beyond the number our calculator provides, pay attention to thirst signals and urine color. Pale straw-colored urine indicates good hydration, while dark yellow suggests you need more fluids. Remember that about 20% of daily water intake comes from food, especially fruits and vegetables.'], faq: [{ q: 'How much water should I drink per day?', a: 'Water needs vary by individual. A general starting point is about 33-40ml per kilogram of body weight per day. For a 70 kg person, that is approximately 2.3-2.8 liters. This increases with exercise, hot weather, and certain health conditions.' }, { q: 'Does coffee and tea count toward daily water intake?', a: 'Yes, coffee and tea do contribute to your daily fluid intake. While caffeine has a mild diuretic effect, the net hydration from these beverages is still positive.' }, { q: 'What are signs of dehydration?', a: 'Common signs include dark yellow urine, thirst, dry mouth, fatigue, dizziness, headache, and reduced urine output. Severe dehydration can cause rapid heartbeat, sunken eyes, confusion, and fainting.' }, { q: 'Can you drink too much water?', a: 'Yes, though rare, overhydration (hyponatremia) can occur when you drink excessive amounts of water too quickly, diluting blood sodium levels.' }, { q: 'Should I drink more water when sick?', a: 'Yes, increasing fluid intake when sick is generally recommended, especially with fever, vomiting, or diarrhea.' }] },
    it: { title: 'Calcolatore Assunzione Acqua Gratuito – Quanta Acqua Dovresti Bere al Giorno?', paragraphs: ['Una corretta idratazione è essenziale per quasi ogni funzione corporea. Il nostro calcolatore fornisce una raccomandazione personalizzata basata su peso, attività e clima.', 'La linea guida di "8 bicchieri al giorno" è una stima approssimativa. Il nostro calcolatore usa una formula basata sul peso regolata per attività e temperatura.', 'Il livello di attività influisce significativamente sul fabbisogno idrico. Durante l\'esercizio, il corpo perde acqua attraverso il sudore a tassi di 0,5-2 litri all\'ora.', 'Oltre al numero fornito dal calcolatore, presta attenzione ai segnali di sete e al colore dell\'urina. Inizia la giornata con un bicchiere d\'acqua.'], faq: [{ q: 'Quanta acqua dovrei bere al giorno?', a: 'Il fabbisogno varia per individuo. Un punto di partenza è circa 33-40ml per chilogrammo di peso corporeo al giorno.' }, { q: 'Caffè e tè contano per l\'assunzione giornaliera?', a: 'Sì, caffè e tè contribuiscono all\'assunzione giornaliera di liquidi.' }, { q: 'Quali sono i segni della disidratazione?', a: 'I segni comuni includono urina giallo scuro, sete, bocca secca, stanchezza, vertigini.' }, { q: 'Si può bere troppa acqua?', a: 'Sì, anche se raro, l\'iperidratazione può verificarsi bevendo quantità eccessive troppo rapidamente.' }, { q: 'Devo bere di più quando sono malato?', a: 'Sì, aumentare l\'assunzione di liquidi quando si è malati è generalmente raccomandato.' }] },
    es: { title: 'Calculadora de Ingesta de Agua Gratis', paragraphs: ['La hidratación adecuada es esencial para casi todas las funciones corporales. Nuestro calculador proporciona una recomendación personalizada.', 'Una persona sedentaria de 60 kg necesita mucha menos agua que un atleta de 90 kg entrenando con calor.', 'El nivel de actividad impacta significativamente las necesidades de agua.', 'Presta atención a las señales de sed y al color de la orina.'], faq: [{ q: '¿Cuánta agua debo beber al día?', a: 'Un punto de partida es aproximadamente 33-40ml por kilogramo de peso corporal al día.' }, { q: '¿El café y el té cuentan?', a: 'Sí, contribuyen a la ingesta diaria de líquidos.' }, { q: '¿Cuáles son los signos de deshidratación?', a: 'Orina amarillo oscuro, sed, boca seca, fatiga, mareos.' }, { q: '¿Se puede beber demasiada agua?', a: 'Sí, aunque raro, la sobrehidratación puede ocurrir.' }, { q: '¿Debo beber más cuando estoy enfermo?', a: 'Sí, especialmente con fiebre, vómitos o diarrea.' }] },
    fr: { title: 'Calculateur d\'Apport en Eau Gratuit', paragraphs: ['Une hydratation adéquate est essentielle pour presque toutes les fonctions corporelles.', 'Une personne sédentaire de 60 kg a besoin de beaucoup moins d\'eau qu\'un athlète de 90 kg.', 'Le niveau d\'activité impacte significativement les besoins en eau.', 'Soyez attentif aux signaux de soif et à la couleur de l\'urine.'], faq: [{ q: 'Combien d\'eau dois-je boire par jour ?', a: 'Environ 33-40ml par kilogramme de poids corporel par jour.' }, { q: 'Le café et le thé comptent-ils ?', a: 'Oui, ils contribuent à l\'apport quotidien en liquides.' }, { q: 'Quels sont les signes de déshydratation ?', a: 'Urine foncée, soif, bouche sèche, fatigue, vertiges.' }, { q: 'Peut-on boire trop d\'eau ?', a: 'Oui, bien que rare, la surhydratation peut survenir.' }, { q: 'Dois-je boire plus quand je suis malade ?', a: 'Oui, surtout en cas de fièvre, vomissements ou diarrhée.' }] },
    de: { title: 'Kostenloser Wasserzufuhr-Rechner', paragraphs: ['Ausreichende Hydratation ist für fast jede Körperfunktion essentiell.', 'Eine 60 kg schwere sitzende Person braucht weit weniger Wasser als ein 90 kg schwerer Sportler.', 'Das Aktivitätsniveau beeinflusst den Wasserbedarf erheblich.', 'Achten Sie auf Durstsignale und Urinfarbe.'], faq: [{ q: 'Wie viel Wasser pro Tag?', a: 'Etwa 33-40ml pro Kilogramm Körpergewicht pro Tag.' }, { q: 'Zählen Kaffee und Tee?', a: 'Ja, sie tragen zur täglichen Flüssigkeitszufuhr bei.' }, { q: 'Was sind Anzeichen von Dehydrierung?', a: 'Dunkelgelber Urin, Durst, trockener Mund, Müdigkeit.' }, { q: 'Kann man zu viel trinken?', a: 'Ja, obwohl selten, kann Überhydratation auftreten.' }, { q: 'Mehr trinken bei Krankheit?', a: 'Ja, besonders bei Fieber, Erbrechen oder Durchfall.' }] },
    pt: { title: 'Calculadora de Ingestão de Água Grátis', paragraphs: ['A hidratação adequada é essencial para quase todas as funções corporais.', 'Uma pessoa sedentária de 60 kg precisa de muito menos água do que um atleta de 90 kg.', 'O nível de atividade impacta significativamente as necessidades de água.', 'Preste atenção aos sinais de sede e à cor da urina.'], faq: [{ q: 'Quanta água devo beber por dia?', a: 'Aproximadamente 33-40ml por quilograma de peso corporal por dia.' }, { q: 'Café e chá contam?', a: 'Sim, contribuem para a ingestão diária de líquidos.' }, { q: 'Quais são os sinais de desidratação?', a: 'Urina amarelo escuro, sede, boca seca, fadiga, tontura.' }, { q: 'Pode-se beber água demais?', a: 'Sim, embora raro, a hiper-hidratação pode ocorrer.' }, { q: 'Devo beber mais quando doente?', a: 'Sim, especialmente com febre, vômitos ou diarreia.' }] },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="water-intake-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Unit toggle */}
          <div className="flex gap-2">
            <button onClick={() => setUnitSystem('metric')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${unitSystem === 'metric' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {labels.metric[lang]}
            </button>
            <button onClick={() => setUnitSystem('imperial')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${unitSystem === 'imperial' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {labels.imperial[lang]}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.weight[lang]} ({unitSystem === 'metric' ? labels.kg[lang] : labels.lbs[lang]})</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} onBlur={() => setTouched(true)} placeholder={unitSystem === 'metric' ? '70' : '154'}
              className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 ${weightError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {weightError && <p className="text-red-500 text-xs mt-1">{labels.invalidWeight[lang]}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.activity[lang]}</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500">
              {['sedentary', 'light', 'moderate', 'active', 'veryActive'].map(a => (
                <option key={a} value={a}>{labels[a][lang]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.climate[lang]}</label>
            <select value={climate} onChange={(e) => setClimate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500">
              {['cold', 'temperate', 'hot', 'veryHot'].map(c => (
                <option key={c} value={c}>{labels[c][lang]}</option>
              ))}
            </select>
          </div>

          <button onClick={handleReset} className="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
            {labels.reset[lang]}
          </button>

          {hasResult && (
            <div className="space-y-3 mt-4">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 text-center border border-blue-100">
                <div className="text-5xl font-bold text-blue-700">{totalLiters.toFixed(1)} L</div>
                <div className="text-sm text-gray-500 mt-1">{labels.dailyIntake[lang]}</div>
                <div className="flex justify-center gap-4 mt-3">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-700">{glasses}</div>
                    <div className="text-xs text-gray-400">{labels.glassesPerDay[lang]}</div>
                  </div>
                  {unitSystem === 'imperial' && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-700">{totalOz.toFixed(0)}</div>
                      <div className="text-xs text-gray-400">{labels.ounces[lang]}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Hydration progress */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{labels.hydrationLevel[lang]}</span>
                  <span>{hydrationPct.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all" style={{ width: `${hydrationPct}%` }} />
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="text-sm font-medium text-green-800 mb-1">{labels.tips[lang]}</div>
                <p className="text-sm text-green-700">{tipsByActivity[activity][lang]}</p>
              </div>

              <button onClick={copyResult} className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">
                {copied ? labels.copied[lang] : labels.copy[lang]}
              </button>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">{labels.history[lang]}</h3>
              <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:text-red-700">Clear</button>
            </div>
            <div className="space-y-1">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between text-sm px-2 py-1.5 bg-gray-50 rounded">
                  <span className="text-gray-500">{h.weight}</span>
                  <span className="font-semibold text-blue-700">{h.result}</span>
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
