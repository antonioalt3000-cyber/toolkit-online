'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  price: { en: 'Price (before tax)', it: 'Prezzo (prima delle tasse)', es: 'Precio (antes de impuestos)', fr: 'Prix (avant taxes)', de: 'Preis (vor Steuer)', pt: 'Preço (antes do imposto)' },
  taxRate: { en: 'Tax Rate (%)', it: 'Aliquota (%)', es: 'Tasa de Impuesto (%)', fr: 'Taux de Taxe (%)', de: 'Steuersatz (%)', pt: 'Taxa de Imposto (%)' },
  taxAmount: { en: 'Tax Amount', it: 'Importo Tassa', es: 'Monto del Impuesto', fr: 'Montant de la Taxe', de: 'Steuerbetrag', pt: 'Valor do Imposto' },
  totalPrice: { en: 'Total Price', it: 'Prezzo Totale', es: 'Precio Total', fr: 'Prix Total', de: 'Gesamtpreis', pt: 'Preço Total' },
  preTaxPrice: { en: 'Pre-Tax Price', it: 'Prezzo Senza Tasse', es: 'Precio Sin Impuestos', fr: 'Prix Hors Taxes', de: 'Preis vor Steuer', pt: 'Preço Sem Imposto' },
  addTax: { en: 'Add Tax to Price', it: 'Aggiungi Tassa al Prezzo', es: 'Agregar Impuesto al Precio', fr: 'Ajouter Taxe au Prix', de: 'Steuer zum Preis addieren', pt: 'Adicionar Imposto ao Preço' },
  removeTax: { en: 'Remove Tax from Total', it: 'Rimuovi Tassa dal Totale', es: 'Quitar Impuesto del Total', fr: 'Retirer Taxe du Total', de: 'Steuer vom Gesamtbetrag entfernen', pt: 'Remover Imposto do Total' },
  totalWithTax: { en: 'Total (with tax)', it: 'Totale (con tasse)', es: 'Total (con impuesto)', fr: 'Total (avec taxe)', de: 'Gesamt (mit Steuer)', pt: 'Total (com imposto)' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'How to Calculate Sales Tax on Any Purchase',
    paragraphs: [
      'Sales tax is a consumption tax imposed by governments on the sale of goods and services. Understanding how sales tax works is essential for both consumers who want to know the true cost of their purchases and businesses that need to collect and remit taxes properly. A sales tax calculator simplifies this process by instantly computing the tax amount and total price.',
      'Sales tax rates vary significantly around the world and even within countries. In the United States, there is no federal sales tax, but states impose rates ranging from 0% (Oregon, Montana) to over 10% when combining state and local taxes. In Europe, Value Added Tax (VAT) rates range from 17% in Luxembourg to 27% in Hungary. Some countries like Japan have a uniform consumption tax of 10%.',
      'This calculator supports two modes of calculation. The standard mode adds sales tax to a pre-tax price, showing you the tax amount and the total you will pay at the register. The reverse mode works backward from a tax-inclusive total to determine the original pre-tax price and the tax component — useful when you see a final price and want to know how much of it is tax.',
      'Whether you are shopping online, preparing price quotes for customers, or reconciling business expenses, this sales tax calculator provides instant, accurate results. Simply enter the price and tax rate to see the breakdown. The tool handles any tax rate and works for both small everyday purchases and large transactions.',
    ],
    faq: [
      { q: 'How do I calculate sales tax on a purchase?', a: 'Multiply the pre-tax price by the tax rate (as a decimal). For example, a $100 item with 8% tax: $100 x 0.08 = $8 tax, making the total $108. This calculator does it automatically for you.' },
      { q: 'How do I find the pre-tax price from a total?', a: 'Divide the total by (1 + tax rate as decimal). For example, a $108 total with 8% tax: $108 / 1.08 = $100 pre-tax price. Use the "Remove Tax" mode in this calculator for instant results.' },
      { q: 'Why do sales tax rates differ by location?', a: 'Sales taxes are set by state and local governments to fund public services. Each jurisdiction sets its own rate based on budget needs. Some states have no sales tax at all, while others combine state, county, and city taxes.' },
      { q: 'Are all products subject to sales tax?', a: 'No. Many jurisdictions exempt essential items like groceries, prescription medications, and clothing from sales tax. Digital goods, services, and luxury items may have different tax treatment depending on the location.' },
      { q: 'What is the difference between sales tax and VAT?', a: 'Sales tax is collected only at the final point of sale. VAT (Value Added Tax) is collected at each stage of production and distribution, with businesses claiming credits for tax paid on inputs. The end result for consumers is similar.' },
    ],
  },
  it: {
    title: 'Come Calcolare l\'Imposta sulle Vendite su Qualsiasi Acquisto',
    paragraphs: [
      'L\'imposta sulle vendite e una tassa sul consumo imposta dai governi sulla vendita di beni e servizi. Comprendere come funziona e essenziale sia per i consumatori che vogliono conoscere il vero costo dei loro acquisti sia per le aziende che devono raccogliere e versare correttamente le tasse.',
      'Le aliquote variano significativamente nel mondo. In Italia l\'IVA ordinaria e al 22%, con aliquote ridotte del 4%, 5% e 10% per beni di prima necessita e altri prodotti specifici. In Europa le aliquote IVA vanno dal 17% del Lussemburgo al 27% dell\'Ungheria. Negli Stati Uniti le imposte sulle vendite variano dal 0% a oltre il 10%.',
      'Questo calcolatore supporta due modalita di calcolo. La modalita standard aggiunge l\'imposta al prezzo netto, mostrando l\'importo della tassa e il totale. La modalita inversa parte dal totale con tasse incluse per determinare il prezzo originale e la componente fiscale — utile quando si vede un prezzo finale e si vuole sapere quanto e di tasse.',
      'Che si stia facendo shopping online, preparando preventivi o riconciliando spese aziendali, questo calcolatore fornisce risultati istantanei e accurati. Basta inserire il prezzo e l\'aliquota per vedere il dettaglio completo.',
    ],
    faq: [
      { q: 'Come si calcola l\'imposta sulle vendite?', a: 'Moltiplica il prezzo netto per l\'aliquota (come decimale). Ad esempio, un articolo da 100 euro con IVA al 22%: 100 x 0,22 = 22 euro di IVA, totale 122 euro. Questo calcolatore lo fa automaticamente.' },
      { q: 'Come trovo il prezzo senza tasse partendo dal totale?', a: 'Dividi il totale per (1 + aliquota come decimale). Ad esempio, 122 euro con IVA al 22%: 122 / 1,22 = 100 euro di prezzo netto. Usa la modalita "Rimuovi Tassa" per risultati istantanei.' },
      { q: 'Perche le aliquote IVA sono diverse?', a: 'L\'IVA ha aliquote diverse per categorie di beni. In Italia: 22% ordinaria, 10% ridotta, 5% e 4% per beni di prima necessita come alimentari e libri.' },
      { q: 'Tutti i prodotti sono soggetti a IVA?', a: 'No. Alcuni beni e servizi sono esenti IVA, come servizi sanitari, educazione e operazioni finanziarie. I beni di prima necessita hanno aliquote ridotte.' },
      { q: 'Qual e la differenza tra IVA e imposta sulle vendite?', a: 'L\'IVA viene applicata a ogni fase della catena produttiva e distributiva, con le aziende che detraggono l\'IVA pagata sugli acquisti. L\'imposta sulle vendite si applica solo al consumatore finale.' },
    ],
  },
  es: {
    title: 'Como Calcular el Impuesto sobre las Ventas en Cualquier Compra',
    paragraphs: [
      'El impuesto sobre las ventas es un impuesto al consumo impuesto por los gobiernos sobre la venta de bienes y servicios. Comprender como funciona es esencial tanto para consumidores que quieren conocer el costo real de sus compras como para empresas que necesitan recaudar y declarar impuestos correctamente.',
      'Las tasas de impuesto varian significativamente. En Espana, el IVA general es del 21%, con tasas reducidas del 10% y super reducida del 4%. En America Latina las tasas varian: Mexico 16%, Argentina 21%, Colombia 19%. En Estados Unidos, no hay impuesto federal sobre ventas, pero los estados imponen tasas del 0% a mas del 10%.',
      'Esta calculadora soporta dos modos de calculo. El modo estandar agrega el impuesto al precio neto. El modo inverso trabaja desde el total con impuestos incluidos para determinar el precio original — util cuando ves un precio final y quieres saber cuanto es de impuesto.',
      'Ya sea que estes comprando en linea, preparando cotizaciones o reconciliando gastos, esta calculadora proporciona resultados instantaneos y precisos. Simplemente ingresa el precio y la tasa para ver el desglose.',
    ],
    faq: [
      { q: 'Como se calcula el impuesto sobre las ventas?', a: 'Multiplica el precio neto por la tasa (como decimal). Por ejemplo, un articulo de 100 euros con IVA del 21%: 100 x 0,21 = 21 euros de IVA, total 121 euros.' },
      { q: 'Como encuentro el precio sin impuestos desde el total?', a: 'Divide el total entre (1 + tasa como decimal). Por ejemplo, 121 euros con IVA del 21%: 121 / 1,21 = 100 euros de precio neto.' },
      { q: 'Por que las tasas de impuesto son diferentes?', a: 'Los impuestos al consumo tienen diferentes tasas segun la categoria del producto. En Espana: 21% general, 10% reducido, 4% super reducido para bienes basicos.' },
      { q: 'Todos los productos estan sujetos a impuestos?', a: 'No. Algunos bienes y servicios estan exentos, como servicios sanitarios y educativos. Los bienes basicos suelen tener tasas reducidas.' },
      { q: 'Cual es la diferencia entre IVA e impuesto sobre ventas?', a: 'El IVA se aplica en cada etapa de la cadena productiva. El impuesto sobre ventas se aplica solo en la venta final al consumidor.' },
    ],
  },
  fr: {
    title: 'Comment Calculer la Taxe de Vente sur Tout Achat',
    paragraphs: [
      'La taxe de vente est un impot a la consommation impose par les gouvernements sur la vente de biens et services. Comprendre son fonctionnement est essentiel pour les consommateurs qui veulent connaitre le cout reel de leurs achats et pour les entreprises qui doivent collecter et declarer les taxes.',
      'Les taux de TVA varient considerablement. En France, le taux normal est de 20%, avec des taux reduits de 10%, 5,5% et 2,1%. En Europe, les taux vont de 17% au Luxembourg a 27% en Hongrie. Aux Etats-Unis, les taxes de vente varient de 0% a plus de 10%.',
      'Ce calculateur prend en charge deux modes de calcul. Le mode standard ajoute la taxe au prix hors taxes. Le mode inverse part du prix TTC pour determiner le prix HT et le montant de la taxe — utile quand vous voyez un prix final et voulez savoir quelle part est de la taxe.',
      'Que vous fassiez des achats en ligne, prepariez des devis ou reconciliez des depenses, ce calculateur fournit des resultats instantanes et precis. Entrez simplement le prix et le taux pour voir la ventilation.',
    ],
    faq: [
      { q: 'Comment calcule-t-on la taxe de vente?', a: 'Multipliez le prix HT par le taux (en decimal). Par exemple, un article a 100 euros avec TVA a 20%: 100 x 0,20 = 20 euros de TVA, total 120 euros TTC.' },
      { q: 'Comment trouver le prix HT a partir du TTC?', a: 'Divisez le total TTC par (1 + taux en decimal). Par exemple, 120 euros TTC avec TVA a 20%: 120 / 1,20 = 100 euros HT.' },
      { q: 'Pourquoi les taux de TVA different-ils?', a: 'La TVA a differents taux selon les categories de produits. En France: 20% normal, 10% intermediaire, 5,5% reduit, 2,1% super reduit pour les produits de premiere necessite.' },
      { q: 'Tous les produits sont-ils soumis a la TVA?', a: 'Non. Certains biens et services sont exoneres, comme les services de sante et d\'education. Les produits essentiels beneficient de taux reduits.' },
      { q: 'Quelle est la difference entre TVA et taxe de vente?', a: 'La TVA est collectee a chaque etape de la chaine de production. La taxe de vente s\'applique uniquement au point de vente final.' },
    ],
  },
  de: {
    title: 'So Berechnen Sie die Umsatzsteuer bei Jedem Einkauf',
    paragraphs: [
      'Die Umsatzsteuer ist eine Verbrauchssteuer, die von Regierungen auf den Verkauf von Waren und Dienstleistungen erhoben wird. Das Verstaendnis ihrer Funktionsweise ist sowohl fuer Verbraucher als auch fuer Unternehmen wichtig, die Steuern korrekt erheben und abfuehren muessen.',
      'Die Mehrwertsteuersaetze variieren erheblich. In Deutschland betraegt der regulaere Satz 19%, mit einem ermaessigten Satz von 7% fuer Grundnahrungsmittel und Buecher. In Europa reichen die Saetze von 17% in Luxemburg bis 27% in Ungarn.',
      'Dieser Rechner unterstuetzt zwei Berechnungsmodi. Der Standardmodus addiert die Steuer zum Nettopreis. Der umgekehrte Modus berechnet vom Bruttobetrag den Nettopreis und den Steuerbetrag — nuetzlich, wenn Sie einen Endpreis sehen und wissen moechten, wie viel davon Steuer ist.',
      'Ob Sie online einkaufen, Preisangebote erstellen oder Geschaeftsausgaben abgleichen — dieser Rechner liefert sofortige und genaue Ergebnisse. Geben Sie einfach den Preis und den Steuersatz ein.',
    ],
    faq: [
      { q: 'Wie berechne ich die Umsatzsteuer?', a: 'Multiplizieren Sie den Nettopreis mit dem Steuersatz (als Dezimalzahl). Beispiel: Ein Artikel fuer 100 Euro mit 19% MwSt: 100 x 0,19 = 19 Euro MwSt, Gesamtpreis 119 Euro.' },
      { q: 'Wie finde ich den Nettopreis aus dem Bruttobetrag?', a: 'Teilen Sie den Bruttobetrag durch (1 + Steuersatz als Dezimalzahl). Beispiel: 119 Euro brutto mit 19% MwSt: 119 / 1,19 = 100 Euro netto.' },
      { q: 'Warum sind die MwSt-Saetze unterschiedlich?', a: 'Die MwSt hat verschiedene Saetze je nach Produktkategorie. In Deutschland: 19% regulaer, 7% ermaessigt fuer Grundnahrungsmittel, Buecher und Zeitschriften.' },
      { q: 'Sind alle Produkte umsatzsteuerpflichtig?', a: 'Nein. Einige Waren und Dienstleistungen sind von der MwSt befreit, wie Gesundheits- und Bildungsleistungen.' },
      { q: 'Was ist der Unterschied zwischen MwSt und Umsatzsteuer?', a: 'In Deutschland sind MwSt und Umsatzsteuer dasselbe. Der Begriff Umsatzsteuer ist der gesetzliche Ausdruck, waehrend MwSt umgangssprachlich verwendet wird.' },
    ],
  },
  pt: {
    title: 'Como Calcular o Imposto sobre Vendas em Qualquer Compra',
    paragraphs: [
      'O imposto sobre vendas e um imposto de consumo imposto pelos governos sobre a venda de bens e servicos. Compreender como funciona e essencial tanto para consumidores que querem saber o custo real de suas compras quanto para empresas que precisam coletar e declarar impostos corretamente.',
      'As aliquotas de imposto variam significativamente. No Brasil, o ICMS varia por estado (7% a 25%), e o IPI depende do produto. Em Portugal, o IVA normal e de 23%, com taxas reduzidas de 13% e 6%. Na Europa, as taxas de IVA vao de 17% em Luxemburgo a 27% na Hungria.',
      'Esta calculadora suporta dois modos de calculo. O modo padrao adiciona o imposto ao preco liquido. O modo reverso parte do total com impostos incluidos para determinar o preco original — util quando voce ve um preco final e quer saber quanto e de imposto.',
      'Seja comprando online, preparando orcamentos ou reconciliando despesas, esta calculadora fornece resultados instantaneos e precisos. Basta inserir o preco e a aliquota para ver o detalhamento.',
    ],
    faq: [
      { q: 'Como se calcula o imposto sobre vendas?', a: 'Multiplique o preco liquido pela aliquota (como decimal). Exemplo: um artigo de 100 euros com IVA de 23%: 100 x 0,23 = 23 euros de IVA, total 123 euros.' },
      { q: 'Como encontro o preco sem imposto a partir do total?', a: 'Divida o total por (1 + aliquota como decimal). Exemplo: 123 euros com IVA de 23%: 123 / 1,23 = 100 euros de preco liquido.' },
      { q: 'Por que as aliquotas de imposto sao diferentes?', a: 'Os impostos ao consumo tem diferentes aliquotas por categoria de produto. Em Portugal: 23% normal, 13% intermediario, 6% reduzido para bens essenciais.' },
      { q: 'Todos os produtos estao sujeitos a imposto?', a: 'Nao. Alguns bens e servicos sao isentos, como servicos de saude e educacao. Bens essenciais geralmente tem aliquotas reduzidas.' },
      { q: 'Qual e a diferenca entre IVA e imposto sobre vendas?', a: 'O IVA e cobrado em cada etapa da cadeia produtiva. O imposto sobre vendas e aplicado apenas na venda final ao consumidor.' },
    ],
  },
};

