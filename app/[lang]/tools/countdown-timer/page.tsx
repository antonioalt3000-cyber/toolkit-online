'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  targetDate: { en: 'Target Date & Time', it: 'Data e Ora Obiettivo', es: 'Fecha y Hora Objetivo', fr: 'Date et Heure Cible', de: 'Zieldatum und -zeit', pt: 'Data e Hora Alvo' },
  eventName: { en: 'Event Name (optional)', it: 'Nome Evento (opzionale)', es: 'Nombre del Evento (opcional)', fr: 'Nom de l\'Événement (optionnel)', de: 'Ereignisname (optional)', pt: 'Nome do Evento (opcional)' },
  days: { en: 'Days', it: 'Giorni', es: 'Días', fr: 'Jours', de: 'Tage', pt: 'Dias' },
  hours: { en: 'Hours', it: 'Ore', es: 'Horas', fr: 'Heures', de: 'Stunden', pt: 'Horas' },
  minutes: { en: 'Minutes', it: 'Minuti', es: 'Minutos', fr: 'Minutes', de: 'Minuten', pt: 'Minutos' },
  seconds: { en: 'Seconds', it: 'Secondi', es: 'Segundos', fr: 'Secondes', de: 'Sekunden', pt: 'Segundos' },
  expired: { en: 'Countdown has ended!', it: 'Il conto alla rovescia è terminato!', es: '¡La cuenta regresiva ha terminado!', fr: 'Le compte à rebours est terminé !', de: 'Der Countdown ist abgelaufen!', pt: 'A contagem regressiva terminou!' },
  countingDown: { en: 'Counting down to', it: 'Conto alla rovescia per', es: 'Cuenta regresiva para', fr: 'Compte à rebours pour', de: 'Countdown bis', pt: 'Contagem regressiva para' },
  presets: { en: 'Quick Presets', it: 'Preimpostazioni', es: 'Preajustes Rápidos', fr: 'Préréglages', de: 'Schnellvorlagen', pt: 'Predefinições Rápidas' },
  newYear: { en: 'New Year', it: 'Capodanno', es: 'Año Nuevo', fr: 'Nouvel An', de: 'Neujahr', pt: 'Ano Novo' },
  christmas: { en: 'Christmas', it: 'Natale', es: 'Navidad', fr: 'Noël', de: 'Weihnachten', pt: 'Natal' },
  tomorrow: { en: 'Tomorrow', it: 'Domani', es: 'Mañana', fr: 'Demain', de: 'Morgen', pt: 'Amanhã' },
};

