const { Journey } = require('./cdp-journey.cjs');
(async () => {
  for (const u of [
    'https://complipilot.dev/',
    'https://example.com/',
    'https://www.w3.org/WAI/demos/bad/before/home.html',
    'https://github.com/',
  ]) {
    const j = await Journey.open(u);
    console.log(
      u,
      '->',
      JSON.stringify((await j.eval('document.title')).slice(0, 60)),
      JSON.stringify(j.report().badResponses.slice(0, 2))
    );
    await j.close();
  }
})();
