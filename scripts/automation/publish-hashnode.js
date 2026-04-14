'use strict';

// ─── Hashnode Article Publisher ───────────────────────────────────────────────
// Posts today's article from the content library to Hashnode via GraphQL API.
// Runs daily at 09:00 UTC via GitHub Actions. Zero npm dependencies.
//
// Required env vars:  HASHNODE_API_KEY, HASHNODE_PUB_ID
// Optional env var:   HASHNODE_DRY_RUN=true

const https = require('https');
const { getTodayArticle, getDayOfYear } = require('./content-library');

// ── Hashnode GraphQL API ──────────────────────────────────────────────────────
function publishPost({ title, body, tags, pubId }) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.HASHNODE_API_KEY;
    if (!apiKey) return reject(new Error('HASHNODE_API_KEY is not set'));
    if (!pubId)  return reject(new Error('HASHNODE_PUB_ID is not set'));

    // Convert simple tag strings to Hashnode tag slugs
    const tagObjects = tags.map(t => ({ slug: t.toLowerCase().replace(/[^a-z0-9]/g, ''), name: t }));

    const mutation = `
      mutation PublishPost($input: PublishPostInput!) {
        publishPost(input: $input) {
          post {
            id
            slug
            title
            url
            publishedAt
          }
        }
      }
    `;

    const variables = {
      input: {
        title,
        contentMarkdown: body,
        publicationId:   pubId,
        tags:            tagObjects,
        metaTags: {
          description: body.split('\n').find(l => l.trim() && !l.startsWith('#'))?.trim().slice(0, 160) || '',
        },
      },
    };

    const payload = JSON.stringify({ query: mutation, variables });

    const req = https.request(
      {
        hostname: 'gql.hashnode.com',
        path:     '/',
        method:   'POST',
        headers: {
          'Content-Type':   'application/json',
          'Authorization':  apiKey,
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
      reject(new Error('Hashnode API timed out after 20s'));
    });

    req.write(payload);
    req.end();
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const day    = getDayOfYear();
  const art    = getTodayArticle();
  const pubId  = process.env.HASHNODE_PUB_ID || '69c5558810e664c5daf05d9f';
  const dryRun = process.env.HASHNODE_DRY_RUN === 'true';

  console.log('\n[Hashnode Publisher]');
  console.log('─'.repeat(60));
  console.log(`  Day of year : ${day}`);
  console.log(`  Tool        : ${art.tool}`);
  console.log(`  Title       : ${art.title}`);
  console.log(`  Tags        : ${art.tags.join(', ')}`);
  console.log(`  Pub ID      : ${pubId}`);
  console.log(`  Body length : ${art.body.length} chars`);
  console.log('─'.repeat(60));

  if (dryRun) {
    console.log('\n[DRY RUN] Would post this article to Hashnode. Set HASHNODE_DRY_RUN=false to publish.');
    process.exit(0);
  }

  console.log('\nPosting to Hashnode...');

  let result;
  try {
    result = await publishPost({ title: art.title, body: art.body, tags: art.tags, pubId });
  } catch (err) {
    console.error(`\n❌ Request failed: ${err.message}`);
    process.exit(2);
  }

  let parsed;
  try { parsed = JSON.parse(result.body); } catch { parsed = {}; }

  // Check for GraphQL errors
  if (parsed.errors && parsed.errors.length > 0) {
    const errMsg = parsed.errors[0].message || JSON.stringify(parsed.errors[0]);

    if (errMsg.toLowerCase().includes('already') || errMsg.toLowerCase().includes('duplicate')) {
      console.log(`\n⏭️  Article already published (duplicate) — skipping`);
      process.exit(0);
    }

    if (errMsg.toLowerCase().includes('unauthorized') || errMsg.toLowerCase().includes('auth')) {
      console.error(`\n❌ Invalid HASHNODE_API_KEY — update the GitHub Secret`);
      process.exit(1);
    }

    console.error(`\n❌ Hashnode GraphQL error: ${errMsg}`);
    console.error(`   Full response: ${result.body.substring(0, 600)}`);
    process.exit(1);
  }

  if (result.status === 200 && parsed.data?.publishPost?.post) {
    const post = parsed.data.publishPost.post;
    console.log(`\n✅ Published successfully!`);
    console.log(`   URL         : ${post.url}`);
    console.log(`   ID          : ${post.id}`);
    console.log(`   Slug        : ${post.slug}`);
    console.log(`   Published at: ${post.publishedAt}`);
    process.exit(0);
  }

  console.error(`\n❌ Unexpected response HTTP ${result.status}`);
  console.error(`   Body: ${result.body.substring(0, 400)}`);
  process.exit(1);
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(2);
});
