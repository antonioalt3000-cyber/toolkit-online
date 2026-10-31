const { O, EVID } = require('./helpers.cjs');
const path = require('path');
const fs = require('fs');
const dir = path.join(EVID, 'f4');
fs.mkdirSync(dir, { recursive: true });
// Invoice A: US number format, built by the shared generator (totals computed independently)
const a = O.makeInvoicePdf(
  {
    seller: 'Northwind Analytics LLC',
    sellerVat: 'US-EIN 12-3456789',
    number: 'PF-QA-7731',
    date: '2026-10-14',
    due: '2026-11-13',
    buyer: 'Contoso Retail Inc.',
    currency: 'USD',
    vatRate: 21,
    items: [
      { desc: 'Consulting hours', qty: 12, unit: 85.5 },
      { desc: 'Hosting plan', qty: 1, unit: 49.99 },
      { desc: 'SSL certificate', qty: 2, unit: 12.75 },
    ],
  },
  path.join(dir, 'invoice-a-us.pdf')
);
// Invoice B: EU number format (1.234,56), Spanish labels
const items = [
  { d: 'Diseño web corporativo', q: 3, u: 1250.0 },
  { d: 'Mantenimiento anual', q: 1, u: 899.9 },
];
const sub = O.round2(items.reduce((s, i) => s + O.round2(i.q * i.u), 0));
const tax = O.round2(sub * 0.21);
const tot = O.round2(sub + tax);
const eu = (x) =>
  x
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
O.writeTextPdf(
  [
    'Estudio Creativo Tenerife S.L.',
    'CIF: B38123456',
    '',
    'FACTURA',
    'Número de factura: ES-2026-0315',
    'Fecha: 21/10/2026',
    'Vencimiento: 20/11/2026',
    '',
    'Cliente: Ferretería Las Américas S.L.',
    '',
    'Concepto                    Cant.    Precio      Importe',
    ...items.map(
      (i) =>
        `${i.d.padEnd(27)} ${String(i.q).padStart(3)}    ${eu(i.u).padStart(9)} EUR   ${eu(O.round2(i.q * i.u)).padStart(9)} EUR`
    ),
    '',
    `Base imponible: ${eu(sub)} EUR`,
    `IVA (21%): ${eu(tax)} EUR`,
    `Total: ${eu(tot)} EUR`,
  ],
  path.join(dir, 'invoice-b-eu.pdf')
);
const oracle = {
  a: {
    invoiceNumber: 'PF-QA-7731',
    subtotal: a.subtotal,
    taxAmount: a.tax,
    total: a.total,
    taxRate: 21,
    currency: 'USD',
  },
  b: {
    invoiceNumber: 'ES-2026-0315',
    subtotal: sub,
    taxAmount: tax,
    total: tot,
    taxRate: 21,
    currency: 'EUR',
  },
  fixture: { invoiceNumber: 'INV-2026-0042', total: 5201.79 },
};
fs.writeFileSync(path.join(dir, 'invoice-oracle.json'), JSON.stringify(oracle, null, 2));
console.log(JSON.stringify(oracle));
