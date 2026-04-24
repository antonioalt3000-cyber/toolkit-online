const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9223',
    defaultViewport: null
  });

  const pages = await browser.pages();
  let page = pages.find(p => p.url().includes('contra.com'));

  if (!page) {
    page = await browser.newPage();
    await page.goto('https://contra.com/onboarding', { waitUntil: 'domcontentloaded', timeout: 20000 });
  }

  console.log('URL: ' + page.url());

  // Get page text
  const text = await page.evaluate(() => document.body?.innerText?.substring(0, 1500) || 'empty').catch(() => 'error');
  console.log('TEXT: ' + text.substring(0, 800));

  // Click "Get paid" / "Share work" button if visible
  const result = await page.evaluate(() => {
    const allEls = document.querySelectorAll('button, div[role="button"], a');
    const found = [];
    for (const el of allEls) {
      const t = (el.textContent || '').trim();
      if (t.length > 0 && t.length < 80) found.push(t);
      // Click "Get paid" or "Share work" or "Sell products"
      if (t.toLowerCase().includes('get paid') || t.toLowerCase().includes('sell') || t.toLowerCase().includes('share work')) {
        el.click();
        return 'CLICKED: ' + t;
      }
    }
    return 'Buttons: ' + found.slice(0, 10).join(' | ');
  }).catch(e => 'Error: ' + e.message);

  console.log('RESULT: ' + result);

  // Wait and check new state
  await new Promise(r => setTimeout(r, 3000));
  console.log('NEW URL: ' + page.url());

  const newText = await page.evaluate(() => document.body?.innerText?.substring(0, 500) || '').catch(() => '');
  console.log('NEW TEXT: ' + newText.substring(0, 300));

  console.log('DONE');
})().catch(e => console.error('ERR:', e.message));
