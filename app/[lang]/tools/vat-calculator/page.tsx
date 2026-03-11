'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { common, tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const vatRates: Record<string, number[]> = {
  it: [22, 10, 5, 4],
  es: [21, 10, 4],
  fr: [20, 10, 5.5, 2.1],
  de: [19, 7],
  pt: [23, 13, 6],
  en: [20, 15, 10, 5],
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'What Is a VAT Calculator and How Does It Work?',
    paragraphs: [
      'Value Added Tax (VAT) is a consumption tax applied at each stage of the supply chain where value is added to a product or service. Unlike sales tax, which is only collected at the final point of sale, VAT is levied incrementally. For businesses, consumers, and freelancers, understanding the exact VAT amount on a transaction is essential for accurate bookkeeping, pricing strategies, and tax compliance.',
      'Our free online VAT calculator lets you instantly add VAT to a net price or remove VAT from a gross amount. Simply enter your amount, select the applicable VAT rate for your country, and choose whether you want to calculate the tax-inclusive or tax-exclusive figure. The tool supports the standard and reduced rates used across the UK, Italy, Spain, France, Germany, and Portugal, making it invaluable for cross-border trade within Europe.',
      'Accurate VAT calculations help businesses avoid underpaying or overpaying tax, which can result in penalties from tax authorities. Whether you are preparing invoices, quoting clients, or reconciling expenses, this calculator saves you time and eliminates manual arithmetic errors. It is especially useful for small business owners and freelancers who manage their own accounts without dedicated accounting software.',
    ],
    faq: [
      { q: 'How do I calculate VAT from a gross amount?', a: 'To extract VAT from a gross (tax-inclusive) price, divide the gross amount by (1 + VAT rate). For example, if the gross price is 120 and VAT is 20%, the net amount is 120 / 1.20 = 100, and the VAT portion is 20.' },
      { q: 'What is the difference between adding and removing VAT?', a: 'Adding VAT means computing the tax on top of a net price to get the gross total. Removing VAT means extracting the tax portion from a gross price to find the original net amount. Both operations use the same VAT rate but apply the formula differently.' },
      { q: 'Which VAT rates apply in European countries?', a: 'Each EU country sets its own standard and reduced VAT rates. For instance, Italy uses 22% standard and 4%-10% reduced, Germany has 19% and 7%, France applies 20% standard with reduced rates of 5.5% and 2.1%, and Portugal uses 23%, 13%, and 6%.' },
      { q: 'Can I use this VAT calculator for business invoices?', a: 'Yes. Enter the net amount of your product or service, select the appropriate VAT rate, and the calculator will show you the exact VAT to charge and the gross total to include on your invoice.' },
      { q: 'Is VAT the same as sales tax?', a: 'No. VAT is collected at every stage of production and distribution, with each business in the chain remitting tax only on the value it adds. Sales tax is collected only once at the final point of sale to the consumer.' },
    ],
  },
  it: {
    title: 'Cos\'e il Calcolatore IVA e Come Funziona?',
    paragraphs: [
      'L\'Imposta sul Valore Aggiunto (IVA) e una tassa sui consumi applicata a ogni fase della catena produttiva in cui si aggiunge valore a un prodotto o servizio. Per aziende, consumatori e liberi professionisti, conoscere l\'importo esatto dell\'IVA su una transazione e fondamentale per una contabilita precisa, strategie di prezzo corrette e la conformita fiscale.',
      'Il nostro calcolatore IVA online gratuito ti permette di aggiungere istantaneamente l\'IVA a un prezzo netto o di scorporare l\'IVA da un importo lordo. Basta inserire l\'importo, selezionare l\'aliquota IVA applicabile e scegliere se vuoi calcolare il prezzo ivato o il prezzo senza IVA. Lo strumento supporta le aliquote ordinarie e ridotte utilizzate in Italia (22%, 10%, 5%, 4%) e in altri paesi europei.',
      'Calcoli IVA accurati aiutano le aziende a evitare di pagare troppe o troppo poche tasse, il che puo comportare sanzioni da parte dell\'Agenzia delle Entrate. Che tu stia preparando fatture, facendo preventivi o riconciliando spese, questo calcolatore ti fa risparmiare tempo ed elimina gli errori di calcolo manuali. E particolarmente utile per piccoli imprenditori e freelance che gestiscono la propria contabilita.',
    ],
    faq: [
      { q: 'Come si scorpore l\'IVA da un prezzo lordo?', a: 'Per estrarre l\'IVA da un prezzo lordo (IVA inclusa), dividi l\'importo lordo per (1 + aliquota IVA). Ad esempio, se il prezzo lordo e 122 e l\'IVA e al 22%, l\'importo netto e 122 / 1,22 = 100, e la quota IVA e 22.' },
      { q: 'Qual e la differenza tra aggiungere e scorporare l\'IVA?', a: 'Aggiungere l\'IVA significa calcolare la tassa sopra un prezzo netto per ottenere il totale lordo. Scorporare l\'IVA significa estrarre la quota fiscale da un prezzo lordo per trovare l\'importo netto originale.' },
      { q: 'Quali aliquote IVA si applicano in Italia?', a: 'In Italia le aliquote IVA sono: 22% ordinaria, 10% ridotta per ristoranti e ristrutturazioni, 5% per alcuni prodotti alimentari e 4% super-ridotta per beni di prima necessita come pane e latte.' },
      { q: 'Posso usare questo calcolatore per le fatture?', a: 'Si. Inserisci l\'importo netto del tuo prodotto o servizio, seleziona l\'aliquota IVA appropriata e il calcolatore mostrera l\'IVA esatta da applicare e il totale lordo da includere in fattura.' },
      { q: 'L\'IVA e uguale alla Sales Tax americana?', a: 'No. L\'IVA viene riscossa a ogni fase della produzione e distribuzione, con ogni azienda nella catena che versa l\'imposta solo sul valore aggiunto. La Sales Tax viene raccolta una sola volta al punto vendita finale.' },
    ],
  },
  es: {
    title: 'Que es una Calculadora de IVA y Como Funciona?',
    paragraphs: [
      'El Impuesto sobre el Valor Anadido (IVA) es un tributo al consumo que se aplica en cada etapa de la cadena de suministro donde se anade valor a un producto o servicio. Para empresas, consumidores y autonomos, conocer el importe exacto del IVA en una transaccion es esencial para una contabilidad precisa, estrategias de precios correctas y el cumplimiento fiscal.',
      'Nuestra calculadora de IVA en linea gratuita te permite anadir instantaneamente el IVA a un precio neto o extraer el IVA de un importe bruto. Solo tienes que introducir la cantidad, seleccionar el tipo de IVA aplicable y elegir si quieres calcular el precio con o sin impuestos. La herramienta es compatible con los tipos general y reducido de Espana (21%, 10%, 4%) y otros paises europeos.',
      'Calculos de IVA precisos ayudan a las empresas a evitar pagar de mas o de menos, lo que puede acarrear sanciones de Hacienda. Ya sea que estes preparando facturas, haciendo presupuestos o conciliando gastos, esta calculadora te ahorra tiempo y elimina errores de calculo manuales.',
    ],
    faq: [
      { q: 'Como se calcula el IVA a partir de un precio con impuestos?', a: 'Para extraer el IVA de un precio bruto, divide el importe bruto por (1 + tipo de IVA). Por ejemplo, si el precio es 121 y el IVA es del 21%, el importe neto es 121 / 1,21 = 100 y el IVA es 21.' },
      { q: 'Cual es la diferencia entre anadir y quitar el IVA?', a: 'Anadir IVA significa calcular el impuesto sobre un precio neto. Quitar IVA significa extraer la parte fiscal de un precio bruto para encontrar el importe neto original.' },
      { q: 'Que tipos de IVA se aplican en Espana?', a: 'En Espana se aplican tres tipos: 21% general, 10% reducido para alimentos y hosteleria, y 4% superreducido para productos de primera necesidad como pan, leche y libros.' },
      { q: 'Puedo usar esta calculadora para facturas profesionales?', a: 'Si. Introduce el importe neto de tu producto o servicio, selecciona el tipo de IVA correspondiente y la calculadora mostrara el IVA exacto y el total bruto para tu factura.' },
      { q: 'El IVA es lo mismo que el Sales Tax?', a: 'No. El IVA se recauda en cada fase de produccion y distribucion, mientras que el Sales Tax se cobra solo una vez en el punto de venta final al consumidor.' },
    ],
  },
  fr: {
    title: 'Qu\'est-ce qu\'un Calculateur de TVA et Comment Fonctionne-t-il?',
    paragraphs: [
      'La Taxe sur la Valeur Ajoutee (TVA) est un impot a la consommation applique a chaque etape de la chaine d\'approvisionnement ou de la valeur est ajoutee a un produit ou service. Pour les entreprises, les consommateurs et les travailleurs independants, connaitre le montant exact de la TVA sur une transaction est essentiel pour une comptabilite precise et la conformite fiscale.',
      'Notre calculateur de TVA en ligne gratuit vous permet d\'ajouter instantanement la TVA a un prix hors taxes ou de retirer la TVA d\'un montant TTC. Il suffit d\'entrer votre montant, de selectionner le taux de TVA applicable et de choisir si vous souhaitez calculer le prix TTC ou HT. L\'outil prend en charge les taux standard et reduits utilises en France (20%, 10%, 5,5%, 2,1%) et dans d\'autres pays europeens.',
      'Des calculs de TVA precis aident les entreprises a eviter de trop payer ou de sous-payer les impots, ce qui peut entrainer des penalites de l\'administration fiscale. Que vous prepariez des factures, fassiez des devis ou reconciliiez des depenses, ce calculateur vous fait gagner du temps et elimine les erreurs de calcul manuelles.',
    ],
    faq: [
      { q: 'Comment calculer la TVA a partir d\'un prix TTC?', a: 'Pour extraire la TVA d\'un prix TTC, divisez le montant par (1 + taux de TVA). Par exemple, si le prix TTC est 120 et la TVA est de 20%, le montant HT est 120 / 1,20 = 100 et la TVA est de 20.' },
      { q: 'Quelle est la difference entre ajouter et retirer la TVA?', a: 'Ajouter la TVA signifie calculer la taxe sur un prix HT pour obtenir le total TTC. Retirer la TVA signifie extraire la part fiscale d\'un prix TTC pour retrouver le montant HT original.' },
      { q: 'Quels sont les taux de TVA en France?', a: 'La France applique quatre taux: 20% normal, 10% intermediaire pour la restauration et les travaux, 5,5% reduit pour les produits alimentaires et 2,1% super-reduit pour la presse et les medicaments.' },
      { q: 'Puis-je utiliser ce calculateur pour mes factures?', a: 'Oui. Entrez le montant HT de votre produit ou service, selectionnez le taux de TVA approprie et le calculateur affichera la TVA exacte et le total TTC a inclure sur votre facture.' },
      { q: 'La TVA est-elle identique a la Sales Tax?', a: 'Non. La TVA est collectee a chaque etape de la production et de la distribution, tandis que la Sales Tax n\'est prelevee qu\'une seule fois au point de vente final.' },
    ],
  },
  de: {
    title: 'Was ist ein MwSt-Rechner und wie funktioniert er?',
    paragraphs: [
      'Die Mehrwertsteuer (MwSt) ist eine Verbrauchssteuer, die auf jeder Stufe der Lieferkette erhoben wird, auf der einem Produkt oder einer Dienstleistung ein Mehrwert hinzugefuegt wird. Fuer Unternehmen, Verbraucher und Freiberufler ist es wichtig, den genauen MwSt-Betrag einer Transaktion zu kennen, um eine praezise Buchfuehrung, korrekte Preisstrategien und die Einhaltung der Steuervorschriften zu gewaehrleisten.',
      'Unser kostenloser Online-MwSt-Rechner ermoeglicht es Ihnen, sofort die MwSt zu einem Nettobetrag hinzuzufuegen oder die MwSt aus einem Bruttobetrag herauszurechnen. Geben Sie einfach Ihren Betrag ein, waehlen Sie den geltenden MwSt-Satz und entscheiden Sie, ob Sie den Brutto- oder Nettobetrag berechnen moechten. Das Tool unterstuetzt die in Deutschland gaengigen Saetze von 19% und 7% sowie die Saetze anderer europaeischer Laender.',
      'Praezise MwSt-Berechnungen helfen Unternehmen, Unter- oder Ueberzahlungen zu vermeiden, die zu Strafen durch das Finanzamt fuehren koennen. Ob Sie Rechnungen erstellen, Angebote machen oder Ausgaben abgleichen — dieser Rechner spart Ihnen Zeit und eliminiert manuelle Rechenfehler.',
    ],
    faq: [
      { q: 'Wie berechne ich die MwSt aus einem Bruttobetrag?', a: 'Um die MwSt aus einem Bruttobetrag herauszurechnen, teilen Sie den Bruttobetrag durch (1 + MwSt-Satz). Beispiel: Bei einem Bruttobetrag von 119 Euro und 19% MwSt ist der Nettobetrag 119 / 1,19 = 100 Euro, die MwSt betraegt 19 Euro.' },
      { q: 'Was ist der Unterschied zwischen MwSt hinzufuegen und herausrechnen?', a: 'MwSt hinzufuegen bedeutet, die Steuer auf einen Nettobetrag aufzuschlagen. MwSt herausrechnen bedeutet, den Steueranteil aus einem Bruttobetrag zu extrahieren, um den urspruenglichen Nettobetrag zu ermitteln.' },
      { q: 'Welche MwSt-Saetze gelten in Deutschland?', a: 'In Deutschland gelten zwei Saetze: 19% Regelsteuersatz fuer die meisten Waren und Dienstleistungen und 7% ermaessigter Satz fuer Lebensmittel, Buecher, Zeitungen und den oeffentlichen Nahverkehr.' },
      { q: 'Kann ich diesen Rechner fuer Geschaeftsrechnungen verwenden?', a: 'Ja. Geben Sie den Nettobetrag Ihres Produkts oder Ihrer Dienstleistung ein, waehlen Sie den passenden MwSt-Satz und der Rechner zeigt Ihnen die genaue MwSt und den Bruttobetrag fuer Ihre Rechnung an.' },
      { q: 'Ist die MwSt dasselbe wie die amerikanische Sales Tax?', a: 'Nein. Die MwSt wird auf jeder Produktions- und Vertriebsstufe erhoben, wobei jedes Unternehmen nur die Steuer auf den von ihm geschaffenen Mehrwert abfuehrt. Die Sales Tax wird nur einmal am Verkaufspunkt erhoben.' },
    ],
  },
  pt: {
    title: 'O que e uma Calculadora de IVA e Como Funciona?',
    paragraphs: [
      'O Imposto sobre o Valor Acrescentado (IVA) e um imposto sobre o consumo aplicado em cada etapa da cadeia de fornecimento onde se acrescenta valor a um produto ou servico. Para empresas, consumidores e trabalhadores independentes, conhecer o valor exato do IVA numa transacao e essencial para uma contabilidade precisa, estrategias de precos corretas e o cumprimento das obrigacoes fiscais.',
      'A nossa calculadora de IVA online gratuita permite-lhe adicionar instantaneamente o IVA a um preco liquido ou remover o IVA de um montante bruto. Basta introduzir o valor, selecionar a taxa de IVA aplicavel e escolher se pretende calcular o preco com ou sem imposto. A ferramenta suporta as taxas normal e reduzidas utilizadas em Portugal (23%, 13%, 6%) e noutros paises europeus.',
      'Calculos de IVA precisos ajudam as empresas a evitar pagar impostos a mais ou a menos, o que pode resultar em penalizacoes por parte da Autoridade Tributaria. Quer esteja a preparar faturas, a fazer orcamentos ou a conciliar despesas, esta calculadora poupa-lhe tempo e elimina erros de calculo manuais.',
    ],
    faq: [
      { q: 'Como calculo o IVA a partir de um preco com imposto?', a: 'Para extrair o IVA de um preco bruto, divida o montante por (1 + taxa de IVA). Por exemplo, se o preco e 123 e o IVA e de 23%, o valor liquido e 123 / 1,23 = 100 e o IVA e 23.' },
      { q: 'Qual e a diferenca entre adicionar e remover o IVA?', a: 'Adicionar IVA significa calcular o imposto sobre um preco liquido para obter o total bruto. Remover IVA significa extrair a parcela fiscal de um preco bruto para encontrar o valor liquido original.' },
      { q: 'Quais sao as taxas de IVA em Portugal?', a: 'Em Portugal aplicam-se tres taxas: 23% normal, 13% intermedia para restauracao e alguns produtos alimentares, e 6% reduzida para bens essenciais como pao, leite e livros.' },
      { q: 'Posso usar esta calculadora para faturas profissionais?', a: 'Sim. Introduza o valor liquido do seu produto ou servico, selecione a taxa de IVA apropriada e a calculadora mostrara o IVA exato e o total bruto a incluir na sua fatura.' },
      { q: 'O IVA e o mesmo que Sales Tax?', a: 'Nao. O IVA e cobrado em cada etapa da producao e distribuicao, enquanto a Sales Tax e cobrada apenas uma vez no ponto de venda final ao consumidor.' },
    ],
  },
};

