'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type FieldError = 'empty' | 'negative' | 'invalid' | null;
type ParsedInput = { value: number | null; error: FieldError };

export default function NetWorthCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['net-worth-calculator'][lang];

  const defaultAssets = '50000';
  const defaultLiabilities = '20000';
  const [assets, setAssets] = useState(defaultAssets);
  const [liabilities, setLiabilities] = useState(defaultLiabilities);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const labels = {
    totalAssets: {
      en: 'Total assets',
      it: 'Attività totali',
      es: 'Activos totales',
      fr: 'Actifs totaux',
      de: 'Gesamtvermögen',
      pt: 'Ativos totais',
    },
    totalLiabilities: {
      en: 'Total liabilities',
      it: 'Passività totali',
      es: 'Pasivos totales',
      fr: 'Passifs totaux',
      de: 'Gesamtverbindlichkeiten',
      pt: 'Passivos totais',
    },
    assetsHint: {
      en: 'Cash, savings, investments, property, vehicles',
      it: 'Contanti, risparmi, investimenti, immobili, veicoli',
      es: 'Efectivo, ahorros, inversiones, propiedades, vehículos',
      fr: 'Liquidités, épargne, investissements, biens, véhicules',
      de: 'Bargeld, Ersparnisse, Anlagen, Immobilien, Fahrzeuge',
      pt: 'Dinheiro, poupança, investimentos, imóveis, veículos',
    },
    liabilitiesHint: {
      en: 'Mortgage, loans, credit cards, other debts',
      it: 'Mutuo, prestiti, carte di credito, altri debiti',
      es: 'Hipoteca, préstamos, tarjetas de crédito, otras deudas',
      fr: 'Hypothèque, prêts, cartes de crédit, autres dettes',
      de: 'Hypothek, Kredite, Kreditkarten, sonstige Schulden',
      pt: 'Hipoteca, empréstimos, cartões de crédito, outras dívidas',
    },
    results: {
      en: 'Result',
      it: 'Risultato',
      es: 'Resultado',
      fr: 'Résultat',
      de: 'Ergebnis',
      pt: 'Resultado',
    },
    netWorth: {
      en: 'Your net worth',
      it: 'Il tuo patrimonio netto',
      es: 'Tu patrimonio neto',
      fr: 'Votre patrimoine net',
      de: 'Ihr Nettovermögen',
      pt: 'Seu patrimônio líquido',
    },
    breakdownAssets: {
      en: 'Assets',
      it: 'Attività',
      es: 'Activos',
      fr: 'Actifs',
      de: 'Vermögen',
      pt: 'Ativos',
    },
    breakdownLiabilities: {
      en: 'Liabilities',
      it: 'Passività',
      es: 'Pasivos',
      fr: 'Passifs',
      de: 'Verbindlichkeiten',
      pt: 'Passivos',
    },
    interpPositive: {
      en: 'Positive net worth: your assets exceed your liabilities. You are building wealth.',
      it: 'Patrimonio netto positivo: le tue attività superano le passività. Stai costruendo ricchezza.',
      es: 'Patrimonio neto positivo: tus activos superan tus pasivos. Estás construyendo riqueza.',
      fr: 'Patrimoine net positif : vos actifs dépassent vos passifs. Vous construisez votre patrimoine.',
      de: 'Positives Nettovermögen: Ihr Vermögen übersteigt Ihre Verbindlichkeiten. Sie bauen Vermögen auf.',
      pt: 'Patrimônio líquido positivo: seus ativos superam seus passivos. Você está construindo riqueza.',
    },
    interpNegative: {
      en: 'Negative net worth: your liabilities exceed your assets. Focus on reducing debt.',
      it: 'Patrimonio netto negativo: le passività superano le attività. Concentrati sulla riduzione del debito.',
      es: 'Patrimonio neto negativo: tus pasivos superan tus activos. Enfócate en reducir la deuda.',
      fr: 'Patrimoine net négatif : vos passifs dépassent vos actifs. Concentrez-vous sur la réduction de la dette.',
      de: 'Negatives Nettovermögen: Ihre Verbindlichkeiten übersteigen Ihr Vermögen. Konzentrieren Sie sich auf den Schuldenabbau.',
      pt: 'Patrimônio líquido negativo: seus passivos superam seus ativos. Foque em reduzir dívidas.',
    },
    interpZero: {
      en: 'Break-even: your assets exactly match your liabilities.',
      it: 'Pareggio: le tue attività eguagliano esattamente le passività.',
      es: 'Punto de equilibrio: tus activos igualan exactamente tus pasivos.',
      fr: 'Équilibre : vos actifs correspondent exactement à vos passifs.',
      de: 'Ausgeglichen: Ihr Vermögen entspricht genau Ihren Verbindlichkeiten.',
      pt: 'Ponto de equilíbrio: seus ativos igualam exatamente seus passivos.',
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
    errEmpty: {
      en: 'Please enter a value',
      it: 'Inserisci un valore',
      es: 'Introduce un valor',
      fr: 'Veuillez saisir une valeur',
      de: 'Bitte einen Wert eingeben',
      pt: 'Insira um valor',
    },
    errNegative: {
      en: 'Value cannot be negative',
      it: 'Il valore non può essere negativo',
      es: 'El valor no puede ser negativo',
      fr: 'La valeur ne peut pas être négative',
      de: 'Der Wert darf nicht negativ sein',
      pt: 'O valor não pode ser negativo',
    },
    errInvalid: {
      en: 'Please enter a valid number',
      it: 'Inserisci un numero valido',
      es: 'Introduce un número válido',
      fr: 'Veuillez saisir un nombre valide',
      de: 'Bitte eine gültige Zahl eingeben',
      pt: 'Insira um número válido',
    },
  } as Record<string, Record<Locale, string>>;

  const parseInput = (raw: string): ParsedInput => {
    const trimmed = raw.trim();
    if (trimmed === '') return { value: null, error: 'empty' };
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) return { value: null, error: 'invalid' };
    if (parsed < 0) return { value: null, error: 'negative' };
    return { value: parsed, error: null };
  };

  const assetsParsed = parseInput(assets);
  const liabilitiesParsed = parseInput(liabilities);
  const bothValid = assetsParsed.value !== null && liabilitiesParsed.value !== null;
  const netWorth = bothValid
    ? (assetsParsed.value as number) - (liabilitiesParsed.value as number)
    : null;

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
      {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }
    ).format(n);

  const errorMessage = (error: FieldError): string => {
    if (error === 'empty') return labels.errEmpty[lang];
    if (error === 'negative') return labels.errNegative[lang];
    if (error === 'invalid') return labels.errInvalid[lang];
    return '';
  };

  const handleCopy = async (): Promise<void> => {
    if (netWorth === null || assetsParsed.value === null || liabilitiesParsed.value === null)
      return;
    const text = `${labels.netWorth[lang]}: ${fmt(netWorth)}\n${labels.breakdownAssets[lang]}: ${fmt(assetsParsed.value)}\n${labels.breakdownLiabilities[lang]}: ${fmt(liabilitiesParsed.value)}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = (): void => {
    setAssets(defaultAssets);
    setLiabilities(defaultLiabilities);
    setCopied(false);
  };

  const interpretation = (value: number): string => {
    if (value > 0) return labels.interpPositive[lang];
    if (value < 0) return labels.interpNegative[lang];
    return labels.interpZero[lang];
  };

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'Net Worth Calculator: Measure Your True Financial Position',
      paragraphs: [
        'Your net worth is the single clearest measure of your financial health. It is calculated with a simple formula: total assets minus total liabilities. Assets are everything you own that has value, including cash, savings accounts, retirement funds, investments, real estate, and vehicles. Liabilities are everything you owe, such as your mortgage, car loans, student loans, and credit card balances. This calculator does the math instantly so you always know where you stand.',
        'Tracking net worth over time is far more revealing than watching your income or bank balance alone. A rising net worth means you are building wealth, paying down debt, and growing your assets faster than your obligations. A falling or negative net worth is an early warning sign that debt is outpacing what you own. By updating this number every few months, you turn a vague sense of "how am I doing?" into a precise, trackable figure.',
        'A negative net worth is common and not necessarily a crisis, especially early in a career when student loans or a new mortgage dominate the picture. The goal is steady improvement: each debt payment reduces liabilities, and each dollar saved or invested increases assets. Over years, compounding and disciplined saving can flip a negative number firmly into positive territory.',
        'Use this figure alongside our other planning tools to build a complete picture. Project long-term growth with the <a href="/${lang}/tools/compound-interest-calculator">compound interest calculator</a>, plan your golden years with the <a href="/${lang}/tools/retirement-calculator">retirement calculator</a>, and evaluate borrowing costs with the <a href="/${lang}/tools/loan-calculator">loan calculator</a>. Together they help you grow the asset side and shrink the liability side of your balance sheet.',
      ],
      faq: [
        {
          q: 'What counts as an asset?',
          a: 'Assets include cash, checking and savings accounts, retirement and brokerage investments, the market value of real estate, vehicles, and valuable personal property. Use current market values, not the original purchase price.',
        },
        {
          q: 'What counts as a liability?',
          a: 'Liabilities are all your debts: mortgage balance, auto loans, student loans, personal loans, credit card balances, and any money you owe to others. Use the current outstanding balance for each.',
        },
        {
          q: 'Is a negative net worth bad?',
          a: 'Not necessarily. Many people have a negative net worth early on due to student loans or a recent mortgage. What matters is the trend. Consistent debt reduction and saving will move the number in the right direction over time.',
        },
        {
          q: 'How often should I calculate my net worth?',
          a: 'Most people benefit from checking every three to six months. This is frequent enough to spot trends without reacting to short-term market swings. Recalculating after major events like a home purchase is also useful.',
        },
        {
          q: 'Is my financial data stored or shared?',
          a: 'No. All calculations happen entirely in your browser. Your figures are never sent to any server, stored in a database, or shared with third parties.',
        },
      ],
    },
    it: {
      title: 'Calcolatore Patrimonio Netto: Misura la Tua Vera Posizione Finanziaria',
      paragraphs: [
        "Il patrimonio netto è la misura più chiara della tua salute finanziaria. Si calcola con una formula semplice: attività totali meno passività totali. Le attività sono tutto ciò che possiedi e ha valore, inclusi contanti, conti di risparmio, fondi pensione, investimenti, immobili e veicoli. Le passività sono tutto ciò che devi, come mutuo, prestiti auto, prestiti studenteschi e saldi delle carte di credito. Questo calcolatore esegue il calcolo all'istante così sai sempre dove ti trovi.",
        'Monitorare il patrimonio netto nel tempo è molto più rivelatore che osservare solo il reddito o il saldo bancario. Un patrimonio netto in crescita significa che stai costruendo ricchezza, riducendo il debito e aumentando le attività più velocemente degli obblighi. Un patrimonio in calo o negativo è un segnale di allarme precoce che il debito sta superando ciò che possiedi. Aggiornando questo numero ogni pochi mesi, trasformi una vaga sensazione in una cifra precisa e monitorabile.',
        "Un patrimonio netto negativo è comune e non necessariamente una crisi, soprattutto a inizio carriera quando i prestiti studenteschi o un nuovo mutuo dominano il quadro. L'obiettivo è un miglioramento costante: ogni pagamento del debito riduce le passività e ogni euro risparmiato o investito aumenta le attività. Nel corso degli anni, la capitalizzazione e il risparmio disciplinato possono trasformare un numero negativo in territorio positivo.",
        'Usa questa cifra insieme agli altri strumenti di pianificazione per un quadro completo. Proietta la crescita a lungo termine con il <a href="/${lang}/tools/compound-interest-calculator">calcolatore interesse composto</a>, pianifica la pensione con il <a href="/${lang}/tools/retirement-calculator">calcolatore pensione</a> e valuta i costi di finanziamento con il <a href="/${lang}/tools/loan-calculator">calcolatore prestiti</a>. Insieme ti aiutano a far crescere le attività e ridurre le passività.',
      ],
      faq: [
        {
          q: 'Cosa conta come attività?',
          a: 'Le attività includono contanti, conti correnti e di risparmio, investimenti pensionistici e di intermediazione, il valore di mercato di immobili, veicoli e beni personali di valore. Usa i valori di mercato attuali, non il prezzo di acquisto originale.',
        },
        {
          q: 'Cosa conta come passività?',
          a: 'Le passività sono tutti i tuoi debiti: saldo del mutuo, prestiti auto, prestiti studenteschi, prestiti personali, saldi delle carte di credito e qualsiasi somma dovuta ad altri. Usa il saldo residuo attuale per ciascuno.',
        },
        {
          q: 'Un patrimonio netto negativo è negativo?',
          a: "Non necessariamente. Molte persone hanno un patrimonio netto negativo all'inizio a causa di prestiti studenteschi o un mutuo recente. Ciò che conta è la tendenza. Una costante riduzione del debito e il risparmio sposteranno il numero nella direzione giusta.",
        },
        {
          q: 'Quanto spesso dovrei calcolare il patrimonio netto?',
          a: "La maggior parte delle persone trae beneficio da un controllo ogni tre-sei mesi. È abbastanza frequente per individuare tendenze senza reagire alle oscillazioni di mercato a breve termine. Ricalcolare dopo eventi importanti come l'acquisto di una casa è utile.",
        },
        {
          q: 'I miei dati finanziari vengono salvati o condivisi?',
          a: 'No. Tutti i calcoli avvengono interamente nel browser. Le tue cifre non vengono mai inviate a server, salvate in un database o condivise con terze parti.',
        },
      ],
    },
    es: {
      title: 'Calculadora de Patrimonio Neto: Mide Tu Verdadera Posición Financiera',
      paragraphs: [
        'Tu patrimonio neto es la medida más clara de tu salud financiera. Se calcula con una fórmula sencilla: activos totales menos pasivos totales. Los activos son todo lo que posees y tiene valor, incluyendo efectivo, cuentas de ahorro, fondos de jubilación, inversiones, bienes inmuebles y vehículos. Los pasivos son todo lo que debes, como la hipoteca, préstamos de auto, préstamos estudiantiles y saldos de tarjetas de crédito. Esta calculadora hace el cálculo al instante para que siempre sepas dónde estás.',
        'Seguir el patrimonio neto a lo largo del tiempo es mucho más revelador que observar solo los ingresos o el saldo bancario. Un patrimonio neto creciente significa que estás construyendo riqueza, reduciendo deuda y aumentando activos más rápido que tus obligaciones. Un patrimonio decreciente o negativo es una señal de alerta temprana de que la deuda supera lo que posees. Al actualizar este número cada pocos meses, conviertes una sensación vaga en una cifra precisa y rastreable.',
        'Un patrimonio neto negativo es común y no necesariamente una crisis, especialmente al inicio de una carrera cuando los préstamos estudiantiles o una hipoteca nueva dominan el panorama. La meta es una mejora constante: cada pago de deuda reduce los pasivos y cada dólar ahorrado o invertido aumenta los activos. Con los años, la capitalización y el ahorro disciplinado pueden convertir un número negativo en territorio positivo.',
        'Usa esta cifra junto con nuestras otras herramientas de planificación para un panorama completo. Proyecta el crecimiento a largo plazo con la <a href="/${lang}/tools/compound-interest-calculator">calculadora de interés compuesto</a>, planifica tu jubilación con la <a href="/${lang}/tools/retirement-calculator">calculadora de jubilación</a> y evalúa los costos de financiación con la <a href="/${lang}/tools/loan-calculator">calculadora de préstamos</a>. Juntas te ayudan a hacer crecer los activos y reducir los pasivos.',
      ],
      faq: [
        {
          q: '¿Qué cuenta como activo?',
          a: 'Los activos incluyen efectivo, cuentas corrientes y de ahorro, inversiones de jubilación e intermediación, el valor de mercado de bienes inmuebles, vehículos y propiedad personal valiosa. Usa los valores de mercado actuales, no el precio de compra original.',
        },
        {
          q: '¿Qué cuenta como pasivo?',
          a: 'Los pasivos son todas tus deudas: saldo de hipoteca, préstamos de auto, préstamos estudiantiles, préstamos personales, saldos de tarjetas de crédito y cualquier dinero que debas a otros. Usa el saldo pendiente actual de cada uno.',
        },
        {
          q: '¿Es malo un patrimonio neto negativo?',
          a: 'No necesariamente. Muchas personas tienen un patrimonio neto negativo al principio debido a préstamos estudiantiles o una hipoteca reciente. Lo que importa es la tendencia. La reducción constante de deuda y el ahorro moverán el número en la dirección correcta.',
        },
        {
          q: '¿Con qué frecuencia debo calcular mi patrimonio neto?',
          a: 'La mayoría de las personas se benefician de revisarlo cada tres a seis meses. Es lo bastante frecuente para detectar tendencias sin reaccionar a las oscilaciones de mercado a corto plazo. Recalcular tras eventos importantes como comprar una vivienda también es útil.',
        },
        {
          q: '¿Se almacenan o comparten mis datos financieros?',
          a: 'No. Todos los cálculos se realizan completamente en tu navegador. Tus cifras nunca se envían a servidores, se almacenan en una base de datos ni se comparten con terceros.',
        },
      ],
    },
    fr: {
      title: 'Calculateur de Patrimoine Net : Mesurez Votre Vraie Situation Financière',
      paragraphs: [
        "Votre patrimoine net est la mesure la plus claire de votre santé financière. Il se calcule avec une formule simple : actifs totaux moins passifs totaux. Les actifs représentent tout ce que vous possédez et qui a de la valeur, y compris liquidités, comptes d'épargne, fonds de retraite, investissements, biens immobiliers et véhicules. Les passifs représentent tout ce que vous devez, comme votre hypothèque, prêts auto, prêts étudiants et soldes de cartes de crédit. Ce calculateur effectue le calcul instantanément pour que vous sachiez toujours où vous en êtes.",
        "Suivre son patrimoine net dans le temps est bien plus révélateur que d'observer uniquement ses revenus ou son solde bancaire. Un patrimoine net croissant signifie que vous bâtissez votre richesse, réduisez vos dettes et augmentez vos actifs plus vite que vos obligations. Un patrimoine décroissant ou négatif est un signal d'alerte précoce indiquant que la dette dépasse ce que vous possédez. En mettant à jour ce chiffre tous les quelques mois, vous transformez une impression vague en une donnée précise et suivie.",
        "Un patrimoine net négatif est courant et pas nécessairement une crise, surtout en début de carrière lorsque les prêts étudiants ou une nouvelle hypothèque dominent le tableau. L'objectif est une amélioration régulière : chaque remboursement de dette réduit les passifs et chaque euro épargné ou investi augmente les actifs. Au fil des années, la capitalisation et l'épargne disciplinée peuvent faire passer un chiffre négatif en territoire positif.",
        'Utilisez ce chiffre avec nos autres outils de planification pour une vue complète. Projetez la croissance à long terme avec le <a href="/${lang}/tools/compound-interest-calculator">calculateur d\'intérêts composés</a>, planifiez votre retraite avec le <a href="/${lang}/tools/retirement-calculator">calculateur de retraite</a> et évaluez les coûts d\'emprunt avec le <a href="/${lang}/tools/loan-calculator">calculateur de prêt</a>. Ensemble, ils vous aident à accroître vos actifs et à réduire vos passifs.',
      ],
      faq: [
        {
          q: "Qu'est-ce qui compte comme actif ?",
          a: "Les actifs incluent les liquidités, comptes courants et d'épargne, investissements de retraite et de courtage, la valeur de marché des biens immobiliers, véhicules et biens personnels de valeur. Utilisez les valeurs de marché actuelles, pas le prix d'achat initial.",
        },
        {
          q: "Qu'est-ce qui compte comme passif ?",
          a: "Les passifs sont toutes vos dettes : solde d'hypothèque, prêts auto, prêts étudiants, prêts personnels, soldes de cartes de crédit et toute somme due à autrui. Utilisez le solde restant actuel de chacun.",
        },
        {
          q: 'Un patrimoine net négatif est-il mauvais ?',
          a: "Pas nécessairement. Beaucoup de personnes ont un patrimoine net négatif au début à cause des prêts étudiants ou d'une hypothèque récente. Ce qui compte, c'est la tendance. Une réduction constante de la dette et l'épargne feront évoluer le chiffre dans le bon sens.",
        },
        {
          q: 'À quelle fréquence dois-je calculer mon patrimoine net ?',
          a: "La plupart des gens gagnent à le vérifier tous les trois à six mois. C'est assez fréquent pour repérer les tendances sans réagir aux fluctuations de marché à court terme. Recalculer après des événements majeurs comme un achat immobilier est aussi utile.",
        },
        {
          q: 'Mes données financières sont-elles stockées ou partagées ?',
          a: 'Non. Tous les calculs se font entièrement dans votre navigateur. Vos chiffres ne sont jamais envoyés à un serveur, stockés dans une base de données ni partagés avec des tiers.',
        },
      ],
    },
    de: {
      title: 'Nettovermögens-Rechner: Ermitteln Sie Ihre Wahre Finanzielle Lage',
      paragraphs: [
        'Ihr Nettovermögen ist das klarste Maß für Ihre finanzielle Gesundheit. Es wird mit einer einfachen Formel berechnet: Gesamtvermögen minus Gesamtverbindlichkeiten. Vermögenswerte sind alles, was Sie besitzen und Wert hat, darunter Bargeld, Sparkonten, Rentenfonds, Anlagen, Immobilien und Fahrzeuge. Verbindlichkeiten sind alles, was Sie schulden, etwa Ihre Hypothek, Autokredite, Studienkredite und Kreditkartensalden. Dieser Rechner erledigt die Berechnung sofort, sodass Sie stets wissen, wo Sie stehen.',
        'Das Nettovermögen im Zeitverlauf zu verfolgen ist weit aufschlussreicher, als nur auf Einkommen oder Kontostand zu schauen. Ein steigendes Nettovermögen bedeutet, dass Sie Vermögen aufbauen, Schulden abbauen und Vermögenswerte schneller wachsen lassen als Ihre Verpflichtungen. Ein sinkendes oder negatives Nettovermögen ist ein Frühwarnzeichen, dass die Schulden das Besitztum übersteigen. Indem Sie diese Zahl alle paar Monate aktualisieren, wird aus einem vagen Gefühl eine präzise, nachverfolgbare Kennzahl.',
        'Ein negatives Nettovermögen ist verbreitet und nicht zwangsläufig eine Krise, besonders am Karrierebeginn, wenn Studienkredite oder eine neue Hypothek das Bild bestimmen. Das Ziel ist stetige Verbesserung: Jede Schuldentilgung senkt die Verbindlichkeiten und jeder gesparte oder investierte Euro erhöht das Vermögen. Über die Jahre können Zinseszins und diszipliniertes Sparen eine negative Zahl klar ins Positive drehen.',
        'Nutzen Sie diese Kennzahl zusammen mit unseren anderen Planungswerkzeugen für ein vollständiges Bild. Projizieren Sie langfristiges Wachstum mit dem <a href="/${lang}/tools/compound-interest-calculator">Zinseszinsrechner</a>, planen Sie den Ruhestand mit dem <a href="/${lang}/tools/retirement-calculator">Rentenrechner</a> und bewerten Sie Kreditkosten mit dem <a href="/${lang}/tools/loan-calculator">Kreditrechner</a>. Gemeinsam helfen sie, die Vermögensseite zu vergrößern und die Schuldenseite zu verkleinern.',
      ],
      faq: [
        {
          q: 'Was zählt als Vermögenswert?',
          a: 'Vermögenswerte umfassen Bargeld, Giro- und Sparkonten, Renten- und Wertpapieranlagen, den Marktwert von Immobilien, Fahrzeugen und wertvollem persönlichem Eigentum. Verwenden Sie aktuelle Marktwerte, nicht den ursprünglichen Kaufpreis.',
        },
        {
          q: 'Was zählt als Verbindlichkeit?',
          a: 'Verbindlichkeiten sind all Ihre Schulden: Hypothekensaldo, Autokredite, Studienkredite, Privatkredite, Kreditkartensalden und alle Beträge, die Sie anderen schulden. Verwenden Sie den aktuellen Restsaldo für jeden Posten.',
        },
        {
          q: 'Ist ein negatives Nettovermögen schlecht?',
          a: 'Nicht unbedingt. Viele Menschen haben anfangs ein negatives Nettovermögen wegen Studienkrediten oder einer kürzlich aufgenommenen Hypothek. Entscheidend ist der Trend. Ein stetiger Schuldenabbau und Sparen bewegen die Zahl in die richtige Richtung.',
        },
        {
          q: 'Wie oft sollte ich mein Nettovermögen berechnen?',
          a: 'Die meisten profitieren von einer Prüfung alle drei bis sechs Monate. Das ist häufig genug, um Trends zu erkennen, ohne auf kurzfristige Marktschwankungen zu reagieren. Eine Neuberechnung nach großen Ereignissen wie einem Immobilienkauf ist ebenfalls sinnvoll.',
        },
        {
          q: 'Werden meine Finanzdaten gespeichert oder geteilt?',
          a: 'Nein. Alle Berechnungen erfolgen vollständig in Ihrem Browser. Ihre Zahlen werden niemals an einen Server gesendet, in einer Datenbank gespeichert oder mit Dritten geteilt.',
        },
      ],
    },
    pt: {
      title: 'Calculadora de Patrimônio Líquido: Meça Sua Verdadeira Posição Financeira',
      paragraphs: [
        'Seu patrimônio líquido é a medida mais clara da sua saúde financeira. Ele é calculado com uma fórmula simples: ativos totais menos passivos totais. Ativos são tudo o que você possui e tem valor, incluindo dinheiro, contas de poupança, fundos de aposentadoria, investimentos, imóveis e veículos. Passivos são tudo o que você deve, como hipoteca, financiamentos de carro, empréstimos estudantis e saldos de cartão de crédito. Esta calculadora faz a conta instantaneamente para que você sempre saiba onde está.',
        'Acompanhar o patrimônio líquido ao longo do tempo é muito mais revelador do que observar apenas a renda ou o saldo bancário. Um patrimônio líquido crescente significa que você está construindo riqueza, reduzindo dívidas e aumentando ativos mais rápido do que suas obrigações. Um patrimônio decrescente ou negativo é um sinal de alerta precoce de que a dívida está superando o que você possui. Ao atualizar esse número a cada poucos meses, você transforma uma sensação vaga em um número preciso e rastreável.',
        'Um patrimônio líquido negativo é comum e não necessariamente uma crise, especialmente no início da carreira, quando empréstimos estudantis ou uma nova hipoteca dominam o quadro. O objetivo é a melhoria constante: cada pagamento de dívida reduz os passivos e cada real poupado ou investido aumenta os ativos. Ao longo dos anos, os juros compostos e a poupança disciplinada podem transformar um número negativo em território positivo.',
        'Use este número junto com nossas outras ferramentas de planejamento para um quadro completo. Projete o crescimento de longo prazo com a <a href="/${lang}/tools/compound-interest-calculator">calculadora de juros compostos</a>, planeje a aposentadoria com a <a href="/${lang}/tools/retirement-calculator">calculadora de aposentadoria</a> e avalie os custos de crédito com a <a href="/${lang}/tools/loan-calculator">calculadora de empréstimos</a>. Juntas, elas ajudam a aumentar os ativos e reduzir os passivos.',
      ],
      faq: [
        {
          q: 'O que conta como ativo?',
          a: 'Ativos incluem dinheiro, contas correntes e de poupança, investimentos de aposentadoria e de corretagem, o valor de mercado de imóveis, veículos e bens pessoais valiosos. Use os valores de mercado atuais, não o preço de compra original.',
        },
        {
          q: 'O que conta como passivo?',
          a: 'Passivos são todas as suas dívidas: saldo da hipoteca, financiamentos de carro, empréstimos estudantis, empréstimos pessoais, saldos de cartão de crédito e qualquer valor devido a terceiros. Use o saldo devedor atual de cada um.',
        },
        {
          q: 'Um patrimônio líquido negativo é ruim?',
          a: 'Não necessariamente. Muitas pessoas têm patrimônio líquido negativo no início devido a empréstimos estudantis ou a uma hipoteca recente. O que importa é a tendência. A redução constante da dívida e a poupança moverão o número na direção certa.',
        },
        {
          q: 'Com que frequência devo calcular meu patrimônio líquido?',
          a: 'A maioria das pessoas se beneficia de verificar a cada três a seis meses. É frequente o suficiente para identificar tendências sem reagir a oscilações de mercado de curto prazo. Recalcular após eventos importantes, como a compra de um imóvel, também é útil.',
        },
        {
          q: 'Meus dados financeiros são armazenados ou compartilhados?',
          a: 'Não. Todos os cálculos acontecem inteiramente no seu navegador. Seus números nunca são enviados a servidores, armazenados em um banco de dados ou compartilhados com terceiros.',
        },
      ],
    },
  };

  const seo = seoContent[lang] || seoContent.en;

  return (
    <ToolPageWrapper toolSlug="net-worth-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Inputs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.totalAssets[lang]} ($)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={assets}
              onChange={(e) => setAssets(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 ${assetsParsed.error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
            />
            <p className="text-xs text-gray-400 mt-1">{labels.assetsHint[lang]}</p>
            {assetsParsed.error && (
              <p className="text-sm text-red-600 mt-1">{errorMessage(assetsParsed.error)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.totalLiabilities[lang]} ($)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={liabilities}
              onChange={(e) => setLiabilities(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 ${liabilitiesParsed.error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
            />
            <p className="text-xs text-gray-400 mt-1">{labels.liabilitiesHint[lang]}</p>
            {liabilitiesParsed.error && (
              <p className="text-sm text-red-600 mt-1">{errorMessage(liabilitiesParsed.error)}</p>
            )}
          </div>

          {/* Results */}
          {netWorth !== null && assetsParsed.value !== null && liabilitiesParsed.value !== null && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{labels.results[lang]}</h3>

              <div
                className={`rounded-xl p-4 text-white ${netWorth >= 0 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}
              >
                <div className="text-sm text-white/80">{labels.netWorth[lang]}</div>
                <div className="text-3xl font-bold">{fmt(netWorth)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-blue-600 font-medium">
                    {labels.breakdownAssets[lang]}
                  </div>
                  <div className="text-lg font-bold text-gray-900">{fmt(assetsParsed.value)}</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="text-xs text-orange-600 font-medium">
                    {labels.breakdownLiabilities[lang]}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {fmt(liabilitiesParsed.value)}
                  </div>
                </div>
              </div>

              <p
                className={`text-sm mt-3 font-medium ${netWorth > 0 ? 'text-green-700' : netWorth < 0 ? 'text-red-700' : 'text-gray-700'}`}
              >
                {interpretation(netWorth)}
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleCopy}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  {copied ? labels.copied[lang] : labels.copy[lang]}
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  {labels.reset[lang]}
                </button>
              </div>
            </div>
          )}

          {netWorth === null && (
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={handleReset}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
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
