'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const sampleTexts: Record<Locale, string[]> = {
  en: [
    'The quick brown fox jumps over the lazy dog. Programming is the art of telling another human what one wants the computer to do. Every great developer you know got there by solving problems they were unqualified to solve until they actually did it.',
    'Technology is best when it brings people together. The best way to predict the future is to invent it. Innovation distinguishes between a leader and a follower. Stay hungry, stay foolish. Think different and make a difference.',
    'Success is not final, failure is not fatal: it is the courage to continue that counts. The only way to do great work is to love what you do. Life is what happens when you are busy making other plans.',
  ],
  it: [
    'La volpe marrone veloce salta sopra il cane pigro. La programmazione è l\'arte di dire a un altro essere umano cosa si vuole che il computer faccia. Ogni grande sviluppatore è arrivato dove è risolvendo problemi per i quali non era qualificato.',
    'La tecnologia è migliore quando unisce le persone. Il modo migliore per predire il futuro è inventarlo. L\'innovazione distingue un leader da un seguace. Resta affamato, resta folle.',
    'Il successo non è definitivo, il fallimento non è fatale: è il coraggio di continuare che conta. L\'unico modo per fare un grande lavoro è amare quello che fai.',
  ],
  es: [
    'El rápido zorro marrón salta sobre el perro perezoso. La programación es el arte de decirle a otro humano lo que uno quiere que la computadora haga. Todo gran desarrollador llegó allí resolviendo problemas para los que no estaba calificado.',
    'La tecnología es mejor cuando une a las personas. La mejor manera de predecir el futuro es inventarlo. La innovación distingue entre un líder y un seguidor. Sigue hambriento, sigue alocado.',
    'El éxito no es definitivo, el fracaso no es fatal: es el coraje de continuar lo que cuenta. La única forma de hacer un gran trabajo es amar lo que haces.',
  ],
  fr: [
    'Le rapide renard brun saute par-dessus le chien paresseux. La programmation est l\'art de dire à un autre humain ce que l\'on veut que l\'ordinateur fasse. Chaque grand développeur y est arrivé en résolvant des problèmes pour lesquels il n\'était pas qualifié.',
    'La technologie est meilleure quand elle rassemble les gens. La meilleure façon de prédire l\'avenir est de l\'inventer. L\'innovation distingue un leader d\'un suiveur. Restez affamé, restez fou.',
    'Le succès n\'est pas définitif, l\'échec n\'est pas fatal: c\'est le courage de continuer qui compte. La seule façon de faire un excellent travail est d\'aimer ce que vous faites.',
  ],
  de: [
    'Der schnelle braune Fuchs springt über den faulen Hund. Programmierung ist die Kunst, einem anderen Menschen zu sagen, was man vom Computer will. Jeder großartige Entwickler kam dorthin, indem er Probleme löste, für die er nicht qualifiziert war.',
    'Technologie ist am besten, wenn sie Menschen zusammenbringt. Der beste Weg, die Zukunft vorherzusagen, ist, sie zu erfinden. Innovation unterscheidet einen Anführer von einem Mitläufer. Bleib hungrig, bleib verrückt.',
    'Erfolg ist nicht endgültig, Misserfolg ist nicht tödlich: Es ist der Mut weiterzumachen, der zählt. Der einzige Weg, großartige Arbeit zu leisten, ist zu lieben, was man tut.',
  ],
  pt: [
    'A rápida raposa marrom pula sobre o cachorro preguiçoso. Programação é a arte de dizer a outro humano o que se quer que o computador faça. Todo grande desenvolvedor chegou lá resolvendo problemas para os quais não estava qualificado.',
    'A tecnologia é melhor quando une as pessoas. A melhor maneira de prever o futuro é inventá-lo. A inovação distingue um líder de um seguidor. Fique com fome, fique tolo.',
    'Sucesso não é definitivo, fracasso não é fatal: é a coragem de continuar que conta. A única forma de fazer um ótimo trabalho é amar o que você faz.',
  ],
};

