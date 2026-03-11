'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

const labels: Record<string, Record<Locale, string>> = {
  from: { en: 'From', it: 'Da', es: 'De', fr: 'De', de: 'Von', pt: 'De' },
  to: { en: 'To', it: 'A', es: 'Para', fr: 'À', de: 'An', pt: 'Para' },
  invoiceNumber: { en: 'Invoice #', it: 'Fattura #', es: 'Factura #', fr: 'Facture #', de: 'Rechnung #', pt: 'Fatura #' },
  date: { en: 'Date', it: 'Data', es: 'Fecha', fr: 'Date', de: 'Datum', pt: 'Data' },
  description: { en: 'Description', it: 'Descrizione', es: 'Descripción', fr: 'Description', de: 'Beschreibung', pt: 'Descrição' },
  quantity: { en: 'Qty', it: 'Qtà', es: 'Cant.', fr: 'Qté', de: 'Menge', pt: 'Qtd' },
  price: { en: 'Price', it: 'Prezzo', es: 'Precio', fr: 'Prix', de: 'Preis', pt: 'Preço' },
  total: { en: 'Total', it: 'Totale', es: 'Total', fr: 'Total', de: 'Gesamt', pt: 'Total' },
  addItem: { en: 'Add Item', it: 'Aggiungi', es: 'Añadir', fr: 'Ajouter', de: 'Hinzufügen', pt: 'Adicionar' },
  removeItem: { en: 'Remove', it: 'Rimuovi', es: 'Eliminar', fr: 'Supprimer', de: 'Entfernen', pt: 'Remover' },
  print: { en: 'Print Invoice', it: 'Stampa Fattura', es: 'Imprimir Factura', fr: 'Imprimer Facture', de: 'Rechnung Drucken', pt: 'Imprimir Fatura' },
  subtotal: { en: 'Subtotal', it: 'Subtotale', es: 'Subtotal', fr: 'Sous-total', de: 'Zwischensumme', pt: 'Subtotal' },
  notes: { en: 'Notes', it: 'Note', es: 'Notas', fr: 'Notes', de: 'Notizen', pt: 'Notas' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'How to Create Professional Invoices Online for Free',
    paragraphs: [
      'Invoicing is a fundamental part of running any business, whether you are a freelancer, small business owner, or independent contractor. A well-structured invoice ensures timely payment, provides a clear record of transactions, and helps maintain professionalism with your clients. However, many professionals overpay for invoicing software when a simple, free tool can handle their needs perfectly.',
      'Our free invoice generator lets you create clean, professional invoices directly in your browser without signing up or installing any software. Fill in your business details, add your client information, list your products or services with quantities and prices, and the total is calculated automatically. You can add notes for payment terms or additional instructions, then print or save the invoice as a PDF using your browser\'s built-in print function.',
      'This tool is ideal for freelancers sending their first invoices, small businesses that need occasional invoicing without a subscription, and anyone who wants a quick and simple way to document a transaction. The invoice format follows standard business conventions, making it suitable for tax records and accounting purposes.',
    ],
    faq: [
      { q: 'What information should an invoice include?', a: 'A proper invoice should include: your business name and address, the client\'s name and address, a unique invoice number, the date, a detailed list of items or services with quantities and prices, the total amount due, and payment terms or instructions.' },
      { q: 'How do I save the invoice as a PDF?', a: 'Click the Print Invoice button, then in your browser\'s print dialog, select "Save as PDF" as the destination. This creates a PDF file you can email to your client or save for your records.' },
      { q: 'Is this invoice generator free to use?', a: 'Yes, completely free with no registration required. You can create unlimited invoices directly in your browser. Your data stays on your device and is not sent to any server.' },
      { q: 'Can I customize the invoice with my logo?', a: 'This basic invoice generator focuses on simplicity and quick use. For advanced features like logo upload, recurring invoices, or payment integration, consider dedicated invoicing software.' },
      { q: 'What is the difference between an invoice and a receipt?', a: 'An invoice is sent before payment to request money owed for goods or services. A receipt is issued after payment as proof that the transaction has been completed.' },
    ],
  },
  it: {
    title: 'Come Creare Fatture Professionali Online Gratuitamente',
    paragraphs: [
      'La fatturazione e una parte fondamentale della gestione di qualsiasi attivita, che tu sia un libero professionista, un piccolo imprenditore o un lavoratore autonomo. Una fattura ben strutturata garantisce pagamenti puntuali, fornisce una documentazione chiara delle transazioni e mantiene la professionalita con i clienti.',
      'Il nostro generatore di fatture gratuito ti permette di creare fatture pulite e professionali direttamente nel browser senza registrazione ne installazione di software. Compila i dati della tua attivita, aggiungi le informazioni del cliente, elenca prodotti o servizi con quantita e prezzi, e il totale viene calcolato automaticamente. Puoi aggiungere note per i termini di pagamento, poi stampare o salvare la fattura come PDF.',
      'Questo strumento e ideale per freelance che inviano le prime fatture, piccole attivita che necessitano di fatturazione occasionale senza abbonamento e chiunque desideri un modo rapido e semplice per documentare una transazione. Il formato della fattura segue le convenzioni commerciali standard.',
    ],
    faq: [
      { q: 'Quali informazioni deve contenere una fattura?', a: 'Una fattura corretta deve includere: ragione sociale e indirizzo del fornitore, dati del cliente, numero fattura univoco, data, elenco dettagliato di beni o servizi con quantita e prezzi, importo totale e termini di pagamento.' },
      { q: 'Come salvo la fattura in PDF?', a: 'Clicca su Stampa Fattura, poi nella finestra di stampa del browser seleziona "Salva come PDF" come destinazione. Questo crea un file PDF che puoi inviare via email al cliente.' },
      { q: 'Questo generatore di fatture e gratuito?', a: 'Si, completamente gratuito e senza registrazione. Puoi creare fatture illimitate direttamente nel browser. I tuoi dati restano sul tuo dispositivo e non vengono inviati a nessun server.' },
      { q: 'Posso personalizzare la fattura con il mio logo?', a: 'Questo generatore base si concentra sulla semplicita e sull\'uso rapido. Per funzionalita avanzate come upload del logo, fatture ricorrenti o integrazione dei pagamenti, considera software di fatturazione dedicati.' },
      { q: 'Qual e la differenza tra fattura e ricevuta?', a: 'La fattura viene inviata prima del pagamento per richiedere il denaro dovuto. La ricevuta viene emessa dopo il pagamento come prova che la transazione e stata completata.' },
    ],
  },
  es: {
    title: 'Como Crear Facturas Profesionales Online Gratis',
    paragraphs: [
      'La facturacion es una parte fundamental de gestionar cualquier negocio, ya seas autonomo, pequeno empresario o contratista independiente. Una factura bien estructurada garantiza pagos puntuales, proporciona un registro claro de las transacciones y mantiene la profesionalidad con tus clientes.',
      'Nuestro generador de facturas gratuito te permite crear facturas limpias y profesionales directamente en tu navegador sin registrarte ni instalar software. Rellena los datos de tu negocio, anade la informacion del cliente, lista tus productos o servicios con cantidades y precios, y el total se calcula automaticamente.',
      'Esta herramienta es ideal para autonomos que envian sus primeras facturas, pequenas empresas que necesitan facturacion ocasional sin suscripcion, y cualquiera que quiera una forma rapida de documentar una transaccion.',
    ],
    faq: [
      { q: 'Que informacion debe incluir una factura?', a: 'Una factura correcta debe incluir: nombre y direccion del negocio, datos del cliente, numero de factura unico, fecha, lista detallada de articulos o servicios con cantidades y precios, importe total y condiciones de pago.' },
      { q: 'Como guardo la factura en PDF?', a: 'Haz clic en Imprimir Factura, luego en el dialogo de impresion de tu navegador selecciona "Guardar como PDF". Esto crea un archivo PDF que puedes enviar por email.' },
      { q: 'Este generador de facturas es gratuito?', a: 'Si, completamente gratis y sin registro. Puedes crear facturas ilimitadas directamente en tu navegador.' },
      { q: 'Puedo personalizar la factura con mi logo?', a: 'Este generador basico se enfoca en la simplicidad. Para funciones avanzadas como subir logo o facturas recurrentes, considera software de facturacion dedicado.' },
      { q: 'Cual es la diferencia entre factura y recibo?', a: 'La factura se envia antes del pago para solicitar el dinero adeudado. El recibo se emite despues del pago como prueba de que la transaccion se ha completado.' },
    ],
  },
  fr: {
    title: 'Comment Creer des Factures Professionnelles en Ligne Gratuitement',
    paragraphs: [
      'La facturation est un element fondamental de la gestion de toute entreprise, que vous soyez travailleur independant, proprietaire de petite entreprise ou prestataire. Une facture bien structuree garantit des paiements ponctuels, fournit un enregistrement clair des transactions et maintient le professionnalisme avec vos clients.',
      'Notre generateur de factures gratuit vous permet de creer des factures propres et professionnelles directement dans votre navigateur sans inscription ni installation de logiciel. Remplissez vos coordonnees, ajoutez les informations du client, listez vos produits ou services avec quantites et prix, et le total est calcule automatiquement.',
      'Cet outil est ideal pour les freelances qui envoient leurs premieres factures, les petites entreprises qui ont besoin de facturation occasionnelle sans abonnement, et tous ceux qui veulent un moyen rapide de documenter une transaction.',
    ],
    faq: [
      { q: 'Quelles informations une facture doit-elle contenir?', a: 'Une facture correcte doit inclure: nom et adresse de l\'entreprise, coordonnees du client, numero de facture unique, date, liste detaillee des articles ou services avec quantites et prix, montant total et conditions de paiement.' },
      { q: 'Comment sauvegarder la facture en PDF?', a: 'Cliquez sur Imprimer Facture, puis dans la boite de dialogue d\'impression de votre navigateur, selectionnez "Enregistrer au format PDF".' },
      { q: 'Ce generateur de factures est-il gratuit?', a: 'Oui, entierement gratuit et sans inscription. Vous pouvez creer des factures illimitees directement dans votre navigateur.' },
      { q: 'Puis-je personnaliser la facture avec mon logo?', a: 'Ce generateur de base se concentre sur la simplicite. Pour des fonctionnalites avancees comme le logo ou les factures recurrentes, envisagez un logiciel de facturation dedie.' },
      { q: 'Quelle est la difference entre une facture et un recu?', a: 'Une facture est envoyee avant le paiement pour demander l\'argent du. Un recu est emis apres le paiement comme preuve que la transaction est completee.' },
    ],
  },
  de: {
    title: 'Wie erstellt man professionelle Rechnungen kostenlos online?',
    paragraphs: [
      'Rechnungsstellung ist ein grundlegender Teil der Fuehrung eines Unternehmens, ob Sie Freiberufler, Kleinunternehmer oder selbstaendiger Auftragnehmer sind. Eine gut strukturierte Rechnung gewaehrleistet puenktliche Zahlungen, bietet eine klare Aufzeichnung der Transaktionen und wahrt die Professionalitaet gegenueber Ihren Kunden.',
      'Unser kostenloser Rechnungsgenerator ermoeglicht es Ihnen, saubere, professionelle Rechnungen direkt in Ihrem Browser zu erstellen, ohne Registrierung oder Softwareinstallation. Fuellen Sie Ihre Geschaeftsdaten aus, fuegen Sie Kundeninformationen hinzu, listen Sie Produkte oder Dienstleistungen mit Mengen und Preisen auf, und die Gesamtsumme wird automatisch berechnet.',
      'Dieses Tool ist ideal fuer Freiberufler, die ihre ersten Rechnungen versenden, kleine Unternehmen, die gelegentlich Rechnungen ohne Abonnement benoetigen, und alle, die eine schnelle Moeglichkeit suchen, eine Transaktion zu dokumentieren.',
    ],
    faq: [
      { q: 'Welche Informationen sollte eine Rechnung enthalten?', a: 'Eine korrekte Rechnung sollte enthalten: Firmenname und Adresse, Kundendaten, eindeutige Rechnungsnummer, Datum, detaillierte Auflistung der Artikel oder Dienstleistungen mit Mengen und Preisen, Gesamtbetrag und Zahlungsbedingungen.' },
      { q: 'Wie speichere ich die Rechnung als PDF?', a: 'Klicken Sie auf Rechnung Drucken, waehlen Sie dann im Druckdialog Ihres Browsers "Als PDF speichern" als Ziel.' },
      { q: 'Ist dieser Rechnungsgenerator kostenlos?', a: 'Ja, voellig kostenlos und ohne Registrierung. Sie koennen unbegrenzt Rechnungen direkt im Browser erstellen.' },
      { q: 'Kann ich die Rechnung mit meinem Logo anpassen?', a: 'Dieser Basisgenerator konzentriert sich auf Einfachheit. Fuer erweiterte Funktionen wie Logo-Upload oder wiederkehrende Rechnungen empfehlen wir dedizierte Rechnungssoftware.' },
      { q: 'Was ist der Unterschied zwischen Rechnung und Quittung?', a: 'Eine Rechnung wird vor der Zahlung gesendet, um den geschuldeten Betrag anzufordern. Eine Quittung wird nach der Zahlung als Nachweis der abgeschlossenen Transaktion ausgestellt.' },
    ],
  },
  pt: {
    title: 'Como Criar Faturas Profissionais Online Gratuitamente',
    paragraphs: [
      'A faturacao e uma parte fundamental da gestao de qualquer negocio, quer seja trabalhador independente, pequeno empresario ou prestador de servicos. Uma fatura bem estruturada garante pagamentos atempados, fornece um registo claro das transacoes e mantem a profissionalidade com os seus clientes.',
      'O nosso gerador de faturas gratuito permite-lhe criar faturas limpas e profissionais diretamente no navegador sem registo nem instalacao de software. Preencha os dados do seu negocio, adicione as informacoes do cliente, liste os seus produtos ou servicos com quantidades e precos, e o total e calculado automaticamente.',
      'Esta ferramenta e ideal para freelancers que enviam as primeiras faturas, pequenas empresas que precisam de faturacao ocasional sem subscricao, e qualquer pessoa que deseje uma forma rapida de documentar uma transacao.',
    ],
    faq: [
      { q: 'Que informacoes deve conter uma fatura?', a: 'Uma fatura correta deve incluir: nome e endereco da empresa, dados do cliente, numero de fatura unico, data, lista detalhada de artigos ou servicos com quantidades e precos, valor total e condicoes de pagamento.' },
      { q: 'Como guardo a fatura em PDF?', a: 'Clique em Imprimir Fatura, depois no dialogo de impressao do seu navegador selecione "Guardar como PDF".' },
      { q: 'Este gerador de faturas e gratuito?', a: 'Sim, completamente gratuito e sem registo. Pode criar faturas ilimitadas diretamente no navegador.' },
      { q: 'Posso personalizar a fatura com o meu logotipo?', a: 'Este gerador basico foca-se na simplicidade. Para funcionalidades avancadas como upload de logotipo ou faturas recorrentes, considere software de faturacao dedicado.' },
      { q: 'Qual e a diferenca entre fatura e recibo?', a: 'A fatura e enviada antes do pagamento para solicitar o dinheiro devido. O recibo e emitido apos o pagamento como prova de que a transacao foi concluida.' },
    ],
  },
};

