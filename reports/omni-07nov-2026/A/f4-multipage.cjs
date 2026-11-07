// F4: does a TWO-PAGE invoice (rows on both pages, a repeated table header and a "Page n of 2" footer, totals on page 2)
// come back as ONE invoice with all the rows? The site says "Line items spanning multiple pages are merged into a single array".
// usage: node f4-multipage.cjs   (production, paid account key from journey-deep)
'use strict';
const fs = require('fs');
const path = require('path');
const { check, save, EVID, INFRA } = require('./lib.cjs');
const O = require(path.join(INFRA, 'oracles.cjs'));
const S = 'f4mp';
const KEY = fs.readFileSync(path.join(EVID, 'f4', 'apikey.txt'), 'utf8').trim();
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

function pdf2(pages, out) {
  const stream = (lines) => {
    let y = 800;
    return ['BT', '/F1 11 Tf']
      .concat(
        lines.map((l) => {
          const o = `1 0 0 1 50 ${y} Tm (${esc(l)}) Tj`;
          y -= 18;
          return o;
        })
      )
      .concat(['ET'])
      .join('\n');
  };
  const c1 = stream(pages[0]),
    c2 = stream(pages[1]);
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 5 0 R >> >> /Contents 7 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    `<< /Length ${Buffer.byteLength(c1, 'latin1')} >>\nstream\n${c1}\nendstream`,
    `<< /Length ${Buffer.byteLength(c2, 'latin1')} >>\nstream\n${c2}\nendstream`,
  ];
  let o = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
  const offs = [];
  objs.forEach((b, i) => {
    offs.push(Buffer.byteLength(o, 'latin1'));
    o += `${i + 1} 0 obj\n${b}\nendobj\n`;
  });
  const x = Buffer.byteLength(o, 'latin1');
  o +=
    `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` +
    offs.map((v) => `${String(v).padStart(10, '0')} 00000 n \n`).join('');
  o += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF\n`;
  fs.writeFileSync(out, Buffer.from(o, 'latin1'));
}

(async () => {
  const items = [
    ['Consulting day', 2, 480],
    ['Workshop', 1, 1250],
    ['Licence', 3, 99.9],
    ['Support block', 4, 150],
    ['Travel', 1, 312.4],
    ['Hosting', 12, 24.5],
  ];
  const r2 = O.round2;
  const row = (it) =>
    `${it[0].padEnd(22)} ${String(it[1]).padStart(3)}    ${it[2].toFixed(2).padStart(10)}    ${r2(
      it[1] * it[2]
    )
      .toFixed(2)
      .padStart(10)}`;
  const head = 'Description            Qty    Unit Price    Amount';
  const subtotal = r2(items.reduce((s, it) => s + r2(it[1] * it[2]), 0));
  const tax = r2(subtotal * 0.21);
  const total = r2(subtotal + tax);
  const p1 = [
    'Studio Multi SL',
    'VAT ID: ESB11111111',
    '',
    'INVOICE',
    'Invoice Number: MP-2026-0001',
    'Invoice Date: 2026-10-30',
    '',
    'Bill To: Buyer Two SL',
    '',
    head,
    ...items.slice(0, 3).map(row),
    '',
    'Page 1 of 2',
  ];
  const p2 = [
    'Studio Multi SL - Invoice MP-2026-0001',
    head,
    ...items.slice(3).map(row),
    '',
    `Subtotal: EUR ${subtotal.toFixed(2)}`,
    `VAT (21%): EUR ${tax.toFixed(2)}`,
    `Total: EUR ${total.toFixed(2)}`,
    '',
    'Page 2 of 2',
  ];
  const file = path.join(EVID, 'f4', 'matrix', 'multipage.pdf');
  pdf2([p1, p2], file);
  console.log('pdf info', JSON.stringify(O.pdfInfo(fs.readFileSync(file))));
  const fd = new FormData();
  fd.append(
    'file',
    new Blob([fs.readFileSync(file)], { type: 'application/pdf' }),
    'multipage.pdf'
  );
  fd.append('document_type', 'invoice');
  const res = await fetch('https://parseflow.dev/api/v1/extract', {
    method: 'POST',
    headers: { 'x-api-key': KEY },
    body: fd,
  });
  const j = await res.json().catch(() => ({}));
  const d = j.data || j.fields || j.extracted || j;
  check(S, 'two-page invoice: 200', 200, res.status, JSON.stringify(j).slice(0, 120));
  const li = Array.isArray(d.lineItems) ? d.lineItems : [];
  check(
    S,
    'one invoice, all 6 rows from both pages in one array',
    items.map((it) => r2(it[1] * it[2])),
    li.map((x) => x.amount),
    `${li.length} rows`
  );
  check(
    S,
    'the repeated table header and the page footer are NOT rows',
    false,
    li.some((x) => /page|description|invoice/i.test(x.description))
  );
  check(
    S,
    'the rows add up to the subtotal and the totals are exact',
    [subtotal, tax, total],
    [d.subtotal, d.taxAmount, d.total]
  );
  const fails = save('f4/multipage.json');
  process.exitCode = fails ? 1 : 0;
})().catch((e) => {
  console.error('ERR', e);
  process.exitCode = 1;
});
