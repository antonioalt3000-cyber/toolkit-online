'use client';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type FieldErrorKey = 'errorRequired' | 'errorNumber' | 'errorNegative' | 'errorPositive' | null;

type FireCalc = {
  fireNumber: number;
  years: number;
  reached: boolean;
  monthlyPassiveIncome: number;
};

const DEFAULTS = {
  annualExpenses: '40000',
  withdrawalRate: '4',
  currentInvested: '50000',
  annualSavings: '20000',
  annualReturn: '7',
};

function validateField(raw: string, mode: 'nonneg' | 'pos'): FieldErrorKey {
  if (raw.trim() === '') return 'errorRequired';
  const value = Number(raw);
  if (!Number.isFinite(value)) return 'errorNumber';
  if (value < 0) return 'errorNegative';
  if (mode === 'pos' && value <= 0) return 'errorPositive';
  return null;
}

export default function FireNumberCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['fire-number-calculator'][lang];

  const [annualExpenses, setAnnualExpenses] = useState(DEFAULTS.annualExpenses);
  const [withdrawalRate, setWithdrawalRate] = useState(DEFAULTS.withdrawalRate);
  const [currentInvested, setCurrentInvested] = useState(DEFAULTS.currentInvested);
  const [annualSavings, setAnnualSavings] = useState(DEFAULTS.annualSavings);
  const [annualReturn, setAnnualReturn] = useState(DEFAULTS.annualReturn);
  const [copied, setCopied] = useState(false);

  const labels = {
    annualExpenses: {
      en: 'Annual expenses',
      it: 'Spese annuali',
      es: 'Gastos anuales',
      fr: 'Dépenses annuelles',
      de: 'Jährliche Ausgaben',
      pt: 'Despesas anuais',
    },
    withdrawalRate: {
      en: 'Safe withdrawal rate (%)',
      it: 'Tasso di prelievo sicuro (%)',
      es: 'Tasa de retiro segura (%)',
      fr: 'Taux de retrait sûr (%)',
      de: 'Sichere Entnahmerate (%)',
      pt: 'Taxa de retirada segura (%)',
    },
    currentInvested: {
      en: 'Current invested amount',
      it: 'Importo già investito',
      es: 'Cantidad ya invertida',
      fr: 'Montant déjà investi',
      de: 'Bereits investierter Betrag',
      pt: 'Valor já investido',
    },
    annualSavings: {
      en: 'Annual savings',
      it: 'Risparmio annuale',
      es: 'Ahorro anual',
      fr: 'Épargne annuelle',
      de: 'Jährliche Ersparnisse',
      pt: 'Poupança anual',
    },
    annualReturn: {
      en: 'Expected annual return (%)',
      it: 'Rendimento annuale atteso (%)',
      es: 'Retorno anual esperado (%)',
      fr: 'Rendement annuel attendu (%)',
      de: 'Erwartete jährl. Rendite (%)',
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
    fireNumber: {
      en: 'Your FIRE number',
      it: 'Il tuo numero FIRE',
      es: 'Tu número FIRE',
      fr: 'Votre nombre FIRE',
      de: 'Ihre FIRE-Zahl',
      pt: 'Seu número FIRE',
    },
    yearsToFire: {
      en: 'Years to reach FIRE',
      it: 'Anni per raggiungere FIRE',
      es: 'Años para alcanzar FIRE',
      fr: 'Années pour atteindre FIRE',
      de: 'Jahre bis zur FIRE',
      pt: 'Anos para alcançar FIRE',
    },
    monthlyPassiveIncome: {
      en: 'Monthly passive income',
      it: 'Reddito passivo mensile',
      es: 'Ingreso pasivo mensual',
      fr: 'Revenu passif mensuel',
      de: 'Monatliches passives Einkommen',
      pt: 'Renda passiva mensal',
    },
    alreadyFire: {
      en: 'You have already reached FIRE!',
      it: 'Hai già raggiunto FIRE!',
      es: '¡Ya has alcanzado FIRE!',
      fr: 'Vous avez déjà atteint FIRE !',
      de: 'Sie haben FIRE bereits erreicht!',
      pt: 'Você já alcançou FIRE!',
    },
    moreThan100: {
      en: 'More than 100 years',
      it: 'Più di 100 anni',
      es: 'Más de 100 años',
      fr: 'Plus de 100 ans',
      de: 'Mehr als 100 Jahre',
      pt: 'Mais de 100 anos',
    },
    yearsUnit: { en: 'years', it: 'anni', es: 'años', fr: 'ans', de: 'Jahre', pt: 'anos' },
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
      fr: 'Copié !',
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
    errorRequired: {
      en: 'This field is required',
      it: 'Questo campo è obbligatorio',
      es: 'Este campo es obligatorio',
      fr: 'Ce champ est obligatoire',
      de: 'Dieses Feld ist erforderlich',
      pt: 'Este campo é obrigatório',
    },
    errorNumber: {
      en: 'Please enter a valid number',
      it: 'Inserisci un numero valido',
      es: 'Introduce un número válido',
      fr: 'Veuillez saisir un nombre valide',
      de: 'Bitte geben Sie eine gültige Zahl ein',
      pt: 'Insira um número válido',
    },
    errorNegative: {
      en: 'Value cannot be negative',
      it: 'Il valore non può essere negativo',
      es: 'El valor no puede ser negativo',
      fr: 'La valeur ne peut pas être négative',
      de: 'Der Wert darf nicht negativ sein',
      pt: 'O valor não pode ser negativo',
    },
    errorPositive: {
      en: 'Value must be greater than zero',
      it: 'Il valore deve essere maggiore di zero',
      es: 'El valor debe ser mayor que cero',
      fr: 'La valeur doit être supérieure à zéro',
      de: 'Der Wert muss größer als null sein',
      pt: 'O valor deve ser maior que zero',
    },
  } as Record<string, Record<Locale, string>>;

  const errExpenses = validateField(annualExpenses, 'nonneg');
  const errRate = validateField(withdrawalRate, 'pos');
  const errInvested = validateField(currentInvested, 'nonneg');
  const errSavings = validateField(annualSavings, 'nonneg');
  const errReturn = validateField(annualReturn, 'nonneg');
  const isValid = !errExpenses && !errRate && !errInvested && !errSavings && !errReturn;

  const calc = useMemo<FireCalc | null>(() => {
    if (!isValid) return null;
    const expenses = Number(annualExpenses);
    const rate = Number(withdrawalRate);
    const invested = Number(currentInvested);
    const savings = Number(annualSavings);
    const growthRate = Number(annualReturn) / 100;

    const fireNumber = expenses / (rate / 100);
    let balance = invested;
    let years = 0;
    let reached = balance >= fireNumber;

    if (!reached) {
      for (let year = 1; year <= 100; year++) {
        balance = balance * (1 + growthRate) + savings;
        if (balance >= fireNumber) {
          years = year;
          reached = true;
          break;
        }
      }
      if (!reached) years = 100;
    }

    const monthlyPassiveIncome = (fireNumber * (rate / 100)) / 12;
    return { fireNumber, years, reached, monthlyPassiveIncome };
  }, [annualExpenses, withdrawalRate, currentInvested, annualSavings, annualReturn, isValid]);

  const fmt = (n: number): string => {
    const locale =
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
                : 'it-IT';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  };

  const yearsText = (c: FireCalc): string => {
    if (!c.reached) return labels.moreThan100[lang];
    if (c.years === 0) return labels.alreadyFire[lang];
    return `${c.years} ${labels.yearsUnit[lang]}`;
  };

  const handleCopy = (): void => {
    if (!calc) return;
    const text = [
      `${labels.fireNumber[lang]}: ${fmt(calc.fireNumber)}`,
      `${labels.yearsToFire[lang]}: ${yearsText(calc)}`,
      `${labels.monthlyPassiveIncome[lang]}: ${fmt(calc.monthlyPassiveIncome)}`,
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = (): void => {
    setAnnualExpenses(DEFAULTS.annualExpenses);
    setWithdrawalRate(DEFAULTS.withdrawalRate);
    setCurrentInvested(DEFAULTS.currentInvested);
    setAnnualSavings(DEFAULTS.annualSavings);
    setAnnualReturn(DEFAULTS.annualReturn);
    setCopied(false);
  };

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500';

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'FIRE Number Calculator: Find Your Path to Financial Independence',
      paragraphs: [
        'Your FIRE number is the amount of money you need invested to live off your portfolio indefinitely. FIRE stands for Financial Independence, Retire Early — a movement built on a simple premise: once your investments are large enough, the returns they generate can cover your living expenses for the rest of your life. This FIRE number calculator uses your annual expenses and a safe withdrawal rate to reveal exactly how much you need, then estimates how many years of consistent saving and investing it will take to get there.',
        'The math behind your FIRE number is straightforward. Divide your expected annual expenses by your safe withdrawal rate. Using the popular 4% rule, that is the same as multiplying your annual spending by 25. If you spend $40,000 per year, your FIRE number is $1,000,000. Choosing a lower withdrawal rate, such as 3.5%, produces a larger target but a greater margin of safety against market downturns and long retirements.',
        'Reaching your FIRE number depends on three levers: how much you already have invested, how much you add each year, and the return your portfolio earns. The calculator projects your balance forward one year at a time, applying your expected annual return and then adding your yearly savings, until the balance meets or exceeds your target. Raising your savings rate is usually the fastest way to shorten the timeline, because it both grows your investments and lowers the expenses you ultimately need to cover.',
        'FIRE is a planning framework, not a guarantee — real returns vary and inflation erodes purchasing power over time. Treat the result as a target to steer toward and revisit it as your income and spending evolve. To dig deeper, pair this tool with our <a href="/${lang}/tools/compound-interest-calculator">compound interest calculator</a> to see how growth accelerates, our <a href="/${lang}/tools/investment-calculator">investment calculator</a> to model contributions, and our <a href="/${lang}/tools/retirement-calculator">retirement calculator</a> for a traditional retirement view.',
      ],
      faq: [
        {
          q: 'What is a FIRE number?',
          a: 'Your FIRE number is the total amount you need invested so that a safe annual withdrawal covers your living expenses without depleting your capital. It is calculated as your annual expenses divided by your withdrawal rate.',
        },
        {
          q: 'What is the 4% rule?',
          a: 'The 4% rule suggests you can withdraw 4% of your portfolio in the first year of retirement, adjusting for inflation afterward, with a high chance your money lasts 30 or more years. A 4% rate is mathematically the same as multiplying your annual expenses by 25.',
        },
        {
          q: 'How can I reach FIRE faster?',
          a: 'Save a larger share of your income, cut recurring expenses (which also lowers your FIRE number), and invest consistently in low-cost diversified funds. A higher savings rate is the single biggest accelerator.',
        },
        {
          q: 'Should I use a 4% or a lower withdrawal rate?',
          a: 'A 4% rate is a common baseline, but people aiming for a very early or very long retirement often prefer 3% to 3.5% for extra safety. A lower rate raises your FIRE number but reduces the risk of running out of money.',
        },
        {
          q: 'Is my financial data private?',
          a: 'Yes. Every calculation runs entirely in your browser. Your financial figures are never uploaded to a server, stored in a database, or shared with anyone.',
        },
      ],
    },
    it: {
      title: "Calcolatore Numero FIRE: Trova la Tua Strada verso l'Indipendenza Finanziaria",
      paragraphs: [
        'Il tuo numero FIRE è la somma di denaro che devi avere investita per vivere del tuo portafoglio a tempo indeterminato. FIRE significa Indipendenza Finanziaria, Pensione Anticipata — un movimento basato su una premessa semplice: quando i tuoi investimenti sono abbastanza grandi, i rendimenti che generano possono coprire le tue spese di vita per il resto dei tuoi giorni. Questo calcolatore FIRE usa le tue spese annuali e un tasso di prelievo sicuro per rivelare esattamente quanto ti serve, poi stima quanti anni di risparmio e investimento costante saranno necessari per arrivarci.',
        "La matematica dietro il numero FIRE è semplice. Dividi le spese annuali attese per il tuo tasso di prelievo sicuro. Con la popolare regola del 4%, equivale a moltiplicare la spesa annuale per 25. Se spendi 40.000 all'anno, il tuo numero FIRE è 1.000.000. Scegliere un tasso di prelievo più basso, come il 3,5%, produce un obiettivo più grande ma un margine di sicurezza maggiore contro le fasi negative del mercato e le pensioni lunghe.",
        "Raggiungere il numero FIRE dipende da tre leve: quanto hai già investito, quanto aggiungi ogni anno e il rendimento che il portafoglio ottiene. Il calcolatore proietta il saldo un anno alla volta, applicando il rendimento annuale atteso e poi aggiungendo il risparmio annuale, finché il saldo non raggiunge o supera l'obiettivo. Aumentare il tasso di risparmio è di solito il modo più rapido per accorciare i tempi, perché fa crescere gli investimenti e riduce le spese che devi coprire.",
        'FIRE è un quadro di pianificazione, non una garanzia: i rendimenti reali variano e l\'inflazione erode il potere d\'acquisto nel tempo. Considera il risultato come un obiettivo verso cui puntare e rivedilo man mano che reddito e spese cambiano. Per approfondire, abbina questo strumento al nostro <a href="/${lang}/tools/compound-interest-calculator">calcolatore interesse composto</a> per vedere come accelera la crescita, al nostro <a href="/${lang}/tools/investment-calculator">calcolatore investimenti</a> per modellare i versamenti e al nostro <a href="/${lang}/tools/retirement-calculator">calcolatore pensione</a> per una visione tradizionale.',
      ],
      faq: [
        {
          q: "Cos'è il numero FIRE?",
          a: "Il tuo numero FIRE è l'importo totale che devi avere investito affinché un prelievo annuale sicuro copra le tue spese di vita senza esaurire il capitale. Si calcola dividendo le spese annuali per il tasso di prelievo.",
        },
        {
          q: "Cos'è la regola del 4%?",
          a: "La regola del 4% suggerisce di prelevare il 4% del portafoglio nel primo anno di pensione, adeguando poi per l'inflazione, con un'alta probabilità che il denaro duri 30 anni o più. Un tasso del 4% equivale matematicamente a moltiplicare le spese annuali per 25.",
        },
        {
          q: 'Come posso raggiungere FIRE più velocemente?',
          a: 'Risparmia una quota maggiore del reddito, taglia le spese ricorrenti (che riducono anche il tuo numero FIRE) e investi con costanza in fondi diversificati a basso costo. Un tasso di risparmio più alto è il singolo acceleratore più potente.',
        },
        {
          q: 'Meglio un tasso di prelievo del 4% o più basso?',
          a: 'Il 4% è una base comune, ma chi punta a una pensione molto anticipata o molto lunga preferisce spesso il 3-3,5% per maggiore sicurezza. Un tasso più basso alza il numero FIRE ma riduce il rischio di esaurire il denaro.',
        },
        {
          q: 'I miei dati finanziari sono privati?',
          a: 'Sì. Ogni calcolo avviene interamente nel tuo browser. I tuoi dati finanziari non vengono mai caricati su un server, salvati in un database o condivisi con nessuno.',
        },
      ],
    },
    es: {
      title: 'Calculadora Número FIRE: Encuentra Tu Camino a la Independencia Financiera',
      paragraphs: [
        'Tu número FIRE es la cantidad de dinero que necesitas invertida para vivir de tu cartera de forma indefinida. FIRE significa Independencia Financiera, Jubilación Anticipada — un movimiento basado en una premisa sencilla: cuando tus inversiones son lo bastante grandes, los rendimientos que generan pueden cubrir tus gastos de vida para el resto de tu vida. Esta calculadora FIRE usa tus gastos anuales y una tasa de retiro segura para revelar exactamente cuánto necesitas, y luego estima cuántos años de ahorro e inversión constantes harán falta para lograrlo.',
        'La matemática detrás de tu número FIRE es sencilla. Divide tus gastos anuales esperados entre tu tasa de retiro segura. Con la popular regla del 4%, equivale a multiplicar tu gasto anual por 25. Si gastas $40.000 al año, tu número FIRE es $1.000.000. Elegir una tasa de retiro más baja, como el 3,5%, produce un objetivo mayor pero un margen de seguridad más amplio frente a las caídas del mercado y las jubilaciones largas.',
        'Alcanzar tu número FIRE depende de tres palancas: cuánto tienes ya invertido, cuánto añades cada año y el rendimiento que obtiene tu cartera. La calculadora proyecta tu saldo año a año, aplicando el rendimiento anual esperado y luego sumando tu ahorro anual, hasta que el saldo alcanza o supera tu objetivo. Aumentar tu tasa de ahorro suele ser la forma más rápida de acortar el plazo, porque hace crecer tus inversiones y reduce los gastos que debes cubrir.',
        'FIRE es un marco de planificación, no una garantía: los rendimientos reales varían y la inflación erosiona el poder adquisitivo con el tiempo. Trata el resultado como una meta hacia la que dirigirte y revísalo a medida que cambian tus ingresos y gastos. Para profundizar, combina esta herramienta con nuestra <a href="/${lang}/tools/compound-interest-calculator">calculadora de interés compuesto</a> para ver cómo se acelera el crecimiento, nuestra <a href="/${lang}/tools/investment-calculator">calculadora de inversión</a> para modelar aportaciones y nuestra <a href="/${lang}/tools/retirement-calculator">calculadora de jubilación</a> para una visión tradicional.',
      ],
      faq: [
        {
          q: '¿Qué es un número FIRE?',
          a: 'Tu número FIRE es la cantidad total que necesitas invertida para que un retiro anual seguro cubra tus gastos de vida sin agotar tu capital. Se calcula dividiendo tus gastos anuales entre tu tasa de retiro.',
        },
        {
          q: '¿Qué es la regla del 4%?',
          a: 'La regla del 4% sugiere retirar el 4% de tu cartera en el primer año de jubilación, ajustando por inflación después, con alta probabilidad de que el dinero dure 30 años o más. Una tasa del 4% equivale matemáticamente a multiplicar tus gastos anuales por 25.',
        },
        {
          q: '¿Cómo puedo alcanzar FIRE más rápido?',
          a: 'Ahorra una parte mayor de tus ingresos, recorta gastos recurrentes (lo que también reduce tu número FIRE) e invierte de forma constante en fondos diversificados de bajo coste. Una tasa de ahorro más alta es el mayor acelerador.',
        },
        {
          q: '¿Debo usar una tasa de retiro del 4% o más baja?',
          a: 'El 4% es una base común, pero quienes buscan una jubilación muy temprana o muy larga suelen preferir del 3% al 3,5% por seguridad extra. Una tasa más baja eleva tu número FIRE pero reduce el riesgo de quedarte sin dinero.',
        },
        {
          q: '¿Son privados mis datos financieros?',
          a: 'Sí. Cada cálculo se realiza completamente en tu navegador. Tus datos financieros nunca se envían a un servidor, se guardan en una base de datos ni se comparten con nadie.',
        },
      ],
    },
    fr: {
      title: "Calculateur Nombre FIRE : Trouvez Votre Voie vers l'Indépendance Financière",
      paragraphs: [
        "Votre nombre FIRE est la somme que vous devez avoir investie pour vivre de votre portefeuille indéfiniment. FIRE signifie Indépendance Financière, Retraite Anticipée — un mouvement fondé sur une prémisse simple : lorsque vos placements sont assez importants, les rendements qu'ils génèrent peuvent couvrir vos dépenses pour le reste de votre vie. Ce calculateur FIRE utilise vos dépenses annuelles et un taux de retrait sûr pour révéler exactement le montant nécessaire, puis estime combien d'années d'épargne et d'investissement réguliers seront nécessaires pour y parvenir.",
        'Le calcul de votre nombre FIRE est simple. Divisez vos dépenses annuelles prévues par votre taux de retrait sûr. Avec la célèbre règle des 4%, cela revient à multiplier vos dépenses annuelles par 25. Si vous dépensez 40 000 par an, votre nombre FIRE est de 1 000 000. Choisir un taux de retrait plus bas, comme 3,5%, produit un objectif plus élevé mais une plus grande marge de sécurité face aux baisses de marché et aux retraites longues.',
        "Atteindre votre nombre FIRE dépend de trois leviers : ce que vous avez déjà investi, ce que vous ajoutez chaque année et le rendement de votre portefeuille. Le calculateur projette votre solde année après année, en appliquant le rendement annuel attendu puis en ajoutant votre épargne annuelle, jusqu'à ce que le solde atteigne ou dépasse votre objectif. Augmenter votre taux d'épargne est en général le moyen le plus rapide de raccourcir le délai, car cela fait croître vos placements et réduit les dépenses à couvrir.",
        'FIRE est un cadre de planification, pas une garantie : les rendements réels varient et l\'inflation érode le pouvoir d\'achat avec le temps. Considérez le résultat comme un objectif à viser et révisez-le à mesure que vos revenus et dépenses évoluent. Pour aller plus loin, associez cet outil à notre <a href="/${lang}/tools/compound-interest-calculator">calculateur d\'intérêts composés</a> pour voir comment la croissance s\'accélère, à notre <a href="/${lang}/tools/investment-calculator">calculateur d\'investissement</a> pour modéliser les versements et à notre <a href="/${lang}/tools/retirement-calculator">calculateur de retraite</a> pour une vision traditionnelle.',
      ],
      faq: [
        {
          q: "Qu'est-ce qu'un nombre FIRE ?",
          a: "Votre nombre FIRE est le montant total que vous devez avoir investi pour qu'un retrait annuel sûr couvre vos dépenses sans épuiser votre capital. Il se calcule en divisant vos dépenses annuelles par votre taux de retrait.",
        },
        {
          q: "Qu'est-ce que la règle des 4% ?",
          a: "La règle des 4% suggère de retirer 4% de votre portefeuille la première année de retraite, en ajustant ensuite pour l'inflation, avec une forte probabilité que l'argent dure 30 ans ou plus. Un taux de 4% équivaut mathématiquement à multiplier vos dépenses annuelles par 25.",
        },
        {
          q: 'Comment atteindre FIRE plus vite ?',
          a: "Épargnez une part plus importante de vos revenus, réduisez vos dépenses récurrentes (ce qui abaisse aussi votre nombre FIRE) et investissez régulièrement dans des fonds diversifiés à faibles frais. Un taux d'épargne plus élevé est le principal accélérateur.",
        },
        {
          q: 'Faut-il un taux de retrait de 4% ou plus bas ?',
          a: "Le taux de 4% est une base courante, mais ceux qui visent une retraite très précoce ou très longue préfèrent souvent 3% à 3,5% pour plus de sécurité. Un taux plus bas augmente votre nombre FIRE mais réduit le risque de manquer d'argent.",
        },
        {
          q: 'Mes données financières sont-elles privées ?',
          a: "Oui. Chaque calcul s'effectue entièrement dans votre navigateur. Vos données financières ne sont jamais envoyées à un serveur, stockées dans une base de données ni partagées avec qui que ce soit.",
        },
      ],
    },
    de: {
      title: 'FIRE-Zahl-Rechner: Finden Sie Ihren Weg zur Finanziellen Unabhängigkeit',
      paragraphs: [
        'Ihre FIRE-Zahl ist der Geldbetrag, den Sie investiert haben müssen, um unbegrenzt von Ihrem Portfolio zu leben. FIRE steht für Financial Independence, Retire Early — finanzielle Unabhängigkeit und frühe Rente. Die Bewegung beruht auf einer einfachen Idee: Sind Ihre Anlagen groß genug, können die erzielten Renditen Ihre Lebenshaltungskosten für den Rest Ihres Lebens decken. Dieser FIRE-Rechner nutzt Ihre jährlichen Ausgaben und eine sichere Entnahmerate, um genau zu zeigen, wie viel Sie benötigen, und schätzt dann, wie viele Jahre konsequenten Sparens und Investierens dafür nötig sind.',
        'Die Mathematik hinter Ihrer FIRE-Zahl ist unkompliziert. Teilen Sie Ihre erwarteten Jahresausgaben durch Ihre sichere Entnahmerate. Nach der bekannten 4%-Regel entspricht das der Multiplikation Ihrer Jahresausgaben mit 25. Geben Sie 40.000 pro Jahr aus, beträgt Ihre FIRE-Zahl 1.000.000. Eine niedrigere Entnahmerate wie 3,5% ergibt ein höheres Ziel, aber einen größeren Sicherheitspuffer gegen Markteinbrüche und lange Ruhestände.',
        'Das Erreichen Ihrer FIRE-Zahl hängt von drei Hebeln ab: wie viel Sie bereits investiert haben, wie viel Sie jährlich hinzufügen und welche Rendite Ihr Portfolio erzielt. Der Rechner projiziert Ihren Kontostand Jahr für Jahr, wendet die erwartete Jahresrendite an und addiert dann Ihre jährlichen Ersparnisse, bis der Stand Ihr Ziel erreicht oder übertrifft. Eine höhere Sparquote ist meist der schnellste Weg, die Dauer zu verkürzen, weil sie Ihre Anlagen wachsen lässt und die zu deckenden Ausgaben senkt.',
        'FIRE ist ein Planungsrahmen, keine Garantie: Reale Renditen schwanken und Inflation zehrt die Kaufkraft mit der Zeit auf. Betrachten Sie das Ergebnis als Ziel, auf das Sie hinsteuern, und überprüfen Sie es, wenn sich Einkommen und Ausgaben ändern. Für mehr Tiefe kombinieren Sie dieses Tool mit unserem <a href="/${lang}/tools/compound-interest-calculator">Zinseszinsrechner</a>, um zu sehen, wie sich das Wachstum beschleunigt, unserem <a href="/${lang}/tools/investment-calculator">Anlagerechner</a> zur Modellierung der Einzahlungen und unserem <a href="/${lang}/tools/retirement-calculator">Rentenrechner</a> für eine klassische Ruhestandssicht.',
      ],
      faq: [
        {
          q: 'Was ist eine FIRE-Zahl?',
          a: 'Ihre FIRE-Zahl ist der Gesamtbetrag, den Sie investiert haben müssen, damit eine sichere jährliche Entnahme Ihre Lebenshaltungskosten deckt, ohne Ihr Kapital aufzuzehren. Sie wird berechnet, indem Sie Ihre Jahresausgaben durch Ihre Entnahmerate teilen.',
        },
        {
          q: 'Was ist die 4%-Regel?',
          a: 'Die 4%-Regel besagt, dass Sie im ersten Rentenjahr 4% Ihres Portfolios entnehmen und danach an die Inflation anpassen können, mit hoher Wahrscheinlichkeit, dass das Geld 30 Jahre oder länger reicht. Eine Rate von 4% entspricht mathematisch der Multiplikation Ihrer Jahresausgaben mit 25.',
        },
        {
          q: 'Wie erreiche ich FIRE schneller?',
          a: 'Sparen Sie einen größeren Anteil Ihres Einkommens, senken Sie wiederkehrende Ausgaben (was auch Ihre FIRE-Zahl verringert) und investieren Sie konsequent in kostengünstige, diversifizierte Fonds. Eine höhere Sparquote ist der stärkste Beschleuniger.',
        },
        {
          q: 'Sollte ich 4% oder eine niedrigere Entnahmerate wählen?',
          a: 'Eine Rate von 4% ist ein gängiger Ausgangswert, doch wer einen sehr frühen oder sehr langen Ruhestand anstrebt, bevorzugt oft 3% bis 3,5% für mehr Sicherheit. Eine niedrigere Rate erhöht Ihre FIRE-Zahl, senkt aber das Risiko, dass das Geld ausgeht.',
        },
        {
          q: 'Sind meine Finanzdaten privat?',
          a: 'Ja. Jede Berechnung läuft vollständig in Ihrem Browser. Ihre Finanzdaten werden niemals an einen Server gesendet, in einer Datenbank gespeichert oder mit jemandem geteilt.',
        },
      ],
    },
    pt: {
      title: 'Calculadora Número FIRE: Encontre Seu Caminho para a Independência Financeira',
      paragraphs: [
        'Seu número FIRE é a quantia de dinheiro que você precisa ter investida para viver da sua carteira indefinidamente. FIRE significa Independência Financeira, Aposentadoria Antecipada — um movimento baseado numa premissa simples: quando seus investimentos são grandes o suficiente, os retornos que geram podem cobrir suas despesas de vida pelo resto da sua vida. Esta calculadora FIRE usa suas despesas anuais e uma taxa de retirada segura para revelar exatamente quanto você precisa, e então estima quantos anos de poupança e investimento constantes serão necessários para chegar lá.',
        'A matemática por trás do seu número FIRE é simples. Divida suas despesas anuais esperadas pela sua taxa de retirada segura. Com a popular regra dos 4%, isso equivale a multiplicar seus gastos anuais por 25. Se você gasta 40.000 por ano, seu número FIRE é 1.000.000. Escolher uma taxa de retirada mais baixa, como 3,5%, gera um alvo maior, mas uma margem de segurança maior contra quedas de mercado e aposentadorias longas.',
        'Alcançar seu número FIRE depende de três alavancas: quanto você já tem investido, quanto adiciona a cada ano e o retorno que sua carteira obtém. A calculadora projeta seu saldo ano a ano, aplicando o retorno anual esperado e depois somando sua poupança anual, até que o saldo atinja ou ultrapasse seu objetivo. Aumentar sua taxa de poupança costuma ser a forma mais rápida de encurtar o prazo, porque faz seus investimentos crescerem e reduz as despesas que você precisa cobrir.',
        'FIRE é um quadro de planejamento, não uma garantia: os retornos reais variam e a inflação corrói o poder de compra ao longo do tempo. Trate o resultado como uma meta para se orientar e revise-o conforme sua renda e seus gastos mudam. Para aprofundar, combine esta ferramenta com a nossa <a href="/${lang}/tools/compound-interest-calculator">calculadora de juros compostos</a> para ver como o crescimento acelera, a nossa <a href="/${lang}/tools/investment-calculator">calculadora de investimento</a> para modelar aportes e a nossa <a href="/${lang}/tools/retirement-calculator">calculadora de aposentadoria</a> para uma visão tradicional.',
      ],
      faq: [
        {
          q: 'O que é um número FIRE?',
          a: 'Seu número FIRE é o valor total que você precisa ter investido para que uma retirada anual segura cubra suas despesas de vida sem esgotar seu capital. Ele é calculado dividindo suas despesas anuais pela sua taxa de retirada.',
        },
        {
          q: 'O que é a regra dos 4%?',
          a: 'A regra dos 4% sugere retirar 4% da carteira no primeiro ano de aposentadoria, ajustando pela inflação depois, com alta probabilidade de o dinheiro durar 30 anos ou mais. Uma taxa de 4% equivale matematicamente a multiplicar suas despesas anuais por 25.',
        },
        {
          q: 'Como posso alcançar o FIRE mais rápido?',
          a: 'Poupe uma parcela maior da sua renda, corte despesas recorrentes (o que também reduz seu número FIRE) e invista de forma constante em fundos diversificados de baixo custo. Uma taxa de poupança mais alta é o maior acelerador.',
        },
        {
          q: 'Devo usar uma taxa de retirada de 4% ou mais baixa?',
          a: 'A taxa de 4% é uma base comum, mas quem busca uma aposentadoria muito antecipada ou muito longa costuma preferir 3% a 3,5% por segurança extra. Uma taxa mais baixa eleva seu número FIRE, mas reduz o risco de ficar sem dinheiro.',
        },
        {
          q: 'Meus dados financeiros são privados?',
          a: 'Sim. Cada cálculo acontece inteiramente no seu navegador. Seus dados financeiros nunca são enviados a um servidor, armazenados em um banco de dados ou compartilhados com ninguém.',
        },
      ],
    },
  };

  const seo = seoContent[lang] || seoContent.en;

  return (
    <ToolPageWrapper toolSlug="fire-number-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.annualExpenses[lang]} ($)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={annualExpenses}
                onChange={(e) => setAnnualExpenses(e.target.value)}
                className={inputClass}
              />
              {errExpenses && (
                <p className="mt-1 text-sm text-red-600">{labels[errExpenses][lang]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.withdrawalRate[lang]}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={withdrawalRate}
                onChange={(e) => setWithdrawalRate(e.target.value)}
                className={inputClass}
              />
              {errRate && <p className="mt-1 text-sm text-red-600">{labels[errRate][lang]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.currentInvested[lang]} ($)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={currentInvested}
                onChange={(e) => setCurrentInvested(e.target.value)}
                className={inputClass}
              />
              {errInvested && (
                <p className="mt-1 text-sm text-red-600">{labels[errInvested][lang]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.annualSavings[lang]} ($)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={annualSavings}
                onChange={(e) => setAnnualSavings(e.target.value)}
                className={inputClass}
              />
              {errSavings && (
                <p className="mt-1 text-sm text-red-600">{labels[errSavings][lang]}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.annualReturn[lang]}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={annualReturn}
              onChange={(e) => setAnnualReturn(e.target.value)}
              className={inputClass}
            />
            {errReturn && <p className="mt-1 text-sm text-red-600">{labels[errReturn][lang]}</p>}
          </div>

          {/* Results */}
          {calc && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{labels.results[lang]}</h3>

              <div className="grid grid-cols-1 gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="text-sm text-white/80">{labels.fireNumber[lang]}</div>
                  <div className="text-2xl font-bold">{fmt(calc.fireNumber)}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-xs text-green-600 font-medium">
                      {labels.yearsToFire[lang]}
                    </div>
                    <div className="text-lg font-bold text-gray-900">{yearsText(calc)}</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-xs text-purple-600 font-medium">
                      {labels.monthlyPassiveIncome[lang]}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {fmt(calc.monthlyPassiveIncome)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleCopy}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
                >
                  {copied ? labels.copied[lang] : labels.copyResult[lang]}
                </button>
                <button
                  onClick={handleReset}
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg px-4 py-2 transition-colors"
                >
                  {labels.reset[lang]}
                </button>
              </div>
            </div>
          )}

          {!calc && (
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={handleReset}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg px-4 py-2 transition-colors"
              >
                {labels.reset[lang]}
              </button>
            </div>
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
      </div>
    </ToolPageWrapper>
  );
}
