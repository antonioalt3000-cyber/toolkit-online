'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  amount: { en: 'Loan Amount', it: 'Importo Prestito', es: 'Monto del Préstamo', fr: 'Montant du Prêt', de: 'Darlehensbetrag', pt: 'Valor do Empréstimo' },
  rate: { en: 'Annual Interest Rate (%)', it: 'Tasso Annuo (%)', es: 'Tasa Anual (%)', fr: 'Taux Annuel (%)', de: 'Jahreszins (%)', pt: 'Taxa Anual (%)' },
  years: { en: 'Loan Term (years)', it: 'Durata (anni)', es: 'Plazo (años)', fr: 'Durée (années)', de: 'Laufzeit (Jahre)', pt: 'Prazo (anos)' },
  monthly: { en: 'Monthly Payment', it: 'Rata Mensile', es: 'Pago Mensual', fr: 'Mensualité', de: 'Monatliche Rate', pt: 'Pagamento Mensal' },
  totalPaid: { en: 'Total Paid', it: 'Totale Pagato', es: 'Total Pagado', fr: 'Total Payé', de: 'Gesamtbetrag', pt: 'Total Pago' },
  totalInterest: { en: 'Total Interest', it: 'Interessi Totali', es: 'Interés Total', fr: 'Intérêts Totaux', de: 'Gesamtzinsen', pt: 'Juros Totais' },
  amortization: { en: 'Amortization Summary', it: 'Riepilogo Ammortamento', es: 'Resumen de Amortización', fr: 'Résumé Amortissement', de: 'Tilgungsübersicht', pt: 'Resumo da Amortização' },
  year: { en: 'Year', it: 'Anno', es: 'Año', fr: 'Année', de: 'Jahr', pt: 'Ano' },
  principal: { en: 'Principal', it: 'Capitale', es: 'Capital', fr: 'Capital', de: 'Tilgung', pt: 'Capital' },
  interest: { en: 'Interest', it: 'Interessi', es: 'Interés', fr: 'Intérêts', de: 'Zinsen', pt: 'Juros' },
  balance: { en: 'Balance', it: 'Saldo', es: 'Saldo', fr: 'Solde', de: 'Restschuld', pt: 'Saldo' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'How Does a Loan Calculator Work?',
    paragraphs: [
      'A loan calculator is an essential financial planning tool that helps you estimate your monthly payments, total interest costs, and repayment schedule before committing to a loan. Whether you are considering a personal loan, auto loan, or any other type of fixed-rate borrowing, understanding the true cost of credit is critical to making informed decisions and avoiding financial strain.',
      'This calculator uses the standard amortization formula to compute your monthly payment based on the loan amount, annual interest rate, and loan term in years. The formula distributes each payment between principal repayment and interest charges, with early payments going mostly toward interest and later payments primarily reducing the principal balance. The amortization table shows you exactly how this split changes over time.',
      'By experimenting with different loan amounts, interest rates, and terms, you can see how each variable affects your total cost. For example, a shorter loan term means higher monthly payments but significantly less total interest paid. Conversely, a lower interest rate reduces both your monthly payment and overall cost. Use this tool to compare different loan offers and choose the option that best fits your budget and financial goals.',
    ],
    faq: [
      { q: 'What is the formula for calculating monthly loan payments?', a: 'The formula is M = P * [r(1+r)^n] / [(1+r)^n - 1], where M is the monthly payment, P is the principal, r is the monthly interest rate (annual rate / 12), and n is the total number of payments (years x 12).' },
      { q: 'How does the loan term affect total interest paid?', a: 'A longer loan term results in lower monthly payments but significantly more total interest. For example, a $10,000 loan at 5% over 3 years costs about $787 in interest, while the same loan over 5 years costs about $1,323 — nearly 68% more.' },
      { q: 'What is an amortization schedule?', a: 'An amortization schedule is a table showing each payment broken down into principal and interest portions, along with the remaining balance. Early payments are interest-heavy, while later payments mainly reduce the principal.' },
      { q: 'Should I choose a shorter or longer loan term?', a: 'It depends on your priorities. A shorter term saves money on interest but requires higher monthly payments. A longer term is easier on your monthly budget but costs more overall. Choose based on what you can comfortably afford each month.' },
      { q: 'Does this calculator account for fees and insurance?', a: 'This calculator computes principal and interest payments only. Additional costs such as origination fees, insurance premiums, or administrative charges should be added separately to get the full cost of borrowing.' },
    ],
  },
  it: {
    title: 'Come Funziona il Calcolatore di Prestiti?',
    paragraphs: [
      'Un calcolatore di prestiti e uno strumento essenziale di pianificazione finanziaria che ti aiuta a stimare le rate mensili, i costi totali degli interessi e il piano di rimborso prima di impegnarti in un prestito. Che tu stia considerando un prestito personale, un finanziamento auto o qualsiasi altro tipo di prestito a tasso fisso, comprendere il vero costo del credito e fondamentale.',
      'Questo calcolatore utilizza la formula standard di ammortamento per calcolare la rata mensile in base all\'importo del prestito, al tasso di interesse annuo e alla durata in anni. La formula distribuisce ogni pagamento tra rimborso del capitale e interessi, con i primi pagamenti destinati principalmente agli interessi e i pagamenti successivi che riducono il capitale residuo.',
      'Sperimentando con diversi importi, tassi di interesse e durate, puoi vedere come ogni variabile influisce sul costo totale. Una durata piu breve significa rate piu alte ma significativamente meno interessi totali pagati. Usa questo strumento per confrontare diverse offerte di prestito e scegliere l\'opzione migliore per il tuo budget.',
    ],
    faq: [
      { q: 'Qual e la formula per calcolare la rata mensile di un prestito?', a: 'La formula e M = P * [r(1+r)^n] / [(1+r)^n - 1], dove M e la rata mensile, P e il capitale, r e il tasso di interesse mensile (tasso annuo / 12), e n e il numero totale di rate (anni x 12).' },
      { q: 'Come influisce la durata del prestito sugli interessi totali?', a: 'Una durata piu lunga comporta rate mensili piu basse ma molti piu interessi totali. Ad esempio, un prestito di 10.000 euro al 5% su 3 anni costa circa 787 euro di interessi, mentre su 5 anni costa circa 1.323 euro.' },
      { q: 'Cos\'e un piano di ammortamento?', a: 'Un piano di ammortamento e una tabella che mostra ogni pagamento suddiviso tra capitale e interessi, insieme al saldo residuo. I primi pagamenti sono prevalentemente di interessi, mentre quelli successivi riducono principalmente il capitale.' },
      { q: 'Meglio un prestito breve o lungo?', a: 'Dipende dalle tue priorita. Un prestito breve fa risparmiare sugli interessi ma richiede rate piu alte. Un prestito lungo e piu leggero mensilmente ma costa di piu in totale.' },
      { q: 'Questo calcolatore tiene conto di commissioni e assicurazioni?', a: 'Questo calcolatore calcola solo capitale e interessi. Costi aggiuntivi come commissioni di apertura, premi assicurativi o spese amministrative vanno aggiunti separatamente.' },
    ],
  },
  es: {
    title: 'Como Funciona la Calculadora de Prestamos?',
    paragraphs: [
      'Una calculadora de prestamos es una herramienta esencial de planificacion financiera que te ayuda a estimar tus pagos mensuales, los costos totales de intereses y el calendario de amortizacion antes de comprometerte con un prestamo. Ya sea un prestamo personal, de auto o cualquier otro tipo de financiacion a tasa fija, entender el verdadero costo del credito es fundamental.',
      'Esta calculadora utiliza la formula estandar de amortizacion para calcular tu pago mensual basandose en el monto del prestamo, la tasa de interes anual y el plazo en anos. La formula distribuye cada pago entre amortizacion del capital e intereses, con los primeros pagos destinados mayormente a intereses.',
      'Experimentando con diferentes montos, tasas y plazos, puedes ver como cada variable afecta el costo total. Un plazo mas corto significa pagos mensuales mas altos pero significativamente menos intereses totales. Usa esta herramienta para comparar diferentes ofertas de prestamos y elegir la mejor opcion para tu presupuesto.',
    ],
    faq: [
      { q: 'Cual es la formula para calcular la cuota mensual de un prestamo?', a: 'La formula es M = P * [r(1+r)^n] / [(1+r)^n - 1], donde M es el pago mensual, P es el capital, r es la tasa de interes mensual (tasa anual / 12), y n es el numero total de pagos (anos x 12).' },
      { q: 'Como afecta el plazo del prestamo al interes total?', a: 'Un plazo mas largo resulta en pagos mensuales mas bajos pero mucho mas interes total. Por ejemplo, un prestamo de 10.000 al 5% a 3 anos cuesta unos 787 en intereses, mientras que a 5 anos cuesta unos 1.323.' },
      { q: 'Que es un cuadro de amortizacion?', a: 'Un cuadro de amortizacion es una tabla que muestra cada pago dividido entre capital e intereses, junto con el saldo pendiente. Los primeros pagos son mayormente de intereses, mientras que los ultimos reducen principalmente el capital.' },
      { q: 'Es mejor un prestamo corto o largo?', a: 'Depende de tus prioridades. Un prestamo corto ahorra en intereses pero exige cuotas mas altas. Un prestamo largo es mas llevadero mensualmente pero cuesta mas en total.' },
      { q: 'Esta calculadora incluye comisiones y seguros?', a: 'Esta calculadora calcula solo capital e intereses. Costos adicionales como comisiones de apertura o seguros deben anadirse por separado.' },
    ],
  },
  fr: {
    title: 'Comment Fonctionne le Calculateur de Pret?',
    paragraphs: [
      'Un calculateur de pret est un outil essentiel de planification financiere qui vous aide a estimer vos mensualites, le cout total des interets et le calendrier de remboursement avant de vous engager. Que vous envisagiez un pret personnel, un credit auto ou tout autre type d\'emprunt a taux fixe, comprendre le veritable cout du credit est fondamental.',
      'Ce calculateur utilise la formule standard d\'amortissement pour calculer votre mensualite en fonction du montant du pret, du taux d\'interet annuel et de la duree en annees. La formule repartit chaque paiement entre remboursement du capital et interets, les premiers paiements etant principalement constitues d\'interets.',
      'En experimentant avec differents montants, taux et durees, vous pouvez voir comment chaque variable affecte le cout total. Une duree plus courte signifie des mensualites plus elevees mais nettement moins d\'interets totaux. Utilisez cet outil pour comparer les offres de pret et choisir la meilleure option pour votre budget.',
    ],
    faq: [
      { q: 'Quelle est la formule pour calculer la mensualite d\'un pret?', a: 'La formule est M = P * [r(1+r)^n] / [(1+r)^n - 1], ou M est la mensualite, P est le capital, r est le taux d\'interet mensuel (taux annuel / 12), et n est le nombre total de paiements (annees x 12).' },
      { q: 'Comment la duree du pret affecte-t-elle les interets totaux?', a: 'Une duree plus longue entraine des mensualites plus basses mais beaucoup plus d\'interets au total. Par exemple, un pret de 10 000 a 5% sur 3 ans coute environ 787 d\'interets, contre 1 323 sur 5 ans.' },
      { q: 'Qu\'est-ce qu\'un tableau d\'amortissement?', a: 'Un tableau d\'amortissement est un tableau montrant chaque paiement ventile entre capital et interets, avec le solde restant. Les premiers paiements sont principalement constitues d\'interets, tandis que les derniers reduisent le capital.' },
      { q: 'Vaut-il mieux un pret court ou long?', a: 'Cela depend de vos priorites. Un pret court economise sur les interets mais exige des mensualites plus elevees. Un pret long est plus confortable mensuellement mais coute plus au total.' },
      { q: 'Ce calculateur inclut-il les frais et assurances?', a: 'Ce calculateur ne calcule que le capital et les interets. Les frais supplementaires comme les frais de dossier ou les assurances doivent etre ajoutes separement.' },
    ],
  },
  de: {
    title: 'Wie funktioniert der Kreditrechner?',
    paragraphs: [
      'Ein Kreditrechner ist ein unverzichtbares Finanzplanungstool, das Ihnen hilft, monatliche Raten, Gesamtzinskosten und den Tilgungsplan abzuschaetzen, bevor Sie sich fuer einen Kredit entscheiden. Ob Privatkredit, Autofinanzierung oder andere Festzinskredite — das Verstaendnis der wahren Kreditkosten ist entscheidend.',
      'Dieser Rechner verwendet die Standard-Tilgungsformel, um Ihre monatliche Rate auf Basis des Darlehensbetrags, des Jahreszinses und der Laufzeit in Jahren zu berechnen. Die Formel verteilt jede Zahlung zwischen Kapitalrueckzahlung und Zinsen, wobei fruehe Zahlungen hauptsaechlich auf Zinsen entfallen.',
      'Durch Experimentieren mit verschiedenen Betraegen, Zinssaetzen und Laufzeiten sehen Sie, wie jede Variable die Gesamtkosten beeinflusst. Eine kuerzere Laufzeit bedeutet hoehere monatliche Raten, aber deutlich weniger Gesamtzinsen. Nutzen Sie dieses Tool, um verschiedene Kreditangebote zu vergleichen.',
    ],
    faq: [
      { q: 'Wie lautet die Formel fuer die monatliche Kreditrate?', a: 'Die Formel lautet M = P * [r(1+r)^n] / [(1+r)^n - 1], wobei M die monatliche Rate, P der Darlehensbetrag, r der monatliche Zinssatz (Jahreszins / 12) und n die Gesamtzahl der Zahlungen (Jahre x 12) ist.' },
      { q: 'Wie wirkt sich die Laufzeit auf die Gesamtzinsen aus?', a: 'Eine laengere Laufzeit fuehrt zu niedrigeren monatlichen Raten, aber deutlich hoeheren Gesamtzinsen. Zum Beispiel kostet ein Darlehen ueber 10.000 Euro bei 5% auf 3 Jahre etwa 787 Euro Zinsen, auf 5 Jahre jedoch etwa 1.323 Euro.' },
      { q: 'Was ist ein Tilgungsplan?', a: 'Ein Tilgungsplan zeigt jede Zahlung aufgeteilt in Kapital und Zinsen samt Restschuld. Fruehe Zahlungen bestehen hauptsaechlich aus Zinsen, spaetere tilgen vor allem das Kapital.' },
      { q: 'Ist ein kurzer oder langer Kredit besser?', a: 'Das haengt von Ihren Prioritaeten ab. Ein kurzer Kredit spart Zinsen, erfordert aber hoehere Raten. Ein langer Kredit ist monatlich bequemer, kostet aber insgesamt mehr.' },
      { q: 'Beruecksichtigt dieser Rechner Gebuehren und Versicherungen?', a: 'Dieser Rechner berechnet nur Kapital und Zinsen. Zusaetzliche Kosten wie Bearbeitungsgebuehren oder Versicherungen muessen separat hinzugerechnet werden.' },
    ],
  },
  pt: {
    title: 'Como Funciona a Calculadora de Emprestimos?',
    paragraphs: [
      'Uma calculadora de emprestimos e uma ferramenta essencial de planeamento financeiro que ajuda a estimar as prestacoes mensais, os custos totais de juros e o calendario de amortizacao antes de se comprometer com um emprestimo. Seja um emprestimo pessoal, automovel ou qualquer outro tipo de financiamento a taxa fixa, compreender o verdadeiro custo do credito e fundamental.',
      'Esta calculadora utiliza a formula padrao de amortizacao para calcular a sua prestacao mensal com base no valor do emprestimo, na taxa de juro anual e no prazo em anos. A formula distribui cada pagamento entre amortizacao do capital e juros, com os primeiros pagamentos destinados maioritariamente a juros.',
      'Ao experimentar com diferentes valores, taxas e prazos, pode ver como cada variavel afeta o custo total. Um prazo mais curto significa prestacoes mais altas mas significativamente menos juros totais. Use esta ferramenta para comparar diferentes ofertas de emprestimo e escolher a melhor opcao para o seu orcamento.',
    ],
    faq: [
      { q: 'Qual e a formula para calcular a prestacao mensal de um emprestimo?', a: 'A formula e M = P * [r(1+r)^n] / [(1+r)^n - 1], onde M e a prestacao mensal, P e o capital, r e a taxa de juro mensal (taxa anual / 12), e n e o numero total de pagamentos (anos x 12).' },
      { q: 'Como afeta o prazo do emprestimo os juros totais?', a: 'Um prazo mais longo resulta em prestacoes mais baixas mas muito mais juros totais. Por exemplo, um emprestimo de 10.000 a 5% a 3 anos custa cerca de 787 em juros, enquanto a 5 anos custa cerca de 1.323.' },
      { q: 'O que e um plano de amortizacao?', a: 'Um plano de amortizacao e uma tabela que mostra cada pagamento dividido entre capital e juros, junto com o saldo devedor. Os primeiros pagamentos sao maioritariamente de juros, enquanto os ultimos reduzem principalmente o capital.' },
      { q: 'E melhor um emprestimo curto ou longo?', a: 'Depende das suas prioridades. Um emprestimo curto poupa nos juros mas exige prestacoes mais altas. Um emprestimo longo e mais confortavel mensalmente mas custa mais no total.' },
      { q: 'Esta calculadora inclui comissoes e seguros?', a: 'Esta calculadora calcula apenas capital e juros. Custos adicionais como comissoes de abertura ou seguros devem ser adicionados separadamente.' },
    ],
  },
};

