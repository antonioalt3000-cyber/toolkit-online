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

const vatLabels: Record<string, Record<string, string>> = {
  addVat: { en: 'Add VAT', it: 'Aggiungi IVA', es: 'Añadir IVA', fr: 'Ajouter TVA', de: 'MwSt hinzufügen', pt: 'Adicionar IVA' },
  removeVat: { en: 'Remove VAT', it: 'Scorporo IVA', es: 'Quitar IVA', fr: 'Retirer TVA', de: 'MwSt entfernen', pt: 'Remover IVA' },
  amount: { en: 'Amount', it: 'Importo (€)', es: 'Cantidad (€)', fr: 'Montant (€)', de: 'Betrag (€)', pt: 'Valor (€)' },
  vatRate: { en: 'VAT Rate', it: 'Aliquota IVA', es: 'Tipo de IVA', fr: 'Taux TVA', de: 'MwSt-Satz', pt: 'Taxa IVA' },
  netAmount: { en: 'Net amount', it: 'Importo netto', es: 'Importe neto', fr: 'Montant HT', de: 'Nettobetrag', pt: 'Valor líquido' },
  grossAmount: { en: 'Amount with VAT', it: 'Importo con IVA', es: 'Importe con IVA', fr: 'Montant TTC', de: 'Bruttobetrag', pt: 'Valor com IVA' },
  vat: { en: 'VAT', it: 'IVA', es: 'IVA', fr: 'TVA', de: 'MwSt', pt: 'IVA' },
  totalWithVat: { en: 'Total with VAT', it: 'Totale con IVA', es: 'Total con IVA', fr: 'Total TTC', de: 'Gesamt mit MwSt', pt: 'Total com IVA' },
  reset: { en: 'Reset', it: 'Reset', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Reiniciar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  invalidAmount: { en: 'Enter a valid amount', it: 'Inserisci un importo valido', es: 'Ingresa un monto válido', fr: 'Entrez un montant valide', de: 'Geben Sie einen gültigen Betrag ein', pt: 'Insira um valor válido' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'VAT Calculator — Add and Remove VAT from Any Price Online',
    paragraphs: [
      'Need to <strong>add VAT</strong> to a net price or <strong>remove VAT</strong> from a gross amount? This free VAT calculator handles both operations instantly. Value Added Tax (VAT) is a consumption tax collected at every stage of the supply chain, and getting the numbers right is essential for invoicing, bookkeeping, and tax compliance. Whether you are a freelancer pricing your services, a business owner preparing quotes, or a consumer checking a receipt, our calculator for VAT gives you accurate results in one click — no spreadsheets, no manual maths, no sign-up required.',
      '<strong>How to Add VAT onto a Price.</strong> Adding VAT to a net (excluding VAT) amount is straightforward. Use the formula: <em>Gross = Net x (1 + VAT rate)</em>. For example, to add 20% VAT to a net price of 500: VAT = 500 x 0.20 = 100, so the total with VAT is 600. If you need to add 5% VAT instead — say for a 5% VAT calculator scenario — the sum is 500 x 1.05 = 525. With this add VAT calculator, simply enter the amount, pick the rate, press "Add VAT" and the tool does the rest. It works for any rate: 4%, 5%, 7%, 10%, 13%, 19%, 20%, 21%, 22%, 23%, or 25%.',
      '<strong>How to Remove VAT from a Price.</strong> Removing VAT (also called a reverse or deduct VAT calculation) means finding the ex-VAT price from a VAT-inclusive amount. The formula is: <em>Net = Gross / (1 + VAT rate)</em>. For example, to remove 20% VAT from 600: Net = 600 / 1.20 = 500, and the VAT portion is 100. This before-VAT calculator mode is especially useful when you receive a gross invoice and need to see the price excluding VAT. Freelancers use it to separate their net income from the tax owed, and businesses use it to verify supplier invoices before recording them in the books.',
      '<strong>VAT Rates by Country.</strong> VAT rates vary widely across the world, so choosing the correct rate is critical. In the <strong>United Kingdom</strong>, the standard rate is 20% with a reduced rate of 5% for domestic fuel and certain goods. <strong>Germany</strong> applies 19% standard and 7% reduced. <strong>France</strong> uses four tiers: 20%, 10%, 5.5%, and 2.1%. <strong>Spain</strong> charges 21%, 10%, and 4%. <strong>Italy</strong> has 22%, 10%, 5%, and 4%. <strong>Portugal</strong> applies 23%, 13%, and 6%. The <strong>Netherlands</strong> charges 21% and 9%, <strong>Ireland</strong> 23% and 13.5%, and Nordic countries like <strong>Sweden</strong> and <strong>Denmark</strong> set their standard rate at 25%. Outside Europe, <strong>Australia</strong> levies 10% GST, <strong>Canada</strong> 5% federal GST plus provincial rates, <strong>India</strong> uses GST slabs from 5% to 28%, and <strong>South Africa</strong> charges 15%. Always confirm the current rate with your national tax authority before filing.',
      '<strong>Practical examples: 550 plus VAT, ex VAT, and more.</strong> Suppose you have a quote for 550 excluding VAT at 20%. Using the add VAT calculator: 550 x 1.20 = 660. The VAT portion is 110 and the total including VAT is 660. Now imagine you see a price of 660 including VAT and want the price excluding VAT. The deduct VAT calculator gives you: 660 / 1.20 = 550. These examples show how quickly you can switch between VAT-inclusive and ex-VAT figures without any manual work.',
      'Accurate VAT calculations prevent costly errors and penalties from tax authorities. If you are building invoices, pair this tool with our <a href="/en/tools/invoice-generator">invoice generator</a> to create professional documents in seconds. For general percentage maths, try our <a href="/en/tools/percentage-calculator">percentage calculator</a>, and for US-style taxes, use our <a href="/en/tools/sales-tax-calculator">sales tax calculator</a>. Together these tools form a complete financial toolkit — free, fast, and always available online.',
    ],
    faq: [
      { q: 'How do I add VAT onto a price?', a: 'To add VAT to a net price, multiply the amount by (1 + VAT rate). For example, to add 20% VAT to 100: 100 x 1.20 = 120. The VAT portion is 20 and the gross total is 120. This works for any rate — just replace 20% with your applicable percentage, such as 5%, 10%, or 21%. Use the "Add VAT" button on this calculator to get the result instantly.' },
      { q: 'How do I remove VAT from a price?', a: 'To remove VAT from a gross (VAT-inclusive) price, divide the amount by (1 + VAT rate). For instance, to deduct 20% VAT from 240: 240 / 1.20 = 200. The net (ex VAT) amount is 200 and the VAT portion is 40. This reverse VAT calculation is also called a "before VAT calculator" because it reveals the original price before tax was added.' },
      { q: 'What is the difference between ex VAT and including VAT?', a: 'A price "excluding VAT" (ex VAT) is the net amount before any tax is added. A price "including VAT" is the gross amount that already contains the tax. For example, if an item costs 100 ex VAT at 20%, the price including VAT is 120. Many B2B invoices show prices excluding VAT, while consumer-facing prices in Europe typically include VAT. This calculator lets you convert between both formats instantly.' },
      { q: 'How do I calculate 5% VAT on an amount?', a: 'To calculate 5% VAT, multiply the net amount by 0.05. For example, 5% VAT on 200 is 200 x 0.05 = 10, giving a total of 210. You can also use this 5% VAT calculator by selecting the 5% rate button and entering your amount. The 5% reduced rate applies in the UK for domestic energy, child car seats, and certain other goods.' },
      { q: 'What is 550 plus VAT at 20%?', a: 'To calculate 550 plus VAT at 20%, multiply 550 by 1.20. The result is 660. The VAT portion is 550 x 0.20 = 110, so the total price including 20% VAT is 660. You can verify this using the "Add VAT" mode on this calculator — enter 550, select the 20% rate, and the tool displays the breakdown instantly.' },
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
      { q: 'O IVA e o mesmo que Sales Tax?', a: 'Nao. O IVA e cobrado em cada etapa da producao e distribuicao, enquanto a Sales Tax e cobrada apenas uma vez no ponto de venta final ao consumidor.' },
    ],
  },
};

export default function VatCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const t = common[lang];
  const toolT = tools['vat-calculator'][lang];
  const rates = vatRates[lang] || vatRates.en;
  const vt = (key: string) => vatLabels[key]?.[lang] || vatLabels[key]?.en || key;

  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(rates[0]);
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ mode: string; amount: string; rate: number; result: string }[]>([]);
  const [touched, setTouched] = useState(false);

  const num = parseFloat(amount) || 0;
  const amountError = touched && amount !== '' && num <= 0;
  const vatAmount = mode === 'add' ? num * (rate / 100) : num - num / (1 + rate / 100);
  const total = mode === 'add' ? num + num * (rate / 100) : num / (1 + rate / 100);

  const handleReset = () => {
    setAmount('');
    setRate(rates[0]);
    setMode('add');
    setTouched(false);
  };

  const copyResult = () => {
    if (num > 0) {
      const text = `${vt('vat')}: €${vatAmount.toFixed(2)} | ${mode === 'add' ? vt('totalWithVat') : vt('netAmount')}: €${total.toFixed(2)}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Track history
  const prevAmount = useState('');
  if (num > 0 && amount !== prevAmount[0]) {
    prevAmount[1](amount);
    setHistory(prev => [{
      mode: mode === 'add' ? '+' : '-',
      amount: `€${num.toFixed(2)}`,
      rate,
      result: `€${total.toFixed(2)}`
    }, ...prev].slice(0, 5));
  }

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="vat-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('add')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${mode === 'add' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              + {vt('addVat')}
            </button>
            <button
              onClick={() => setMode('remove')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${mode === 'remove' ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              - {vt('removeVat')}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{vt('amount')}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="0.00"
                className={`w-full border rounded-lg pl-8 pr-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${amountError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
            </div>
            {amountError && <p className="text-red-500 text-xs mt-1">{vt('invalidAmount')}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{vt('vatRate')}</label>
            <div className="flex gap-2 flex-wrap">
              {rates.map((r) => (
                <button
                  key={r}
                  onClick={() => setRate(r)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${r === rate ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <button onClick={handleReset} className="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
            {vt('reset')}
          </button>

          {num > 0 && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <div className="text-xs text-gray-500">{mode === 'add' ? vt('netAmount') : vt('grossAmount')}</div>
                  <div className="text-xl font-bold text-gray-700">€{num.toFixed(2)}</div>
                </div>
                <div className={`p-4 rounded-xl text-center ${mode === 'add' ? 'bg-green-50 border border-green-100' : 'bg-orange-50 border border-orange-100'}`}>
                  <div className="text-xs text-gray-500">{vt('vat')} ({rate}%)</div>
                  <div className={`text-xl font-bold ${mode === 'add' ? 'text-green-700' : 'text-orange-700'}`}>€{vatAmount.toFixed(2)}</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                  <div className="text-xs text-gray-500">{mode === 'add' ? vt('totalWithVat') : vt('netAmount')}</div>
                  <div className="text-xl font-bold text-blue-700">€{total.toFixed(2)}</div>
                </div>
              </div>

              {/* Visual breakdown bar */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  {mode === 'add' ? (
                    <div className="h-full flex">
                      <div className="bg-blue-500 h-full" style={{ width: `${(num / (num + vatAmount)) * 100}%` }} />
                      <div className="bg-green-500 h-full" style={{ width: `${(vatAmount / (num + vatAmount)) * 100}%` }} />
                    </div>
                  ) : (
                    <div className="h-full flex">
                      <div className="bg-blue-500 h-full" style={{ width: `${(total / num) * 100}%` }} />
                      <div className="bg-orange-500 h-full" style={{ width: `${(vatAmount / num) * 100}%` }} />
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{vt('netAmount')}</span>
                  <span>{vt('vat')}</span>
                </div>
              </div>

              <button onClick={copyResult} className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">
                {copied ? vt('copied') : vt('copy')}
              </button>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">{vt('history')}</h3>
              <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:text-red-700">Clear</button>
            </div>
            <div className="space-y-1">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between text-sm px-2 py-1.5 bg-gray-50 rounded">
                  <span className="text-gray-500">{h.mode} {h.amount} @ {h.rate}%</span>
                  <span className="font-semibold text-gray-900">{h.result}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: p }} />)}
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
