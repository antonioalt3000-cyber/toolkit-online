// FixMyWeb contrast checker in a real browser vs the WCAG formula (oracles.cjs).
const { Journey, sleep } = require('../../qa-infra/cdp-journey.cjs');
const o = require('../../qa-infra/oracles.cjs');
const BASE = process.argv[2] || 'https://fixmyweb.dev';
const EV = 'C:/Users/ftass/toolkit-online/scratchpad/qa-26ott/evidence/f2';
const FG = 'input[aria-label="Foreground color hex value"]';
const BG = 'input[aria-label="Background color hex value"]';
const CASES = [
  ['#000000', '#ffffff'],
  ['#767676', '#ffffff'],
  ['#777777', '#ffffff'],
  ['#000', '#fff'],
  ['#777', '#fff'],
  ['#636363', '#1a1a1a'],
  ['#3b82f6', '#1e293b'],
  ['#ffffff', '#ffffff'],
  ['#949494', '#ffffff'],
];
const expectChips = (r) =>
  [r >= 4.5, r >= 3, r >= 7, r >= 4.5].map((p) => (p ? 'PASS' : 'FAIL')).join(',');
(async () => {
  const j = await Journey.open(`${BASE}/tools/contrast-checker`);
  await j.waitFor(FG);
  const rows = [];
  for (const [fg, bg] of CASES) {
    await j.type(FG, fg);
    await j.type(BG, bg);
    await sleep(400);
    const ui = await j.eval(`(() => {
      const label = [...document.querySelectorAll("div")].find((e) => (e.textContent || "").trim() === "Contrast Ratio");
      const ratio = label ? (label.parentElement.textContent.match(/(\d+\.\d+):1/) || [])[1] : null;
      const chips = [...document.querySelectorAll("[role=status]")].map((e) => e.textContent.trim()).join(",");
      const t = document.body.innerText;
      const sm = t.match(/suggest[^#]{0,80}(#[0-9a-fA-F]{6})/i);
      return { ratio, chips, suggestion: sm ? sm[1] : null };
    })()`);
    const r = o.contrastRatio(fg, bg);
    const sugRatio = ui.suggestion ? o.contrastRatio(ui.suggestion, bg) : null;
    rows.push({
      fg,
      bg,
      oracle: r.toFixed(2),
      ui: ui.ratio,
      ratioOk: ui.ratio === r.toFixed(2),
      chips: ui.chips,
      chipsOk: ui.chips === expectChips(r),
      suggestion: ui.suggestion || '-',
      suggestionMeets45:
        sugRatio === null
          ? r >= 4.5
            ? 'n/a'
            : 'MISSING'
          : sugRatio >= 4.5
            ? `yes ${sugRatio.toFixed(2)}`
            : `NO ${sugRatio.toFixed(2)}`,
    });
  }
  await j.screenshot(`${EV}/contrast-${new URL(BASE).hostname}.png`);
  console.table(rows);
  console.log('report', JSON.stringify(j.report()));
  await j.close();
})().catch((e) => {
  console.error('ERR', e.message);
  process.exitCode = 1;
});
