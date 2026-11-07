// prints the text layer the product really sees for a matrix PDF (through the product's own lib/pdf-text.ts via tsx-less eval of the compiled path is not possible, so use pdf-parse the way pdf-text.ts does)
const fs = require('fs');
const pdfParse = require('C:/Users/ftass/business-fast4-documint/node_modules/pdf-parse/lib/pdf-parse.js');
const f = process.argv[2];
pdfParse(fs.readFileSync(f))
  .then((d) => console.log(JSON.stringify(d.text.split('\n').slice(0, 24), null, 1)))
  .catch((e) => console.log('ERR', e.message));