export default function TypingSpeedTest() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['typing-speed-test'][lang];

  const labels = {
    start: { en: 'Start Test', it: 'Inizia Test', es: 'Iniciar Prueba', fr: 'Commencer le Test', de: 'Test Starten', pt: 'Iniciar Teste' },
    restart: { en: 'Restart', it: 'Ricomincia', es: 'Reiniciar', fr: 'Recommencer', de: 'Neustart', pt: 'Reiniciar' },
    typeHere: { en: 'Start typing here...', it: 'Inizia a digitare qui...', es: 'Empieza a escribir aquí...', fr: 'Commencez à taper ici...', de: 'Fangen Sie hier an zu tippen...', pt: 'Comece a digitar aqui...' },
    wpm: { en: 'WPM', it: 'PPM', es: 'PPM', fr: 'MPM', de: 'WPM', pt: 'PPM' },
    wpmFull: { en: 'Words Per Minute', it: 'Parole Per Minuto', es: 'Palabras Por Minuto', fr: 'Mots Par Minute', de: 'Wörter Pro Minute', pt: 'Palavras Por Minuto' },
    accuracy: { en: 'Accuracy', it: 'Precisione', es: 'Precisión', fr: 'Précision', de: 'Genauigkeit', pt: 'Precisão' },
    time: { en: 'Time', it: 'Tempo', es: 'Tiempo', fr: 'Temps', de: 'Zeit', pt: 'Tempo' },
    characters: { en: 'Characters', it: 'Caratteri', es: 'Caracteres', fr: 'Caractères', de: 'Zeichen', pt: 'Caracteres' },
    correct: { en: 'Correct', it: 'Corretti', es: 'Correctos', fr: 'Corrects', de: 'Richtig', pt: 'Corretos' },
    errors: { en: 'Errors', it: 'Errori', es: 'Errores', fr: 'Erreurs', de: 'Fehler', pt: 'Erros' },
    testComplete: { en: 'Test Complete!', it: 'Test Completato!', es: '¡Prueba Completada!', fr: 'Test Terminé !', de: 'Test Abgeschlossen!', pt: 'Teste Completo!' },
    seconds: { en: 's', it: 's', es: 's', fr: 's', de: 's', pt: 's' },
    ready: { en: 'Click the text area and start typing to begin', it: 'Clicca l\'area di testo e inizia a digitare', es: 'Haz clic en el área de texto y comienza a escribir', fr: 'Cliquez sur la zone de texte et commencez à taper', de: 'Klicken Sie auf das Textfeld und beginnen Sie zu tippen', pt: 'Clique na área de texto e comece a digitar' },
  } as Record<string, Record<Locale, string>>;

  const [sampleText, setSampleText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getRandomText = useCallback(() => {
    const texts = sampleTexts[lang] || sampleTexts.en;
    return texts[Math.floor(Math.random() * texts.length)];
  }, [lang]);

  useEffect(() => {
    setSampleText(getRandomText());
  }, [getRandomText]);

  useEffect(() => {
    if (isActive && startTime && !endTime) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 200);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, startTime, endTime]);

  const handleInputChange = (value: string) => {
    if (endTime) return;

    if (!startTime) {
      setStartTime(Date.now());
      setIsActive(true);
    }

    setUserInput(value);

    // Check if test is complete
    if (value.length >= sampleText.length) {
      setEndTime(Date.now());
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const restart = () => {
    setUserInput('');
    setStartTime(null);
    setEndTime(null);
    setIsActive(false);
    setElapsed(0);
    setSampleText(getRandomText());
    if (timerRef.current) clearInterval(timerRef.current);
    inputRef.current?.focus();
  };

  // Calculate stats
  const totalChars = userInput.length;
  let correctChars = 0;
  let errorChars = 0;
  for (let i = 0; i < totalChars; i++) {
    if (userInput[i] === sampleText[i]) correctChars++;
    else errorChars++;
  }

  const timeInMinutes = startTime ? ((endTime || Date.now()) - startTime) / 60000 : 0;
  const wordsTyped = correctChars / 5; // standard: 1 word = 5 chars
  const wpm = timeInMinutes > 0 ? Math.round(wordsTyped / timeInMinutes) : 0;
  const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
  const isComplete = endTime !== null;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Typing Speed Test – Measure Your WPM Online',
      paragraphs: [
        'Typing speed is a valuable skill in today\'s digital world. Whether you are a student, professional, programmer, or writer, knowing your words per minute (WPM) helps you track your productivity and identify areas for improvement. Regular practice can significantly increase your typing speed over time.',
        'Our free typing speed test measures your WPM and accuracy in real time. Simply start typing the displayed text, and the timer begins automatically. The test calculates your net WPM using the standard formula: (total characters typed correctly / 5) / time in minutes. This method accounts for errors, giving you a realistic measure of your effective typing speed.',
        'Accuracy is just as important as speed. A fast typist who makes many errors may actually be less productive than a slower, more accurate one, because time spent correcting mistakes adds up. Our test tracks both metrics so you can find the right balance between speed and precision.',
        'The average typing speed is around 40 WPM for casual typists. Professional typists typically achieve 65-75 WPM, while experienced programmers and transcriptionists can exceed 100 WPM. With consistent daily practice of just 15-20 minutes, most people can improve their speed by 10-20 WPM within a few weeks.',
      ],
      faq: [
        { q: 'What is a good typing speed?', a: 'The average typing speed is about 40 WPM. A speed of 60-70 WPM is considered good for most jobs. Professional typists and programmers often type at 80-100+ WPM. For data entry positions, 65-75 WPM is typically required.' },
        { q: 'How is WPM calculated?', a: 'WPM (Words Per Minute) is calculated by dividing the number of correctly typed characters by 5 (the standard word length), then dividing by the elapsed time in minutes. This gives "net WPM" which accounts for errors, unlike "gross WPM" which counts all keystrokes.' },
        { q: 'How can I improve my typing speed?', a: 'Practice regularly (15-20 minutes daily), use proper finger placement on the home row, avoid looking at the keyboard, focus on accuracy before speed, and use online typing tutors. Touch typing — using all fingers without looking — is the foundation of fast typing.' },
        { q: 'Does typing speed matter for programming?', a: 'While programming involves more thinking than typing, a good typing speed (60+ WPM) reduces the friction between your thoughts and the code. It is especially helpful during pair programming, writing documentation, and communicating with team members.' },
        { q: 'What is the world record for typing speed?', a: 'The fastest typing speed ever recorded was 216 WPM by Stella Pajunas in 1946 on an IBM electric typewriter. On modern keyboards, Barbara Blackburn holds the record at 212 WPM. Most competitive typists today achieve 150-180 WPM in burst tests.' },
      ],
    },
    it: {
      title: 'Test di Velocità di Digitazione Gratuito – Misura i Tuoi PPM Online',
      paragraphs: [
        'La velocità di digitazione è un\'abilità preziosa nel mondo digitale di oggi. Che tu sia studente, professionista, programmatore o scrittore, conoscere le tue parole per minuto (PPM) ti aiuta a monitorare la produttività e identificare aree di miglioramento.',
        'Il nostro test gratuito misura i PPM e la precisione in tempo reale. Inizia a digitare il testo visualizzato e il timer parte automaticamente. Il test calcola i PPM netti usando la formula standard che tiene conto degli errori.',
        'La precisione è importante quanto la velocità. Un digitatore veloce che commette molti errori potrebbe essere meno produttivo di uno più lento ma preciso. Il nostro test monitora entrambe le metriche.',
        'La velocità media è di circa 40 PPM. I professionisti raggiungono 65-75 PPM, mentre esperti possono superare i 100 PPM. Con pratica quotidiana di 15-20 minuti, si può migliorare di 10-20 PPM in poche settimane.',
      ],
      faq: [
        { q: 'Qual è una buona velocità di digitazione?', a: 'La media è circa 40 PPM. Una velocità di 60-70 PPM è considerata buona per la maggior parte dei lavori. I professionisti raggiungono 80-100+ PPM.' },
        { q: 'Come si calcolano i PPM?', a: 'I PPM si calcolano dividendo i caratteri corretti per 5 (lunghezza standard di una parola), poi dividendo per il tempo in minuti.' },
        { q: 'Come posso migliorare la mia velocità?', a: 'Pratica regolare (15-20 minuti al giorno), posizione corretta delle dita, non guardare la tastiera e concentrati prima sulla precisione.' },
        { q: 'La velocità di digitazione conta per la programmazione?', a: 'Una buona velocità (60+ PPM) riduce l\'attrito tra pensiero e codice, specialmente durante pair programming e comunicazione con il team.' },
      ],
    },
    es: {
      title: 'Test de Velocidad de Escritura Gratis – Mide Tus PPM Online',
      paragraphs: [
        'La velocidad de escritura es una habilidad valiosa en el mundo digital actual. Conocer tus palabras por minuto (PPM) te ayuda a monitorear tu productividad e identificar áreas de mejora.',
        'Nuestro test gratuito mide los PPM y la precisión en tiempo real. Comienza a escribir el texto mostrado y el temporizador se activa automáticamente.',
        'La precisión es tan importante como la velocidad. Un escritor rápido que comete muchos errores puede ser menos productivo que uno más lento pero preciso.',
        'La velocidad promedio es de unos 40 PPM. Los profesionales alcanzan 65-75 PPM. Con práctica diaria de 15-20 minutos, puedes mejorar 10-20 PPM en pocas semanas.',
      ],
      faq: [
        { q: '¿Cuál es una buena velocidad de escritura?', a: 'El promedio es 40 PPM. Una velocidad de 60-70 PPM se considera buena. Los profesionales alcanzan 80-100+ PPM.' },
        { q: '¿Cómo se calculan los PPM?', a: 'Los PPM se calculan dividiendo los caracteres correctos por 5, luego dividiendo por el tiempo en minutos.' },
        { q: '¿Cómo puedo mejorar mi velocidad?', a: 'Practica regularmente, usa la posición correcta de dedos, no mires el teclado y enfócate primero en la precisión.' },
        { q: '¿Importa la velocidad de escritura para programar?', a: 'Una buena velocidad (60+ PPM) reduce la fricción entre tus pensamientos y el código.' },
      ],
    },
    fr: {
      title: 'Test de Vitesse de Frappe Gratuit – Mesurez Vos MPM en Ligne',
      paragraphs: [
        'La vitesse de frappe est une compétence précieuse dans le monde numérique d\'aujourd\'hui. Connaître vos mots par minute (MPM) vous aide à suivre votre productivité et identifier les points à améliorer.',
        'Notre test gratuit mesure les MPM et la précision en temps réel. Commencez à taper le texte affiché et le chronomètre démarre automatiquement.',
        'La précision est aussi importante que la vitesse. Un dactylographe rapide qui fait beaucoup d\'erreurs peut être moins productif qu\'un plus lent mais précis.',
        'La vitesse moyenne est d\'environ 40 MPM. Les professionnels atteignent 65-75 MPM. Avec une pratique quotidienne de 15-20 minutes, vous pouvez progresser de 10-20 MPM en quelques semaines.',
      ],
      faq: [
        { q: 'Quelle est une bonne vitesse de frappe ?', a: 'La moyenne est d\'environ 40 MPM. Une vitesse de 60-70 MPM est considérée bonne. Les professionnels atteignent 80-100+ MPM.' },
        { q: 'Comment les MPM sont-ils calculés ?', a: 'Les MPM sont calculés en divisant les caractères corrects par 5, puis en divisant par le temps en minutes.' },
        { q: 'Comment améliorer ma vitesse de frappe ?', a: 'Pratiquez régulièrement, utilisez le bon positionnement des doigts, ne regardez pas le clavier et concentrez-vous d\'abord sur la précision.' },
        { q: 'La vitesse de frappe est-elle importante pour programmer ?', a: 'Une bonne vitesse (60+ MPM) réduit la friction entre vos pensées et le code.' },
      ],
    },
    de: {
      title: 'Kostenloser Tippgeschwindigkeitstest – Messen Sie Ihre WPM Online',
      paragraphs: [
        'Tippgeschwindigkeit ist eine wertvolle Fähigkeit in der digitalen Welt. Ihre Wörter pro Minute (WPM) zu kennen hilft Ihnen, Ihre Produktivität zu verfolgen und Verbesserungsbereiche zu identifizieren.',
        'Unser kostenloser Test misst WPM und Genauigkeit in Echtzeit. Beginnen Sie zu tippen und der Timer startet automatisch.',
        'Genauigkeit ist genauso wichtig wie Geschwindigkeit. Ein schneller Tipper mit vielen Fehlern kann weniger produktiv sein als ein langsamerer, aber genauerer.',
        'Die durchschnittliche Geschwindigkeit beträgt etwa 40 WPM. Profis erreichen 65-75 WPM. Mit täglicher Übung von 15-20 Minuten können Sie sich um 10-20 WPM in wenigen Wochen verbessern.',
      ],
      faq: [
        { q: 'Was ist eine gute Tippgeschwindigkeit?', a: 'Der Durchschnitt liegt bei 40 WPM. 60-70 WPM gelten als gut. Profis erreichen 80-100+ WPM.' },
        { q: 'Wie werden WPM berechnet?', a: 'WPM werden berechnet, indem korrekte Zeichen durch 5 geteilt werden, dann durch die Zeit in Minuten.' },
        { q: 'Wie kann ich meine Tippgeschwindigkeit verbessern?', a: 'Üben Sie regelmäßig, verwenden Sie die richtige Fingerhaltung, schauen Sie nicht auf die Tastatur und konzentrieren Sie sich zunächst auf Genauigkeit.' },
        { q: 'Ist Tippgeschwindigkeit beim Programmieren wichtig?', a: 'Eine gute Geschwindigkeit (60+ WPM) reduziert die Reibung zwischen Gedanken und Code.' },
      ],
    },
    pt: {
      title: 'Teste de Velocidade de Digitação Grátis – Meça Seus PPM Online',
      paragraphs: [
        'A velocidade de digitação é uma habilidade valiosa no mundo digital atual. Conhecer suas palavras por minuto (PPM) ajuda a monitorar sua produtividade e identificar áreas de melhoria.',
        'Nosso teste gratuito mede PPM e precisão em tempo real. Comece a digitar o texto exibido e o cronômetro inicia automaticamente.',
        'A precisão é tão importante quanto a velocidade. Um digitador rápido que comete muitos erros pode ser menos produtivo que um mais lento e preciso.',
        'A velocidade média é de cerca de 40 PPM. Profissionais atingem 65-75 PPM. Com prática diária de 15-20 minutos, você pode melhorar 10-20 PPM em poucas semanas.',
      ],
      faq: [
        { q: 'Qual é uma boa velocidade de digitação?', a: 'A média é cerca de 40 PPM. Uma velocidade de 60-70 PPM é considerada boa. Profissionais atingem 80-100+ PPM.' },
        { q: 'Como os PPM são calculados?', a: 'PPM são calculados dividindo caracteres corretos por 5, depois dividindo pelo tempo em minutos.' },
        { q: 'Como posso melhorar minha velocidade?', a: 'Pratique regularmente, use a posição correta dos dedos, não olhe para o teclado e foque primeiro na precisão.' },
        { q: 'A velocidade de digitação importa para programar?', a: 'Uma boa velocidade (60+ PPM) reduz o atrito entre seus pensamentos e o código.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="typing-speed-test" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-blue-50 text-center">
              <div className="text-xs text-gray-500">{labels.wpm[lang]}</div>
              <div className="text-2xl font-bold text-blue-700">{wpm}</div>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-center">
              <div className="text-xs text-gray-500">{labels.accuracy[lang]}</div>
              <div className="text-2xl font-bold text-green-700">{accuracy}%</div>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 text-center">
              <div className="text-xs text-gray-500">{labels.time[lang]}</div>
              <div className="text-2xl font-bold text-purple-700">{elapsed}{labels.seconds[lang]}</div>
            </div>
            <div className="p-3 rounded-lg bg-orange-50 text-center">
              <div className="text-xs text-gray-500">{labels.errors[lang]}</div>
              <div className="text-2xl font-bold text-orange-700">{errorChars}</div>
            </div>
          </div>

          {/* Sample text display */}
          <div className="p-4 bg-gray-50 rounded-lg font-mono text-base leading-relaxed select-none">
            {sampleText.split('').map((char, i) => {
              let color = 'text-gray-400';
              if (i < userInput.length) {
                color = userInput[i] === char ? 'text-gray-900' : 'text-red-500 bg-red-100';
              } else if (i === userInput.length) {
                color = 'text-gray-900 bg-blue-200';
              }
              return <span key={i} className={color}>{char}</span>;
            })}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${sampleText.length > 0 ? (userInput.length / sampleText.length) * 100 : 0}%` }}
            />
          </div>

          {/* Input area */}
          {!isComplete ? (
            <div>
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={!startTime ? labels.ready[lang] : labels.typeHere[lang]}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base font-mono focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                disabled={isComplete}
              />
            </div>
          ) : (
            <div className="p-5 rounded-lg bg-green-50 text-center">
              <div className="text-xl font-bold text-green-700 mb-2">{labels.testComplete[lang]}</div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">{labels.wpmFull[lang]}</span>
                  <div className="text-2xl font-bold text-blue-700">{wpm}</div>
                </div>
                <div>
                  <span className="text-gray-500">{labels.accuracy[lang]}</span>
                  <div className="text-2xl font-bold text-green-700">{accuracy}%</div>
                </div>
                <div>
                  <span className="text-gray-500">{labels.characters[lang]}</span>
                  <div className="text-2xl font-bold text-gray-700">{correctChars}/{totalChars}</div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={restart}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {labels.restart[lang]}
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