export default function SalesTaxCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['sales-tax-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [price, setPrice] = useState('');
  const [taxRate, setTaxRate] = useState('');

  const priceNum = parseFloat(price) || 0;
  const taxRateNum = parseFloat(taxRate) || 0;

  let taxAmount = 0;
  let totalPrice = 0;
  let preTaxPrice = 0;

  if (mode === 'add') {
    taxAmount = priceNum * (taxRateNum / 100);
    totalPrice = priceNum + taxAmount;
    preTaxPrice = priceNum;
  } else {
    preTaxPrice = priceNum / (1 + taxRateNum / 100);
    taxAmount = priceNum - preTaxPrice;
    totalPrice = priceNum;
  }

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="sales-tax-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2 mb-2">
            <button onClick={() => { setMode('add'); setPrice(''); }}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${mode === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {t('addTax')}
            </button>
            <button onClick={() => { setMode('remove'); setPrice(''); }}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${mode === 'remove' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {t('removeTax')}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {mode === 'add' ? t('price') : t('totalWithTax')}
            </label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('taxRate')}</label>
            <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          {priceNum > 0 && taxRateNum > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('preTaxPrice')}</span>
                <span className="font-semibold">${preTaxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('taxAmount')}</span>
                <span className="font-semibold text-red-600">+${taxAmount.toFixed(2)}</span>
              </div>
              <hr className="border-blue-200" />
              <div className="flex justify-between">
                <span className="text-gray-600">{t('totalPrice')}</span>
                <span className="font-bold text-blue-600 text-lg">${totalPrice.toFixed(2)}</span>
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
