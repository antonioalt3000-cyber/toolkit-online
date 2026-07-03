'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function Retirement401kCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['401k-calculator'][lang];

  const [currentBalance, setCurrentBalance] = useState('');
  const [annualSalary, setAnnualSalary] = useState('');
  const [contributionPct, setContributionPct] = useState('6');
  const [employerMatchPct, setEmployerMatchPct] = useState('3');
  const [annualReturnPct, setAnnualReturnPct] = useState('7');
  const [yearsToRetirement, setYearsToRetirement] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const bal = parseFloat(currentBalance) || 0;
  const salary = parseFloat(annualSalary) || 0;
  const cPct = parseFloat(contributionPct) || 0;
  const mPct = parseFloat(employerMatchPct) || 0;
  const rate = (parseFloat(annualReturnPct) || 0) / 100 / 12;
  const n = (parseInt(yearsToRetirement) || 0) * 12;

  const monthlyContribution = (salary * (cPct / 100)) / 12;
  const monthlyMatch = (salary * (mPct / 100)) / 12;
  const growth = Math.pow(1 + rate, n);
  const fvCurrent = bal * growth;
  const fvContribs =
    rate > 0
      ? (monthlyContribution + monthlyMatch) * ((growth - 1) / rate)
      : (monthlyContribution + monthlyMatch) * n;
  const projectedBalance = fvCurrent + fvContribs;
  const totalYourContrib = monthlyContribution * n;
  const totalEmployerMatch = monthlyMatch * n;
  const investmentGrowth = projectedBalance - bal - totalYourContrib - totalEmployerMatch;

  const labels = {
    currentBalance: {
      en: 'Current 401(k) Balance ($)',
      it: 'Saldo 401(k) Attuale ($)',
      es: 'Saldo Actual del 401(k) ($)',
      fr: 'Solde 401(k) Actuel ($)',
      de: 'Aktueller 401(k)-Kontostand ($)',
      pt: 'Saldo Atual do 401(k) ($)',
    },
    annualSalary: {
      en: 'Annual Salary ($)',
      it: 'Stipendio Annuo ($)',
      es: 'Salario Anual ($)',
      fr: 'Salaire Annuel ($)',
      de: 'Jahresgehalt ($)',
      pt: 'Salário Anual ($)',
    },
    contributionPct: {
      en: 'Your Contribution (%)',
      it: 'Il Tuo Contributo (%)',
      es: 'Tu Aportación (%)',
      fr: 'Votre Cotisation (%)',
      de: 'Ihr Beitrag (%)',
      pt: 'Sua Contribuição (%)',
    },
    employerMatchPct: {
      en: 'Employer Match (% of salary)',
      it: 'Contributo Datore (% dello stipendio)',
      es: 'Aportación del Empleador (% del salario)',
      fr: 'Abondement Employeur (% du salaire)',
      de: 'Arbeitgeberzuschuss (% des Gehalts)',
      pt: 'Contrapartida do Empregador (% do salário)',
    },
    annualReturnPct: {
      en: 'Annual Return (%)',
      it: 'Rendimento Annuo (%)',
      es: 'Rendimiento Anual (%)',
      fr: 'Rendement Annuel (%)',
      de: 'Jährliche Rendite (%)',
      pt: 'Retorno Anual (%)',
    },
    yearsToRetirement: {
      en: 'Years to Retirement',
      it: 'Anni alla Pensione',
      es: 'Años hasta la Jubilación',
      fr: 'Années avant la Retraite',
      de: 'Jahre bis zur Rente',
      pt: 'Anos até a Aposentadoria',
    },
    projectedBalance: {
      en: 'Projected Balance at Retirement',
      it: 'Saldo Previsto alla Pensione',
      es: 'Saldo Proyectado en la Jubilación',
      fr: 'Solde Prévu à la Retraite',
      de: 'Voraussichtlicher Kontostand bei Rente',
      pt: 'Saldo Projetado na Aposentadoria',
    },
    yourContributions: {
      en: 'Your Contributions',
      it: 'I Tuoi Contributi',
      es: 'Tus Aportaciones',
      fr: 'Vos Cotisations',
      de: 'Ihre Beiträge',
      pt: 'Suas Contribuições',
    },
    employerMatch: {
      en: 'Employer Match',
      it: 'Contributo Datore',
      es: 'Aportación del Empleador',
      fr: 'Abondement Employeur',
      de: 'Arbeitgeberzuschuss',
      pt: 'Contrapartida do Empregador',
    },
    investmentGrowth: {
      en: 'Investment Growth',
      it: 'Crescita Investimento',
      es: 'Crecimiento de la Inversión',
      fr: "Croissance de l'Investissement",
      de: 'Anlagewachstum',
      pt: 'Crescimento do Investimento',
    },
    breakdown: {
      en: 'Breakdown',
      it: 'Dettaglio',
      es: 'Desglose',
      fr: 'Détail',
      de: 'Aufschlüsselung',
      pt: 'Detalhamento',
    },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'Free 401(k) Calculator — Project Your Retirement Savings Growth',
      paragraphs: [
        'The 401(k) Calculator helps you estimate how much your employer-sponsored retirement account could be worth by the time you retire. By entering your current balance, salary, contribution rate, employer match, expected annual return, and years to retirement, you get a clear projection of your future nest egg.',
        'One of the biggest advantages of a 401(k) is the employer match. Many companies match a percentage of your salary when you contribute, which is essentially free money. Contributing at least enough to capture the full match should be a priority, because leaving it on the table means giving up guaranteed returns.',
        'Compound growth is what turns steady contributions into real wealth. Because your investment gains are reinvested and earn their own returns month after month, even modest contributions can grow substantially over 20 or 30 years. Starting early gives compounding more time to work, which is why the years-to-retirement figure has such a large impact on the final balance.',
        'Use this calculator to test different scenarios: raise your contribution percentage, adjust the expected return, or extend your timeline to see how each change affects your projected retirement savings. Small increases today can translate into tens of thousands of dollars more at retirement.',
      ],
      faq: [
        {
          q: 'How much should I contribute to my 401(k)?',
          a: 'A common guideline is 10-15% of your salary, but at minimum you should contribute enough to receive your full employer match. Increase your rate over time as your income grows.',
        },
        {
          q: 'What is an employer match?',
          a: 'An employer match is money your company adds to your 401(k) based on your own contributions, often up to 3-6% of your salary. It is effectively free money and an instant return on your savings.',
        },
        {
          q: 'What annual return should I assume?',
          a: 'Historically, diversified stock market portfolios have averaged around 7% annually after inflation over the long term. A 6-8% assumption is reasonable, though returns vary year to year.',
        },
        {
          q: 'Does this calculator account for compound growth?',
          a: 'Yes. It compounds your balance and contributions monthly using your expected return, showing how much of your final balance comes from investment growth versus contributions.',
        },
      ],
    },
    it: {
      title: 'Calcolatore 401(k) Gratuito — Proietta la Crescita dei Tuoi Risparmi Pensionistici',
      paragraphs: [
        'Il Calcolatore 401(k) ti aiuta a stimare quanto potrà valere il tuo conto pensionistico aziendale al momento del pensionamento. Inserendo saldo attuale, stipendio, percentuale di contributo, contributo del datore di lavoro, rendimento annuo previsto e anni alla pensione, ottieni una proiezione chiara del tuo capitale futuro.',
        "Uno dei maggiori vantaggi di un 401(k) è il contributo del datore di lavoro. Molte aziende integrano una percentuale del tuo stipendio quando contribuisci: sono di fatto denaro gratuito. Contribuire almeno quanto basta per ottenere l'intero contributo aziendale dovrebbe essere una priorità, perché rinunciarvi significa perdere rendimenti garantiti.",
        'La crescita composta è ciò che trasforma contributi costanti in vera ricchezza. Poiché i guadagni vengono reinvestiti e generano a loro volta rendimenti mese dopo mese, anche contributi modesti possono crescere in modo significativo in 20 o 30 anni. Iniziare presto dà più tempo alla capitalizzazione, ed è per questo che gli anni alla pensione incidono così tanto sul saldo finale.',
        "Usa questo calcolatore per testare scenari diversi: aumenta la percentuale di contributo, modifica il rendimento previsto o allunga l'orizzonte temporale per vedere come ogni cambiamento influisce sui tuoi risparmi pensionistici. Piccoli aumenti oggi possono tradursi in decine di migliaia di dollari in più alla pensione.",
      ],
      faq: [
        {
          q: 'Quanto dovrei versare nel mio 401(k)?',
          a: "Una linea guida comune è il 10-15% dello stipendio, ma come minimo dovresti versare quanto basta per ricevere l'intero contributo del datore di lavoro. Aumenta la percentuale col tempo.",
        },
        {
          q: "Cos'è il contributo del datore di lavoro?",
          a: 'È il denaro che la tua azienda aggiunge al 401(k) in base ai tuoi versamenti, spesso fino al 3-6% dello stipendio. È di fatto denaro gratuito e un rendimento immediato.',
        },
        {
          q: 'Quale rendimento annuo dovrei ipotizzare?',
          a: "Storicamente i portafogli azionari diversificati hanno reso circa il 7% annuo al netto dell'inflazione nel lungo periodo. Un'ipotesi del 6-8% è ragionevole, anche se i rendimenti variano ogni anno.",
        },
        {
          q: 'Questo calcolatore considera la crescita composta?',
          a: "Sì. Capitalizza saldo e contributi mensilmente usando il rendimento previsto, mostrando quanto del saldo finale deriva dalla crescita dell'investimento rispetto ai contributi.",
        },
      ],
    },
    es: {
      title:
        'Calculadora 401(k) Gratis — Proyecta el Crecimiento de tus Ahorros para la Jubilación',
      paragraphs: [
        'La Calculadora 401(k) te ayuda a estimar cuánto podría valer tu cuenta de jubilación patrocinada por el empleador cuando te retires. Al ingresar tu saldo actual, salario, porcentaje de aportación, contrapartida del empleador, rendimiento anual esperado y años hasta la jubilación, obtienes una proyección clara de tu futuro capital.',
        'Una de las mayores ventajas de un 401(k) es la contrapartida del empleador. Muchas empresas igualan un porcentaje de tu salario cuando aportas, lo que es esencialmente dinero gratis. Aportar al menos lo suficiente para capturar la contrapartida completa debería ser una prioridad, porque renunciar a ella significa perder rendimientos garantizados.',
        'El crecimiento compuesto es lo que convierte aportaciones constantes en riqueza real. Como tus ganancias se reinvierten y generan sus propios rendimientos mes tras mes, incluso aportaciones modestas pueden crecer considerablemente en 20 o 30 años. Empezar pronto da más tiempo al interés compuesto, por eso los años hasta la jubilación tienen tanto impacto en el saldo final.',
        'Usa esta calculadora para probar distintos escenarios: aumenta tu porcentaje de aportación, ajusta el rendimiento esperado o extiende tu plazo para ver cómo cada cambio afecta tus ahorros proyectados. Pequeños aumentos hoy pueden traducirse en decenas de miles de dólares más en la jubilación.',
      ],
      faq: [
        {
          q: '¿Cuánto debería aportar a mi 401(k)?',
          a: 'Una guía común es el 10-15% de tu salario, pero como mínimo deberías aportar lo suficiente para recibir la contrapartida completa de tu empleador. Aumenta el porcentaje con el tiempo.',
        },
        {
          q: '¿Qué es la contrapartida del empleador?',
          a: 'Es el dinero que tu empresa añade a tu 401(k) en función de tus aportaciones, a menudo hasta el 3-6% del salario. Es dinero gratis y un rendimiento inmediato.',
        },
        {
          q: '¿Qué rendimiento anual debería suponer?',
          a: 'Históricamente, las carteras de acciones diversificadas han promediado alrededor del 7% anual tras la inflación a largo plazo. Un supuesto del 6-8% es razonable, aunque los rendimientos varían cada año.',
        },
        {
          q: '¿Esta calculadora considera el crecimiento compuesto?',
          a: 'Sí. Capitaliza tu saldo y aportaciones mensualmente usando el rendimiento esperado, mostrando cuánto del saldo final proviene del crecimiento de la inversión frente a las aportaciones.',
        },
      ],
    },
    fr: {
      title: 'Calculateur 401(k) Gratuit — Projetez la Croissance de votre Épargne Retraite',
      paragraphs: [
        "Le Calculateur 401(k) vous aide à estimer la valeur que pourrait atteindre votre compte de retraite d'entreprise au moment de votre départ. En saisissant votre solde actuel, votre salaire, votre taux de cotisation, l'abondement de l'employeur, le rendement annuel attendu et le nombre d'années avant la retraite, vous obtenez une projection claire de votre futur capital.",
        "L'un des plus grands avantages d'un 401(k) est l'abondement de l'employeur. De nombreuses entreprises versent un pourcentage de votre salaire lorsque vous cotisez, ce qui revient à de l'argent gratuit. Cotiser au moins assez pour capter l'abondement complet devrait être une priorité, car y renoncer revient à perdre des rendements garantis.",
        "La croissance composée est ce qui transforme des cotisations régulières en véritable patrimoine. Comme vos gains sont réinvestis et génèrent leurs propres rendements mois après mois, même des cotisations modestes peuvent croître considérablement sur 20 ou 30 ans. Commencer tôt laisse plus de temps aux intérêts composés, c'est pourquoi le nombre d'années avant la retraite influence autant le solde final.",
        "Utilisez ce calculateur pour tester différents scénarios : augmentez votre taux de cotisation, ajustez le rendement attendu ou prolongez votre horizon pour voir comment chaque changement affecte votre épargne projetée. De petites augmentations aujourd'hui peuvent représenter des dizaines de milliers de dollars de plus à la retraite.",
      ],
      faq: [
        {
          q: 'Combien devrais-je cotiser à mon 401(k) ?',
          a: "Une règle courante est de 10 à 15% de votre salaire, mais au minimum vous devriez cotiser assez pour recevoir l'abondement complet de votre employeur. Augmentez le taux avec le temps.",
        },
        {
          q: "Qu'est-ce que l'abondement de l'employeur ?",
          a: "C'est l'argent que votre entreprise ajoute à votre 401(k) en fonction de vos cotisations, souvent jusqu'à 3-6% du salaire. C'est de l'argent gratuit et un rendement immédiat.",
        },
        {
          q: 'Quel rendement annuel supposer ?',
          a: "Historiquement, les portefeuilles d'actions diversifiés ont rapporté environ 7% par an après inflation sur le long terme. Une hypothèse de 6-8% est raisonnable, même si les rendements varient chaque année.",
        },
        {
          q: 'Ce calculateur tient-il compte de la croissance composée ?',
          a: "Oui. Il capitalise votre solde et vos cotisations mensuellement avec le rendement attendu, montrant quelle part du solde final provient de la croissance de l'investissement plutôt que des cotisations.",
        },
      ],
    },
    de: {
      title: 'Kostenloser 401(k)-Rechner — Prognostizieren Sie das Wachstum Ihrer Altersvorsorge',
      paragraphs: [
        'Der 401(k)-Rechner hilft Ihnen zu schätzen, wie viel Ihr arbeitgeberfinanziertes Rentenkonto bis zum Ruhestand wert sein könnte. Durch Eingabe Ihres aktuellen Kontostands, Gehalts, Beitragssatzes, Arbeitgeberzuschusses, der erwarteten Jahresrendite und der Jahre bis zur Rente erhalten Sie eine klare Prognose Ihres künftigen Vermögens.',
        'Einer der größten Vorteile eines 401(k) ist der Arbeitgeberzuschuss. Viele Unternehmen legen einen Prozentsatz Ihres Gehalts drauf, wenn Sie einzahlen, was im Grunde geschenktes Geld ist. Genug einzuzahlen, um den vollen Zuschuss zu erhalten, sollte Priorität haben, denn darauf zu verzichten bedeutet, garantierte Renditen zu verschenken.',
        'Zinseszinswachstum verwandelt stetige Beiträge in echtes Vermögen. Da Ihre Anlagegewinne reinvestiert werden und Monat für Monat eigene Renditen erwirtschaften, können selbst bescheidene Beiträge über 20 oder 30 Jahre erheblich wachsen. Ein früher Start gibt dem Zinseszins mehr Zeit, weshalb die Jahre bis zur Rente den Endbetrag so stark beeinflussen.',
        'Nutzen Sie diesen Rechner, um verschiedene Szenarien zu testen: Erhöhen Sie Ihren Beitragssatz, passen Sie die erwartete Rendite an oder verlängern Sie Ihren Zeithorizont, um zu sehen, wie sich jede Änderung auf Ihre prognostizierte Altersvorsorge auswirkt. Kleine Erhöhungen heute können zehntausende Dollar mehr im Ruhestand bedeuten.',
      ],
      faq: [
        {
          q: 'Wie viel sollte ich in meinen 401(k) einzahlen?',
          a: 'Eine gängige Richtlinie sind 10-15% Ihres Gehalts, aber mindestens sollten Sie genug einzahlen, um den vollen Arbeitgeberzuschuss zu erhalten. Erhöhen Sie den Satz mit der Zeit.',
        },
        {
          q: 'Was ist ein Arbeitgeberzuschuss?',
          a: 'Das ist Geld, das Ihr Unternehmen basierend auf Ihren eigenen Beiträgen zu Ihrem 401(k) hinzufügt, oft bis zu 3-6% des Gehalts. Es ist praktisch geschenktes Geld und eine sofortige Rendite.',
        },
        {
          q: 'Welche Jahresrendite sollte ich annehmen?',
          a: 'Historisch haben diversifizierte Aktienportfolios langfristig rund 7% pro Jahr nach Inflation erzielt. Eine Annahme von 6-8% ist vernünftig, auch wenn die Renditen jährlich schwanken.',
        },
        {
          q: 'Berücksichtigt dieser Rechner das Zinseszinswachstum?',
          a: 'Ja. Er verzinst Ihren Kontostand und Ihre Beiträge monatlich mit der erwarteten Rendite und zeigt, wie viel des Endbetrags aus dem Anlagewachstum statt aus Beiträgen stammt.',
        },
      ],
    },
    pt: {
      title:
        'Calculadora 401(k) Grátis — Projete o Crescimento da sua Poupança para a Aposentadoria',
      paragraphs: [
        'A Calculadora 401(k) ajuda a estimar quanto a sua conta de aposentadoria patrocinada pelo empregador poderá valer quando você se aposentar. Ao inserir o saldo atual, salário, percentual de contribuição, contrapartida do empregador, retorno anual esperado e anos até a aposentadoria, você obtém uma projeção clara do seu futuro patrimônio.',
        'Uma das maiores vantagens de um 401(k) é a contrapartida do empregador. Muitas empresas igualam um percentual do seu salário quando você contribui, o que é essencialmente dinheiro grátis. Contribuir pelo menos o suficiente para capturar a contrapartida completa deve ser uma prioridade, pois abrir mão dela significa perder retornos garantidos.',
        'O crescimento composto é o que transforma contribuições constantes em riqueza real. Como seus ganhos são reinvestidos e geram seus próprios retornos mês após mês, até contribuições modestas podem crescer substancialmente em 20 ou 30 anos. Começar cedo dá mais tempo aos juros compostos, por isso os anos até a aposentadoria têm tanto impacto no saldo final.',
        'Use esta calculadora para testar diferentes cenários: aumente seu percentual de contribuição, ajuste o retorno esperado ou estenda seu prazo para ver como cada mudança afeta sua poupança projetada. Pequenos aumentos hoje podem se traduzir em dezenas de milhares de dólares a mais na aposentadoria.',
      ],
      faq: [
        {
          q: 'Quanto devo contribuir para o meu 401(k)?',
          a: 'Uma orientação comum é 10-15% do salário, mas no mínimo você deve contribuir o suficiente para receber a contrapartida completa do empregador. Aumente o percentual com o tempo.',
        },
        {
          q: 'O que é a contrapartida do empregador?',
          a: 'É o dinheiro que sua empresa adiciona ao seu 401(k) com base nas suas contribuições, muitas vezes até 3-6% do salário. É efetivamente dinheiro grátis e um retorno imediato.',
        },
        {
          q: 'Que retorno anual devo assumir?',
          a: 'Historicamente, carteiras de ações diversificadas renderam cerca de 7% ao ano após a inflação no longo prazo. Uma suposição de 6-8% é razoável, embora os retornos variem a cada ano.',
        },
        {
          q: 'Esta calculadora considera o crescimento composto?',
          a: 'Sim. Ela capitaliza seu saldo e contribuições mensalmente usando o retorno esperado, mostrando quanto do saldo final vem do crescimento do investimento em vez das contribuições.',
        },
      ],
    },
  };

  const seo = seoContent[lang];
  const formatCurrency = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <ToolPageWrapper toolSlug="401k-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.currentBalance[lang]}
              </label>
              <input
                type="number"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                placeholder="10000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.annualSalary[lang]}
              </label>
              <input
                type="number"
                value={annualSalary}
                onChange={(e) => setAnnualSalary(e.target.value)}
                placeholder="60000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.contributionPct[lang]}
              </label>
              <input
                type="number"
                value={contributionPct}
                onChange={(e) => setContributionPct(e.target.value)}
                placeholder="6"
                step="0.1"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.employerMatchPct[lang]}
              </label>
              <input
                type="number"
                value={employerMatchPct}
                onChange={(e) => setEmployerMatchPct(e.target.value)}
                placeholder="3"
                step="0.1"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.annualReturnPct[lang]}
              </label>
              <input
                type="number"
                value={annualReturnPct}
                onChange={(e) => setAnnualReturnPct(e.target.value)}
                placeholder="7"
                step="0.1"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.yearsToRetirement[lang]}
              </label>
              <input
                type="number"
                value={yearsToRetirement}
                onChange={(e) => setYearsToRetirement(e.target.value)}
                placeholder="30"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {salary > 0 && n > 0 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">
                  {labels.projectedBalance[lang]}
                </div>
                <div className="text-4xl font-bold text-gray-900">
                  ${formatCurrency(projectedBalance)}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">{labels.breakdown[lang]}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">{labels.yourContributions[lang]}</span>
                    <span className="font-semibold">${formatCurrency(totalYourContrib)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">{labels.employerMatch[lang]}</span>
                    <span className="font-semibold text-blue-600">
                      ${formatCurrency(totalEmployerMatch)}
                    </span>
                  </div>
                  {investmentGrowth > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">{labels.investmentGrowth[lang]}</span>
                      <span className="font-semibold text-green-600">
                        +${formatCurrency(investmentGrowth)}
                      </span>
                    </div>
                  )}
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
