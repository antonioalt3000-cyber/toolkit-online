const https = require('https');

const HASHNODE_API_KEY = '4df35ca0-83d0-48c0-88fc-6be573f848dd';
const PUBLICATION_ID = '69c5558810e664c5daf05d9f';

const articleContent = `Manually capturing screenshots of web pages is one of those tasks that seems simple until you need to do it at scale. Whether you're building a website monitoring tool, generating PDF reports, creating visual regression tests, or automating QA workflows, you quickly discover that headless browsers are complex, resource-intensive, and painful to maintain.

This guide walks through the practical use cases for a screenshot API, how they work under the hood, and when it makes sense to use one versus rolling your own solution.

## What Is a Screenshot API?

A screenshot API is a hosted service that accepts a URL (and optional configuration), renders the page using a headless browser, and returns a screenshot image — typically PNG or JPEG — via HTTP. The rendering, browser management, caching, and scaling are handled server-side.

Instead of this in your backend:

\`\`\`javascript
const puppeteer = require('puppeteer');
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://example.com');
const screenshot = await page.screenshot({ fullPage: true });
await browser.close();
\`\`\`

You make a single API call:

\`\`\`javascript
const response = await fetch('https://captureapi.dev/v1/screenshot?url=https://example.com&fullPage=true', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});
const buffer = await response.arrayBuffer();
\`\`\`

The difference in operational complexity is significant.

## Why Not Just Run Puppeteer Yourself?

Running headless Chromium in production comes with real costs:

**Memory**: A single Chromium instance uses 200-400MB RAM. Under load, this compounds fast.

**Cold starts**: Spinning up a browser takes 2-4 seconds. For serverless functions, this is a frequent problem.

**Maintenance**: Browser versions change. Sites break. Flags need updating. You're now maintaining browser infrastructure.

**Concurrency**: Handling multiple parallel screenshot requests requires a process pool with careful lifecycle management.

For occasional internal tooling, running Puppeteer yourself is fine. For anything customer-facing or at scale, a dedicated API makes more sense.

## Common Use Cases

### 1. Website Monitoring and Thumbnails

If you're building a tool that tracks competitors, monitors website uptime, or stores visual snapshots over time, a screenshot API lets you generate thumbnails on demand without infrastructure headaches.

A simple monitoring script might capture daily screenshots of key pages and compare them visually, alerting you when layouts change unexpectedly.

### 2. PDF Report Generation

Many SaaS applications need to generate PDF reports from dashboards. A screenshot API can capture a rendered chart or data-heavy page, which you then embed in a PDF with a library like PDFKit or pdfmake.

This approach avoids the complexity of server-side chart rendering or HTML-to-PDF conversion libraries, which often struggle with modern CSS.

### 3. Visual Regression Testing

Before deploying UI changes, screenshot comparisons can catch unintended visual regressions. Capture the current production state, deploy the change, capture again, and diff the images pixel-by-pixel.

Tools like [AccessiScan](https://fixmyweb.dev) can complement this workflow by also running automated accessibility audits on the captured pages, catching both visual and functional regressions in one pass.

### 4. Social Media Preview Generation

When users share links to your app, you want rich Open Graph preview images. Rather than generating these statically, a screenshot API lets you dynamically render a template URL with the user's data and capture it as the OG image.

### 5. Invoice and Document Archiving

Many businesses need to archive web-based documents (invoices, receipts, order confirmations) as images or PDFs for compliance. A screenshot API makes this straightforward: just pass the URL of the rendered document.

## Key Parameters to Look For

Not all screenshot APIs expose the same options. When evaluating one, check for:

- **fullPage**: Captures the entire scrollable page, not just the viewport.
- **viewport**: Control width and height of the virtual browser window. Essential for mobile vs. desktop screenshots.
- **delay**: Wait N milliseconds after page load before capturing. Useful for pages with animations or lazy-loaded content.
- **waitForSelector**: Wait until a specific CSS selector is present before capturing. More reliable than fixed delays.
- **format**: PNG for lossless quality, JPEG for smaller file sizes, WebP for modern web delivery.
- **clip**: Capture only a specific element or region rather than the full page.
- **blockAds**: Block common ad networks to get cleaner screenshots.
- **cookies**: Pass authentication cookies to screenshot pages behind login walls.

## Authentication Patterns

Screenshot APIs typically offer two auth patterns:

**API Key in header** (recommended): Authorization: Bearer sk-xxx. Keeps credentials out of URLs.

**API Key as query param**: ?api_key=xxx. Easy for quick tests but avoid in production as keys end up in server logs.

When working with screenshots of authenticated pages, you'll pass session cookies in the request. Make sure the API you choose supports cookie injection for this use case.

## Caching Considerations

Generating screenshots is computationally expensive. Good APIs cache results based on URL and parameters, returning the cached image for identical requests within a TTL you specify.

For static pages this works perfectly. For dynamic pages (dashboards, user-specific views), you'll want to disable caching or use short TTLs.

When building screenshot-based features into your product, think about where to cache results on your side too. Storing screenshots in object storage and serving from there reduces API calls and latency for repeated views.

## Rate Limits and Pricing

Screenshot generation is CPU and memory-intensive. Most APIs tier pricing by:

- **Requests per month**: Basic tier typically 1,000-5,000 requests
- **Concurrency**: How many parallel screenshots you can generate
- **Resolution**: Higher-DPI screenshots may cost more credits

For development and light usage, free tiers are usually sufficient. Production workloads with thousands of daily screenshots will need a paid plan.

## Building a Simple Screenshot Service

Here is a minimal screenshot service using [CaptureAPI](https://captureapi.dev) that stores results to disk:

\`\`\`javascript
const fs = require('fs');
const path = require('path');

async function captureAndSave(url, filename) {
  const apiUrl = new URL('https://captureapi.dev/v1/screenshot');
  apiUrl.searchParams.set('url', url);
  apiUrl.searchParams.set('fullPage', 'true');
  apiUrl.searchParams.set('format', 'png');
  apiUrl.searchParams.set('viewport', '1440x900');

  const response = await fetch(apiUrl.toString(), {
    headers: { 'Authorization': 'Bearer ' + process.env.CAPTURE_API_KEY }
  });

  if (!response.ok) {
    throw new Error('API error: ' + response.status);
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(path.join('screenshots', filename), Buffer.from(buffer));
  console.log('Saved: ' + filename);
}

const targets = [
  { url: 'https://example.com', file: 'home.png' },
  { url: 'https://example.com/pricing', file: 'pricing.png' },
];

for (const { url, file } of targets) {
  await captureAndSave(url, file);
}
\`\`\`

Add error handling, retry logic, and a queue for production use.

## When to Use a Screenshot API vs. DIY

| Scenario | Use API | DIY |
|---|---|---|
| Customer-facing feature | Yes | No |
| High concurrency (100+/min) | Yes | No |
| Internal tooling, low volume | Yes | Yes |
| Need full browser control | No | Yes |
| Serverless environment | Yes | No |

## Getting Started

If you need screenshots in your application without managing browser infrastructure, [CaptureAPI](https://captureapi.dev) offers a free tier with no credit card required. The API supports PNG, JPEG, WebP, full-page capture, custom viewports, and cookie injection for authenticated pages.

Start with the free tier, integrate in an afternoon, and scale when you need to.`;

