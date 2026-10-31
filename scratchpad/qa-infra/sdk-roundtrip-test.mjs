// Validates the Upstash mock against the REAL @upstash/redis SDK (default
// base64 response encoding + auto-pipelining). Usage: node sdk-roundtrip-test.mjs <sdkModulePath> <mockUrl>
const [, , sdkPath, mockUrl] = process.argv;
const { Redis } = await import(sdkPath);
const redis = new Redis({ url: mockUrl, token: 'qa-token' });
const hexId = '0123456789abcdef0123456789abcdef'; // valid base64 -> was decoded to junk
const checks = [];
const eq = (name, got, want) =>
  checks.push({ name, ok: JSON.stringify(got) === JSON.stringify(want), got, want });
eq('ping', await redis.ping(), 'PONG');
await redis.set('qa:session:' + hexId, hexId);
const sid = await redis.get('qa:session:' + hexId);
eq('get hex id', sid, hexId);
await redis.set('qa:user:' + sid, JSON.stringify({ email: 'a@b.c', plan: 'pro' }));
eq('dependent get (session->user)', await redis.get('qa:user:' + sid), {
  email: 'a@b.c',
  plan: 'pro',
});
await redis.hset('qa:h', { field1: 'abcd', n: 5 });
eq('hgetall', await redis.hgetall('qa:h'), { field1: 'abcd', n: 5 });
const [a, b] = await Promise.all([redis.get('qa:session:' + hexId), redis.incr('qa:counter')]);
eq('auto-pipelined pair', [a, b], [hexId, 1]);
eq('smembers', (await redis.sadd('qa:s', 'abcd'), await redis.smembers('qa:s')), ['abcd']);
for (const c of checks)
  console.log(
    `${c.ok ? 'PASS' : 'FAIL'} ${c.name}${c.ok ? '' : ` got=${JSON.stringify(c.got)} want=${JSON.stringify(c.want)}`}`
  );
process.exitCode = checks.every((c) => c.ok) ? 0 : 1;
