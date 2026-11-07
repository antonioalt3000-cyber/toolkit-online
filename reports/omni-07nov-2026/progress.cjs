#!/usr/bin/env node
/**
 * progress.cjs — ledger append-only per una run autonoma su 10 repo.
 *
 * Esiste per una ragione sola: una run lunga perde il contesto a meta' strada,
 * e senza un registro su disco si ricomincia o, peggio, si dichiara fatto
 * qualcosa che non lo e'. Lo stato vive qui, non nella conversazione.
 *
 *   node progress.cjs log --repo f1 --phase M3-fix --esito ok --prova "PR #71"
 *   node progress.cjs table      # rigenera RUN-LEDGER.md
 *   node progress.cjs redis --repo f1 --key "cpilot:user:x" --nota "journey D1"
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const LOG = path.join(DIR, 'run-events.jsonl');
const REDIS = path.join(DIR, 'REDIS-WRITES.jsonl');
const LEDGER = path.join(DIR, 'RUN-LEDGER.md');

const REPOS = [
  ['f1', 'CompliPilot', 'business-fast1-complipilot'],
  ['f2', 'FixMyWeb', 'business-fast2-accessiscan'],
  ['f3', 'PaymentRescue', 'business-fast3-churnguard'],
  ['f4', 'ParseFlow', 'business-fast4-documint'],
  ['b7', 'CaptureAPI', 'business-7-capture-api'],
  ['cfg', 'CardForge', 'business-new-cardforge'],
  ['eg', 'EmailGuard', 'business-new-emailguard'],
  ['hsh', 'HeaderShield', 'business-new-headershield'],
  ['hkl', 'HookLab', 'business-new-hooklab'],
  ['seo', 'SEOScope', 'business-new-seoscope'],
];
const PHASES = [
  'M0-realign',
  'M2-scan',
  'M3-fix',
  'M3-gate',
  'M3-pr',
  'M3-deploy',
  'M4-journey',
  'M4-teardown',
];
const GLYPH = { ok: '✅', ko: '❌', wip: '⏳', skip: '—', warn: '⚠️' };

function args(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i += 2) o[argv[i].replace(/^--/, '')] = argv[i + 1];
  return o;
}

function append(file, row) {
  fs.appendFileSync(file, JSON.stringify({ ts: new Date().toISOString(), ...row }) + '\n', 'utf-8');
}

function readEvents() {
  if (!fs.existsSync(LOG)) return [];
  return fs
    .readFileSync(LOG, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

/** L'ultimo evento per (repo, fase) vince: una fase ritentata sovrascrive l'esito vecchio. */
function latest(events) {
  const m = new Map();
  for (const e of events) m.set(`${e.repo}|${e.phase}`, e);
  return m;
}

function table() {
  const events = readEvents();
  const m = latest(events);
  const head = `| SaaS | ${PHASES.join(' | ')} |`;
  const sep = `|---|${PHASES.map(() => '---').join('|')}|`;
  const rows = REPOS.map(([slug, name]) => {
    const cells = PHASES.map((p) => {
      const e = m.get(`${slug}|${p}`);
      return e ? GLYPH[e.esito] || e.esito : '';
    });
    return `| **${name}** (\`${slug}\`) | ${cells.join(' | ')} |`;
  });

  const notes = events
    .filter((e) => e.prova)
    .slice(-40)
    .map(
      (e) =>
        `- \`${e.ts.slice(5, 16).replace('T', ' ')}\` **${e.repo}** ${e.phase} ${GLYPH[e.esito] || ''} — ${e.prova}`
    );

  const nRedis = fs.existsSync(REDIS)
    ? fs.readFileSync(REDIS, 'utf-8').split('\n').filter(Boolean).length
    : 0;

  const out = `# RUN LEDGER — Omni-QA 10 SaaS (4-5 nov 2026)

> Rigenerato da \`node progress.cjs table\`. Non modificare a mano: la fonte e'
> \`run-events.jsonl\`. Legenda: ✅ fatto · ❌ fallito · ⏳ in corso · ⚠️ con riserva · — non applicabile.

${head}
${sep}
${rows.join('\n')}

**Chiavi Redis scritte in produzione e da rimuovere nel teardown: ${nRedis}** (\`REDIS-WRITES.jsonl\`)

## Ultimi eventi

${notes.length ? notes.join('\n') : '_nessuno_'}
`;
  fs.writeFileSync(LEDGER, out, 'utf-8');
  process.stdout.write(out);
}

const [cmd, ...rest] = process.argv.slice(2);
const a = args(rest);
if (cmd === 'log') {
  if (!a.repo || !a.phase) throw new Error('log richiede --repo e --phase');
  append(LOG, { repo: a.repo, phase: a.phase, esito: a.esito || 'wip', prova: a.prova || '' });
  table();
} else if (cmd === 'redis') {
  if (!a.key) throw new Error('redis richiede --key');
  append(REDIS, { repo: a.repo || '?', key: a.key, nota: a.nota || '' });
  console.log(`registrata: ${a.key}`);
} else if (cmd === 'table') {
  table();
} else {
  console.log('uso: progress.cjs log|redis|table — vedi intestazione del file');
  process.exit(1);
}
