// Starts one SaaS in an isolated local QA environment:
//   - its own Upstash / Brevo / Stripe mocks (per-SaaS ports, so tracks never share state)
//   - `next dev --webpack` with every external credential replaced by a
//     freshly generated LOCAL test value, plus the egress guard preloaded so a
//     forgotten code path can never reach real Upstash / Stripe / Brevo.
// Usage: node run-prod.cjs <saas>  (PRODUCTION build + next start under the same mocks; flusso A 7 nov 2026)   (foreground; used by .claude/launch.json qa26-* entries)
// State (ports + generated local test secrets) -> ../qa-26ott/state/<saas>.json
'use strict';
const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const HOME = 'C:/Users/ftass';
const SAAS = {
  f1: { repo: 'business-fast1-complipilot', port: 3201 },
  f2: { repo: 'business-fast2-accessiscan', port: 3202 },
  f3: { repo: 'business-fast3-churnguard', port: 3203 },
  f4: { repo: 'business-fast4-documint', port: 3204 },
  b7: { repo: 'business-7-capture-api', port: 3207 },
  eg: { repo: 'business-new-emailguard', port: 3211 },
  seo: { repo: 'business-new-seoscope', port: 3212 },
  hsh: { repo: 'business-new-headershield', port: 3213 },
  hkl: { repo: 'business-new-hooklab', port: 3214 },
  cfg: { repo: 'business-new-cardforge', port: 3215 },
};

const PRICE_VARS = ['STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE', 'GROWTH', 'SCALE'].flatMap((p) => [
  `STRIPE_PRICE_${p}`,
  `STRIPE_PRICE_${p}_ANNUAL`,
]);

const SECRET_VARS = [
  'ADMIN_API_SECRET',
  'ADMIN_SIGNING_SECRET',
  'CRON_SECRET',
  'INTERNAL_SECRET_KEY',
  'EMAIL_VERIFY_SECRET',
  'COURT_PDF_HMAC_SECRET',
  'EMAIL_UNSUB_SECRET',
  'INVOICE_LINK_SECRET',
  'CARDFORGE_SIGNING_SECRET',
  'WEBHOOK_SIGNING_SECRET',
  'CAPTUREAPI_WEBHOOK_SECRET',
  'PAYMENTRESCUE_WEBHOOK_SECRET',
  'INTERNAL_DIGEST_TOKEN',
  'INTERNAL_WEBHOOK_KEY',
  'API_SECRET_SALT',
  'GITHUB_WEBHOOK_SECRET',
  'RAPIDAPI_PROXY_SECRET',
  'LEMONSQUEEZY_WEBHOOK_SECRET',
];

