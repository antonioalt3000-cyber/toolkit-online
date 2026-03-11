'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  propertyValue: { en: 'Property Value', it: 'Valore Immobile', es: 'Valor de la Propiedad', fr: 'Valeur du Bien', de: 'Immobilienwert', pt: 'Valor do Imóvel' },
  downPayment: { en: 'Down Payment', it: 'Anticipo', es: 'Entrada', fr: 'Apport', de: 'Anzahlung', pt: 'Entrada' },
  interestRate: { en: 'Interest Rate (%/year)', it: 'Tasso d\'Interesse (%/anno)', es: 'Tasa de Interés (%/año)', fr: 'Taux d\'Intérêt (%/an)', de: 'Zinssatz (%/Jahr)', pt: 'Taxa de Juros (%/ano)' },
  years: { en: 'Loan Term (years)', it: 'Durata (anni)', es: 'Plazo (años)', fr: 'Durée (années)', de: 'Laufzeit (Jahre)', pt: 'Prazo (anos)' },
  monthlyPayment: { en: 'Monthly Payment', it: 'Rata Mensile', es: 'Pago Mensual', fr: 'Mensualité', de: 'Monatliche Rate', pt: 'Parcela Mensal' },
  loanAmount: { en: 'Loan Amount', it: 'Importo Prestito', es: 'Monto del Préstamo', fr: 'Montant du Prêt', de: 'Darlehensbetrag', pt: 'Valor do Empréstimo' },
  totalInterest: { en: 'Total Interest', it: 'Interessi Totali', es: 'Interés Total', fr: 'Intérêts Totaux', de: 'Gesamtzinsen', pt: 'Juros Totais' },
  totalCost: { en: 'Total Cost', it: 'Costo Totale', es: 'Costo Total', fr: 'Coût Total', de: 'Gesamtkosten', pt: 'Custo Total' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'How to Calculate Your Monthly Mortgage Payment',
    paragraphs: [
      'A mortgage is the largest financial commitment most people make in their lifetime. Understanding how your monthly payment is calculated — and how different factors affect it — is essential for making a sound home-buying decision. The key variables are the property price, your down payment, the interest rate, and the loan term in years.',
      'Our mortgage calculator uses the standard amortization formula to estimate your monthly payment, total interest costs, and the overall price you will pay for your home over the life of the loan. By adjusting the down payment or interest rate, you can see how even small changes dramatically impact your total cost. A larger down payment reduces both your monthly payment and total interest, while a lower interest rate can save you tens of thousands over the loan term.',
      'Before committing to a mortgage, use this calculator to compare different scenarios. Try different loan terms — 15, 20, 25, or 30 years — to see how each affects your monthly budget and total cost. Remember that the monthly payment shown here covers only principal and interest; your actual payment may include property taxes, homeowner insurance, and possibly private mortgage insurance (PMI) if your down payment is less than 20%.',
    ],
    faq: [
      { q: 'How much down payment do I need for a mortgage?', a: 'Conventional mortgages typically require 10-20% down. Some government-backed loans allow as little as 3-5% down. A larger down payment reduces your loan amount, monthly payment, and total interest paid.' },
      { q: 'What is the difference between a 15-year and 30-year mortgage?', a: 'A 15-year mortgage has higher monthly payments but costs significantly less in total interest. A 30-year mortgage is more affordable monthly but can cost nearly double in interest over the loan life.' },
      { q: 'How does the interest rate affect my mortgage cost?', a: 'Even a 0.5% difference in interest rate can change your total cost by thousands. For a $250,000 loan over 25 years, going from 3.5% to 4% adds roughly $25,000 in total interest.' },
      { q: 'Does this calculator include property taxes and insurance?', a: 'This calculator estimates principal and interest payments only. Property taxes, homeowner insurance, PMI, and HOA fees are additional costs that vary by location and should be factored into your budget separately.' },
      { q: 'Can I pay off my mortgage faster by making extra payments?', a: 'Yes. Even small additional monthly payments toward the principal can significantly reduce your total interest and shorten the loan term. For example, paying an extra $100/month on a $200,000 mortgage at 4% can save over $26,000 in interest and cut the term by about 5 years.' },
    ],
  },
  it: {
    title: 'Come Calcolare la Rata del Mutuo Mensile',
    paragraphs: [
      'Il mutuo e il piu grande impegno finanziario che la maggior parte delle persone assume nella vita. Capire come viene calcolata la rata mensile — e come i diversi fattori la influenzano — e essenziale per prendere una decisione immobiliare consapevole. Le variabili chiave sono il prezzo dell\'immobile, l\'anticipo, il tasso di interesse e la durata del prestito.',
      'Il nostro calcolatore di mutui utilizza la formula standard di ammortamento per stimare la rata mensile, gli interessi totali e il costo complessivo dell\'abitazione. Modificando l\'anticipo o il tasso di interesse, puoi vedere come anche piccoli cambiamenti impattino drasticamente sul costo totale. Un anticipo maggiore riduce sia la rata che gli interessi totali.',
      'Prima di impegnarti in un mutuo, usa questo calcolatore per confrontare diversi scenari. Prova durate diverse — 15, 20, 25 o 30 anni — per vedere come ciascuna influisce sul tuo budget mensile. Ricorda che la rata mostrata copre solo capitale e interessi; il pagamento effettivo puo includere tasse sulla proprieta e assicurazione.',
    ],
    faq: [
      { q: 'Quanto anticipo serve per un mutuo?', a: 'I mutui tradizionali richiedono tipicamente il 10-20% di anticipo. Alcune soluzioni permettono anche il 5%. Un anticipo maggiore riduce l\'importo del prestito, la rata mensile e gli interessi totali.' },
      { q: 'Qual e la differenza tra un mutuo a 15 e a 30 anni?', a: 'Un mutuo a 15 anni ha rate piu alte ma costa significativamente meno in interessi totali. Un mutuo a 30 anni e piu accessibile mensilmente ma puo costare quasi il doppio in interessi.' },
      { q: 'Come influisce il tasso di interesse sul costo del mutuo?', a: 'Anche una differenza dello 0,5% nel tasso puo cambiare il costo totale di migliaia di euro. Per un prestito di 200.000 euro su 25 anni, passare dal 3,5% al 4% aggiunge circa 20.000 euro di interessi.' },
      { q: 'Questo calcolatore include tasse e assicurazioni?', a: 'Questo calcolatore stima solo le rate di capitale e interessi. Tasse sulla proprieta, assicurazione e altre spese variano per localita e vanno considerate separatamente.' },
      { q: 'Posso estinguere il mutuo piu velocemente con rate extra?', a: 'Si. Anche piccoli pagamenti aggiuntivi verso il capitale possono ridurre significativamente gli interessi totali e accorciare la durata del mutuo.' },
    ],
  },
  es: {
    title: 'Como Calcular tu Cuota Hipotecaria Mensual',
    paragraphs: [
      'La hipoteca es el mayor compromiso financiero que la mayoria de personas asumen en su vida. Entender como se calcula la cuota mensual — y como diferentes factores la afectan — es esencial para tomar una decision inmobiliaria acertada. Las variables clave son el precio de la propiedad, la entrada, el tipo de interes y el plazo del prestamo.',
      'Nuestra calculadora hipotecaria utiliza la formula estandar de amortizacion para estimar tu cuota mensual, los intereses totales y el costo global de la vivienda. Al ajustar la entrada o el tipo de interes, puedes ver como incluso pequenos cambios impactan dramaticamente en el costo total.',
      'Antes de comprometerte con una hipoteca, usa esta calculadora para comparar diferentes escenarios. Prueba diferentes plazos — 15, 20, 25 o 30 anos — para ver como cada uno afecta tu presupuesto mensual y costo total.',
    ],
    faq: [
      { q: 'Cuanta entrada necesito para una hipoteca?', a: 'Las hipotecas convencionales suelen requerir un 10-20% de entrada. Algunas permiten hasta un 5%. Una entrada mayor reduce el importe del prestamo, la cuota mensual y los intereses totales.' },
      { q: 'Cual es la diferencia entre una hipoteca a 15 y a 30 anos?', a: 'Una hipoteca a 15 anos tiene cuotas mas altas pero cuesta significativamente menos en intereses. Una a 30 anos es mas asequible mensualmente pero puede costar casi el doble en intereses.' },
      { q: 'Como afecta el tipo de interes al costo de la hipoteca?', a: 'Incluso una diferencia del 0,5% puede cambiar el costo total en miles. Para un prestamo de 250.000 a 25 anos, pasar del 3,5% al 4% anade unos 25.000 en intereses.' },
      { q: 'Esta calculadora incluye impuestos y seguros?', a: 'Esta calculadora estima solo las cuotas de capital e intereses. Impuestos sobre la propiedad y seguros son costos adicionales que varian y deben considerarse por separado.' },
      { q: 'Puedo liquidar la hipoteca mas rapido con pagos extra?', a: 'Si. Incluso pequenos pagos adicionales al capital pueden reducir significativamente los intereses totales y acortar el plazo de la hipoteca.' },
    ],
  },
  fr: {
    title: 'Comment Calculer votre Mensualite de Pret Immobilier',
    paragraphs: [
      'Le pret immobilier est le plus grand engagement financier que la plupart des gens prennent dans leur vie. Comprendre comment votre mensualite est calculee — et comment differents facteurs l\'affectent — est essentiel pour prendre une decision d\'achat immobilier eclairee. Les variables cles sont le prix du bien, l\'apport personnel, le taux d\'interet et la duree du pret.',
      'Notre calculateur de pret immobilier utilise la formule standard d\'amortissement pour estimer votre mensualite, le cout total des interets et le prix global de votre logement. En ajustant l\'apport ou le taux, vous pouvez voir comment de petits changements impactent considerablement le cout total.',
      'Avant de vous engager, utilisez ce calculateur pour comparer differents scenarios. Essayez differentes durees — 15, 20, 25 ou 30 ans — pour voir comment chacune affecte votre budget mensuel et le cout total.',
    ],
    faq: [
      { q: 'Quel apport personnel faut-il pour un pret immobilier?', a: 'Les prets classiques demandent generalement 10-20% d\'apport. Certains dispositifs permettent un apport plus faible. Un apport plus important reduit le montant emprunte, la mensualite et les interets totaux.' },
      { q: 'Quelle est la difference entre un pret sur 15 et 30 ans?', a: 'Un pret sur 15 ans a des mensualites plus elevees mais coute nettement moins en interets. Un pret sur 30 ans est plus abordable mensuellement mais peut couter presque le double en interets.' },
      { q: 'Comment le taux d\'interet affecte-t-il le cout du pret?', a: 'Meme 0,5% de difference peut changer le cout total de milliers d\'euros. Pour un pret de 250 000 euros sur 25 ans, passer de 3,5% a 4% ajoute environ 25 000 euros d\'interets.' },
      { q: 'Ce calculateur inclut-il les taxes et assurances?', a: 'Ce calculateur n\'estime que les mensualites de capital et interets. Les taxes foncieres, l\'assurance et les frais annexes varient et doivent etre consideres separement.' },
      { q: 'Puis-je rembourser mon pret plus vite avec des paiements supplementaires?', a: 'Oui. De petits paiements supplementaires sur le capital peuvent reduire significativement les interets totaux et raccourcir la duree du pret.' },
    ],
  },
  de: {
    title: 'Wie berechnet man die monatliche Hypothekenrate?',
    paragraphs: [
      'Eine Hypothek ist die groesste finanzielle Verpflichtung, die die meisten Menschen in ihrem Leben eingehen. Zu verstehen, wie Ihre monatliche Rate berechnet wird — und wie verschiedene Faktoren sie beeinflussen — ist entscheidend fuer eine fundierte Immobilienentscheidung. Die Schluesselvariablen sind der Immobilienpreis, die Anzahlung, der Zinssatz und die Kreditlaufzeit.',
      'Unser Hypothekenrechner verwendet die Standard-Tilgungsformel, um Ihre monatliche Rate, die Gesamtzinskosten und den Gesamtpreis Ihrer Immobilie ueber die Kreditlaufzeit abzuschaetzen. Durch Anpassung der Anzahlung oder des Zinssatzes sehen Sie, wie selbst kleine Aenderungen den Gesamtpreis dramatisch beeinflussen.',
      'Nutzen Sie diesen Rechner vor der Kreditaufnahme, um verschiedene Szenarien zu vergleichen. Probieren Sie verschiedene Laufzeiten — 15, 20, 25 oder 30 Jahre — um zu sehen, wie sich jede auf Ihr monatliches Budget und die Gesamtkosten auswirkt.',
    ],
    faq: [
      { q: 'Wie viel Anzahlung brauche ich fuer eine Hypothek?', a: 'Konventionelle Hypotheken erfordern typischerweise 10-20% Anzahlung. Eine groessere Anzahlung reduziert Ihren Kreditbetrag, die monatliche Rate und die Gesamtzinsen.' },
      { q: 'Was ist der Unterschied zwischen einer 15- und 30-jaehrigen Hypothek?', a: 'Eine 15-jaehrige Hypothek hat hoehere monatliche Raten, kostet aber deutlich weniger an Gesamtzinsen. Eine 30-jaehrige ist monatlich erschwinglicher, kann aber fast doppelt so viel an Zinsen kosten.' },
      { q: 'Wie beeinflusst der Zinssatz die Hypothekenkosten?', a: 'Selbst 0,5% Unterschied beim Zinssatz kann die Gesamtkosten um Tausende veraendern. Bei einem Darlehen von 250.000 Euro ueber 25 Jahre fuegt der Wechsel von 3,5% auf 4% etwa 25.000 Euro an Zinsen hinzu.' },
      { q: 'Beinhaltet dieser Rechner Grundsteuer und Versicherung?', a: 'Dieser Rechner schaetzt nur die Raten fuer Kapital und Zinsen. Grundsteuer, Versicherung und andere Nebenkosten variieren und sollten separat kalkuliert werden.' },
      { q: 'Kann ich meine Hypothek schneller tilgen mit Sondertilgungen?', a: 'Ja. Selbst kleine zusaetzliche Zahlungen auf das Kapital koennen die Gesamtzinsen erheblich reduzieren und die Laufzeit verkuerzen.' },
    ],
  },
  pt: {
    title: 'Como Calcular a Prestacao Mensal do Credito Habitacao',
    paragraphs: [
      'O credito habitacao e o maior compromisso financeiro que a maioria das pessoas assume na vida. Compreender como a prestacao mensal e calculada — e como diferentes fatores a afetam — e essencial para tomar uma decisao imobiliaria acertada. As variaveis chave sao o preco do imovel, a entrada, a taxa de juro e o prazo do emprestimo.',
      'A nossa calculadora de credito habitacao utiliza a formula padrao de amortizacao para estimar a sua prestacao mensal, os juros totais e o custo global do imovel. Ao ajustar a entrada ou a taxa de juro, pode ver como pequenas alteracoes impactam dramaticamente o custo total.',
      'Antes de se comprometer com um credito, use esta calculadora para comparar diferentes cenarios. Experimente diferentes prazos — 15, 20, 25 ou 30 anos — para ver como cada um afeta o seu orcamento mensal e custo total.',
    ],
    faq: [
      { q: 'Quanta entrada preciso para um credito habitacao?', a: 'Os creditos habitacao tradicionais requerem tipicamente 10-20% de entrada. Uma entrada maior reduz o valor do emprestimo, a prestacao mensal e os juros totais.' },
      { q: 'Qual e a diferenca entre um credito a 15 e a 30 anos?', a: 'Um credito a 15 anos tem prestacoes mais altas mas custa significativamente menos em juros. Um a 30 anos e mais acessivel mensalmente mas pode custar quase o dobro em juros.' },
      { q: 'Como afeta a taxa de juro o custo do credito?', a: 'Mesmo 0,5% de diferenca pode alterar o custo total em milhares. Para um emprestimo de 250.000 a 25 anos, passar de 3,5% para 4% adiciona cerca de 25.000 em juros.' },
      { q: 'Esta calculadora inclui impostos e seguros?', a: 'Esta calculadora estima apenas as prestacoes de capital e juros. Impostos sobre o imovel e seguros sao custos adicionais que variam e devem ser considerados separadamente.' },
      { q: 'Posso liquidar o credito mais rapido com pagamentos extra?', a: 'Sim. Mesmo pequenos pagamentos adicionais ao capital podem reduzir significativamente os juros totais e encurtar o prazo do credito.' },
    ],
  },
};

