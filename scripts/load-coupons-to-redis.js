/**
 * Load coupon codes into Redis for all 5 SaaS
 * Run: node scripts/load-coupons-to-redis.js
 *
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars
 * for each business (reads from their .env.local files)
 */

const fs = require('fs');
const path = require('path');

const codes = JSON.parse(fs.readFileSync(path.join(__dirname, 'coupon-codes.json'), 'utf8'));

const businesses = [
  { prefix: 'FMW', dir: 'C:/Users/ftass/business-fast2-accessiscan', redisPrefix: 'fmw' },
  { prefix: 'CAP', dir: 'C:/Users/ftass/business-7-capture-api', redisPrefix: 'cap' },
  { prefix: 'CPL', dir: 'C:/Users/ftass/business-fast1-complipilot', redisPrefix: 'cpl' },
  { prefix: 'PRE', dir: 'C:/Users/ftass/business-fast3-churnguard', redisPrefix: 'pre' },
  { prefix: 'PFL', dir: 'C:/Users/ftass/business-fast4-documint', redisPrefix: 'pfl' },
];

async function loadForBusiness(biz) {
  // Read env from .env.local
  const envPath = path.join(biz.dir, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log(`SKIP ${biz.prefix}: no .env.local found at ${envPath}`);
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const urlMatch = envContent.match(/UPSTASH_REDIS_REST_URL=(.+)/);
  const tokenMatch = envContent.match(/UPSTASH_REDIS_REST_TOKEN=(.+)/);

  if (!urlMatch || !tokenMatch) {
    console.log(`SKIP ${biz.prefix}: no Redis credentials in .env.local`);
    return;
  }

  const redisUrl = urlMatch[1].trim();
  const redisToken = tokenMatch[1].trim();
  const bizCodes = codes[biz.prefix];

  if (!bizCodes || bizCodes.length === 0) {
    console.log(`SKIP ${biz.prefix}: no codes found`);
    return;
  }

  // Use Upstash REST API to SADD all codes
  const redisKey = `${biz.redisPrefix}:coupons:valid`;

  try {
    const response = await fetch(`${redisUrl}/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${redisToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        bizCodes.map(code => ['SADD', redisKey, code])
      ),
    });

    const result = await response.json();
    const successCount = result.filter(r => r.result !== undefined).length;
    console.log(`${biz.prefix}: loaded ${successCount}/${bizCodes.length} codes into ${redisKey}`);
  } catch (e) {
    console.log(`ERROR ${biz.prefix}: ${e.message}`);
  }
}

async function main() {
  console.log('Loading coupon codes into Redis...\n');
  for (const biz of businesses) {
    await loadForBusiness(biz);
  }
  console.log('\nDone!');
}

main();
