'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '\u20AC',
  GBP: '\u00A3',
  JPY: '\u00A5',
};

const labels: Record<string, Record<Locale, string>> = {
  description: { en: 'Description', it: 'Descrizione', es: 'Descripci\u00F3n', fr: 'Description', de: 'Beschreibung', pt: 'Descri\u00E7\u00E3o' },
  quantity: { en: 'Qty', it: 'Qt\u00E0', es: 'Cant.', fr: 'Qt\u00E9', de: 'Menge', pt: 'Qtd' },
  unitPrice: { en: 'Unit Price', it: 'Prezzo Unit.', es: 'Precio Unit.', fr: 'Prix Unit.', de: 'Einzelpreis', pt: 'Pre\u00E7o Unit.' },
  lineTotal: { en: 'Total', it: 'Totale', es: 'Total', fr: 'Total', de: 'Gesamt', pt: 'Total' },
  addItem: { en: '+ Add Item', it: '+ Aggiungi', es: '+ A\u00F1adir', fr: '+ Ajouter', de: '+ Hinzuf\u00FCgen', pt: '+ Adicionar' },
  subtotal: { en: 'Subtotal', it: 'Subtotale', es: 'Subtotal', fr: 'Sous-total', de: 'Zwischensumme', pt: 'Subtotal' },
  taxRate: { en: 'Tax Rate (%)', it: 'Aliquota IVA (%)', es: 'Impuesto (%)', fr: 'Taxe (%)', de: 'Steuersatz (%)', pt: 'Imposto (%)' },
  taxAmount: { en: 'Tax', it: 'IVA', es: 'Impuesto', fr: 'Taxe', de: 'Steuer', pt: 'Imposto' },
  discount: { en: 'Discount', it: 'Sconto', es: 'Descuento', fr: 'Remise', de: 'Rabatt', pt: 'Desconto' },
  discountPercent: { en: '%', it: '%', es: '%', fr: '%', de: '%', pt: '%' },
  discountFixed: { en: 'Fixed', it: 'Fisso', es: 'Fijo', fr: 'Fixe', de: 'Fest', pt: 'Fixo' },
  grandTotal: { en: 'Grand Total', it: 'Totale Finale', es: 'Total General', fr: 'Total G\u00E9n\u00E9ral', de: 'Gesamtbetrag', pt: 'Total Geral' },
  currency: { en: 'Currency', it: 'Valuta', es: 'Moneda', fr: 'Devise', de: 'W\u00E4hrung', pt: 'Moeda' },
  copy: { en: 'Copy Summary', it: 'Copia Riepilogo', es: 'Copiar Resumen', fr: 'Copier R\u00E9sum\u00E9', de: 'Zusammenfassung Kopieren', pt: 'Copiar Resumo' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '\u00A1Copiado!', fr: 'Copi\u00E9!', de: 'Kopiert!', pt: 'Copiado!' },
  print: { en: 'Print', it: 'Stampa', es: 'Imprimir', fr: 'Imprimer', de: 'Drucken', pt: 'Imprimir' },
  reset: { en: 'Reset All', it: 'Ripristina Tutto', es: 'Restablecer Todo', fr: 'Tout R\u00E9initialiser', de: 'Alles Zur\u00FCcksetzen', pt: 'Redefinir Tudo' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'How to Calculate Invoice Totals Quickly and Accurately',
    paragraphs: [
      'Calculating invoice totals by hand is tedious and error-prone. Whether you are a freelancer quoting a project, a small business owner preparing a bill, or simply splitting costs for a group purchase, having a reliable invoice calculator saves time and prevents costly mistakes. Our free Invoice Calculator lets you add multiple line items with descriptions, quantities, and unit prices, then instantly computes line totals, subtotals, tax, discounts, and the grand total.',
      'The tool supports four major currencies (USD, EUR, GBP, JPY) so you can work in the currency your client expects. You can apply a tax rate as a percentage, and add a discount either as a percentage of the subtotal or as a fixed monetary amount. Every value updates in real-time as you type, giving you immediate feedback on the final amount owed.',
      'Once your calculation is complete, copy the full summary to your clipboard with one click or use the print button to generate a paper-friendly version. No sign-up, no server-side processing, and no data leaves your browser. This makes it an ideal quick-reference tool you can bookmark and use whenever you need to verify an invoice total.',
    ],
    faq: [
      { q: 'How is the grand total calculated?', a: 'Grand Total = (Subtotal - Discount) + Tax. The subtotal is the sum of all line totals (quantity x unit price). Tax is applied to the subtotal after the discount is deducted.' },
      { q: 'Can I switch between percentage and fixed discount?', a: 'Yes. Use the toggle next to the discount field to choose between a percentage discount (applied to the subtotal) and a fixed monetary discount subtracted directly from the subtotal.' },
      { q: 'Which currencies are supported?', a: 'The calculator supports USD (US Dollar), EUR (Euro), GBP (British Pound), and JPY (Japanese Yen). Select the currency from the dropdown at the top of the form.' },
      { q: 'Is my data stored or sent to a server?', a: 'No. All calculations happen entirely in your browser. Nothing is stored on a server and no data is transmitted over the internet.' },
      { q: 'Can I print the invoice summary?', a: 'Yes. Click the Print button to open your browser\'s print dialog. You can print to paper or save as PDF by selecting "Save as PDF" in the print destination.' },
    ],
  },
  it: {
    title: 'Come Calcolare i Totali delle Fatture in Modo Rapido e Preciso',
    paragraphs: [
      'Calcolare i totali delle fatture a mano e tedioso e soggetto a errori. Che tu sia un libero professionista, un piccolo imprenditore o semplicemente una persona che divide i costi per un acquisto di gruppo, avere un calcolatore di fatture affidabile fa risparmiare tempo e previene errori costosi. Il nostro Calcolatore Fatture gratuito ti consente di aggiungere piu voci con descrizioni, quantita e prezzi unitari, calcolando istantaneamente totali riga, subtotale, tasse, sconti e totale finale.',
      'Lo strumento supporta quattro valute principali (USD, EUR, GBP, JPY) per lavorare nella valuta che il tuo cliente si aspetta. Puoi applicare un\'aliquota fiscale in percentuale e aggiungere uno sconto sia in percentuale sia come importo fisso. Ogni valore si aggiorna in tempo reale mentre digiti, dandoti un feedback immediato sull\'importo finale dovuto.',
      'Una volta completato il calcolo, copia il riepilogo completo negli appunti con un clic o usa il pulsante stampa per generare una versione stampabile. Nessuna registrazione, nessuna elaborazione server e nessun dato esce dal tuo browser.',
    ],
    faq: [
      { q: 'Come viene calcolato il totale finale?', a: 'Totale Finale = (Subtotale - Sconto) + IVA. Il subtotale e la somma di tutti i totali riga (quantita x prezzo unitario). L\'IVA viene applicata al subtotale dopo la deduzione dello sconto.' },
      { q: 'Posso scegliere tra sconto percentuale e fisso?', a: 'Si. Usa il selettore accanto al campo sconto per scegliere tra sconto percentuale (applicato al subtotale) e sconto fisso sottratto direttamente dal subtotale.' },
      { q: 'Quali valute sono supportate?', a: 'Il calcolatore supporta USD (Dollaro USA), EUR (Euro), GBP (Sterlina Britannica) e JPY (Yen Giapponese).' },
      { q: 'I miei dati vengono memorizzati o inviati a un server?', a: 'No. Tutti i calcoli avvengono interamente nel tuo browser. Nulla viene memorizzato su un server ne trasmesso via internet.' },
      { q: 'Posso stampare il riepilogo della fattura?', a: 'Si. Clicca il pulsante Stampa per aprire la finestra di stampa del browser. Puoi stampare su carta o salvare come PDF selezionando "Salva come PDF".' },
    ],
  },
  es: {
    title: 'Como Calcular Totales de Facturas de Forma Rapida y Precisa',
    paragraphs: [
      'Calcular los totales de las facturas a mano es tedioso y propenso a errores. Ya seas un autonomo, propietario de un pequeno negocio o simplemente alguien que divide costes para una compra grupal, tener una calculadora de facturas fiable ahorra tiempo y previene errores costosos. Nuestra Calculadora de Facturas gratuita te permite agregar multiples lineas con descripciones, cantidades y precios unitarios, calculando al instante totales de linea, subtotal, impuestos, descuentos y total general.',
      'La herramienta soporta cuatro divisas principales (USD, EUR, GBP, JPY) para que trabajes en la moneda que tu cliente espera. Puedes aplicar una tasa impositiva en porcentaje y agregar un descuento como porcentaje o como importe fijo. Cada valor se actualiza en tiempo real mientras escribes.',
      'Una vez completado el calculo, copia el resumen completo al portapapeles con un clic o usa el boton de impresion para generar una version imprimible. Sin registro, sin procesamiento en servidor y ningun dato sale de tu navegador.',
    ],
    faq: [
      { q: 'Como se calcula el total general?', a: 'Total General = (Subtotal - Descuento) + Impuesto. El subtotal es la suma de todos los totales de linea (cantidad x precio unitario). El impuesto se aplica al subtotal despues de deducir el descuento.' },
      { q: 'Puedo elegir entre descuento porcentual y fijo?', a: 'Si. Usa el selector junto al campo de descuento para elegir entre descuento porcentual (aplicado al subtotal) y descuento fijo restado directamente del subtotal.' },
      { q: 'Que divisas se soportan?', a: 'La calculadora soporta USD (Dolar Estadounidense), EUR (Euro), GBP (Libra Esterlina) y JPY (Yen Japones).' },
      { q: 'Se almacenan o envian mis datos a un servidor?', a: 'No. Todos los calculos se realizan completamente en tu navegador. Nada se almacena en un servidor ni se transmite por internet.' },
      { q: 'Puedo imprimir el resumen de la factura?', a: 'Si. Haz clic en el boton Imprimir para abrir el dialogo de impresion del navegador. Puedes imprimir en papel o guardar como PDF.' },
    ],
  },
  fr: {
    title: 'Comment Calculer les Totaux de Factures Rapidement et Precisement',
    paragraphs: [
      'Calculer les totaux de factures manuellement est fastidieux et sujet aux erreurs. Que vous soyez freelance, proprietaire de petite entreprise ou que vous partagiez simplement les couts d\'un achat groupé, disposer d\'un calculateur de factures fiable fait gagner du temps et previent les erreurs couteuses. Notre Calculateur de Factures gratuit vous permet d\'ajouter plusieurs lignes avec descriptions, quantites et prix unitaires, puis calcule instantanement les totaux de ligne, le sous-total, les taxes, les remises et le total general.',
      'L\'outil supporte quatre devises principales (USD, EUR, GBP, JPY) pour travailler dans la devise attendue par votre client. Vous pouvez appliquer un taux de taxe en pourcentage et ajouter une remise en pourcentage ou en montant fixe. Chaque valeur se met a jour en temps reel.',
      'Une fois le calcul termine, copiez le resume complet dans le presse-papiers en un clic ou utilisez le bouton d\'impression pour generer une version imprimable. Aucune inscription, aucun traitement serveur, et aucune donnee ne quitte votre navigateur.',
    ],
    faq: [
      { q: 'Comment le total general est-il calcule?', a: 'Total General = (Sous-total - Remise) + Taxe. Le sous-total est la somme de tous les totaux de ligne (quantite x prix unitaire). La taxe est appliquee au sous-total apres deduction de la remise.' },
      { q: 'Puis-je choisir entre remise en pourcentage et remise fixe?', a: 'Oui. Utilisez le selecteur a cote du champ remise pour choisir entre remise en pourcentage (appliquee au sous-total) et remise fixe soustraite directement du sous-total.' },
      { q: 'Quelles devises sont supportees?', a: 'Le calculateur supporte USD (Dollar Americain), EUR (Euro), GBP (Livre Sterling) et JPY (Yen Japonais).' },
      { q: 'Mes donnees sont-elles stockees ou envoyees a un serveur?', a: 'Non. Tous les calculs se font entierement dans votre navigateur. Rien n\'est stocke sur un serveur ni transmis par internet.' },
      { q: 'Puis-je imprimer le resume de la facture?', a: 'Oui. Cliquez sur le bouton Imprimer pour ouvrir la boite de dialogue d\'impression de votre navigateur. Vous pouvez imprimer sur papier ou enregistrer en PDF.' },
    ],
  },
  de: {
    title: 'Wie man Rechnungssummen schnell und genau berechnet',
    paragraphs: [
      'Die manuelle Berechnung von Rechnungssummen ist muehsam und fehleranfaellig. Ob Sie Freiberufler, Kleinunternehmer oder einfach jemand sind, der Kosten fuer einen Gruppenkauf aufteilt — ein zuverlaessiger Rechnungsrechner spart Zeit und verhindert kostspielige Fehler. Unser kostenloser Rechnungsrechner ermoeglicht es Ihnen, mehrere Positionen mit Beschreibungen, Mengen und Einzelpreisen hinzuzufuegen und berechnet sofort Zeilensummen, Zwischensumme, Steuer, Rabatte und Gesamtbetrag.',
      'Das Tool unterstuetzt vier Hauptwaehrungen (USD, EUR, GBP, JPY), damit Sie in der Waehrung arbeiten koennen, die Ihr Kunde erwartet. Sie koennen einen Steuersatz in Prozent anwenden und einen Rabatt entweder als Prozentsatz oder als festen Betrag hinzufuegen. Jeder Wert aktualisiert sich in Echtzeit.',
      'Sobald die Berechnung abgeschlossen ist, kopieren Sie die vollstaendige Zusammenfassung mit einem Klick in die Zwischenablage oder nutzen Sie die Druckfunktion. Keine Registrierung, keine serverseitige Verarbeitung und keine Daten verlassen Ihren Browser.',
    ],
    faq: [
      { q: 'Wie wird der Gesamtbetrag berechnet?', a: 'Gesamtbetrag = (Zwischensumme - Rabatt) + Steuer. Die Zwischensumme ist die Summe aller Zeilensummen (Menge x Einzelpreis). Die Steuer wird auf die Zwischensumme nach Abzug des Rabatts berechnet.' },
      { q: 'Kann ich zwischen prozentualen und festen Rabatten waehlen?', a: 'Ja. Verwenden Sie den Schalter neben dem Rabattfeld, um zwischen prozentualem Rabatt (auf die Zwischensumme angewendet) und festem Rabatt (direkt von der Zwischensumme abgezogen) zu waehlen.' },
      { q: 'Welche Waehrungen werden unterstuetzt?', a: 'Der Rechner unterstuetzt USD (US-Dollar), EUR (Euro), GBP (Britisches Pfund) und JPY (Japanischer Yen).' },
      { q: 'Werden meine Daten gespeichert oder an einen Server gesendet?', a: 'Nein. Alle Berechnungen finden vollstaendig in Ihrem Browser statt. Nichts wird auf einem Server gespeichert oder ueber das Internet uebertragen.' },
      { q: 'Kann ich die Rechnungszusammenfassung drucken?', a: 'Ja. Klicken Sie auf die Schaltflaeche Drucken, um den Druckdialog Ihres Browsers zu oeffnen. Sie koennen auf Papier drucken oder als PDF speichern.' },
    ],
  },
  pt: {
    title: 'Como Calcular Totais de Faturas de Forma Rapida e Precisa',
    paragraphs: [
      'Calcular os totais das faturas manualmente e tedioso e propenso a erros. Quer seja freelancer, proprietario de um pequeno negocio ou simplesmente alguem que divide custos para uma compra em grupo, ter uma calculadora de faturas fiavel poupa tempo e previne erros dispendiosos. A nossa Calculadora de Faturas gratuita permite-lhe adicionar multiplas linhas com descricoes, quantidades e precos unitarios, calculando instantaneamente totais de linha, subtotal, impostos, descontos e total geral.',
      'A ferramenta suporta quatro moedas principais (USD, EUR, GBP, JPY) para trabalhar na moeda que o seu cliente espera. Pode aplicar uma taxa de imposto em percentagem e adicionar um desconto como percentagem ou como valor fixo. Cada valor atualiza-se em tempo real enquanto escreve.',
      'Assim que o calculo estiver completo, copie o resumo completo para a area de transferencia com um clique ou use o botao de impressao para gerar uma versao imprimivel. Sem registo, sem processamento no servidor e nenhum dado sai do seu navegador.',
    ],
    faq: [
      { q: 'Como e calculado o total geral?', a: 'Total Geral = (Subtotal - Desconto) + Imposto. O subtotal e a soma de todos os totais de linha (quantidade x preco unitario). O imposto e aplicado ao subtotal apos a deducao do desconto.' },
      { q: 'Posso escolher entre desconto percentual e fixo?', a: 'Sim. Use o seletor junto ao campo de desconto para escolher entre desconto percentual (aplicado ao subtotal) e desconto fixo subtraido diretamente do subtotal.' },
      { q: 'Que moedas sao suportadas?', a: 'A calculadora suporta USD (Dolar Americano), EUR (Euro), GBP (Libra Esterlina) e JPY (Iene Japones).' },
      { q: 'Os meus dados sao armazenados ou enviados para um servidor?', a: 'Nao. Todos os calculos acontecem inteiramente no seu navegador. Nada e armazenado num servidor nem transmitido pela internet.' },
      { q: 'Posso imprimir o resumo da fatura?', a: 'Sim. Clique no botao Imprimir para abrir o dialogo de impressao do navegador. Pode imprimir em papel ou guardar como PDF.' },
    ],
  },
};

