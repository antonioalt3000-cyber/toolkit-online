'use strict';

// ─── Dev.to Article Publisher ─────────────────────────────────────────────────
// Posts today's article from the content library to Dev.to.
// Runs daily at 09:00 UTC via GitHub Actions. Zero npm dependencies.
//
// Required env var:  DEVTO_API_KEY
// Optional env var:  DEVTO_DRY_RUN=true  (print article without posting)

const https = require('https');
const { getTodayArticle, getDayOfYear } = require('./content-library');

// ── Dev.to REST API v1 ────────────────────────────────────────────────────────
function postArticle(article) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.DEVTO_API_KEY;
    if (!apiKey) return reject(new Error('DEVTO_API_KEY is not set'));

    const payload = JSON.stringify({
      article: {
        title:           article.title,
        body_markdown:   article.body,
        published:       true,
        tags:            article.tags,
        canonical_url:   null,
        series:          null,
        description:     article.body.split('\n').find(l => l.trim() && !l.startsWith('#'))?.trim().slice(0, 160) || '',
      },
    });

    const req = https.request(
      {
        hostname: 'dev.to',
        path:     '/api/articles',
        method:   'POST',
        headers: {
          'Content-Type':   'application/json',
          'api-key':        apiKey,
          'Content-Length': Buffer.byteLength(payload),
          'User-Agent':     'DevToolsmith-Publisher/1.0',
        },
      },
      (res) => {
        let data = '';
        res.on('data',  (chunk) => { data += chunk; });
        res.on('end',   () => resolve({ status: res.statusCode, body: data }));
      }
    );

    req.on('error', reject);
    req.setTimeout(20000, () => {
      req.destroy();
      reject(new Error('Dev.to API timed out after 20s'));
    });

    req.write(payload);
    req.end();
  });
}

// Fetch titles of ALL my Dev.to articles (published + drafts) so we never repost a
// duplicate. Dev.to allows duplicate titles (it just appends a slug suffix), so the
// HTTP 422 "already been taken" guard below never fires — this explicit check is what
// actually stops the daily re-duplication. Returns a Set of titles, or null on failure
// (fail-open: if we can't check, fall through to the post attempt).
function getMyArticleTitles() {
  return new Promise((resolve) => {
    const apiKey = process.env.DEVTO_API_KEY;
    if (!apiKey) return resolve(null);
    const req = https.request(
      {
        hostname: 'dev.to',
        path:     '/api/articles/me/all?per_page=1000',
        method:   'GET',
        headers:  { 'api-key': apiKey, 'User-Agent': 'DevToolsmith-Publisher/1.0' },
      },
      (res) => {
        let d = '';
        res.on('data', (c) => { d += c; });
        res.on('end', () => {
          try {
            const arr = JSON.parse(d);
            resolve(new Set((Array.isArray(arr) ? arr : []).map((a) => (a.title || '').trim())));
          } catch { resolve(null); }
        });
      }
    );
    req.on('error', () => resolve(null));
    req.setTimeout(20000, () => { req.destroy(); resolve(null); });
    req.end();
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const day     = getDayOfYear();
  const article = getTodayArticle();
  const dryRun  = process.env.DEVTO_DRY_RUN === 'true';

  console.log('\n[Dev.to Publisher]');
  console.log('─'.repeat(60));
  console.log(`  Day of year : ${day}`);
  console.log(`  Tool        : ${article.tool}`);
  console.log(`  Title       : ${article.title}`);
  console.log(`  Tags        : ${article.tags.join(', ')}`);
  console.log(`  Body length : ${article.body.length} chars`);
  console.log('─'.repeat(60));

  if (dryRun) {
    console.log('\n[DRY RUN] Would post this article to Dev.to. Set DEVTO_DRY_RUN=false to publish.');
    process.exit(0);
  }

  // Idempotency guard: skip if this title already exists on the account (published or
  // draft). Stops the daily re-duplication and won't recreate titles that were
  // unpublished during the 22-Jun dedup cleanup. Fail-open if the lookup fails.
  const existingTitles = await getMyArticleTitles();
  if (existingTitles && existingTitles.has(article.title.trim())) {
    console.log(`\n⏭️  "${article.title}" already exists on the account — skipping to avoid a duplicate.`);
    process.exit(0);
  }

  console.log('\nPosting to Dev.to...');

  let result;
  try {
    result = await postArticle(article);
  } catch (err) {
    console.error(`\n❌ Request failed: ${err.message}`);
    process.exit(2);
  }

  let parsed;
  try { parsed = JSON.parse(result.body); } catch { parsed = {}; }

  if (result.status === 201) {
    console.log(`\n✅ Published successfully!`);
    console.log(`   URL  : ${parsed.url}`);
    console.log(`   ID   : ${parsed.id}`);
    console.log(`   Slug : ${parsed.slug}`);
    process.exit(0);

  } else if (result.status === 422 && result.body.includes('already been taken')) {
    // Same title already exists — skip gracefully (expected on rotation)
    console.log(`\n⏭️  Article already published (title exists) — skipping`);
    process.exit(0);

  } else if (result.status === 401) {
    console.error(`\n❌ Invalid DEVTO_API_KEY — update the GitHub Secret`);
    process.exit(1);

  } else {
    console.error(`\n❌ Dev.to returned HTTP ${result.status}`);
    console.error(`   Body: ${result.body.substring(0, 400)}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(2);
});