export default function VatCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const t = common[lang];
  const toolT = tools['vat-calculator'][lang];
  const rates = vatRates[lang] || vatRates.en;

  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(rates[0]);
  const [mode, setMode] = useState<'add' | 'remove'>('add');

  const num = parseFloat(amount) || 0;
  const vatAmount = mode === 'add' ? num * (rate / 100) : num - num / (1 + rate / 100);
  const total = mode === 'add' ? num + num * (rate / 100) : num / (1 + rate / 100);

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="vat-calculator">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('add')}
              className={`flex-1 py-2 rounded-lg font-medium ${mode === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              + {lang === 'it' ? 'Aggiungi IVA' : lang === 'es' ? 'Añadir IVA' : lang === 'fr' ? 'Ajouter TVA' : lang === 'de' ? 'MwSt hinzufügen' : lang === 'pt' ? 'Adicionar IVA' : 'Add VAT'}
            </button>
            <button
              onClick={() => setMode('remove')}
              className={`flex-1 py-2 rounded-lg font-medium ${mode === 'remove' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              − {lang === 'it' ? 'Scorporo IVA' : lang === 'es' ? 'Quitar IVA' : lang === 'fr' ? 'Retirer TVA' : lang === 'de' ? 'MwSt entfernen' : lang === 'pt' ? 'Remover IVA' : 'Remove VAT'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {lang === 'it' ? 'Importo (€)' : lang === 'es' ? 'Cantidad (€)' : lang === 'fr' ? 'Montant (€)' : lang === 'de' ? 'Betrag (€)' : lang === 'pt' ? 'Valor (€)' : 'Amount'}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {lang === 'it' ? 'Aliquota IVA' : lang === 'es' ? 'Tipo de IVA' : lang === 'fr' ? 'Taux TVA' : lang === 'de' ? 'MwSt-Satz' : lang === 'pt' ? 'Taxa IVA' : 'VAT Rate'}
            </label>
            <div className="flex gap-2">
              {rates.map((r) => (
                <button
                  key={r}
                  onClick={() => setRate(r)}
                  className={`px-4 py-2 rounded-lg font-medium ${r === rate ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          {num > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{mode === 'add' ? (lang === 'it' ? 'Importo netto' : 'Net amount') : (lang === 'it' ? 'Importo con IVA' : 'Amount with VAT')}</span>
                <span className="font-semibold">€{num.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{lang === 'it' ? 'IVA' : 'VAT'} ({rate}%)</span>
                <span className="font-semibold">€{vatAmount.toFixed(2)}</span>
              </div>
              <hr className="border-blue-200" />
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-900">{mode === 'add' ? (lang === 'it' ? 'Totale con IVA' : 'Total with VAT') : (lang === 'it' ? 'Importo netto' : 'Net amount')}</span>
                <span className="font-bold text-blue-600">€{total.toFixed(2)}</span>
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
