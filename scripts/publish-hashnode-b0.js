const https = require('https');
const KEY = '4df35ca0-83d0-48c0-88fc-6be573f848dd';
const PUB = '69c5558810e664c5daf05d9f';

const content = `Building a portfolio of free online tools is one of the best ways to generate organic traffic. Here's how we built ToolKit Online — 143+ tools generating traffic from Google.

## The Strategy

Instead of building one complex product, we built many simple tools. Each tool targets a specific long-tail keyword. Together, they create a traffic flywheel.

## Tool Categories

We cover 7 categories with 143+ tools:

### Finance (22 tools)
VAT calculator, loan calculator, salary calculator, mortgage calculator, currency converter, compound interest calculator, and more.

### Text (21 tools)
Word counter, lorem ipsum generator, text case converter, markdown preview, grammar checker, and more.

### Health (10 tools)
BMI calculator, calorie calculator, body fat calculator, sleep calculator, and more.

### Developer (22 tools)
JSON formatter, color picker, password generator, QR code generator, regex tester, and more.

### Math (18 tools)
Age calculator, random number generator, scientific calculator, and more.

### Conversion (14 tools)
Unit converter, base64, CSV to JSON, image to text, PDF merge, and more.

### Images (7 tools)
Image compressor, resizer, photo editor, meme generator, and more.

## The Technical Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Hosting**: Vercel (auto-deploy from GitHub)
- **Languages**: 6 (EN, IT, ES, FR, DE, PT) = 858+ pages

## SEO Strategy

Each tool page includes:
- **SEO article** (300-400 words per language)
- **FAQ accordion** (4-5 questions)
- **Internal links** to related tools
- **Structured data** (JSON-LD)
- **Hreflang** tags for all 6 languages

## Results

- 143 tools = 858+ pages
- Indexed in Google within 2 weeks
- Multiple tools ranking on page 1
- Zero marketing spend

## Try It

Visit [ToolKit Online](https://toolkitonline.vip) — all tools are free, no signup required.

For developers building similar tool suites, [CaptureAPI](https://captureapi.dev) can generate screenshots and PDFs of your tools programmatically.

---
*What type of free tool would you build? Share below.*`;

const m = JSON.stringify({
  query: 'mutation PublishPost($input: PublishPostInput!) { publishPost(input: $input) { post { id title url } } }',
  variables: { input: { title: 'How We Built 143 Free Online Tools with Next.js and Tailwind', subtitle: 'A portfolio of micro-tools for SEO traffic generation', publicationId: PUB, contentMarkdown: content, tags: [{slug:'nextjs',name:'Next.js'},{slug:'seo',name:'SEO'},{slug:'webdev',name:'Web Dev'},{slug:'typescript',name:'TypeScript'},{slug:'tools',name:'Tools'}] } }
});

const req = https.request({hostname:'gql.hashnode.com',port:443,path:'/',method:'POST',headers:{'Content-Type':'application/json','Authorization':KEY,'Content-Length':Buffer.byteLength(m)}}, res => {
  let d=''; res.on('data',c=>d+=c); res.on('end',()=>{
    try { const r=JSON.parse(d); if(r.data&&r.data.publishPost){console.log('SUCCESS B0:', r.data.publishPost.post.url);}else{console.log('ERROR:', JSON.stringify(r));}} catch(e){console.log('PARSE:', d);}
  });
});
req.on('error',e=>console.log('ERR:',e.message));
req.write(m); req.end();
