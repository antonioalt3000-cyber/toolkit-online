'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function InsuranceDeductibleCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['insurance-deductible-calculator'][lang];

  const [premiumA, setPremiumA] = useState('');
  const [deductibleA, setDeductibleA] = useState('');
  const [premiumB, setPremiumB] = useState('');
  const [deductibleB, setDeductibleB] = useState('');
  const [expectedClaims, setExpectedClaims] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const pA = parseFloat(premiumA) || 0;
  const dA = parseFloat(deductibleA) || 0;
  const pB = parseFloat(premiumB) || 0;
  const dB = parseFloat(deductibleB) || 0;
  const claims = parseFloat(expectedClaims) || 0;

  const costA = pA + Math.min(claims, dA);
  const costB = pB + Math.min(claims, dB);
  const cheaper = costA <= costB ? 'A' : 'B';
  const savings = Math.abs(costA - costB);

  const labels = {
    planA: { en: 'Plan A', it: 'Piano A', es: 'Plan A', fr: 'Plan A', de: 'Plan A', pt: 'Plano A' },
    planB: { en: 'Plan B', it: 'Piano B', es: 'Plan B', fr: 'Plan B', de: 'Plan B', pt: 'Plano B' },
    premiumA: {
      en: 'Plan A Annual Premium ($)',
      it: 'Premio Annuo Piano A (€)',
      es: 'Prima Anual Plan A ($)',
      fr: 'Prime Annuelle Plan A (€)',
      de: 'Jahresprämie Plan A (€)',
      pt: 'Prêmio Anual Plano A (R$)',
    },
    deductibleA: {
      en: 'Plan A Deductible ($)',
      it: 'Franchigia Piano A (€)',
      es: 'Deducible Plan A ($)',
      fr: 'Franchise Plan A (€)',
      de: 'Selbstbeteiligung Plan A (€)',
      pt: 'Franquia Plano A (R$)',
    },
    premiumB: {
      en: 'Plan B Annual Premium ($)',
      it: 'Premio Annuo Piano B (€)',
      es: 'Prima Anual Plan B ($)',
      fr: 'Prime Annuelle Plan B (€)',
      de: 'Jahresprämie Plan B (€)',
      pt: 'Prêmio Anual Plano B (R$)',
    },
    deductibleB: {
      en: 'Plan B Deductible ($)',
      it: 'Franchigia Piano B (€)',
      es: 'Deducible Plan B ($)',
      fr: 'Franchise Plan B (€)',
      de: 'Selbstbeteiligung Plan B (€)',
      pt: 'Franquia Plano B (R$)',
    },
    expectedClaims: {
      en: 'Expected Annual Claims / Out-of-Pocket ($)',
      it: 'Sinistri Annui Previsti / Spese Vive (€)',
      es: 'Reclamaciones Anuales Previstas / Gastos ($)',
      fr: 'Sinistres Annuels Prévus / Reste à Charge (€)',
      de: 'Erwartete Jährliche Schadensfälle / Selbstkosten (€)',
      pt: 'Sinistros Anuais Previstos / Despesas (R$)',
    },
    totalCostA: {
      en: 'Plan A Total Annual Cost',
      it: 'Costo Annuo Totale Piano A',
      es: 'Costo Anual Total Plan A',
      fr: 'Coût Annuel Total Plan A',
      de: 'Jährliche Gesamtkosten Plan A',
      pt: 'Custo Anual Total Plano A',
    },
    totalCostB: {
      en: 'Plan B Total Annual Cost',
      it: 'Costo Annuo Totale Piano B',
      es: 'Costo Anual Total Plan B',
      fr: 'Coût Annuel Total Plan B',
      de: 'Jährliche Gesamtkosten Plan B',
      pt: 'Custo Anual Total Plano B',
    },
    cheaper: {
      en: 'is cheaper by',
      it: 'è più conveniente di',
      es: 'es más barato por',
      fr: 'est moins cher de',
      de: 'ist günstiger um',
      pt: 'é mais barato em',
    },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'Free Insurance Deductible Calculator — Compare Premium vs Deductible Trade-Off',
      paragraphs: [
        'The Insurance Deductible Calculator helps you compare two insurance plans by estimating the total annual cost of each, not just the premium. A lower premium often comes with a higher deductible, so the cheapest sticker price is rarely the cheapest plan once you factor in the claims you actually expect to file.',
        'Enter the annual premium and deductible for both plans, plus your expected annual claims or out-of-pocket spending. The tool adds each premium to the smaller of your expected claims or that plan’s deductible, because you never pay more than the deductible before coverage kicks in. It then shows which plan wins and by how much.',
        'A high-deductible plan usually makes sense if you rarely file claims: you save on premium every month and your low usage keeps out-of-pocket costs down. A low-deductible plan tends to win when you expect frequent or expensive claims, because the higher premium buys you protection you will genuinely use.',
        'Run the numbers under different claim scenarios — a healthy year, an average year, and a worst-case year — to understand the real premium vs deductible trade-off before you sign. The right choice depends on how much risk you are comfortable carrying yourself versus paying the insurer to carry for you.',
      ],
      faq: [
        {
          q: 'What is an insurance deductible?',
          a: 'A deductible is the amount you pay out of pocket on a claim before your insurer starts paying. A $500 deductible means you cover the first $500 of a covered loss, and the insurer covers the rest up to your limits.',
        },
        {
          q: 'Is a higher or lower deductible better?',
          a: 'A higher deductible lowers your premium and suits people who rarely file claims. A lower deductible raises your premium but reduces what you pay when a claim happens. This calculator shows which total cost is lower for your expected claims.',
        },
        {
          q: 'How does this calculator work?',
          a: 'For each plan it adds the annual premium to the lesser of your expected claims or the deductible, since you never pay more than the deductible. It then compares the two totals and tells you which plan is cheaper and by how much.',
        },
        {
          q: 'Why does the cheaper premium not always win?',
          a: 'A plan with a low premium but high deductible can cost more overall in a year with claims, because you pay the full deductible out of pocket. Total annual cost, not premium alone, is the number that matters.',
        },
      ],
    },
    it: {
      title: 'Calcolatore Franchigia Assicurativa Gratuito — Confronta Premio e Franchigia',
      paragraphs: [
        'Il Calcolatore Franchigia Assicurativa ti aiuta a confrontare due polizze stimando il costo annuo totale di ciascuna, non solo il premio. Un premio più basso spesso comporta una franchigia più alta, quindi il prezzo più economico raramente è la polizza più conveniente una volta considerati i sinistri che prevedi davvero.',
        'Inserisci il premio annuo e la franchigia di entrambe le polizze, più i sinistri o le spese vive che ti aspetti. Lo strumento somma ogni premio al minore tra i sinistri previsti e la franchigia della polizza, perché non paghi mai più della franchigia prima che scatti la copertura. Mostra poi quale polizza vince e di quanto.',
        'Una polizza con franchigia alta conviene se raramente presenti sinistri: risparmi sul premio ogni mese e il basso utilizzo mantiene basse le spese vive. Una polizza con franchigia bassa vince quando prevedi sinistri frequenti o costosi, perché il premio più alto compra una protezione che userai davvero.',
        'Prova i numeri in scenari diversi — un anno sano, uno medio e uno peggiore — per capire il vero compromesso tra premio e franchigia prima di firmare. La scelta giusta dipende da quanto rischio sei disposto a sostenere tu stesso.',
      ],
      faq: [
        {
          q: 'Cos’è una franchigia assicurativa?',
          a: 'La franchigia è l’importo che paghi di tasca tua su un sinistro prima che l’assicuratore inizi a pagare. Una franchigia di 500€ significa che copri i primi 500€ di una perdita coperta.',
        },
        {
          q: 'È meglio una franchigia alta o bassa?',
          a: 'Una franchigia alta riduce il premio ed è adatta a chi presenta raramente sinistri. Una franchigia bassa aumenta il premio ma riduce quanto paghi in caso di sinistro. Il calcolatore mostra quale costo totale è minore.',
        },
        {
          q: 'Come funziona questo calcolatore?',
          a: 'Per ogni polizza somma il premio annuo al minore tra i sinistri previsti e la franchigia, poiché non paghi mai più della franchigia. Confronta poi i due totali e indica quale polizza è più conveniente.',
        },
        {
          q: 'Perché il premio più basso non vince sempre?',
          a: 'Una polizza con premio basso ma franchigia alta può costare di più in un anno con sinistri, perché paghi l’intera franchigia. Conta il costo annuo totale, non solo il premio.',
        },
      ],
    },
    es: {
      title: 'Calculadora de Deducible de Seguro Gratis — Compara Prima y Deducible',
      paragraphs: [
        'La Calculadora de Deducible de Seguro te ayuda a comparar dos pólizas estimando el costo anual total de cada una, no solo la prima. Una prima más baja suele venir con un deducible más alto, así que el precio más barato rara vez es la póliza más conveniente al considerar las reclamaciones que realmente esperas.',
        'Introduce la prima anual y el deducible de ambas pólizas, más las reclamaciones o gastos que esperas. La herramienta suma cada prima al menor entre tus reclamaciones previstas y el deducible de esa póliza, porque nunca pagas más que el deducible antes de que actúe la cobertura. Luego muestra qué póliza gana y por cuánto.',
        'Una póliza con deducible alto conviene si rara vez reclamas: ahorras en prima cada mes y el bajo uso mantiene bajos los gastos. Una póliza con deducible bajo gana cuando esperas reclamaciones frecuentes o costosas, porque la prima más alta compra una protección que sí usarás.',
        'Prueba los números en distintos escenarios — un año sano, uno medio y uno peor — para entender el verdadero equilibrio entre prima y deducible antes de firmar. La elección correcta depende de cuánto riesgo estás dispuesto a asumir tú mismo.',
      ],
      faq: [
        {
          q: '¿Qué es un deducible de seguro?',
          a: 'El deducible es la cantidad que pagas de tu bolsillo en una reclamación antes de que la aseguradora empiece a pagar. Un deducible de 500$ significa que cubres los primeros 500$ de una pérdida cubierta.',
        },
        {
          q: '¿Es mejor un deducible alto o bajo?',
          a: 'Un deducible alto reduce la prima y conviene a quien rara vez reclama. Un deducible bajo sube la prima pero reduce lo que pagas al reclamar. La calculadora muestra qué costo total es menor.',
        },
        {
          q: '¿Cómo funciona esta calculadora?',
          a: 'Para cada póliza suma la prima anual al menor entre tus reclamaciones previstas y el deducible, ya que nunca pagas más que el deducible. Luego compara los dos totales.',
        },
        {
          q: '¿Por qué la prima más barata no siempre gana?',
          a: 'Una póliza con prima baja pero deducible alto puede costar más en un año con reclamaciones, porque pagas el deducible completo. Importa el costo anual total, no solo la prima.',
        },
      ],
    },
    fr: {
      title: 'Calculateur de Franchise d’Assurance Gratuit — Comparez Prime et Franchise',
      paragraphs: [
        'Le Calculateur de Franchise d’Assurance vous aide à comparer deux contrats en estimant le coût annuel total de chacun, pas seulement la prime. Une prime plus basse s’accompagne souvent d’une franchise plus élevée : le prix affiché le plus bas est rarement le contrat le plus économique une fois pris en compte les sinistres que vous attendez vraiment.',
        'Saisissez la prime annuelle et la franchise des deux contrats, ainsi que les sinistres ou le reste à charge attendus. L’outil ajoute chaque prime au plus petit entre vos sinistres prévus et la franchise du contrat, car vous ne payez jamais plus que la franchise avant que la garantie ne s’applique. Il indique ensuite quel contrat l’emporte et de combien.',
        'Un contrat à franchise élevée est intéressant si vous déclarez rarement des sinistres : vous économisez sur la prime chaque mois et le faible usage limite le reste à charge. Un contrat à franchise basse gagne quand vous prévoyez des sinistres fréquents ou coûteux, car la prime plus élevée achète une protection réellement utile.',
        'Testez les chiffres selon différents scénarios — une bonne année, une année moyenne et le pire cas — pour comprendre le véritable arbitrage prime/franchise avant de signer. Le bon choix dépend du niveau de risque que vous acceptez d’assumer vous-même.',
      ],
      faq: [
        {
          q: 'Qu’est-ce qu’une franchise d’assurance ?',
          a: 'La franchise est le montant que vous payez de votre poche sur un sinistre avant que l’assureur ne commence à payer. Une franchise de 500€ signifie que vous couvrez les 500 premiers euros d’un sinistre garanti.',
        },
        {
          q: 'Vaut-il mieux une franchise élevée ou basse ?',
          a: 'Une franchise élevée réduit la prime et convient à ceux qui déclarent rarement. Une franchise basse augmente la prime mais réduit ce que vous payez en cas de sinistre. Le calculateur montre quel coût total est le plus faible.',
        },
        {
          q: 'Comment fonctionne ce calculateur ?',
          a: 'Pour chaque contrat, il ajoute la prime annuelle au plus petit entre vos sinistres prévus et la franchise, car vous ne payez jamais plus que la franchise. Il compare ensuite les deux totaux.',
        },
        {
          q: 'Pourquoi la prime la moins chère ne gagne-t-elle pas toujours ?',
          a: 'Un contrat à prime basse mais franchise élevée peut coûter plus cher une année avec sinistres, car vous payez toute la franchise. C’est le coût annuel total qui compte.',
        },
      ],
    },
    de: {
      title: 'Kostenloser Selbstbeteiligungs-Rechner — Prämie vs Selbstbeteiligung vergleichen',
      paragraphs: [
        'Der Selbstbeteiligungs-Rechner hilft Ihnen, zwei Versicherungstarife zu vergleichen, indem er die jährlichen Gesamtkosten jedes Tarifs schätzt, nicht nur die Prämie. Eine niedrigere Prämie geht oft mit einer höheren Selbstbeteiligung einher, sodass der günstigste Preis selten der günstigste Tarif ist, wenn man die erwarteten Schadensfälle einrechnet.',
        'Geben Sie Jahresprämie und Selbstbeteiligung beider Tarife sowie Ihre erwarteten Schadensfälle oder Selbstkosten ein. Das Tool addiert jede Prämie zum kleineren Wert aus erwarteten Schadensfällen und der Selbstbeteiligung des Tarifs, da Sie nie mehr als die Selbstbeteiligung zahlen, bevor die Deckung greift. Es zeigt dann, welcher Tarif gewinnt und um wie viel.',
        'Ein Tarif mit hoher Selbstbeteiligung lohnt sich, wenn Sie selten Schadensfälle melden: Sie sparen jeden Monat an der Prämie und die geringe Nutzung hält die Selbstkosten niedrig. Ein Tarif mit niedriger Selbstbeteiligung gewinnt bei häufigen oder teuren Schadensfällen, weil die höhere Prämie echten Schutz kauft.',
        'Rechnen Sie die Zahlen in verschiedenen Szenarien durch — ein gesundes Jahr, ein durchschnittliches und ein Worst-Case-Jahr — um den echten Kompromiss zwischen Prämie und Selbstbeteiligung vor der Unterschrift zu verstehen. Die richtige Wahl hängt davon ab, wie viel Risiko Sie selbst tragen möchten.',
      ],
      faq: [
        {
          q: 'Was ist eine Selbstbeteiligung?',
          a: 'Die Selbstbeteiligung ist der Betrag, den Sie bei einem Schaden selbst zahlen, bevor der Versicherer zahlt. Eine Selbstbeteiligung von 500€ bedeutet, dass Sie die ersten 500€ eines gedeckten Schadens tragen.',
        },
        {
          q: 'Ist eine hohe oder niedrige Selbstbeteiligung besser?',
          a: 'Eine hohe Selbstbeteiligung senkt die Prämie und eignet sich für Personen, die selten Schadensfälle melden. Eine niedrige Selbstbeteiligung erhöht die Prämie, senkt aber Ihre Zahlung im Schadensfall. Der Rechner zeigt, welche Gesamtkosten niedriger sind.',
        },
        {
          q: 'Wie funktioniert dieser Rechner?',
          a: 'Für jeden Tarif addiert er die Jahresprämie zum kleineren Wert aus erwarteten Schadensfällen und Selbstbeteiligung, da Sie nie mehr als die Selbstbeteiligung zahlen. Dann vergleicht er beide Summen.',
        },
        {
          q: 'Warum gewinnt die günstigere Prämie nicht immer?',
          a: 'Ein Tarif mit niedriger Prämie, aber hoher Selbstbeteiligung kann in einem Jahr mit Schadensfällen mehr kosten, weil Sie die volle Selbstbeteiligung zahlen. Es zählen die jährlichen Gesamtkosten, nicht nur die Prämie.',
        },
      ],
    },
    pt: {
      title: 'Calculadora de Franquia de Seguro Grátis — Compare Prêmio e Franquia',
      paragraphs: [
        'A Calculadora de Franquia de Seguro ajuda a comparar duas apólices estimando o custo anual total de cada uma, não apenas o prêmio. Um prêmio mais baixo costuma vir com uma franquia mais alta, então o preço mais barato raramente é a apólice mais vantajosa quando se consideram os sinistros que você realmente espera.',
        'Insira o prêmio anual e a franquia de ambas as apólices, mais os sinistros ou despesas que você espera. A ferramenta soma cada prêmio ao menor valor entre seus sinistros previstos e a franquia da apólice, pois você nunca paga mais que a franquia antes de a cobertura entrar. Depois mostra qual apólice vence e por quanto.',
        'Uma apólice com franquia alta compensa se você raramente aciona o seguro: economiza no prêmio todo mês e o baixo uso mantém as despesas baixas. Uma apólice com franquia baixa vence quando você prevê sinistros frequentes ou caros, porque o prêmio mais alto compra uma proteção que você realmente usará.',
        'Teste os números em cenários diferentes — um ano saudável, um médio e o pior caso — para entender o verdadeiro equilíbrio entre prêmio e franquia antes de assinar. A escolha certa depende de quanto risco você aceita carregar sozinho.',
      ],
      faq: [
        {
          q: 'O que é uma franquia de seguro?',
          a: 'A franquia é o valor que você paga do próprio bolso em um sinistro antes de a seguradora começar a pagar. Uma franquia de R$500 significa que você cobre os primeiros R$500 de uma perda coberta.',
        },
        {
          q: 'Franquia alta ou baixa é melhor?',
          a: 'Uma franquia alta reduz o prêmio e serve para quem raramente aciona o seguro. Uma franquia baixa aumenta o prêmio mas reduz o que você paga no sinistro. A calculadora mostra qual custo total é menor.',
        },
        {
          q: 'Como esta calculadora funciona?',
          a: 'Para cada apólice soma o prêmio anual ao menor valor entre seus sinistros previstos e a franquia, já que você nunca paga mais que a franquia. Depois compara os dois totais.',
        },
        {
          q: 'Por que o prêmio mais barato nem sempre vence?',
          a: 'Uma apólice com prêmio baixo mas franquia alta pode custar mais em um ano com sinistros, porque você paga a franquia inteira. O que importa é o custo anual total, não só o prêmio.',
        },
      ],
    },
  };

  const seo = seoContent[lang];
  const formatCurrency = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <ToolPageWrapper toolSlug="insurance-deductible-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">{labels.planA[lang]}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.premiumA[lang]}
              </label>
              <input
                type="number"
                value={premiumA}
                onChange={(e) => setPremiumA(e.target.value)}
                placeholder="1200"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.deductibleA[lang]}
              </label>
              <input
                type="number"
                value={deductibleA}
                onChange={(e) => setDeductibleA(e.target.value)}
                placeholder="500"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-700 pt-2">{labels.planB[lang]}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.premiumB[lang]}
              </label>
              <input
                type="number"
                value={premiumB}
                onChange={(e) => setPremiumB(e.target.value)}
                placeholder="900"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.deductibleB[lang]}
              </label>
              <input
                type="number"
                value={deductibleB}
                onChange={(e) => setDeductibleB(e.target.value)}
                placeholder="1500"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.expectedClaims[lang]}
            </label>
            <input
              type="number"
              value={expectedClaims}
              onChange={(e) => setExpectedClaims(e.target.value)}
              placeholder="800"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {pA > 0 && pB > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">{labels.totalCostA[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">${formatCurrency(costA)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">{labels.totalCostB[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">${formatCurrency(costB)}</div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {`${cheaper === 'A' ? labels.planA[lang] : labels.planB[lang]} ${labels.cheaper[lang]} $${formatCurrency(savings)}`}
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
