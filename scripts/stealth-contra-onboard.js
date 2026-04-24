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
    await page.goto('https://contra.com/onboarding', { waitUntil: 'networkidle2', timeout: 30000 });
  }

  console.log('Page: ' + page.url());
  await page.screenshot({ path: 'C:/Users/ftass/toolkit-online/scripts/contra-onboard.png' });

  // Get all text content to understand the page
  const pageText = await page.evaluate(() => {
    return document.body.innerText.substring(0, 2000);
  });
  console.log('Page content:');
  console.log(pageText);

  // Find all buttons and inputs
  const elements = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, input, textarea, select, a[role="button"]'));
    return btns.map(el => ({
      tag: el.tagName,
      type: el.type || '',
      text: (el.textContent || '').trim().substring(0, 60),
      placeholder: el.placeholder || '',
      name: el.name || '',
      id: el.id || '',
      value: el.value || ''
    }));
  });
  console.log('\nInteractive elements:');
  elements.forEach(e => console.log(`  ${e.tag}[${e.type}] "${e.text || e.placeholder}" name=${e.name}`));

  console.log('Done.');
})().catch(e => console.error('Error:', e.message));