export default function InvoiceCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['invoice-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [currency, setCurrency] = useState<Currency>('USD');
  const [items, setItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [copied, setCopied] = useState(false);

  const sym = currencySymbols[currency];
  const decimals = currency === 'JPY' ? 0 : 2;

  const fmt = (n: number) => n.toFixed(decimals);

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountAmount = discountType === 'percent'
    ? subtotal * (discountValue / 100)
    : discountValue;
  const afterDiscount = Math.max(subtotal - discountAmount, 0);
  const taxAmount = afterDiscount * (taxRate / 100);
  const grandTotal = afterDiscount + taxAmount;

  const copySummary = async () => {
    const lines = [
      `--- Invoice Summary (${currency}) ---`,
      '',
      ...items
        .filter((item) => item.description.trim())
        .map((item) => `${item.description}  ${item.quantity} x ${sym}${fmt(item.unitPrice)} = ${sym}${fmt(item.quantity * item.unitPrice)}`),
      '',
      `${t('subtotal')}: ${sym}${fmt(subtotal)}`,
      ...(discountValue > 0
        ? [`${t('discount')}: -${sym}${fmt(discountAmount)} ${discountType === 'percent' ? `(${discountValue}%)` : `(${t('discountFixed')})`}`]
        : []),
      ...(taxRate > 0 ? [`${t('taxAmount')} (${taxRate}%): ${sym}${fmt(taxAmount)}`] : []),
      `${t('grandTotal')}: ${sym}${fmt(grandTotal)}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handlePrint = () => window.print();

  const resetAll = () => {
    setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
    setTaxRate(0);
    setDiscountValue(0);
    setDiscountType('percent');
    setCopied(false);
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="invoice-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Live Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 print:hidden">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">{t('subtotal')}</div>
            <div className="text-2xl font-bold text-blue-800 mt-1">{sym}{fmt(subtotal)}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <div className="text-xs font-medium text-amber-600 uppercase tracking-wide">{t('discount')}</div>
            <div className="text-2xl font-bold text-amber-800 mt-1">-{sym}{fmt(discountAmount)}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-xs font-medium text-green-600 uppercase tracking-wide">{t('grandTotal')}</div>
            <div className="text-2xl font-bold text-green-800 mt-1">{sym}{fmt(grandTotal)}</div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
          {/* Currency Selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">{t('currency')}</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {(Object.keys(currencySymbols) as Currency[]).map((c) => (
                <option key={c} value={c}>{c} ({currencySymbols[c]})</option>
              ))}
            </select>
          </div>

          {/* Line Items Table */}
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-700">{t('description')}</th>
                  <th className="text-right py-2 font-medium text-gray-700 w-20">{t('quantity')}</th>
                  <th className="text-right py-2 font-medium text-gray-700 w-28">{t('unitPrice')}</th>
                  <th className="text-right py-2 font-medium text-gray-700 w-28">{t('lineTotal')}</th>
                  <th className="w-10 print:hidden"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(i, 'description', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="py-2 text-right font-medium">{sym}{fmt(item.quantity * item.unitPrice)}</td>
                    <td className="py-2 text-center print:hidden">
                      {items.length > 1 && (
                        <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 transition-colors text-xs">X</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addItem} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors print:hidden">
              {t('addItem')}
            </button>
          </div>

          {/* Tax & Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('taxRate')}</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('discount')}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="percent">{t('discountPercent')}</option>
                  <option value="fixed">{t('discountFixed')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('subtotal')}</span>
                <span>{sym}{fmt(subtotal)}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between text-sm text-amber-700">
                  <span>{t('discount')} {discountType === 'percent' ? `(${discountValue}%)` : `(${t('discountFixed')})`}</span>
                  <span>-{sym}{fmt(discountAmount)}</span>
                </div>
              )}
              {taxRate > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t('taxAmount')} ({taxRate}%)</span>
                  <span>{sym}{fmt(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                <span>{t('grandTotal')}</span>
                <span>{sym}{fmt(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-3 gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            {t('print')}
          </button>
          <button
            onClick={copySummary}
            className={`py-3 rounded-lg font-medium transition-colors text-sm ${copied ? 'bg-green-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-700'}`}
          >
            {copied ? t('copied') : t('copy')}
          </button>
          <button
            onClick={resetAll}
            className="bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
          >
            {t('reset')}
          </button>
        </div>

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>)}
        </article>

        {/* FAQ Accordion */}
        <section className="mt-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQ</h2>
          <div className="space-y-2">
            {seo.faq.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-4 py-3 font-medium text-gray-900 flex justify-between items-center">
                  {item.q}
                  <span className="text-gray-400">{openFaq === i ? '\u2212' : '+'}</span>
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
