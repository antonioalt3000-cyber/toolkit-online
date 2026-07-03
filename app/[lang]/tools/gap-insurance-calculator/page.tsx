'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function GapInsuranceCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['gap-insurance-calculator'][lang];

  const [carValue, setCarValue] = useState('');
  const [loanBalance, setLoanBalance] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const value = parseFloat(carValue) || 0;
  const loan = parseFloat(loanBalance) || 0;
  const gap = Math.max(0, loan - value);
  const isUnderwater = loan > value;

  const labels = {
    carValue: {
      en: 'Current Car Value (ACV)',
      it: 'Valore Attuale Auto (ACV)',
      es: 'Valor Actual del Coche (ACV)',
      fr: 'Valeur Actuelle du Véhicule (ACV)',
      de: 'Aktueller Fahrzeugwert (ACV)',
      pt: 'Valor Atual do Carro (ACV)',
    },
    loanBalance: {
      en: 'Loan / Lease Balance',
      it: 'Saldo Prestito / Leasing',
      es: 'Saldo del Préstamo / Leasing',
      fr: 'Solde du Prêt / Location',
      de: 'Kredit- / Leasingsaldo',
      pt: 'Saldo do Empréstimo / Leasing',
    },
    coverageGap: {
      en: 'Coverage Gap',
      it: 'Divario di Copertura',
      es: 'Brecha de Cobertura',
      fr: 'Écart de Couverture',
      de: 'Deckungslücke',
      pt: 'Lacuna de Cobertura',
    },
    gapExplainer: {
      en: 'This is the amount gap insurance would pay after a total loss.',
      it: "Questo è l'importo che l'assicurazione gap pagherebbe dopo una perdita totale.",
      es: 'Esta es la cantidad que el seguro gap pagaría tras una pérdida total.',
      fr: "C'est le montant que l'assurance gap paierait après une perte totale.",
      de: 'Dies ist der Betrag, den die GAP-Versicherung nach einem Totalschaden zahlen würde.',
      pt: 'Este é o valor que o seguro gap pagaria após uma perda total.',
    },
    recommended: {
      en: 'You are underwater on your loan. Gap insurance is recommended to cover the shortfall.',
      it: "Sei in perdita sul prestito. L'assicurazione gap è consigliata per coprire la differenza.",
      es: 'Estás en negativo con tu préstamo. Se recomienda el seguro gap para cubrir la diferencia.',
      fr: "Vous êtes en situation négative sur votre prêt. L'assurance gap est recommandée pour couvrir l'écart.",
      de: 'Sie sind bei Ihrem Kredit unter Wasser. Eine GAP-Versicherung wird empfohlen, um die Lücke zu decken.',
      pt: 'Você está negativo no seu empréstimo. O seguro gap é recomendado para cobrir a diferença.',
    },
    notNeeded: {
      en: 'Your car value covers your loan balance. Gap insurance is likely unnecessary.',
      it: "Il valore della tua auto copre il saldo del prestito. L'assicurazione gap probabilmente non è necessaria.",
      es: 'El valor de tu coche cubre el saldo del préstamo. El seguro gap probablemente no sea necesario.',
      fr: "La valeur de votre véhicule couvre le solde de votre prêt. L'assurance gap est probablement inutile.",
      de: 'Der Wert Ihres Fahrzeugs deckt Ihren Kreditsaldo. Eine GAP-Versicherung ist wahrscheinlich unnötig.',
      pt: 'O valor do seu carro cobre o saldo do empréstimo. O seguro gap provavelmente é desnecessário.',
    },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'Free Gap Insurance Calculator — See If You Are Underwater on Your Car Loan',
      paragraphs: [
        "The Gap Insurance Calculator shows you whether you are underwater (also called upside-down) on your car loan. It compares your vehicle's actual cash value (ACV) with your remaining loan or lease balance to reveal the coverage gap.",
        'Gap insurance matters because a standard auto policy only pays out the ACV if your car is totaled or stolen. If you still owe more than the car is worth, you would be left paying the difference out of pocket. Gap insurance covers exactly that shortfall.',
        'New cars can lose 20% or more of their value in the first year, so buyers with small down payments, long loan terms, or high interest rates are especially likely to be upside-down early in the loan. This calculator helps you see your exposure at a glance.',
        'Enter your current car value and your loan or lease balance to instantly see the gap. If the gap is greater than zero, gap insurance is worth considering. Once your ACV exceeds your loan balance, you can usually drop the coverage to save money.',
      ],
      faq: [
        {
          q: 'What is gap insurance?',
          a: "Gap insurance covers the difference between what you owe on your car loan and the car's actual cash value if it is totaled or stolen. It protects you from paying the shortfall out of pocket.",
        },
        {
          q: 'What does it mean to be underwater on a car loan?',
          a: 'Being underwater (or upside-down) means you owe more on your loan than the car is currently worth. In that situation a total-loss payout would not cover your remaining balance.',
        },
        {
          q: 'How is the coverage gap calculated?',
          a: "The gap is your loan or lease balance minus the car's actual cash value (ACV). If your balance is $22,000 and the ACV is $18,000, the coverage gap is $4,000.",
        },
        {
          q: 'When should I cancel gap insurance?',
          a: "You can usually drop gap insurance once your car's ACV is equal to or greater than your loan balance, because there is no longer a gap for it to cover.",
        },
      ],
    },
    it: {
      title: 'Calcolatore Assicurazione Gap Gratuito — Scopri se Sei in Perdita sul Prestito Auto',
      paragraphs: [
        'Il Calcolatore Assicurazione Gap ti mostra se sei in perdita (o "sottacqua") sul prestito auto. Confronta il valore effettivo di mercato (ACV) del veicolo con il saldo residuo del prestito o del leasing per rivelare il divario di copertura.',
        "L'assicurazione gap è importante perché una polizza auto standard rimborsa solo l'ACV se l'auto viene distrutta o rubata. Se devi ancora più di quanto vale l'auto, dovresti pagare la differenza di tasca tua. L'assicurazione gap copre proprio quella differenza.",
        "Le auto nuove possono perdere il 20% o più del valore nel primo anno, quindi chi ha un anticipo basso, prestiti lunghi o tassi elevati rischia di essere in perdita fin da subito. Questo calcolatore ti mostra la tua esposizione a colpo d'occhio.",
        "Inserisci il valore attuale dell'auto e il saldo del prestito o del leasing per vedere subito il divario. Se il divario è maggiore di zero, vale la pena considerare l'assicurazione gap. Quando l'ACV supera il saldo, puoi di solito eliminare la copertura per risparmiare.",
      ],
      faq: [
        {
          q: "Cos'è l'assicurazione gap?",
          a: "L'assicurazione gap copre la differenza tra quanto devi sul prestito auto e il valore effettivo di mercato dell'auto in caso di distruzione o furto. Ti protegge dal pagare la differenza di tasca tua.",
        },
        {
          q: 'Cosa significa essere in perdita sul prestito auto?',
          a: 'Essere in perdita (o "sottacqua") significa dovere più sul prestito di quanto valga attualmente l\'auto. In quel caso un rimborso per perdita totale non coprirebbe il saldo residuo.',
        },
        {
          q: 'Come si calcola il divario di copertura?',
          a: "Il divario è il saldo del prestito o leasing meno il valore effettivo di mercato (ACV) dell'auto. Se il saldo è 22.000€ e l'ACV è 18.000€, il divario è 4.000€.",
        },
        {
          q: "Quando dovrei annullare l'assicurazione gap?",
          a: "Di solito puoi eliminare l'assicurazione gap quando l'ACV dell'auto è pari o superiore al saldo del prestito, perché non c'è più alcun divario da coprire.",
        },
      ],
    },
    es: {
      title: 'Calculadora de Seguro Gap Gratis — Descubre si Estás en Negativo con tu Préstamo',
      paragraphs: [
        'La Calculadora de Seguro Gap te muestra si estás en negativo (también llamado "bajo el agua") con tu préstamo de coche. Compara el valor real en efectivo (ACV) de tu vehículo con el saldo restante del préstamo o leasing para revelar la brecha de cobertura.',
        'El seguro gap importa porque una póliza de auto estándar solo paga el ACV si el coche queda siniestrado o es robado. Si aún debes más de lo que vale el coche, tendrías que pagar la diferencia de tu bolsillo. El seguro gap cubre exactamente esa diferencia.',
        'Los coches nuevos pueden perder el 20% o más de su valor el primer año, así que quienes tienen poca entrada, plazos largos o intereses altos suelen quedar en negativo desde el principio. Esta calculadora te muestra tu exposición de un vistazo.',
        'Introduce el valor actual del coche y el saldo del préstamo o leasing para ver la brecha al instante. Si la brecha es mayor que cero, vale la pena considerar el seguro gap. Cuando el ACV supera el saldo, normalmente puedes cancelar la cobertura para ahorrar.',
      ],
      faq: [
        {
          q: '¿Qué es el seguro gap?',
          a: 'El seguro gap cubre la diferencia entre lo que debes del préstamo del coche y el valor real en efectivo del coche si queda siniestrado o es robado. Te protege de pagar la diferencia de tu bolsillo.',
        },
        {
          q: '¿Qué significa estar en negativo con un préstamo de coche?',
          a: 'Estar en negativo (o "bajo el agua") significa deber más del préstamo de lo que vale actualmente el coche. En ese caso, una indemnización por pérdida total no cubriría tu saldo restante.',
        },
        {
          q: '¿Cómo se calcula la brecha de cobertura?',
          a: 'La brecha es el saldo del préstamo o leasing menos el valor real en efectivo (ACV) del coche. Si el saldo es 22.000€ y el ACV es 18.000€, la brecha es 4.000€.',
        },
        {
          q: '¿Cuándo debo cancelar el seguro gap?',
          a: 'Normalmente puedes cancelar el seguro gap cuando el ACV del coche es igual o mayor que el saldo del préstamo, porque ya no hay brecha que cubrir.',
        },
      ],
    },
    fr: {
      title:
        "Calculateur d'Assurance Gap Gratuit — Voyez si Vous Êtes en Situation Négative sur Votre Prêt",
      paragraphs: [
        "Le Calculateur d'Assurance Gap vous indique si vous êtes en situation négative (aussi appelée \"sous l'eau\") sur votre prêt auto. Il compare la valeur de marché réelle (ACV) de votre véhicule au solde restant de votre prêt ou location pour révéler l'écart de couverture.",
        "L'assurance gap est importante car une police auto standard ne rembourse que l'ACV si votre voiture est détruite ou volée. Si vous devez encore plus que la valeur du véhicule, vous devriez payer la différence de votre poche. L'assurance gap couvre précisément cet écart.",
        "Les voitures neuves peuvent perdre 20% ou plus de leur valeur la première année, donc les acheteurs avec un faible apport, des prêts longs ou des taux élevés se retrouvent souvent en négatif dès le début. Ce calculateur vous montre votre exposition en un coup d'œil.",
        "Saisissez la valeur actuelle de votre voiture et le solde de votre prêt ou location pour voir l'écart instantanément. Si l'écart est supérieur à zéro, l'assurance gap mérite réflexion. Lorsque l'ACV dépasse le solde, vous pouvez généralement résilier la couverture pour économiser.",
      ],
      faq: [
        {
          q: "Qu'est-ce que l'assurance gap ?",
          a: "L'assurance gap couvre la différence entre ce que vous devez sur votre prêt auto et la valeur de marché réelle de la voiture si elle est détruite ou volée. Elle vous évite de payer l'écart de votre poche.",
        },
        {
          q: 'Que signifie être en situation négative sur un prêt auto ?',
          a: 'Être en négatif (ou "sous l\'eau") signifie devoir plus sur votre prêt que la valeur actuelle de la voiture. Dans ce cas, une indemnisation pour perte totale ne couvrirait pas votre solde restant.',
        },
        {
          q: "Comment l'écart de couverture est-il calculé ?",
          a: "L'écart correspond au solde de votre prêt ou location moins la valeur de marché réelle (ACV) de la voiture. Si le solde est de 22 000€ et l'ACV de 18 000€, l'écart est de 4 000€.",
        },
        {
          q: "Quand dois-je résilier l'assurance gap ?",
          a: "Vous pouvez généralement résilier l'assurance gap lorsque l'ACV de la voiture est égal ou supérieur au solde du prêt, car il n'y a plus d'écart à couvrir.",
        },
      ],
    },
    de: {
      title:
        'Kostenloser GAP-Versicherungsrechner — Prüfen Sie, ob Sie bei Ihrem Autokredit unter Wasser Sind',
      paragraphs: [
        'Der GAP-Versicherungsrechner zeigt Ihnen, ob Sie bei Ihrem Autokredit unter Wasser (auch "kopfüber" genannt) sind. Er vergleicht den tatsächlichen Marktwert (ACV) Ihres Fahrzeugs mit dem verbleibenden Kredit- oder Leasingsaldo, um die Deckungslücke aufzuzeigen.',
        'Die GAP-Versicherung ist wichtig, weil eine Standard-Autoversicherung bei Totalschaden oder Diebstahl nur den ACV auszahlt. Wenn Sie noch mehr schulden, als das Auto wert ist, müssten Sie die Differenz aus eigener Tasche zahlen. Die GAP-Versicherung deckt genau diese Lücke.',
        'Neuwagen können im ersten Jahr 20% oder mehr an Wert verlieren, daher sind Käufer mit geringer Anzahlung, langen Laufzeiten oder hohen Zinsen besonders früh unter Wasser. Dieser Rechner zeigt Ihr Risiko auf einen Blick.',
        'Geben Sie den aktuellen Fahrzeugwert und Ihren Kredit- oder Leasingsaldo ein, um die Lücke sofort zu sehen. Ist die Lücke größer als null, lohnt sich eine GAP-Versicherung. Sobald der ACV den Saldo übersteigt, können Sie die Deckung meist kündigen und sparen.',
      ],
      faq: [
        {
          q: 'Was ist eine GAP-Versicherung?',
          a: 'Die GAP-Versicherung deckt die Differenz zwischen dem, was Sie für Ihren Autokredit schulden, und dem tatsächlichen Marktwert des Autos bei Totalschaden oder Diebstahl. Sie schützt Sie davor, die Differenz selbst zu zahlen.',
        },
        {
          q: 'Was bedeutet es, bei einem Autokredit unter Wasser zu sein?',
          a: 'Unter Wasser (oder "kopfüber") zu sein bedeutet, mehr für den Kredit zu schulden, als das Auto aktuell wert ist. In diesem Fall würde eine Totalschadenauszahlung Ihren Restsaldo nicht decken.',
        },
        {
          q: 'Wie wird die Deckungslücke berechnet?',
          a: 'Die Lücke ist Ihr Kredit- oder Leasingsaldo minus dem tatsächlichen Marktwert (ACV) des Autos. Beträgt der Saldo 22.000€ und der ACV 18.000€, liegt die Deckungslücke bei 4.000€.',
        },
        {
          q: 'Wann sollte ich die GAP-Versicherung kündigen?',
          a: 'Sie können die GAP-Versicherung in der Regel kündigen, sobald der ACV des Autos gleich oder höher als der Kreditsaldo ist, da dann keine Lücke mehr zu decken ist.',
        },
      ],
    },
    pt: {
      title:
        'Calculadora de Seguro Gap Grátis — Veja se Você Está Negativo no Financiamento do Carro',
      paragraphs: [
        'A Calculadora de Seguro Gap mostra se você está negativo (também chamado de "de cabeça para baixo") no financiamento do carro. Ela compara o valor real de mercado (ACV) do seu veículo com o saldo restante do financiamento ou leasing para revelar a lacuna de cobertura.',
        'O seguro gap é importante porque uma apólice de auto padrão só paga o ACV se o carro for perda total ou roubado. Se você ainda deve mais do que o carro vale, teria de pagar a diferença do próprio bolso. O seguro gap cobre exatamente essa diferença.',
        'Carros novos podem perder 20% ou mais do valor no primeiro ano, então quem tem entrada baixa, prazos longos ou juros altos costuma ficar negativo logo no início. Esta calculadora mostra sua exposição de relance.',
        'Digite o valor atual do carro e o saldo do financiamento ou leasing para ver a lacuna na hora. Se a lacuna for maior que zero, vale a pena considerar o seguro gap. Quando o ACV ultrapassa o saldo, você geralmente pode cancelar a cobertura para economizar.',
      ],
      faq: [
        {
          q: 'O que é seguro gap?',
          a: 'O seguro gap cobre a diferença entre o que você deve no financiamento do carro e o valor real de mercado do carro se ele for perda total ou roubado. Ele protege você de pagar a diferença do próprio bolso.',
        },
        {
          q: 'O que significa estar negativo em um financiamento de carro?',
          a: 'Estar negativo (ou "de cabeça para baixo") significa dever mais no financiamento do que o carro vale atualmente. Nesse caso, uma indenização por perda total não cobriria seu saldo restante.',
        },
        {
          q: 'Como a lacuna de cobertura é calculada?',
          a: 'A lacuna é o saldo do financiamento ou leasing menos o valor real de mercado (ACV) do carro. Se o saldo for R$22.000 e o ACV for R$18.000, a lacuna de cobertura é de R$4.000.',
        },
        {
          q: 'Quando devo cancelar o seguro gap?',
          a: 'Você geralmente pode cancelar o seguro gap quando o ACV do carro for igual ou maior que o saldo do financiamento, pois não há mais lacuna a cobrir.',
        },
      ],
    },
  };

  const seo = seoContent[lang];
  const formatCurrency = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <ToolPageWrapper toolSlug="gap-insurance-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.carValue[lang]}
              </label>
              <input
                type="number"
                value={carValue}
                onChange={(e) => setCarValue(e.target.value)}
                placeholder="18000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.loanBalance[lang]}
              </label>
              <input
                type="number"
                value={loanBalance}
                onChange={(e) => setLoanBalance(e.target.value)}
                placeholder="22000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {value > 0 && loan > 0 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">
                  {labels.coverageGap[lang]}
                </div>
                <div className="text-4xl font-bold text-gray-900">${formatCurrency(gap)}</div>
                <div className="text-xs text-gray-500 mt-2">{labels.gapExplainer[lang]}</div>
              </div>

              {isUnderwater ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center text-amber-800">
                  {labels.recommended[lang]} (${formatCurrency(gap)})
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-green-700">
                  {labels.notNeeded[lang]}
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
