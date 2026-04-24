const https = require('https');

const HASHNODE_API_KEY = '4df35ca0-83d0-48c0-88fc-6be573f848dd';
const PUBLICATION_ID = '69c5558810e664c5daf05d9f';

const articleContent = `The European Accessibility Act (EAA) is now fully enforced across all EU member states. If your website serves European customers, you need to meet WCAG 2.1 AA standards — or face fines up to 600,000 euros.

Most businesses don't know they're non-compliant. Most websites have 20+ accessibility issues they've never detected. Here's what you need to know.

## What the EAA Requires

Since June 2025, all e-commerce websites and digital services in the EU must comply with **WCAG 2.1 Level AA**. This covers:

- **E-commerce platforms** — product pages, checkout, account areas
- **Banking and financial services** — online banking, payment apps
- **Government websites** — already required under earlier directives
- **SaaS platforms** — if they serve EU customers

Fines vary by country: Spain up to 600K euros, Germany up to 500K euros, France enforced by ARCOM and DGCCRF.

## The Four WCAG Principles

### Perceivable
Every image needs alt text. Videos need captions. Color contrast must meet 4.5:1 for normal text. Content must work at 200% zoom.

### Operable
All functionality must be keyboard-accessible. No flashing content. Skip navigation links for screen readers. Users get sufficient time to interact.

### Understandable
Page language declared in HTML. Form inputs have visible labels. Error messages are clear and helpful. Navigation is consistent.

### Robust
Valid HTML structure. ARIA attributes used correctly. Semantic heading hierarchy (h1-h6). Compatible with screen readers and assistive tech.

## Why Manual Audits Don't Scale

Hiring an accessibility consultant costs 3,000-10,000 euros per audit. Reports take weeks. By the time you get results, the site has changed.

Automated scanning catches 60-80% of issues instantly. It's the essential first step before expert review.

## How to Audit Your Website in 60 Seconds

[AccessiScan](https://fixmyweb.dev) runs **201 WCAG criteria** against any website — that's **2x more checks than WAVE**, the industry standard.

What you get:
1. **Compliance score** — overall WCAG 2.1 AA percentage
2. **Issue breakdown** — critical, major, and minor issues
3. **Specific fixes** — element-level recommendations with code
4. **Accessibility statement** — auto-generated, ready to publish
5. **VPAT document** — for enterprise procurement

### Quick Start
1. Go to [fixmyweb.dev](https://fixmyweb.dev)
2. Enter your URL
3. Get results in under 60 seconds

Free plan: 3 scans per month.

## Who Should Act Now?

If you run an e-commerce site, SaaS platform, or web agency in the EU — you need to check your compliance today. The law is enforced, complaints are being filed, and fines are real.

Web agencies can use AccessiScan to audit client sites before launch — and charge for the service.

## Beyond Compliance: The Business Case

15% of the EU population has a disability. An inaccessible website doesn't just risk fines — it loses customers. Companies that fix accessibility issues report **higher conversion rates** and **better SEO rankings** (Google considers accessibility signals).

## Take Action

Don't wait for a complaint. Run a free scan at [AccessiScan](https://fixmyweb.dev) and know exactly where your site stands.

For teams building screenshot-based monitoring, [CaptureAPI](https://captureapi.dev) can capture visual snapshots to track accessibility fixes over time.

---

*Is your website EAA compliant? Share your experience in the comments.*`;

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
      title: 'European Accessibility Act 2025: How to Check Your Website Compliance in 60 Seconds',
      publicationId: PUBLICATION_ID,
      contentMarkdown: articleContent,
      tags: [
        { slug: 'accessibility', name: 'Accessibility' },
        { slug: 'webdev', name: 'Web Dev' },
        { slug: 'compliance', name: 'Compliance' },
        { slug: 'javascript', name: 'JavaScript' },
        { slug: 'eu', name: 'EU' }
      ],
      subtitle: 'The EAA is now enforced. Here is what developers need to know and how to run a quick WCAG audit.'
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
      } else {
        console.log('ERROR:', JSON.stringify(result));
      }
    } catch (e) {
      console.log('PARSE ERROR:', d);
    }
  });
});
req.on('error', e => console.log('REQUEST ERROR:', e.message));
req.write(mutation);
req.end();
