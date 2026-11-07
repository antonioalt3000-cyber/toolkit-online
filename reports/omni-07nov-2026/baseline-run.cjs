#!/usr/bin/env node
/**
 * baseline-run.cjs — baseline di regressione del round del 7 nov, un prodotto alla volta.
 *
 * Per ogni prodotto lancia in sequenza sweep-public, journey-public e journey-core
 * (gli stessi del round del 4 nov, copiati qui perche' le evidenze finiscano in
 * reports/omni-07nov-2026/evidence/<slug>/), e SOLO alla fine scrive
 * baseline/<slug>.json: e' il segnale con cui i flussi A e B sanno che possono
 * mandare traffico in produzione verso quel prodotto senza sovrapporsi a questo.
 *
 * Non scrive nulla in produzione: sweep = GET, journey-public = navigazione,
 * journey-core = scansioni/chiamate API con la chiave creator del vault e cron
 * veri invocati col segreto (come il round precedente). deep (conia e riscatta)
 * NON e' qui: e' dei flussi.
 *
 *   node baseline-run.cjs [slug ...]     # default: tutti, in ordine alternato F/round-2
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const DIR = __dirname;
const OUT = path.join(DIR, 'baseline');
fs.mkdirSync(OUT, { recursive: true });

const DOM = {
  f1: 'complipilot.dev',
  f2: 'fixmyweb.dev',
  f3: 'paymentrescue.dev',
  f4: 'parseflow.dev',
  b7: 'captureapi.dev',
  cfg: 'getcardforge.dev',
  eg: 'emailguard.dev',
  hsh: 'headershield.dev',
  hkl: 'gethooklab.dev',
  seo: 'seoscope.dev',
};
const ORDER = ['f1', 'cfg', 'f2', 'eg', 'f3', 'hsh', 'f4', 'hkl', 'b7', 'seo'];
const STEPS = ['sweep-public', 'journey-public', 'journey-core'];
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : ORDER;

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

async function health(dom) {
  try {
    const r = await fetch(`https://${dom}/api/health`, { signal: AbortSignal.timeout(20000) });
    const j = await r.json().catch(() => ({}));
    return { status: r.status, commit: j.commit || j.version || null };
  } catch (e) {
    return { status: 0, commit: null, error: String(e.message || e) };
  }
}

function runStep(step, slug) {
  const t0 = Date.now();
  const r = spawnSync('node', [path.join(DIR, `${step}.cjs`), slug], {
    cwd: DIR,
    encoding: 'utf8',
    timeout: 20 * 60 * 1000,
    maxBuffer: 50 * 1024 * 1024,
    env: { ...process.env, MSYS_NO_PATHCONV: '1' },
  });
  const text = `${r.stdout || ''}${r.stderr ? `\n[stderr]\n${r.stderr}` : ''}`;
  fs.writeFileSync(path.join(OUT, `${slug}.${step}.log`), text);
  return { step, exit: r.status, signal: r.signal, ms: Date.now() - t0, text };
}

function judge(step, text) {
  const lines = text.split('\n');
  if (step === 'sweep-public') {
    const s = lines.find((l) => /pagine=\s*\d+/.test(l)) || '';
    const n = (k) => Number((s.match(new RegExp(`${k}=(\\d+)`)) || [])[1] ?? NaN);
    const bs = (s.match(/backslash-500=(\d+)\/(\d+)/) || []).slice(1).map(Number);
    return {
      summary: s.trim(),
      ok:
        !!s &&
        n('non-200') === 0 &&
        n('senza-og:image') === 0 &&
        n('meta-ereditati') === 0 &&
        n('h1-multipli') === 0 &&
        bs[0] === 0,
    };
  }
  const s = [...lines].reverse().find((l) => /^--- .*PASS/.test(l)) || '';
  const m = s.match(/(\d+)\/(\d+) PASS/);
  const nonVerified = /NON VERIFICATI/.test(s);
  const fails = lines.filter((l) => /^\s+FAIL /.test(l));
  return {
    summary: s.trim(),
    nonVerified,
    fails: fails.map((l) => l.trim()),
    ok: !!m && m[1] === m[2] && fails.length === 0 && !/ERRORE/.test(text),
  };
}

(async () => {
  for (const slug of slugs) {
    if (!DOM[slug]) {
      console.error(`slug ignoto: ${slug}`);
      continue;
    }
    const startedAt = new Date().toISOString();
    const hBefore = await health(DOM[slug]);
    const steps = [];
    for (const step of STEPS) {
      const r = runStep(step, slug);
      const j = judge(step, r.text);
      steps.push({ step, exit: r.exit, signal: r.signal, ms: r.ms, ...j });
      console.log(`${slug.padEnd(4)} ${step.padEnd(15)} ${j.ok ? 'OK ' : 'ROSSO'}  ${j.summary}`);
      sleep(3000);
    }
    const hAfter = await health(DOM[slug]);
    const rec = {
      slug,
      domain: DOM[slug],
      startedAt,
      finishedAt: new Date().toISOString(),
      healthBefore: hBefore,
      healthAfter: hAfter,
      allGreen: steps.every((s) => s.ok),
      steps,
    };
    fs.writeFileSync(path.join(OUT, `${slug}.json`), JSON.stringify(rec, null, 1));
    console.log(
      `== ${slug} baseline ${rec.allGreen ? 'VERDE' : 'CON ROSSI'} · commit ${hAfter.commit} · marker scritto`
    );
    sleep(8000);
  }
})();
