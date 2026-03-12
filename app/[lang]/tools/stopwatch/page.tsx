'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  start: { en: 'Start', it: 'Avvia', es: 'Iniciar', fr: 'Démarrer', de: 'Start', pt: 'Iniciar' },
  stop: { en: 'Stop', it: 'Ferma', es: 'Detener', fr: 'Arrêter', de: 'Stopp', pt: 'Parar' },
  reset: { en: 'Reset', it: 'Reset', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Reiniciar' },
  lap: { en: 'Lap', it: 'Giro', es: 'Vuelta', fr: 'Tour', de: 'Runde', pt: 'Volta' },
  lapTimes: { en: 'Lap Times', it: 'Tempi Giro', es: 'Tiempos de Vuelta', fr: 'Temps au Tour', de: 'Rundenzeiten', pt: 'Tempos de Volta' },
  lapNumber: { en: 'Lap', it: 'Giro', es: 'Vuelta', fr: 'Tour', de: 'Runde', pt: 'Volta' },
  lapTime: { en: 'Lap Time', it: 'Tempo Giro', es: 'Tiempo Vuelta', fr: 'Temps Tour', de: 'Rundenzeit', pt: 'Tempo Volta' },
  totalTime: { en: 'Total Time', it: 'Tempo Totale', es: 'Tiempo Total', fr: 'Temps Total', de: 'Gesamtzeit', pt: 'Tempo Total' },
};

function formatTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
}

