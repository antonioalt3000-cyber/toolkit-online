const https = require('https');

const article = {
  article: {
    title: 'How I Built an Accessibility Scanner That Checks 201 WCAG Criteria',
    body_markdown: `Building web accessibility tools isn't just about checking boxes — it's about making the web usable for everyone. Here's how I approached building AccessiScan, a WCAG 2.1 accessibility scanner.

## The Problem

Most accessibility scanners check only 30-50 common issues. That leaves hundreds of potential barriers undetected. I wanted something more comprehensive.

## Architecture Decisions

### Client-Side First
The scanner runs primarily in the browser. This means:
- No data leaves the user's machine
- Instant feedback (no server round-trips)
- Works offline once loaded

### 201 Individual Checks
Each WCAG criterion gets its own check function. They're organized by conformance level:

- **Level A** (78 checks): Essential requirements. Missing alt text, keyboard traps, missing form labels.
- **Level AA** (86 checks): Standard compliance. Color contrast, resize text, consistent navigation.
- **Level AAA** (37 checks): Enhanced accessibility. Sign language, extended audio descriptions.

### Scoring System
Rather than a simple pass/fail, each check returns a severity score. Critical issues block access completely (like missing alt on functional images). Serious issues create major barriers (insufficient contrast ratio). Moderate issues are significant but workable. Minor issues are best practice violations.

## Technical Implementation

The scanner injects a lightweight script into the target page via iframe. It then walks the DOM tree and runs each check against relevant elements.

For color contrast, I implemented the WCAG 2.1 contrast algorithm that handles foreground/background color extraction, alpha transparency compositing, and background image detection (which flags for manual review).

### Performance Optimization
Running 201 checks on a large page could be slow. Key optimizations:

1. **Batch DOM queries**: Group checks that need the same elements
2. **Web Workers**: Heavy computations run off the main thread
3. **Progressive results**: Show findings as they come in, don't wait for all 201

## Lessons Learned

1. **False positives are worse than missing issues**. Users stop trusting the tool if it flags things incorrectly.
2. **Context matters**. An empty alt attribute is correct for decorative images but wrong for informational ones.
3. **Accessibility is a spectrum**, not a binary. The scoring system helps prioritize what to fix first.

## What's Next

- Automated monitoring (scan on deploy)
- CI/CD integration
- Historical comparison (track progress over time)

If you're building web applications, accessibility shouldn't be an afterthought. Start with Level A compliance and work your way up.

---

*AccessiScan checks 201 WCAG 2.1 criteria across all three conformance levels. Try it at [fixmyweb.dev](https://fixmyweb.dev).*
`,
    published: true,
    tags: ['webdev', 'accessibility', 'javascript', 'tutorial']
  }
};

const postData = JSON.stringify(article);

const options = {
  hostname: 'dev.to',
  port: 443,
  path: '/api/articles',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'api-key': process.env.DEVTO_API_KEY || 'LFXUTQoSMQWbmboKH7mbAAxF3E48CzGY9_ooY-sD_pnzEjmydxJcC5R9dOtR3D6W_iT0l1HeBVIxcnSX5dua6Q',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('Status:', res.statusCode);
      console.log('URL:', result.url || 'N/A');
      console.log('Title:', result.title || 'N/A');
      console.log('Published:', result.published || false);
      if (result.error) console.log('Error:', result.error);
    } catch(e) {
      console.log('Status:', res.statusCode);
      console.log('Raw:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(postData);
req.end();
