'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type Row = { year: number; age: number; balance: number };
type ErrCode = 'value' | 'pct' | 'order';
type Result = {
  finalBalance: number;
  totalContributed: number;
  totalGrowth: number;
  totalEmployee: number;
  totalEmployer: number;
  years: number;
  rows: Row[];
};

const DEFAULTS = {
  currentAge: '30',
  retirementAge: '65',
  currentBalance: '25000',
  annualSalary: '60000',
  empPct: '6',
  matchPct: '3',
  annualReturn: '7',
  contribLimit: '23500',
};

export default function Retirement401kCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['401k-calculator'][lang];

  const [currentAge, setCurrentAge] = useState(DEFAULTS.currentAge);
  const [retirementAge, setRetirementAge] = useState(DEFAULTS.retirementAge);
  const [currentBalance, setCurrentBalance] = useState(DEFAULTS.currentBalance);
  const [annualSalary, setAnnualSalary] = useState(DEFAULTS.annualSalary);
  const [empPct, setEmpPct] = useState(DEFAULTS.empPct);
  const [matchPct, setMatchPct] = useState(DEFAULTS.matchPct);
  const [annualReturn, setAnnualReturn] = useState(DEFAULTS.annualReturn);
  const [contribLimit, setContribLimit] = useState(DEFAULTS.contribLimit);
  const [showTable, setShowTable] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const labels = {
    currentAge: {
      en: 'Current age',
      it: 'Età attuale',
      es: 'Edad actual',
      fr: 'Âge actuel',
      de: 'Aktuelles Alter',
      pt: 'Idade atual',
    },
    retirementAge: {
      en: 'Retirement age',
      it: 'Età pensionamento',
      es: 'Edad de jubilación',
      fr: 'Âge de retraite',
      de: 'Rentenalter',
      pt: 'Idade de aposentadoria',
    },
    currentBalance: {
      en: 'Current 401(k) balance ($)',
      it: 'Saldo 401(k) attuale ($)',
      es: 'Saldo 401(k) actual ($)',
      fr: 'Solde 401(k) actuel ($)',
      de: 'Aktuelles 401(k)-Guthaben ($)',
      pt: 'Saldo 401(k) atual ($)',
    },
    annualSalary: {
      en: 'Annual salary ($)',
      it: 'Stipendio annuo ($)',
      es: 'Salario anual ($)',
      fr: 'Salaire annuel ($)',
      de: 'Jahresgehalt ($)',
      pt: 'Salário anual ($)',
    },
    empPct: {
      en: 'Your contribution (% of salary)',
      it: 'Tuo contributo (% dello stipendio)',
      es: 'Tu aporte (% del salario)',
      fr: 'Votre cotisation (% du salaire)',
      de: 'Ihr Beitrag (% des Gehalts)',
      pt: 'Sua contribuição (% do salário)',
    },
    matchPct: {
      en: 'Employer match (% of salary)',
      it: 'Contributo datore (% dello stipendio)',
      es: 'Aporte del empleador (% del salario)',
      fr: 'Abondement employeur (% du salaire)',
      de: 'Arbeitgeberzuschuss (% des Gehalts)',
      pt: 'Contribuição do empregador (% do salário)',
    },
    annualReturn: {
      en: 'Expected annual return (%)',
      it: 'Rendimento annuale atteso (%)',
      es: 'Retorno anual esperado (%)',
      fr: 'Rendement annuel attendu (%)',
      de: 'Erwartete jährl. Rendite (%)',
      pt: 'Retorno anual esperado (%)',
    },
    contribLimit: {
      en: 'Annual contribution limit ($)',
      it: 'Limite di contribuzione annuale ($)',
      es: 'Límite de aporte anual ($)',
      fr: 'Plafond de cotisation annuel ($)',
      de: 'Jährliches Beitragslimit ($)',
      pt: 'Limite de contribuição anual ($)',
    },
    limitNote: {
      en: 'US default, updated yearly — verify the current IRS limit.',
      it: 'Default USA, aggiornato ogni anno — verifica il limite IRS attuale.',
      es: 'Predeterminado de EE. UU., actualizado cada año — verifica el límite actual del IRS.',
      fr: 'Valeur par défaut US, mise à jour chaque année — vérifiez le plafond IRS actuel.',
      de: 'US-Standardwert, jährlich aktualisiert — prüfen Sie das aktuelle IRS-Limit.',
      pt: 'Padrão dos EUA, atualizado anualmente — verifique o limite atual do IRS.',
    },
    results: {
      en: 'Results',
      it: 'Risultati',
      es: 'Resultados',
      fr: 'Résultats',
      de: 'Ergebnisse',
      pt: 'Resultados',
    },
    finalBalance: {
      en: 'Projected balance at retirement',
      it: 'Saldo previsto alla pensione',
      es: 'Saldo proyectado en la jubilación',
      fr: 'Solde projeté à la retraite',
      de: 'Prognostiziertes Guthaben bei Rente',
      pt: 'Saldo projetado na aposentadoria',
    },
    totalContributed: {
      en: 'Total contributed',
      it: 'Totale contribuito',
      es: 'Total aportado',
      fr: 'Total cotisé',
      de: 'Gesamt eingezahlt',
      pt: 'Total contribuído',
    },
    totalGrowth: {
      en: 'Total investment growth',
      it: 'Crescita investimento',
      es: 'Crecimiento de inversión',
      fr: "Croissance de l'investissement",
      de: 'Gesamte Anlagerendite',
      pt: 'Crescimento do investimento',
    },
    yourContributions: {
      en: 'Your contributions',
      it: 'I tuoi contributi',
      es: 'Tus aportes',
      fr: 'Vos cotisations',
      de: 'Ihre Beiträge',
      pt: 'Suas contribuições',
    },
    employerContributions: {
      en: 'Employer contributions',
      it: 'Contributi datore',
      es: 'Aportes del empleador',
      fr: 'Cotisations employeur',
      de: 'Arbeitgeberbeiträge',
      pt: 'Contribuições do empregador',
    },
    yearsLabel: {
      en: 'Years to retirement',
      it: 'Anni alla pensione',
      es: 'Años para jubilación',
      fr: 'Années avant la retraite',
      de: 'Jahre bis zur Rente',
      pt: 'Anos até aposentadoria',
    },
    yearByYear: {
      en: 'Year-by-year summary',
      it: 'Riepilogo anno per anno',
      es: 'Resumen año por año',
      fr: 'Résumé année par année',
      de: 'Jährliche Übersicht',
      pt: 'Resumo ano a ano',
    },
    showTable: {
      en: 'Show table',
      it: 'Mostra tabella',
      es: 'Mostrar tabla',
      fr: 'Afficher le tableau',
      de: 'Tabelle anzeigen',
      pt: 'Mostrar tabela',
    },
    hideTable: {
      en: 'Hide table',
      it: 'Nascondi tabella',
      es: 'Ocultar tabla',
      fr: 'Masquer le tableau',
      de: 'Tabelle ausblenden',
      pt: 'Ocultar tabela',
    },
    year: { en: 'Year', it: 'Anno', es: 'Año', fr: 'Année', de: 'Jahr', pt: 'Ano' },
    age: { en: 'Age', it: 'Età', es: 'Edad', fr: 'Âge', de: 'Alter', pt: 'Idade' },
    balance: {
      en: 'Balance',
      it: 'Saldo',
      es: 'Saldo',
      fr: 'Solde',
      de: 'Kontostand',
      pt: 'Saldo',
    },
    copy: {
      en: 'Copy result',
      it: 'Copia risultato',
      es: 'Copiar resultado',
      fr: 'Copier le résultat',
      de: 'Ergebnis kopieren',
      pt: 'Copiar resultado',
    },
    copied: {
      en: 'Copied!',
      it: 'Copiato!',
      es: '¡Copiado!',
      fr: 'Copié !',
      de: 'Kopiert!',
      pt: 'Copiado!',
    },
    reset: {
      en: 'Reset',
      it: 'Reimposta',
      es: 'Restablecer',
      fr: 'Réinitialiser',
      de: 'Zurücksetzen',
      pt: 'Redefinir',
    },
    errValue: {
      en: 'Enter a valid non-negative number',
      it: 'Inserisci un numero valido non negativo',
      es: 'Introduce un número válido no negativo',
      fr: 'Entrez un nombre valide non négatif',
      de: 'Geben Sie eine gültige nicht-negative Zahl ein',
      pt: 'Insira um número válido não negativo',
    },
    errPct: {
      en: 'Enter a percentage between 0 and 100',
      it: 'Inserisci una percentuale tra 0 e 100',
      es: 'Introduce un porcentaje entre 0 y 100',
      fr: 'Entrez un pourcentage entre 0 et 100',
      de: 'Geben Sie einen Prozentsatz zwischen 0 und 100 ein',
      pt: 'Insira uma porcentagem entre 0 e 100',
    },
    errOrder: {
      en: 'Retirement age must be greater than current age',
      it: "L'età di pensionamento deve essere maggiore dell'età attuale",
      es: 'La edad de jubilación debe ser mayor que la edad actual',
      fr: "L'âge de retraite doit être supérieur à l'âge actuel",
      de: 'Das Rentenalter muss höher als das aktuelle Alter sein',
      pt: 'A idade de aposentadoria deve ser maior que a idade atual',
    },
  } as Record<string, Record<Locale, string>>;

  const num = (s: string): number => (s.trim() === '' ? NaN : Number(s));

  const model = useMemo<{ errors: Record<string, ErrCode>; result: Result | null }>(() => {
    const errors: Record<string, ErrCode> = {};
    const ca = num(currentAge);
    const ra = num(retirementAge);
    const cb = num(currentBalance);
    const sal = num(annualSalary);
    const emp = num(empPct);
    const mat = num(matchPct);
    const ret = num(annualReturn);
    const lim = num(contribLimit);

    if (!Number.isFinite(ca) || ca < 0) errors.currentAge = 'value';
    if (!Number.isFinite(ra) || ra < 0) errors.retirementAge = 'value';
    else if (Number.isFinite(ca) && ra <= ca) errors.retirementAge = 'order';
    if (!Number.isFinite(cb) || cb < 0) errors.currentBalance = 'value';
    if (!Number.isFinite(sal) || sal < 0) errors.annualSalary = 'value';
    if (!Number.isFinite(emp) || emp < 0 || emp > 100) errors.empPct = 'pct';
    if (!Number.isFinite(mat) || mat < 0 || mat > 100) errors.matchPct = 'pct';
    if (!Number.isFinite(ret) || ret < 0) errors.annualReturn = 'value';
    if (!Number.isFinite(lim) || lim <= 0) errors.contribLimit = 'value';

    if (Object.keys(errors).length > 0) return { errors, result: null };

    const years = Math.round(ra - ca);
    let balance = cb;
    let totalEmployee = 0;
    let totalEmployer = 0;
    const rows: Row[] = [];
    const baseAge = Math.round(ca);
    for (let i = 0; i < years; i++) {
      const employeeContrib = Math.min((sal * emp) / 100, lim);
      const employerContrib = (sal * mat) / 100;
      balance = balance * (1 + ret / 100) + employeeContrib + employerContrib;
      totalEmployee += employeeContrib;
      totalEmployer += employerContrib;
      rows.push({ year: i + 1, age: baseAge + i + 1, balance });
    }
    const totalContributed = cb + totalEmployee + totalEmployer;
    const totalGrowth = balance - totalContributed;
    return {
      errors,
      result: {
        finalBalance: balance,
        totalContributed,
        totalGrowth,
        totalEmployee,
        totalEmployer,
        years,
        rows,
      },
    };
  }, [
    currentAge,
    retirementAge,
    currentBalance,
    annualSalary,
    empPct,
    matchPct,
    annualReturn,
    contribLimit,
  ]);

  const fmt = (n: number): string =>
    new Intl.NumberFormat(
      lang === 'en'
        ? 'en-US'
        : lang === 'de'
          ? 'de-DE'
          : lang === 'fr'
            ? 'fr-FR'
            : lang === 'pt'
              ? 'pt-BR'
              : lang === 'es'
                ? 'es-ES'
                : 'it-IT',
      { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }
    ).format(n);

  const errText = (field: string): string | null => {
    const code = model.errors[field];
    if (!code) return null;
    return labels[code === 'value' ? 'errValue' : code === 'pct' ? 'errPct' : 'errOrder'][lang];
  };

  const inputClass = (field: string): string =>
    `w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${model.errors[field] ? 'border-red-500' : 'border-gray-300'}`;

  const handleReset = (): void => {
    setCurrentAge(DEFAULTS.currentAge);
    setRetirementAge(DEFAULTS.retirementAge);
    setCurrentBalance(DEFAULTS.currentBalance);
    setAnnualSalary(DEFAULTS.annualSalary);
    setEmpPct(DEFAULTS.empPct);
    setMatchPct(DEFAULTS.matchPct);
    setAnnualReturn(DEFAULTS.annualReturn);
    setContribLimit(DEFAULTS.contribLimit);
    setShowTable(false);
    setCopied(false);
  };

  const handleCopy = (): void => {
    if (!model.result) return;
    const r = model.result;
    const text = [
      toolT.name,
      `${labels.finalBalance[lang]}: ${fmt(r.finalBalance)}`,
      `${labels.totalContributed[lang]}: ${fmt(r.totalContributed)}`,
      `${labels.totalGrowth[lang]}: ${fmt(r.totalGrowth)}`,
      `${labels.yearsLabel[lang]}: ${r.years}`,
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: '401(k) Calculator: Project Your Retirement Savings and Employer Match',
      paragraphs: [
        'A 401(k) calculator helps you project how much your employer-sponsored retirement account could be worth by the time you retire. By entering your current age, planned retirement age, current 401(k) balance, annual salary, and contribution rate, you can see the long-term impact of consistent saving. The calculator runs a year-by-year projection, applying your expected annual return and adding both your contributions and any employer match to your growing balance.',
        'One of the biggest advantages of a 401(k) is the employer match. Many companies match a percentage of your salary that you contribute, which is effectively free money added to your retirement savings. This calculator lets you set both your employee contribution percentage and your employer match percentage, so you can see exactly how much that match adds over the years. Even a modest match can significantly boost your final balance thanks to compounding.',
        'Contributions to a traditional 401(k) are made with pre-tax dollars, lowering your taxable income today, while the money grows tax-deferred until withdrawal. The IRS sets an annual contribution limit that typically increases each year to account for inflation — the default value in this calculator reflects a recent US limit and is fully editable. Because these figures are US-oriented and updated yearly, you should verify the current limit, catch-up provisions, and matching rules with the IRS or your plan administrator before making decisions.',
        'The real power of a 401(k) comes from decades of compounding. Starting early and contributing consistently allows even small amounts to grow into substantial sums. Use this tool to experiment with different contribution rates and retirement ages to find a plan that fits your goals. For a broader view of your finances, try our <a href="/${lang}/tools/retirement-calculator">retirement calculator</a> and our <a href="/${lang}/tools/compound-interest-calculator">compound interest calculator</a> to see how your investments grow over time.',
      ],
      faq: [
        {
          q: 'What is a 401(k) employer match?',
          a: 'An employer match is when your company contributes to your 401(k) based on how much you contribute, usually up to a percentage of your salary. It is essentially free money and one of the best reasons to contribute at least enough to capture the full match.',
        },
        {
          q: 'How much should I contribute to my 401(k)?',
          a: 'A common guideline is to contribute at least enough to get the full employer match, then work toward 10-15% of your salary. The right amount depends on your income, expenses, and retirement goals. Use the calculator to test different contribution rates.',
        },
        {
          q: 'What is the annual 401(k) contribution limit?',
          a: "The IRS sets a yearly limit that usually rises with inflation. The default in this calculator reflects a recent US figure and is editable. Always verify the current year's limit, plus any catch-up contributions for those age 50 and over, with the IRS.",
        },
        {
          q: 'How is my 401(k) growth calculated?',
          a: 'Each year the tool applies your expected annual return to the balance, then adds your contribution (capped at the annual limit) and your employer match. Repeating this until retirement shows your projected balance, total contributions, and total investment growth.',
        },
        {
          q: 'Is my financial data private?',
          a: 'Yes. All calculations run entirely in your browser. Your salary, balance, and other inputs are never sent to any server, stored in a database, or shared with third parties.',
        },
      ],
    },
    it: {
      title:
        'Calcolatore 401(k): Proietta i Tuoi Risparmi Pensionistici e il Contributo del Datore',
      paragraphs: [
        "Un calcolatore 401(k) ti aiuta a proiettare quanto potrebbe valere il tuo conto pensionistico aziendale al momento del pensionamento. Inserendo età attuale, età di pensionamento prevista, saldo 401(k) attuale, stipendio annuo e tasso di contribuzione, puoi vedere l'impatto a lungo termine di un risparmio costante. Il calcolatore esegue una proiezione anno per anno, applicando il rendimento annuale atteso e aggiungendo sia i tuoi contributi sia l'eventuale contributo del datore al saldo in crescita.",
        'Uno dei maggiori vantaggi di un 401(k) è il contributo del datore di lavoro. Molte aziende versano una percentuale del tuo stipendio pari a quanto contribuisci tu, che è di fatto denaro gratuito aggiunto ai tuoi risparmi. Questo calcolatore ti permette di impostare sia la percentuale del tuo contributo sia quella del datore, così da vedere esattamente quanto aggiunge negli anni. Anche un contributo modesto può aumentare notevolmente il saldo finale grazie alla capitalizzazione composta.',
        "I contributi a un 401(k) tradizionale sono versati con denaro al lordo delle tasse, riducendo il reddito imponibile di oggi, mentre il capitale cresce a tassazione differita fino al prelievo. L'IRS fissa un limite di contribuzione annuale che di solito aumenta ogni anno per tenere conto dell'inflazione: il valore predefinito in questo calcolatore riflette un limite USA recente ed è completamente modificabile. Poiché queste cifre sono orientate agli Stati Uniti e aggiornate ogni anno, dovresti verificare il limite attuale, i contributi di recupero e le regole di abbinamento con l'IRS o con l'amministratore del tuo piano prima di decidere.",
        'Il vero potere di un 401(k) deriva da decenni di capitalizzazione composta. Iniziare presto e contribuire con costanza permette anche a piccole somme di crescere fino a diventare importi consistenti. Usa questo strumento per sperimentare diversi tassi di contribuzione ed età di pensionamento e trovare un piano adatto ai tuoi obiettivi. Per una visione più ampia delle tue finanze, prova il nostro <a href="/${lang}/tools/retirement-calculator">calcolatore pensione</a> e il nostro <a href="/${lang}/tools/compound-interest-calculator">calcolatore interesse composto</a> per vedere come crescono i tuoi investimenti nel tempo.',
      ],
      faq: [
        {
          q: "Cos'è il contributo del datore di lavoro a un 401(k)?",
          a: "Il contributo del datore avviene quando l'azienda versa nel tuo 401(k) in base a quanto contribuisci tu, di solito fino a una percentuale dello stipendio. È essenzialmente denaro gratuito e uno dei motivi migliori per contribuire almeno abbastanza da ottenere il contributo pieno.",
        },
        {
          q: 'Quanto dovrei contribuire al mio 401(k)?',
          a: "Una linea guida comune è contribuire almeno abbastanza da ottenere il contributo pieno del datore, poi puntare al 10-15% dello stipendio. L'importo giusto dipende da reddito, spese e obiettivi. Usa il calcolatore per testare diversi tassi.",
        },
        {
          q: 'Qual è il limite di contribuzione annuale del 401(k)?',
          a: "L'IRS fissa un limite annuale che di solito cresce con l'inflazione. Il valore predefinito in questo calcolatore riflette una cifra USA recente ed è modificabile. Verifica sempre il limite dell'anno in corso, oltre agli eventuali contributi di recupero per chi ha 50 anni o più, con l'IRS.",
        },
        {
          q: 'Come viene calcolata la crescita del mio 401(k)?',
          a: "Ogni anno lo strumento applica il rendimento annuale atteso al saldo, poi aggiunge il tuo contributo (limitato dal massimale annuale) e il contributo del datore. Ripetendo fino alla pensione ottieni il saldo previsto, i contributi totali e la crescita totale dell'investimento.",
        },
        {
          q: 'I miei dati finanziari sono privati?',
          a: 'Sì. Tutti i calcoli avvengono interamente nel browser. Stipendio, saldo e altri dati non vengono mai inviati a server, salvati in database o condivisi con terze parti.',
        },
      ],
    },
    es: {
      title: 'Calculadora 401(k): Proyecta Tus Ahorros de Jubilación y el Aporte del Empleador',
      paragraphs: [
        'Una calculadora 401(k) te ayuda a proyectar cuánto podría valer tu cuenta de jubilación patrocinada por el empleador cuando te jubiles. Al introducir tu edad actual, la edad de jubilación prevista, el saldo 401(k) actual, el salario anual y la tasa de aporte, puedes ver el impacto a largo plazo de un ahorro constante. La calculadora realiza una proyección año por año, aplicando tu retorno anual esperado y sumando tanto tus aportes como cualquier aporte del empleador a tu saldo creciente.',
        'Una de las mayores ventajas de un 401(k) es el aporte del empleador. Muchas empresas igualan un porcentaje de tu salario que aportas, lo que es prácticamente dinero gratis añadido a tus ahorros. Esta calculadora te permite fijar tanto el porcentaje de tu aporte como el del empleador, para que veas exactamente cuánto suma ese aporte a lo largo de los años. Incluso un aporte modesto puede aumentar notablemente tu saldo final gracias al interés compuesto.',
        'Los aportes a un 401(k) tradicional se hacen con dinero antes de impuestos, reduciendo tu ingreso imponible hoy, mientras el dinero crece con impuestos diferidos hasta el retiro. El IRS fija un límite de aporte anual que suele aumentar cada año para tener en cuenta la inflación: el valor predeterminado en esta calculadora refleja un límite reciente de EE. UU. y es totalmente editable. Como estas cifras están orientadas a EE. UU. y se actualizan cada año, debes verificar el límite actual, los aportes de recuperación y las reglas de igualación con el IRS o el administrador de tu plan antes de decidir.',
        'El verdadero poder de un 401(k) proviene de décadas de interés compuesto. Empezar temprano y aportar de forma constante permite que incluso pequeñas cantidades crezcan hasta convertirse en sumas considerables. Usa esta herramienta para experimentar con distintas tasas de aporte y edades de jubilación y encontrar un plan que se ajuste a tus objetivos. Para una visión más amplia de tus finanzas, prueba nuestra <a href="/${lang}/tools/retirement-calculator">calculadora de jubilación</a> y nuestra <a href="/${lang}/tools/compound-interest-calculator">calculadora de interés compuesto</a> para ver cómo crecen tus inversiones con el tiempo.',
      ],
      faq: [
        {
          q: '¿Qué es el aporte del empleador a un 401(k)?',
          a: 'El aporte del empleador ocurre cuando tu empresa contribuye a tu 401(k) según cuánto aportas tú, normalmente hasta un porcentaje del salario. Es esencialmente dinero gratis y una de las mejores razones para aportar al menos lo suficiente para obtener el aporte completo.',
        },
        {
          q: '¿Cuánto debería aportar a mi 401(k)?',
          a: 'Una guía común es aportar al menos lo suficiente para obtener el aporte completo del empleador y luego apuntar al 10-15% del salario. La cantidad correcta depende de tus ingresos, gastos y metas. Usa la calculadora para probar distintas tasas.',
        },
        {
          q: '¿Cuál es el límite de aporte anual del 401(k)?',
          a: 'El IRS fija un límite anual que suele subir con la inflación. El valor predeterminado en esta calculadora refleja una cifra reciente de EE. UU. y es editable. Verifica siempre el límite del año en curso, más los aportes de recuperación para quienes tienen 50 años o más, con el IRS.',
        },
        {
          q: '¿Cómo se calcula el crecimiento de mi 401(k)?',
          a: 'Cada año la herramienta aplica tu retorno anual esperado al saldo, luego suma tu aporte (limitado por el máximo anual) y el aporte del empleador. Repetir esto hasta la jubilación muestra tu saldo proyectado, los aportes totales y el crecimiento total de la inversión.',
        },
        {
          q: '¿Son privados mis datos financieros?',
          a: 'Sí. Todos los cálculos se realizan por completo en tu navegador. Tu salario, saldo y otros datos nunca se envían a un servidor, se guardan en una base de datos ni se comparten con terceros.',
        },
      ],
    },
    fr: {
      title: "Calculateur 401(k) : Projetez Votre Épargne Retraite et l'Abondement Employeur",
      paragraphs: [
        "Un calculateur 401(k) vous aide à projeter la valeur que pourrait atteindre votre compte retraite d'entreprise au moment de votre départ à la retraite. En saisissant votre âge actuel, l'âge de retraite prévu, le solde 401(k) actuel, le salaire annuel et le taux de cotisation, vous visualisez l'impact à long terme d'une épargne régulière. Le calculateur effectue une projection année par année, en appliquant votre rendement annuel attendu et en ajoutant à votre solde croissant vos cotisations ainsi que tout abondement employeur.",
        "L'un des plus grands avantages d'un 401(k) est l'abondement de l'employeur. De nombreuses entreprises versent un pourcentage de votre salaire correspondant à ce que vous cotisez, ce qui constitue de fait de l'argent gratuit ajouté à votre épargne. Ce calculateur vous permet de fixer à la fois le pourcentage de votre cotisation et celui de l'employeur, afin de voir exactement combien cet abondement ajoute au fil des ans. Même un abondement modeste peut considérablement augmenter votre solde final grâce aux intérêts composés.",
        "Les cotisations à un 401(k) traditionnel sont versées avec des dollars avant impôt, ce qui réduit votre revenu imposable aujourd'hui, tandis que l'argent croît avec un report d'imposition jusqu'au retrait. L'IRS fixe un plafond de cotisation annuel qui augmente généralement chaque année pour tenir compte de l'inflation : la valeur par défaut de ce calculateur reflète un plafond US récent et est entièrement modifiable. Comme ces chiffres sont orientés vers les États-Unis et mis à jour chaque année, vous devriez vérifier le plafond actuel, les cotisations de rattrapage et les règles d'abondement auprès de l'IRS ou de l'administrateur de votre régime avant de décider.",
        'La véritable puissance d\'un 401(k) vient de décennies d\'intérêts composés. Commencer tôt et cotiser régulièrement permet même à de petites sommes de croître pour devenir des montants importants. Utilisez cet outil pour tester différents taux de cotisation et âges de retraite afin de trouver un plan adapté à vos objectifs. Pour une vision plus large de vos finances, essayez notre <a href="/${lang}/tools/retirement-calculator">calculateur de retraite</a> et notre <a href="/${lang}/tools/compound-interest-calculator">calculateur d\'intérêts composés</a> pour voir comment vos investissements croissent dans le temps.',
      ],
      faq: [
        {
          q: "Qu'est-ce que l'abondement employeur d'un 401(k) ?",
          a: "L'abondement employeur se produit lorsque votre entreprise verse sur votre 401(k) en fonction de ce que vous cotisez, généralement jusqu'à un pourcentage du salaire. C'est essentiellement de l'argent gratuit et l'une des meilleures raisons de cotiser au moins assez pour capter l'abondement complet.",
        },
        {
          q: 'Combien devrais-je cotiser à mon 401(k) ?',
          a: "Une règle courante consiste à cotiser au moins assez pour obtenir l'abondement complet, puis à viser 10-15% du salaire. Le bon montant dépend de vos revenus, dépenses et objectifs. Utilisez le calculateur pour tester différents taux.",
        },
        {
          q: 'Quel est le plafond de cotisation annuel du 401(k) ?',
          a: "L'IRS fixe un plafond annuel qui augmente généralement avec l'inflation. La valeur par défaut de ce calculateur reflète un chiffre US récent et est modifiable. Vérifiez toujours le plafond de l'année en cours, ainsi que les cotisations de rattrapage pour les 50 ans et plus, auprès de l'IRS.",
        },
        {
          q: 'Comment la croissance de mon 401(k) est-elle calculée ?',
          a: "Chaque année, l'outil applique votre rendement annuel attendu au solde, puis ajoute votre cotisation (plafonnée au maximum annuel) et l'abondement employeur. Répéter cela jusqu'à la retraite indique votre solde projeté, les cotisations totales et la croissance totale de l'investissement.",
        },
        {
          q: 'Mes données financières sont-elles privées ?',
          a: 'Oui. Tous les calculs se font entièrement dans votre navigateur. Votre salaire, votre solde et vos autres saisies ne sont jamais envoyés à un serveur, stockés dans une base de données ni partagés avec des tiers.',
        },
      ],
    },
    de: {
      title: '401(k)-Rechner: Projizieren Sie Ihre Altersvorsorge und den Arbeitgeberzuschuss',
      paragraphs: [
        'Ein 401(k)-Rechner hilft Ihnen abzuschätzen, wie viel Ihr arbeitgeberfinanziertes Altersvorsorgekonto bis zum Ruhestand wert sein könnte. Durch Eingabe Ihres aktuellen Alters, des geplanten Rentenalters, des aktuellen 401(k)-Guthabens, des Jahresgehalts und der Beitragsrate sehen Sie die langfristige Wirkung konsequenten Sparens. Der Rechner erstellt eine Jahr-für-Jahr-Projektion, wendet Ihre erwartete Jahresrendite an und fügt sowohl Ihre Beiträge als auch einen etwaigen Arbeitgeberzuschuss zu Ihrem wachsenden Guthaben hinzu.',
        'Einer der größten Vorteile eines 401(k) ist der Arbeitgeberzuschuss. Viele Unternehmen zahlen einen Prozentsatz Ihres Gehalts entsprechend Ihrem Beitrag ein, was praktisch kostenloses Geld für Ihre Vorsorge bedeutet. Dieser Rechner lässt Sie sowohl Ihren Beitragssatz als auch den Arbeitgeberzuschuss festlegen, sodass Sie genau sehen, wie viel dieser Zuschuss über die Jahre hinzufügt. Selbst ein bescheidener Zuschuss kann Ihr Endguthaben dank Zinseszinseffekt deutlich erhöhen.',
        'Beiträge zu einem traditionellen 401(k) werden mit Vorsteuergeldern geleistet, was Ihr heutiges zu versteuerndes Einkommen senkt, während das Geld bis zur Auszahlung steueraufgeschoben wächst. Der IRS legt ein jährliches Beitragslimit fest, das in der Regel jedes Jahr zum Inflationsausgleich steigt — der Standardwert in diesem Rechner spiegelt ein aktuelles US-Limit wider und ist vollständig editierbar. Da diese Zahlen US-orientiert sind und jährlich aktualisiert werden, sollten Sie das aktuelle Limit, Nachholbeiträge und Zuschussregeln beim IRS oder Ihrem Planverwalter überprüfen, bevor Sie Entscheidungen treffen.',
        'Die wahre Stärke eines 401(k) liegt in jahrzehntelangem Zinseszins. Früh zu beginnen und stetig einzuzahlen lässt selbst kleine Beträge zu erheblichen Summen anwachsen. Nutzen Sie dieses Tool, um verschiedene Beitragssätze und Rentenalter durchzuspielen und einen Plan zu finden, der zu Ihren Zielen passt. Für einen umfassenderen Blick auf Ihre Finanzen testen Sie unseren <a href="/${lang}/tools/retirement-calculator">Rentenrechner</a> und unseren <a href="/${lang}/tools/compound-interest-calculator">Zinseszinsrechner</a>, um zu sehen, wie Ihre Investitionen im Laufe der Zeit wachsen.',
      ],
      faq: [
        {
          q: 'Was ist ein 401(k)-Arbeitgeberzuschuss?',
          a: 'Ein Arbeitgeberzuschuss liegt vor, wenn Ihr Unternehmen abhängig von Ihrem Beitrag in Ihr 401(k) einzahlt, üblicherweise bis zu einem Prozentsatz des Gehalts. Es ist im Grunde kostenloses Geld und einer der besten Gründe, mindestens so viel einzuzahlen, dass Sie den vollen Zuschuss erhalten.',
        },
        {
          q: 'Wie viel sollte ich in mein 401(k) einzahlen?',
          a: 'Eine gängige Faustregel ist, mindestens so viel einzuzahlen, dass Sie den vollen Arbeitgeberzuschuss erhalten, und dann 10-15% des Gehalts anzustreben. Der richtige Betrag hängt von Einkommen, Ausgaben und Zielen ab. Testen Sie verschiedene Sätze mit dem Rechner.',
        },
        {
          q: 'Wie hoch ist das jährliche 401(k)-Beitragslimit?',
          a: 'Der IRS legt ein Jahreslimit fest, das meist mit der Inflation steigt. Der Standardwert in diesem Rechner spiegelt eine aktuelle US-Zahl wider und ist editierbar. Prüfen Sie stets das Limit des laufenden Jahres sowie etwaige Nachholbeiträge für Personen ab 50 beim IRS.',
        },
        {
          q: 'Wie wird das Wachstum meines 401(k) berechnet?',
          a: 'Jedes Jahr wendet das Tool Ihre erwartete Jahresrendite auf das Guthaben an und addiert dann Ihren Beitrag (begrenzt durch das Jahreslimit) und den Arbeitgeberzuschuss. Wiederholt bis zum Ruhestand zeigt dies Ihr prognostiziertes Guthaben, die Gesamtbeiträge und das gesamte Anlagewachstum.',
        },
        {
          q: 'Sind meine Finanzdaten privat?',
          a: 'Ja. Alle Berechnungen erfolgen vollständig in Ihrem Browser. Ihr Gehalt, Guthaben und andere Eingaben werden niemals an einen Server gesendet, in einer Datenbank gespeichert oder an Dritte weitergegeben.',
        },
      ],
    },
    pt: {
      title:
        'Calculadora 401(k): Projete Sua Poupança de Aposentadoria e a Contribuição do Empregador',
      paragraphs: [
        'Uma calculadora 401(k) ajuda a projetar quanto sua conta de aposentadoria patrocinada pelo empregador poderá valer no momento da aposentadoria. Ao inserir sua idade atual, a idade de aposentadoria prevista, o saldo 401(k) atual, o salário anual e a taxa de contribuição, você vê o impacto de longo prazo de uma poupança constante. A calculadora faz uma projeção ano a ano, aplicando o retorno anual esperado e somando tanto suas contribuições quanto qualquer contribuição do empregador ao saldo em crescimento.',
        'Uma das maiores vantagens de um 401(k) é a contribuição do empregador. Muitas empresas igualam uma porcentagem do seu salário que você contribui, o que é praticamente dinheiro grátis somado à sua poupança. Esta calculadora permite definir tanto a porcentagem da sua contribuição quanto a do empregador, para que você veja exatamente quanto essa contribuição acrescenta ao longo dos anos. Mesmo uma contribuição modesta pode aumentar bastante o saldo final graças aos juros compostos.',
        'As contribuições a um 401(k) tradicional são feitas com dinheiro antes dos impostos, reduzindo sua renda tributável hoje, enquanto o dinheiro cresce com tributação diferida até o saque. O IRS define um limite de contribuição anual que normalmente aumenta a cada ano para acompanhar a inflação — o valor padrão nesta calculadora reflete um limite recente dos EUA e é totalmente editável. Como esses valores são orientados aos EUA e atualizados anualmente, você deve verificar o limite atual, as contribuições de recuperação e as regras de igualação com o IRS ou o administrador do seu plano antes de decidir.',
        'O verdadeiro poder de um 401(k) vem de décadas de juros compostos. Começar cedo e contribuir de forma constante permite que até pequenas quantias cresçam até se tornarem somas consideráveis. Use esta ferramenta para testar diferentes taxas de contribuição e idades de aposentadoria e encontrar um plano que combine com seus objetivos. Para uma visão mais ampla das suas finanças, experimente a nossa <a href="/${lang}/tools/retirement-calculator">calculadora de aposentadoria</a> e a nossa <a href="/${lang}/tools/compound-interest-calculator">calculadora de juros compostos</a> para ver como seus investimentos crescem ao longo do tempo.',
      ],
      faq: [
        {
          q: 'O que é a contribuição do empregador em um 401(k)?',
          a: 'A contribuição do empregador ocorre quando sua empresa deposita no seu 401(k) com base no quanto você contribui, geralmente até uma porcentagem do salário. É essencialmente dinheiro grátis e um dos melhores motivos para contribuir pelo menos o suficiente para captar a contribuição total.',
        },
        {
          q: 'Quanto devo contribuir para o meu 401(k)?',
          a: 'Uma diretriz comum é contribuir pelo menos o suficiente para obter a contribuição total do empregador e, depois, buscar 10-15% do salário. O valor certo depende da sua renda, despesas e metas. Use a calculadora para testar diferentes taxas.',
        },
        {
          q: 'Qual é o limite de contribuição anual do 401(k)?',
          a: 'O IRS define um limite anual que costuma subir com a inflação. O valor padrão nesta calculadora reflete um número recente dos EUA e é editável. Verifique sempre o limite do ano corrente, além de eventuais contribuições de recuperação para quem tem 50 anos ou mais, com o IRS.',
        },
        {
          q: 'Como o crescimento do meu 401(k) é calculado?',
          a: 'A cada ano a ferramenta aplica o retorno anual esperado ao saldo e, em seguida, soma sua contribuição (limitada ao máximo anual) e a contribuição do empregador. Repetindo isso até a aposentadoria, obtém-se o saldo projetado, as contribuições totais e o crescimento total do investimento.',
        },
        {
          q: 'Meus dados financeiros são privados?',
          a: 'Sim. Todos os cálculos ocorrem inteiramente no seu navegador. Seu salário, saldo e outros dados nunca são enviados a servidores, armazenados em banco de dados ou compartilhados com terceiros.',
        },
      ],
    },
  };

  const seo = seoContent[lang] || seoContent.en;
  const result = model.result;

  return (
    <ToolPageWrapper toolSlug="401k-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.currentAge[lang]}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={currentAge}
                onChange={(e) => setCurrentAge(e.target.value)}
                className={inputClass('currentAge')}
              />
              {errText('currentAge') && (
                <p className="text-red-600 text-xs mt-1">{errText('currentAge')}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.retirementAge[lang]}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={retirementAge}
                onChange={(e) => setRetirementAge(e.target.value)}
                className={inputClass('retirementAge')}
              />
              {errText('retirementAge') && (
                <p className="text-red-600 text-xs mt-1">{errText('retirementAge')}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.currentBalance[lang]}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              className={inputClass('currentBalance')}
            />
            {errText('currentBalance') && (
              <p className="text-red-600 text-xs mt-1">{errText('currentBalance')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.annualSalary[lang]}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={annualSalary}
              onChange={(e) => setAnnualSalary(e.target.value)}
              className={inputClass('annualSalary')}
            />
            {errText('annualSalary') && (
              <p className="text-red-600 text-xs mt-1">{errText('annualSalary')}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.empPct[lang]}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={empPct}
                onChange={(e) => setEmpPct(e.target.value)}
                className={inputClass('empPct')}
              />
              {errText('empPct') && (
                <p className="text-red-600 text-xs mt-1">{errText('empPct')}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.matchPct[lang]}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={matchPct}
                onChange={(e) => setMatchPct(e.target.value)}
                className={inputClass('matchPct')}
              />
              {errText('matchPct') && (
                <p className="text-red-600 text-xs mt-1">{errText('matchPct')}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.annualReturn[lang]}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(e.target.value)}
                className={inputClass('annualReturn')}
              />
              {errText('annualReturn') && (
                <p className="text-red-600 text-xs mt-1">{errText('annualReturn')}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.contribLimit[lang]}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={contribLimit}
                onChange={(e) => setContribLimit(e.target.value)}
                className={inputClass('contribLimit')}
              />
              {errText('contribLimit') ? (
                <p className="text-red-600 text-xs mt-1">{errText('contribLimit')}</p>
              ) : (
                <p className="text-gray-400 text-xs mt-1">{labels.limitNote[lang]}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleCopy}
              disabled={!result}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? labels.copied[lang] : labels.copy[lang]}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              {labels.reset[lang]}
            </button>
          </div>

          {/* Results */}
          {result && (
            <>
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{labels.results[lang]}</h3>

                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <div className="text-sm text-white/80">{labels.finalBalance[lang]}</div>
                    <div className="text-2xl font-bold">{fmt(result.finalBalance)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-xs text-green-600 font-medium">
                        {labels.totalContributed[lang]}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {fmt(result.totalContributed)}
                      </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="text-xs text-purple-600 font-medium">
                        {labels.totalGrowth[lang]}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {fmt(result.totalGrowth)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-500">{labels.yearsLabel[lang]}</div>
                      <div className="text-xl font-bold text-gray-900">{result.years}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-500">{labels.yourContributions[lang]}</div>
                      <div className="text-sm font-bold text-gray-900">
                        {fmt(result.totalEmployee)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-500">
                        {labels.employerContributions[lang]}
                      </div>
                      <div className="text-sm font-bold text-green-600">
                        {fmt(result.totalEmployer)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Year-by-year table */}
              {result.rows.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowTable(!showTable)}
                    className="text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors"
                  >
                    {showTable ? labels.hideTable[lang] : labels.showTable[lang]} -{' '}
                    {labels.yearByYear[lang]}
                  </button>
                  {showTable && (
                    <div className="mt-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="text-left px-3 py-2 text-gray-600 font-medium">
                              {labels.year[lang]}
                            </th>
                            <th className="text-left px-3 py-2 text-gray-600 font-medium">
                              {labels.age[lang]}
                            </th>
                            <th className="text-right px-3 py-2 text-gray-600 font-medium">
                              {labels.balance[lang]}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.rows.map((row) => (
                            <tr
                              key={row.year}
                              className="border-t border-gray-100 hover:bg-gray-50"
                            >
                              <td className="px-3 py-1.5 text-gray-700">{row.year}</td>
                              <td className="px-3 py-1.5 text-gray-700">{row.age}</td>
                              <td className="px-3 py-1.5 text-right font-mono text-gray-900">
                                {fmt(row.balance)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-gray-700 leading-relaxed mb-4"
              dangerouslySetInnerHTML={{ __html: p.replace(/\$\{lang\}/g, lang) }}
            />
          ))}
        </article>

        <section className="mt-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQ</h2>
          <div className="space-y-2">
            {seo.faq.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-4 py-3 font-medium text-gray-900 flex justify-between items-center"
                >
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