const mutation = JSON.stringify({
  query: `mutation PublishPost($input: PublishPostInput!) {
    publishPost(input: $input) {
      post {
        id
        title
        url
        slug
      }
    }
  }`,
  variables: {
    input: {
      title: 'How to Automate Web Screenshots with a Screenshot API: A Developer Guide',
      publicationId: PUBLICATION_ID,
      contentMarkdown: articleContent,
      tags: [
        { slug: 'api', name: 'API' },
        { slug: 'webdev', name: 'Web Dev' },
        { slug: 'javascript', name: 'JavaScript' },
        { slug: 'automation', name: 'Automation' },
        { slug: 'testing', name: 'Testing' }
      ],
      subtitle: 'When to use a screenshot API vs Puppeteer, key parameters, authentication patterns, and a practical code example'
    }
  }
});

const options = {
  hostname: 'gql.hashnode.com',
  port: 443,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': HASHNODE_API_KEY,
    'Content-Length': Buffer.byteLength(mutation)
  }
};

const req = https.request(options, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    try {
      const result = JSON.parse(d);
      if (result.data && result.data.publishPost) {
        const post = result.data.publishPost.post;
        console.log('SUCCESS');
        console.log('Title:', post.title);
        console.log('URL:', post.url);
        console.log('ID:', post.id);
      } else {
        console.log('ERROR:', JSON.stringify(result, null, 2));
      }
    } catch(e) {
      console.log('Parse error:', e.message);
      console.log('Raw:', d.substring(0, 500));
    }
  });
});

req.on('error', e => console.error('Request error:', e.message));
req.write(mutation);
req.end();
