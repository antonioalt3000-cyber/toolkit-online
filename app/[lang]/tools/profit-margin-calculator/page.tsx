'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  cost: { en: 'Cost Price', it: 'Prezzo di Costo', es: 'Precio de Costo', fr: 'Prix de Revient', de: 'Einkaufspreis', pt: 'Preço de Custo' },
  revenue: { en: 'Selling Price / Revenue', it: 'Prezzo di Vendita / Ricavo', es: 'Precio de Venta / Ingreso', fr: 'Prix de Vente / Revenu', de: 'Verkaufspreis / Umsatz', pt: 'Preço de Venda / Receita' },
  profit: { en: 'Profit', it: 'Profitto', es: 'Ganancia', fr: 'Profit', de: 'Gewinn', pt: 'Lucro' },
  profitMargin: { en: 'Profit Margin', it: 'Margine di Profitto', es: 'Margen de Ganancia', fr: 'Marge Bénéficiaire', de: 'Gewinnmarge', pt: 'Margem de Lucro' },
  markup: { en: 'Markup', it: 'Ricarico', es: 'Margen sobre Costo', fr: 'Marge sur Coût', de: 'Aufschlag', pt: 'Markup' },
  calcMode: { en: 'Calculate From', it: 'Calcola Da', es: 'Calcular Desde', fr: 'Calculer À Partir De', de: 'Berechnen Aus', pt: 'Calcular A Partir De' },
  costAndRevenue: { en: 'Cost & Revenue', it: 'Costo e Ricavo', es: 'Costo e Ingreso', fr: 'Coût et Revenu', de: 'Kosten und Umsatz', pt: 'Custo e Receita' },
  costAndMargin: { en: 'Cost & Margin', it: 'Costo e Margine', es: 'Costo y Margen', fr: 'Coût et Marge', de: 'Kosten und Marge', pt: 'Custo e Margem' },
  revenueAndMargin: { en: 'Revenue & Margin', it: 'Ricavo e Margine', es: 'Ingreso y Margen', fr: 'Revenu et Marge', de: 'Umsatz und Marge', pt: 'Receita e Margem' },
  marginPercent: { en: 'Margin (%)', it: 'Margine (%)', es: 'Margen (%)', fr: 'Marge (%)', de: 'Marge (%)', pt: 'Margem (%)' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'How to Calculate Profit Margin for Your Business',
    paragraphs: [
      'Profit margin is one of the most important financial metrics for any business. It measures how much of every dollar of revenue a company keeps as profit after accounting for costs. Understanding your profit margin helps you set prices, control expenses, evaluate business performance, and make strategic decisions about growth and investment.',
      'There are several types of profit margins. Gross profit margin measures the percentage of revenue remaining after subtracting the cost of goods sold (COGS). It reflects how efficiently a company produces or sources its products. Net profit margin accounts for all expenses including operating costs, taxes, and interest, showing the true bottom-line profitability. Most businesses aim for gross margins between 30-70% depending on the industry.',
      'Markup and profit margin are related but different concepts that often cause confusion. Markup is calculated as a percentage of the cost price, while profit margin is calculated as a percentage of the selling price. A product that costs $60 and sells for $100 has a 40% profit margin but a 66.7% markup. Understanding this distinction is crucial for pricing strategy.',
      'This calculator offers three modes: calculate from cost and revenue, from cost and desired margin, or from revenue and desired margin. It instantly shows your profit amount, profit margin percentage, and markup percentage. Whether you are a retailer setting prices, a freelancer quoting projects, or a business owner analyzing financial performance, this tool provides the insights you need.',
    ],
    faq: [
      { q: 'What is the difference between profit margin and markup?', a: 'Profit margin is profit divided by revenue (selling price), expressed as a percentage. Markup is profit divided by cost, expressed as a percentage. For example, if cost is $60 and price is $100: margin = 40% ($40/$100), markup = 66.7% ($40/$60).' },
      { q: 'What is a good profit margin?', a: 'It varies by industry. Retail typically sees 2-5% net margins, software companies 15-25%, and luxury goods 10-20%. Gross margins are higher: 50-70% for software, 30-50% for retail. Compare with industry benchmarks for meaningful analysis.' },
      { q: 'How do I calculate selling price from cost and desired margin?', a: 'Divide the cost by (1 - desired margin as decimal). For example, to achieve a 40% margin on a $60 item: $60 / (1 - 0.40) = $60 / 0.60 = $100 selling price.' },
      { q: 'Why is profit margin more useful than markup?', a: 'Profit margin relates profit to revenue, making it easier to compare across businesses and industries. It directly shows what percentage of sales is profit. Markup is useful for pricing individual products but less meaningful for overall business analysis.' },
      { q: 'How can I improve my profit margin?', a: 'You can increase margin by raising prices (if the market allows), reducing costs (better suppliers, efficiency improvements), increasing sales volume to spread fixed costs, or focusing on higher-margin products and services.' },
    ],
  },
  it: {
    title: 'Come Calcolare il Margine di Profitto per la Tua Attivita',
    paragraphs: [
      'Il margine di profitto e una delle metriche finanziarie piu importanti per qualsiasi azienda. Misura quanto di ogni euro di ricavo un\'azienda trattiene come profitto dopo aver contabilizzato i costi. Comprendere il margine aiuta a fissare i prezzi, controllare le spese e prendere decisioni strategiche.',
      'Esistono diversi tipi di margini. Il margine di profitto lordo misura la percentuale di ricavo rimanente dopo aver sottratto il costo del venduto. Il margine netto tiene conto di tutte le spese incluse tasse e interessi. La maggior parte delle aziende mira a margini lordi tra il 30-70% a seconda del settore.',
      'Il ricarico e il margine di profitto sono concetti correlati ma diversi. Il ricarico e calcolato come percentuale del costo, mentre il margine e calcolato come percentuale del prezzo di vendita. Un prodotto che costa 60 euro e si vende a 100 euro ha un margine del 40% ma un ricarico del 66,7%.',
      'Questo calcolatore offre tre modalita: calcola da costo e ricavo, da costo e margine desiderato, o da ricavo e margine desiderato. Mostra istantaneamente profitto, margine e ricarico.',
    ],
    faq: [
      { q: 'Qual e la differenza tra margine di profitto e ricarico?', a: 'Il margine e il profitto diviso per il ricavo. Il ricarico e il profitto diviso per il costo. Se il costo e 60 euro e il prezzo e 100 euro: margine = 40%, ricarico = 66,7%.' },
      { q: 'Qual e un buon margine di profitto?', a: 'Varia per settore. Il retail ha margini netti del 2-5%, il software 15-25%. I margini lordi sono piu alti: 50-70% per il software, 30-50% per il retail.' },
      { q: 'Come calcolo il prezzo di vendita dal costo e margine desiderato?', a: 'Dividi il costo per (1 - margine desiderato). Per un margine del 40% su un articolo da 60 euro: 60 / 0,60 = 100 euro.' },
      { q: 'Perche il margine e piu utile del ricarico?', a: 'Il margine rapporta il profitto al ricavo, rendendo piu facile il confronto tra aziende e settori. Mostra direttamente che percentuale delle vendite e profitto.' },
      { q: 'Come posso migliorare il mio margine?', a: 'Aumentare i prezzi, ridurre i costi, aumentare il volume di vendita per distribuire i costi fissi, o concentrarsi su prodotti ad alto margine.' },
    ],
  },
  es: {
    title: 'Como Calcular el Margen de Ganancia para Tu Negocio',
    paragraphs: [
      'El margen de ganancia es una de las metricas financieras mas importantes para cualquier negocio. Mide cuanto de cada dolar de ingreso una empresa retiene como ganancia despues de los costos. Comprender tu margen ayuda a fijar precios, controlar gastos y tomar decisiones estrategicas.',
      'Existen varios tipos de margenes. El margen de ganancia bruto mide el porcentaje de ingreso restante despues de restar el costo de los bienes vendidos. El margen neto considera todos los gastos incluyendo impuestos e intereses. La mayoria de los negocios buscan margenes brutos entre 30-70%.',
      'El margen sobre costo y el margen de ganancia son conceptos diferentes. El margen sobre costo se calcula como porcentaje del costo, mientras que el margen de ganancia se calcula como porcentaje del precio de venta. Un producto que cuesta $60 y se vende a $100 tiene un margen del 40% pero un margen sobre costo del 66,7%.',
      'Esta calculadora ofrece tres modos: calcular desde costo e ingreso, desde costo y margen deseado, o desde ingreso y margen deseado. Muestra instantaneamente la ganancia, el margen y el markup.',
    ],
    faq: [
      { q: 'Cual es la diferencia entre margen de ganancia y markup?', a: 'El margen es la ganancia dividida por el ingreso. El markup es la ganancia dividida por el costo. Si el costo es $60 y el precio es $100: margen = 40%, markup = 66,7%.' },
      { q: 'Cual es un buen margen de ganancia?', a: 'Varia por industria. El retail tiene margenes netos del 2-5%, el software 15-25%. Los margenes brutos son mayores: 50-70% para software, 30-50% para retail.' },
      { q: 'Como calculo el precio de venta desde el costo y margen deseado?', a: 'Divide el costo entre (1 - margen deseado). Para un margen del 40% en un articulo de $60: $60 / 0,60 = $100.' },
      { q: 'Por que el margen es mas util que el markup?', a: 'El margen relaciona la ganancia con el ingreso, facilitando comparaciones entre negocios. Muestra directamente que porcentaje de las ventas es ganancia.' },
      { q: 'Como puedo mejorar mi margen?', a: 'Aumentar precios, reducir costos, aumentar volumen de ventas o concentrarse en productos de alto margen.' },
    ],
  },
  fr: {
    title: 'Comment Calculer la Marge Beneficiaire pour Votre Entreprise',
    paragraphs: [
      'La marge beneficiaire est l\'une des metriques financieres les plus importantes pour toute entreprise. Elle mesure combien de chaque euro de revenu une entreprise conserve comme profit apres les couts. Comprendre votre marge aide a fixer les prix, controler les depenses et prendre des decisions strategiques.',
      'Il existe plusieurs types de marges. La marge brute mesure le pourcentage de revenu restant apres soustraction du cout des marchandises vendues. La marge nette tient compte de toutes les depenses y compris les impots et interets. La plupart des entreprises visent des marges brutes de 30-70%.',
      'La marge sur cout et la marge beneficiaire sont des concepts lies mais differents. La marge sur cout est calculee comme pourcentage du cout, tandis que la marge beneficiaire est calculee comme pourcentage du prix de vente. Un produit coutant 60 euros vendu 100 euros a une marge de 40% mais une marge sur cout de 66,7%.',
      'Ce calculateur offre trois modes: calculer a partir du cout et du revenu, du cout et de la marge souhaitee, ou du revenu et de la marge souhaitee.',
    ],
    faq: [
      { q: 'Quelle est la difference entre marge et marge sur cout?', a: 'La marge est le profit divise par le revenu. La marge sur cout est le profit divise par le cout. Si le cout est 60 euros et le prix est 100 euros: marge = 40%, marge sur cout = 66,7%.' },
      { q: 'Quelle est une bonne marge beneficiaire?', a: 'Cela varie par secteur. Le retail a des marges nettes de 2-5%, le logiciel 15-25%. Les marges brutes sont plus elevees: 50-70% pour le logiciel, 30-50% pour le retail.' },
      { q: 'Comment calculer le prix de vente a partir du cout et de la marge?', a: 'Divisez le cout par (1 - marge souhaitee). Pour une marge de 40% sur un article a 60 euros: 60 / 0,60 = 100 euros.' },
      { q: 'Pourquoi la marge est-elle plus utile que la marge sur cout?', a: 'La marge rapporte le profit au revenu, facilitant les comparaisons entre entreprises. Elle montre directement quel pourcentage des ventes est du profit.' },
      { q: 'Comment ameliorer ma marge?', a: 'Augmenter les prix, reduire les couts, augmenter le volume de ventes ou se concentrer sur des produits a forte marge.' },
    ],
  },
  de: {
    title: 'So Berechnen Sie die Gewinnmarge fuer Ihr Unternehmen',
    paragraphs: [
      'Die Gewinnmarge ist eine der wichtigsten Finanzkennzahlen fuer jedes Unternehmen. Sie misst, wie viel von jedem Euro Umsatz als Gewinn verbleibt. Das Verstaendnis Ihrer Marge hilft bei der Preisgestaltung, Kostenkontrolle und strategischen Entscheidungen.',
      'Es gibt verschiedene Arten von Margen. Die Bruttogewinnmarge misst den Prozentsatz des Umsatzes nach Abzug der Herstellungskosten. Die Nettogewinnmarge beruecksichtigt alle Kosten einschliesslich Steuern und Zinsen. Die meisten Unternehmen streben Bruttomargen von 30-70% an.',
      'Aufschlag und Gewinnmarge sind verwandte aber unterschiedliche Konzepte. Der Aufschlag wird als Prozentsatz des Einkaufspreises berechnet, die Gewinnmarge als Prozentsatz des Verkaufspreises. Ein Produkt mit 60 Euro Kosten und 100 Euro Verkaufspreis hat eine Marge von 40% aber einen Aufschlag von 66,7%.',
      'Dieser Rechner bietet drei Modi: Berechnung aus Kosten und Umsatz, aus Kosten und gewuenschter Marge, oder aus Umsatz und gewuenschter Marge.',
    ],
    faq: [
      { q: 'Was ist der Unterschied zwischen Gewinnmarge und Aufschlag?', a: 'Die Marge ist der Gewinn geteilt durch den Umsatz. Der Aufschlag ist der Gewinn geteilt durch die Kosten. Bei 60 Euro Kosten und 100 Euro Preis: Marge = 40%, Aufschlag = 66,7%.' },
      { q: 'Was ist eine gute Gewinnmarge?', a: 'Das variiert nach Branche. Einzelhandel hat Nettomargen von 2-5%, Software 15-25%. Bruttomargen sind hoeher: 50-70% fuer Software, 30-50% fuer Einzelhandel.' },
      { q: 'Wie berechne ich den Verkaufspreis aus Kosten und gewuenschter Marge?', a: 'Teilen Sie die Kosten durch (1 - gewuenschte Marge). Fuer 40% Marge bei 60 Euro Kosten: 60 / 0,60 = 100 Euro.' },
      { q: 'Warum ist die Marge nuetzlicher als der Aufschlag?', a: 'Die Marge setzt den Gewinn ins Verhaeltnis zum Umsatz, was Vergleiche zwischen Unternehmen erleichtert.' },
      { q: 'Wie kann ich meine Marge verbessern?', a: 'Preise erhoehen, Kosten senken, Verkaufsvolumen steigern oder auf margenstarke Produkte konzentrieren.' },
    ],
  },
  pt: {
    title: 'Como Calcular a Margem de Lucro para Seu Negocio',
    paragraphs: [
      'A margem de lucro e uma das metricas financeiras mais importantes para qualquer negocio. Ela mede quanto de cada real de receita uma empresa retem como lucro apos os custos. Compreender sua margem ajuda a definir precos, controlar despesas e tomar decisoes estrategicas.',
      'Existem varios tipos de margens. A margem de lucro bruto mede a porcentagem de receita restante apos subtrair o custo dos produtos vendidos. A margem liquida considera todas as despesas incluindo impostos e juros. A maioria dos negocios busca margens brutas entre 30-70%.',
      'O markup e a margem de lucro sao conceitos relacionados mas diferentes. O markup e calculado como porcentagem do custo, enquanto a margem e calculada como porcentagem do preco de venda. Um produto que custa R$60 e vende por R$100 tem margem de 40% mas markup de 66,7%.',
      'Esta calculadora oferece tres modos: calcular a partir de custo e receita, de custo e margem desejada, ou de receita e margem desejada.',
    ],
    faq: [
      { q: 'Qual e a diferenca entre margem de lucro e markup?', a: 'A margem e o lucro dividido pela receita. O markup e o lucro dividido pelo custo. Se o custo e R$60 e o preco e R$100: margem = 40%, markup = 66,7%.' },
      { q: 'Qual e uma boa margem de lucro?', a: 'Varia por setor. O varejo tem margens liquidas de 2-5%, software 15-25%. Margens brutas sao maiores: 50-70% para software, 30-50% para varejo.' },
      { q: 'Como calculo o preco de venda a partir do custo e margem?', a: 'Divida o custo por (1 - margem desejada). Para 40% de margem em um item de R$60: R$60 / 0,60 = R$100.' },
      { q: 'Por que a margem e mais util que o markup?', a: 'A margem relaciona o lucro com a receita, facilitando comparacoes entre negocios. Mostra diretamente que porcentagem das vendas e lucro.' },
      { q: 'Como posso melhorar minha margem?', a: 'Aumentar precos, reduzir custos, aumentar volume de vendas ou focar em produtos de alta margem.' },
    ],
  },
};