export default function LoanCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['loan-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');

  const principal = parseFloat(amount) || 0;
  const annualRate = parseFloat(rate) || 0;
  const term = parseInt(years) || 0;
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = term * 12;

  let monthlyPayment = 0;
  let totalPaid = 0;
  let totalInterest = 0;

  if (principal > 0 && annualRate > 0 && term > 0) {
    monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    totalPaid = monthlyPayment * numPayments;
    totalInterest = totalPaid - principal;
  } else if (principal > 0 && annualRate === 0 && term > 0) {
    monthlyPayment = principal / numPayments;
    totalPaid = principal;
    totalInterest = 0;
  }

  const amortizationByYear: { year: number; principalPaid: number; interestPaid: number; balance: number }[] = [];
  if (monthlyPayment > 0 && annualRate > 0) {
    let bal = principal;
    for (let y = 1; y <= term; y++) {
      let yPrincipal = 0;
      let yInterest = 0;
      for (let m = 0; m < 12; m++) {
        const intPart = bal * monthlyRate;
        const prinPart = monthlyPayment - intPart;
        yInterest += intPart;
        yPrincipal += prinPart;
        bal -= prinPart;
      }
      amortizationByYear.push({ year: y, principalPaid: yPrincipal, interestPaid: yInterest, balance: Math.max(bal, 0) });
    }
  }

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="loan-calculator">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {[
            { key: 'amount', value: amount, setter: setAmount, type: 'number' },
            { key: 'rate', value: rate, setter: setRate, type: 'number' },
            { key: 'years', value: years, setter: setYears, type: 'number' },
          ].map(({ key, value, setter, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(key)}</label>
              <input
                type={type}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}

          {monthlyPayment > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('monthly')}</span>
                <span className="font-bold text-blue-600 text-lg">${monthlyPayment.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('totalPaid')}</span>
                <span className="font-semibold">${totalPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('totalInterest')}</span>
                <span className="font-semibold text-red-600">${totalInterest.toFixed(2)}</span>
              </div>
            </div>
          )}

          {amortizationByYear.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">{t('amortization')}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-2 py-1 text-left">{t('year')}</th>
                      <th className="px-2 py-1 text-right">{t('principal')}</th>
                      <th className="px-2 py-1 text-right">{t('interest')}</th>
                      <th className="px-2 py-1 text-right">{t('balance')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortizationByYear.map((row) => (
                      <tr key={row.year} className="border-t border-gray-100">
                        <td className="px-2 py-1">{row.year}</td>
                        <td className="px-2 py-1 text-right">${row.principalPaid.toFixed(2)}</td>
                        <td className="px-2 py-1 text-right">${row.interestPaid.toFixed(2)}</td>
                        <td className="px-2 py-1 text-right">${row.balance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
