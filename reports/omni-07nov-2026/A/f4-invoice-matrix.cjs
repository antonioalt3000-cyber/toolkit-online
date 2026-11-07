// F4 ParseFlow extraction matrix against PRODUCTION (7 nov 2026), paid account from journey-deep.
// Synthetic invoices (PDF text layer) in 7 languages / number formats; the truth is computed here from the line items,
// never read from the product. usage: node f4-invoice-matrix.cjs
'use strict';
const fs = require('fs');
const path = require('path');
const { check, save, EVID, INFRA } = require('./lib.cjs');
const O = require(path.join(INFRA, 'oracles.cjs'));
const S = 'f4mx';
const DIR = path.join(EVID, 'f4', 'matrix');
fs.mkdirSync(DIR, { recursive: true });
const KEY = fs.readFileSync(path.join(EVID, 'f4', 'apikey.txt'), 'utf8').trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const r2 = O.round2;

// number formatters
const fmt = {
  eu: (x) =>
    x
      .toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.'), // 1.234,56
  us: (x) => x.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','), // 1,234.56
  fr: (x) =>
    x
      .toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' '), // 1 234,56
  plain: (x) => x.toFixed(2), // 1234.56
};
const neg = (f) => (x) => (x < 0 ? '-' + f(-x) : f(x));

const L = {
  it: {
    inv: 'FATTURA',
    num: 'Fattura n.',
    date: 'Data',
    sub: 'Imponibile',
    vat: 'IVA',
    tot: 'Totale documento',
    cur: 'EUR',
  },
  de: {
    inv: 'RECHNUNG',
    num: 'Rechnungsnummer',
    date: 'Datum',
    sub: 'Nettobetrag',
    vat: 'MwSt.',
    tot: 'Gesamtbetrag',
    cur: 'EUR',
  },
  fr: {
    inv: 'FACTURE',
    num: 'Facture n°',
    date: 'Date',
    sub: 'Total HT',
    vat: 'TVA',
    tot: 'Total TTC',
    cur: 'EUR',
  },
  es: {
    inv: 'FACTURA',
    num: 'Número de factura',
    date: 'Fecha',
    sub: 'Base imponible',
    vat: 'IVA',
    tot: 'Total',
    cur: 'EUR',
  },
  pt: {
    inv: 'FATURA',
    num: 'Fatura n.º',
    date: 'Data',
    sub: 'Valor sem IVA',
    vat: 'IVA',
    tot: 'Total a pagar',
    cur: 'EUR',
  },
  nl: {
    inv: 'FACTUUR',
    num: 'Factuurnummer',
    date: 'Datum',
    sub: 'Subtotaal',
    vat: 'BTW',
    tot: 'Totaal',
    cur: 'EUR',
  },
  pl: {
    inv: 'FAKTURA VAT',
    num: 'Faktura nr',
    date: 'Data wystawienia',
    sub: 'Razem netto',
    vat: 'VAT',
    tot: 'Do zaplaty',
    cur: 'PLN',
  },
  en: {
    inv: 'INVOICE',
    num: 'Invoice Number:',
    date: 'Invoice Date:',
    sub: 'Subtotal',
    vat: 'VAT',
    tot: 'Total',
    cur: 'USD',
  },
  cn: {
    inv: 'CREDIT NOTE',
    num: 'Credit Note Number:',
    date: 'Date:',
    sub: 'Subtotal',
    vat: 'VAT',
    tot: 'Total',
    cur: 'EUR',
  },
};

function build(c) {
  const f = neg(fmt[c.f]);
  const lab = L[c.l];
  const lines = c.items.map((it) => ({ ...it, amt: r2(it.qty * it.unit) }));
  const subtotal = r2(lines.reduce((s, x) => s + x.amt, 0));
  const tax = c.taxOverride !== undefined ? c.taxOverride : r2((subtotal * c.rate) / 100);
  const total = r2(subtotal + tax);
  const text = [
    c.seller,
    `VAT ID: ${c.vatId}`,
    '',
    lab.inv,
    `${lab.num} ${c.number}`,
    `${lab.date}: 2026-10-30`,
    '',
    `Bill To: ${c.buyer}`,
    '',
    'Description            Qty    Unit Price    Amount',
    ...lines.map(
      (x) =>
        `${x.desc.padEnd(22)} ${String(x.qty).padStart(3)}    ${f(x.unit).padStart(10)}    ${f(x.amt).padStart(10)}`
    ),
    '',
    `${lab.sub}: ${lab.cur} ${f(subtotal)}`,
    `${lab.vat} (${c.rate}%): ${lab.cur} ${f(tax)}`,
    `${lab.tot}: ${lab.cur} ${f(total)}`,
  ];
  const file = path.join(DIR, `${c.id}.pdf`);
  O.writeTextPdf(text, file);
  // rows with a zero amount are dropped by design (a row guard that refuses amount 0), so they are not expected back
  const rows = lines.map((x) => x.amt).filter((a) => a !== 0);
  return {
    file,
    truth: { number: c.number, subtotal, tax, total, rate: c.rate, cur: lab.cur, rows },
  };
}

