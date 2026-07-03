'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function NetWorthCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['net-worth-calculator'][lang];

  const [cash, setCash] = useState('');
  const [investments, setInvestments] = useState('');
  const [realEstate, setRealEstate] = useState('');
  const [vehicles, setVehicles] = useState('');
  const [otherAssets, setOtherAssets] = useState('');
  const [mortgage, setMortgage] = useState('');
  const [loans, setLoans] = useState('');
  const [creditCard, setCreditCard] = useState('');
  const [otherDebt, setOtherDebt] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const assetVals = [cash, investments, realEstate, vehicles, otherAssets].map(
    (v) => parseFloat(v) || 0
  );
  const liabVals = [mortgage, loans, creditCard, otherDebt].map((v) => parseFloat(v) || 0);
  const totalAssets = assetVals.reduce((a, b) => a + b, 0);
  const totalLiabilities = liabVals.reduce((a, b) => a + b, 0);
  const netWorth = totalAssets - totalLiabilities;

  const labels = {
    assets: {
      en: 'Assets',
      it: 'Attività',
      es: 'Activos',
      fr: 'Actifs',
      de: 'Vermögenswerte',
      pt: 'Ativos',
    },
    liabilities: {
      en: 'Liabilities',
      it: 'Passività',
      es: 'Pasivos',
      fr: 'Passifs',
      de: 'Verbindlichkeiten',
      pt: 'Passivos',
    },
    cash: {
      en: 'Cash & Savings ($)',
      it: 'Contanti e Risparmi (€)',
      es: 'Efectivo y Ahorros ($)',
      fr: 'Liquidités et Épargne (€)',
      de: 'Bargeld und Ersparnisse (€)',
      pt: 'Dinheiro e Poupança (R$)',
    },
    investments: {
      en: 'Investments ($)',
      it: 'Investimenti (€)',
      es: 'Inversiones ($)',
      fr: 'Investissements (€)',
      de: 'Investitionen (€)',
      pt: 'Investimentos (R$)',
    },
    realEstate: {
      en: 'Real Estate ($)',
      it: 'Immobili (€)',
      es: 'Bienes Raíces ($)',
      fr: 'Immobilier (€)',
      de: 'Immobilien (€)',
      pt: 'Imóveis (R$)',
    },
    vehicles: {
      en: 'Vehicles ($)',
      it: 'Veicoli (€)',
      es: 'Vehículos ($)',
      fr: 'Véhicules (€)',
      de: 'Fahrzeuge (€)',
      pt: 'Veículos (R$)',
    },
    otherAssets: {
      en: 'Other Assets ($)',
      it: 'Altre Attività (€)',
      es: 'Otros Activos ($)',
      fr: 'Autres Actifs (€)',
      de: 'Sonstige Vermögenswerte (€)',
      pt: 'Outros Ativos (R$)',
    },
    mortgage: {
      en: 'Mortgage ($)',
      it: 'Mutuo (€)',
      es: 'Hipoteca ($)',
      fr: 'Hypothèque (€)',
      de: 'Hypothek (€)',
      pt: 'Hipoteca (R$)',
    },
    loans: {
      en: 'Loans ($)',
      it: 'Prestiti (€)',
      es: 'Préstamos ($)',
      fr: 'Prêts (€)',
      de: 'Kredite (€)',
      pt: 'Empréstimos (R$)',
    },
    creditCard: {
      en: 'Credit Card Debt ($)',
      it: 'Debiti Carta di Credito (€)',
      es: 'Deuda de Tarjeta ($)',
      fr: 'Dette de Carte de Crédit (€)',
      de: 'Kreditkartenschulden (€)',
      pt: 'Dívida de Cartão (R$)',
    },
    otherDebt: {
      en: 'Other Debts ($)',
      it: 'Altri Debiti (€)',
      es: 'Otras Deudas ($)',
      fr: 'Autres Dettes (€)',
      de: 'Sonstige Schulden (€)',
      pt: 'Outras Dívidas (R$)',
    },
    netWorth: {
      en: 'Net Worth',
      it: 'Patrimonio Netto',
      es: 'Patrimonio Neto',
      fr: 'Valeur Nette',
      de: 'Nettovermögen',
      pt: 'Patrimônio Líquido',
    },
    totalAssets: {
      en: 'Total Assets',
      it: 'Attività Totali',
      es: 'Activos Totales',
      fr: 'Actifs Totaux',
      de: 'Gesamtvermögen',
      pt: 'Ativos Totais',
    },
    totalLiabilities: {
      en: 'Total Liabilities',
      it: 'Passività Totali',
      es: 'Pasivos Totales',
      fr: 'Passifs Totaux',
      de: 'Gesamtverbindlichkeiten',
      pt: 'Passivos Totais',
    },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'Free Net Worth Calculator — Track Your Wealth and Financial Health',
      paragraphs: [
        'The Net Worth Calculator gives you a clear snapshot of your financial position by subtracting everything you owe from everything you own. Your net worth is simply total assets minus total liabilities, and it is the single most reliable measure of your overall financial health.',
        'On the assets side, add up your cash and savings, investments, real estate, vehicles, and any other valuables. On the liabilities side, include your mortgage, personal loans, credit card debt, and any other outstanding obligations. The difference between the two is your net worth.',
        'A positive net worth means you own more than you owe, while a negative net worth signals that debt outweighs assets. Tracking this number over time is far more meaningful than any single monthly snapshot, because it reveals whether your wealth is genuinely growing.',
        'Recalculate your net worth every few months to monitor progress, spot trends, and make smarter decisions about saving, investing, and paying down debt. Small consistent improvements compound into significant long-term wealth.',
      ],
      faq: [
        {
          q: 'What is net worth?',
          a: 'Net worth is the total value of everything you own (assets) minus everything you owe (liabilities). It is the clearest single measure of your financial health.',
        },
        {
          q: 'What counts as an asset?',
          a: 'Assets include cash, savings, investments, retirement accounts, real estate, vehicles, and other valuables you could convert to cash.',
        },
        {
          q: 'Is a negative net worth bad?',
          a: 'A negative net worth is common for young people or recent graduates with student loans. The important thing is that the number improves over time.',
        },
        {
          q: 'How often should I calculate my net worth?',
          a: 'Calculating it every three to six months is ideal. Frequent tracking helps you see trends and stay motivated toward your financial goals.',
        },
      ],
    },
    it: {
      title: 'Calcolatore di Patrimonio Netto Gratuito — Monitora la Tua Ricchezza',
      paragraphs: [
        'Il Calcolatore di Patrimonio Netto ti offre una fotografia chiara della tua situazione finanziaria sottraendo tutto ciò che devi da tutto ciò che possiedi. Il patrimonio netto è semplicemente il totale delle attività meno il totale delle passività.',
        'Dal lato delle attività, somma contanti e risparmi, investimenti, immobili, veicoli e altri beni di valore. Dal lato delle passività, includi mutuo, prestiti personali, debiti della carta di credito e altre obbligazioni in essere.',
        'Un patrimonio netto positivo significa che possiedi più di quanto devi, mentre un valore negativo indica che i debiti superano le attività. Monitorare questo numero nel tempo è molto più utile di una singola istantanea mensile.',
        'Ricalcola il tuo patrimonio netto ogni pochi mesi per seguire i progressi, individuare tendenze e prendere decisioni più sagge su risparmio, investimenti e riduzione dei debiti.',
      ],
      faq: [
        {
          q: "Cos'è il patrimonio netto?",
          a: 'Il patrimonio netto è il valore totale di tutto ciò che possiedi (attività) meno tutto ciò che devi (passività). È la misura più chiara della salute finanziaria.',
        },
        {
          q: 'Cosa conta come attività?',
          a: 'Le attività includono contanti, risparmi, investimenti, conti pensionistici, immobili, veicoli e altri beni convertibili in denaro.',
        },
        {
          q: 'Un patrimonio netto negativo è negativo?',
          a: "Un patrimonio netto negativo è comune per i giovani o i neolaureati con prestiti studenteschi. L'importante è che il valore migliori nel tempo.",
        },
        {
          q: 'Ogni quanto dovrei calcolare il patrimonio netto?',
          a: 'Calcolarlo ogni tre-sei mesi è ideale. Un monitoraggio frequente aiuta a vedere le tendenze e a restare motivati.',
        },
      ],
    },
    es: {
      title: 'Calculadora de Patrimonio Neto Gratis — Controla tu Riqueza',
      paragraphs: [
        'La Calculadora de Patrimonio Neto te ofrece una imagen clara de tu situación financiera restando todo lo que debes de todo lo que posees. El patrimonio neto es simplemente el total de activos menos el total de pasivos.',
        'En el lado de los activos, suma tu efectivo y ahorros, inversiones, bienes raíces, vehículos y otros bienes de valor. En el lado de los pasivos, incluye la hipoteca, préstamos personales, deuda de tarjeta de crédito y otras obligaciones pendientes.',
        'Un patrimonio neto positivo significa que posees más de lo que debes, mientras que un valor negativo indica que las deudas superan los activos. Seguir este número a lo largo del tiempo es mucho más revelador que una sola instantánea mensual.',
        'Recalcula tu patrimonio neto cada pocos meses para vigilar tu progreso, detectar tendencias y tomar mejores decisiones sobre ahorro, inversión y reducción de deudas.',
      ],
      faq: [
        {
          q: '¿Qué es el patrimonio neto?',
          a: 'El patrimonio neto es el valor total de todo lo que posees (activos) menos todo lo que debes (pasivos). Es la medida más clara de la salud financiera.',
        },
        {
          q: '¿Qué cuenta como activo?',
          a: 'Los activos incluyen efectivo, ahorros, inversiones, cuentas de jubilación, bienes raíces, vehículos y otros bienes convertibles en dinero.',
        },
        {
          q: '¿Es malo un patrimonio neto negativo?',
          a: 'Un patrimonio neto negativo es común en jóvenes o recién graduados con préstamos estudiantiles. Lo importante es que la cifra mejore con el tiempo.',
        },
        {
          q: '¿Con qué frecuencia debo calcular mi patrimonio neto?',
          a: 'Calcularlo cada tres a seis meses es ideal. El seguimiento frecuente ayuda a ver tendencias y a mantener la motivación.',
        },
      ],
    },
    fr: {
      title: 'Calculateur de Valeur Nette Gratuit — Suivez votre Patrimoine',
      paragraphs: [
        'Le Calculateur de Valeur Nette vous donne un aperçu clair de votre situation financière en soustrayant tout ce que vous devez de tout ce que vous possédez. La valeur nette correspond simplement au total des actifs moins le total des passifs.',
        'Du côté des actifs, additionnez vos liquidités et votre épargne, vos investissements, votre immobilier, vos véhicules et tout autre bien de valeur. Du côté des passifs, incluez votre hypothèque, vos prêts personnels, vos dettes de carte de crédit et autres obligations en cours.',
        "Une valeur nette positive signifie que vous possédez plus que vous ne devez, tandis qu'une valeur négative indique que les dettes dépassent les actifs. Suivre ce chiffre dans le temps est bien plus parlant qu'un simple instantané mensuel.",
        "Recalculez votre valeur nette tous les quelques mois pour suivre vos progrès, repérer les tendances et prendre de meilleures décisions concernant l'épargne, l'investissement et le remboursement des dettes.",
      ],
      faq: [
        {
          q: "Qu'est-ce que la valeur nette ?",
          a: "La valeur nette est la valeur totale de tout ce que vous possédez (actifs) moins tout ce que vous devez (passifs). C'est la mesure la plus claire de la santé financière.",
        },
        {
          q: "Qu'est-ce qui compte comme actif ?",
          a: "Les actifs comprennent les liquidités, l'épargne, les investissements, les comptes de retraite, l'immobilier, les véhicules et autres biens convertibles en argent.",
        },
        {
          q: 'Une valeur nette négative est-elle mauvaise ?',
          a: "Une valeur nette négative est courante chez les jeunes ou les jeunes diplômés ayant des prêts étudiants. L'essentiel est que le chiffre s'améliore avec le temps.",
        },
        {
          q: 'À quelle fréquence dois-je calculer ma valeur nette ?',
          a: 'La calculer tous les trois à six mois est idéal. Un suivi fréquent aide à voir les tendances et à rester motivé.',
        },
      ],
    },
    de: {
      title: 'Kostenloser Nettovermögen-Rechner — Verfolgen Sie Ihr Vermögen',
      paragraphs: [
        'Der Nettovermögen-Rechner gibt Ihnen einen klaren Überblick über Ihre finanzielle Lage, indem er alles, was Sie schulden, von allem abzieht, was Sie besitzen. Das Nettovermögen ist einfach die Summe der Vermögenswerte abzüglich der Summe der Verbindlichkeiten.',
        'Auf der Vermögensseite addieren Sie Bargeld und Ersparnisse, Investitionen, Immobilien, Fahrzeuge und andere Wertgegenstände. Auf der Verbindlichkeitsseite zählen Sie Hypothek, Privatkredite, Kreditkartenschulden und andere offene Verpflichtungen dazu.',
        'Ein positives Nettovermögen bedeutet, dass Sie mehr besitzen als Sie schulden, während ein negativer Wert darauf hinweist, dass die Schulden die Vermögenswerte übersteigen. Diesen Wert über die Zeit zu verfolgen ist weitaus aussagekräftiger als eine einzelne monatliche Momentaufnahme.',
        'Berechnen Sie Ihr Nettovermögen alle paar Monate neu, um Fortschritte zu überwachen, Trends zu erkennen und klarere Entscheidungen über Sparen, Investieren und Schuldenabbau zu treffen.',
      ],
      faq: [
        {
          q: 'Was ist das Nettovermögen?',
          a: 'Das Nettovermögen ist der Gesamtwert von allem, was Sie besitzen (Vermögenswerte), abzüglich allem, was Sie schulden (Verbindlichkeiten). Es ist das klarste Maß für die finanzielle Gesundheit.',
        },
        {
          q: 'Was zählt als Vermögenswert?',
          a: 'Vermögenswerte umfassen Bargeld, Ersparnisse, Investitionen, Rentenkonten, Immobilien, Fahrzeuge und andere in Geld umwandelbare Güter.',
        },
        {
          q: 'Ist ein negatives Nettovermögen schlecht?',
          a: 'Ein negatives Nettovermögen ist bei jungen Menschen oder Absolventen mit Studienkrediten üblich. Wichtig ist, dass sich der Wert mit der Zeit verbessert.',
        },
        {
          q: 'Wie oft sollte ich mein Nettovermögen berechnen?',
          a: 'Alle drei bis sechs Monate ist ideal. Häufiges Verfolgen hilft, Trends zu erkennen und motiviert zu bleiben.',
        },
      ],
    },
    pt: {
      title: 'Calculadora de Patrimônio Líquido Grátis — Acompanhe sua Riqueza',
      paragraphs: [
        'A Calculadora de Patrimônio Líquido oferece uma visão clara da sua situação financeira subtraindo tudo o que você deve de tudo o que possui. O patrimônio líquido é simplesmente o total de ativos menos o total de passivos.',
        'No lado dos ativos, some seu dinheiro e poupança, investimentos, imóveis, veículos e outros bens de valor. No lado dos passivos, inclua a hipoteca, empréstimos pessoais, dívida de cartão de crédito e outras obrigações pendentes.',
        'Um patrimônio líquido positivo significa que você possui mais do que deve, enquanto um valor negativo indica que as dívidas superam os ativos. Acompanhar esse número ao longo do tempo é muito mais revelador do que uma única fotografia mensal.',
        'Recalcule seu patrimônio líquido a cada poucos meses para monitorar o progresso, identificar tendências e tomar decisões mais inteligentes sobre poupança, investimento e redução de dívidas.',
      ],
      faq: [
        {
          q: 'O que é patrimônio líquido?',
          a: 'O patrimônio líquido é o valor total de tudo o que você possui (ativos) menos tudo o que você deve (passivos). É a medida mais clara da saúde financeira.',
        },
        {
          q: 'O que conta como ativo?',
          a: 'Os ativos incluem dinheiro, poupança, investimentos, contas de aposentadoria, imóveis, veículos e outros bens conversíveis em dinheiro.',
        },
        {
          q: 'Um patrimônio líquido negativo é ruim?',
          a: 'Um patrimônio líquido negativo é comum entre jovens ou recém-formados com empréstimos estudantis. O importante é que o valor melhore com o tempo.',
        },
        {
          q: 'Com que frequência devo calcular meu patrimônio líquido?',
          a: 'Calculá-lo a cada três a seis meses é ideal. O acompanhamento frequente ajuda a ver tendências e a manter a motivação.',
        },
      ],
    },
  };

  const seo = seoContent[lang];
  const formatCurrency = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <ToolPageWrapper toolSlug="net-worth-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{labels.assets[lang]}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.cash[lang]}
              </label>
              <input
                type="number"
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.investments[lang]}
              </label>
              <input
                type="number"
                value={investments}
                onChange={(e) => setInvestments(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.realEstate[lang]}
              </label>
              <input
                type="number"
                value={realEstate}
                onChange={(e) => setRealEstate(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.vehicles[lang]}
              </label>
              <input
                type="number"
                value={vehicles}
                onChange={(e) => setVehicles(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.otherAssets[lang]}
              </label>
              <input
                type="number"
                value={otherAssets}
                onChange={(e) => setOtherAssets(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 pt-2">{labels.liabilities[lang]}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.mortgage[lang]}
              </label>
              <input
                type="number"
                value={mortgage}
                onChange={(e) => setMortgage(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.loans[lang]}
              </label>
              <input
                type="number"
                value={loans}
                onChange={(e) => setLoans(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.creditCard[lang]}
              </label>
              <input
                type="number"
                value={creditCard}
                onChange={(e) => setCreditCard(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.otherDebt[lang]}
              </label>
              <input
                type="number"
                value={otherDebt}
                onChange={(e) => setOtherDebt(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {(totalAssets > 0 || totalLiabilities > 0) && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">
                  {labels.netWorth[lang]}
                </div>
                <div
                  className={`text-4xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  ${formatCurrency(netWorth)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">{labels.totalAssets[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">
                    ${formatCurrency(totalAssets)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">{labels.totalLiabilities[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">
                    ${formatCurrency(totalLiabilities)}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-4">
              {p}
            </p>
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
