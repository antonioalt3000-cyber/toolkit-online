'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type AmortRow = { month: number; payment: number; principal: number; interest: number; balance: number };

export default function DebtPayoffCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['debt-payoff-calculator'][lang];

  const [debt, setDebt] = useState('');
  const [apr, setApr] = useState('');
  const [minPayment, setMinPayment] = useState('');
  const [extraPayment, setExtraPayment] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showFullTable, setShowFullTable] = useState(false);

  const labels: Record<string, Record<Locale, string>> = {
    totalDebt: { en: 'Total Debt Amount', it: 'Importo Debito Totale', es: 'Monto Total de Deuda', fr: 'Montant Total de la Dette', de: 'Gesamtschuldenbetrag', pt: 'Valor Total da Dívida' },
    interestRate: { en: 'Annual Interest Rate (APR %)', it: 'Tasso di Interesse Annuo (APR %)', es: 'Tasa de Interés Anual (APR %)', fr: 'Taux d\'Intérêt Annuel (TAEG %)', de: 'Jährlicher Zinssatz (APR %)', pt: 'Taxa de Juros Anual (APR %)' },
    minPayment: { en: 'Minimum Monthly Payment', it: 'Pagamento Mensile Minimo', es: 'Pago Mensual Mínimo', fr: 'Paiement Mensuel Minimum', de: 'Monatliche Mindestzahlung', pt: 'Pagamento Mensal Mínimo' },
    extraPayment: { en: 'Extra Monthly Payment (optional)', it: 'Pagamento Extra Mensile (opzionale)', es: 'Pago Extra Mensual (opcional)', fr: 'Paiement Supplémentaire (optionnel)', de: 'Zusätzliche Monatszahlung (optional)', pt: 'Pagamento Extra Mensal (opcional)' },
    monthsToPayoff: { en: 'Months to Pay Off', it: 'Mesi per Estinguere', es: 'Meses para Liquidar', fr: 'Mois pour Rembourser', de: 'Monate bis zur Tilgung', pt: 'Meses para Quitar' },
    totalInterest: { en: 'Total Interest Paid', it: 'Interessi Totali Pagati', es: 'Intereses Totales Pagados', fr: 'Intérêts Totaux Payés', de: 'Gezahlte Gesamtzinsen', pt: 'Juros Totais Pagos' },
    totalPaid: { en: 'Total Amount Paid', it: 'Importo Totale Pagato', es: 'Monto Total Pagado', fr: 'Montant Total Payé', de: 'Gesamtbetrag Gezahlt', pt: 'Valor Total Pago' },
    withExtra: { en: 'With Extra Payment', it: 'Con Pagamento Extra', es: 'Con Pago Extra', fr: 'Avec Paiement Supplémentaire', de: 'Mit Zusatzzahlung', pt: 'Com Pagamento Extra' },
    withoutExtra: { en: 'Without Extra Payment', it: 'Senza Pagamento Extra', es: 'Sin Pago Extra', fr: 'Sans Paiement Supplémentaire', de: 'Ohne Zusatzzahlung', pt: 'Sem Pagamento Extra' },
    savings: { en: 'You Save', it: 'Risparmi', es: 'Ahorras', fr: 'Vous Économisez', de: 'Sie Sparen', pt: 'Você Economiza' },
    amortization: { en: 'Amortization Summary', it: 'Riepilogo Ammortamento', es: 'Resumen de Amortización', fr: 'Résumé d\'Amortissement', de: 'Tilgungsübersicht', pt: 'Resumo de Amortização' },
    month: { en: 'Month', it: 'Mese', es: 'Mes', fr: 'Mois', de: 'Monat', pt: 'Mês' },
    payment: { en: 'Payment', it: 'Pagamento', es: 'Pago', fr: 'Paiement', de: 'Zahlung', pt: 'Pagamento' },
    principal: { en: 'Principal', it: 'Capitale', es: 'Capital', fr: 'Capital', de: 'Tilgung', pt: 'Capital' },
    interest: { en: 'Interest', it: 'Interessi', es: 'Intereses', fr: 'Intérêts', de: 'Zinsen', pt: 'Juros' },
    balance: { en: 'Balance', it: 'Saldo', es: 'Saldo', fr: 'Solde', de: 'Restschuld', pt: 'Saldo' },
    enterValues: { en: 'Enter your debt details above', it: 'Inserisci i dettagli del debito sopra', es: 'Ingresa los detalles de tu deuda arriba', fr: 'Entrez les détails de votre dette ci-dessus', de: 'Geben Sie Ihre Schuldendetails oben ein', pt: 'Insira os detalhes da sua dívida acima' },
    tooLow: { en: 'Payment too low to cover interest', it: 'Pagamento troppo basso per coprire gli interessi', es: 'Pago demasiado bajo para cubrir intereses', fr: 'Paiement trop bas pour couvrir les intérêts', de: 'Zahlung zu niedrig um Zinsen zu decken', pt: 'Pagamento muito baixo para cobrir os juros' },
    showAll: { en: 'Show all months', it: 'Mostra tutti i mesi', es: 'Mostrar todos los meses', fr: 'Afficher tous les mois', de: 'Alle Monate anzeigen', pt: 'Mostrar todos os meses' },
    showLess: { en: 'Show less', it: 'Mostra meno', es: 'Mostrar menos', fr: 'Afficher moins', de: 'Weniger anzeigen', pt: 'Mostrar menos' },
    months: { en: 'months', it: 'mesi', es: 'meses', fr: 'mois', de: 'Monate', pt: 'meses' },
    inInterest: { en: 'in interest', it: 'in interessi', es: 'en intereses', fr: 'en intérêts', de: 'an Zinsen', pt: 'em juros' },
    fasterBy: { en: 'faster by', it: 'più veloce di', es: 'más rápido por', fr: 'plus rapide de', de: 'schneller um', pt: 'mais rápido em' },
  };

  const fmt = (n: number) => n.toLocaleString(lang === 'en' ? 'en-US' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : lang === 'pt' ? 'pt-BR' : 'it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const calculate = useMemo(() => {
    const d = parseFloat(debt);
    const a = parseFloat(apr);
    const mp = parseFloat(minPayment);
    const ep = parseFloat(extraPayment) || 0;

    if (!d || !a || !mp || d <= 0 || a <= 0 || mp <= 0) return null;

    const monthlyRate = a / 100 / 12;

    const computeSchedule = (monthlyPay: number): { months: number; totalInterest: number; totalPaid: number; rows: AmortRow[] } | null => {
      let balance = d;
      let totalInterest = 0;
      let totalPaid = 0;
      const rows: AmortRow[] = [];
      let month = 0;
      const maxMonths = 1200;

      while (balance > 0.01 && month < maxMonths) {
        month++;
        const interestCharge = balance * monthlyRate;
        let payment = Math.min(monthlyPay, balance + interestCharge);
        const principalPart = payment - interestCharge;

        if (principalPart <= 0) return null;

        balance = Math.max(0, balance - principalPart);
        totalInterest += interestCharge;
        totalPaid += payment;

        rows.push({ month, payment: Math.round(payment * 100) / 100, principal: Math.round(principalPart * 100) / 100, interest: Math.round(interestCharge * 100) / 100, balance: Math.round(balance * 100) / 100 });
      }

      return { months: month, totalInterest, totalPaid, rows };
    };

    const withoutExtra = computeSchedule(mp);
    const withExtra = ep > 0 ? computeSchedule(mp + ep) : null;

    return { withoutExtra, withExtra };
  }, [debt, apr, minPayment, extraPayment]);

  const primary = calculate?.withExtra || calculate?.withoutExtra;
  const comparison = calculate?.withExtra ? calculate.withoutExtra : null;

  const getVisibleRows = (rows: AmortRow[]) => {
    if (showFullTable || rows.length <= 15) return rows;
    const first12 = rows.slice(0, 12);
    const last3 = rows.slice(-3);
    return [...first12, ...last3];
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'How to Calculate Your Debt Payoff Timeline and Save on Interest',
      paragraphs: [
        'Paying off debt can feel overwhelming, but understanding your repayment timeline is the first step toward financial freedom. A debt payoff calculator shows you exactly how long it will take to become debt-free and how much interest you will pay along the way. This clarity helps you create a realistic budget and stay motivated.',
        'The key inputs are your total debt balance, annual interest rate (APR), and monthly payment amount. The calculator uses these to generate a month-by-month amortization schedule showing how each payment splits between principal and interest. Early payments go mostly toward interest, but over time more goes to reducing your balance.',
        'Adding even a small extra monthly payment can dramatically reduce your payoff time and total interest paid. For example, adding just $50 per month to a $10,000 debt at 18% APR can save you thousands in interest and shave years off your repayment. The comparison feature shows you exactly how much you save.',
        'Two popular debt repayment strategies are the avalanche method (pay highest interest first) and the snowball method (pay smallest balance first). Regardless of strategy, the math is clear: the more you pay each month above the minimum, the faster you eliminate debt and the less interest you pay overall.'
      ],
      faq: [
        { q: 'How is monthly interest calculated on debt?', a: 'Monthly interest is calculated by dividing your annual interest rate (APR) by 12, then multiplying by your current balance. For example, 18% APR on a $5,000 balance means $75 in interest for that month.' },
        { q: 'Why does most of my early payment go to interest?', a: 'Because interest is calculated on the remaining balance, and the balance is highest at the start. As you pay down the principal, a larger portion of each payment goes toward reducing your debt rather than paying interest.' },
        { q: 'How much can extra payments save me?', a: 'It depends on your balance, rate, and extra amount. Even small additions compound over time. Use the comparison feature to see exact savings for your specific situation.' },
        { q: 'What if my payment is less than the monthly interest?', a: 'If your payment does not cover the monthly interest, your debt will grow over time (negative amortization). The calculator will warn you if this occurs. You need to pay at least the monthly interest to make progress.' },
        { q: 'Is my financial data stored or shared?', a: 'No. All calculations happen entirely in your browser. No financial data is sent to any server, stored in any database, or shared with any third party.' }
      ]
    },
    it: {
      title: 'Come Calcolare il Piano di Estinzione del Debito e Risparmiare sugli Interessi',
      paragraphs: [
        'Estinguere un debito può sembrare opprimente, ma comprendere la tempistica di rimborso è il primo passo verso la libertà finanziaria. Un calcolatore di estinzione debito mostra esattamente quanto tempo ci vorrà per diventare liberi dai debiti e quanti interessi pagherai.',
        'Gli input chiave sono il saldo totale del debito, il tasso di interesse annuo (TAEG) e l\'importo del pagamento mensile. Il calcolatore genera un piano di ammortamento mese per mese che mostra come ogni pagamento si divide tra capitale e interessi.',
        'Aggiungere anche un piccolo pagamento extra mensile può ridurre drasticamente i tempi e gli interessi totali. Ad esempio, aggiungere solo 50 euro al mese a un debito di 10.000 euro al 18% può farti risparmiare migliaia di euro in interessi e accorciare il rimborso di anni.',
        'Due strategie popolari sono il metodo valanga (pagare prima il tasso più alto) e il metodo palla di neve (pagare prima il saldo più piccolo). In ogni caso, più paghi oltre il minimo, più velocemente elimini il debito.'
      ],
      faq: [
        { q: 'Come si calcolano gli interessi mensili sul debito?', a: 'Si divide il tasso annuo per 12 e si moltiplica per il saldo corrente. Ad esempio, il 18% TAEG su 5.000 euro significa 75 euro di interessi quel mese.' },
        { q: 'Perché la maggior parte del pagamento iniziale va agli interessi?', a: 'Perché gli interessi sono calcolati sul saldo residuo, che è massimo all\'inizio. Man mano che riduci il capitale, una quota maggiore va alla riduzione del debito.' },
        { q: 'Quanto posso risparmiare con pagamenti extra?', a: 'Dipende dal saldo, tasso e importo extra. Anche piccole aggiunte si accumulano nel tempo. Usa la funzione di confronto per vedere i risparmi esatti.' },
        { q: 'Cosa succede se il pagamento è inferiore agli interessi mensili?', a: 'Il debito crescerà nel tempo (ammortamento negativo). Il calcolatore ti avvisa se questo accade. Devi pagare almeno gli interessi mensili per fare progressi.' },
        { q: 'I miei dati finanziari vengono salvati?', a: 'No. Tutti i calcoli avvengono nel browser. Nessun dato viene inviato a server o condiviso con terzi.' }
      ]
    },
    es: {
      title: 'Cómo Calcular tu Plan de Pago de Deuda y Ahorrar en Intereses',
      paragraphs: [
        'Pagar deudas puede parecer abrumador, pero entender tu cronograma de pago es el primer paso hacia la libertad financiera. Una calculadora de liquidación de deuda muestra exactamente cuánto tiempo tardará en quedar libre de deudas y cuánto pagarás en intereses.',
        'Los datos clave son el saldo total de la deuda, la tasa de interés anual (APR) y el pago mensual. La calculadora genera un cronograma de amortización mes a mes mostrando cómo cada pago se divide entre capital e intereses.',
        'Agregar incluso un pequeño pago extra mensual puede reducir drásticamente el tiempo y los intereses totales. Por ejemplo, agregar solo $50 al mes a una deuda de $10,000 al 18% puede ahorrarte miles en intereses.',
        'Dos estrategias populares son el método avalancha (pagar primero la tasa más alta) y el método bola de nieve (pagar primero el saldo más pequeño). Cuanto más pagues por encima del mínimo, más rápido eliminas la deuda.'
      ],
      faq: [
        { q: '¿Cómo se calculan los intereses mensuales?', a: 'Se divide la tasa anual entre 12 y se multiplica por el saldo actual. Por ejemplo, 18% APR sobre $5,000 equivale a $75 de intereses ese mes.' },
        { q: '¿Por qué la mayor parte del pago inicial va a intereses?', a: 'Porque los intereses se calculan sobre el saldo restante, que es máximo al inicio. A medida que reduces el capital, más va a reducir la deuda.' },
        { q: '¿Cuánto puedo ahorrar con pagos extra?', a: 'Depende del saldo, tasa y monto extra. Incluso pequeñas adiciones se acumulan con el tiempo. Usa la función de comparación para ver ahorros exactos.' },
        { q: '¿Qué pasa si mi pago es menor que los intereses mensuales?', a: 'Tu deuda crecerá (amortización negativa). La calculadora te avisará si esto ocurre. Debes pagar al menos los intereses mensuales.' },
        { q: '¿Se almacenan mis datos financieros?', a: 'No. Todos los cálculos ocurren en tu navegador. Ningún dato se envía a servidores.' }
      ]
    },
    fr: {
      title: 'Comment Calculer votre Plan de Remboursement et Économiser sur les Intérêts',
      paragraphs: [
        'Rembourser ses dettes peut sembler écrasant, mais comprendre votre calendrier de remboursement est la première étape vers la liberté financière. Un calculateur de remboursement montre exactement combien de temps il faudra pour être libre de dettes et combien d\'intérêts vous paierez.',
        'Les données clés sont le solde total de la dette, le taux d\'intérêt annuel (TAEG) et le montant du paiement mensuel. Le calculateur génère un échéancier d\'amortissement mois par mois montrant comment chaque paiement se répartit entre capital et intérêts.',
        'Ajouter même un petit paiement supplémentaire mensuel peut réduire considérablement le délai et les intérêts totaux. Par exemple, ajouter seulement 50 euros par mois à une dette de 10 000 euros à 18% peut vous faire économiser des milliers en intérêts.',
        'Deux stratégies populaires sont la méthode avalanche (payer d\'abord le taux le plus élevé) et la méthode boule de neige (payer d\'abord le plus petit solde). Plus vous payez au-dessus du minimum, plus vite vous éliminez la dette.'
      ],
      faq: [
        { q: 'Comment les intérêts mensuels sont-ils calculés ?', a: 'On divise le taux annuel par 12 et on multiplie par le solde actuel. Par exemple, 18% TAEG sur 5 000 euros signifie 75 euros d\'intérêts ce mois-là.' },
        { q: 'Pourquoi la majeure partie du paiement initial va aux intérêts ?', a: 'Parce que les intérêts sont calculés sur le solde restant, qui est le plus élevé au début. Au fur et à mesure que vous réduisez le capital, plus va à la réduction de la dette.' },
        { q: 'Combien puis-je économiser avec des paiements supplémentaires ?', a: 'Cela dépend du solde, du taux et du montant supplémentaire. Même de petits ajouts s\'accumulent. Utilisez la comparaison pour voir les économies exactes.' },
        { q: 'Que se passe-t-il si mon paiement est inférieur aux intérêts mensuels ?', a: 'Votre dette augmentera (amortissement négatif). Le calculateur vous avertira si cela se produit. Vous devez payer au moins les intérêts mensuels.' },
        { q: 'Mes données financières sont-elles stockées ?', a: 'Non. Tous les calculs se font dans votre navigateur. Aucune donnée n\'est envoyée à un serveur.' }
      ]
    },
    de: {
      title: 'So Berechnen Sie Ihren Schulden-Tilgungsplan und Sparen Zinsen',
      paragraphs: [
        'Schulden abzubezahlen kann überwältigend wirken, aber Ihren Tilgungszeitplan zu verstehen ist der erste Schritt zur finanziellen Freiheit. Ein Schulden-Tilgungsrechner zeigt genau, wie lange es dauert, schuldenfrei zu werden und wie viel Zinsen Sie zahlen.',
        'Die wichtigsten Eingaben sind der Gesamtschuldenbetrag, der jährliche Zinssatz (APR) und die monatliche Zahlung. Der Rechner erstellt einen monatlichen Tilgungsplan, der zeigt, wie jede Zahlung zwischen Tilgung und Zinsen aufgeteilt wird.',
        'Selbst eine kleine zusätzliche monatliche Zahlung kann die Tilgungsdauer und Gesamtzinsen drastisch reduzieren. Beispielsweise können 50 Euro mehr pro Monat bei 10.000 Euro Schulden mit 18% Zinsen Tausende an Zinsen sparen.',
        'Zwei beliebte Strategien sind die Lawinenmethode (höchsten Zinssatz zuerst) und die Schneeballmethode (kleinsten Saldo zuerst). Je mehr Sie über das Minimum hinaus zahlen, desto schneller werden Sie schuldenfrei.'
      ],
      faq: [
        { q: 'Wie werden monatliche Zinsen berechnet?', a: 'Der Jahreszins wird durch 12 geteilt und mit dem aktuellen Saldo multipliziert. Beispielsweise bedeuten 18% APR auf 5.000 Euro 75 Euro Zinsen in diesem Monat.' },
        { q: 'Warum geht der Großteil der anfänglichen Zahlung an Zinsen?', a: 'Weil Zinsen auf den Restsaldo berechnet werden, der am Anfang am höchsten ist. Mit abnehmendem Kapital fließt mehr in die Schuldenreduktion.' },
        { q: 'Wie viel kann ich mit Zusatzzahlungen sparen?', a: 'Das hängt von Saldo, Zinssatz und Zusatzbetrag ab. Selbst kleine Beträge summieren sich. Nutzen Sie den Vergleich für genaue Ersparnisse.' },
        { q: 'Was passiert, wenn meine Zahlung unter den monatlichen Zinsen liegt?', a: 'Ihre Schulden wachsen (negative Tilgung). Der Rechner warnt Sie, falls dies eintritt. Sie müssen mindestens die monatlichen Zinsen zahlen.' },
        { q: 'Werden meine Finanzdaten gespeichert?', a: 'Nein. Alle Berechnungen erfolgen in Ihrem Browser. Keine Daten werden an Server gesendet.' }
      ]
    },
    pt: {
      title: 'Como Calcular seu Plano de Quitação de Dívida e Economizar em Juros',
      paragraphs: [
        'Quitar dívidas pode parecer assustador, mas entender seu cronograma de pagamento é o primeiro passo para a liberdade financeira. Uma calculadora de quitação mostra exatamente quanto tempo levará para ficar livre de dívidas e quantos juros você pagará.',
        'Os dados principais são o saldo total da dívida, a taxa de juros anual (APR) e o valor do pagamento mensal. A calculadora gera um cronograma de amortização mês a mês mostrando como cada pagamento se divide entre principal e juros.',
        'Adicionar até mesmo um pequeno pagamento extra mensal pode reduzir drasticamente o prazo e os juros totais. Por exemplo, adicionar apenas R$50 por mês a uma dívida de R$10.000 a 18% pode economizar milhares em juros.',
        'Duas estratégias populares são o método avalanche (pagar primeiro a taxa mais alta) e o método bola de neve (pagar primeiro o menor saldo). Quanto mais você paga acima do mínimo, mais rápido elimina a dívida.'
      ],
      faq: [
        { q: 'Como os juros mensais são calculados?', a: 'A taxa anual é dividida por 12 e multiplicada pelo saldo atual. Por exemplo, 18% APR sobre R$5.000 resulta em R$75 de juros naquele mês.' },
        { q: 'Por que a maior parte do pagamento inicial vai para juros?', a: 'Porque os juros são calculados sobre o saldo restante, que é máximo no início. À medida que você reduz o principal, mais vai para reduzir a dívida.' },
        { q: 'Quanto posso economizar com pagamentos extras?', a: 'Depende do saldo, taxa e valor extra. Mesmo pequenas adições se acumulam. Use a comparação para ver economias exatas.' },
        { q: 'O que acontece se meu pagamento for menor que os juros mensais?', a: 'Sua dívida crescerá (amortização negativa). A calculadora avisará se isso ocorrer. Você precisa pagar pelo menos os juros mensais.' },
        { q: 'Meus dados financeiros são armazenados?', a: 'Não. Todos os cálculos ocorrem no seu navegador. Nenhum dado é enviado a servidores.' }
      ]
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="debt-payoff-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.totalDebt[lang]}</label>
            <input type="number" min="0" step="100" value={debt} onChange={(e) => setDebt(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" placeholder="e.g. 10000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.interestRate[lang]}</label>
            <input type="number" min="0" max="100" step="0.1" value={apr} onChange={(e) => setApr(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" placeholder="e.g. 18" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.minPayment[lang]}</label>
            <input type="number" min="0" step="10" value={minPayment} onChange={(e) => setMinPayment(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" placeholder="e.g. 250" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.extraPayment[lang]}</label>
            <input type="number" min="0" step="10" value={extraPayment} onChange={(e) => setExtraPayment(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" placeholder="e.g. 100" />
          </div>

          {/* Results */}
          {primary ? (
            <div className="space-y-4 pt-2">
              {/* Main result cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-center shadow-sm">
                  <div className="text-xs text-white/80 font-medium">{labels.monthsToPayoff[lang]}</div>
                  <div className="text-3xl font-bold text-white mt-1">{primary.months}</div>
                  <div className="text-xs text-white/60">{labels.months[lang]}</div>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-center shadow-sm">
                  <div className="text-xs text-white/80 font-medium">{labels.totalInterest[lang]}</div>
                  <div className="text-2xl font-bold text-white mt-1">${fmt(primary.totalInterest)}</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-center shadow-sm">
                  <div className="text-xs text-white/80 font-medium">{labels.totalPaid[lang]}</div>
                  <div className="text-2xl font-bold text-white mt-1">${fmt(primary.totalPaid)}</div>
                </div>
              </div>

              {/* Comparison */}
              {comparison && calculate?.withExtra && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-emerald-800">{labels.savings[lang]}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">{labels.withoutExtra[lang]}</div>
                      <div className="font-bold text-gray-900">{comparison.months} {labels.months[lang]}</div>
                      <div className="text-gray-600">${fmt(comparison.totalInterest)} {labels.inInterest[lang]}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">{labels.withExtra[lang]}</div>
                      <div className="font-bold text-emerald-700">{calculate.withExtra.months} {labels.months[lang]}</div>
                      <div className="text-emerald-600">${fmt(calculate.withExtra.totalInterest)} {labels.inInterest[lang]}</div>
                    </div>
                  </div>
                  <div className="bg-emerald-100 rounded-lg p-3 text-center">
                    <span className="text-emerald-800 font-bold text-lg">
                      {labels.fasterBy[lang]} {comparison.months - calculate.withExtra.months} {labels.months[lang]}
                    </span>
                    <span className="text-emerald-600 block text-sm">
                      ${fmt(comparison.totalInterest - calculate.withExtra.totalInterest)} {labels.inInterest[lang]}
                    </span>
                  </div>
                </div>
              )}

              {/* Amortization table */}
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{labels.amortization[lang]}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-2 py-2 text-left font-medium text-gray-600">{labels.month[lang]}</th>
                        <th className="px-2 py-2 text-right font-medium text-gray-600">{labels.payment[lang]}</th>
                        <th className="px-2 py-2 text-right font-medium text-gray-600">{labels.principal[lang]}</th>
                        <th className="px-2 py-2 text-right font-medium text-gray-600">{labels.interest[lang]}</th>
                        <th className="px-2 py-2 text-right font-medium text-gray-600">{labels.balance[lang]}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getVisibleRows(primary.rows).map((row, idx, arr) => {
                        const prevRow = idx > 0 ? arr[idx - 1] : null;
                        const showGap = prevRow && row.month - prevRow.month > 1;
                        return (
                          <tr key={row.month}>
                            {showGap ? (
                              <td colSpan={5} className="px-2 py-1 text-center text-gray-400 border-t border-dashed">...</td>
                            ) : null}
                            {!showGap ? (
                              <>
                                <td className="px-2 py-1.5 border-t border-gray-100">{row.month}</td>
                                <td className="px-2 py-1.5 border-t border-gray-100 text-right">${fmt(row.payment)}</td>
                                <td className="px-2 py-1.5 border-t border-gray-100 text-right text-green-600">${fmt(row.principal)}</td>
                                <td className="px-2 py-1.5 border-t border-gray-100 text-right text-red-500">${fmt(row.interest)}</td>
                                <td className="px-2 py-1.5 border-t border-gray-100 text-right font-medium">${fmt(row.balance)}</td>
                              </>
                            ) : null}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {primary.rows.length > 15 && (
                  <button onClick={() => setShowFullTable(!showFullTable)} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    {showFullTable ? labels.showLess[lang] : labels.showAll[lang]}
                  </button>
                )}
              </div>
            </div>
          ) : calculate?.withoutExtra === null ? (
            <div className="text-center text-red-500 py-4 text-sm">{labels.tooLow[lang]}</div>
          ) : (
            <div className="text-center text-gray-400 py-6 text-sm">{labels.enterValues[lang]}</div>
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
                  <span className="text-gray-400">{openFaq === i ? '\u2212' : '+'}</span>
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