const CASES = [
  {
    id: 'it-22',
    l: 'it',
    f: 'eu',
    rate: 22,
    number: 'IT-2026-0101',
    seller: 'Officina Rossi SRL',
    vatId: 'IT01234567890',
    buyer: 'Bar Centrale SNC',
    items: [
      { desc: 'Manutenzione impianto', qty: 4, unit: 1234.5 },
      { desc: 'Ricambi', qty: 2, unit: 99.99 },
    ],
  },
  {
    id: 'de-19',
    l: 'de',
    f: 'eu',
    rate: 19,
    number: 'RE-2026-5521',
    seller: 'Schmidt Werkzeugbau GmbH',
    vatId: 'DE123456789',
    buyer: 'Bauer Metall AG',
    items: [
      { desc: 'Frasteil Typ A', qty: 120, unit: 14.75 },
      { desc: 'Versand', qty: 1, unit: 89.9 },
    ],
  },
  {
    id: 'fr-20',
    l: 'fr',
    f: 'fr',
    rate: 20,
    number: 'FA-2026-3310',
    seller: 'Atelier Martin SARL',
    vatId: 'FR12345678901',
    buyer: 'Boulangerie Dupont',
    items: [
      { desc: 'Conseil strategique', qty: 8, unit: 150 },
      { desc: 'Deplacement', qty: 1, unit: 1234.56 },
    ],
  },
  {
    id: 'es-21',
    l: 'es',
    f: 'eu',
    rate: 21,
    number: 'ES-2026-0412',
    seller: 'Estudio Sol SL',
    vatId: 'ESB38123456',
    buyer: 'Ferreteria Norte SL',
    items: [
      { desc: 'Diseno grafico', qty: 3, unit: 1250 },
      { desc: 'Mantenimiento', qty: 1, unit: 899.9 },
    ],
  },
  {
    id: 'es-10',
    l: 'es',
    f: 'eu',
    rate: 10,
    number: 'ES-2026-0413',
    seller: 'Restaurante Mar SL',
    vatId: 'ESB38765432',
    buyer: 'Empresa Cliente SA',
    items: [{ desc: 'Catering evento', qty: 50, unit: 18.4 }],
  },
  {
    id: 'es-4',
    l: 'es',
    f: 'eu',
    rate: 4,
    number: 'ES-2026-0414',
    seller: 'Libreria Letras SL',
    vatId: 'ESB38999999',
    buyer: 'Colegio Publico',
    items: [{ desc: 'Libros de texto', qty: 30, unit: 22.35 }],
  },
  {
    id: 'pt-23',
    l: 'pt',
    f: 'eu',
    rate: 23,
    number: 'FT-2026-0077',
    seller: 'Oficina Silva Lda',
    vatId: 'PT501234567',
    buyer: 'Cafe Central Lda',
    items: [{ desc: 'Servico tecnico', qty: 6, unit: 75.5 }],
  },
  {
    id: 'nl-21',
    l: 'nl',
    f: 'eu',
    rate: 21,
    number: 'NL-2026-0909',
    seller: 'Jansen Bouw BV',
    vatId: 'NL123456789B01',
    buyer: 'De Vries Holding BV',
    items: [
      { desc: 'Verbouwing keuken', qty: 1, unit: 8450 },
      { desc: 'Materiaal', qty: 3, unit: 312.4 },
    ],
  },
  {
    id: 'pl-23',
    l: 'pl',
    f: 'eu',
    rate: 23,
    number: 'FV-2026-0155',
    seller: 'Kowalski Sp. z o.o.',
    vatId: 'PL1234567890',
    buyer: 'Nowak Handel Sp. z o.o.',
    items: [{ desc: 'Uslugi doradcze', qty: 10, unit: 320 }],
  },
  {
    id: 'us-0',
    l: 'en',
    f: 'us',
    rate: 0,
    number: 'PF-RC-0001',
    seller: 'Cross Border Ltd',
    vatId: 'GB123456789',
    buyer: 'Acme Corp',
    items: [{ desc: 'Reverse charge services', qty: 5, unit: 1999.99 }],
  },
  {
    id: 'half-cent',
    l: 'en',
    f: 'plain',
    rate: 10,
    number: 'PF-HC-0001',
    seller: 'Rounding Test Ltd',
    vatId: 'GB987654321',
    buyer: 'Edge Case Inc',
    items: [{ desc: 'Item', qty: 1, unit: 1.05 }],
    taxOverride: 0.11,
  },
  {
    id: 'zero-total',
    l: 'en',
    f: 'plain',
    rate: 21,
    number: 'PF-ZERO-0001',
    seller: 'Free Tier Ltd',
    vatId: 'GB555555555',
    buyer: 'Trial Customer',
    items: [{ desc: 'Complimentary service', qty: 1, unit: 0 }],
  },
  {
    id: 'credit-note',
    l: 'cn',
    f: 'plain',
    rate: 21,
    number: 'CN-2026-0007',
    seller: 'Refund Desk SL',
    vatId: 'ESB38000001',
    buyer: 'Buyer SL',
    items: [
      { desc: 'Returned goods', qty: 1, unit: -100 },
      { desc: 'Returned shipping', qty: 1, unit: -20 },
    ],
  },
];

