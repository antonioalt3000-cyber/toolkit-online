'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function EmergencyFundCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['emergency-fund-calculator'][lang];

  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [monthsCoverage, setMonthsCoverage] = useState('6');
  const [currentSavings, setCurrentSavings] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const exp = parseFloat(monthlyExpenses) || 0;
  const months = parseFloat(monthsCoverage) || 0;
  const current = parseFloat(currentSavings) || 0;
  const contribution = parseFloat(monthlyContribution) || 0;

  const target = exp * months;
  const gap = Math.max(0, target - current);
  const pctFunded = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const monthsToGoal = contribution > 0 && gap > 0 ? Math.ceil(gap / contribution) : 0;

  const labels = {
    monthlyExpenses: {
      en: 'Monthly Essential Expenses ($)',
      it: 'Spese Essenziali Mensili (€)',
      es: 'Gastos Esenciales Mensuales ($)',
      fr: 'Dépenses Essentielles Mensuelles (€)',
      de: 'Monatliche Grundausgaben (€)',
      pt: 'Despesas Essenciais Mensais (R$)',
    },
    monthsCoverage: {
      en: 'Months of Coverage',
      it: 'Mesi di Copertura',
      es: 'Meses de Cobertura',
      fr: 'Mois de Couverture',
      de: 'Monate der Abdeckung',
      pt: 'Meses de Cobertura',
    },
    currentSavings: {
      en: 'Current Emergency Savings ($)',
      it: "Risparmi d'Emergenza Attuali (€)",
      es: 'Ahorros de Emergencia Actuales ($)',
      fr: "Épargne d'Urgence Actuelle (€)",
      de: 'Aktuelle Notfallreserve (€)',
      pt: 'Poupança de Emergência Atual (R$)',
    },
    monthlyContribution: {
      en: 'Monthly Contribution ($)',
      it: 'Contributo Mensile (€)',
      es: 'Contribución Mensual ($)',
      fr: 'Contribution Mensuelle (€)',
      de: 'Monatlicher Beitrag (€)',
      pt: 'Contribuição Mensal (R$)',
    },
    target: {
      en: 'Target Emergency Fund',
      it: "Fondo d'Emergenza Obiettivo",
      es: 'Fondo de Emergencia Objetivo',
      fr: "Fonds d'Urgence Cible",
      de: 'Ziel-Notgroschen',
      pt: 'Fundo de Emergência Alvo',
    },
    stillNeeded: {
      en: 'Still Needed',
      it: 'Ancora Necessario',
      es: 'Aún Necesario',
      fr: 'Encore Nécessaire',
      de: 'Noch Benötigt',
      pt: 'Ainda Necessário',
    },
    percentFunded: {
      en: 'Percent Funded',
      it: 'Percentuale Finanziata',
      es: 'Porcentaje Financiado',
      fr: 'Pourcentage Financé',
      de: 'Prozent Finanziert',
      pt: 'Percentual Financiado',
    },
    monthsToGoal: {
      en: 'Months to Reach Goal',
      it: "Mesi per Raggiungere l'Obiettivo",
      es: 'Meses para Alcanzar la Meta',
      fr: "Mois pour Atteindre l'Objectif",
      de: 'Monate bis zum Ziel',
      pt: 'Meses para Atingir a Meta',
    },
    breakdown: {
      en: 'Fund Breakdown',
      it: 'Dettaglio Fondo',
      es: 'Desglose del Fondo',
      fr: 'Détail du Fonds',
      de: 'Fonds-Aufschlüsselung',
      pt: 'Detalhamento do Fundo',
    },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'Free Emergency Fund Calculator — Build Your Financial Safety Net',
      paragraphs: [
        'An emergency fund is the cornerstone of a healthy financial life. It is money set aside to cover unexpected expenses like a medical bill, a car repair, or a sudden loss of income. The Emergency Fund Calculator helps you determine exactly how large your safety net should be and how long it will take to build it.',
        'Most financial experts recommend saving between 3 and 6 months of essential expenses. If your job is stable, 3 months may be enough. If you are self-employed, have variable income, or support a family on a single salary, aim for 6 months or more of expenses.',
        'Enter your monthly essential expenses, the number of months of coverage you want, your current emergency savings, and how much you can set aside each month. The calculator instantly shows your target emergency fund, the gap you still need to close, how far along you are as a percentage, and how many months it will take to reach your goal at your current contribution rate.',
        'Building an emergency fund takes discipline, but even small, consistent contributions add up over time. Keep your fund in a separate, easily accessible high-yield savings account so the money is there when you need it but out of sight for everyday spending.',
      ],
      faq: [
        {
          q: 'How many months of expenses should an emergency fund cover?',
          a: 'A common rule of thumb is 3 to 6 months of essential expenses. Choose 3 months if you have stable employment and few dependents, and 6 months or more if your income is variable or you are the sole earner.',
        },
        {
          q: 'What counts as an essential expense?',
          a: 'Essential expenses include rent or mortgage, utilities, groceries, insurance, minimum debt payments, and transportation. Exclude discretionary spending like dining out, subscriptions, and vacations when calculating your safety net.',
        },
        {
          q: 'Where should I keep my emergency fund?',
          a: 'Keep it in a separate high-yield savings account that is liquid and easy to access. Avoid tying it up in stocks or long-term investments, since you may need the money on short notice.',
        },
        {
          q: 'How can I build my emergency fund faster?',
          a: 'Increase your monthly contribution, automate transfers on payday, cut non-essential spending, and direct windfalls like tax refunds or bonuses straight into the fund.',
        },
      ],
    },
    it: {
      title: "Calcolatore Fondo d'Emergenza Gratuito — Crea la Tua Rete di Sicurezza Finanziaria",
      paragraphs: [
        "Un fondo d'emergenza è la base di una vita finanziaria sana. È denaro accantonato per coprire spese impreviste come una bolletta medica, una riparazione dell'auto o una perdita improvvisa di reddito. Il Calcolatore Fondo d'Emergenza ti aiuta a stabilire quanto deve essere ampia la tua rete di sicurezza e in quanto tempo puoi costruirla.",
        'La maggior parte degli esperti raccomanda di risparmiare tra 3 e 6 mesi di spese essenziali. Se il tuo lavoro è stabile, 3 mesi possono bastare. Se sei un lavoratore autonomo, hai un reddito variabile o mantieni una famiglia con un solo stipendio, punta a 6 mesi o più di spese.',
        "Inserisci le tue spese essenziali mensili, il numero di mesi di copertura che desideri, i tuoi risparmi d'emergenza attuali e quanto puoi accantonare ogni mese. Il calcolatore mostra subito il fondo d'emergenza obiettivo, il divario ancora da colmare, la percentuale già raggiunta e quanti mesi serviranno per raggiungere il traguardo.",
        "Costruire un fondo d'emergenza richiede disciplina, ma anche piccoli contributi costanti si accumulano nel tempo. Tieni il fondo in un conto di risparmio separato e ad alto rendimento, così il denaro è disponibile quando serve ma lontano dalle spese quotidiane.",
      ],
      faq: [
        {
          q: "Quanti mesi di spese dovrebbe coprire un fondo d'emergenza?",
          a: "Una regola comune è da 3 a 6 mesi di spese essenziali. Scegli 3 mesi con un impiego stabile e pochi familiari a carico, e 6 mesi o più se il reddito è variabile o sei l'unico a guadagnare.",
        },
        {
          q: 'Cosa conta come spesa essenziale?',
          a: 'Le spese essenziali includono affitto o mutuo, utenze, alimentari, assicurazioni, pagamenti minimi dei debiti e trasporti. Escludi spese discrezionali come ristoranti, abbonamenti e vacanze.',
        },
        {
          q: "Dove dovrei tenere il mio fondo d'emergenza?",
          a: 'Tienilo in un conto di risparmio separato ad alto rendimento, liquido e facile da usare. Evita di vincolarlo in azioni o investimenti a lungo termine, poiché potresti averne bisogno rapidamente.',
        },
        {
          q: "Come posso costruire il fondo d'emergenza più velocemente?",
          a: 'Aumenta il contributo mensile, automatizza i bonifici al giorno di paga, riduci le spese non essenziali e destina al fondo entrate straordinarie come rimborsi fiscali o bonus.',
        },
      ],
    },
    es: {
      title: 'Calculadora de Fondo de Emergencia Gratis — Crea tu Red de Seguridad Financiera',
      paragraphs: [
        'Un fondo de emergencia es la piedra angular de una vida financiera sana. Es dinero apartado para cubrir gastos inesperados como una factura médica, una reparación del coche o una pérdida repentina de ingresos. La Calculadora de Fondo de Emergencia te ayuda a determinar cuán grande debe ser tu red de seguridad y cuánto tardarás en construirla.',
        'La mayoría de los expertos recomienda ahorrar entre 3 y 6 meses de gastos esenciales. Si tu empleo es estable, 3 meses pueden bastar. Si trabajas por cuenta propia, tienes ingresos variables o mantienes a una familia con un solo salario, apunta a 6 meses o más de gastos.',
        'Introduce tus gastos esenciales mensuales, los meses de cobertura que deseas, tus ahorros de emergencia actuales y cuánto puedes apartar cada mes. La calculadora muestra al instante tu fondo de emergencia objetivo, la brecha que aún debes cubrir, el porcentaje ya alcanzado y cuántos meses tardarás en llegar a la meta.',
        'Construir un fondo de emergencia requiere disciplina, pero incluso aportaciones pequeñas y constantes se acumulan con el tiempo. Mantén el fondo en una cuenta de ahorro separada y de alto rendimiento, para que el dinero esté disponible cuando lo necesites pero lejos del gasto diario.',
      ],
      faq: [
        {
          q: '¿Cuántos meses de gastos debe cubrir un fondo de emergencia?',
          a: 'Una regla común es de 3 a 6 meses de gastos esenciales. Elige 3 meses con empleo estable y pocas cargas familiares, y 6 meses o más si tu ingreso es variable o eres el único sustento.',
        },
        {
          q: '¿Qué cuenta como gasto esencial?',
          a: 'Los gastos esenciales incluyen alquiler o hipoteca, servicios, comida, seguros, pagos mínimos de deudas y transporte. Excluye gastos discrecionales como restaurantes, suscripciones y vacaciones.',
        },
        {
          q: '¿Dónde debo guardar mi fondo de emergencia?',
          a: 'Guárdalo en una cuenta de ahorro separada y de alto rendimiento, líquida y fácil de usar. Evita inmovilizarlo en acciones o inversiones a largo plazo, ya que podrías necesitarlo pronto.',
        },
        {
          q: '¿Cómo puedo construir mi fondo de emergencia más rápido?',
          a: 'Aumenta tu aportación mensual, automatiza las transferencias el día de pago, recorta gastos no esenciales y destina al fondo ingresos extra como devoluciones de impuestos o bonos.',
        },
      ],
    },
    fr: {
      title:
        "Calculateur de Fonds d'Urgence Gratuit — Constituez votre Filet de Sécurité Financier",
      paragraphs: [
        "Un fonds d'urgence est la pierre angulaire d'une vie financière saine. C'est de l'argent mis de côté pour couvrir des dépenses imprévues comme une facture médicale, une réparation de voiture ou une perte soudaine de revenu. Le Calculateur de Fonds d'Urgence vous aide à déterminer la taille idéale de votre filet de sécurité et le temps nécessaire pour le constituer.",
        "La plupart des experts recommandent d'épargner entre 3 et 6 mois de dépenses essentielles. Si votre emploi est stable, 3 mois peuvent suffire. Si vous êtes indépendant, avez un revenu variable ou faites vivre une famille avec un seul salaire, visez 6 mois ou plus de dépenses.",
        "Saisissez vos dépenses essentielles mensuelles, le nombre de mois de couverture souhaité, votre épargne d'urgence actuelle et le montant que vous pouvez mettre de côté chaque mois. Le calculateur affiche instantanément votre fonds d'urgence cible, l'écart restant à combler, le pourcentage déjà atteint et le nombre de mois nécessaires pour atteindre votre objectif.",
        "Constituer un fonds d'urgence demande de la discipline, mais même de petites contributions régulières s'accumulent avec le temps. Gardez votre fonds sur un compte d'épargne séparé à haut rendement, afin que l'argent soit disponible en cas de besoin mais à l'écart des dépenses quotidiennes.",
      ],
      faq: [
        {
          q: "Combien de mois de dépenses un fonds d'urgence doit-il couvrir ?",
          a: 'Une règle courante est de 3 à 6 mois de dépenses essentielles. Choisissez 3 mois avec un emploi stable et peu de personnes à charge, et 6 mois ou plus si votre revenu est variable ou si vous êtes le seul revenu.',
        },
        {
          q: "Qu'est-ce qui compte comme dépense essentielle ?",
          a: "Les dépenses essentielles comprennent le loyer ou le prêt, les services publics, l'alimentation, les assurances, les paiements minimums de dettes et les transports. Excluez les dépenses discrétionnaires comme les restaurants, abonnements et vacances.",
        },
        {
          q: "Où dois-je conserver mon fonds d'urgence ?",
          a: "Conservez-le sur un compte d'épargne séparé à haut rendement, liquide et facile d'accès. Évitez de l'immobiliser dans des actions ou des placements à long terme, car vous pourriez en avoir besoin rapidement.",
        },
        {
          q: "Comment constituer mon fonds d'urgence plus vite ?",
          a: "Augmentez votre contribution mensuelle, automatisez les virements le jour de paie, réduisez les dépenses non essentielles et versez au fonds les rentrées exceptionnelles comme les remboursements d'impôts ou les primes.",
        },
      ],
    },
    de: {
      title: 'Kostenloser Notgroschen-Rechner — Bauen Sie Ihr finanzielles Sicherheitsnetz auf',
      paragraphs: [
        'Ein Notgroschen ist das Fundament eines gesunden Finanzlebens. Es ist Geld, das für unerwartete Ausgaben wie eine Arztrechnung, eine Autoreparatur oder einen plötzlichen Einkommensverlust zurückgelegt wird. Der Notgroschen-Rechner hilft Ihnen zu bestimmen, wie groß Ihr Sicherheitsnetz sein sollte und wie lange der Aufbau dauert.',
        'Die meisten Experten empfehlen, zwischen 3 und 6 Monaten an Grundausgaben anzusparen. Ist Ihr Job sicher, können 3 Monate genügen. Sind Sie selbstständig, haben ein schwankendes Einkommen oder versorgen eine Familie mit einem Gehalt, streben Sie 6 Monate oder mehr an Ausgaben an.',
        'Geben Sie Ihre monatlichen Grundausgaben, die gewünschte Anzahl an Deckungsmonaten, Ihre aktuelle Notfallreserve und Ihren möglichen monatlichen Sparbetrag ein. Der Rechner zeigt sofort Ihren Ziel-Notgroschen, die noch zu schließende Lücke, den bereits erreichten Prozentsatz und wie viele Monate Sie bis zum Ziel brauchen.',
        'Der Aufbau eines Notgroschens erfordert Disziplin, aber selbst kleine, regelmäßige Beiträge summieren sich mit der Zeit. Bewahren Sie Ihre Reserve auf einem separaten, gut zugänglichen Tagesgeldkonto auf, damit das Geld verfügbar ist, wenn Sie es brauchen, aber außerhalb der täglichen Ausgaben bleibt.',
      ],
      faq: [
        {
          q: 'Wie viele Monatsausgaben sollte ein Notgroschen abdecken?',
          a: 'Eine gängige Faustregel sind 3 bis 6 Monate an Grundausgaben. Wählen Sie 3 Monate bei sicherem Arbeitsplatz und wenigen Angehörigen, und 6 Monate oder mehr bei schwankendem Einkommen oder als Alleinverdiener.',
        },
        {
          q: 'Was zählt als Grundausgabe?',
          a: 'Zu den Grundausgaben gehören Miete oder Kredit, Nebenkosten, Lebensmittel, Versicherungen, Mindestzahlungen für Schulden und Transport. Schließen Sie diskretionäre Ausgaben wie Restaurantbesuche, Abonnements und Urlaube aus.',
        },
        {
          q: 'Wo sollte ich meinen Notgroschen aufbewahren?',
          a: 'Bewahren Sie ihn auf einem separaten, gut verzinsten Tagesgeldkonto auf, das liquide und leicht zugänglich ist. Vermeiden Sie es, ihn in Aktien oder langfristige Anlagen zu binden, da Sie das Geld kurzfristig benötigen könnten.',
        },
        {
          q: 'Wie kann ich meinen Notgroschen schneller aufbauen?',
          a: 'Erhöhen Sie Ihren monatlichen Beitrag, automatisieren Sie Überweisungen am Zahltag, reduzieren Sie nicht notwendige Ausgaben und leiten Sie Sonderzahlungen wie Steuerrückerstattungen oder Boni direkt in den Fonds.',
        },
      ],
    },
    pt: {
      title:
        'Calculadora de Fundo de Emergência Grátis — Construa sua Rede de Segurança Financeira',
      paragraphs: [
        'Um fundo de emergência é a base de uma vida financeira saudável. É dinheiro reservado para cobrir despesas inesperadas como uma conta médica, um conserto do carro ou uma perda repentina de renda. A Calculadora de Fundo de Emergência ajuda a determinar o tamanho ideal da sua rede de segurança e quanto tempo levará para construí-la.',
        'A maioria dos especialistas recomenda poupar entre 3 e 6 meses de despesas essenciais. Se o seu emprego é estável, 3 meses podem bastar. Se você é autônomo, tem renda variável ou sustenta uma família com um só salário, mire em 6 meses ou mais de despesas.',
        'Insira suas despesas essenciais mensais, o número de meses de cobertura que deseja, sua poupança de emergência atual e quanto pode reservar por mês. A calculadora mostra na hora seu fundo de emergência alvo, a lacuna que ainda precisa cobrir, o percentual já alcançado e quantos meses levará para atingir a meta.',
        'Construir um fundo de emergência exige disciplina, mas mesmo pequenas contribuições constantes se acumulam com o tempo. Mantenha o fundo em uma conta poupança separada e de alto rendimento, para que o dinheiro esteja disponível quando precisar, mas longe dos gastos do dia a dia.',
      ],
      faq: [
        {
          q: 'Quantos meses de despesas um fundo de emergência deve cobrir?',
          a: 'Uma regra comum é de 3 a 6 meses de despesas essenciais. Escolha 3 meses com emprego estável e poucos dependentes, e 6 meses ou mais se sua renda é variável ou você é o único provedor.',
        },
        {
          q: 'O que conta como despesa essencial?',
          a: 'As despesas essenciais incluem aluguel ou financiamento, contas de serviços, alimentação, seguros, pagamentos mínimos de dívidas e transporte. Exclua gastos discricionários como restaurantes, assinaturas e férias.',
        },
        {
          q: 'Onde devo guardar meu fundo de emergência?',
          a: 'Guarde-o em uma conta poupança separada e de alto rendimento, líquida e de fácil acesso. Evite prendê-lo em ações ou investimentos de longo prazo, pois você pode precisar do dinheiro rapidamente.',
        },
        {
          q: 'Como posso construir meu fundo de emergência mais rápido?',
          a: 'Aumente sua contribuição mensal, automatize as transferências no dia do pagamento, corte gastos não essenciais e direcione ao fundo entradas extras como restituições de impostos ou bônus.',
        },
      ],
    },
  };

  const seo = seoContent[lang];
  const formatCurrency = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <ToolPageWrapper toolSlug="emergency-fund-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.monthlyExpenses[lang]}
              </label>
              <input
                type="number"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(e.target.value)}
                placeholder="2500"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.monthsCoverage[lang]}
              </label>
              <input
                type="number"
                value={monthsCoverage}
                onChange={(e) => setMonthsCoverage(e.target.value)}
                placeholder="6"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.currentSavings[lang]}
              </label>
              <input
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.monthlyContribution[lang]}
              </label>
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                placeholder="300"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {exp > 0 && months > 0 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">{labels.target[lang]}</div>
                <div className="text-4xl font-bold text-gray-900">${formatCurrency(target)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">{labels.stillNeeded[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">${formatCurrency(gap)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">{labels.percentFunded[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">
                    {pctFunded.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 1,
                    })}
                    %
                  </div>
                </div>
              </div>

              {monthsToGoal > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    {labels.breakdown[lang]}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">{labels.monthsToGoal[lang]}</span>
                      <span className="font-semibold">{monthsToGoal}</span>
                    </div>
                  </div>
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
