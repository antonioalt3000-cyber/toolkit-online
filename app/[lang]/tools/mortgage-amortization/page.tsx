'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface HistoryEntry {
  principal: string;
  rate: string;
  years: string;
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  timestamp: number;
}

export default function MortgageAmortization() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['mortgage-amortization'][lang];

  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [errors, setErrors] = useState<{ principal?: string; rate?: string; years?: string }>({});

  const labels = {
    principal: { en: 'Loan Amount ($)', it: 'Importo Prestito (€)', es: 'Monto del Préstamo ($)', fr: 'Montant du Prêt (€)', de: 'Darlehensbetrag (€)', pt: 'Valor do Empréstimo (R$)' },
    rate: { en: 'Annual Interest Rate (%)', it: 'Tasso Annuo (%)', es: 'Tasa de Interés Anual (%)', fr: 'Taux Annuel (%)', de: 'Jahreszins (%)', pt: 'Taxa de Juros Anual (%)' },
    years: { en: 'Loan Term (years)', it: 'Durata (anni)', es: 'Plazo (años)', fr: 'Durée (années)', de: 'Laufzeit (Jahre)', pt: 'Prazo (anos)' },
    monthly: { en: 'Monthly Payment', it: 'Rata Mensile', es: 'Cuota Mensual', fr: 'Mensualité', de: 'Monatliche Rate', pt: 'Parcela Mensal' },
    totalInterest: { en: 'Total Interest', it: 'Interessi Totali', es: 'Interés Total', fr: 'Intérêts Totaux', de: 'Gesamtzinsen', pt: 'Juros Totais' },
    totalPaid: { en: 'Total Amount Paid', it: 'Totale Pagato', es: 'Total Pagado', fr: 'Total Payé', de: 'Gesamtbetrag', pt: 'Total Pago' },
    showSchedule: { en: 'Show Amortization Schedule', it: 'Mostra Piano di Ammortamento', es: 'Mostrar Tabla de Amortización', fr: 'Afficher le Tableau d\'Amortissement', de: 'Tilgungsplan Anzeigen', pt: 'Mostrar Tabela de Amortização' },
    hideSchedule: { en: 'Hide Schedule', it: 'Nascondi Piano', es: 'Ocultar Tabla', fr: 'Masquer le Tableau', de: 'Plan Ausblenden', pt: 'Ocultar Tabela' },
    month: { en: 'Month', it: 'Mese', es: 'Mes', fr: 'Mois', de: 'Monat', pt: 'Mês' },
    payment: { en: 'Payment', it: 'Rata', es: 'Cuota', fr: 'Paiement', de: 'Zahlung', pt: 'Pagamento' },
    principalPart: { en: 'Principal', it: 'Capitale', es: 'Capital', fr: 'Capital', de: 'Tilgung', pt: 'Principal' },
    interestPart: { en: 'Interest', it: 'Interessi', es: 'Interés', fr: 'Intérêts', de: 'Zinsen', pt: 'Juros' },
    balance: { en: 'Balance', it: 'Saldo', es: 'Saldo', fr: 'Solde', de: 'Restschuld', pt: 'Saldo' },
    year: { en: 'Year', it: 'Anno', es: 'Año', fr: 'Année', de: 'Jahr', pt: 'Ano' },
    copyResults: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier les Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
    copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
    history: { en: 'History', it: 'Cronologia', es: 'Historial', fr: 'Historique', de: 'Verlauf', pt: 'Histórico' },
    clearHistory: { en: 'Clear History', it: 'Cancella Cronologia', es: 'Borrar Historial', fr: 'Effacer l\'Historique', de: 'Verlauf Löschen', pt: 'Limpar Histórico' },
    principalVsInterest: { en: 'Principal vs Interest', it: 'Capitale vs Interessi', es: 'Capital vs Interés', fr: 'Capital vs Intérêts', de: 'Tilgung vs Zinsen', pt: 'Principal vs Juros' },
    calculate: { en: 'Calculate', it: 'Calcola', es: 'Calcular', fr: 'Calculer', de: 'Berechnen', pt: 'Calcular' },
    errorNegativeAmount: { en: 'Amount must be positive', it: 'L\'importo deve essere positivo', es: 'El monto debe ser positivo', fr: 'Le montant doit être positif', de: 'Betrag muss positiv sein', pt: 'O valor deve ser positivo' },
    errorRateRange: { en: 'Rate must be between 0 and 100', it: 'Il tasso deve essere tra 0 e 100', es: 'La tasa debe estar entre 0 y 100', fr: 'Le taux doit être entre 0 et 100', de: 'Zinssatz muss zwischen 0 und 100 liegen', pt: 'A taxa deve estar entre 0 e 100' },
    errorZeroTerm: { en: 'Term must be greater than 0', it: 'La durata deve essere maggiore di 0', es: 'El plazo debe ser mayor que 0', fr: 'La durée doit être supérieure à 0', de: 'Laufzeit muss größer als 0 sein', pt: 'O prazo deve ser maior que 0' },
    errorNegativeTerm: { en: 'Term must be positive', it: 'La durata deve essere positiva', es: 'El plazo debe ser positivo', fr: 'La durée doit être positive', de: 'Laufzeit muss positiv sein', pt: 'O prazo deve ser positivo' },
    loan: { en: 'Loan', it: 'Prestito', es: 'Préstamo', fr: 'Prêt', de: 'Darlehen', pt: 'Empréstimo' },
  } as Record<string, Record<Locale, string>>;

  // Validation
  const validate = useCallback(() => {
    const newErrors: typeof errors = {};
    const pVal = parseFloat(principal);
    const rVal = parseFloat(rate);
    const yVal = parseFloat(years);

    if (principal && pVal < 0) newErrors.principal = labels.errorNegativeAmount[lang];
    if (rate && (rVal < 0 || rVal > 100)) newErrors.rate = labels.errorRateRange[lang];
    if (years && yVal < 0) newErrors.years = labels.errorNegativeTerm[lang];
    if (years && yVal === 0) newErrors.years = labels.errorZeroTerm[lang];

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [principal, rate, years, lang, labels]);

  const p = parseFloat(principal) || 0;
  const r = (parseFloat(rate) || 0) / 100 / 12;
  const n = (parseFloat(years) || 0) * 12;

  const monthlyPayment = r > 0 && n > 0 ? p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : (n > 0 ? p / n : 0);
  const totalPaid = monthlyPayment * n;
  const totalInterest = totalPaid - p;

  const generateSchedule = () => {
    const schedule: { month: number; payment: number; principalPart: number; interestPart: number; balance: number }[] = [];
    let balance = p;
    for (let i = 1; i <= n; i++) {
      const interestPart = balance * r;
      const principalPart = monthlyPayment - interestPart;
      balance = Math.max(0, balance - principalPart);
      schedule.push({ month: i, payment: monthlyPayment, principalPart, interestPart, balance });
    }
    return schedule;
  };

  const schedule = (p > 0 && n > 0) ? generateSchedule() : [];
  const hasResult = p > 0 && n > 0 && Object.keys(errors).length === 0;
  const principalRatio = hasResult ? (p / totalPaid) * 100 : 0;

  // Save to history
  const saveToHistory = useCallback(() => {
    if (!hasResult) return;
    const entry: HistoryEntry = {
      principal, rate, years,
      monthlyPayment, totalInterest, totalPaid,
      timestamp: Date.now(),
    };
    setHistory(prev => [entry, ...prev].slice(0, 5));
  }, [hasResult, principal, rate, years, monthlyPayment, totalInterest, totalPaid]);

  // Copy results
  const copyResults = useCallback(async () => {
    if (!hasResult) return;
    const text = `${labels.monthly[lang]}: ${monthlyPayment.toFixed(2)}\n${labels.totalInterest[lang]}: ${totalInterest.toFixed(2)}\n${labels.totalPaid[lang]}: ${totalPaid.toFixed(2)}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  }, [hasResult, monthlyPayment, totalInterest, totalPaid, lang, labels]);

  // Reset
  const handleReset = () => {
    setPrincipal('');
    setRate('');
    setYears('');
    setShowSchedule(false);
    setErrors({});
  };

  // Load from history
  const loadFromHistory = (entry: HistoryEntry) => {
    setPrincipal(entry.principal);
    setRate(entry.rate);
    setYears(entry.years);
    setErrors({});
  };

  // Handle input with validation
  const handlePrincipalChange = (val: string) => {
    setPrincipal(val);
    const v = parseFloat(val);
    if (val && v < 0) setErrors(prev => ({ ...prev, principal: labels.errorNegativeAmount[lang] }));
    else setErrors(prev => { const { principal: _, ...rest } = prev; return rest; });
  };

  const handleRateChange = (val: string) => {
    setRate(val);
    const v = parseFloat(val);
    if (val && (v < 0 || v > 100)) setErrors(prev => ({ ...prev, rate: labels.errorRateRange[lang] }));
    else setErrors(prev => { const { rate: _, ...rest } = prev; return rest; });
  };

  const handleYearsChange = (val: string) => {
    setYears(val);
    const v = parseFloat(val);
    if (val && v < 0) setErrors(prev => ({ ...prev, years: labels.errorNegativeTerm[lang] }));
    else if (val && v === 0) setErrors(prev => ({ ...prev, years: labels.errorZeroTerm[lang] }));
    else setErrors(prev => { const { years: _, ...rest } = prev; return rest; });
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Mortgage Amortization Calculator – Full Payment Schedule Online',
      paragraphs: [
        'A mortgage amortization schedule breaks down every monthly payment into principal and interest components over the entire life of your loan. Understanding this schedule is crucial for homebuyers and homeowners who want to see exactly where their money goes each month and how their loan balance decreases over time.',
        'Our free mortgage amortization calculator instantly generates a complete month-by-month breakdown. Simply enter your loan amount, annual interest rate, and loan term in years. The calculator uses the standard amortization formula: M = P[r(1+r)^n]/[(1+r)^n-1], where M is the monthly payment, P is the principal, r is the monthly interest rate, and n is the total number of payments.',
        'In the early years of a mortgage, a larger portion of each payment goes toward interest. As the loan matures, more of each payment is applied to the principal. This is why making extra principal payments early in the loan term can significantly reduce the total interest paid and shorten the loan duration.',
        'Whether you are comparing 15-year vs 30-year mortgages, evaluating refinancing options, or simply planning your household budget, our amortization calculator provides the detailed financial picture you need. All calculations are performed locally in your browser — no data is sent to any server.',
        'For a quick estimate of your monthly payment without the full schedule, try our <a href="/${lang}/tools/mortgage-calculator">mortgage calculator</a>. If you are evaluating other types of loans, our <a href="/${lang}/tools/loan-calculator">loan calculator</a> covers personal, auto, and student loans. To see how your savings grow over time for a future down payment, check the <a href="/${lang}/tools/compound-interest-calculator">compound interest calculator</a>.',
      ],
      faq: [
        { q: 'What is mortgage amortization?', a: 'Mortgage amortization is the process of paying off a home loan through regular monthly payments that include both principal (the amount borrowed) and interest. Over time, the proportion of each payment that goes to principal increases while the interest portion decreases.' },
        { q: 'Why do I pay more interest at the beginning of my mortgage?', a: 'Interest is calculated on the remaining balance. At the start, your balance is highest, so the interest portion is largest. As you pay down the principal, less interest accrues each month, and more of your payment goes toward reducing the balance.' },
        { q: 'How can I pay off my mortgage faster?', a: 'You can pay off your mortgage faster by making extra principal payments, switching to bi-weekly payments (which adds one extra payment per year), or refinancing to a shorter loan term. Even small additional payments can save thousands in interest over the life of the loan.' },
        { q: 'What is the difference between a 15-year and 30-year mortgage?', a: 'A 15-year mortgage has higher monthly payments but a lower interest rate and far less total interest paid. A 30-year mortgage offers lower monthly payments but costs significantly more in total interest. For example, on a $300,000 loan, a 30-year mortgage at 6.5% costs about $382,000 in interest, while a 15-year at 5.8% costs about $147,000.' },
        { q: 'Does this calculator include taxes and insurance?', a: 'This calculator computes principal and interest only. Your actual monthly mortgage payment may also include property taxes, homeowner\'s insurance, and possibly private mortgage insurance (PMI). These additional costs are typically collected in an escrow account by your lender.' },
      ],
    },
    it: {
      title: 'Calcolatore Ammortamento Mutuo Gratuito – Piano Completo dei Pagamenti',
      paragraphs: [
        'Un piano di ammortamento mutuo suddivide ogni rata mensile in quota capitale e quota interessi per l\'intera durata del prestito. Comprendere questo piano è fondamentale per chi acquista casa e vuole sapere esattamente dove vanno i propri soldi ogni mese.',
        'Il nostro calcolatore gratuito genera istantaneamente una ripartizione completa mese per mese. Inserisci l\'importo del prestito, il tasso di interesse annuo e la durata in anni. Il calcolatore utilizza la formula standard di ammortamento per calcolare la rata costante.',
        'Nei primi anni del mutuo, una parte maggiore di ogni rata va verso gli interessi. Man mano che il prestito matura, più soldi vengono applicati al capitale. Ecco perché effettuare pagamenti extra sul capitale nei primi anni può ridurre significativamente gli interessi totali.',
        'Che tu stia confrontando mutui a 15 o 30 anni, valutando opzioni di rifinanziamento o pianificando il bilancio familiare, il nostro calcolatore fornisce il quadro finanziario dettagliato di cui hai bisogno. Tutti i calcoli vengono eseguiti localmente nel browser.',
        'Per una stima rapida della rata mensile senza il piano completo, prova il nostro <a href="/${lang}/tools/mortgage-calculator">calcolatore mutuo</a>. Per valutare altri tipi di prestiti, il <a href="/${lang}/tools/loan-calculator">calcolatore prestiti</a> copre personali, auto e finanziamenti. Per far crescere i risparmi per un futuro anticipo, consulta il <a href="/${lang}/tools/compound-interest-calculator">calcolatore interesse composto</a>.',
      ],
      faq: [
        { q: 'Cos\'è l\'ammortamento del mutuo?', a: 'L\'ammortamento è il processo di rimborso del mutuo attraverso rate mensili costanti che includono quota capitale e quota interessi. Nel tempo, la proporzione di ogni rata destinata al capitale aumenta mentre quella degli interessi diminuisce.' },
        { q: 'Perché pago più interessi all\'inizio del mutuo?', a: 'Gli interessi sono calcolati sul saldo residuo. All\'inizio, il saldo è più alto, quindi la quota interessi è maggiore. Man mano che riduci il capitale, si accumulano meno interessi ogni mese.' },
        { q: 'Come posso estinguere il mutuo più velocemente?', a: 'Puoi estinguere il mutuo più velocemente effettuando pagamenti extra sul capitale, passando a pagamenti quindicinali o rifinanziando con una durata più breve. Anche piccoli pagamenti aggiuntivi possono far risparmiare migliaia di euro in interessi.' },
        { q: 'Qual è la differenza tra mutuo a 15 e 30 anni?', a: 'Un mutuo a 15 anni ha rate più alte ma un tasso più basso e molto meno interessi totali. Un mutuo a 30 anni offre rate più basse ma costa molto di più in interessi complessivi.' },
        { q: 'Questo calcolatore include tasse e assicurazione?', a: 'Questo calcolatore calcola solo capitale e interessi. La rata effettiva del mutuo può includere anche imposte sulla proprietà e assicurazione, che vengono generalmente raccolte dalla banca.' },
      ],
    },
    es: {
      title: 'Calculadora de Amortización Hipotecaria Gratis – Tabla Completa de Pagos',
      paragraphs: [
        'Una tabla de amortización hipotecaria desglosa cada pago mensual en componentes de capital e interés durante toda la vida del préstamo. Entender esta tabla es crucial para compradores de vivienda que quieren ver exactamente a dónde va su dinero cada mes.',
        'Nuestra calculadora gratuita genera instantáneamente un desglose completo mes a mes. Solo ingresa el monto del préstamo, la tasa de interés anual y el plazo en años. La calculadora usa la fórmula estándar de amortización para calcular la cuota fija mensual.',
        'En los primeros años de una hipoteca, una mayor parte de cada pago se destina a intereses. A medida que el préstamo madura, más dinero se aplica al capital. Por eso hacer pagos extra al capital al inicio puede reducir significativamente los intereses totales.',
        'Ya sea que estés comparando hipotecas a 15 o 30 años, evaluando refinanciamiento o planificando tu presupuesto, nuestra calculadora te da el panorama financiero detallado. Todos los cálculos se realizan localmente en tu navegador.',
        'Para una estimación rápida de tu cuota mensual, prueba nuestra <a href="/${lang}/tools/mortgage-calculator">calculadora de hipoteca</a>. Para evaluar otros tipos de crédito, la <a href="/${lang}/tools/loan-calculator">calculadora de préstamos</a> cubre personales, auto y estudiantiles. Para hacer crecer tus ahorros para un futuro enganche, consulta la <a href="/${lang}/tools/compound-interest-calculator">calculadora de interés compuesto</a>.',
      ],
      faq: [
        { q: '¿Qué es la amortización hipotecaria?', a: 'La amortización hipotecaria es el proceso de pagar un préstamo mediante cuotas mensuales que incluyen capital e interés. Con el tiempo, la proporción de cada pago destinada al capital aumenta mientras la de interés disminuye.' },
        { q: '¿Por qué pago más interés al inicio de mi hipoteca?', a: 'El interés se calcula sobre el saldo pendiente. Al inicio, tu saldo es mayor, por lo que la parte de interés es más grande. A medida que pagas el capital, se acumulan menos intereses cada mes.' },
        { q: '¿Cómo puedo pagar mi hipoteca más rápido?', a: 'Puedes pagar tu hipoteca más rápido haciendo pagos extra al capital, cambiando a pagos quincenales o refinanciando a un plazo más corto. Incluso pequeños pagos adicionales pueden ahorrar miles en intereses.' },
        { q: '¿Cuál es la diferencia entre hipoteca a 15 y 30 años?', a: 'Una hipoteca a 15 años tiene cuotas más altas pero menos interés total. Una a 30 años ofrece cuotas más bajas pero cuesta mucho más en intereses a lo largo del tiempo.' },
        { q: '¿Esta calculadora incluye impuestos y seguro?', a: 'Esta calculadora calcula solo capital e intereses. Tu pago real puede incluir impuestos sobre la propiedad y seguro de vivienda, que generalmente se cobran junto con la hipoteca.' },
      ],
    },
    fr: {
      title: 'Calculateur d\'Amortissement Hypothécaire Gratuit – Tableau Complet des Paiements',
      paragraphs: [
        'Un tableau d\'amortissement hypothécaire décompose chaque mensualité en parts de capital et d\'intérêts sur toute la durée du prêt. Comprendre ce tableau est essentiel pour les acheteurs qui veulent savoir exactement où va leur argent chaque mois.',
        'Notre calculateur gratuit génère instantanément un détail complet mois par mois. Entrez le montant du prêt, le taux d\'intérêt annuel et la durée en années. Le calculateur utilise la formule standard d\'amortissement pour calculer la mensualité constante.',
        'Dans les premières années du prêt, une plus grande partie de chaque paiement va vers les intérêts. À mesure que le prêt avance, plus d\'argent est appliqué au capital. C\'est pourquoi effectuer des remboursements anticipés peut réduire significativement les intérêts totaux.',
        'Que vous compariez des prêts à 15 ou 30 ans, évaluiez un refinancement ou planifiez votre budget, notre calculateur fournit le détail financier nécessaire. Tous les calculs sont effectués localement dans votre navigateur.',
        'Pour une estimation rapide de votre mensualité, essayez notre <a href="/${lang}/tools/mortgage-calculator">calculateur hypothécaire</a>. Pour évaluer d\'autres types de crédits, le <a href="/${lang}/tools/loan-calculator">calculateur de prêt</a> couvre les prêts personnels et auto. Pour faire fructifier votre épargne pour un futur apport, consultez le <a href="/${lang}/tools/compound-interest-calculator">calculateur d\'intérêts composés</a>.',
      ],
      faq: [
        { q: 'Qu\'est-ce que l\'amortissement hypothécaire ?', a: 'L\'amortissement hypothécaire est le processus de remboursement d\'un prêt immobilier par des mensualités incluant capital et intérêts. Au fil du temps, la part de chaque paiement consacrée au capital augmente tandis que celle des intérêts diminue.' },
        { q: 'Pourquoi paie-t-on plus d\'intérêts au début ?', a: 'Les intérêts sont calculés sur le solde restant. Au début, votre solde est le plus élevé, donc la part d\'intérêts est la plus importante. À mesure que vous remboursez le capital, moins d\'intérêts s\'accumulent.' },
        { q: 'Comment rembourser mon prêt plus rapidement ?', a: 'Vous pouvez rembourser plus vite en effectuant des paiements supplémentaires sur le capital, en passant à des paiements bimensuels ou en refinançant à une durée plus courte.' },
        { q: 'Quelle différence entre un prêt à 15 et 30 ans ?', a: 'Un prêt à 15 ans a des mensualités plus élevées mais beaucoup moins d\'intérêts totaux. Un prêt à 30 ans offre des mensualités plus faibles mais coûte beaucoup plus en intérêts sur la durée.' },
        { q: 'Ce calculateur inclut-il les taxes et l\'assurance ?', a: 'Ce calculateur calcule uniquement le capital et les intérêts. Votre mensualité réelle peut inclure des taxes foncières et une assurance habitation.' },
      ],
    },
    de: {
      title: 'Kostenloser Tilgungsrechner – Vollständiger Tilgungsplan Online',
      paragraphs: [
        'Ein Tilgungsplan schlüsselt jede monatliche Rate in Tilgungs- und Zinsanteile über die gesamte Laufzeit Ihres Darlehens auf. Das Verständnis dieses Plans ist entscheidend für Immobilienkäufer, die genau sehen möchten, wohin ihr Geld jeden Monat fließt.',
        'Unser kostenloser Tilgungsrechner erstellt sofort eine vollständige monatliche Aufschlüsselung. Geben Sie einfach den Darlehensbetrag, den jährlichen Zinssatz und die Laufzeit in Jahren ein. Der Rechner verwendet die Standard-Annuitätenformel.',
        'In den ersten Jahren eines Hypothekendarlehens fließt ein größerer Teil jeder Rate in die Zinsen. Mit zunehmender Laufzeit wird mehr Geld auf die Tilgung angewendet. Deshalb können frühe Sondertilgungen die Gesamtzinsen erheblich reduzieren.',
        'Ob Sie 15- und 30-jährige Hypotheken vergleichen, Umschuldungsoptionen prüfen oder Ihr Haushaltsbudget planen — unser Tilgungsrechner liefert das detaillierte Finanzbild. Alle Berechnungen erfolgen lokal in Ihrem Browser.',
        'Für eine schnelle Schätzung Ihrer monatlichen Rate ohne vollständigen Plan nutzen Sie unseren <a href="/${lang}/tools/mortgage-calculator">Hypothekenrechner</a>. Für andere Kreditarten hilft der <a href="/${lang}/tools/loan-calculator">Kreditrechner</a>. Um Ersparnisse für eine künftige Anzahlung wachsen zu lassen, nutzen Sie den <a href="/${lang}/tools/compound-interest-calculator">Zinseszinsrechner</a>.',
      ],
      faq: [
        { q: 'Was ist ein Tilgungsplan?', a: 'Ein Tilgungsplan zeigt die Aufschlüsselung jeder monatlichen Rate in Tilgungs- und Zinsanteil über die gesamte Darlehenslaufzeit. Der Tilgungsanteil steigt mit der Zeit, während der Zinsanteil sinkt.' },
        { q: 'Warum zahle ich am Anfang mehr Zinsen?', a: 'Zinsen werden auf den Restbetrag berechnet. Am Anfang ist Ihr Saldo am höchsten, daher ist der Zinsanteil am größten. Mit zunehmender Tilgung fallen weniger Zinsen an.' },
        { q: 'Wie kann ich mein Darlehen schneller zurückzahlen?', a: 'Sie können Ihr Darlehen schneller tilgen durch Sondertilgungen, kürzere Laufzeiten oder Umschuldung. Selbst kleine zusätzliche Zahlungen können Tausende an Zinsen einsparen.' },
        { q: 'Was ist der Unterschied zwischen 15- und 30-jährigen Darlehen?', a: 'Ein 15-jähriges Darlehen hat höhere monatliche Raten, aber deutlich weniger Gesamtzinsen. Ein 30-jähriges Darlehen bietet niedrigere Raten, kostet aber insgesamt viel mehr an Zinsen.' },
        { q: 'Enthält dieser Rechner Steuern und Versicherung?', a: 'Dieser Rechner berechnet nur Tilgung und Zinsen. Ihre tatsächliche monatliche Rate kann auch Grundsteuer und Gebäudeversicherung umfassen.' },
      ],
    },
    pt: {
      title: 'Calculadora de Amortização de Financiamento Grátis – Tabela Completa de Pagamentos',
      paragraphs: [
        'Uma tabela de amortização decompõe cada parcela mensal em componentes de capital e juros durante toda a vida do empréstimo. Entender esta tabela é fundamental para compradores de imóveis que querem ver exatamente para onde vai seu dinheiro cada mês.',
        'Nossa calculadora gratuita gera instantaneamente um detalhamento completo mês a mês. Basta inserir o valor do empréstimo, a taxa de juros anual e o prazo em anos. A calculadora usa a fórmula padrão de amortização para calcular a parcela fixa.',
        'Nos primeiros anos de um financiamento, uma parcela maior de cada pagamento vai para juros. À medida que o empréstimo amadurece, mais dinheiro é aplicado ao principal. Por isso, fazer pagamentos extras no início pode reduzir significativamente os juros totais.',
        'Seja comparando financiamentos de 15 ou 30 anos, avaliando refinanciamento ou planejando seu orçamento, nossa calculadora fornece o panorama financeiro detalhado necessário. Todos os cálculos são feitos localmente no seu navegador.',
        'Para uma estimativa rápida da parcela mensal, experimente a <a href="/${lang}/tools/mortgage-calculator">calculadora de hipoteca</a>. Para avaliar outros tipos de crédito, a <a href="/${lang}/tools/loan-calculator">calculadora de empréstimos</a> cobre pessoais, auto e estudantis. Para fazer crescer as poupanças para uma futura entrada, consulte a <a href="/${lang}/tools/compound-interest-calculator">calculadora de juros compostos</a>.',
      ],
      faq: [
        { q: 'O que é amortização de financiamento?', a: 'Amortização é o processo de pagamento de um empréstimo através de parcelas mensais que incluem principal e juros. Com o tempo, a proporção de cada pagamento destinada ao principal aumenta enquanto a de juros diminui.' },
        { q: 'Por que pago mais juros no início?', a: 'Os juros são calculados sobre o saldo devedor. No início, seu saldo é maior, então a parte de juros é maior. À medida que você paga o principal, menos juros se acumulam a cada mês.' },
        { q: 'Como posso quitar meu financiamento mais rápido?', a: 'Você pode quitar mais rápido fazendo pagamentos extras no principal, mudando para pagamentos quinzenais ou refinanciando com prazo menor. Mesmo pequenos pagamentos adicionais podem economizar milhares em juros.' },
        { q: 'Qual a diferença entre financiamento de 15 e 30 anos?', a: 'Um financiamento de 15 anos tem parcelas maiores mas muito menos juros totais. Um de 30 anos oferece parcelas menores mas custa muito mais em juros ao longo do tempo.' },
        { q: 'Esta calculadora inclui impostos e seguro?', a: 'Esta calculadora calcula apenas principal e juros. Sua parcela real pode incluir impostos sobre a propriedade e seguro residencial.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="mortgage-amortization" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Principal input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.principal[lang]}</label>
            <input type="number" value={principal} onChange={(e) => handlePrincipalChange(e.target.value)} placeholder="250000" className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 ${errors.principal ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {errors.principal && <p className="text-red-500 text-xs mt-1">{errors.principal}</p>}
          </div>
          {/* Rate input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.rate[lang]}</label>
            <input type="number" value={rate} onChange={(e) => handleRateChange(e.target.value)} placeholder="5.5" step="0.1" className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 ${errors.rate ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {errors.rate && <p className="text-red-500 text-xs mt-1">{errors.rate}</p>}
          </div>
          {/* Years input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.years[lang]}</label>
            <input type="number" value={years} onChange={(e) => handleYearsChange(e.target.value)} placeholder="30" className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 ${errors.years ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {errors.years && <p className="text-red-500 text-xs mt-1">{errors.years}</p>}
          </div>

          {/* Action buttons row */}
          <div className="flex gap-2">
            <button
              onClick={() => { if (validate()) saveToHistory(); }}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {labels.calculate[lang]}
            </button>
            <button
              onClick={handleReset}
              className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              {labels.reset[lang]}
            </button>
          </div>

          {hasResult && (
            <div className="space-y-3">
              {/* Summary cards */}
              <div className="p-5 rounded-lg bg-blue-50 text-center">
                <div className="text-sm text-gray-500">{labels.monthly[lang]}</div>
                <div className="text-4xl font-bold text-blue-700">{monthlyPayment.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-red-50 text-center">
                  <div className="text-xs text-gray-500">{labels.totalInterest[lang]}</div>
                  <div className="text-lg font-semibold text-red-600">{totalInterest.toFixed(2)}</div>
                </div>
                <div className="p-3 rounded-lg bg-green-50 text-center">
                  <div className="text-xs text-gray-500">{labels.totalPaid[lang]}</div>
                  <div className="text-lg font-semibold text-gray-900">{totalPaid.toFixed(2)}</div>
                </div>
              </div>

              {/* Progress bar: principal vs interest */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{labels.principalPart[lang]} ({principalRatio.toFixed(1)}%)</span>
                  <span>{labels.interestPart[lang]} ({(100 - principalRatio).toFixed(1)}%)</span>
                </div>
                <div className="w-full h-4 bg-red-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-l-full transition-all duration-500"
                    style={{ width: `${principalRatio}%` }}
                  />
                </div>
                <div className="text-center text-xs text-gray-400 mt-1">{labels.principalVsInterest[lang]}</div>
              </div>

              {/* Copy Results button */}
              <button
                onClick={copyResults}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                {copied ? labels.copied[lang] : labels.copyResults[lang]}
              </button>

              <button
                onClick={() => setShowSchedule(!showSchedule)}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {showSchedule ? labels.hideSchedule[lang] : labels.showSchedule[lang]}
              </button>

              {showSchedule && schedule.length > 0 && (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-100">
                      <tr>
                        <th className="px-2 py-1 text-left">{labels.month[lang]}</th>
                        <th className="px-2 py-1 text-right">{labels.payment[lang]}</th>
                        <th className="px-2 py-1 text-right">{labels.principalPart[lang]}</th>
                        <th className="px-2 py-1 text-right">{labels.interestPart[lang]}</th>
                        <th className="px-2 py-1 text-right">{labels.balance[lang]}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((row) => (
                        <tr key={row.month} className={row.month % 12 === 0 ? 'bg-blue-50 font-medium' : 'border-b border-gray-100'}>
                          <td className="px-2 py-1">{row.month}{row.month % 12 === 0 ? ` (${labels.year[lang]} ${row.month / 12})` : ''}</td>
                          <td className="px-2 py-1 text-right">{row.payment.toFixed(2)}</td>
                          <td className="px-2 py-1 text-right text-green-600">{row.principalPart.toFixed(2)}</td>
                          <td className="px-2 py-1 text-right text-red-600">{row.interestPart.toFixed(2)}</td>
                          <td className="px-2 py-1 text-right">{row.balance.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* History section */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-700">{labels.history[lang]}</h3>
              <button
                onClick={() => setHistory([])}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                {labels.clearHistory[lang]}
              </button>
            </div>
            <div className="space-y-2">
              {history.map((entry, i) => (
                <button
                  key={entry.timestamp}
                  onClick={() => loadFromHistory(entry)}
                  className="w-full text-left p-2 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors text-sm flex justify-between items-center"
                >
                  <span className="text-gray-700">
                    {labels.loan[lang]}: {parseFloat(entry.principal).toLocaleString()} | {entry.rate}% | {entry.years} {labels.years[lang].split('(')[1]?.replace(')', '') || labels.year[lang]}
                  </span>
                  <span className="font-semibold text-blue-600">{entry.monthlyPayment.toFixed(2)}/mo</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: p.replace(/\$\{lang\}/g, lang) }} />)}
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
