'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

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

  return (
    <div className="max-w-3xl mx-auto">
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
    </div>
  );
}