export default function InvoiceGenerator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['invoice-generator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [fromName, setFromName] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [toName, setToName] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [invoiceNum, setInvoiceNum] = useState('001');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, price: 0 },
  ]);

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { description: '', quantity: 1, price: 0 }]);
  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="invoice-generator">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div id="invoice-area" className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('from')}</label>
              <input type="text" value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder={t('from') + ' name'} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <textarea value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} placeholder="Address" rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('to')}</label>
              <input type="text" value={toName} onChange={(e) => setToName(e.target.value)} placeholder={t('to') + ' name'} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <textarea value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="Address" rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('invoiceNumber')}</label>
              <input type="text" value={invoiceNum} onChange={(e) => setInvoiceNum(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')}</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-700">{t('description')}</th>
                  <th className="text-right py-2 font-medium text-gray-700 w-20">{t('quantity')}</th>
                  <th className="text-right py-2 font-medium text-gray-700 w-28">{t('price')}</th>
                  <th className="text-right py-2 font-medium text-gray-700 w-28">{t('total')}</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 pr-2">
                      <input type="text" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </td>
                    <td className="py-2 pr-2">
                      <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded px-2 py-1 text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </td>
                    <td className="py-2 pr-2">
                      <input type="number" min="0" step="0.01" value={item.price} onChange={(e) => updateItem(i, 'price', parseFloat(e.target.value) || 0)} className="w-full border border-gray-300 rounded px-2 py-1 text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </td>
                    <td className="py-2 text-right font-medium">{(item.quantity * item.price).toFixed(2)}</td>
                    <td className="py-2 text-center">
                      {items.length > 1 && (
                        <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 text-xs">X</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addItem} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">+ {t('addItem')}</button>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                <span>{t('total')}</span>
                <span>{subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes')}</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors print:hidden"
        >
          {t('print')}
        </button>

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
