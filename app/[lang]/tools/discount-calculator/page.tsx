'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  originalPrice: { en: 'Original Price', it: 'Prezzo Originale', es: 'Precio Original', fr: 'Prix Original', de: 'Originalpreis', pt: 'Preço Original' },
  discountPercent: { en: 'Discount (%)', it: 'Sconto (%)', es: 'Descuento (%)', fr: 'Remise (%)', de: 'Rabatt (%)', pt: 'Desconto (%)' },
  finalPrice: { en: 'Final Price', it: 'Prezzo Finale', es: 'Precio Final', fr: 'Prix Final', de: 'Endpreis', pt: 'Preço Final' },
  youSave: { en: 'You Save', it: 'Risparmi', es: 'Ahorras', fr: 'Vous Économisez', de: 'Sie Sparen', pt: 'Você Economiza' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'How to Calculate Discounts and Sale Prices',
    paragraphs: [
      'Discount calculations are among the most practical math skills for everyday shopping. Whether you are browsing a seasonal sale, comparing coupon offers, or negotiating a price, knowing how to quickly determine the final price after a percentage discount helps you make smarter purchasing decisions and stay within your budget.',
      'Our discount calculator instantly computes the final price and your total savings from any percentage discount. Simply enter the original price and the discount percentage, and the tool shows you exactly how much you save and what you will pay. You can also use the preset discount buttons for the most common sale percentages — 10%, 15%, 20%, 25%, 30%, and 50%.',
      'Understanding discounts is also essential for retailers and business owners who need to set competitive prices while maintaining profit margins. By experimenting with different discount levels, you can find the sweet spot that attracts customers without eroding your profitability. This calculator is equally useful for consumers looking to verify that a discount is being applied correctly at checkout.',
    ],
    faq: [
      { q: 'How do I calculate the final price after a discount?', a: 'Multiply the original price by (1 - discount percentage / 100). For example, a $80 item with a 25% discount: $80 x (1 - 0.25) = $80 x 0.75 = $60.' },
      { q: 'How do I find the discount percentage from two prices?', a: 'Subtract the sale price from the original price, divide by the original price, and multiply by 100. For example: ($100 - $75) / $100 x 100 = 25% discount.' },
      { q: 'Are multiple discounts the same as adding them together?', a: 'No. Stacked discounts are applied sequentially. A 20% discount followed by a 10% discount is not 30% off — it equals 28% off. The second discount applies to the already-reduced price.' },
      { q: 'How do I calculate the original price from a discounted price?', a: 'Divide the sale price by (1 - discount percentage / 100). For example, if an item costs $60 after a 25% discount: $60 / 0.75 = $80 original price.' },
      { q: 'What is the difference between a discount and a coupon?', a: 'A discount is a percentage or fixed amount reduction applied to the price. A coupon is a specific offer — often a code or voucher — that grants a discount. Coupons may have conditions like minimum purchase amounts or expiration dates.' },
    ],
  },
  it: {
    title: 'Come Calcolare Sconti e Prezzi in Saldo',
    paragraphs: [
      'Il calcolo degli sconti e una delle competenze matematiche piu pratiche per lo shopping quotidiano. Che tu stia navigando tra i saldi stagionali, confrontando offerte con coupon o negoziando un prezzo, sapere come determinare rapidamente il prezzo finale dopo uno sconto percentuale ti aiuta a prendere decisioni di acquisto piu intelligenti.',
      'Il nostro calcolatore di sconti calcola istantaneamente il prezzo finale e il risparmio totale da qualsiasi sconto percentuale. Basta inserire il prezzo originale e la percentuale di sconto, e lo strumento mostra esattamente quanto risparmi e quanto pagherai. Puoi anche usare i pulsanti preimpostati per le percentuali di sconto piu comuni.',
      'Comprendere gli sconti e essenziale anche per commercianti e imprenditori che devono fissare prezzi competitivi mantenendo i margini di profitto. Sperimentando con diversi livelli di sconto, puoi trovare il punto ideale che attrae i clienti senza erodere la redditivita.',
    ],
    faq: [
      { q: 'Come si calcola il prezzo finale dopo uno sconto?', a: 'Moltiplica il prezzo originale per (1 - percentuale sconto / 100). Ad esempio, un articolo da 80 euro con il 25% di sconto: 80 x (1 - 0,25) = 80 x 0,75 = 60 euro.' },
      { q: 'Come trovo la percentuale di sconto da due prezzi?', a: 'Sottrai il prezzo scontato dal prezzo originale, dividi per il prezzo originale e moltiplica per 100. Esempio: (100 - 75) / 100 x 100 = 25% di sconto.' },
      { q: 'Piu sconti si sommano tra loro?', a: 'No. Gli sconti cumulativi si applicano in sequenza. Uno sconto del 20% seguito da uno del 10% non equivale al 30% — il risultato e il 28%. Il secondo sconto si applica al prezzo gia ridotto.' },
      { q: 'Come calcolo il prezzo originale da un prezzo scontato?', a: 'Dividi il prezzo scontato per (1 - percentuale sconto / 100). Esempio: se un articolo costa 60 euro dopo il 25% di sconto: 60 / 0,75 = 80 euro.' },
      { q: 'Qual e la differenza tra sconto e coupon?', a: 'Uno sconto e una riduzione percentuale o fissa applicata al prezzo. Un coupon e un\'offerta specifica — spesso un codice o buono — che concede uno sconto, con eventuali condizioni come importo minimo di acquisto o data di scadenza.' },
    ],
  },
  es: {
    title: 'Como Calcular Descuentos y Precios de Oferta',
    paragraphs: [
      'El calculo de descuentos es una de las habilidades matematicas mas practicas para las compras diarias. Ya sea que estes mirando rebajas de temporada, comparando cupones o negociando un precio, saber determinar rapidamente el precio final tras un descuento porcentual te ayuda a tomar decisiones de compra mas inteligentes.',
      'Nuestra calculadora de descuentos calcula instantaneamente el precio final y tu ahorro total a partir de cualquier descuento porcentual. Solo introduce el precio original y el porcentaje de descuento, y la herramienta muestra exactamente cuanto ahorras y cuanto pagaras.',
      'Entender los descuentos es tambien esencial para comerciantes y empresarios que necesitan fijar precios competitivos manteniendo margenes de beneficio. Experimentando con diferentes niveles de descuento, puedes encontrar el punto ideal que atrae clientes sin erosionar la rentabilidad.',
    ],
    faq: [
      { q: 'Como calculo el precio final despues de un descuento?', a: 'Multiplica el precio original por (1 - porcentaje de descuento / 100). Por ejemplo, un articulo de 80 euros con 25% de descuento: 80 x 0,75 = 60 euros.' },
      { q: 'Como encuentro el porcentaje de descuento entre dos precios?', a: 'Resta el precio rebajado del original, divide entre el precio original y multiplica por 100. Ejemplo: (100 - 75) / 100 x 100 = 25%.' },
      { q: 'Varios descuentos se suman entre si?', a: 'No. Los descuentos acumulativos se aplican secuencialmente. Un 20% seguido de un 10% no es un 30% — equivale al 28%. El segundo descuento se aplica al precio ya reducido.' },
      { q: 'Como calculo el precio original desde un precio con descuento?', a: 'Divide el precio rebajado entre (1 - porcentaje / 100). Si un articulo cuesta 60 euros tras un 25% de descuento: 60 / 0,75 = 80 euros.' },
      { q: 'Cual es la diferencia entre descuento y cupon?', a: 'Un descuento es una reduccion porcentual o fija del precio. Un cupon es una oferta especifica que otorga un descuento, a menudo con condiciones como compra minima o fecha de caducidad.' },
    ],
  },
  fr: {
    title: 'Comment Calculer les Remises et Prix en Solde',
    paragraphs: [
      'Le calcul des remises est l\'une des competences mathematiques les plus pratiques pour les achats quotidiens. Que vous parcouriez les soldes saisonnieres, compariez des offres de coupons ou negociiez un prix, savoir determiner rapidement le prix final apres une remise vous aide a prendre de meilleures decisions d\'achat.',
      'Notre calculateur de remise calcule instantanement le prix final et vos economies totales a partir de n\'importe quel pourcentage de remise. Entrez simplement le prix original et le pourcentage de remise, et l\'outil affiche exactement combien vous economisez et ce que vous paierez.',
      'Comprendre les remises est aussi essentiel pour les commercants qui doivent fixer des prix competitifs tout en maintenant leurs marges beneficiaires. En experimentant differents niveaux de remise, vous pouvez trouver l\'equilibre ideal entre attraction client et rentabilite.',
    ],
    faq: [
      { q: 'Comment calculer le prix final apres une remise?', a: 'Multipliez le prix original par (1 - pourcentage de remise / 100). Exemple: un article a 80 euros avec 25% de remise: 80 x 0,75 = 60 euros.' },
      { q: 'Comment trouver le pourcentage de remise entre deux prix?', a: 'Soustrayez le prix solde du prix original, divisez par le prix original et multipliez par 100. Exemple: (100 - 75) / 100 x 100 = 25%.' },
      { q: 'Les remises multiples s\'additionnent-elles?', a: 'Non. Les remises cumulees s\'appliquent sequentiellement. Une remise de 20% suivie de 10% n\'equivaut pas a 30% — le resultat est 28%. La seconde remise s\'applique au prix deja reduit.' },
      { q: 'Comment calculer le prix original a partir d\'un prix remise?', a: 'Divisez le prix solde par (1 - pourcentage / 100). Si un article coute 60 euros apres 25% de remise: 60 / 0,75 = 80 euros.' },
      { q: 'Quelle est la difference entre remise et coupon?', a: 'Une remise est une reduction en pourcentage ou en montant fixe du prix. Un coupon est une offre specifique qui accorde une remise, souvent avec des conditions comme un montant minimum d\'achat.' },
    ],
  },
  de: {
    title: 'Wie man Rabatte und Angebotspreise berechnet',
    paragraphs: [
      'Rabattberechnungen gehoeren zu den praktischsten mathematischen Faehigkeiten fuer den taeglichen Einkauf. Ob Sie Saisonschlusverkaeufe durchstoebern, Gutscheinangebote vergleichen oder einen Preis verhandeln — zu wissen, wie man den Endpreis nach einem prozentualen Rabatt schnell ermittelt, hilft Ihnen bei klugeren Kaufentscheidungen.',
      'Unser Rabattrechner berechnet sofort den Endpreis und Ihre Gesamtersparnis bei jedem prozentualen Rabatt. Geben Sie einfach den Originalpreis und den Rabattprozentsatz ein, und das Tool zeigt Ihnen genau, wie viel Sie sparen und was Sie bezahlen werden.',
      'Rabatte zu verstehen ist auch fuer Haendler und Unternehmer wichtig, die wettbewerbsfaehige Preise setzen und gleichzeitig Gewinnmargen erhalten muessen. Durch Experimentieren mit verschiedenen Rabattstufen finden Sie den idealen Punkt zwischen Kundenanziehung und Rentabilitaet.',
    ],
    faq: [
      { q: 'Wie berechne ich den Endpreis nach einem Rabatt?', a: 'Multiplizieren Sie den Originalpreis mit (1 - Rabattprozent / 100). Beispiel: Ein Artikel fuer 80 Euro mit 25% Rabatt: 80 x 0,75 = 60 Euro.' },
      { q: 'Wie finde ich den Rabattprozentsatz aus zwei Preisen?', a: 'Ziehen Sie den Angebotspreis vom Originalpreis ab, teilen Sie durch den Originalpreis und multiplizieren Sie mit 100. Beispiel: (100 - 75) / 100 x 100 = 25%.' },
      { q: 'Addieren sich mehrere Rabatte?', a: 'Nein. Gestaffelte Rabatte werden nacheinander angewendet. 20% gefolgt von 10% ergeben nicht 30%, sondern 28%. Der zweite Rabatt gilt fuer den bereits reduzierten Preis.' },
      { q: 'Wie berechne ich den Originalpreis aus einem reduzierten Preis?', a: 'Teilen Sie den Angebotspreis durch (1 - Prozent / 100). Wenn ein Artikel nach 25% Rabatt 60 Euro kostet: 60 / 0,75 = 80 Euro.' },
      { q: 'Was ist der Unterschied zwischen Rabatt und Gutschein?', a: 'Ein Rabatt ist eine prozentuale oder feste Preissenkung. Ein Gutschein ist ein bestimmtes Angebot, das einen Rabatt gewaehrt, oft mit Bedingungen wie Mindestbestellwert oder Ablaufdatum.' },
    ],
  },
  pt: {
    title: 'Como Calcular Descontos e Precos de Promocao',
    paragraphs: [
      'O calculo de descontos e uma das competencias matematicas mais praticas para as compras do dia a dia. Quer esteja a navegar por saldos de temporada, a comparar cupoes ou a negociar um preco, saber determinar rapidamente o preco final apos um desconto percentual ajuda-o a tomar decisoes de compra mais inteligentes.',
      'A nossa calculadora de descontos calcula instantaneamente o preco final e a sua poupanca total a partir de qualquer desconto percentual. Basta introduzir o preco original e a percentagem de desconto, e a ferramenta mostra exatamente quanto poupa e quanto pagara.',
      'Compreender os descontos e tambem essencial para comerciantes e empresarios que precisam definir precos competitivos mantendo margens de lucro. Ao experimentar com diferentes niveis de desconto, pode encontrar o ponto ideal que atrai clientes sem corroer a rentabilidade.',
    ],
    faq: [
      { q: 'Como calculo o preco final apos um desconto?', a: 'Multiplique o preco original por (1 - percentagem de desconto / 100). Exemplo: um artigo de 80 euros com 25% de desconto: 80 x 0,75 = 60 euros.' },
      { q: 'Como encontro a percentagem de desconto entre dois precos?', a: 'Subtraia o preco com desconto do original, divida pelo preco original e multiplique por 100. Exemplo: (100 - 75) / 100 x 100 = 25%.' },
      { q: 'Varios descontos somam-se?', a: 'Nao. Descontos cumulativos aplicam-se sequencialmente. 20% seguido de 10% nao e 30% — equivale a 28%. O segundo desconto aplica-se ao preco ja reduzido.' },
      { q: 'Como calculo o preco original a partir de um preco com desconto?', a: 'Divida o preco com desconto por (1 - percentagem / 100). Se um artigo custa 60 euros apos 25% de desconto: 60 / 0,75 = 80 euros.' },
      { q: 'Qual e a diferenca entre desconto e cupao?', a: 'Um desconto e uma reducao percentual ou fixa do preco. Um cupao e uma oferta especifica que concede um desconto, frequentemente com condicoes como valor minimo de compra ou data de validade.' },
    ],
  },
};

export default function DiscountCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['discount-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');

  const priceNum = parseFloat(price) || 0;
  const discountNum = parseFloat(discount) || 0;
  const saved = priceNum * (discountNum / 100);
  const finalPrice = priceNum - saved;

  const presets = [10, 15, 20, 25, 30, 50];

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="discount-calculator">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('originalPrice')}</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('discountPercent')}</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {presets.map((p) => (
                <button key={p} onClick={() => setDiscount(String(p))}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${String(p) === discount ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {p}%
                </button>
              ))}
            </div>
            <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          {priceNum > 0 && discountNum > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('youSave')}</span>
                <span className="font-semibold text-green-600">${saved.toFixed(2)}</span>
              </div>
              <hr className="border-blue-200" />
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-900">{t('finalPrice')}</span>
                <span className="font-bold text-blue-600">${finalPrice.toFixed(2)}</span>
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
