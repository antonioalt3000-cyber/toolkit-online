'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type AgeResult = { years: number; months: number; days: number; totalDays: number; nextBdayDays: number; birthDate: string };

export default function AgeCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['age-calculator'][lang];
  const [birthDate, setBirthDate] = useState('');
  const [history, setHistory] = useState<AgeResult[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const labels = {
    birthDate: { en: 'Birth date', it: 'Data di nascita', es: 'Fecha de nacimiento', fr: 'Date de naissance', de: 'Geburtsdatum', pt: 'Data de nascimento' },
    years: { en: 'Years', it: 'Anni', es: 'Años', fr: 'Ans', de: 'Jahre', pt: 'Anos' },
    months: { en: 'Months', it: 'Mesi', es: 'Meses', fr: 'Mois', de: 'Monate', pt: 'Meses' },
    days: { en: 'Days', it: 'Giorni', es: 'Días', fr: 'Jours', de: 'Tage', pt: 'Dias' },
    totalDays: { en: 'Total days lived', it: 'Giorni totali vissuti', es: 'Días totales vividos', fr: 'Jours totaux vécus', de: 'Gesamt gelebte Tage', pt: 'Dias totais vividos' },
    nextBday: { en: 'Next birthday in', it: 'Prossimo compleanno tra', es: 'Próximo cumpleaños en', fr: 'Prochain anniversaire dans', de: 'Nächster Geburtstag in', pt: 'Próximo aniversário em' },
    reset: { en: 'Reset', it: 'Resetta', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
    copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié!', de: 'Kopiert!', pt: 'Copiado!' },
    history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
    futureDate: { en: 'Birth date cannot be in the future', it: 'La data di nascita non può essere nel futuro', es: 'La fecha no puede ser futura', fr: 'La date ne peut pas être future', de: 'Datum darf nicht in der Zukunft liegen', pt: 'A data não pode ser futura' },
    invalidDate: { en: 'Please enter a valid date', it: 'Inserisci una data valida', es: 'Ingresa una fecha válida', fr: 'Entrez une date valide', de: 'Bitte gültiges Datum eingeben', pt: 'Insira uma data válida' },
  } as Record<string, Record<Locale, string>>;

  let age = { years: 0, months: 0, days: 0, totalDays: 0, nextBdayDays: 0 };
  let valid = false;

  if (birthDate) {
    const birth = new Date(birthDate);
    const now = new Date();

    if (isNaN(birth.getTime())) {
      if (!error) setError(labels.invalidDate[lang]);
    } else if (birth > now) {
      if (!error) setError(labels.futureDate[lang]);
    } else {
      if (error) setError('');
      valid = true;
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      let days = now.getDate() - birth.getDate();

      if (days < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      const totalDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

      let nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
      if (nextBday <= now) nextBday = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
      const nextBdayDays = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      age = { years, months, days, totalDays, nextBdayDays };
    }
  }

  const handleDateChange = (value: string) => {
    setError('');
    setBirthDate(value);
    if (value) {
      const birth = new Date(value);
      const now = new Date();
      if (!isNaN(birth.getTime()) && birth <= now) {
        let years = now.getFullYear() - birth.getFullYear();
        let months = now.getMonth() - birth.getMonth();
        let days = now.getDate() - birth.getDate();
        if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
        if (months < 0) { years--; months += 12; }
        const totalDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
        let nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
        if (nextBday <= now) nextBday = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
        const nextBdayDays = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const entry: AgeResult = { years, months, days, totalDays, nextBdayDays, birthDate: value };
        setHistory(prev => {
          const filtered = prev.filter(h => h.birthDate !== value);
          return [entry, ...filtered].slice(0, 5);
        });
      }
    }
  };

  const handleReset = () => {
    setBirthDate('');
    setError('');
  };

  const copyResults = () => {
    const text = `${labels.years[lang]}: ${age.years}, ${labels.months[lang]}: ${age.months}, ${labels.days[lang]}: ${age.days}\n${labels.totalDays[lang]}: ${age.totalDays.toLocaleString()}\n${labels.nextBday[lang]}: ${age.nextBdayDays} ${labels.days[lang].toLowerCase()}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLifeProgress = () => {
    const maxAge = 80;
    return Math.min((age.years / maxAge) * 100, 100);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'How to Calculate Your Exact Age in Years, Months, and Days',
      paragraphs: [
        'Knowing your exact age goes beyond simply stating the year you were born. An accurate age calculator takes into account the precise number of years, months, and days that have elapsed since your birth date. This is particularly useful for legal documents, medical records, insurance applications, and visa forms that require your age down to the exact day.',
        'Our free online age calculator instantly computes your chronological age by comparing your date of birth to today\'s date. It factors in varying month lengths and leap years to provide a precise breakdown. You also get the total number of days you have lived, which can be a fun personal milestone to track.',
        'Beyond curiosity, knowing your exact age matters in many real-world scenarios. Retirement eligibility, school enrollment cutoff dates, and age-restricted activities all depend on precise age calculations. Pediatricians track child development milestones by exact age in months and days, not just years. If you need to find the difference between two specific dates, try our <a href="/en/tools/date-calculator" class="text-blue-600 underline">date calculator</a> for detailed day counts.',
        'The tool also tells you how many days remain until your next birthday, making it easy to plan celebrations. Use our <a href="/en/tools/countdown-timer" class="text-blue-600 underline">countdown timer</a> to set up a visual countdown to your next birthday or any special event. Simply enter your birth date and get instant, accurate results without any manual math or calendar counting.'
      ],
      faq: [
        { q: 'How does the age calculator handle leap years?', a: 'The calculator uses JavaScript\'s built-in Date object, which automatically accounts for leap years. February 29 birthdays are correctly handled, and the total days calculation includes all leap days between your birth date and today.' },
        { q: 'Can I calculate someone else\'s age with this tool?', a: 'Yes. Simply enter any birth date and the tool will calculate the exact age for that date. It works for anyone — children, adults, or historical figures — as long as you know the birth date.' },
        { q: 'Why does my age in months not match what I expected?', a: 'Months have different lengths (28 to 31 days). The calculator uses calendar months rather than a fixed 30-day period, so results may differ slightly from a rough mental estimate.' },
        { q: 'Is my birth date data stored or shared?', a: 'No. All calculations happen entirely in your browser. Your birth date is never sent to any server, stored in any database, or shared with third parties.' },
        { q: 'How accurate is the total days lived count?', a: 'The total days count is accurate to the calendar day. It computes the difference in milliseconds between your birth date and the current date, then converts to whole days.' }
      ]
    },
    it: {
      title: 'Come Calcolare la Tua Età Esatta in Anni, Mesi e Giorni',
      paragraphs: [
        'Conoscere la propria età esatta va oltre il semplice anno di nascita. Un calcolatore di età accurato tiene conto del numero preciso di anni, mesi e giorni trascorsi dalla data di nascita. Questo è particolarmente utile per documenti legali, cartelle cliniche, domande di assicurazione e moduli per visti che richiedono l\'età al giorno esatto.',
        'Il nostro calcolatore di età online gratuito calcola istantaneamente la tua età cronologica confrontando la data di nascita con la data odierna. Tiene conto della diversa durata dei mesi e degli anni bisestili per fornire un calcolo preciso. Ottieni anche il numero totale di giorni vissuti, un dato personale divertente da monitorare.',
        'Oltre alla curiosità, conoscere l\'età esatta è importante in molti scenari reali. L\'idoneità alla pensione, le date limite per l\'iscrizione scolastica e le attività con restrizioni di età dipendono tutti da calcoli precisi. I pediatri monitorano le tappe dello sviluppo infantile per età esatta in mesi e giorni. Se hai bisogno di calcolare la differenza tra due date specifiche, prova il nostro <a href="/it/tools/date-calculator" class="text-blue-600 underline">calcolatore di date</a>.',
        'Lo strumento indica anche quanti giorni mancano al prossimo compleanno, rendendo facile pianificare festeggiamenti. Usa il nostro <a href="/it/tools/countdown-timer" class="text-blue-600 underline">timer per il conto alla rovescia</a> per impostare un countdown visivo per il tuo prossimo compleanno o qualsiasi evento speciale. Inserisci semplicemente la data di nascita e ottieni risultati istantanei e accurati senza calcoli manuali.'
      ],
      faq: [
        { q: 'Come gestisce il calcolatore gli anni bisestili?', a: 'Il calcolatore utilizza l\'oggetto Date di JavaScript, che tiene automaticamente conto degli anni bisestili. I compleanni del 29 febbraio vengono gestiti correttamente e il calcolo dei giorni totali include tutti i giorni bisestili.' },
        { q: 'Posso calcolare l\'età di un\'altra persona?', a: 'Sì. Inserisci qualsiasi data di nascita e lo strumento calcolerà l\'età esatta. Funziona per chiunque — bambini, adulti o personaggi storici — purché si conosca la data di nascita.' },
        { q: 'Perché i mesi non corrispondono a ciò che mi aspettavo?', a: 'I mesi hanno durate diverse (da 28 a 31 giorni). Il calcolatore usa mesi di calendario anziché un periodo fisso di 30 giorni, quindi i risultati possono differire leggermente da una stima mentale approssimativa.' },
        { q: 'I miei dati di nascita vengono conservati o condivisi?', a: 'No. Tutti i calcoli avvengono interamente nel tuo browser. La tua data di nascita non viene mai inviata a nessun server, memorizzata in alcun database o condivisa con terze parti.' },
        { q: 'Quanto è preciso il conteggio dei giorni totali vissuti?', a: 'Il conteggio è preciso al giorno di calendario. Calcola la differenza in millisecondi tra la data di nascita e la data corrente, poi la converte in giorni interi.' }
      ]
    },
    es: {
      title: 'Cómo Calcular Tu Edad Exacta en Años, Meses y Días',
      paragraphs: [
        'Conocer tu edad exacta va más allá de simplemente decir el año en que naciste. Una calculadora de edad precisa tiene en cuenta el número exacto de años, meses y días transcurridos desde tu fecha de nacimiento. Esto es especialmente útil para documentos legales, historiales médicos, solicitudes de seguros y formularios de visado que requieren tu edad al día exacto.',
        'Nuestra calculadora de edad en línea gratuita calcula instantáneamente tu edad cronológica comparando tu fecha de nacimiento con la fecha actual. Tiene en cuenta las diferentes duraciones de los meses y los años bisiestos para proporcionar un desglose preciso. También obtienes el número total de días vividos, un dato personal divertido.',
        'Más allá de la curiosidad, conocer la edad exacta importa en muchos escenarios reales. La elegibilidad para jubilación, las fechas límite de inscripción escolar y las actividades restringidas por edad dependen de cálculos precisos. Los pediatras rastrean los hitos del desarrollo infantil por edad exacta en meses y días. Si necesitas calcular la diferencia entre dos fechas, prueba nuestra <a href="/es/tools/date-calculator" class="text-blue-600 underline">calculadora de fechas</a>.',
        'La herramienta también indica cuántos días faltan para tu próximo cumpleaños. Usa nuestro <a href="/es/tools/countdown-timer" class="text-blue-600 underline">temporizador de cuenta regresiva</a> para crear un conteo visual hasta tu próximo cumpleaños o evento especial. Simplemente ingresa tu fecha de nacimiento y obtén resultados instantáneos y precisos sin cálculos manuales.'
      ],
      faq: [
        { q: '¿Cómo maneja la calculadora los años bisiestos?', a: 'La calculadora usa el objeto Date de JavaScript, que tiene en cuenta automáticamente los años bisiestos. Los cumpleaños del 29 de febrero se manejan correctamente y el cálculo de días totales incluye todos los días bisiestos.' },
        { q: '¿Puedo calcular la edad de otra persona?', a: 'Sí. Simplemente ingresa cualquier fecha de nacimiento y la herramienta calculará la edad exacta. Funciona para cualquier persona, siempre que conozcas la fecha de nacimiento.' },
        { q: '¿Por qué los meses no coinciden con lo que esperaba?', a: 'Los meses tienen diferentes duraciones (de 28 a 31 días). La calculadora usa meses de calendario en lugar de un período fijo de 30 días, por lo que los resultados pueden diferir ligeramente de una estimación mental.' },
        { q: '¿Se almacenan o comparten mis datos de nacimiento?', a: 'No. Todos los cálculos se realizan completamente en tu navegador. Tu fecha de nacimiento nunca se envía a ningún servidor ni se comparte con terceros.' },
        { q: '¿Qué tan preciso es el conteo de días totales vividos?', a: 'El conteo es preciso al día calendario. Calcula la diferencia en milisegundos entre tu fecha de nacimiento y la fecha actual, luego la convierte en días enteros.' }
      ]
    },
    fr: {
      title: 'Comment Calculer Votre Âge Exact en Années, Mois et Jours',
      paragraphs: [
        'Connaître votre âge exact va au-delà de simplement indiquer votre année de naissance. Un calculateur d\'âge précis prend en compte le nombre exact d\'années, de mois et de jours écoulés depuis votre date de naissance. C\'est particulièrement utile pour les documents juridiques, les dossiers médicaux, les demandes d\'assurance et les formulaires de visa.',
        'Notre calculateur d\'âge en ligne gratuit calcule instantanément votre âge chronologique en comparant votre date de naissance à la date du jour. Il tient compte des longueurs variables des mois et des années bissextiles pour fournir un calcul précis. Vous obtenez également le nombre total de jours vécus.',
        'Au-delà de la curiosité, connaître son âge exact est important dans de nombreuses situations réelles. L\'éligibilité à la retraite, les dates limites d\'inscription scolaire et les activités soumises à des restrictions d\'âge dépendent toutes de calculs précis. Les pédiatres suivent les étapes du développement par âge exact en mois et jours. Pour calculer la différence entre deux dates spécifiques, essayez notre <a href="/fr/tools/date-calculator" class="text-blue-600 underline">calculateur de dates</a>.',
        'L\'outil indique également combien de jours il reste avant votre prochain anniversaire. Utilisez notre <a href="/fr/tools/countdown-timer" class="text-blue-600 underline">minuteur de compte à rebours</a> pour créer un décompte visuel jusqu\'à votre prochain anniversaire. Entrez simplement votre date de naissance et obtenez des résultats instantanés et précis sans calcul manuel.'
      ],
      faq: [
        { q: 'Comment le calculateur gère-t-il les années bissextiles ?', a: 'Le calculateur utilise l\'objet Date de JavaScript, qui prend automatiquement en compte les années bissextiles. Les anniversaires du 29 février sont correctement gérés et le calcul des jours totaux inclut tous les jours bissextils.' },
        { q: 'Puis-je calculer l\'âge de quelqu\'un d\'autre ?', a: 'Oui. Entrez simplement n\'importe quelle date de naissance et l\'outil calculera l\'âge exact. Cela fonctionne pour tout le monde, à condition de connaître la date de naissance.' },
        { q: 'Pourquoi les mois ne correspondent-ils pas à ce que j\'attendais ?', a: 'Les mois ont des durées différentes (de 28 à 31 jours). Le calculateur utilise des mois calendaires plutôt qu\'une période fixe de 30 jours, les résultats peuvent donc légèrement différer d\'une estimation mentale.' },
        { q: 'Ma date de naissance est-elle stockée ou partagée ?', a: 'Non. Tous les calculs se font entièrement dans votre navigateur. Votre date de naissance n\'est jamais envoyée à un serveur ni partagée avec des tiers.' },
        { q: 'Quelle est la précision du compteur de jours totaux vécus ?', a: 'Le compteur est précis au jour calendaire. Il calcule la différence en millisecondes entre votre date de naissance et la date actuelle, puis la convertit en jours entiers.' }
      ]
    },
    de: {
      title: 'So Berechnen Sie Ihr Genaues Alter in Jahren, Monaten und Tagen',
      paragraphs: [
        'Ihr genaues Alter zu kennen geht über die bloße Angabe Ihres Geburtsjahres hinaus. Ein präziser Altersrechner berücksichtigt die genaue Anzahl der Jahre, Monate und Tage seit Ihrem Geburtsdatum. Dies ist besonders nützlich für rechtliche Dokumente, medizinische Unterlagen, Versicherungsanträge und Visumsformulare.',
        'Unser kostenloser Online-Altersrechner berechnet sofort Ihr chronologisches Alter, indem er Ihr Geburtsdatum mit dem heutigen Datum vergleicht. Er berücksichtigt unterschiedliche Monatslängen und Schaltjahre für eine präzise Aufschlüsselung. Sie erhalten auch die Gesamtzahl der gelebten Tage.',
        'Über die Neugier hinaus ist das genaue Alter in vielen realen Szenarien wichtig. Rentenansprüche, Einschulungsfristen und altersbeschränkte Aktivitäten hängen von präzisen Altersberechnungen ab. Kinderärzte verfolgen Entwicklungsmeilensteine nach genauem Alter in Monaten und Tagen. Wenn Sie den Unterschied zwischen zwei bestimmten Daten berechnen müssen, nutzen Sie unseren <a href="/de/tools/date-calculator" class="text-blue-600 underline">Datumsrechner</a>.',
        'Das Tool zeigt auch an, wie viele Tage bis zu Ihrem nächsten Geburtstag verbleiben. Nutzen Sie unseren <a href="/de/tools/countdown-timer" class="text-blue-600 underline">Countdown-Timer</a>, um einen visuellen Countdown für Ihren nächsten Geburtstag einzurichten. Geben Sie einfach Ihr Geburtsdatum ein und erhalten Sie sofortige, genaue Ergebnisse ohne manuelle Berechnungen.'
      ],
      faq: [
        { q: 'Wie geht der Rechner mit Schaltjahren um?', a: 'Der Rechner verwendet JavaScripts Date-Objekt, das Schaltjahre automatisch berücksichtigt. Geburtstage am 29. Februar werden korrekt behandelt und die Berechnung der Gesamttage enthält alle Schalttage.' },
        { q: 'Kann ich das Alter einer anderen Person berechnen?', a: 'Ja. Geben Sie einfach ein beliebiges Geburtsdatum ein und das Tool berechnet das genaue Alter. Es funktioniert für jeden, solange das Geburtsdatum bekannt ist.' },
        { q: 'Warum stimmen die Monate nicht mit meiner Erwartung überein?', a: 'Monate haben unterschiedliche Längen (28 bis 31 Tage). Der Rechner verwendet Kalendermonate statt einer festen 30-Tage-Periode, daher können die Ergebnisse leicht von einer groben Schätzung abweichen.' },
        { q: 'Werden meine Geburtsdaten gespeichert oder geteilt?', a: 'Nein. Alle Berechnungen erfolgen vollständig in Ihrem Browser. Ihr Geburtsdatum wird niemals an einen Server gesendet oder mit Dritten geteilt.' },
        { q: 'Wie genau ist die Zählung der gelebten Tage?', a: 'Die Zählung ist auf den Kalendertag genau. Sie berechnet die Differenz in Millisekunden zwischen Ihrem Geburtsdatum und dem aktuellen Datum und wandelt sie dann in ganze Tage um.' }
      ]
    },
    pt: {
      title: 'Como Calcular Sua Idade Exata em Anos, Meses e Dias',
      paragraphs: [
        'Conhecer sua idade exata vai além de simplesmente informar o ano de nascimento. Uma calculadora de idade precisa leva em conta o número exato de anos, meses e dias decorridos desde sua data de nascimento. Isso é especialmente útil para documentos legais, registros médicos, pedidos de seguro e formulários de visto.',
        'Nossa calculadora de idade online gratuita calcula instantaneamente sua idade cronológica comparando sua data de nascimento com a data atual. Ela considera as diferentes durações dos meses e anos bissextos para fornecer um cálculo preciso. Você também obtém o número total de dias vividos.',
        'Além da curiosidade, conhecer a idade exata é importante em muitos cenários reais. Elegibilidade para aposentadoria, datas limite de matrícula escolar e atividades com restrição de idade dependem de cálculos precisos. Pediatras acompanham marcos de desenvolvimento por idade exata em meses e dias. Se precisa calcular a diferença entre duas datas específicas, experimente nossa <a href="/pt/tools/date-calculator" class="text-blue-600 underline">calculadora de datas</a>.',
        'A ferramenta também mostra quantos dias faltam para o próximo aniversário. Use nosso <a href="/pt/tools/countdown-timer" class="text-blue-600 underline">timer de contagem regressiva</a> para criar uma contagem visual até seu próximo aniversário ou evento especial. Basta inserir sua data de nascimento e obter resultados instantâneos e precisos sem cálculos manuais.'
      ],
      faq: [
        { q: 'Como a calculadora lida com anos bissextos?', a: 'A calculadora usa o objeto Date do JavaScript, que automaticamente considera anos bissextos. Aniversários de 29 de fevereiro são tratados corretamente e o cálculo de dias totais inclui todos os dias bissextos.' },
        { q: 'Posso calcular a idade de outra pessoa?', a: 'Sim. Basta inserir qualquer data de nascimento e a ferramenta calculará a idade exata. Funciona para qualquer pessoa, desde que você saiba a data de nascimento.' },
        { q: 'Por que os meses não correspondem ao que eu esperava?', a: 'Os meses têm durações diferentes (de 28 a 31 dias). A calculadora usa meses do calendário em vez de um período fixo de 30 dias, então os resultados podem diferir ligeiramente de uma estimativa mental.' },
        { q: 'Meus dados de nascimento são armazenados ou compartilhados?', a: 'Não. Todos os cálculos acontecem inteiramente no seu navegador. Sua data de nascimento nunca é enviada a nenhum servidor ou compartilhada com terceiros.' },
        { q: 'Qual a precisão da contagem de dias totais vividos?', a: 'A contagem é precisa ao dia do calendário. Calcula a diferença em milissegundos entre sua data de nascimento e a data atual, convertendo em dias inteiros.' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="age-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.birthDate[lang]}</label>
            <input type="date" value={birthDate} onChange={(e) => handleDateChange(e.target.value)} className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          {birthDate && (
            <div className="flex justify-end">
              <button onClick={handleReset} className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                {labels.reset[lang]}
              </button>
            </div>
          )}

          {valid && (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: labels.years[lang], value: age.years, icon: '🎂', color: 'from-blue-500 to-blue-600' },
                  { label: labels.months[lang], value: age.months, icon: '📅', color: 'from-indigo-500 to-indigo-600' },
                  { label: labels.days[lang], value: age.days, icon: '☀️', color: 'from-purple-500 to-purple-600' },
                ].map((item) => (
                  <div key={item.label} className={`bg-gradient-to-br ${item.color} rounded-xl p-4 text-center shadow-sm`}>
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-3xl font-bold text-white">{item.value}</div>
                    <div className="text-sm text-white/80">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Life progress bar */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>0</span>
                  <span>80 {labels.years[lang].toLowerCase()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 h-3 rounded-full transition-all duration-500" style={{ width: `${getLifeProgress()}%` }}></div>
                </div>
                <div className="text-center text-sm text-gray-600 mt-1">{getLifeProgress().toFixed(1)}%</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <span className="text-2xl">🗓️</span>
                  <div>
                    <div className="text-xs text-amber-600 font-medium">{labels.totalDays[lang]}</div>
                    <div className="text-xl font-bold text-gray-900">{age.totalDays.toLocaleString()}</div>
                  </div>
                </div>
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 flex items-start gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <div className="text-xs text-pink-600 font-medium">{labels.nextBday[lang]}</div>
                    <div className="text-xl font-bold text-gray-900">{age.nextBdayDays} {labels.days[lang].toLowerCase()}</div>
                  </div>
                </div>
              </div>

              <button onClick={copyResults} className="w-full py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                {copied ? (
                  <><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{labels.copied[lang]}</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>{labels.copy[lang]}</>
                )}
              </button>
            </>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{labels.history[lang]}</h3>
            <div className="space-y-2">
              {history.map((h, i) => (
                <button key={i} onClick={() => handleDateChange(h.birthDate)} className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors flex justify-between items-center text-sm">
                  <span className="text-gray-600">{h.birthDate}</span>
                  <span className="font-medium text-gray-900">{h.years}y {h.months}m {h.days}d</span>
                </button>
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