async function extract(file, name, mime) {
  const fd = new FormData();
  fd.append('file', new Blob([fs.readFileSync(file)], { type: mime }), name);
  fd.append('document_type', 'invoice');
  const res = await fetch('https://parseflow.dev/api/v1/extract', {
    method: 'POST',
    headers: { 'x-api-key': KEY },
    body: fd,
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not json */
  }
  return { status: res.status, text, json };
}
const num = (x) =>
  typeof x === 'number'
    ? x
    : Number(
        String(x ?? '')
          .replace(/[^\d.,-]/g, '')
          .replace(',', '.')
      );
const near = (a, b, e = 0.011) => Number.isFinite(a) && Math.abs(a - b) <= e;

(async () => {
  const rows = [];
  for (const c of CASES) {
    const { file, truth } = build(c);
    await sleep(2500);
    const r = await extract(file, `${c.id}.pdf`, 'application/pdf');
    const ok200 = check(S, `${c.id}: extract answers 200`, 200, r.status, r.text.slice(0, 140));
    if (!ok200) {
      rows.push({ id: c.id, status: r.status });
      continue;
    }
    const d = (r.json && (r.json.data || r.json.fields || r.json.extracted)) || r.json || {};
    const got = {
      number: d.invoiceNumber,
      subtotal: num(d.subtotal),
      tax: num(d.taxAmount),
      total: num(d.total),
      rate: num(d.taxRate),
    };
    rows.push({ id: c.id, truth, got, raw: JSON.stringify(d).slice(0, 400) });
    check(
      S,
      `${c.id}: total ${truth.total}`,
      true,
      near(got.total, truth.total),
      `read ${got.total}`
    );
    check(
      S,
      `${c.id}: subtotal ${truth.subtotal}`,
      true,
      near(got.subtotal, truth.subtotal),
      `read ${got.subtotal}`
    );
    check(S, `${c.id}: tax ${truth.tax}`, true, near(got.tax, truth.tax), `read ${got.tax}`);
    check(
      S,
      `${c.id}: subtotal + tax = total in the extracted data`,
      true,
      near(r2(got.subtotal + got.tax), got.total),
      `${got.subtotal}+${got.tax} vs ${got.total}`
    );
    // the stated rate x the extracted subtotal must reproduce the extracted tax (half-cent tolerated)
    if (Number.isFinite(got.rate) && got.rate > 0)
      check(
        S,
        `${c.id}: tax = rate x subtotal (${got.rate}%)`,
        true,
        near(r2((got.subtotal * got.rate) / 100), got.tax, 0.0101),
        `rate ${got.rate}`
      );
    check(S, `${c.id}: invoice number ${truth.number}`, truth.number, d.invoiceNumber);
    // the ROWS: the same amounts we wrote, qty x unit = amount on each, and they add up to the subtotal
    const li = Array.isArray(d.lineItems) ? d.lineItems : [];
    check(
      S,
      `${c.id}: rows read = ${JSON.stringify(truth.rows)}`,
      truth.rows,
      li.map((x) => x.amount)
    );
    check(
      S,
      `${c.id}: every row qty x unit = amount`,
      true,
      li.length > 0
        ? li.every((x) => near(r2(x.quantity * x.unitPrice), x.amount))
        : truth.rows.length === 0
    );
    check(
      S,
      `${c.id}: the rows add up to the subtotal`,
      true,
      li.length > 0
        ? near(r2(li.reduce((s, x) => s + x.amount, 0)), got.subtotal)
        : truth.rows.length === 0
    );
  }
  // non-invoice and image inputs
  const rec = path.join(DIR, 'recipe.pdf');
  O.writeTextPdf(
    [
      'Grandma tomato soup',
      '',
      'Ingredients: 6 tomatoes, 1 onion, 2 cloves garlic',
      'Cook 25 minutes. Serves 4.',
      'Total time: 40 minutes',
    ],
    rec
  );
  await sleep(2500);
  const nr = await extract(rec, 'recipe.pdf', 'application/pdf');
  rows.push({ id: 'non-invoice', status: nr.status, raw: nr.text.slice(0, 300) });
  check(
    S,
    'non-invoice PDF (a recipe) is NOT presented as a 200 invoice with totals',
    true,
    nr.status !== 200 || !(nr.json && (nr.json.data || nr.json).total),
    `HTTP ${nr.status} ${nr.text.slice(0, 160)}`
  );
  const png = path.join(EVID, '..', '..', '..', 'scratchpad', 'qa-26ott', 'selftest-example.png');
  if (fs.existsSync(png)) {
    await sleep(2500);
    const pr = await extract(png, 'scan.png', 'image/png');
    check(S, 'PNG input -> 422', 422, pr.status, pr.text.slice(0, 120));
  }
  fs.writeFileSync(path.join(EVID, 'f4', 'matrix-rows.json'), JSON.stringify(rows, null, 2));
  const fails = save('f4/invoice-matrix.json');
  process.exitCode = fails ? 1 : 0;
})().catch((e) => {
  console.error('ERR', e);
  process.exitCode = 1;
});