export default function MortgageCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['mortgage-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [propertyValue, setPropertyValue] = useState('300000');
  const [downPayment, setDownPayment] = useState('60000');
  const [interestRate, setInterestRate] = useState('3.5');
  const [years, setYears] = useState('25');

  const pv = parseFloat(propertyValue) || 0;
  const dp = parseFloat(downPayment) || 0;
  const rate = (parseFloat(interestRate) || 0) / 100 / 12;
  const n = (parseInt(years) || 0) * 12;
  const loanAmount = Math.max(pv - dp, 0);

  let monthlyPayment = 0;
  if (rate > 0 && n > 0 && loanAmount > 0) {
    monthlyPayment = loanAmount * (rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
  } else if (n > 0 && loanAmount > 0) {
    monthlyPayment = loanAmount / n;
  }

  const totalCost = monthlyPayment * n;
  const totalInterest = totalCost - loanAmount;

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="mortgage-calculator">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {[
            { label: t('propertyValue'), value: propertyValue, setter: setPropertyValue },
            { label: t('downPayment'), value: downPayment, setter: setDownPayment },
            { label: t('interestRate'), value: interestRate, setter: setInterestRate },
            { label: t('years'), value: years, setter: setYears },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}

          {loanAmount > 0 && n > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('loanAmount')}</span>
                <span className="font-semibold">{loanAmount.toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('totalInterest')}</span>
                <span className="font-semibold">{totalInterest.toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('totalCost')}</span>
                <span className="font-semibold">{totalCost.toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <hr className="border-blue-200" />
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-900">{t('monthlyPayment')}</span>
                <span className="font-bold text-blue-600">{monthlyPayment.toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
