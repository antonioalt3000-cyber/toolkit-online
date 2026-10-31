const o = require('./oracles.cjs');
const { Journey } = require('./cdp-journey.cjs');
(async () => {
  const r = (a, b) => Math.round(o.contrastRatio(a, b) * 100) / 100;
  console.log('contrast #000/#fff', r('#000', '#fff'), 'want 21');
  console.log('contrast #767676/#fff', r('#767676', '#fff'), 'want 4.54');
  console.log('contrast #888/#1a1a1a', r('#888888', '#1a1a1a'), '(blog claims 2.9)');
  const pdf = o.makeInvoicePdf(
    {
      seller: 'Acme Ltd',
      sellerVat: 'ES12345678A',
      number: 'QA-0001',
      date: '2026-10-26',
      due: '2026-11-25',
      buyer: 'Buyer SL',
      currency: 'EUR',
      vatRate: 21,
      items: [
        { desc: 'Widget', qty: 3, unit: 19.99 },
        { desc: 'Service', qty: 1, unit: 250 },
      ],
    },
    '../qa-26ott/selftest-invoice.pdf'
  );
  console.log(
    'invoice totals',
    pdf,
    'pdfInfo',
    o.pdfInfo(require('fs').readFileSync('../qa-26ott/selftest-invoice.pdf'))
  );
  console.log('emailDns gmail.com', await o.emailDns('gmail.com'));
  const j = await Journey.open('https://example.com/', { mobile: true });
  console.log(
    'h1:',
    await j.text('h1'),
    '| overflow:',
    JSON.stringify(await j.overflowX()),
    '| contrast h1:',
    JSON.stringify(await j.contrast('h1'))
  );
  await j.screenshot('../qa-26ott/selftest-example.png');
  console.log('report', JSON.stringify(j.report()));
  await j.close();
})().catch((e) => {
  console.error('SELFTEST ERROR', e);
  process.exitCode = 1;
});