function main() {
  const key = process.argv[2];
  const cfg = SAAS[key];
  if (!cfg) throw new Error(`unknown saas "${key}" (one of ${Object.keys(SAAS).join(', ')})`);

  const infra = path.resolve(__dirname, '..', '..', '..', 'scratchpad', 'qa-infra');
  const qaRoot = path.resolve(infra, '..', 'qa-26ott');
  const logDir = path.join(qaRoot, 'logs');
  const stateDir = path.join(qaRoot, 'state');
  fs.mkdirSync(logDir, { recursive: true });
  fs.mkdirSync(stateDir, { recursive: true });

  const n = cfg.port - 3200;
  const ports = {
    app: cfg.port,
    upstash: 9001 + n * 10,
    brevo: 9002 + n * 10,
    stripe: 9003 + n * 10,
  };
  const rnd = () => crypto.randomBytes(24).toString('hex');
  const base = `http://localhost:${ports.app}`;

  const env = {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: '1',
    UPSTASH_REDIS_REST_URL: `http://127.0.0.1:${ports.upstash}`,
    UPSTASH_REDIS_REST_TOKEN: 'qa-local-token',
    BREVO_API_KEY: 'qa-local-brevo',
    QA_BREVO_MOCK_URL: `http://127.0.0.1:${ports.brevo}`,
    QA_STRIPE_MOCK_PORT: String(ports.stripe),
    STRIPE_SECRET_KEY: `sk_test_qalocal${rnd().slice(0, 24)}`,
    STRIPE_WEBHOOK_SECRET: `whsec_qalocal${rnd().slice(0, 32)}`,
    STRIPE_CONNECT_WEBHOOK_SECRET: `whsec_qaconnect${rnd().slice(0, 32)}`,
    NEXT_PUBLIC_SITE_URL: base,
    NEXT_PUBLIC_BASE_URL: base,
    NEXT_PUBLIC_APP_URL: base,
    NEXT_PUBLIC_GA4_ID: '',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_qalocal',
    VERCEL_OIDC_TOKEN: '',
    // no bypass lists: the QA customer must hit every real quota/auth gate
    INTERNAL_API_KEYS: '',
    INTERNAL_EMAILS: '',
    INTERNAL_BYPASS_EMAIL: '',
    INTERNAL_BYPASS_KEY: '',
    QA_EGRESS_LOG: path.join(logDir, `${key}-egress.log`),
    NODE_OPTIONS: `--require ${path.join(infra, 'egress-guard.cjs').replace(/\\/g, '/')}`,
  };
  for (const v of PRICE_VARS) env[v] = `price_qa_${v.replace('STRIPE_PRICE_', '').toLowerCase()}`;
  for (const v of SECRET_VARS) env[v] = rnd();

  const state = {
    saas: key,
    repo: cfg.repo,
    startedAt: new Date().toISOString(),
    base,
    ports,
    secrets: Object.fromEntries(
      [...SECRET_VARS, 'STRIPE_WEBHOOK_SECRET', 'STRIPE_CONNECT_WEBHOOK_SECRET'].map((v) => [
        v,
        env[v],
      ])
    ),
    prices: Object.fromEntries(PRICE_VARS.map((v) => [v, env[v]])),
  };
  fs.writeFileSync(path.join(stateDir, `${key}.json`), JSON.stringify(state, null, 2));

  const children = [];
  const mockEnv = { ...process.env };
  delete mockEnv.NODE_OPTIONS;
  const startMock = (file, args) => {
    const c = spawn(process.execPath, [path.join(infra, file), ...args], {
      env: mockEnv,
      stdio: 'ignore',
    });
    children.push(c);
  };
  startMock('upstash-mock-server.cjs', [
    String(ports.upstash),
    path.join(logDir, `${key}-upstash.log`),
  ]);
  startMock('brevo-mock-server.cjs', [String(ports.brevo), path.join(logDir, `${key}-brevo.log`)]);
  const fixtures = path.join(stateDir, `${key}-stripe-fixtures.json`);
  if (!fs.existsSync(fixtures))
    fs.writeFileSync(fixtures, JSON.stringify({ customerId: 'cus_qa_fake' }));
  startMock('stripe-mock-server.cjs', [
    String(ports.stripe),
    path.join(logDir, `${key}-stripe.log`),
    fixtures,
  ]);

  const repoDir = path.join(HOME, cfg.repo);
  const nextBin = path.join(repoDir, 'node_modules', 'next', 'dist', 'bin', 'next');
  // Production build with the QA env baked in (NEXT_PUBLIC_* are compile-time). Skip with QA_SKIP_BUILD=1.
  if (!process.env.QA_SKIP_BUILD) {
    const { spawnSync } = require('child_process');
    console.log(`[run-prod] next build in ${repoDir}`);
    const b = spawnSync(process.execPath, [nextBin, 'build'], {
      cwd: repoDir,
      env,
      stdio: 'inherit',
    });
    if (b.status !== 0) {
      console.error('[run-prod] build FAILED', b.status);
      for (const c of children)
        try {
          c.kill();
        } catch {
          /* gone */
        }
      process.exit(b.status || 1);
    }
  }
  console.log(`[run-prod] next start :${ports.app}`);
  const app = spawn(process.execPath, [nextBin, 'start', '-p', String(ports.app)], {
    cwd: repoDir,
    env,
    stdio: 'inherit',
  });
  children.push(app);
  const stop = () => {
    for (const c of children) {
      try {
        c.kill();
      } catch {
        /* already gone */
      }
    }
  };
  process.on('SIGINT', () => {
    stop();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    stop();
    process.exit(0);
  });
  app.on('exit', (code) => {
    stop();
    process.exit(code ?? 0);
  });
}

main();
