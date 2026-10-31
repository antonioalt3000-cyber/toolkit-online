const bad  = /([\d,]+\.\d{1,2})(?:[^\S\r\n]*(?:[$€£¥]|[A-Z]{3}))?[^\S\r\n]*[.)\]]?[^\S\r\n]*$/;
// candidato: stesso rigore dell'EU, che infatti NON si blocca
const good = /(\d{1,3}(?:,\d{3})*\.\d{1,2}|\d{1,12}\.\d{1,2})(?:[^\S\r\n]{0,8}(?:[$€£¥]|[A-Z]{3}))?[^\S\r\n]{0,8}[.)\]]?[^\S\r\n]{0,8}$/;
for (const n of [500, 1000, 2000, 4000, 8000]) {
  const s = 'Total ' + '9,'.repeat(n);
  let t0 = Date.now(); s.match(bad);  const mb = Date.now() - t0;
  t0 = Date.now();     s.match(good); const mg = Date.now() - t0;
  console.log(`n=${String(n).padStart(5)}  cattivo=${String(mb).padStart(6)} ms   corretto=${String(mg).padStart(4)} ms`);
}
// il candidato deve continuare a leggere i casi VERI
const veri = [
  ['Subtotal (excl. tax) .............. 18000.00 SEK', '18000.00'],
  ['VAT at the standard rate 25% ......  4500.00 SEK', '4500.00'],
  ['Total Due, payable on receipt: .... 22500.00 SEK', '22500.00'],
  ['Total ............ 220.00', '220.00'],
  ['Total: 1,234,567.89', '1,234,567.89'],
  ['Total  $1,440.00', '1,440.00'],
];
console.log('\ncasi reali col candidato:');
for (const [line, atteso] of veri) {
  const m = line.match(good);
  console.log(`  ${m && m[1] === atteso ? 'OK ' : '🔴 '} "${line.slice(0,46)}" -> ${m ? m[1] : 'NESSUN MATCH'} (atteso ${atteso})`);
}
