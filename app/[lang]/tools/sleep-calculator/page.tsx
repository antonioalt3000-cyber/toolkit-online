'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function SleepCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['sleep-calculator'][lang];

  const [mode, setMode] = useState<'wake' | 'sleep'>('wake');
  const [timeInput, setTimeInput] = useState('07:00');
  const [copied, setCopied] = useState(false);

  const CYCLE_MINUTES = 90;
  const FALL_ASLEEP_MINUTES = 14;

  const labels = {
    mode: { en: 'I want to...', it: 'Voglio...', es: 'Quiero...', fr: 'Je veux...', de: 'Ich möchte...', pt: 'Eu quero...' },
    wakeMode: { en: 'Know when to go to bed', it: 'Sapere quando andare a dormire', es: 'Saber cuándo acostarme', fr: 'Savoir quand me coucher', de: 'Wissen wann ich schlafen gehen soll', pt: 'Saber quando ir dormir' },
    sleepMode: { en: 'Know when to wake up', it: 'Sapere quando svegliarmi', es: 'Saber cuándo despertar', fr: 'Savoir quand me réveiller', de: 'Wissen wann ich aufwachen soll', pt: 'Saber quando acordar' },
    wakeAt: { en: 'I need to wake up at:', it: 'Devo svegliarmi alle:', es: 'Necesito despertar a las:', fr: 'Je dois me réveiller à :', de: 'Ich muss aufwachen um:', pt: 'Preciso acordar às:' },
    sleepAt: { en: 'I plan to go to bed at:', it: 'Ho intenzione di andare a dormire alle:', es: 'Planeo acostarme a las:', fr: 'Je prévois de me coucher à :', de: 'Ich plane schlafen zu gehen um:', pt: 'Planejo ir dormir às:' },
    bedtimes: { en: 'Recommended bedtimes:', it: 'Orari consigliati per andare a dormire:', es: 'Horarios recomendados para acostarse:', fr: 'Heures de coucher recommandées :', de: 'Empfohlene Schlafenszeiten:', pt: 'Horários recomendados para dormir:' },
    waketimes: { en: 'Recommended wake times:', it: 'Orari consigliati per svegliarsi:', es: 'Horarios recomendados para despertar:', fr: 'Heures de réveil recommandées :', de: 'Empfohlene Weckzeiten:', pt: 'Horários recomendados para acordar:' },
    cycles: { en: 'cycles', it: 'cicli', es: 'ciclos', fr: 'cycles', de: 'Zyklen', pt: 'ciclos' },
    hours: { en: 'hours', it: 'ore', es: 'horas', fr: 'heures', de: 'Stunden', pt: 'horas' },
    optimal: { en: 'Optimal', it: 'Ottimale', es: 'Óptimo', fr: 'Optimal', de: 'Optimal', pt: 'Ideal' },
    good: { en: 'Good', it: 'Buono', es: 'Bueno', fr: 'Bon', de: 'Gut', pt: 'Bom' },
    ok: { en: 'OK', it: 'OK', es: 'OK', fr: 'OK', de: 'OK', pt: 'OK' },
    fallAsleep: { en: '(includes ~14 min to fall asleep)', it: '(include ~14 min per addormentarsi)', es: '(incluye ~14 min para dormirse)', fr: '(inclut ~14 min pour s\'endormir)', de: '(inkl. ~14 Min. zum Einschlafen)', pt: '(inclui ~14 min para adormecer)' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    copyAll: { en: 'Copy All Times', it: 'Copia Tutti gli Orari', es: 'Copiar Todos los Horarios', fr: 'Copier Tous les Horaires', de: 'Alle Zeiten Kopieren', pt: 'Copiar Todos os Horários' },
    reset: { en: 'Reset', it: 'Reset', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Reiniciar' },
  } as Record<string, Record<Locale, string>>;

  const formatTime = (totalMinutes: number): string => {
    let mins = totalMinutes % (24 * 60);
    if (mins < 0) mins += 24 * 60;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const parseTime = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const calculateTimes = () => {
    const inputMinutes = parseTime(timeInput);
    const results: { time: string; cycles: number; hours: number; quality: string }[] = [];

    if (mode === 'wake') {
      for (let cycles = 6; cycles >= 3; cycles--) {
        const sleepDuration = cycles * CYCLE_MINUTES;
        const bedtime = inputMinutes - sleepDuration - FALL_ASLEEP_MINUTES;
        const quality = cycles >= 5 ? 'optimal' : cycles >= 4 ? 'good' : 'ok';
        results.push({ time: formatTime(bedtime), cycles, hours: sleepDuration / 60, quality });
      }
    } else {
      for (let cycles = 3; cycles <= 6; cycles++) {
        const sleepDuration = cycles * CYCLE_MINUTES;
        const wakeTime = inputMinutes + FALL_ASLEEP_MINUTES + sleepDuration;
        const quality = cycles >= 5 ? 'optimal' : cycles >= 4 ? 'good' : 'ok';
        results.push({ time: formatTime(wakeTime), cycles, hours: sleepDuration / 60, quality });
      }
    }

    return results;
  };

  const times = calculateTimes();

  const getQualityStyle = (quality: string) => {
    if (quality === 'optimal') return { bg: 'bg-green-50 border-green-200', text: 'text-green-700', label: labels.optimal[lang] };
    if (quality === 'good') return { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: labels.good[lang] };
    return { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', label: labels.ok[lang] };
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Sleep Calculator – Find Your Optimal Bedtime & Wake Time',
      paragraphs: [
        'Sleep is one of the most critical factors for health, cognitive performance, and overall well-being. Our sleep calculator is based on the science of sleep cycles — the natural rhythm your brain follows throughout the night. Each sleep cycle lasts approximately 90 minutes and consists of stages including light sleep, deep sleep, and REM (rapid eye movement) sleep.',
        'Waking up at the end of a complete sleep cycle, rather than in the middle of one, is the key to feeling refreshed and alert. When your alarm disrupts deep sleep or REM sleep, you experience "sleep inertia" — that groggy, disoriented feeling that can last for hours. Our calculator determines the optimal times by counting backward or forward in 90-minute intervals.',
        'The calculator also accounts for the average time it takes to fall asleep, approximately 14 minutes for most healthy adults. This means your recommended bedtime is calculated as: wake time minus (number of cycles x 90 minutes) minus 14 minutes. Most adults need 5-6 complete cycles (7.5-9 hours) per night for optimal health.',
        'Consistent sleep timing is just as important as duration. Going to bed and waking up at the same time every day — even on weekends — helps regulate your circadian rhythm, the internal biological clock that controls sleepiness and alertness. Use this calculator to find your ideal schedule and stick to it for better sleep quality.',
      ],
      faq: [
        { q: 'How long is a sleep cycle?', a: 'A complete sleep cycle lasts approximately 90 minutes. Each cycle progresses through stages: light sleep (N1 and N2), deep sleep (N3), and REM sleep. Most adults go through 4-6 complete cycles per night. The composition of each cycle changes throughout the night, with more deep sleep early on and more REM sleep toward morning.' },
        { q: 'How many hours of sleep do I need?', a: 'Most adults need 7-9 hours of sleep per night, which corresponds to 5-6 complete 90-minute sleep cycles. However, individual needs vary. Some people function well on 7 hours while others need 9. Children and teenagers need more sleep: 8-10 hours for teens and 9-12 hours for school-age children.' },
        { q: 'Why do I feel tired even after 8 hours of sleep?', a: 'Feeling tired after adequate sleep hours often means you woke up during the middle of a sleep cycle, particularly during deep sleep. This causes sleep inertia. Using a sleep calculator to time your wake-up to the end of a cycle can dramatically improve how you feel. Sleep quality also matters — caffeine, alcohol, screen time, and inconsistent schedules reduce sleep quality.' },
        { q: 'What time should I go to bed if I wake up at 7 AM?', a: 'If you need to wake up at 7:00 AM, optimal bedtimes (including 14 minutes to fall asleep) are: 9:46 PM (6 cycles, 9 hours), 11:16 PM (5 cycles, 7.5 hours), or 12:46 AM (4 cycles, 6 hours). For most adults, 9:46 PM or 11:16 PM would be ideal.' },
        { q: 'Is it better to sleep less or wake up mid-cycle?', a: 'It can actually be better to sleep slightly less but wake up at the end of a complete cycle rather than sleeping longer and waking up mid-cycle. For example, 6 hours (4 cycles) with a clean wake-up often feels better than 7 hours interrupted during deep sleep. However, consistently sleeping fewer than 7 hours is not recommended for long-term health.' },
      ],
    },
    it: {
      title: 'Calcolatore del Sonno Gratuito – Trova l\'Orario Ideale per Dormire e Svegliarti',
      paragraphs: [
        'Il sonno è uno dei fattori più critici per la salute, le prestazioni cognitive e il benessere generale. Il nostro calcolatore del sonno si basa sulla scienza dei cicli del sonno — il ritmo naturale che il cervello segue durante la notte. Ogni ciclo dura circa 90 minuti e comprende fasi di sonno leggero, sonno profondo e sonno REM.',
        'Svegliarsi alla fine di un ciclo completo, piuttosto che nel mezzo, è la chiave per sentirsi riposati e vigili. Quando la sveglia interrompe il sonno profondo o il sonno REM, si sperimenta l\'"inerzia del sonno" — quella sensazione di intontimento che può durare ore. Il nostro calcolatore determina gli orari ottimali contando avanti o indietro in intervalli di 90 minuti.',
        'Il calcolatore tiene anche conto del tempo medio necessario per addormentarsi, circa 14 minuti per la maggior parte degli adulti sani. Ciò significa che l\'orario consigliato viene calcolato come: ora di sveglia meno (numero di cicli x 90 minuti) meno 14 minuti.',
        'La costanza negli orari del sonno è importante quanto la durata. Andare a letto e svegliarsi alla stessa ora ogni giorno aiuta a regolare il ritmo circadiano, l\'orologio biologico interno che controlla sonnolenza e vigilanza.',
      ],
      faq: [
        { q: 'Quanto dura un ciclo del sonno?', a: 'Un ciclo completo del sonno dura circa 90 minuti. Ogni ciclo progredisce attraverso fasi: sonno leggero (N1 e N2), sonno profondo (N3) e sonno REM. La maggior parte degli adulti attraversa 4-6 cicli completi per notte.' },
        { q: 'Quante ore di sonno servono?', a: 'La maggior parte degli adulti ha bisogno di 7-9 ore di sonno per notte, corrispondenti a 5-6 cicli completi di 90 minuti. Tuttavia, le esigenze individuali variano.' },
        { q: 'Perché mi sento stanco anche dopo 8 ore di sonno?', a: 'Sentirsi stanchi dopo ore adeguate spesso significa che ci si è svegliati durante un ciclo del sonno, in particolare durante il sonno profondo. Usare un calcolatore per sincronizzare la sveglia con la fine di un ciclo può migliorare notevolmente come ci si sente.' },
        { q: 'A che ora devo andare a dormire se mi sveglio alle 7?', a: 'Se devi svegliarti alle 7:00, gli orari ottimali (inclusi 14 minuti per addormentarsi) sono: 21:46 (6 cicli, 9 ore), 23:16 (5 cicli, 7,5 ore), o 00:46 (4 cicli, 6 ore).' },
        { q: 'È meglio dormire meno o svegliarsi a metà ciclo?', a: 'Può essere meglio dormire un po\' meno ma svegliarsi alla fine di un ciclo completo. Per esempio, 6 ore (4 cicli) con un risveglio pulito spesso è meglio di 7 ore interrotte durante il sonno profondo.' },
      ],
    },
    es: {
      title: 'Calculadora de Sueño Online Gratis — Calcula Tus Ciclos de Sueño y Hora Ideal para Dormir',
      paragraphs: [
        '<strong>¿Te despiertas cansado aunque hayas dormido suficientes horas?</strong> La clave no es solo cuánto duermes, sino <em>cuándo</em> te despiertas dentro de tu ciclo de sueño. Nuestra calculadora de sueño online gratuita utiliza la ciencia de los ciclos del sueño para ayudarte a encontrar la hora perfecta para acostarte o despertarte, de modo que cada mañana te sientas verdaderamente descansado y con energía. No necesitas registro ni descarga — simplemente introduce tu hora y obtén resultados al instante.',
        '<h2 class="text-xl font-semibold text-gray-800 mt-4 mb-2">¿Qué son los ciclos de sueño y por qué importan?</h2>El sueño humano no es un estado uniforme: se organiza en ciclos repetitivos de aproximadamente 90 minutos. Cada ciclo atraviesa cuatro etapas bien diferenciadas. Las fases N1 y N2 corresponden al <strong>sueño ligero</strong>, donde el cuerpo empieza a relajarse, la frecuencia cardíaca disminuye y la temperatura corporal baja. La fase N3 es el <strong>sueño profundo</strong> o de ondas lentas, fundamental para la reparación muscular, la consolidación de la memoria y la liberación de la hormona del crecimiento. Finalmente, el <strong>sueño REM</strong> (movimiento rápido de ojos) es la fase donde soñamos y donde el cerebro procesa emociones y aprendizajes del día. Despertar al final de un ciclo completo, justo al terminar la fase REM, te permite levantarte sintiéndote renovado en lugar de aturdido.',
        '<h2 class="text-xl font-semibold text-gray-800 mt-4 mb-2">¿Cómo funciona esta calculadora de sueño?</h2>Nuestra calculadora de ciclos de sueño te ofrece dos modos de uso. En el <strong>modo "hora de despertar"</strong>, introduces la hora a la que necesitas levantarte y la herramienta calcula hacia atrás en intervalos de 90 minutos, sumando 14 minutos adicionales que es el tiempo promedio que tarda un adulto sano en dormirse según estudios de la National Sleep Foundation. En el <strong>modo "hora de acostarse"</strong>, introduces la hora a la que planeas irte a la cama y la calculadora proyecta hacia adelante para mostrarte las mejores horas de despertar. Cada resultado viene etiquetado como "Óptimo" (5-6 ciclos), "Bueno" (4 ciclos) o "OK" (3 ciclos) para que puedas elegir la opción que mejor se adapte a tu horario.',
        '<h2 class="text-xl font-semibold text-gray-800 mt-4 mb-2">¿Cuántas horas de sueño necesitas según tu edad?</h2>Las necesidades de sueño varían significativamente según la edad. Los recién nacidos necesitan entre 14 y 17 horas de sueño; los bebés de 4 a 11 meses, entre 12 y 15 horas; los niños de 1 a 5 años requieren de 10 a 14 horas; los escolares de 6 a 13 años, entre 9 y 11 horas; los adolescentes de 14 a 17 años necesitan entre 8 y 10 horas; y los adultos de 18 a 64 años deben dormir entre 7 y 9 horas, lo que equivale a 5 o 6 ciclos completos de 90 minutos. Los adultos mayores de 65 años suelen necesitar entre 7 y 8 horas. Estas recomendaciones provienen de la American Academy of Sleep Medicine y la National Sleep Foundation.',
        '<h2 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Consejos para mejorar la calidad del sueño</h2>Usar una calculadora de sueño es un excelente primer paso, pero hay otros hábitos que pueden mejorar dramáticamente tu descanso nocturno. <strong>Mantén un horario consistente</strong>: acuéstate y levántate a la misma hora todos los días, incluso los fines de semana, para regular tu ritmo circadiano. <strong>Evita las pantallas 60 minutos antes de dormir</strong>: la luz azul de móviles, tablets y ordenadores suprime la producción de melatonina. <strong>Crea un ambiente oscuro y fresco</strong>: la temperatura ideal para dormir oscila entre 18 y 20 grados centígrados. <strong>Limita la cafeína después de las 14:00</strong>: la cafeína tiene una vida media de 5-6 horas y puede interferir con el sueño profundo. Complementa estos consejos con nuestro <a href="/es/tools/breathing-exercise" class="text-blue-600 underline">ejercicio de respiración</a> para relajarte antes de dormir.',
        '<h2 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Herramientas complementarias para tu bienestar</h2>Dormir bien es solo una parte de una vida saludable. Si quieres optimizar tu día completo, prueba nuestro <a href="/es/tools/pomodoro-timer" class="text-blue-600 underline">temporizador Pomodoro</a> para gestionar mejor tu productividad durante las horas de vigilia, o nuestro <a href="/es/tools/calorie-calculator" class="text-blue-600 underline">calculadora de calorías</a> para mantener una alimentación equilibrada que favorezca un sueño reparador. La nutrición, el ejercicio y el sueño forman el triángulo fundamental del bienestar — y esta calculadora de sueño te ayuda a dominar uno de esos tres pilares.',
        '<h2 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Privacidad total: tus datos no salen de tu dispositivo</h2>Nuestra calculadora de sueño online funciona completamente en tu navegador mediante JavaScript. No recopilamos datos personales, no enviamos tu hora de despertar a ningún servidor y no almacenamos ninguna información. Puedes usarla en tu móvil, tablet u ordenador con total tranquilidad y sin crear ninguna cuenta.',
      ],
      faq: [
        { q: '¿Cuánto dura un ciclo de sueño y cuántos ciclos necesito?', a: 'Un ciclo completo de sueño dura aproximadamente 90 minutos y atraviesa cuatro etapas: sueño ligero (N1 y N2), sueño profundo (N3) y sueño REM. La mayoría de adultos necesitan entre 4 y 6 ciclos completos por noche, lo que equivale a entre 6 y 9 horas de sueño. Lo óptimo para la mayoría de personas son 5 ciclos (7,5 horas) o 6 ciclos (9 horas). La composición de cada ciclo cambia a lo largo de la noche: los primeros ciclos tienen más sueño profundo, mientras que los últimos contienen más sueño REM.' },
        { q: '¿Por qué me siento cansado después de dormir 8 horas?', a: 'Sentirse cansado tras dormir 8 horas suele indicar que tu alarma te despertó en medio de un ciclo de sueño, particularmente durante la fase de sueño profundo (N3). Esto produce la llamada "inercia del sueño" — una sensación de aturdimiento y confusión que puede durar entre 30 minutos y 2 horas. Curiosamente, 7,5 horas (5 ciclos completos) suelen sentirse mejor que 8 horas si esas 8 horas implican despertar a mitad de un sexto ciclo. Usa esta calculadora para sincronizar tu despertar con el final de un ciclo.' },
        { q: '¿A qué hora debo acostarme si necesito despertar a las 7 de la mañana?', a: 'Si necesitas despertar a las 7:00 AM y consideramos los 14 minutos promedio para dormirse, las horas óptimas para acostarte son: 21:46 (6 ciclos = 9 horas de sueño), 23:16 (5 ciclos = 7,5 horas de sueño), o 00:46 (4 ciclos = 6 horas de sueño). Para la mayoría de adultos, las opciones de 21:46 o 23:16 son las más recomendables. Si tienes que elegir entre dormir 6 horas completas o 7 horas con despertar a mitad de ciclo, los 6 ciclos completos suelen producir un despertar más fresco.' },
        { q: '¿El tiempo para dormirse siempre son 14 minutos?', a: 'Los 14 minutos son un promedio estadístico para adultos sanos. Sin embargo, el tiempo real varía considerablemente según factores como el nivel de estrés, el consumo de cafeína, la exposición a pantallas antes de dormir, la actividad física del día y condiciones como el insomnio. Si regularmente tardas más de 30 minutos en dormirte, podrías ajustar mentalmente la hora que te sugiere la calculadora restando esos minutos adicionales. Si tardas menos de 5 minutos, podría ser señal de privación de sueño crónica.' },
        { q: '¿Es malo dormir siestas durante el día si uso esta calculadora para la noche?', a: 'Las siestas cortas de 20 a 30 minutos (llamadas "power naps") pueden mejorar el estado de alerta y el rendimiento sin afectar el sueño nocturno, siempre que se tomen antes de las 15:00. Sin embargo, siestas largas (más de 60 minutos) o siestas tardías pueden dificultar quedarse dormido por la noche y alterar los ciclos calculados. Si necesitas una siesta, programa una alarma para no superar los 25 minutos y evitar entrar en sueño profundo, lo cual te dejaría más aturdido al despertar.' },
      ],
    },
    fr: {
      title: 'Calculateur de Sommeil Gratuit – Trouvez Votre Heure Idéale de Coucher et de Réveil',
      paragraphs: [
        'Le sommeil est l\'un des facteurs les plus critiques pour la santé, les performances cognitives et le bien-être général. Notre calculateur de sommeil repose sur la science des cycles du sommeil. Chaque cycle dure environ 90 minutes et comprend des stades de sommeil léger, sommeil profond et sommeil paradoxal (REM).',
        'Se réveiller à la fin d\'un cycle complet, plutôt qu\'au milieu, est la clé pour se sentir reposé et alerte. Quand l\'alarme interrompt le sommeil profond, on ressent l\'"inertie du sommeil" — cette sensation de confusion qui peut durer des heures.',
        'Le calculateur tient également compte du temps moyen pour s\'endormir, environ 14 minutes. L\'heure recommandée est donc : heure de réveil moins (nombre de cycles x 90 minutes) moins 14 minutes.',
        'La régularité des horaires de sommeil est aussi importante que la durée. Se coucher et se lever à la même heure chaque jour aide à réguler le rythme circadien.',
      ],
      faq: [
        { q: 'Combien de temps dure un cycle de sommeil ?', a: 'Un cycle complet dure environ 90 minutes. Chaque cycle progresse à travers des stades : sommeil léger (N1 et N2), sommeil profond (N3) et sommeil paradoxal. La plupart des adultes traversent 4-6 cycles par nuit.' },
        { q: 'Combien d\'heures de sommeil me faut-il ?', a: 'La plupart des adultes ont besoin de 7-9 heures de sommeil par nuit, soit 5-6 cycles complets de 90 minutes.' },
        { q: 'Pourquoi suis-je fatigué après 8 heures de sommeil ?', a: 'Se sentir fatigué signifie souvent que vous vous êtes réveillé pendant un cycle, surtout pendant le sommeil profond. Utiliser un calculateur pour synchroniser le réveil avec la fin d\'un cycle peut améliorer votre état.' },
        { q: 'À quelle heure dois-je me coucher si je me réveille à 7h ?', a: 'Si vous devez vous réveiller à 7h00, les heures optimales (incluant 14 min pour s\'endormir) sont : 21h46 (6 cycles, 9h), 23h16 (5 cycles, 7h30), ou 00h46 (4 cycles, 6h).' },
        { q: 'Vaut-il mieux dormir moins ou se réveiller en plein cycle ?', a: 'Il peut être préférable de dormir un peu moins mais de se réveiller à la fin d\'un cycle complet. Par exemple, 6 heures (4 cycles) avec un réveil net est souvent mieux que 7 heures interrompues pendant le sommeil profond.' },
      ],
    },
    de: {
      title: 'Kostenloser Schlafrechner – Finden Sie Ihre Optimale Schlaf- und Aufwachzeit',
      paragraphs: [
        'Schlaf ist einer der wichtigsten Faktoren für Gesundheit, kognitive Leistung und allgemeines Wohlbefinden. Unser Schlafrechner basiert auf der Wissenschaft der Schlafzyklen. Jeder Zyklus dauert etwa 90 Minuten und umfasst Phasen des leichten Schlafs, Tiefschlafs und REM-Schlafs.',
        'Am Ende eines vollständigen Zyklus aufzuwachen, anstatt mittendrin, ist der Schlüssel, um sich ausgeruht und wach zu fühlen. Wenn der Wecker den Tiefschlaf unterbricht, erleben Sie "Schlafträgheit" — dieses benommene Gefühl, das stundenlang anhalten kann.',
        'Der Rechner berücksichtigt auch die durchschnittliche Einschlafzeit von etwa 14 Minuten. Die empfohlene Schlafenszeit berechnet sich als: Aufwachzeit minus (Anzahl der Zyklen x 90 Minuten) minus 14 Minuten.',
        'Konstante Schlafzeiten sind genauso wichtig wie die Dauer. Jeden Tag zur gleichen Zeit ins Bett zu gehen und aufzustehen hilft, den zirkadianen Rhythmus zu regulieren.',
      ],
      faq: [
        { q: 'Wie lang ist ein Schlafzyklus?', a: 'Ein vollständiger Schlafzyklus dauert etwa 90 Minuten. Jeder Zyklus durchläuft Phasen: leichter Schlaf (N1 und N2), Tiefschlaf (N3) und REM-Schlaf. Die meisten Erwachsenen durchlaufen 4-6 Zyklen pro Nacht.' },
        { q: 'Wie viele Stunden Schlaf brauche ich?', a: 'Die meisten Erwachsenen brauchen 7-9 Stunden Schlaf pro Nacht, was 5-6 vollständigen 90-Minuten-Zyklen entspricht.' },
        { q: 'Warum bin ich nach 8 Stunden Schlaf noch müde?', a: 'Müdigkeit trotz ausreichender Stunden bedeutet oft, dass Sie mitten in einem Zyklus aufgewacht sind, besonders im Tiefschlaf. Den Wecker auf das Ende eines Zyklus einzustellen kann deutlich helfen.' },
        { q: 'Wann sollte ich ins Bett gehen, wenn ich um 7 Uhr aufstehe?', a: 'Bei Aufwachzeit 7:00 Uhr sind optimale Schlafenszeiten (inkl. 14 Min. Einschlafzeit): 21:46 (6 Zyklen, 9 Std.), 23:16 (5 Zyklen, 7,5 Std.) oder 00:46 (4 Zyklen, 6 Std.).' },
        { q: 'Ist weniger Schlaf besser als mitten im Zyklus aufzuwachen?', a: 'Es kann besser sein, etwas weniger zu schlafen, aber am Ende eines Zyklus aufzuwachen. 6 Stunden (4 Zyklen) mit sauberem Aufwachen fühlen sich oft besser an als 7 Stunden mit Unterbrechung im Tiefschlaf.' },
      ],
    },
    pt: {
      title: 'Calculadora de Sono Grátis – Encontre Seu Horário Ideal para Dormir e Acordar',
      paragraphs: [
        'O sono é um dos fatores mais críticos para saúde, desempenho cognitivo e bem-estar geral. Nossa calculadora de sono é baseada na ciência dos ciclos do sono. Cada ciclo dura aproximadamente 90 minutos e consiste em estágios de sono leve, sono profundo e sono REM.',
        'Acordar no final de um ciclo completo, em vez de no meio, é a chave para se sentir descansado e alerta. Quando o alarme interrompe o sono profundo, você experimenta "inércia do sono" — aquela sensação de atordoamento que pode durar horas.',
        'A calculadora também considera o tempo médio para adormecer, aproximadamente 14 minutos. O horário recomendado é calculado como: hora de acordar menos (número de ciclos x 90 minutos) menos 14 minutos.',
        'A consistência nos horários de sono é tão importante quanto a duração. Ir para a cama e acordar no mesmo horário todos os dias ajuda a regular o ritmo circadiano.',
      ],
      faq: [
        { q: 'Quanto dura um ciclo de sono?', a: 'Um ciclo completo dura aproximadamente 90 minutos. Cada ciclo progride através de estágios: sono leve (N1 e N2), sono profundo (N3) e sono REM. A maioria dos adultos passa por 4-6 ciclos por noite.' },
        { q: 'Quantas horas de sono preciso?', a: 'A maioria dos adultos precisa de 7-9 horas de sono por noite, correspondendo a 5-6 ciclos completos de 90 minutos.' },
        { q: 'Por que me sinto cansado após 8 horas de sono?', a: 'Sentir-se cansado após horas adequadas geralmente significa que você acordou durante um ciclo, particularmente durante o sono profundo. Usar uma calculadora para sincronizar o despertar com o final de um ciclo pode melhorar como você se sente.' },
        { q: 'A que horas devo dormir se acordo às 7h?', a: 'Se precisa acordar às 7:00, os horários ótimos (incluindo 14 min para adormecer) são: 21:46 (6 ciclos, 9h), 23:16 (5 ciclos, 7,5h), ou 00:46 (4 ciclos, 6h).' },
        { q: 'É melhor dormir menos ou acordar no meio do ciclo?', a: 'Pode ser melhor dormir um pouco menos mas acordar no final de um ciclo completo. Por exemplo, 6 horas (4 ciclos) com despertar limpo muitas vezes é melhor que 7 horas interrompidas durante sono profundo.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="sleep-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.mode[lang]}</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setMode('wake')} className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${mode === 'wake' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                {labels.wakeMode[lang]}
              </button>
              <button onClick={() => setMode('sleep')} className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${mode === 'sleep' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                {labels.sleepMode[lang]}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {mode === 'wake' ? labels.wakeAt[lang] : labels.sleepAt[lang]}
            </label>
            <input type="time" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <button onClick={() => { setTimeInput('07:00'); setMode('wake'); }} className="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
            {labels.reset[lang]}
          </button>

          <p className="text-xs text-gray-400">{labels.fallAsleep[lang]}</p>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">{mode === 'wake' ? labels.bedtimes[lang] : labels.waketimes[lang]}</h3>
            {times.map((t, i) => {
              const style = getQualityStyle(t.quality);
              return (
                <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all hover:shadow-sm ${style.bg}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-900">{t.time}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.text} bg-white shadow-sm`}>{style.label}</span>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>{t.cycles} {labels.cycles[lang]}</div>
                    <div>{t.hours} {labels.hours[lang]}</div>
                    {/* Visual sleep bar */}
                    <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className={`h-full rounded-full ${t.quality === 'optimal' ? 'bg-green-500' : t.quality === 'good' ? 'bg-blue-500' : 'bg-yellow-500'}`}
                        style={{ width: `${(t.cycles / 6) * 100}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Copy all times */}
          <button onClick={() => {
            const allTimes = times.map(t => `${t.time} (${t.cycles} ${labels.cycles[lang]}, ${t.hours} ${labels.hours[lang]})`).join('\n');
            navigator.clipboard.writeText(allTimes);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }} className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">
            {copied ? labels.copied[lang] : labels.copyAll[lang]}
          </button>
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
