const https = require('https');
const KEY = '4df35ca0-83d0-48c0-88fc-6be573f848dd';
const PUB = '69c5558810e664c5daf05d9f';

const content = `Every business processes PDFs. Invoices, contracts, receipts, compliance documents, bank statements. Extracting data from them is still painfully manual.

## The PDF Data Extraction Problem

PDFs were designed for printing, not data extraction. Copy-paste loses structure. Manual entry is slow. OCR tools produce garbled output. Custom parsers break when formats change.

## API-Based PDF Extraction

Modern PDF extraction APIs:
1. **Parse PDF structure** — tables, headers, key-value pairs
2. **Extract text with position** — knowing where each element is
3. **Output structured JSON** — clean, typed data

## Common Use Cases

### Invoice Processing
Extract: invoice number, date, vendor, line items, totals, tax amounts.

### Contract Analysis
Extract: parties, dates, key clauses, signatures, terms.

### Receipt Processing
Extract: merchant, date, items, payment method, total.

### Bank Statements
Extract: transactions, dates, amounts, balances.

## How DocuMint Works

[DocuMint](https://parseflow.dev) converts any PDF to structured JSON with one API call:

1. Upload your PDF
2. DocuMint parses the document
3. Get clean JSON back

No ML training. No templates. Works out of the box.

**Free tier**: 100 pages per month.

## When to Use PDF Extraction APIs

**Use an API when:**
- You process more than 10 PDFs per day
- You need consistent, structured output
- Manual entry creates bottlenecks
- You are building automated workflows

**Build your own when:**
- Single, never-changing format
- Very low volume (1-2 per week)

## Getting Started

Visit [parseflow.dev](https://parseflow.dev) to try the free tier. One API call, clean JSON output, 100 pages free per month.

For EU compliance scanning, check [CompliPilot](https://complipilot.dev).

---
*What types of PDFs does your team process most?*`;

const m = JSON.stringify({
  query: 'mutation PublishPost($input: PublishPostInput!) { publishPost(input: $input) { post { id title url } } }',
  variables: { input: { title: 'PDF to JSON: How to Extract Structured Data from Any PDF via API', subtitle: 'One API call converts invoices, contracts, and receipts to clean JSON', publicationId: PUB, contentMarkdown: content, tags: [{slug:'api',name:'API'},{slug:'pdf',name:'PDF'},{slug:'javascript',name:'JavaScript'},{slug:'automation',name:'Automation'},{slug:'data',name:'Data'}] } }
});

const req = https.request({hostname:'gql.hashnode.com',port:443,path:'/',method:'POST',headers:{'Content-Type':'application/json','Authorization':KEY,'Content-Length':Buffer.byteLength(m)}}, res => {
  let d=''; res.on('data',c=>d+=c); res.on('end',()=>{
    try { const r=JSON.parse(d); if(r.data&&r.data.publishPost){console.log('SUCCESS F4:', r.data.publishPost.post.url);}else{console.log('ERROR:', JSON.stringify(r));}} catch(e){console.log('PARSE:', d);}
  });
});
req.on('error',e=>console.log('ERR:',e.message));
req.write(m); req.end();