export default function Stopwatch() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['stopwatch'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<{ lapTime: number; totalTime: number }[]>([]);
  const startTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const tick = useCallback(() => {
    const now = performance.now();
    const newElapsed = elapsedRef.current + (now - startTimeRef.current);
    setElapsed(newElapsed);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    startTimeRef.current = performance.now();
    setRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    elapsedRef.current = elapsedRef.current + (performance.now() - startTimeRef.current);
    setElapsed(elapsedRef.current);
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
    setElapsed(0);
    elapsedRef.current = 0;
    startTimeRef.current = 0;
    setLaps([]);
  }, []);

  const recordLap = useCallback(() => {
    const currentTotal = elapsedRef.current + (performance.now() - startTimeRef.current);
    const prevTotal = laps.length > 0 ? laps[0].totalTime : 0;
    setLaps((prev) => [{ lapTime: currentTotal - prevTotal, totalTime: currentTotal }, ...prev]);
  }, [laps]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Online Stopwatch: Precise Timing with Lap Recording',
      paragraphs: [
        'A stopwatch is an essential timing tool used in sports, cooking, scientific experiments, productivity techniques, and countless everyday tasks. Unlike a countdown timer that counts down to zero, a stopwatch counts up from zero, measuring the exact duration of an activity or event. Our online stopwatch provides precision timing directly in your browser with no installation required.',
        'The stopwatch displays time in HH:MM:SS.ms format, showing hours, minutes, seconds, and centiseconds (hundredths of a second). It uses the browser\'s high-resolution performance timer (performance.now()) combined with requestAnimationFrame for smooth, accurate updates. This approach avoids the timing drift that can occur with setInterval and provides the most precise timing available in a web browser.',
        'The lap feature allows you to record split times while the stopwatch continues running. Each lap records both the individual lap duration and the cumulative total time. Laps are displayed in reverse chronological order (newest first) for easy reading. This is particularly useful for runners tracking mile splits, swimmers timing laps, or anyone measuring repeated intervals.',
        'Controls are intuitive: Start begins timing, Stop pauses without resetting, allowing you to resume later. Reset clears everything back to zero. The Lap button records a split time without interrupting the stopwatch. The large, clear display makes it easy to read the time even from a distance, making it suitable for use in classrooms, gyms, and presentation settings. All timing happens client-side with zero network latency.'
      ],
      faq: [
        { q: 'How accurate is this online stopwatch?', a: 'The stopwatch uses performance.now() and requestAnimationFrame for timing, which provides sub-millisecond precision. The display updates at 60fps (approximately every 16ms). For practical purposes, it is accurate to within a few hundredths of a second.' },
        { q: 'Will the stopwatch keep running if I switch browser tabs?', a: 'Modern browsers may throttle requestAnimationFrame when a tab is in the background. However, since the stopwatch calculates elapsed time from timestamps rather than counting intervals, the displayed time will be correct when you return to the tab.' },
        { q: 'What is the maximum time the stopwatch can measure?', a: 'The stopwatch can run for many hours without issues. JavaScript numbers can accurately represent milliseconds for periods well beyond 24 hours. The display format supports up to 99:59:59.99.' },
        { q: 'Can I use the lap feature while the stopwatch is stopped?', a: 'The lap button is only active while the stopwatch is running. You need to have the stopwatch running to record lap times. This prevents accidental lap recordings when the timer is paused.' },
        { q: 'Does the stopwatch continue after I close the browser?', a: 'No. The stopwatch runs entirely in your browser and does not persist across sessions. If you close the tab or browser, the timing data is lost. For persistent timing, consider using a dedicated timing application.' }
      ]
    },
    it: {
      title: 'Cronometro Online: Misurazione Precisa con Registrazione Giri',
      paragraphs: [
        'Un cronometro è uno strumento di misurazione del tempo essenziale usato nello sport, in cucina, negli esperimenti scientifici, nelle tecniche di produttività e in innumerevoli attività quotidiane. A differenza di un timer che conta alla rovescia verso lo zero, un cronometro conta in avanti dallo zero, misurando la durata esatta di un\'attività. Il nostro cronometro online fornisce una misurazione precisa direttamente nel browser.',
        'Il cronometro visualizza il tempo nel formato HH:MM:SS.ms, mostrando ore, minuti, secondi e centesimi di secondo. Usa il timer ad alta risoluzione del browser (performance.now()) combinato con requestAnimationFrame per aggiornamenti fluidi e precisi. Questo approccio evita la deriva temporale che può verificarsi con setInterval.',
        'La funzione giro permette di registrare tempi intermedi mentre il cronometro continua a scorrere. Ogni giro registra sia la durata individuale del giro che il tempo totale cumulativo. I giri vengono visualizzati in ordine cronologico inverso. Questo è particolarmente utile per corridori, nuotatori e chiunque misuri intervalli ripetuti.',
        'I controlli sono intuitivi: Avvia inizia la misurazione, Ferma mette in pausa senza resettare, permettendo di riprendere. Reset cancella tutto. Il pulsante Giro registra un tempo intermedio senza interrompere il cronometro. Il display grande e chiaro rende facile la lettura anche a distanza.'
      ],
      faq: [
        { q: 'Quanto è preciso questo cronometro online?', a: 'Usa performance.now() e requestAnimationFrame, che forniscono precisione sub-millisecondo. Il display si aggiorna a 60fps. Per scopi pratici, è preciso entro pochi centesimi di secondo.' },
        { q: 'Il cronometro continua se cambio scheda del browser?', a: 'I browser moderni possono rallentare requestAnimationFrame quando una scheda è in background. Tuttavia, poiché il cronometro calcola il tempo trascorso dai timestamp, il tempo mostrato sarà corretto quando torni alla scheda.' },
        { q: 'Qual è il tempo massimo misurabile?', a: 'Il cronometro può funzionare per molte ore senza problemi. Il formato del display supporta fino a 99:59:59.99.' },
        { q: 'Posso usare la funzione giro quando il cronometro è fermo?', a: 'Il pulsante giro è attivo solo quando il cronometro è in funzione. Questo previene registrazioni accidentali quando il timer è in pausa.' },
        { q: 'Il cronometro continua dopo che chiudo il browser?', a: 'No. Il cronometro funziona interamente nel browser e non persiste tra le sessioni. Se chiudi la scheda, i dati di temporizzazione vengono persi.' }
      ]
    },
    es: {
      title: 'Cronómetro Online: Temporización Precisa con Registro de Vueltas',
      paragraphs: [
        'Un cronómetro es una herramienta de medición de tiempo esencial utilizada en deportes, cocina, experimentos científicos, técnicas de productividad e innumerables tareas cotidianas. A diferencia de un temporizador que cuenta hacia atrás, un cronómetro cuenta hacia adelante desde cero, midiendo la duración exacta de una actividad. Nuestro cronómetro online proporciona temporización precisa directamente en tu navegador.',
        'El cronómetro muestra el tiempo en formato HH:MM:SS.ms, mostrando horas, minutos, segundos y centésimas de segundo. Usa el temporizador de alta resolución del navegador (performance.now()) combinado con requestAnimationFrame para actualizaciones suaves y precisas.',
        'La función de vuelta permite registrar tiempos parciales mientras el cronómetro sigue corriendo. Cada vuelta registra tanto la duración individual como el tiempo total acumulado. Las vueltas se muestran en orden cronológico inverso. Esto es particularmente útil para corredores, nadadores y cualquier persona que mida intervalos repetidos.',
        'Los controles son intuitivos: Iniciar comienza la temporización, Detener pausa sin reiniciar, permitiendo reanudar. Reiniciar borra todo. El botón Vuelta registra un tiempo parcial sin interrumpir el cronómetro. La pantalla grande y clara facilita la lectura incluso a distancia.'
      ],
      faq: [
        { q: '¿Qué tan preciso es este cronómetro online?', a: 'Usa performance.now() y requestAnimationFrame, que proporcionan precisión sub-milisegundo. La pantalla se actualiza a 60fps. Es preciso dentro de unas pocas centésimas de segundo.' },
        { q: '¿El cronómetro sigue funcionando si cambio de pestaña?', a: 'Los navegadores modernos pueden ralentizar requestAnimationFrame en segundo plano. Sin embargo, el tiempo mostrado será correcto al volver a la pestaña.' },
        { q: '¿Cuál es el tiempo máximo que puede medir?', a: 'El cronómetro puede funcionar durante muchas horas. El formato de visualización soporta hasta 99:59:59.99.' },
        { q: '¿Puedo usar la función de vuelta cuando el cronómetro está detenido?', a: 'El botón de vuelta solo está activo mientras el cronómetro está corriendo. Esto previene registros accidentales.' },
        { q: '¿El cronómetro continúa después de cerrar el navegador?', a: 'No. El cronómetro funciona enteramente en tu navegador y no persiste entre sesiones.' }
      ]
    },
    fr: {
      title: 'Chronomètre en Ligne : Chronométrage Précis avec Enregistrement des Tours',
      paragraphs: [
        'Un chronomètre est un outil de chronométrage essentiel utilisé dans le sport, la cuisine, les expériences scientifiques, les techniques de productivité et d\'innombrables tâches quotidiennes. Contrairement à un minuteur qui compte à rebours, un chronomètre compte à partir de zéro, mesurant la durée exacte d\'une activité. Notre chronomètre en ligne fournit un chronométrage précis directement dans votre navigateur.',
        'Le chronomètre affiche le temps au format HH:MM:SS.ms, montrant heures, minutes, secondes et centièmes de seconde. Il utilise le minuteur haute résolution du navigateur (performance.now()) combiné avec requestAnimationFrame pour des mises à jour fluides et précises.',
        'La fonction tour permet d\'enregistrer des temps intermédiaires pendant que le chronomètre continue. Chaque tour enregistre la durée individuelle et le temps total cumulé. Les tours sont affichés en ordre chronologique inverse. C\'est particulièrement utile pour les coureurs, nageurs et quiconque mesure des intervalles répétés.',
        'Les contrôles sont intuitifs : Démarrer lance le chronométrage, Arrêter met en pause sans réinitialiser. Réinitialiser efface tout. Le bouton Tour enregistre un temps intermédiaire sans interrompre le chronomètre. Le grand affichage clair facilite la lecture même à distance.'
      ],
      faq: [
        { q: 'Quelle est la précision de ce chronomètre en ligne ?', a: 'Il utilise performance.now() et requestAnimationFrame, offrant une précision sub-milliseconde. L\'affichage se met à jour à 60fps. Il est précis à quelques centièmes de seconde près.' },
        { q: 'Le chronomètre continue-t-il si je change d\'onglet ?', a: 'Les navigateurs modernes peuvent ralentir requestAnimationFrame en arrière-plan. Cependant, le temps affiché sera correct lorsque vous revenez à l\'onglet.' },
        { q: 'Quel est le temps maximum mesurable ?', a: 'Le chronomètre peut fonctionner pendant de nombreuses heures. Le format d\'affichage supporte jusqu\'à 99:59:59.99.' },
        { q: 'Puis-je utiliser la fonction tour quand le chronomètre est arrêté ?', a: 'Le bouton tour n\'est actif que pendant le fonctionnement du chronomètre. Cela évite les enregistrements accidentels.' },
        { q: 'Le chronomètre continue-t-il après la fermeture du navigateur ?', a: 'Non. Le chronomètre fonctionne entièrement dans votre navigateur et ne persiste pas entre les sessions.' }
      ]
    },
    de: {
      title: 'Online-Stoppuhr: Präzise Zeitmessung mit Rundenaufzeichnung',
      paragraphs: [
        'Eine Stoppuhr ist ein wesentliches Zeitmesswerkzeug, das im Sport, beim Kochen, bei wissenschaftlichen Experimenten, bei Produktivitätstechniken und unzähligen Alltagsaufgaben verwendet wird. Im Gegensatz zu einem Countdown-Timer, der auf Null herunterzählt, zählt eine Stoppuhr von Null aufwärts und misst die genaue Dauer einer Aktivität. Unsere Online-Stoppuhr bietet präzise Zeitmessung direkt im Browser.',
        'Die Stoppuhr zeigt die Zeit im Format HH:MM:SS.ms an und zeigt Stunden, Minuten, Sekunden und Hundertstelsekunden. Sie verwendet den hochauflösenden Timer des Browsers (performance.now()) kombiniert mit requestAnimationFrame für flüssige, genaue Aktualisierungen.',
        'Die Rundenfunktion ermöglicht es, Zwischenzeiten aufzuzeichnen, während die Stoppuhr weiterläuft. Jede Runde erfasst sowohl die individuelle Rundendauer als auch die kumulative Gesamtzeit. Runden werden in umgekehrter chronologischer Reihenfolge angezeigt. Besonders nützlich für Läufer, Schwimmer und alle, die wiederholte Intervalle messen.',
        'Die Steuerung ist intuitiv: Start beginnt die Zeitmessung, Stopp pausiert ohne Zurücksetzen. Zurücksetzen löscht alles. Der Runden-Button zeichnet eine Zwischenzeit auf, ohne die Stoppuhr zu unterbrechen. Das große, klare Display ermöglicht das Ablesen auch aus der Entfernung.'
      ],
      faq: [
        { q: 'Wie genau ist diese Online-Stoppuhr?', a: 'Sie verwendet performance.now() und requestAnimationFrame, die Sub-Millisekunden-Präzision bieten. Das Display aktualisiert sich bei 60fps. Sie ist auf wenige Hundertstelsekunden genau.' },
        { q: 'Läuft die Stoppuhr weiter, wenn ich den Browser-Tab wechsle?', a: 'Moderne Browser können requestAnimationFrame im Hintergrund drosseln. Die angezeigte Zeit ist jedoch korrekt, wenn Sie zum Tab zurückkehren.' },
        { q: 'Was ist die maximale messbare Zeit?', a: 'Die Stoppuhr kann viele Stunden laufen. Das Anzeigeformat unterstützt bis zu 99:59:59.99.' },
        { q: 'Kann ich die Rundenfunktion nutzen, wenn die Stoppuhr gestoppt ist?', a: 'Der Runden-Button ist nur aktiv, wenn die Stoppuhr läuft. Dies verhindert versehentliche Aufzeichnungen.' },
        { q: 'Läuft die Stoppuhr weiter, nachdem ich den Browser geschlossen habe?', a: 'Nein. Die Stoppuhr läuft vollständig im Browser und bleibt nicht zwischen Sitzungen erhalten.' }
      ]
    },
    pt: {
      title: 'Cronômetro Online: Temporização Precisa com Registro de Voltas',
      paragraphs: [
        'Um cronômetro é uma ferramenta essencial de temporização usada em esportes, culinária, experimentos científicos, técnicas de produtividade e inúmeras tarefas do dia a dia. Diferente de um temporizador regressivo que conta até zero, um cronômetro conta a partir de zero, medindo a duração exata de uma atividade. Nosso cronômetro online fornece temporização precisa diretamente no seu navegador.',
        'O cronômetro exibe o tempo no formato HH:MM:SS.ms, mostrando horas, minutos, segundos e centésimos de segundo. Ele usa o temporizador de alta resolução do navegador (performance.now()) combinado com requestAnimationFrame para atualizações suaves e precisas.',
        'A função de volta permite registrar tempos parciais enquanto o cronômetro continua. Cada volta registra tanto a duração individual quanto o tempo total acumulado. As voltas são exibidas em ordem cronológica inversa. Particularmente útil para corredores, nadadores e qualquer pessoa medindo intervalos repetidos.',
        'Os controles são intuitivos: Iniciar começa a temporização, Parar pausa sem reiniciar. Reiniciar limpa tudo. O botão Volta registra um tempo parcial sem interromper o cronômetro. O display grande e claro facilita a leitura mesmo à distância.'
      ],
      faq: [
        { q: 'Qual a precisão deste cronômetro online?', a: 'Usa performance.now() e requestAnimationFrame, que fornecem precisão sub-milissegundo. O display atualiza a 60fps. É preciso dentro de alguns centésimos de segundo.' },
        { q: 'O cronômetro continua se eu trocar de aba?', a: 'Navegadores modernos podem reduzir requestAnimationFrame em segundo plano. Porém, o tempo exibido será correto ao retornar à aba.' },
        { q: 'Qual o tempo máximo que pode medir?', a: 'O cronômetro pode funcionar por muitas horas. O formato de exibição suporta até 99:59:59.99.' },
        { q: 'Posso usar a função de volta quando o cronômetro está parado?', a: 'O botão de volta só está ativo enquanto o cronômetro está funcionando. Isso previne registros acidentais.' },
        { q: 'O cronômetro continua após fechar o navegador?', a: 'Não. O cronômetro funciona inteiramente no seu navegador e não persiste entre sessões.' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="stopwatch" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Time Display */}
          <div className="bg-gray-900 rounded-xl p-8 text-center">
            <div className="text-5xl md:text-6xl font-mono font-bold text-white tracking-wider">
              {formatTime(elapsed)}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {!running ? (
              <button onClick={start} className="flex-1 bg-green-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-green-700 transition-colors text-lg">
                {t('start')}
              </button>
            ) : (
              <button onClick={stop} className="flex-1 bg-red-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-red-700 transition-colors text-lg">
                {t('stop')}
              </button>
            )}
            <button onClick={recordLap} disabled={!running} className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-blue-700 transition-colors text-lg disabled:opacity-40 disabled:cursor-not-allowed">
              {t('lap')}
            </button>
            <button onClick={reset} className="flex-1 bg-gray-200 text-gray-700 rounded-lg px-4 py-3 font-medium hover:bg-gray-300 transition-colors text-lg">
              {t('reset')}
            </button>
          </div>

          {/* Laps */}
          {laps.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('lapTimes')}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2">#</th>
                      <th className="text-right py-2 px-2">{t('lapTime')}</th>
                      <th className="text-right py-2 px-2">{t('totalTime')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {laps.map((lap, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-2 px-2 font-medium">{t('lapNumber')} {laps.length - i}</td>
                        <td className="text-right py-2 px-2 font-mono">{formatTime(lap.lapTime)}</td>
                        <td className="text-right py-2 px-2 font-mono text-gray-500">{formatTime(lap.totalTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
