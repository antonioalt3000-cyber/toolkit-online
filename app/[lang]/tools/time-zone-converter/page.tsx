'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  fromZone: { en: 'From Time Zone', it: 'Da Fuso Orario', es: 'Desde Zona Horaria', fr: 'Fuseau Horaire Source', de: 'Von Zeitzone', pt: 'Do Fuso Horário' },
  toZone: { en: 'To Time Zone', it: 'A Fuso Orario', es: 'A Zona Horaria', fr: 'Fuseau Horaire Cible', de: 'Zu Zeitzone', pt: 'Para Fuso Horário' },
  time: { en: 'Time', it: 'Ora', es: 'Hora', fr: 'Heure', de: 'Uhrzeit', pt: 'Hora' },
  date: { en: 'Date', it: 'Data', es: 'Fecha', fr: 'Date', de: 'Datum', pt: 'Data' },
  convertedTime: { en: 'Converted Time', it: 'Ora Convertita', es: 'Hora Convertida', fr: 'Heure Convertie', de: 'Konvertierte Zeit', pt: 'Hora Convertida' },
};

const zones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Lisbon',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export default function TimeZoneConverter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['time-zone-converter'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const now = new Date();
  const [fromZone, setFromZone] = useState('Europe/London');
  const [toZone, setToZone] = useState('America/New_York');
  const [date, setDate] = useState(now.toISOString().split('T')[0]);
  const [time, setTime] = useState(now.toTimeString().slice(0, 5));

  const converted = useMemo(() => {
    try {
      const dateTimeStr = `${date}T${time}:00`;
      const toFormatter = new Intl.DateTimeFormat(lang, {
        timeZone: toZone,
        weekday: 'long',
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      });

      const tempDate = new Date(dateTimeStr);
      const utcStr = tempDate.toLocaleString('en-US', { timeZone: fromZone });
      const localStr = tempDate.toLocaleString('en-US', { timeZone: 'UTC' });
      const fromDate = new Date(utcStr);
      const utcDate = new Date(localStr);
      const offset = utcDate.getTime() - fromDate.getTime();
      const adjustedDate = new Date(tempDate.getTime() + offset);

      return toFormatter.format(adjustedDate);
    } catch {
      return '—';
    }
  }, [date, time, fromZone, toZone, lang]);

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Time Zone Converter: Convert Time Between Cities Worldwide',
      paragraphs: [
        'Working across time zones is a daily challenge for remote teams, international businesses, and travelers. Our free time zone converter lets you instantly find what time it is in any city around the world, helping you schedule meetings, plan calls, and coordinate across borders without confusion.',
        'The tool supports 18 major time zones covering all inhabited continents, from UTC to Pacific/Auckland. Simply select your source time zone, enter the date and time, and choose the destination time zone to see the converted result. The output is formatted in your language with the full weekday, date, and time for clarity.',
        'Daylight saving time (DST) transitions can make time zone calculations tricky. Our converter uses the browser\'s built-in Intl.DateTimeFormat API, which automatically accounts for DST rules in each time zone. This means you get accurate results whether you\'re converting during summer time in Europe or standard time in North America.',
        'Whether you\'re scheduling a video call between New York and Tokyo, planning a flight from London to Sydney, or coordinating a product launch across multiple continents, this time zone converter eliminates the mental math and potential errors of manual conversion.',
      ],
      faq: [
        { q: 'How does daylight saving time affect time zone conversions?', a: 'Our tool automatically accounts for daylight saving time (DST) transitions. The browser\'s Intl API knows the DST rules for each time zone, so conversions are accurate year-round, even during spring and fall transitions.' },
        { q: 'What is UTC and why is it important?', a: 'UTC (Coordinated Universal Time) is the global time standard from which all other time zones are calculated as offsets. It does not observe daylight saving time, making it the preferred reference for international scheduling, aviation, and computing.' },
        { q: 'How do I convert time between New York and London?', a: 'Select "America/New_York" as the source and "Europe/London" as the destination. London is typically 5 hours ahead of New York (EST), or 4 hours ahead during British Summer Time when both regions observe DST.' },
        { q: 'Why do some countries have half-hour or quarter-hour time zone offsets?', a: 'Countries like India (UTC+5:30), Nepal (UTC+5:45), and parts of Australia use non-standard offsets for historical, geographical, or political reasons. Our converter handles these correctly through the IANA time zone database.' },
        { q: 'Can I use this tool to plan international meetings?', a: 'Yes, this tool is ideal for planning international meetings. Enter the proposed meeting time in your local time zone, then check what time it would be for participants in other time zones to find a suitable slot for everyone.' },
      ],
    },
    it: {
      title: 'Convertitore di Fuso Orario: Converti l\'Ora tra Città di Tutto il Mondo',
      paragraphs: [
        'Lavorare attraverso fusi orari diversi è una sfida quotidiana per team remoti, aziende internazionali e viaggiatori. Il nostro convertitore di fuso orario gratuito ti permette di scoprire istantaneamente che ora è in qualsiasi città del mondo, aiutandoti a programmare riunioni, pianificare chiamate e coordinarti oltre i confini senza confusione.',
        'Lo strumento supporta 18 fusi orari principali che coprono tutti i continenti abitati, da UTC a Pacific/Auckland. Seleziona il fuso orario di origine, inserisci data e ora, e scegli il fuso orario di destinazione per vedere il risultato convertito. L\'output è formattato nella tua lingua con giorno della settimana, data e ora completi.',
        'Le transizioni dell\'ora legale possono rendere complicati i calcoli dei fusi orari. Il nostro convertitore utilizza l\'API Intl.DateTimeFormat integrata nel browser, che tiene automaticamente conto delle regole dell\'ora legale in ogni fuso orario. Questo significa che ottieni risultati accurati sia durante l\'ora estiva in Europa che durante l\'ora standard in Nord America.',
        'Che tu stia programmando una videochiamata tra New York e Tokyo, pianificando un volo da Londra a Sydney, o coordinando un lancio di prodotto su più continenti, questo convertitore elimina il calcolo mentale e i potenziali errori della conversione manuale.',
      ],
      faq: [
        { q: 'Come influisce l\'ora legale sulle conversioni di fuso orario?', a: 'Il nostro strumento tiene automaticamente conto delle transizioni dell\'ora legale. L\'API Intl del browser conosce le regole dell\'ora legale per ogni fuso orario, quindi le conversioni sono accurate tutto l\'anno.' },
        { q: 'Cos\'è l\'UTC e perché è importante?', a: 'UTC (Tempo Coordinato Universale) è lo standard temporale globale dal quale tutti gli altri fusi orari sono calcolati come offset. Non osserva l\'ora legale, rendendolo il riferimento preferito per la programmazione internazionale, l\'aviazione e l\'informatica.' },
        { q: 'Come converto l\'ora tra New York e Londra?', a: 'Seleziona "America/New_York" come origine e "Europe/London" come destinazione. Londra è tipicamente 5 ore avanti rispetto a New York (EST), o 4 ore durante l\'ora legale britannica.' },
        { q: 'Perché alcuni paesi hanno offset di mezz\'ora o un quarto d\'ora?', a: 'Paesi come l\'India (UTC+5:30), il Nepal (UTC+5:45) e parti dell\'Australia usano offset non standard per ragioni storiche, geografiche o politiche. Il nostro convertitore li gestisce correttamente.' },
        { q: 'Posso usare questo strumento per pianificare riunioni internazionali?', a: 'Sì, questo strumento è ideale per pianificare riunioni internazionali. Inserisci l\'orario proposto nel tuo fuso orario locale, poi controlla che ora sarebbe per i partecipanti in altri fusi orari.' },
      ],
    },
    es: {
      title: 'Convertidor de Zona Horaria: Convierte la Hora entre Ciudades del Mundo',
      paragraphs: [
        'Trabajar con diferentes zonas horarias es un desafío diario para equipos remotos, empresas internacionales y viajeros. Nuestro convertidor de zona horaria gratuito te permite descubrir al instante qué hora es en cualquier ciudad del mundo, ayudándote a programar reuniones y coordinar actividades sin confusión.',
        'La herramienta soporta 18 zonas horarias principales que cubren todos los continentes habitados, desde UTC hasta Pacific/Auckland. Simplemente selecciona tu zona horaria de origen, ingresa la fecha y hora, y elige la zona de destino para ver el resultado convertido.',
        'Las transiciones del horario de verano pueden complicar los cálculos. Nuestro convertidor usa la API Intl.DateTimeFormat del navegador, que automáticamente tiene en cuenta las reglas del horario de verano en cada zona horaria, proporcionando resultados precisos todo el año.',
        'Ya sea que estés programando una videollamada entre Nueva York y Tokio, planificando un vuelo de Londres a Sídney, o coordinando un lanzamiento de producto en múltiples continentes, este convertidor elimina el cálculo mental y los errores potenciales.',
      ],
      faq: [
        { q: '¿Cómo afecta el horario de verano a las conversiones de zona horaria?', a: 'Nuestra herramienta tiene en cuenta automáticamente las transiciones del horario de verano. La API Intl del navegador conoce las reglas para cada zona horaria, por lo que las conversiones son precisas durante todo el año.' },
        { q: '¿Qué es UTC y por qué es importante?', a: 'UTC (Tiempo Universal Coordinado) es el estándar de tiempo global del cual todas las demás zonas horarias se calculan como desplazamientos. No observa horario de verano, siendo la referencia preferida para programación internacional y aviación.' },
        { q: '¿Cómo convierto la hora entre Nueva York y Londres?', a: 'Selecciona "America/New_York" como origen y "Europe/London" como destino. Londres está típicamente 5 horas adelante de Nueva York (EST), o 4 horas durante el horario de verano británico.' },
        { q: '¿Por qué algunos países tienen desfases de media hora?', a: 'Países como India (UTC+5:30), Nepal (UTC+5:45) y partes de Australia usan desfases no estándar por razones históricas, geográficas o políticas. Nuestro convertidor los maneja correctamente.' },
        { q: '¿Puedo usar esta herramienta para planificar reuniones internacionales?', a: 'Sí, esta herramienta es ideal para planificar reuniones internacionales. Ingresa el horario propuesto en tu zona horaria local y verifica qué hora sería para los participantes en otras zonas.' },
      ],
    },
    fr: {
      title: 'Convertisseur de Fuseau Horaire : Convertir l\'Heure entre Villes du Monde',
      paragraphs: [
        'Travailler avec différents fuseaux horaires est un défi quotidien pour les équipes distantes, les entreprises internationales et les voyageurs. Notre convertisseur de fuseau horaire gratuit vous permet de découvrir instantanément l\'heure dans n\'importe quelle ville du monde.',
        'L\'outil prend en charge 18 fuseaux horaires majeurs couvrant tous les continents habités, d\'UTC à Pacific/Auckland. Sélectionnez votre fuseau source, entrez la date et l\'heure, et choisissez le fuseau de destination pour voir le résultat converti, formaté dans votre langue.',
        'Les transitions d\'heure d\'été peuvent compliquer les calculs. Notre convertisseur utilise l\'API Intl.DateTimeFormat du navigateur, qui tient automatiquement compte des règles d\'heure d\'été dans chaque fuseau horaire, fournissant des résultats précis toute l\'année.',
        'Que vous planifiiez un appel vidéo entre New York et Tokyo, un vol de Londres à Sydney, ou le lancement d\'un produit sur plusieurs continents, ce convertisseur élimine le calcul mental et les erreurs potentielles de la conversion manuelle.',
      ],
      faq: [
        { q: 'Comment l\'heure d\'été affecte-t-elle les conversions ?', a: 'Notre outil tient automatiquement compte des transitions d\'heure d\'été. L\'API Intl du navigateur connaît les règles pour chaque fuseau horaire, les conversions sont donc précises toute l\'année.' },
        { q: 'Qu\'est-ce que l\'UTC et pourquoi est-ce important ?', a: 'UTC (Temps Universel Coordonné) est le standard de temps mondial à partir duquel tous les fuseaux horaires sont calculés. Il n\'observe pas l\'heure d\'été, ce qui en fait la référence préférée pour la planification internationale.' },
        { q: 'Comment convertir l\'heure entre New York et Londres ?', a: 'Sélectionnez "America/New_York" comme source et "Europe/London" comme destination. Londres est typiquement 5 heures en avance sur New York (EST), ou 4 heures pendant l\'heure d\'été britannique.' },
        { q: 'Pourquoi certains pays ont-ils des décalages d\'une demi-heure ?', a: 'Des pays comme l\'Inde (UTC+5:30), le Népal (UTC+5:45) et certaines parties de l\'Australie utilisent des décalages non standard pour des raisons historiques, géographiques ou politiques.' },
        { q: 'Puis-je utiliser cet outil pour planifier des réunions internationales ?', a: 'Oui, cet outil est idéal pour planifier des réunions internationales. Entrez l\'heure proposée dans votre fuseau local et vérifiez l\'heure pour les participants dans d\'autres fuseaux.' },
      ],
    },
    de: {
      title: 'Zeitzonenumrechner: Zeit zwischen Städten weltweit konvertieren',
      paragraphs: [
        'Das Arbeiten über Zeitzonen hinweg ist eine tägliche Herausforderung für Remote-Teams, internationale Unternehmen und Reisende. Unser kostenloser Zeitzonenumrechner zeigt Ihnen sofort die aktuelle Uhrzeit in jeder Stadt der Welt und hilft bei der Planung von Meetings und der Koordination über Grenzen hinweg.',
        'Das Tool unterstützt 18 große Zeitzonen auf allen bewohnten Kontinenten, von UTC bis Pacific/Auckland. Wählen Sie einfach Ihre Quellzeitzone, geben Sie Datum und Uhrzeit ein und wählen Sie die Zielzeitzone, um das umgerechnete Ergebnis zu sehen.',
        'Sommerzeitumstellungen können Zeitzonenberechnungen kompliziert machen. Unser Umrechner nutzt die Browser-eigene Intl.DateTimeFormat-API, die automatisch die Sommerzeitregeln jeder Zeitzone berücksichtigt und das ganze Jahr über genaue Ergebnisse liefert.',
        'Ob Sie einen Videoanruf zwischen New York und Tokio planen, einen Flug von London nach Sydney organisieren oder einen Produktlaunch über mehrere Kontinente koordinieren – dieser Zeitzonenumrechner beseitigt Kopfrechnen und mögliche Fehler.',
      ],
      faq: [
        { q: 'Wie beeinflusst die Sommerzeit die Zeitzonenumrechnung?', a: 'Unser Tool berücksichtigt automatisch Sommerzeitumstellungen. Die Intl-API des Browsers kennt die Sommerzeitregeln für jede Zeitzone, sodass die Umrechnungen ganzjährig genau sind.' },
        { q: 'Was ist UTC und warum ist es wichtig?', a: 'UTC (Koordinierte Weltzeit) ist der globale Zeitstandard, von dem alle anderen Zeitzonen als Offsets berechnet werden. UTC beachtet keine Sommerzeit und ist die bevorzugte Referenz für internationale Planung und Luftfahrt.' },
        { q: 'Wie rechne ich die Zeit zwischen New York und London um?', a: 'Wählen Sie "America/New_York" als Quelle und "Europe/London" als Ziel. London ist typischerweise 5 Stunden vor New York (EST) oder 4 Stunden während der britischen Sommerzeit.' },
        { q: 'Warum haben manche Länder halbstündige Zeitverschiebungen?', a: 'Länder wie Indien (UTC+5:30), Nepal (UTC+5:45) und Teile Australiens verwenden nicht-standardmäßige Offsets aus historischen, geografischen oder politischen Gründen.' },
        { q: 'Kann ich dieses Tool für internationale Meetings nutzen?', a: 'Ja, dieses Tool ist ideal für die Planung internationaler Meetings. Geben Sie die vorgeschlagene Uhrzeit in Ihrer lokalen Zeitzone ein und prüfen Sie die Uhrzeit für Teilnehmer in anderen Zeitzonen.' },
      ],
    },
    pt: {
      title: 'Conversor de Fuso Horário: Converta o Horário entre Cidades do Mundo',
      paragraphs: [
        'Trabalhar com fusos horários diferentes é um desafio diário para equipes remotas, empresas internacionais e viajantes. Nosso conversor de fuso horário gratuito permite descobrir instantaneamente que horas são em qualquer cidade do mundo, ajudando a agendar reuniões e coordenar atividades sem confusão.',
        'A ferramenta suporta 18 fusos horários principais cobrindo todos os continentes habitados, de UTC a Pacific/Auckland. Selecione o fuso horário de origem, insira a data e hora, e escolha o fuso de destino para ver o resultado convertido, formatado no seu idioma.',
        'As transições de horário de verão podem complicar os cálculos. Nosso conversor usa a API Intl.DateTimeFormat do navegador, que automaticamente considera as regras de horário de verão em cada fuso horário, fornecendo resultados precisos durante todo o ano.',
        'Seja para agendar uma videochamada entre Nova York e Tóquio, planejar um voo de Londres a Sydney, ou coordenar o lançamento de um produto em vários continentes, este conversor elimina o cálculo mental e os erros potenciais da conversão manual.',
      ],
      faq: [
        { q: 'Como o horário de verão afeta as conversões de fuso horário?', a: 'Nossa ferramenta considera automaticamente as transições de horário de verão. A API Intl do navegador conhece as regras para cada fuso horário, então as conversões são precisas durante todo o ano.' },
        { q: 'O que é UTC e por que é importante?', a: 'UTC (Tempo Universal Coordenado) é o padrão de tempo global a partir do qual todos os fusos horários são calculados como deslocamentos. Não observa horário de verão, sendo a referência preferida para programação internacional e aviação.' },
        { q: 'Como converto o horário entre Nova York e Londres?', a: 'Selecione "America/New_York" como origem e "Europe/London" como destino. Londres está tipicamente 5 horas à frente de Nova York (EST), ou 4 horas durante o horário de verão britânico.' },
        { q: 'Por que alguns países têm diferenças de meia hora?', a: 'Países como Índia (UTC+5:30), Nepal (UTC+5:45) e partes da Austrália usam deslocamentos não padronizados por razões históricas, geográficas ou políticas.' },
        { q: 'Posso usar esta ferramenta para planejar reuniões internacionais?', a: 'Sim, esta ferramenta é ideal para planejar reuniões internacionais. Insira o horário proposto no seu fuso local e verifique o horário para participantes em outros fusos.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="time-zone-converter">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('fromZone')}</label>
            <select value={fromZone} onChange={(e) => setFromZone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {zones.map((z) => <option key={z} value={z}>{z.replace(/_/g, ' ')}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')}</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('time')}</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('toZone')}</label>
            <select value={toZone} onChange={(e) => setToZone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {zones.map((z) => <option key={z} value={z}>{z.replace(/_/g, ' ')}</option>)}
            </select>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">{t('convertedTime')}</div>
            <div className="text-xl font-bold text-blue-600">{converted}</div>
          </div>
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
