// F1 CompliPilot /scan in a real browser. Oracles: (1) score arithmetic recomputed
// from the returned findings (critical -12, warning -4, info -1, clamp 0-100,
// overall = rounded mean of assessed categories, null = not applicable);
// (2) UI shows exactly the API numbers; (3) findings agree with facts read from
// the raw HTML fetched independently.
const fs = require('fs');
const { Journey, sleep } = require('../../qa-infra/cdp-journey.cjs');
const o = require('../../qa-infra/oracles.cjs');
const BASE = process.argv[2] || 'https://complipilot.dev';
const EV = 'C:/Users/ftass/toolkit-online/scratchpad/qa-26ott/evidence/f1';
const INPUT = 'input[aria-label="Website URL to scan for compliance"]';
const CATS = ['aiAct', 'gdpr', 'dataProtection', 'transparency', 'hipaa', 'ccpa', 'nis2'];

function recompute(res) {
  const exp = {};
  for (const c of CATS) {
    if (res.categoryScores[c] === null) {
      exp[c] = null;
      continue;
    }
    let s = 100;
    for (const i of res.issues.filter((x) => x.category === c))
      s -= i.severity === 'critical' ? 12 : i.severity === 'warning' ? 4 : 1;
    exp[c] = Math.max(0, Math.min(100, s));
  }
  const vals = Object.values(exp).filter((v) => typeof v === 'number');
  return { categories: exp, overall: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) };
}

async function scan(j, target) {
  await j.goto(`${BASE}/scan`);
  await j.type(INPUT, target);
  const respP = j.waitForResponse('/api/scan', 90000);
  await j.click('button[type="submit"]');
  const resp = await respP;
  let body = null;
  try {
    body = JSON.parse(resp.body.toString());
  } catch {
    /* non-json */
  }
  if (resp.status !== 200) return { target, status: resp.status, body };
  await j.waitFor('js:/Overall Compliance Score/.test(document.body.innerText)', {
    timeout: 20000,
  });
  await sleep(800);
  const ui = await j.eval(`(() => { const t = document.body.innerText;
    const circle = [...document.querySelectorAll('h2')].find(h => /Overall Compliance Score/.test(h.innerText));
    const overall = circle ? (circle.parentElement.innerText.match(/\b(\d{1,3})\b/) || [])[1] : null;
    const issuesCount = (t.match(/Issues Found \((\d+)\)/) || [])[1];
    return { overall: overall ? Number(overall) : null, issuesCount: issuesCount ? Number(issuesCount) : null }; })()`);
  return { target, status: 200, body, ui };
}

(async () => {
  const j = await Journey.open(`${BASE}/scan`);
  const out = [];
  for (const target of ['http://info.cern.ch/', 'https://toolkitonline.vip/']) {
    const r = await scan(j, target);
    const html = (await o.rawGet(target)).body.toString();
    const facts = {
      privacyLink: /href=["'][^"']*privac/i.test(html),
      cookieBanner:
        /cookie(consent|-consent|bot|yes|banner)|onetrust|iubenda|cookiebot|klaro/i.test(html),
      https: target.startsWith('https'),
    };
    fs.writeFileSync(
      `${EV}/prod-scan-${new URL(target).hostname}.json`,
      JSON.stringify(r.body, null, 2)
    );
    await j.screenshot(`${EV}/prod-scan-${new URL(target).hostname}.png`);
    if (r.status !== 200) {
      out.push({ target, status: r.status, error: JSON.stringify(r.body).slice(0, 200) });
      continue;
    }
    const rc = recompute(r.body);
    const catMismatch = CATS.filter((c) => rc.categories[c] !== r.body.categoryScores[c]);
    const privacyIssue = r.body.issues.filter(
      (i) =>
        /privacy (policy|notice)/i.test(i.title) &&
        /missing|no |not found|absent|lack/i.test(i.title + ' ' + i.description)
    );
    out.push({
      target,
      apiOverall: r.body.overallScore,
      oracleOverall: rc.overall,
      uiOverall: r.ui.overall,
      issues: r.body.issues.length,
      uiIssues: r.ui.issuesCount,
      catMismatch: catMismatch.join(',') || 'none',
      notApplicable: CATS.filter((c) => r.body.categoryScores[c] === null).join(',') || 'none',
      facts: JSON.stringify(facts),
      missingPrivacyFinding: privacyIssue.length,
      verdict:
        rc.overall === r.body.overallScore &&
        r.ui.overall === r.body.overallScore &&
        r.ui.issuesCount === r.body.issues.length &&
        !catMismatch.length &&
        (facts.privacyLink ? privacyIssue.length === 0 : privacyIssue.length > 0)
          ? 'PASS'
          : 'CHECK',
    });
  }
  // edge cases: empty, malformed, private address (must be refused, never scanned)
  const edges = [];
  for (const bad of [
    '',
    'not a url at all',
    'http://169.254.169.254/latest/meta-data/',
    'http://localhost:3000/',
  ]) {
    await j.goto(`${BASE}/scan`);
    await j.type(INPUT, bad);
    const before = j.responses.size;
    await j.click('button[type="submit"]');
    await sleep(3500);
    const scanResp = [...j.responses.values()]
      .slice(before)
      .find((x) => x.url.includes('/api/scan'));
    const err = await j.eval(`(document.querySelector('form p.text-red-600')||{}).innerText || ''`);
    const shownResult = await j.eval(`/Overall Compliance Score/.test(document.body.innerText)`);
    edges.push({
      input: bad || '(empty)',
      apiStatus: scanResp ? scanResp.status : 'no request',
      error: err.slice(0, 120),
      shownResult,
      ok: !shownResult,
    });
  }
  await j.viewport(375, 812, true);
  await j.goto(`${BASE}/scan`);
  const mobile = await j.overflowX();
  console.table(out);
  console.table(edges);
  console.log(
    'mobile /scan overflow:',
    JSON.stringify(mobile),
    '| report',
    JSON.stringify(j.report())
  );
  await j.close();
})().catch((e) => {
  console.error('ERR', e.stack);
  process.exitCode = 1;
});