export default function ProfitMarginCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['profit-margin-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [mode, setMode] = useState<'costRevenue' | 'costMargin' | 'revenueMargin'>('costRevenue');
  const [cost, setCost] = useState('');
  const [revenue, setRevenue] = useState('');
  const [margin, setMargin] = useState('');

  let costNum = parseFloat(cost) || 0;
  let revenueNum = parseFloat(revenue) || 0;
  const marginNum = parseFloat(margin) || 0;

  let profit = 0;
  let profitMargin = 0;
  let markupPct = 0;
  let canShow = false;

  if (mode === 'costRevenue' && costNum > 0 && revenueNum > 0) {
    profit = revenueNum - costNum;
    profitMargin = (profit / revenueNum) * 100;
    markupPct = (profit / costNum) * 100;
    canShow = true;
  } else if (mode === 'costMargin' && costNum > 0 && marginNum > 0 && marginNum < 100) {
    revenueNum = costNum / (1 - marginNum / 100);
    profit = revenueNum - costNum;
    profitMargin = marginNum;
    markupPct = (profit / costNum) * 100;
    canShow = true;
  } else if (mode === 'revenueMargin' && revenueNum > 0 && marginNum > 0 && marginNum < 100) {
    profit = revenueNum * (marginNum / 100);
    costNum = revenueNum - profit;
    profitMargin = marginNum;
    markupPct = costNum > 0 ? (profit / costNum) * 100 : 0;
    canShow = true;
  }

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="profit-margin-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('calcMode')}</label>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => { setMode('costRevenue'); setCost(''); setRevenue(''); setMargin(''); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${mode === 'costRevenue' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {t('costAndRevenue')}
              </button>
              <button onClick={() => { setMode('costMargin'); setCost(''); setRevenue(''); setMargin(''); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${mode === 'costMargin' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {t('costAndMargin')}
              </button>
              <button onClick={() => { setMode('revenueMargin'); setCost(''); setRevenue(''); setMargin(''); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${mode === 'revenueMargin' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {t('revenueAndMargin')}
              </button>
            </div>
          </div>

          {(mode === 'costRevenue' || mode === 'costMargin') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cost')}</label>
              <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          )}

          {(mode === 'costRevenue' || mode === 'revenueMargin') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('revenue')}</label>
              <input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          )}

          {(mode === 'costMargin' || mode === 'revenueMargin') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('marginPercent')}</label>
              <input type="number" value={margin} onChange={(e) => setMargin(e.target.value)} placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          )}

          {canShow && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
              {mode !== 'costRevenue' && (
                <>
                  {mode === 'revenueMargin' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('cost')}</span>
                      <span className="font-semibold">${costNum.toFixed(2)}</span>
                    </div>
                  )}
                  {mode === 'costMargin' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('revenue')}</span>
                      <span className="font-semibold">${revenueNum.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">{t('profit')}</span>
                <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${profit.toFixed(2)}</span>
              </div>
              <hr className="border-blue-200" />
              <div className="flex justify-between">
                <span className="text-gray-600">{t('profitMargin')}</span>
                <span className="font-bold text-blue-600 text-lg">{profitMargin.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('markup')}</span>
                <span className="font-semibold">{markupPct.toFixed(2)}%</span>
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
