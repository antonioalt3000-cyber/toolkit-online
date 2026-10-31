// Esegue UN solo (regex, input) e stampa il tempo. Il padre lo uccide a tempo.
const which = process.argv[2], caseName = process.argv[3];
const FILLER = `(?:\s+(?:due|amount|payable|net|gross|incl\.?|including|inc)\b|\s*\d+(?:[.,]\d+)?\s*%)*`;
const lb = `\btotal\b`;
const REGEXES = {
  // --- PREESISTENTI (prima del mio intervento)
  old_us0: new RegExp(`${lb}${FILLER}\s*:?\s*[$€£¥]?\s*([\d,]+\.\d{1,2})`, 'i'),
  old_us1: new RegExp(`${lb}${FILLER}\s*:?\s*[$€£¥]\s*([\d,]+)(?![.,]\d)`, 'i'),
  old_us3: new RegExp(`${lb}${FILLER}\s*:?\s*([\d,]+\.\d{1,2})\s*[$€£¥]`, 'i'),
  old_eu0: new RegExp(`${lb}${FILLER}\s*:?\s*[$€£¥]?\s*(\d{1,3}(?:\.\d{3})*,\d{1,2})\s*(?:EUR|€|CHF)?`, 'i'),
  // --- MIEI (aggiunti oggi)
  new_line:  new RegExp(`^[^\S\r\n]*${lb}`, 'i'),
  new_us:    /([\d,]+\.\d{1,2})(?:[^\S\r\n]*(?:[$€£¥]|[A-Z]{3}))?[^\S\r\n]*[.)\]]?[^\S\r\n]*$/,
  new_eu:    /(\d{1,3}(?:\.\d{3})*,\d{1,2})(?:[^\S\r\n]*(?:[$€£¥]|[A-Z]{3}))?[^\S\r\n]*[.)\]]?[^\S\r\n]*$/,
};
const CASES = {
  digits_commas: 'Total ' + '9,'.repeat(50000),
  spaces:        'Total ' + ' '.repeat(100000) + 'x',
  digits_dot:    'Total ' + '9'.repeat(100000) + '.00',
  leaders_mix:   'Total ' + '.'.repeat(50000) + ' ' + '1,'.repeat(20000) + '00.00 SEK',
};
const re = REGEXES[which], txt = CASES[caseName];
const t0 = Date.now();
txt.match(re);
console.log(JSON.stringify({ regex: which, case: caseName, ms: Date.now() - t0, len: txt.length }));
