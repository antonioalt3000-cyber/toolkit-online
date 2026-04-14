'use strict';

// ─── Bluesky Post Publisher ───────────────────────────────────────────────────
// Posts today's micro-post to Bluesky via AT Protocol API.
// Runs daily at 10:00 UTC via GitHub Actions. Zero npm dependencies.
//
// Required env vars:  BLUESKY_IDENTIFIER  (e.g. devtoolsmith.bsky.social)
//                     BLUESKY_PASSWORD    (app password from Settings > App Passwords)
// Optional env var:   BLUESKY_DRY_RUN=true

const https = require('https');
const { getTodayBlueskyPost, getDayOfYear } = require('./content-library');

// ── AT Protocol helpers ───────────────────────────────────────────────────────
function atpRequest(path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);

    const headers = {
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'User-Agent':     'DevToolsmith-Publisher/1.0',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = https.request(
      {
        hostname: 'bsky.social',
        path:     `/xrpc/${path}`,
        method:   'POST',
        headers,
      },
      (res) => {
        let data = '';
        res.on('data',  (chunk) => { data += chunk; });
        res.on('end',   () => resolve({ status: res.statusCode, body: data }));
      }
    );

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Bluesky API timed out after 15s'));
    });

    req.write(payload);
    req.end();
  });
}

// Create authenticated session
async function createSession(identifier, password) {
  const result = await atpRequest('com.atproto.server.createSession', { identifier, password });
  if (result.status !== 200) {
    const err = JSON.parse(result.body);
    throw new Error(`Auth failed (${result.status}): ${err.message || err.error}`);
  }
  return JSON.parse(result.body);
}

// Resolve did from handle
async function resolveHandle(handle) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      {
        hostname: 'bsky.social',
        path:     `/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`,
        headers:  { 'User-Agent': 'DevToolsmith-Publisher/1.0' },
      },
      (res) => {
        let data = '';
        res.on('data',  (chunk) => { data += chunk; });
        res.on('end',   () => {
          const parsed = JSON.parse(data);
          resolve(parsed.did);
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// Detect facets (URLs and mentions) in text for rich-text rendering
function detectFacets(text) {
  const facets = [];

  // Detect URLs
  const urlRegex = /https?:\/\/[^\s]+/g;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    const start = Buffer.byteLength(text.slice(0, match.index));
    const end   = start + Buffer.byteLength(match[0]);
    facets.push({
      index:    { byteStart: start, byteEnd: end },
      features: [{ $type: 'app.bsky.richtext.facet#link', uri: match[0] }],
    });
  }

  return facets;
}

// Post a skeet
async function createPost(did, text, token) {
  const facets = detectFacets(text);

  const record = {
    $type:     'app.bsky.feed.post',
    text,
    createdAt: new Date().toISOString(),
  };
  if (facets.length > 0) record.facets = facets;

  const result = await atpRequest(
    'com.atproto.repo.createRecord',
    { repo: did, collection: 'app.bsky.feed.post', record },
    token
  );

  if (result.status !== 200) {
    const err = JSON.parse(result.body);
    throw new Error(`Post failed (${result.status}): ${err.message || err.error}`);
  }

  return JSON.parse(result.body);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const identifier = process.env.BLUESKY_IDENTIFIER || 'devtoolsmith.bsky.social';
  const password   = process.env.BLUESKY_PASSWORD;
  const dryRun     = process.env.BLUESKY_DRY_RUN === 'true';

  const day  = getDayOfYear();
  const post = getTodayBlueskyPost();

  console.log('\n[Bluesky Publisher]');
  console.log('─'.repeat(60));
  console.log(`  Day of year  : ${day}`);
  console.log(`  Tool         : ${post.tool}`);
  console.log(`  Handle       : ${identifier}`);
  console.log(`  Text length  : ${post.text.length} chars (max 300)`);
  console.log(`  Text preview : ${post.text.slice(0, 80)}...`);
  console.log('─'.repeat(60));

  if (post.text.length > 300) {
    console.error(`\n❌ Post exceeds 300 characters (${post.text.length}). Fix in content-library.js.`);
    process.exit(1);
  }

  if (dryRun) {
    console.log('\n[DRY RUN] Would post this to Bluesky:');
    console.log(`\n"${post.text}"\n`);
    console.log('Set BLUESKY_DRY_RUN=false to publish.');
    process.exit(0);
  }

  if (!password) {
    console.error('\n❌ BLUESKY_PASSWORD is not set');
    process.exit(1);
  }

  console.log('\nAuthenticating with Bluesky...');
  let session;
  try {
    session = await createSession(identifier, password);
    console.log(`  ✅ Authenticated as ${session.handle}`);
  } catch (err) {
    console.error(`\n❌ Auth failed: ${err.message}`);
    console.error('   Check BLUESKY_IDENTIFIER and BLUESKY_PASSWORD secrets.');
    process.exit(1);
  }

  console.log('\nPosting to Bluesky...');
  try {
    const result = await createPost(session.did, post.text, session.accessJwt);
    console.log(`\n✅ Posted successfully!`);
    console.log(`   URI : ${result.uri}`);
    console.log(`   CID : ${result.cid}`);
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Post failed: ${err.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(2);
});
