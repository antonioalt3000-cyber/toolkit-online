'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function HsaCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['hsa-calculator'][lang];

  const [annualContribution, setAnnualContribution] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');
  const [years, setYears] = useState('');
  const [annualReturn, setAnnualReturn] = useState('6');
  const [taxRate, setTaxRate] = useState('24');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const contribution = parseFloat(annualContribution) || 0;
  const bal0 = parseFloat(currentBalance) || 0;
  const yrs = parseInt(years) || 0;
  const ret = (parseFloat(annualReturn) || 0) / 100;
  const tr = (parseFloat(taxRate) || 0) / 100;

  let balance = bal0;
  for (let i = 0; i < yrs; i++) {
    balance = balance * (1 + ret) + contribution;
  }
  const projectedBalance = balance;
  const totalContributions = bal0 + contribution * yrs;
  const investmentGrowth = projectedBalance - totalContributions;
  const annualTaxSavings = contribution * tr;
  const totalTaxSavings = annualTaxSavings * yrs;

  const labels = {
    annualContribution: {
      en: 'Annual Contribution ($)',
      it: 'Contributo Annuo ($)',
      es: 'Contribución Anual ($)',
      fr: 'Cotisation Annuelle ($)',
      de: 'Jährlicher Beitrag ($)',
      pt: 'Contribuição Anual ($)',
    },
    currentBalance: {
      en: 'Current HSA Balance ($)',
      it: 'Saldo HSA Attuale ($)',
      es: 'Saldo HSA Actual ($)',
      fr: 'Solde HSA Actuel ($)',
      de: 'Aktueller HSA-Kontostand ($)',
      pt: 'Saldo HSA Atual ($)',
    },
    years: { en: 'Years', it: 'Anni', es: 'Años', fr: 'Années', de: 'Jahre', pt: 'Anos' },
    annualReturn: {
      en: 'Annual Return (%)',
      it: 'Rendimento Annuo (%)',
      es: 'Rendimiento Anual (%)',
      fr: 'Rendement Annuel (%)',
      de: 'Jährliche Rendite (%)',
      pt: 'Retorno Anual (%)',
    },
    taxRate: {
      en: 'Your Marginal Tax Rate (%)',
      it: 'La Tua Aliquota Marginale (%)',
      es: 'Tu Tasa Impositiva Marginal (%)',
      fr: "Votre Taux d'Imposition Marginal (%)",
      de: 'Ihr Grenzsteuersatz (%)',
      pt: 'Sua Alíquota Marginal (%)',
    },
    projectedBalance: {
      en: 'Projected HSA Balance',
      it: 'Saldo HSA Previsto',
      es: 'Saldo HSA Proyectado',
      fr: 'Solde HSA Prévu',
      de: 'Voraussichtlicher HSA-Kontostand',
      pt: 'Saldo HSA Projetado',
    },
    totalContributions: {
      en: 'Total Contributions',
      it: 'Contributi Totali',
      es: 'Contribuciones Totales',
      fr: 'Cotisations Totales',
      de: 'Gesamte Beiträge',
      pt: 'Contribuições Totais',
    },
    investmentGrowth: {
      en: 'Investment Growth',
      it: 'Crescita Investimento',
      es: 'Crecimiento de la Inversión',
      fr: "Croissance de l'Investissement",
      de: 'Anlagewachstum',
      pt: 'Crescimento do Investimento',
    },
    annualTaxSavings: {
      en: 'Annual Tax Savings',
      it: 'Risparmio Fiscale Annuo',
      es: 'Ahorro Fiscal Anual',
      fr: "Économie d'Impôt Annuelle",
      de: 'Jährliche Steuerersparnis',
      pt: 'Economia Fiscal Anual',
    },
    totalTaxSavings: {
      en: 'Total Tax Savings',
      it: 'Risparmio Fiscale Totale',
      es: 'Ahorro Fiscal Total',
      fr: "Économie d'Impôt Totale",
      de: 'Gesamte Steuerersparnis',
      pt: 'Economia Fiscal Total',
    },
    breakdown: {
      en: 'HSA Breakdown',
      it: 'Dettaglio HSA',
      es: 'Desglose HSA',
      fr: 'Détail HSA',
      de: 'HSA-Aufschlüsselung',
      pt: 'Detalhamento HSA',
    },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'Free HSA Calculator — Project Your Health Savings Account Growth',
      paragraphs: [
        'A Health Savings Account (HSA) is one of the most powerful tax-advantaged accounts available in the United States. This HSA calculator projects how your Health Savings Account balance can grow over time when you contribute regularly and invest the funds for tax-free growth.',
        'The HSA offers a rare triple tax advantage: contributions are tax-deductible, the money grows tax-free inside the account, and withdrawals for qualified medical expenses are also tax-free. No other account gives you all three benefits at once, which is why financial planners often recommend maxing out an HSA before other accounts.',
        'Enter your annual contribution, current HSA balance, investment horizon in years, expected annual return, and your marginal tax rate. The calculator estimates your projected balance, total contributions, investment growth from tax-free compounding, and the tax savings you unlock each year and over the full period.',
        'Because unused HSA funds roll over year after year and never expire, an HSA can double as a long-term retirement vehicle. After age 65 you can withdraw funds for any purpose while paying only ordinary income tax, similar to a traditional IRA, while medical withdrawals remain completely tax-free.',
      ],
      faq: [
        {
          q: 'What are the 2026 HSA contribution limits?',
          a: 'For 2026, the HSA contribution limit is about $4,300 for individual coverage and $8,550 for family coverage. Account holders age 55 and older can add a $1,000 catch-up contribution on top of those limits.',
        },
        {
          q: 'What is the HSA triple tax advantage?',
          a: 'Contributions are tax-deductible, the money grows tax-free inside the account, and withdrawals for qualified medical expenses are tax-free. This triple tax advantage makes the HSA uniquely efficient.',
        },
        {
          q: 'Do I have to spend HSA money every year?',
          a: 'No. Unlike a Flexible Spending Account, HSA funds roll over indefinitely and never expire. Unused balances can be invested and left to compound tax-free for decades.',
        },
        {
          q: 'Can I invest my HSA balance?',
          a: 'Yes. Most HSA providers let you invest funds above a small cash threshold in mutual funds or ETFs, allowing tax-free growth just like a retirement account.',
        },
      ],
    },
    it: {
      title: 'Calcolatore HSA Gratuito — Proietta la Crescita del Tuo Conto Sanitario',
      paragraphs: [
        'Un Health Savings Account (HSA) è uno dei conti fiscalmente più vantaggiosi disponibili negli Stati Uniti. Questo calcolatore HSA proietta come il saldo del tuo Health Savings Account può crescere nel tempo con contributi regolari e investimenti a crescita esentasse.',
        "L'HSA offre un raro triplo vantaggio fiscale: i contributi sono deducibili dalle tasse, il denaro cresce esentasse all'interno del conto e i prelievi per spese mediche qualificate sono anch'essi esentasse. Nessun altro conto offre tutti e tre i benefici insieme.",
        "Inserisci il contributo annuo, il saldo HSA attuale, l'orizzonte di investimento in anni, il rendimento annuo previsto e la tua aliquota fiscale marginale. Il calcolatore stima il saldo previsto, i contributi totali, la crescita dell'investimento e il risparmio fiscale annuo e complessivo.",
        "Poiché i fondi HSA non utilizzati si trasferiscono anno dopo anno e non scadono mai, un HSA può fungere anche da strumento pensionistico a lungo termine. Dopo i 65 anni puoi prelevare fondi per qualsiasi scopo pagando solo l'imposta ordinaria sul reddito.",
      ],
      faq: [
        {
          q: 'Quali sono i limiti di contribuzione HSA per il 2026?',
          a: 'Per il 2026, il limite di contribuzione HSA è di circa 4.300 $ per la copertura individuale e 8.550 $ per quella familiare. Chi ha 55 anni o più può aggiungere un contributo di recupero di 1.000 $.',
        },
        {
          q: "Cos'è il triplo vantaggio fiscale dell'HSA?",
          a: "I contributi sono deducibili, il denaro cresce esentasse nel conto e i prelievi per spese mediche qualificate sono esentasse. Questo triplo vantaggio rende l'HSA unicamente efficiente.",
        },
        {
          q: "Devo spendere i soldi dell'HSA ogni anno?",
          a: 'No. A differenza di un Flexible Spending Account, i fondi HSA si trasferiscono indefinitamente e non scadono mai. I saldi non utilizzati possono essere investiti e lasciati crescere esentasse per decenni.',
        },
        {
          q: 'Posso investire il saldo del mio HSA?',
          a: 'Sì. La maggior parte dei provider HSA permette di investire i fondi oltre una piccola soglia di liquidità in fondi comuni o ETF, consentendo una crescita esentasse come un conto pensionistico.',
        },
      ],
    },
    es: {
      title: 'Calculadora HSA Gratis — Proyecta el Crecimiento de tu Cuenta de Ahorro para Salud',
      paragraphs: [
        'Una Cuenta de Ahorro para Salud (HSA) es una de las cuentas con más ventajas fiscales disponibles en Estados Unidos. Esta calculadora HSA proyecta cómo puede crecer el saldo de tu Health Savings Account con el tiempo mediante contribuciones regulares e inversión con crecimiento libre de impuestos.',
        'La HSA ofrece una rara triple ventaja fiscal: las contribuciones son deducibles de impuestos, el dinero crece libre de impuestos dentro de la cuenta y los retiros para gastos médicos calificados también están libres de impuestos. Ninguna otra cuenta ofrece los tres beneficios a la vez.',
        'Introduce tu contribución anual, el saldo HSA actual, el horizonte de inversión en años, el rendimiento anual esperado y tu tasa impositiva marginal. La calculadora estima el saldo proyectado, las contribuciones totales, el crecimiento de la inversión y el ahorro fiscal anual y total.',
        'Como los fondos HSA no utilizados se trasladan año tras año y nunca caducan, una HSA puede funcionar también como vehículo de jubilación a largo plazo. Después de los 65 años puedes retirar fondos para cualquier fin pagando solo el impuesto ordinario sobre la renta.',
      ],
      faq: [
        {
          q: '¿Cuáles son los límites de contribución HSA para 2026?',
          a: 'Para 2026, el límite de contribución HSA es de unos 4.300 $ para cobertura individual y 8.550 $ para cobertura familiar. Los titulares de 55 años o más pueden añadir una contribución adicional de 1.000 $.',
        },
        {
          q: '¿Qué es la triple ventaja fiscal de la HSA?',
          a: 'Las contribuciones son deducibles, el dinero crece libre de impuestos en la cuenta y los retiros para gastos médicos calificados están libres de impuestos. Esta triple ventaja hace que la HSA sea excepcionalmente eficiente.',
        },
        {
          q: '¿Tengo que gastar el dinero de la HSA cada año?',
          a: 'No. A diferencia de una Flexible Spending Account, los fondos HSA se trasladan indefinidamente y nunca caducan. Los saldos no usados pueden invertirse y crecer libres de impuestos durante décadas.',
        },
        {
          q: '¿Puedo invertir el saldo de mi HSA?',
          a: 'Sí. La mayoría de los proveedores HSA permiten invertir los fondos por encima de un pequeño umbral de efectivo en fondos mutuos o ETF, permitiendo un crecimiento libre de impuestos como una cuenta de jubilación.',
        },
      ],
    },
    fr: {
      title: 'Calculateur HSA Gratuit — Projetez la Croissance de votre Compte Épargne Santé',
      paragraphs: [
        "Un Compte Épargne Santé (HSA) est l'un des comptes les plus avantageux fiscalement disponibles aux États-Unis. Ce calculateur HSA projette comment le solde de votre Health Savings Account peut croître au fil du temps grâce à des cotisations régulières et à un investissement à croissance non imposable.",
        "Le HSA offre un rare triple avantage fiscal : les cotisations sont déductibles d'impôt, l'argent croît sans impôt à l'intérieur du compte et les retraits pour des frais médicaux admissibles sont également exonérés d'impôt. Aucun autre compte n'offre les trois avantages à la fois.",
        "Saisissez votre cotisation annuelle, le solde HSA actuel, l'horizon d'investissement en années, le rendement annuel attendu et votre taux d'imposition marginal. Le calculateur estime le solde prévu, les cotisations totales, la croissance de l'investissement et l'économie d'impôt annuelle et totale.",
        "Comme les fonds HSA non utilisés sont reportés d'année en année et n'expirent jamais, un HSA peut aussi servir de véhicule de retraite à long terme. Après 65 ans, vous pouvez retirer des fonds pour n'importe quel usage en ne payant que l'impôt ordinaire sur le revenu.",
      ],
      faq: [
        {
          q: 'Quels sont les plafonds de cotisation HSA pour 2026 ?',
          a: "Pour 2026, le plafond de cotisation HSA est d'environ 4 300 $ pour une couverture individuelle et 8 550 $ pour une couverture familiale. Les titulaires de 55 ans et plus peuvent ajouter une cotisation de rattrapage de 1 000 $.",
        },
        {
          q: "Qu'est-ce que le triple avantage fiscal du HSA ?",
          a: "Les cotisations sont déductibles, l'argent croît sans impôt dans le compte et les retraits pour frais médicaux admissibles sont exonérés. Ce triple avantage rend le HSA exceptionnellement efficace.",
        },
        {
          q: "Dois-je dépenser l'argent du HSA chaque année ?",
          a: "Non. Contrairement à un Flexible Spending Account, les fonds HSA sont reportés indéfiniment et n'expirent jamais. Les soldes inutilisés peuvent être investis et croître sans impôt pendant des décennies.",
        },
        {
          q: 'Puis-je investir le solde de mon HSA ?',
          a: "Oui. La plupart des fournisseurs HSA permettent d'investir les fonds au-delà d'un petit seuil de liquidité dans des fonds communs ou des ETF, permettant une croissance sans impôt comme un compte de retraite.",
        },
      ],
    },
    de: {
      title:
        'Kostenloser HSA-Rechner — Prognostizieren Sie das Wachstum Ihres Gesundheitssparkontos',
      paragraphs: [
        'Ein Health Savings Account (HSA) ist eines der steuerlich vorteilhaftesten Konten in den USA. Dieser HSA-Rechner prognostiziert, wie Ihr Health-Savings-Account-Guthaben im Laufe der Zeit wachsen kann, wenn Sie regelmäßig einzahlen und die Mittel für steuerfreies Wachstum anlegen.',
        'Das HSA bietet einen seltenen dreifachen Steuervorteil: Beiträge sind steuerlich absetzbar, das Geld wächst innerhalb des Kontos steuerfrei und Abhebungen für qualifizierte medizinische Ausgaben sind ebenfalls steuerfrei. Kein anderes Konto bietet alle drei Vorteile gleichzeitig.',
        'Geben Sie Ihren jährlichen Beitrag, den aktuellen HSA-Kontostand, den Anlagehorizont in Jahren, die erwartete jährliche Rendite und Ihren Grenzsteuersatz ein. Der Rechner schätzt Ihren voraussichtlichen Kontostand, die Gesamtbeiträge, das Anlagewachstum und die jährliche sowie gesamte Steuerersparnis.',
        'Da ungenutzte HSA-Mittel Jahr für Jahr übertragen werden und nie verfallen, kann ein HSA auch als langfristiges Altersvorsorgeinstrument dienen. Nach dem 65. Lebensjahr können Sie Mittel für jeden Zweck abheben und zahlen nur die normale Einkommensteuer.',
      ],
      faq: [
        {
          q: 'Wie hoch sind die HSA-Beitragsgrenzen für 2026?',
          a: 'Für 2026 liegt die HSA-Beitragsgrenze bei etwa 4.300 $ für Einzelpersonen und 8.550 $ für Familien. Kontoinhaber ab 55 Jahren können einen zusätzlichen Nachholbeitrag von 1.000 $ leisten.',
        },
        {
          q: 'Was ist der dreifache Steuervorteil des HSA?',
          a: 'Beiträge sind absetzbar, das Geld wächst im Konto steuerfrei und Abhebungen für qualifizierte medizinische Ausgaben sind steuerfrei. Dieser dreifache Vorteil macht das HSA außerordentlich effizient.',
        },
        {
          q: 'Muss ich das HSA-Geld jedes Jahr ausgeben?',
          a: 'Nein. Im Gegensatz zu einem Flexible Spending Account werden HSA-Mittel unbegrenzt übertragen und verfallen nie. Ungenutzte Guthaben können angelegt und jahrzehntelang steuerfrei wachsen.',
        },
        {
          q: 'Kann ich mein HSA-Guthaben anlegen?',
          a: 'Ja. Die meisten HSA-Anbieter erlauben es, Mittel oberhalb einer kleinen Bargeldschwelle in Investmentfonds oder ETFs anzulegen und so steuerfrei zu wachsen wie ein Altersvorsorgekonto.',
        },
      ],
    },
    pt: {
      title: 'Calculadora HSA Grátis — Projete o Crescimento da sua Conta Poupança Saúde',
      paragraphs: [
        'Uma Conta Poupança Saúde (HSA) é uma das contas com mais vantagens fiscais disponíveis nos Estados Unidos. Esta calculadora HSA projeta como o saldo da sua Health Savings Account pode crescer ao longo do tempo com contribuições regulares e investimento com crescimento isento de impostos.',
        'A HSA oferece uma rara tripla vantagem fiscal: as contribuições são dedutíveis de impostos, o dinheiro cresce isento de impostos dentro da conta e os saques para despesas médicas qualificadas também são isentos de impostos. Nenhuma outra conta oferece os três benefícios ao mesmo tempo.',
        'Insira sua contribuição anual, o saldo HSA atual, o horizonte de investimento em anos, o retorno anual esperado e sua alíquota marginal. A calculadora estima o saldo projetado, as contribuições totais, o crescimento do investimento e a economia fiscal anual e total.',
        'Como os fundos HSA não utilizados são transferidos ano após ano e nunca expiram, uma HSA pode servir também como veículo de aposentadoria de longo prazo. Após os 65 anos, você pode sacar fundos para qualquer finalidade pagando apenas o imposto de renda comum.',
      ],
      faq: [
        {
          q: 'Quais são os limites de contribuição HSA para 2026?',
          a: 'Para 2026, o limite de contribuição HSA é de cerca de 4.300 $ para cobertura individual e 8.550 $ para cobertura familiar. Titulares com 55 anos ou mais podem adicionar uma contribuição de recuperação de 1.000 $.',
        },
        {
          q: 'O que é a tripla vantagem fiscal da HSA?',
          a: 'As contribuições são dedutíveis, o dinheiro cresce isento de impostos na conta e os saques para despesas médicas qualificadas são isentos. Essa tripla vantagem torna a HSA excepcionalmente eficiente.',
        },
        {
          q: 'Preciso gastar o dinheiro da HSA todos os anos?',
          a: 'Não. Ao contrário de uma Flexible Spending Account, os fundos HSA são transferidos indefinidamente e nunca expiram. Saldos não utilizados podem ser investidos e crescer isentos de impostos por décadas.',
        },
        {
          q: 'Posso investir o saldo da minha HSA?',
          a: 'Sim. A maioria dos provedores HSA permite investir fundos acima de um pequeno limite de caixa em fundos mútuos ou ETFs, permitindo crescimento isento de impostos como uma conta de aposentadoria.',
        },
      ],
    },
  };

  const seo = seoContent[lang];
  const formatCurrency = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <ToolPageWrapper toolSlug="hsa-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.annualContribution[lang]}
              </label>
              <input
                type="number"
                value={annualContribution}
                onChange={(e) => setAnnualContribution(e.target.value)}
                placeholder="4300"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.currentBalance[lang]}
              </label>
              <input
                type="number"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.years[lang]}
              </label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                placeholder="20"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.annualReturn[lang]}
              </label>
              <input
                type="number"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(e.target.value)}
                placeholder="6"
                step="0.1"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.taxRate[lang]}
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="24"
                step="0.1"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {yrs > 0 && contribution > 0 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">
                  {labels.projectedBalance[lang]}
                </div>
                <div className="text-4xl font-bold text-gray-900">
                  ${formatCurrency(projectedBalance)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">{labels.annualTaxSavings[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">
                    ${formatCurrency(annualTaxSavings)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">{labels.totalTaxSavings[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">
                    ${formatCurrency(totalTaxSavings)}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">{labels.breakdown[lang]}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">{labels.totalContributions[lang]}</span>
                    <span className="font-semibold">${formatCurrency(totalContributions)}</span>
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
