'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type Coverage = 'self' | 'family';
type ErrCode = 'required' | 'invalid' | 'negative' | 'range';

const SELF_LIMIT = '4300';
const FAMILY_LIMIT = '8550';

export default function HsaCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['hsa-calculator'][lang];

  const [coverage, setCoverage] = useState<Coverage>('self');
  const [limitStr, setLimitStr] = useState<string>(SELF_LIMIT);
  const [contributionStr, setContributionStr] = useState<string>(SELF_LIMIT);
  const [taxRateStr, setTaxRateStr] = useState<string>('24');
  const [yearsStr, setYearsStr] = useState<string>('20');
  const [returnStr, setReturnStr] = useState<string>('5');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const labels = {
    coverageType: {
      en: 'Coverage type',
      it: 'Tipo di copertura',
      es: 'Tipo de cobertura',
      fr: 'Type de couverture',
      de: 'Deckungsart',
      pt: 'Tipo de cobertura',
    },
    selfOnly: {
      en: 'Self-only',
      it: 'Individuale',
      es: 'Individual',
      fr: 'Individuelle',
      de: 'Einzelperson',
      pt: 'Individual',
    },
    family: {
      en: 'Family',
      it: 'Famiglia',
      es: 'Familiar',
      fr: 'Familiale',
      de: 'Familie',
      pt: 'Familiar',
    },
    contributionLimit: {
      en: 'Annual contribution limit ($)',
      it: 'Limite contributo annuo ($)',
      es: 'Límite de aporte anual ($)',
      fr: 'Plafond de cotisation annuel ($)',
      de: 'Jährliches Beitragslimit ($)',
      pt: 'Limite de contribuição anual ($)',
    },
    annualContribution: {
      en: 'Annual contribution ($)',
      it: 'Contributo annuo ($)',
      es: 'Aporte anual ($)',
      fr: 'Cotisation annuelle ($)',
      de: 'Jährlicher Beitrag ($)',
      pt: 'Contribuição anual ($)',
    },
    marginalTaxRate: {
      en: 'Marginal tax rate (%)',
      it: 'Aliquota marginale (%)',
      es: 'Tasa impositiva marginal (%)',
      fr: "Taux d'imposition marginal (%)",
      de: 'Grenzsteuersatz (%)',
      pt: 'Alíquota marginal (%)',
    },
    yearsToGrow: {
      en: 'Years to grow',
      it: 'Anni di crescita',
      es: 'Años de crecimiento',
      fr: 'Années de croissance',
      de: 'Wachstumsjahre',
      pt: 'Anos de crescimento',
    },
    expectedReturn: {
      en: 'Expected annual return (%)',
      it: 'Rendimento annuo atteso (%)',
      es: 'Retorno anual esperado (%)',
      fr: 'Rendement annuel attendu (%)',
      de: 'Erwartete Jahresrendite (%)',
      pt: 'Retorno anual esperado (%)',
    },
    results: {
      en: 'Results',
      it: 'Risultati',
      es: 'Resultados',
      fr: 'Résultats',
      de: 'Ergebnisse',
      pt: 'Resultados',
    },
    projectedBalance: {
      en: 'Projected HSA balance',
      it: 'Saldo HSA proiettato',
      es: 'Saldo HSA proyectado',
      fr: 'Solde HSA projeté',
      de: 'Projizierter HSA-Saldo',
      pt: 'Saldo HSA projetado',
    },
    annualTaxSavings: {
      en: 'Annual tax savings',
      it: 'Risparmio fiscale annuo',
      es: 'Ahorro fiscal anual',
      fr: "Économie d'impôt annuelle",
      de: 'Jährliche Steuerersparnis',
      pt: 'Economia fiscal anual',
    },
    totalContributions: {
      en: 'Total contributions',
      it: 'Contributi totali',
      es: 'Aportes totales',
      fr: 'Cotisations totales',
      de: 'Gesamtbeiträge',
      pt: 'Contribuições totais',
    },
    totalTaxSavings: {
      en: 'Total tax savings',
      it: 'Risparmio fiscale totale',
      es: 'Ahorro fiscal total',
      fr: "Économie d'impôt totale",
      de: 'Gesamte Steuerersparnis',
      pt: 'Economia fiscal total',
    },
    totalGrowth: {
      en: 'Total investment growth',
      it: 'Crescita investimento',
      es: 'Crecimiento de inversión',
      fr: "Croissance de l'investissement",
      de: 'Gesamte Anlagerendite',
      pt: 'Crescimento do investimento',
    },
    copyResult: {
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
    errRequired: {
      en: 'This field is required',
      it: 'Campo obbligatorio',
      es: 'Este campo es obligatorio',
      fr: 'Ce champ est requis',
      de: 'Dieses Feld ist erforderlich',
      pt: 'Este campo é obrigatório',
    },
    errInvalid: {
      en: 'Enter a valid number',
      it: 'Inserisci un numero valido',
      es: 'Introduce un número válido',
      fr: 'Entrez un nombre valide',
      de: 'Geben Sie eine gültige Zahl ein',
      pt: 'Insira um número válido',
    },
    errNegative: {
      en: 'Value cannot be negative',
      it: 'Il valore non può essere negativo',
      es: 'El valor no puede ser negativo',
      fr: 'La valeur ne peut pas être négative',
      de: 'Wert darf nicht negativ sein',
      pt: 'O valor não pode ser negativo',
    },
    errTaxRange: {
      en: 'Rate must be between 0 and 100',
      it: "L'aliquota deve essere tra 0 e 100",
      es: 'La tasa debe estar entre 0 y 100',
      fr: 'Le taux doit être entre 0 et 100',
      de: 'Satz muss zwischen 0 und 100 liegen',
      pt: 'A taxa deve estar entre 0 e 100',
    },
    limitWarning: {
      en: 'Contribution exceeds the annual limit you set.',
      it: 'Il contributo supera il limite annuo impostato.',
      es: 'El aporte supera el límite anual que estableciste.',
      fr: 'La cotisation dépasse le plafond annuel défini.',
      de: 'Der Beitrag überschreitet das festgelegte Jahreslimit.',
      pt: 'A contribuição excede o limite anual definido.',
    },
  } as Record<string, Record<Locale, string>>;

  const validate = (value: string, max?: number): ErrCode | null => {
    const trimmed = value.trim();
    if (trimmed === '') return 'required';
    const n = Number(trimmed);
    if (!Number.isFinite(n)) return 'invalid';
    if (n < 0) return 'negative';
    if (max !== undefined && n > max) return 'range';
    return null;
  };

  const errors = {
    limit: validate(limitStr),
    contribution: validate(contributionStr),
    taxRate: validate(taxRateStr, 100),
    years: validate(yearsStr),
    ret: validate(returnStr),
  };
  const hasError = Object.values(errors).some((e) => e !== null);

  const contribution = Number(contributionStr);
  const limit = Number(limitStr);
  const taxRate = Number(taxRateStr);
  const years = Number(yearsStr);
  const ret = Number(returnStr);

  const result = useMemo(() => {
    if (hasError) return null;
    const wholeYears = Math.floor(years);
    let balance = 0;
    for (let y = 0; y < wholeYears; y++) {
      balance = balance * (1 + ret / 100) + contribution;
    }
    const annualTaxSavings = contribution * (taxRate / 100);
    const totalContributions = contribution * wholeYears;
    const totalTaxSavings = annualTaxSavings * wholeYears;
    const totalGrowth = balance - totalContributions;
    return { balance, annualTaxSavings, totalContributions, totalTaxSavings, totalGrowth };
  }, [hasError, contribution, taxRate, years, ret]);

  const overLimit = errors.contribution === null && errors.limit === null && contribution > limit;

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
      { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }
    ).format(n);

  const errText = (code: ErrCode): string =>
    code === 'required'
      ? labels.errRequired[lang]
      : code === 'invalid'
        ? labels.errInvalid[lang]
        : code === 'negative'
          ? labels.errNegative[lang]
          : labels.errTaxRange[lang];

  const handleCoverage = (next: Coverage): void => {
    setCoverage(next);
    setLimitStr(next === 'family' ? FAMILY_LIMIT : SELF_LIMIT);
  };

  const handleCopy = async (): Promise<void> => {
    if (!result) return;
    const text = `${labels.projectedBalance[lang]}: ${fmt(result.balance)} | ${labels.annualTaxSavings[lang]}: ${fmt(result.annualTaxSavings)} | ${labels.totalTaxSavings[lang]}: ${fmt(result.totalTaxSavings)}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = (): void => {
    setCoverage('self');
    setLimitStr(SELF_LIMIT);
    setContributionStr(SELF_LIMIT);
    setTaxRateStr('24');
    setYearsStr('20');
    setReturnStr('5');
    setCopied(false);
  };

  const inputClass = (hasErr: boolean): string =>
    `w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${hasErr ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'HSA Calculator: Project Your Health Savings Account Growth and Tax Savings',
      paragraphs: [
        'A Health Savings Account (HSA) is one of the most tax-efficient accounts available in the United States. It offers a rare triple tax advantage: contributions are tax-deductible, the money grows tax-free, and qualified medical withdrawals are also tax-free. This HSA calculator helps you project how your account could grow over time and how much you could save on taxes each year, based on your coverage type, annual contribution, marginal tax rate, expected investment return, and time horizon.',
        'The projection uses a simple, transparent model. Each year your balance earns your expected annual return and then receives your yearly contribution, so the effect of compounding builds up over the years you choose. Because many HSAs let you invest the balance in funds once you pass a cash threshold, treating the account as a long-term investment vehicle rather than a spending account can dramatically increase its value by retirement.',
        'Your annual tax savings are estimated by multiplying your contribution by your marginal tax rate. For example, contributing $4,300 at a 24% marginal rate saves roughly $1,032 in the first year. Over many years those savings add up, and the calculator shows both the yearly figure and the cumulative total alongside your projected balance, total contributions, and investment growth.',
        'The default contribution limits shown here are US IRS annual figures — $4,300 for self-only coverage and $8,550 for family coverage — and they are fully editable because these limits are updated every year and vary by situation (an extra catch-up contribution applies from age 55). Always verify the current limits with the IRS or your plan administrator before relying on any projection. To plan the rest of your finances, explore our <a href="/${lang}/tools/401k-calculator">401(k) calculator</a>, <a href="/${lang}/tools/retirement-calculator">retirement calculator</a>, and <a href="/${lang}/tools/tax-bracket-calculator">tax bracket calculator</a>.',
      ],
      faq: [
        {
          q: 'What is an HSA and who can open one?',
          a: 'A Health Savings Account is a tax-advantaged account available to people enrolled in a qualifying high-deductible health plan (HDHP). It lets you set aside pre-tax money for qualified medical expenses, and unused funds roll over year after year.',
        },
        {
          q: 'How is the annual tax saving calculated?',
          a: 'The calculator multiplies your annual contribution by your marginal tax rate. Contributing $4,300 at a 24% marginal rate saves about $1,032 in that year, because the contribution reduces your taxable income.',
        },
        {
          q: 'Why are the contribution limits editable?',
          a: 'HSA contribution limits are set by the IRS and change every year, and an extra catch-up amount applies once you turn 55. Making them editable keeps the tool accurate over time and lets you model catch-up contributions or future limit increases.',
        },
        {
          q: 'Is the projected balance guaranteed?',
          a: 'No. The projection assumes a constant annual return, but real investment returns vary from year to year and are not guaranteed. Use the result as a planning estimate, not a promise of future value.',
        },
        {
          q: 'Is my financial data stored?',
          a: 'No. Every calculation runs entirely in your browser. Your inputs are never sent to a server, stored in a database, or shared with anyone.',
        },
      ],
    },
    it: {
      title:
        'Calcolatore HSA: Proietta la Crescita del Conto di Risparmio Sanitario e i Risparmi Fiscali',
      paragraphs: [
        "Un Health Savings Account (HSA) è uno dei conti più efficienti dal punto di vista fiscale disponibili negli Stati Uniti. Offre un raro triplo vantaggio fiscale: i contributi sono deducibili, il denaro cresce esentasse e i prelievi per spese mediche qualificate sono anch'essi esentasse. Questo calcolatore HSA aiuta a proiettare come il conto potrebbe crescere nel tempo e quanto potresti risparmiare in tasse ogni anno, in base al tipo di copertura, al contributo annuo, all'aliquota marginale, al rendimento atteso e all'orizzonte temporale.",
        "La proiezione usa un modello semplice e trasparente. Ogni anno il saldo ottiene il rendimento annuo atteso e poi riceve il contributo annuale, così l'effetto della capitalizzazione si accumula negli anni che scegli. Poiché molti HSA permettono di investire il saldo in fondi una volta superata una soglia di liquidità, trattare il conto come uno strumento di investimento a lungo termine anziché come conto di spesa può aumentarne notevolmente il valore alla pensione.",
        "Il risparmio fiscale annuo è stimato moltiplicando il contributo per l'aliquota marginale. Ad esempio, versare 4.300 $ con un'aliquota del 24% fa risparmiare circa 1.032 $ nel primo anno. In molti anni questi risparmi si sommano, e il calcolatore mostra sia la cifra annuale sia il totale cumulativo accanto al saldo proiettato, ai contributi totali e alla crescita dell'investimento.",
        'I limiti di contributo predefiniti qui indicati sono le cifre annuali dell\'IRS statunitense — 4.300 $ per la copertura individuale e 8.550 $ per quella familiare — e sono completamente modificabili perché questi limiti vengono aggiornati ogni anno e variano in base alla situazione (dai 55 anni si applica un contributo aggiuntivo). Verifica sempre i limiti attuali con l\'IRS o l\'amministratore del piano prima di affidarti a una proiezione. Per pianificare il resto delle finanze, esplora il nostro <a href="/${lang}/tools/401k-calculator">calcolatore 401(k)</a>, il <a href="/${lang}/tools/retirement-calculator">calcolatore pensione</a> e il <a href="/${lang}/tools/tax-bracket-calculator">calcolatore scaglioni fiscali</a>.',
      ],
      faq: [
        {
          q: "Cos'è un HSA e chi può aprirlo?",
          a: 'Un Health Savings Account è un conto fiscalmente agevolato disponibile per chi è iscritto a un piano sanitario ad alta franchigia (HDHP) idoneo. Permette di accantonare denaro pre-tasse per spese mediche qualificate, e i fondi non usati si accumulano di anno in anno.',
        },
        {
          q: 'Come si calcola il risparmio fiscale annuo?',
          a: "Il calcolatore moltiplica il contributo annuo per l'aliquota marginale. Versare 4.300 $ con un'aliquota del 24% fa risparmiare circa 1.032 $ in quell'anno, perché il contributo riduce il reddito imponibile.",
        },
        {
          q: 'Perché i limiti di contributo sono modificabili?',
          a: "I limiti HSA sono fissati dall'IRS e cambiano ogni anno, e dai 55 anni si applica un importo aggiuntivo. Renderli modificabili mantiene lo strumento accurato nel tempo e consente di modellare contributi aggiuntivi o futuri aumenti dei limiti.",
        },
        {
          q: 'Il saldo proiettato è garantito?',
          a: 'No. La proiezione assume un rendimento annuo costante, ma i rendimenti reali variano di anno in anno e non sono garantiti. Usa il risultato come stima di pianificazione, non come promessa di valore futuro.',
        },
        {
          q: 'I miei dati finanziari vengono salvati?',
          a: 'No. Ogni calcolo avviene interamente nel browser. I dati inseriti non vengono mai inviati a server, salvati in database o condivisi con nessuno.',
        },
      ],
    },
    es: {
      title:
        'Calculadora HSA: Proyecta el Crecimiento de tu Cuenta de Ahorro de Salud y el Ahorro Fiscal',
      paragraphs: [
        'Una Cuenta de Ahorro de Salud (HSA) es una de las cuentas más eficientes fiscalmente disponibles en Estados Unidos. Ofrece una rara triple ventaja fiscal: los aportes son deducibles, el dinero crece libre de impuestos y los retiros para gastos médicos calificados también están exentos. Esta calculadora HSA te ayuda a proyectar cómo podría crecer tu cuenta con el tiempo y cuánto podrías ahorrar en impuestos cada año, según tu tipo de cobertura, aporte anual, tasa impositiva marginal, retorno esperado y horizonte temporal.',
        'La proyección usa un modelo simple y transparente. Cada año el saldo gana el retorno anual esperado y luego recibe tu aporte anual, de modo que el efecto del interés compuesto se acumula durante los años que elijas. Como muchas HSA permiten invertir el saldo en fondos una vez superado un umbral de efectivo, tratar la cuenta como un vehículo de inversión a largo plazo en lugar de una cuenta de gasto puede aumentar mucho su valor al llegar a la jubilación.',
        'Tu ahorro fiscal anual se estima multiplicando tu aporte por tu tasa impositiva marginal. Por ejemplo, aportar 4.300 $ con una tasa marginal del 24% ahorra unos 1.032 $ el primer año. A lo largo de muchos años estos ahorros se suman, y la calculadora muestra tanto la cifra anual como el total acumulado junto al saldo proyectado, los aportes totales y el crecimiento de la inversión.',
        'Los límites de aporte predeterminados aquí son las cifras anuales del IRS de EE. UU. — 4.300 $ para cobertura individual y 8.550 $ para cobertura familiar — y son totalmente editables porque estos límites se actualizan cada año y varían según la situación (a partir de los 55 años se aplica un aporte adicional de recuperación). Verifica siempre los límites vigentes con el IRS o el administrador de tu plan antes de confiar en cualquier proyección. Para planificar el resto de tus finanzas, explora nuestra <a href="/${lang}/tools/401k-calculator">calculadora 401(k)</a>, la <a href="/${lang}/tools/retirement-calculator">calculadora de jubilación</a> y la <a href="/${lang}/tools/tax-bracket-calculator">calculadora de tramos fiscales</a>.',
      ],
      faq: [
        {
          q: '¿Qué es una HSA y quién puede abrir una?',
          a: 'Una Cuenta de Ahorro de Salud es una cuenta con ventajas fiscales disponible para quienes están inscritos en un plan de salud con deducible alto (HDHP) elegible. Permite reservar dinero antes de impuestos para gastos médicos calificados, y los fondos no usados se acumulan año tras año.',
        },
        {
          q: '¿Cómo se calcula el ahorro fiscal anual?',
          a: 'La calculadora multiplica tu aporte anual por tu tasa impositiva marginal. Aportar 4.300 $ con una tasa del 24% ahorra unos 1.032 $ ese año, porque el aporte reduce tu ingreso imponible.',
        },
        {
          q: '¿Por qué son editables los límites de aporte?',
          a: 'Los límites de la HSA los fija el IRS y cambian cada año, y a partir de los 55 años se aplica un monto adicional. Hacerlos editables mantiene la herramienta precisa con el tiempo y te permite modelar aportes de recuperación o futuros aumentos de límites.',
        },
        {
          q: '¿El saldo proyectado está garantizado?',
          a: 'No. La proyección asume un retorno anual constante, pero los retornos reales varían de un año a otro y no están garantizados. Usa el resultado como una estimación de planificación, no como una promesa de valor futuro.',
        },
        {
          q: '¿Se almacenan mis datos financieros?',
          a: 'No. Todos los cálculos se ejecutan completamente en tu navegador. Tus datos nunca se envían a un servidor, se guardan en una base de datos ni se comparten con nadie.',
        },
      ],
    },
    fr: {
      title:
        'Calculateur HSA : Projetez la Croissance de votre Compte Épargne Santé et vos Économies Fiscales',
      paragraphs: [
        "Un Health Savings Account (HSA) est l'un des comptes les plus avantageux fiscalement disponibles aux États-Unis. Il offre un rare triple avantage fiscal : les cotisations sont déductibles, l'argent croît en franchise d'impôt et les retraits pour frais médicaux admissibles sont également exonérés. Ce calculateur HSA vous aide à projeter comment votre compte pourrait croître au fil du temps et combien vous pourriez économiser en impôts chaque année, selon votre type de couverture, votre cotisation annuelle, votre taux marginal, le rendement attendu et l'horizon temporel.",
        "La projection utilise un modèle simple et transparent. Chaque année, le solde obtient le rendement annuel attendu puis reçoit votre cotisation annuelle, de sorte que l'effet des intérêts composés s'accumule sur les années que vous choisissez. Comme de nombreux HSA permettent d'investir le solde dans des fonds une fois un seuil de liquidités dépassé, traiter le compte comme un véhicule d'investissement à long terme plutôt que comme un compte de dépenses peut fortement augmenter sa valeur à la retraite.",
        "Votre économie d'impôt annuelle est estimée en multipliant votre cotisation par votre taux marginal. Par exemple, cotiser 4 300 $ à un taux marginal de 24 % économise environ 1 032 $ la première année. Sur de nombreuses années, ces économies s'additionnent, et le calculateur affiche à la fois le chiffre annuel et le total cumulé à côté du solde projeté, des cotisations totales et de la croissance de l'investissement.",
        'Les plafonds de cotisation par défaut indiqués ici sont les chiffres annuels de l\'IRS américain — 4 300 $ pour une couverture individuelle et 8 550 $ pour une couverture familiale — et ils sont entièrement modifiables car ces plafonds sont mis à jour chaque année et varient selon la situation (une cotisation de rattrapage s\'applique dès 55 ans). Vérifiez toujours les plafonds en vigueur auprès de l\'IRS ou de votre administrateur de régime avant de vous fier à une projection. Pour planifier le reste de vos finances, explorez notre <a href="/${lang}/tools/401k-calculator">calculateur 401(k)</a>, le <a href="/${lang}/tools/retirement-calculator">calculateur de retraite</a> et le <a href="/${lang}/tools/tax-bracket-calculator">calculateur de tranches d\'imposition</a>.',
      ],
      faq: [
        {
          q: "Qu'est-ce qu'un HSA et qui peut en ouvrir un ?",
          a: "Un Health Savings Account est un compte fiscalement avantageux accessible aux personnes inscrites à un régime de santé à franchise élevée (HDHP) admissible. Il permet de mettre de côté de l'argent avant impôt pour des frais médicaux admissibles, et les fonds inutilisés se reportent d'année en année.",
        },
        {
          q: "Comment l'économie d'impôt annuelle est-elle calculée ?",
          a: 'Le calculateur multiplie votre cotisation annuelle par votre taux marginal. Cotiser 4 300 $ à un taux de 24 % économise environ 1 032 $ cette année-là, car la cotisation réduit votre revenu imposable.',
        },
        {
          q: 'Pourquoi les plafonds de cotisation sont-ils modifiables ?',
          a: "Les plafonds HSA sont fixés par l'IRS et changent chaque année, et un montant de rattrapage s'applique dès 55 ans. Les rendre modifiables maintient l'outil précis dans le temps et permet de modéliser des cotisations de rattrapage ou de futures hausses de plafonds.",
        },
        {
          q: 'Le solde projeté est-il garanti ?',
          a: "Non. La projection suppose un rendement annuel constant, mais les rendements réels varient d'une année à l'autre et ne sont pas garantis. Utilisez le résultat comme une estimation de planification, pas comme une promesse de valeur future.",
        },
        {
          q: 'Mes données financières sont-elles stockées ?',
          a: "Non. Chaque calcul s'exécute entièrement dans votre navigateur. Vos données ne sont jamais envoyées à un serveur, stockées dans une base de données ni partagées avec qui que ce soit.",
        },
      ],
    },
    de: {
      title:
        'HSA-Rechner: Projizieren Sie das Wachstum Ihres Gesundheitssparkontos und Ihre Steuerersparnis',
      paragraphs: [
        'Ein Health Savings Account (HSA) ist eines der steuerlich effizientesten Konten in den USA. Es bietet einen seltenen dreifachen Steuervorteil: Beiträge sind absetzbar, das Geld wächst steuerfrei und Abhebungen für qualifizierte medizinische Ausgaben sind ebenfalls steuerfrei. Dieser HSA-Rechner hilft Ihnen zu projizieren, wie Ihr Konto im Laufe der Zeit wachsen könnte und wie viel Sie jährlich an Steuern sparen könnten — basierend auf Deckungsart, Jahresbeitrag, Grenzsteuersatz, erwarteter Rendite und Zeithorizont.',
        'Die Projektion verwendet ein einfaches, transparentes Modell. Jedes Jahr erzielt der Saldo die erwartete Jahresrendite und erhält dann Ihren Jahresbeitrag, sodass sich der Zinseszinseffekt über die von Ihnen gewählten Jahre aufbaut. Da viele HSAs erlauben, den Saldo ab einer Bargeldschwelle in Fonds anzulegen, kann die Behandlung des Kontos als langfristiges Anlageinstrument statt als Ausgabenkonto seinen Wert bis zur Rente erheblich steigern.',
        'Ihre jährliche Steuerersparnis wird geschätzt, indem Ihr Beitrag mit Ihrem Grenzsteuersatz multipliziert wird. Ein Beitrag von 4.300 $ bei einem Grenzsatz von 24 % spart im ersten Jahr etwa 1.032 $. Über viele Jahre summieren sich diese Ersparnisse, und der Rechner zeigt sowohl den Jahreswert als auch die kumulierte Summe neben dem projizierten Saldo, den Gesamtbeiträgen und dem Anlagewachstum.',
        'Die hier angezeigten Standard-Beitragsgrenzen sind die jährlichen Werte der US-Steuerbehörde IRS — 4.300 $ für Einzelperson und 8.550 $ für Familie — und sie sind vollständig editierbar, da diese Grenzen jährlich aktualisiert werden und je nach Situation variieren (ab 55 Jahren gilt ein zusätzlicher Nachholbeitrag). Prüfen Sie die aktuellen Grenzen immer bei der IRS oder Ihrem Planverwalter, bevor Sie sich auf eine Projektion verlassen. Um Ihre übrigen Finanzen zu planen, nutzen Sie unseren <a href="/${lang}/tools/401k-calculator">401(k)-Rechner</a>, den <a href="/${lang}/tools/retirement-calculator">Rentenrechner</a> und den <a href="/${lang}/tools/tax-bracket-calculator">Steuerklassenrechner</a>.',
      ],
      faq: [
        {
          q: 'Was ist ein HSA und wer kann eines eröffnen?',
          a: 'Ein Health Savings Account ist ein steuerbegünstigtes Konto für Personen mit einem qualifizierten Krankenversicherungsplan mit hohem Selbstbehalt (HDHP). Es ermöglicht, vorsteuerliches Geld für qualifizierte medizinische Ausgaben zurückzulegen, und nicht genutzte Mittel werden Jahr für Jahr übertragen.',
        },
        {
          q: 'Wie wird die jährliche Steuerersparnis berechnet?',
          a: 'Der Rechner multipliziert Ihren Jahresbeitrag mit Ihrem Grenzsteuersatz. Ein Beitrag von 4.300 $ bei 24 % spart in diesem Jahr etwa 1.032 $, weil der Beitrag Ihr zu versteuerndes Einkommen senkt.',
        },
        {
          q: 'Warum sind die Beitragsgrenzen editierbar?',
          a: 'HSA-Grenzen werden von der IRS festgelegt und ändern sich jährlich, und ab 55 Jahren gilt ein zusätzlicher Betrag. Ihre Editierbarkeit hält das Werkzeug langfristig genau und erlaubt es, Nachholbeiträge oder künftige Grenzerhöhungen zu modellieren.',
        },
        {
          q: 'Ist der projizierte Saldo garantiert?',
          a: 'Nein. Die Projektion nimmt eine konstante Jahresrendite an, aber reale Renditen schwanken von Jahr zu Jahr und sind nicht garantiert. Nutzen Sie das Ergebnis als Planungsschätzung, nicht als Versprechen eines künftigen Werts.',
        },
        {
          q: 'Werden meine Finanzdaten gespeichert?',
          a: 'Nein. Jede Berechnung läuft vollständig in Ihrem Browser. Ihre Eingaben werden niemals an einen Server gesendet, in einer Datenbank gespeichert oder mit anderen geteilt.',
        },
      ],
    },
    pt: {
      title:
        'Calculadora HSA: Projete o Crescimento da sua Conta Poupança Saúde e a Economia Fiscal',
      paragraphs: [
        'Uma Health Savings Account (HSA) é uma das contas mais eficientes em termos fiscais disponíveis nos Estados Unidos. Oferece uma rara tripla vantagem fiscal: as contribuições são dedutíveis, o dinheiro cresce sem impostos e os saques para despesas médicas qualificadas também são isentos. Esta calculadora HSA ajuda a projetar como a sua conta poderia crescer ao longo do tempo e quanto você poderia economizar em impostos a cada ano, com base no tipo de cobertura, contribuição anual, alíquota marginal, retorno esperado e horizonte de tempo.',
        'A projeção usa um modelo simples e transparente. A cada ano o saldo obtém o retorno anual esperado e depois recebe a sua contribuição anual, de modo que o efeito dos juros compostos se acumula ao longo dos anos que você escolher. Como muitas HSAs permitem investir o saldo em fundos após ultrapassar um limite de caixa, tratar a conta como um veículo de investimento de longo prazo em vez de uma conta de gastos pode aumentar muito o seu valor na aposentadoria.',
        'A sua economia fiscal anual é estimada multiplicando a sua contribuição pela sua alíquota marginal. Por exemplo, contribuir 4.300 $ com uma alíquota de 24% economiza cerca de 1.032 $ no primeiro ano. Ao longo de muitos anos essas economias se somam, e a calculadora mostra tanto o valor anual quanto o total acumulado ao lado do saldo projetado, das contribuições totais e do crescimento do investimento.',
        'Os limites de contribuição padrão aqui exibidos são os valores anuais do IRS dos EUA — 4.300 $ para cobertura individual e 8.550 $ para cobertura familiar — e são totalmente editáveis porque esses limites são atualizados a cada ano e variam conforme a situação (a partir dos 55 anos aplica-se uma contribuição adicional de recuperação). Verifique sempre os limites vigentes com o IRS ou o administrador do seu plano antes de confiar em qualquer projeção. Para planejar o resto das suas finanças, explore a nossa <a href="/${lang}/tools/401k-calculator">calculadora 401(k)</a>, a <a href="/${lang}/tools/retirement-calculator">calculadora de aposentadoria</a> e a <a href="/${lang}/tools/tax-bracket-calculator">calculadora de faixas de imposto</a>.',
      ],
      faq: [
        {
          q: 'O que é uma HSA e quem pode abrir uma?',
          a: 'Uma Health Savings Account é uma conta com vantagens fiscais disponível para quem está inscrito em um plano de saúde com franquia alta (HDHP) qualificado. Permite reservar dinheiro antes dos impostos para despesas médicas qualificadas, e os fundos não usados são transferidos ano após ano.',
        },
        {
          q: 'Como a economia fiscal anual é calculada?',
          a: 'A calculadora multiplica a sua contribuição anual pela sua alíquota marginal. Contribuir 4.300 $ com uma alíquota de 24% economiza cerca de 1.032 $ naquele ano, porque a contribuição reduz a sua renda tributável.',
        },
        {
          q: 'Por que os limites de contribuição são editáveis?',
          a: 'Os limites da HSA são definidos pelo IRS e mudam a cada ano, e a partir dos 55 anos aplica-se um valor adicional. Torná-los editáveis mantém a ferramenta precisa ao longo do tempo e permite modelar contribuições de recuperação ou futuros aumentos de limite.',
        },
        {
          q: 'O saldo projetado é garantido?',
          a: 'Não. A projeção assume um retorno anual constante, mas os retornos reais variam de ano para ano e não são garantidos. Use o resultado como uma estimativa de planejamento, não como uma promessa de valor futuro.',
        },
        {
          q: 'Meus dados financeiros são armazenados?',
          a: 'Não. Todos os cálculos são executados inteiramente no seu navegador. Os seus dados nunca são enviados a um servidor, armazenados em um banco de dados ou compartilhados com ninguém.',
        },
      ],
    },
  };

  const seo = seoContent[lang] || seoContent.en;

  return (
    <ToolPageWrapper toolSlug="hsa-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Coverage type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.coverageType[lang]}
            </label>
            <div className="flex gap-3">
              {(['self', 'family'] as Coverage[]).map((c) => (
                <label
                  key={c}
                  className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors ${coverage === c ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <input
                    type="radio"
                    name="coverage"
                    value={c}
                    checked={coverage === c}
                    onChange={() => handleCoverage(c)}
                    className="sr-only"
                  />
                  {c === 'self' ? labels.selfOnly[lang] : labels.family[lang]}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.contributionLimit[lang]}
              </label>
              <input
                type="number"
                min={0}
                step={50}
                value={limitStr}
                onChange={(e) => setLimitStr(e.target.value)}
                className={inputClass(errors.limit !== null)}
              />
              {errors.limit && <p className="text-sm text-red-600 mt-1">{errText(errors.limit)}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.annualContribution[lang]}
              </label>
              <input
                type="number"
                min={0}
                step={50}
                value={contributionStr}
                onChange={(e) => setContributionStr(e.target.value)}
                className={inputClass(errors.contribution !== null)}
              />
              {errors.contribution && (
                <p className="text-sm text-red-600 mt-1">{errText(errors.contribution)}</p>
              )}
            </div>
          </div>

          {overLimit && <p className="text-sm text-amber-600">{labels.limitWarning[lang]}</p>}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.marginalTaxRate[lang]}
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={taxRateStr}
                onChange={(e) => setTaxRateStr(e.target.value)}
                className={inputClass(errors.taxRate !== null)}
              />
              {errors.taxRate && (
                <p className="text-sm text-red-600 mt-1">{errText(errors.taxRate)}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.yearsToGrow[lang]}
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={yearsStr}
                onChange={(e) => setYearsStr(e.target.value)}
                className={inputClass(errors.years !== null)}
              />
              {errors.years && <p className="text-sm text-red-600 mt-1">{errText(errors.years)}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.expectedReturn[lang]}
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={returnStr}
                onChange={(e) => setReturnStr(e.target.value)}
                className={inputClass(errors.ret !== null)}
              />
              {errors.ret && <p className="text-sm text-red-600 mt-1">{errText(errors.ret)}</p>}
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{labels.results[lang]}</h3>

              <div className="grid grid-cols-1 gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="text-sm text-white/80">{labels.projectedBalance[lang]}</div>
                  <div className="text-2xl font-bold">{fmt(result.balance)}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-xs text-green-600 font-medium">
                      {labels.annualTaxSavings[lang]}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {fmt(result.annualTaxSavings)}
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-xs text-purple-600 font-medium">
                      {labels.totalTaxSavings[lang]}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {fmt(result.totalTaxSavings)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">{labels.totalContributions[lang]}</div>
                    <div className="text-sm font-bold text-gray-900">
                      {fmt(result.totalContributions)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">{labels.totalGrowth[lang]}</div>
                    <div className="text-sm font-bold text-green-600">
                      {fmt(result.totalGrowth)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCopy}
              disabled={!result}
              className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 font-medium transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? labels.copied[lang] : labels.copyResult[lang]}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 border border-gray-300 text-gray-700 rounded-lg px-4 py-2 font-medium transition-colors hover:bg-gray-50"
            >
              {labels.reset[lang]}
            </button>
          </div>
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
