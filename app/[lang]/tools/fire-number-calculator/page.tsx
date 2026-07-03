'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function FireNumberCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['fire-number-calculator'][lang];

  const [annualExpenses, setAnnualExpenses] = useState('');
  const [withdrawalRate, setWithdrawalRate] = useState('4');
  const [currentInvestments, setCurrentInvestments] = useState('');
  const [annualSavings, setAnnualSavings] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('7');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const exp = parseFloat(annualExpenses) || 0;
  const wr = parseFloat(withdrawalRate) || 0;
  const current = parseFloat(currentInvestments) || 0;
  const saving = parseFloat(annualSavings) || 0;
  const ret = (parseFloat(expectedReturn) || 0) / 100;

  const fireNumber = wr > 0 ? exp / (wr / 100) : 0;

  let balance = current;
  let years = 0;
  while (fireNumber > 0 && balance < fireNumber && years < 100) {
    balance = balance * (1 + ret) + saving;
    years++;
  }
  const yearsToFire = fireNumber > 0 && balance >= fireNumber ? years : 0;

  const multiple = wr > 0 ? Math.round((100 / wr) * 10) / 10 : 0;

  const labels = {
    annualExpenses: {
      en: 'Annual Expenses in Retirement',
      it: 'Spese Annuali in Pensione',
      es: 'Gastos Anuales en la Jubilación',
      fr: 'Dépenses Annuelles à la Retraite',
      de: 'Jährliche Ausgaben im Ruhestand',
      pt: 'Despesas Anuais na Aposentadoria',
    },
    withdrawalRate: {
      en: 'Safe Withdrawal Rate (%)',
      it: 'Tasso di Prelievo Sicuro (%)',
      es: 'Tasa de Retiro Segura (%)',
      fr: 'Taux de Retrait Sûr (%)',
      de: 'Sichere Entnahmerate (%)',
      pt: 'Taxa de Retirada Segura (%)',
    },
    currentInvestments: {
      en: 'Current Investments',
      it: 'Investimenti Attuali',
      es: 'Inversiones Actuales',
      fr: 'Investissements Actuels',
      de: 'Aktuelle Investitionen',
      pt: 'Investimentos Atuais',
    },
    annualSavings: {
      en: 'Annual Savings',
      it: 'Risparmi Annuali',
      es: 'Ahorros Anuales',
      fr: 'Épargne Annuelle',
      de: 'Jährliche Ersparnisse',
      pt: 'Poupança Anual',
    },
    expectedReturn: {
      en: 'Expected Annual Return (%)',
      it: 'Rendimento Annuo Atteso (%)',
      es: 'Rendimiento Anual Esperado (%)',
      fr: 'Rendement Annuel Attendu (%)',
      de: 'Erwartete Jährliche Rendite (%)',
      pt: 'Retorno Anual Esperado (%)',
    },
    fireNumber: {
      en: 'Your FIRE Number',
      it: 'Il Tuo Numero FIRE',
      es: 'Tu Número FIRE',
      fr: 'Votre Nombre FIRE',
      de: 'Ihre FIRE-Zahl',
      pt: 'Seu Número FIRE',
    },
    yearsToFire: {
      en: 'Years to Financial Independence',
      it: "Anni all'Indipendenza Finanziaria",
      es: 'Años hasta la Independencia Financiera',
      fr: "Années jusqu'à l'Indépendance Financière",
      de: 'Jahre bis zur Finanziellen Unabhängigkeit',
      pt: 'Anos até a Independência Financeira',
    },
    ruleNote: {
      en: `Based on the ${wr}% rule (${multiple}x annual expenses)`,
      it: `Basato sulla regola del ${wr}% (${multiple}x le spese annuali)`,
      es: `Basado en la regla del ${wr}% (${multiple}x los gastos anuales)`,
      fr: `Basé sur la règle des ${wr}% (${multiple}x les dépenses annuelles)`,
      de: `Basierend auf der ${wr}%-Regel (${multiple}x der jährlichen Ausgaben)`,
      pt: `Com base na regra dos ${wr}% (${multiple}x as despesas anuais)`,
    },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'Free FIRE Number Calculator — Financial Independence Retire Early',
      paragraphs: [
        'The FIRE Number Calculator helps you find the exact amount of money you need to achieve Financial Independence and Retire Early (FIRE). Your FIRE number is the size of the investment portfolio that can cover your living expenses indefinitely, letting you stop working for money.',
        'The calculation is based on the famous 4% rule, which comes from the Trinity Study on safe withdrawal rates. It states that you can safely withdraw 4% of your portfolio in the first year of retirement, adjusting for inflation each year, with a very low risk of running out of money over a 30-year horizon. A 4% withdrawal rate is equivalent to saving 25 times your annual expenses (100 divided by 4 equals 25).',
        'Enter your expected annual expenses in retirement, your safe withdrawal rate, your current investments, how much you save each year, and your expected annual return. The tool instantly shows your FIRE number and estimates how many years it will take to reach financial independence based on compound growth.',
        'A lower withdrawal rate such as 3% or 3.5% builds a larger safety margin (a bigger multiple of your expenses) and is popular for early retirees who plan for a retirement lasting 40 years or more. Use this calculator regularly to track progress and adjust your savings rate on your journey to FIRE.',
      ],
      faq: [
        {
          q: 'What is the 4% rule?',
          a: 'The 4% rule says you can withdraw 4% of your invested portfolio in year one of retirement, adjust it for inflation each year, and have a very high probability of not outliving your money over 30 years. It implies you need 25 times your annual expenses saved.',
        },
        {
          q: 'How is my FIRE number calculated?',
          a: 'Your FIRE number equals your annual expenses divided by your withdrawal rate. At a 4% withdrawal rate, that is 25 times your yearly expenses. For example, $40,000 in annual expenses gives a FIRE number of $1,000,000.',
        },
        {
          q: 'Should I use a 4% or 3% withdrawal rate?',
          a: 'A 4% rate is the classic benchmark for a 30-year retirement. Many early retirees prefer 3% to 3.5% for longer horizons of 40+ years, which requires a larger portfolio but adds a bigger safety margin.',
        },
        {
          q: 'How can I reach FIRE faster?',
          a: 'Increase your annual savings rate, lower your annual expenses (which also lowers your FIRE number), and invest for higher long-term returns. Cutting expenses is especially powerful because it reduces the target and increases savings at the same time.',
        },
      ],
    },
    it: {
      title: 'Calcolatore Numero FIRE Gratuito — Indipendenza Finanziaria e Pensione Anticipata',
      paragraphs: [
        "Il Calcolatore del Numero FIRE ti aiuta a trovare la cifra esatta necessaria per raggiungere l'Indipendenza Finanziaria e andare in Pensione Anticipata (FIRE). Il tuo numero FIRE è la dimensione del portafoglio di investimenti in grado di coprire le tue spese di vita a tempo indeterminato.",
        "Il calcolo si basa sulla famosa regola del 4%, derivata dal Trinity Study sui tassi di prelievo sicuri. Afferma che puoi prelevare il 4% del portafoglio nel primo anno di pensione, adeguandolo all'inflazione ogni anno, con un rischio molto basso di esaurire il capitale in 30 anni. Un tasso del 4% equivale a risparmiare 25 volte le spese annuali (100 diviso 4 fa 25).",
        "Inserisci le spese annuali previste in pensione, il tasso di prelievo sicuro, gli investimenti attuali, quanto risparmi ogni anno e il rendimento annuo atteso. Lo strumento mostra subito il tuo numero FIRE e stima quanti anni servono per raggiungere l'indipendenza finanziaria grazie all'interesse composto.",
        'Un tasso di prelievo più basso, come il 3% o il 3,5%, crea un margine di sicurezza maggiore ed è popolare tra chi va in pensione presto e pianifica orizzonti di 40 anni o più. Usa questo calcolatore regolarmente per monitorare i progressi.',
      ],
      faq: [
        {
          q: "Cos'è la regola del 4%?",
          a: "La regola del 4% dice che puoi prelevare il 4% del portafoglio investito nel primo anno di pensione, adeguandolo all'inflazione, con altissima probabilità di non esaurire il capitale in 30 anni. Implica di risparmiare 25 volte le spese annuali.",
        },
        {
          q: 'Come si calcola il mio numero FIRE?',
          a: 'Il numero FIRE è le spese annuali diviso il tasso di prelievo. Al 4% equivale a 25 volte le spese annuali. Ad esempio, 40.000 di spese annuali danno un numero FIRE di 1.000.000.',
        },
        {
          q: 'Meglio un tasso del 4% o del 3%?',
          a: 'Il 4% è il riferimento classico per una pensione di 30 anni. Molti pensionati anticipati preferiscono il 3-3,5% per orizzonti di 40+ anni: richiede un portafoglio maggiore ma aggiunge sicurezza.',
        },
        {
          q: 'Come posso raggiungere il FIRE più velocemente?',
          a: 'Aumenta il tasso di risparmio annuale, riduci le spese annuali (che abbassano anche il numero FIRE) e investi per rendimenti più alti nel lungo termine.',
        },
      ],
    },
    es: {
      title:
        'Calculadora del Número FIRE Gratis — Independencia Financiera y Jubilación Anticipada',
      paragraphs: [
        'La Calculadora del Número FIRE te ayuda a encontrar la cantidad exacta que necesitas para lograr la Independencia Financiera y Jubilarte Anticipadamente (FIRE). Tu número FIRE es el tamaño de la cartera de inversiones capaz de cubrir tus gastos de vida indefinidamente.',
        'El cálculo se basa en la famosa regla del 4%, derivada del Trinity Study sobre tasas de retiro seguras. Establece que puedes retirar el 4% de tu cartera en el primer año de jubilación, ajustando por inflación cada año, con muy bajo riesgo de quedarte sin dinero en 30 años. Una tasa del 4% equivale a ahorrar 25 veces tus gastos anuales (100 dividido entre 4 es 25).',
        'Ingresa tus gastos anuales previstos en la jubilación, tu tasa de retiro segura, tus inversiones actuales, cuánto ahorras cada año y tu rendimiento anual esperado. La herramienta muestra al instante tu número FIRE y estima cuántos años tardarás en alcanzar la independencia financiera.',
        'Una tasa de retiro más baja, como el 3% o 3,5%, crea un mayor margen de seguridad y es popular entre quienes se jubilan pronto y planean horizontes de 40 años o más. Usa esta calculadora con frecuencia para seguir tu progreso.',
      ],
      faq: [
        {
          q: '¿Qué es la regla del 4%?',
          a: 'La regla del 4% dice que puedes retirar el 4% de tu cartera invertida el primer año de jubilación, ajustar por inflación, con alta probabilidad de no quedarte sin dinero en 30 años. Implica ahorrar 25 veces tus gastos anuales.',
        },
        {
          q: '¿Cómo se calcula mi número FIRE?',
          a: 'Tu número FIRE es tus gastos anuales divididos entre tu tasa de retiro. Al 4% equivale a 25 veces tus gastos anuales. Por ejemplo, 40.000 de gastos anuales dan un número FIRE de 1.000.000.',
        },
        {
          q: '¿Debo usar una tasa del 4% o del 3%?',
          a: 'El 4% es el estándar clásico para una jubilación de 30 años. Muchos jubilados anticipados prefieren 3-3,5% para horizontes de 40+ años: requiere más capital pero añade seguridad.',
        },
        {
          q: '¿Cómo puedo alcanzar FIRE más rápido?',
          a: 'Aumenta tu tasa de ahorro anual, reduce tus gastos anuales (que también bajan tu número FIRE) e invierte para mayores rendimientos a largo plazo.',
        },
      ],
    },
    fr: {
      title: 'Calculateur du Nombre FIRE Gratuit — Indépendance Financière et Retraite Anticipée',
      paragraphs: [
        "Le Calculateur du Nombre FIRE vous aide à trouver le montant exact nécessaire pour atteindre l'Indépendance Financière et prendre une Retraite Anticipée (FIRE). Votre nombre FIRE est la taille du portefeuille d'investissements capable de couvrir vos dépenses de vie indéfiniment.",
        "Le calcul repose sur la célèbre règle des 4%, issue du Trinity Study sur les taux de retrait sûrs. Elle indique que vous pouvez retirer 4% de votre portefeuille la première année de retraite, ajusté à l'inflation chaque année, avec un risque très faible de manquer d'argent sur 30 ans. Un taux de 4% équivaut à épargner 25 fois vos dépenses annuelles (100 divisé par 4 égale 25).",
        "Entrez vos dépenses annuelles prévues à la retraite, votre taux de retrait sûr, vos investissements actuels, votre épargne annuelle et votre rendement annuel attendu. L'outil affiche immédiatement votre nombre FIRE et estime le nombre d'années pour atteindre l'indépendance financière.",
        'Un taux de retrait plus bas, comme 3% ou 3,5%, crée une plus grande marge de sécurité et est apprécié de ceux qui prennent une retraite anticipée sur des horizons de 40 ans ou plus. Utilisez ce calculateur régulièrement pour suivre vos progrès.',
      ],
      faq: [
        {
          q: "Qu'est-ce que la règle des 4% ?",
          a: "La règle des 4% indique que vous pouvez retirer 4% de votre portefeuille investi la première année de retraite, ajusté à l'inflation, avec une forte probabilité de ne pas manquer d'argent sur 30 ans. Elle implique d'épargner 25 fois vos dépenses annuelles.",
        },
        {
          q: 'Comment mon nombre FIRE est-il calculé ?',
          a: 'Votre nombre FIRE est vos dépenses annuelles divisées par votre taux de retrait. À 4%, cela représente 25 fois vos dépenses annuelles. Par exemple, 40 000 de dépenses donnent un nombre FIRE de 1 000 000.',
        },
        {
          q: 'Dois-je utiliser un taux de 4% ou 3% ?',
          a: 'Le 4% est la référence classique pour une retraite de 30 ans. Beaucoup de jeunes retraités préfèrent 3 à 3,5% pour des horizons de 40+ ans : cela demande plus de capital mais ajoute de la sécurité.',
        },
        {
          q: 'Comment atteindre le FIRE plus vite ?',
          a: "Augmentez votre taux d'épargne annuel, réduisez vos dépenses annuelles (ce qui baisse aussi votre nombre FIRE) et investissez pour de meilleurs rendements à long terme.",
        },
      ],
    },
    de: {
      title: 'Kostenloser FIRE-Zahl-Rechner — Finanzielle Unabhängigkeit und Frühpensionierung',
      paragraphs: [
        'Der FIRE-Zahl-Rechner hilft Ihnen, den genauen Betrag zu ermitteln, den Sie für Finanzielle Unabhängigkeit und Frühpensionierung (FIRE) benötigen. Ihre FIRE-Zahl ist die Größe des Anlageportfolios, das Ihre Lebenshaltungskosten unbegrenzt decken kann.',
        'Die Berechnung basiert auf der berühmten 4%-Regel aus der Trinity-Studie zu sicheren Entnahmeraten. Sie besagt, dass Sie im ersten Ruhestandsjahr 4% Ihres Portfolios entnehmen können, jährlich an die Inflation angepasst, mit sehr geringem Risiko, über 30 Jahre das Geld aufzubrauchen. Eine 4%-Rate entspricht dem 25-fachen Ihrer jährlichen Ausgaben (100 geteilt durch 4 ergibt 25).',
        'Geben Sie Ihre erwarteten jährlichen Ausgaben im Ruhestand, Ihre sichere Entnahmerate, Ihre aktuellen Investitionen, Ihre jährlichen Ersparnisse und Ihre erwartete jährliche Rendite ein. Das Tool zeigt sofort Ihre FIRE-Zahl und schätzt, wie viele Jahre bis zur finanziellen Unabhängigkeit nötig sind.',
        'Eine niedrigere Entnahmerate wie 3% oder 3,5% schafft einen größeren Sicherheitspuffer und ist beliebt bei Frührentnern mit Horizonten von 40 Jahren oder mehr. Nutzen Sie diesen Rechner regelmäßig, um Ihren Fortschritt zu verfolgen.',
      ],
      faq: [
        {
          q: 'Was ist die 4%-Regel?',
          a: 'Die 4%-Regel besagt, dass Sie im ersten Ruhestandsjahr 4% Ihres investierten Portfolios entnehmen können, an die Inflation angepasst, mit hoher Wahrscheinlichkeit, über 30 Jahre nicht mittellos zu werden. Sie bedeutet, das 25-fache Ihrer jährlichen Ausgaben zu sparen.',
        },
        {
          q: 'Wie wird meine FIRE-Zahl berechnet?',
          a: 'Ihre FIRE-Zahl sind Ihre jährlichen Ausgaben geteilt durch Ihre Entnahmerate. Bei 4% ist das das 25-fache Ihrer Jahresausgaben. Beispiel: 40.000 Jahresausgaben ergeben eine FIRE-Zahl von 1.000.000.',
        },
        {
          q: 'Sollte ich 4% oder 3% Entnahmerate verwenden?',
          a: '4% ist der klassische Maßstab für 30 Jahre Ruhestand. Viele Frührentner bevorzugen 3 bis 3,5% für Horizonte von 40+ Jahren: Das erfordert mehr Kapital, bietet aber mehr Sicherheit.',
        },
        {
          q: 'Wie erreiche ich FIRE schneller?',
          a: 'Erhöhen Sie Ihre jährliche Sparquote, senken Sie Ihre jährlichen Ausgaben (was auch Ihre FIRE-Zahl senkt) und investieren Sie für höhere langfristige Renditen.',
        },
      ],
    },
    pt: {
      title:
        'Calculadora do Número FIRE Grátis — Independência Financeira e Aposentadoria Antecipada',
      paragraphs: [
        'A Calculadora do Número FIRE ajuda a encontrar a quantia exata necessária para alcançar a Independência Financeira e a Aposentadoria Antecipada (FIRE). Seu número FIRE é o tamanho da carteira de investimentos capaz de cobrir suas despesas de vida indefinidamente.',
        'O cálculo baseia-se na famosa regra dos 4%, derivada do Trinity Study sobre taxas de retirada seguras. Ela afirma que você pode retirar 4% da carteira no primeiro ano de aposentadoria, ajustando pela inflação a cada ano, com risco muito baixo de ficar sem dinheiro em 30 anos. Uma taxa de 4% equivale a poupar 25 vezes suas despesas anuais (100 dividido por 4 é 25).',
        'Insira suas despesas anuais previstas na aposentadoria, sua taxa de retirada segura, seus investimentos atuais, quanto poupa por ano e seu retorno anual esperado. A ferramenta mostra na hora seu número FIRE e estima quantos anos levará para atingir a independência financeira.',
        'Uma taxa de retirada menor, como 3% ou 3,5%, cria uma maior margem de segurança e é popular entre quem se aposenta cedo e planeja horizontes de 40 anos ou mais. Use esta calculadora regularmente para acompanhar seu progresso.',
      ],
      faq: [
        {
          q: 'O que é a regra dos 4%?',
          a: 'A regra dos 4% diz que você pode retirar 4% da carteira investida no primeiro ano de aposentadoria, ajustando pela inflação, com alta probabilidade de não ficar sem dinheiro em 30 anos. Ela implica poupar 25 vezes suas despesas anuais.',
        },
        {
          q: 'Como meu número FIRE é calculado?',
          a: 'Seu número FIRE é suas despesas anuais divididas pela taxa de retirada. A 4%, isso equivale a 25 vezes suas despesas anuais. Por exemplo, 40.000 de despesas anuais dão um número FIRE de 1.000.000.',
        },
        {
          q: 'Devo usar uma taxa de 4% ou 3%?',
          a: '4% é o padrão clássico para uma aposentadoria de 30 anos. Muitos aposentados antecipados preferem 3 a 3,5% para horizontes de 40+ anos: exige mais capital, mas adiciona segurança.',
        },
        {
          q: 'Como posso alcançar o FIRE mais rápido?',
          a: 'Aumente sua taxa de poupança anual, reduza suas despesas anuais (o que também diminui seu número FIRE) e invista para retornos maiores no longo prazo.',
        },
      ],
    },
  };

  const seo = seoContent[lang];
  const formatCurrency = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <ToolPageWrapper toolSlug="fire-number-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.annualExpenses[lang]}
              </label>
              <input
                type="number"
                value={annualExpenses}
                onChange={(e) => setAnnualExpenses(e.target.value)}
                placeholder="40000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.withdrawalRate[lang]}
              </label>
              <input
                type="number"
                value={withdrawalRate}
                onChange={(e) => setWithdrawalRate(e.target.value)}
                placeholder="4"
                step="0.1"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.currentInvestments[lang]}
              </label>
              <input
                type="number"
                value={currentInvestments}
                onChange={(e) => setCurrentInvestments(e.target.value)}
                placeholder="50000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.annualSavings[lang]}
              </label>
              <input
                type="number"
                value={annualSavings}
                onChange={(e) => setAnnualSavings(e.target.value)}
                placeholder="20000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.expectedReturn[lang]}
            </label>
            <input
              type="number"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(e.target.value)}
              placeholder="7"
              step="0.1"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {exp > 0 && wr > 0 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">
                  {labels.fireNumber[lang]}
                </div>
                <div className="text-4xl font-bold text-gray-900">
                  ${formatCurrency(fireNumber)}
                </div>
                <div className="text-xs text-gray-500 mt-2">{labels.ruleNote[lang]}</div>
              </div>

              {yearsToFire > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">{labels.yearsToFire[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">{yearsToFire}</div>
                </div>
              )}
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