export default function CountdownTimer() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['countdown-timer'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  };

  const [targetDate, setTargetDate] = useState(getDefaultDate());
  const [eventName, setEventName] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  const calculateTimeLeft = useCallback(() => {
    const target = new Date(targetDate).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      expired: false,
    };
  }, [targetDate]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  const setPreset = (type: string) => {
    const now = new Date();
    let target: Date;
    if (type === 'newYear') {
      target = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
      setEventName(t('newYear'));
    } else if (type === 'christmas') {
      const christmas = new Date(now.getFullYear(), 11, 25, 0, 0, 0);
      target = christmas > now ? christmas : new Date(now.getFullYear() + 1, 11, 25, 0, 0, 0);
      setEventName(t('christmas'));
    } else {
      target = new Date(now);
      target.setDate(target.getDate() + 1);
      target.setHours(0, 0, 0, 0);
      setEventName(t('tomorrow'));
    }
    setTargetDate(target.toISOString().slice(0, 16));
  };

  const boxes = [
    { value: timeLeft.days, label: t('days') },
    { value: timeLeft.hours, label: t('hours') },
    { value: timeLeft.minutes, label: t('minutes') },
    { value: timeLeft.seconds, label: t('seconds') },
  ];

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Countdown Timer: Track Days, Hours, Minutes, and Seconds to Any Event',
      paragraphs: [
        'A countdown timer visually tracks the time remaining until a specific date and event. Unlike a simple clock, a countdown gives you an instant sense of urgency or anticipation, breaking down the wait into days, hours, minutes, and seconds. This makes it a popular tool for holidays, product launches, weddings, exams, and personal milestones.',
        'Our countdown timer updates in real time, ticking down every second. You can set any future date and time as your target, and optionally name the event for a personal touch. The timer calculates the exact difference between now and your target, accounting for local time zones automatically through your browser.',
        'Quick presets let you instantly set countdowns to popular dates like New Year\'s Eve and Christmas. These are great for social media sharing, classroom activities, or embedding in presentations. The "Tomorrow" preset shows how much time is left in the current day, useful for deadline tracking.',
        'Once the countdown reaches zero, a clear message indicates that the event has arrived. The timer continues to show all zeros rather than counting negative time, providing a clean endpoint. You can then set a new date to start another countdown immediately.'
      ],
      faq: [
        { q: 'Does the countdown timer work across different time zones?', a: 'The timer uses your browser\'s local time zone. When you set a target date and time, it interprets it in your local time zone. If you share the page with someone in a different time zone, they will see a slightly different countdown because their local time differs.' },
        { q: 'Will the countdown continue if I close the browser?', a: 'The countdown recalculates from scratch each time you open the page. It does not run in the background. However, since it compares the target date to the current time, it will always show the correct remaining time when you reopen the page.' },
        { q: 'Can I set a countdown for a past date?', a: 'If you set a date in the past, the timer will immediately show "Countdown has ended!" with all values at zero. The tool does not count up from a past date.' },
        { q: 'How accurate is the countdown to the second?', a: 'The timer updates once per second using JavaScript\'s setInterval. There may be a variance of up to one second due to browser scheduling, but for practical purposes it is accurate enough for everyday countdown needs.' },
        { q: 'Can I use this countdown timer for a New Year\'s Eve party?', a: 'Yes! Click the "New Year" preset to automatically set the countdown to January 1st of the next year at midnight. The event name will be filled in automatically. Display it on a screen during your party for a live countdown.' }
      ]
    },
    it: {
      title: 'Timer Conto alla Rovescia: Monitora Giorni, Ore, Minuti e Secondi fino a Qualsiasi Evento',
      paragraphs: [
        'Un timer conto alla rovescia traccia visivamente il tempo rimanente fino a una data e un evento specifici. A differenza di un semplice orologio, un conto alla rovescia dà un senso immediato di urgenza o attesa, suddividendo l\'attesa in giorni, ore, minuti e secondi. È uno strumento popolare per festività, lanci di prodotti, matrimoni, esami e traguardi personali.',
        'Il nostro timer si aggiorna in tempo reale, scorrendo ogni secondo. Puoi impostare qualsiasi data e ora futura come obiettivo, e opzionalmente dare un nome all\'evento. Il timer calcola la differenza esatta tra adesso e il tuo obiettivo, tenendo conto automaticamente del fuso orario locale.',
        'Le preimpostazioni rapide permettono di impostare istantaneamente conti alla rovescia per date popolari come Capodanno e Natale. La preimpostazione "Domani" mostra quanto tempo resta nella giornata corrente, utile per monitorare le scadenze.',
        'Quando il conto alla rovescia raggiunge lo zero, un messaggio chiaro indica che l\'evento è arrivato. Il timer mostra tutti zeri anziché contare in negativo. Puoi poi impostare una nuova data per avviare immediatamente un altro conto alla rovescia.'
      ],
      faq: [
        { q: 'Il timer funziona con fusi orari diversi?', a: 'Il timer usa il fuso orario locale del tuo browser. Quando imposti una data, viene interpretata nel tuo fuso orario locale. Se condividi la pagina con qualcuno in un altro fuso orario, vedrà un conto alla rovescia leggermente diverso.' },
        { q: 'Il conto alla rovescia continua se chiudo il browser?', a: 'Il timer ricalcola tutto ogni volta che apri la pagina. Non funziona in background. Tuttavia, poiché confronta la data obiettivo con l\'ora attuale, mostrerà sempre il tempo rimanente corretto quando riapri la pagina.' },
        { q: 'Posso impostare un conto alla rovescia per una data passata?', a: 'Se imposti una data nel passato, il timer mostrerà immediatamente "Il conto alla rovescia è terminato!" con tutti i valori a zero.' },
        { q: 'Quanto è preciso il conto alla rovescia al secondo?', a: 'Il timer si aggiorna una volta al secondo usando setInterval di JavaScript. Potrebbe esserci una variazione fino a un secondo, ma per scopi pratici è sufficientemente preciso.' },
        { q: 'Posso usare questo timer per una festa di Capodanno?', a: 'Sì! Clicca la preimpostazione "Capodanno" per impostare automaticamente il conto alla rovescia al 1° gennaio dell\'anno successivo a mezzanotte. Proiettalo su uno schermo durante la festa!' }
      ]
    },
    es: {
      title: 'Temporizador de Cuenta Regresiva: Rastrea Días, Horas, Minutos y Segundos hasta Cualquier Evento',
      paragraphs: [
        'Un temporizador de cuenta regresiva rastrea visualmente el tiempo restante hasta una fecha y evento específicos. A diferencia de un simple reloj, una cuenta regresiva da una sensación inmediata de urgencia o anticipación, desglosando la espera en días, horas, minutos y segundos. Es popular para festividades, lanzamientos de productos, bodas, exámenes e hitos personales.',
        'Nuestro temporizador se actualiza en tiempo real, avanzando cada segundo. Puedes establecer cualquier fecha y hora futura como objetivo, y opcionalmente nombrar el evento. El temporizador calcula la diferencia exacta entre ahora y tu objetivo, teniendo en cuenta automáticamente la zona horaria local.',
        'Los preajustes rápidos permiten configurar instantáneamente cuentas regresivas para fechas populares como Año Nuevo y Navidad. El preajuste "Mañana" muestra cuánto tiempo queda en el día actual, útil para rastrear plazos.',
        'Cuando la cuenta regresiva llega a cero, un mensaje claro indica que el evento ha llegado. El temporizador muestra todos los valores en cero en lugar de contar en negativo. Luego puedes establecer una nueva fecha para iniciar otra cuenta regresiva.'
      ],
      faq: [
        { q: '¿El temporizador funciona con diferentes zonas horarias?', a: 'El temporizador usa la zona horaria local de tu navegador. Cuando estableces una fecha, se interpreta en tu zona horaria local. Si compartes la página con alguien en otra zona horaria, verá una cuenta regresiva ligeramente diferente.' },
        { q: '¿La cuenta regresiva continúa si cierro el navegador?', a: 'El temporizador recalcula todo cada vez que abres la página. No funciona en segundo plano. Sin embargo, siempre mostrará el tiempo restante correcto al reabrir la página.' },
        { q: '¿Puedo establecer una cuenta regresiva para una fecha pasada?', a: 'Si estableces una fecha pasada, el temporizador mostrará inmediatamente "¡La cuenta regresiva ha terminado!" con todos los valores en cero.' },
        { q: '¿Qué tan preciso es el temporizador al segundo?', a: 'Se actualiza una vez por segundo usando setInterval de JavaScript. Puede haber una variación de hasta un segundo, pero es suficientemente preciso para uso cotidiano.' },
        { q: '¿Puedo usar este temporizador para una fiesta de Año Nuevo?', a: '¡Sí! Haz clic en el preajuste "Año Nuevo" para configurar automáticamente la cuenta regresiva al 1 de enero a medianoche. ¡Proyéctalo en una pantalla durante tu fiesta!' }
      ]
    },
    fr: {
      title: 'Compte à Rebours : Suivez les Jours, Heures, Minutes et Secondes jusqu\'à Tout Événement',
      paragraphs: [
        'Un compte à rebours suit visuellement le temps restant jusqu\'à une date et un événement spécifiques. Contrairement à une simple horloge, il donne un sens immédiat d\'urgence ou d\'anticipation, décomposant l\'attente en jours, heures, minutes et secondes. C\'est un outil populaire pour les fêtes, lancements de produits, mariages, examens et jalons personnels.',
        'Notre minuterie se met à jour en temps réel, décomptant chaque seconde. Vous pouvez définir n\'importe quelle date et heure future comme cible, et optionnellement nommer l\'événement. Le minuteur calcule la différence exacte entre maintenant et votre cible.',
        'Les préréglages rapides permettent de configurer instantanément des comptes à rebours pour des dates populaires comme le Nouvel An et Noël. Le préréglage "Demain" montre combien de temps il reste dans la journée, utile pour suivre les échéances.',
        'Lorsque le compte à rebours atteint zéro, un message clair indique que l\'événement est arrivé. Le minuteur affiche tous les zéros plutôt que de compter en négatif. Vous pouvez ensuite définir une nouvelle date pour lancer immédiatement un autre compte à rebours.'
      ],
      faq: [
        { q: 'Le minuteur fonctionne-t-il avec différents fuseaux horaires ?', a: 'Le minuteur utilise le fuseau horaire local de votre navigateur. Quand vous définissez une date, elle est interprétée dans votre fuseau local.' },
        { q: 'Le compte à rebours continue-t-il si je ferme le navigateur ?', a: 'Le minuteur recalcule tout à chaque ouverture de la page. Il ne fonctionne pas en arrière-plan, mais affichera toujours le temps restant correct à la réouverture.' },
        { q: 'Puis-je définir un compte à rebours pour une date passée ?', a: 'Si vous définissez une date passée, le minuteur affichera immédiatement "Le compte à rebours est terminé !" avec toutes les valeurs à zéro.' },
        { q: 'Quelle est la précision du compte à rebours à la seconde ?', a: 'Il se met à jour une fois par seconde. Il peut y avoir une variation d\'une seconde, mais c\'est suffisamment précis pour un usage quotidien.' },
        { q: 'Puis-je utiliser ce minuteur pour une fête du Nouvel An ?', a: 'Oui ! Cliquez sur le préréglage "Nouvel An" pour configurer automatiquement le compte à rebours au 1er janvier à minuit. Affichez-le sur un écran pendant votre fête !' }
      ]
    },
    de: {
      title: 'Countdown-Timer: Verfolgen Sie Tage, Stunden, Minuten und Sekunden bis zu Jedem Ereignis',
      paragraphs: [
        'Ein Countdown-Timer verfolgt visuell die verbleibende Zeit bis zu einem bestimmten Datum und Ereignis. Im Gegensatz zu einer einfachen Uhr vermittelt ein Countdown ein sofortiges Gefühl von Dringlichkeit oder Vorfreude, indem er die Wartezeit in Tage, Stunden, Minuten und Sekunden aufschlüsselt. Beliebt für Feiertage, Produkteinführungen, Hochzeiten, Prüfungen und persönliche Meilensteine.',
        'Unser Timer aktualisiert sich in Echtzeit und zählt jede Sekunde herunter. Sie können jedes zukünftige Datum und jede Uhrzeit als Ziel festlegen und optional das Ereignis benennen. Der Timer berechnet die genaue Differenz zwischen jetzt und Ihrem Ziel.',
        'Schnellvorlagen ermöglichen sofortige Countdowns zu beliebten Daten wie Silvester und Weihnachten. Die Vorlage "Morgen" zeigt, wie viel Zeit im aktuellen Tag verbleibt — nützlich für die Fristenverfolgung.',
        'Wenn der Countdown Null erreicht, zeigt eine klare Nachricht an, dass das Ereignis eingetroffen ist. Der Timer zeigt alle Nullen statt negative Zeit. Sie können dann ein neues Datum setzen, um sofort einen weiteren Countdown zu starten.'
      ],
      faq: [
        { q: 'Funktioniert der Timer mit verschiedenen Zeitzonen?', a: 'Der Timer verwendet die lokale Zeitzone Ihres Browsers. Wenn Sie ein Datum festlegen, wird es in Ihrer lokalen Zeitzone interpretiert.' },
        { q: 'Läuft der Countdown weiter, wenn ich den Browser schließe?', a: 'Der Timer berechnet alles bei jedem Seitenaufruf neu. Er läuft nicht im Hintergrund, zeigt aber beim erneuten Öffnen immer die korrekte verbleibende Zeit an.' },
        { q: 'Kann ich einen Countdown für ein vergangenes Datum setzen?', a: 'Wenn Sie ein vergangenes Datum setzen, zeigt der Timer sofort "Der Countdown ist abgelaufen!" mit allen Werten auf Null.' },
        { q: 'Wie genau ist der Countdown auf die Sekunde?', a: 'Er aktualisiert sich einmal pro Sekunde. Es kann eine Abweichung von bis zu einer Sekunde geben, aber für den alltäglichen Gebrauch ist er genau genug.' },
        { q: 'Kann ich diesen Timer für eine Silvesterfeier verwenden?', a: 'Ja! Klicken Sie auf die Vorlage "Neujahr", um automatisch den Countdown zum 1. Januar um Mitternacht einzustellen. Zeigen Sie ihn auf einem Bildschirm während Ihrer Feier!' }
      ]
    },
    pt: {
      title: 'Temporizador Regressivo: Acompanhe Dias, Horas, Minutos e Segundos até Qualquer Evento',
      paragraphs: [
        'Um temporizador regressivo rastreia visualmente o tempo restante até uma data e evento específicos. Diferente de um simples relógio, uma contagem regressiva dá uma sensação imediata de urgência ou antecipação, dividindo a espera em dias, horas, minutos e segundos. É popular para feriados, lançamentos de produtos, casamentos, provas e marcos pessoais.',
        'Nosso temporizador se atualiza em tempo real, avançando a cada segundo. Você pode definir qualquer data e hora futura como alvo, e opcionalmente nomear o evento. O temporizador calcula a diferença exata entre agora e seu alvo, considerando automaticamente o fuso horário local.',
        'As predefinições rápidas permitem configurar instantaneamente contagens regressivas para datas populares como Ano Novo e Natal. A predefinição "Amanhã" mostra quanto tempo resta no dia atual, útil para acompanhar prazos.',
        'Quando a contagem regressiva chega a zero, uma mensagem clara indica que o evento chegou. O temporizador mostra todos os valores em zero em vez de contar em negativo. Você pode então definir uma nova data para iniciar outra contagem regressiva.'
      ],
      faq: [
        { q: 'O temporizador funciona com diferentes fusos horários?', a: 'O temporizador usa o fuso horário local do seu navegador. Quando você define uma data, ela é interpretada no seu fuso horário local.' },
        { q: 'A contagem regressiva continua se eu fechar o navegador?', a: 'O temporizador recalcula tudo cada vez que você abre a página. Não funciona em segundo plano, mas sempre mostrará o tempo restante correto ao reabrir.' },
        { q: 'Posso definir uma contagem regressiva para uma data passada?', a: 'Se você definir uma data passada, o temporizador mostrará imediatamente "A contagem regressiva terminou!" com todos os valores em zero.' },
        { q: 'Qual a precisão do temporizador ao segundo?', a: 'Ele se atualiza uma vez por segundo. Pode haver uma variação de até um segundo, mas é preciso o suficiente para uso cotidiano.' },
        { q: 'Posso usar este temporizador para uma festa de Ano Novo?', a: 'Sim! Clique na predefinição "Ano Novo" para configurar automaticamente a contagem regressiva para 1º de janeiro à meia-noite. Projete numa tela durante sua festa!' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="countdown-timer" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('eventName')}</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('targetDate')}</label>
            <input
              type="datetime-local"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('presets')}</label>
            <div className="flex gap-2">
              {['newYear', 'christmas', 'tomorrow'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setPreset(preset)}
                  className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
                >
                  {t(preset)}
                </button>
              ))}
            </div>
          </div>

          {eventName && (
            <p className="text-center text-gray-600">
              {t('countingDown')} <strong>{eventName}</strong>
            </p>
          )}

          {timeLeft.expired ? (
            <div className="p-6 bg-green-50 rounded-lg text-center">
              <p className="text-xl font-bold text-green-600">{t('expired')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {boxes.map(({ value, label }) => (
                <div key={label} className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-4xl font-bold text-blue-600 font-mono">
                    {String(value).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-600 mt-1 uppercase tracking-wide">{label}</div>
                </div>
              ))}
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
