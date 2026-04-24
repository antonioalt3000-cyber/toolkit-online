const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9223',
    defaultViewport: null
  });

  // Get the Contra page that's already open
  const pages = await browser.pages();
  let page = pages.find(p => p.url().includes('contra.com'));

  if (!page) {
    console.log('Contra page not found, opening new one...');
    page = await browser.newPage();
    await page.goto('https://contra.com/sign-up', { waitUntil: 'networkidle2', timeout: 30000 });
  }

  console.log('On page: ' + page.url());

  // Wait for Cloudflare turnstile to complete
  console.log('Waiting for Cloudflare check...');
  await new Promise(r => setTimeout(r, 5000));

  // Find the Google button by searching all clickable elements
  const clicked = await page.evaluate(() => {
    const elements = document.querySelectorAll('button, a, div[role="button"]');
    for (const el of elements) {
      const text = (el.textContent || '').toLowerCase();
      if (text.includes('google') || text.includes('continua con g')) {
        el.click();
        return 'Clicked: ' + el.textContent.trim();
      }
    }
    return 'NOT FOUND';
  });

  console.log('Result: ' + clicked);

  if (clicked !== 'NOT FOUND') {
    // Wait for Google popup
    console.log('Waiting for Google OAuth popup...');
    await new Promise(r => setTimeout(r, 5000));

    const allPages = await browser.pages();
    console.log('Total pages open: ' + allPages.length);
    for (const p of allPages) {
      const url = p.url();
      console.log('  Page: ' + url.substring(0, 80));
      if (url.includes('accounts.google.com')) {
        console.log('  >>> Found Google OAuth page!');
        await p.screenshot({ path: 'C:/Users/ftass/toolkit-online/scripts/contra-google.png' });

        // Check if it shows account selection or auto-login
        const content = await p.content();
        if (content.includes('antonio.alt3000') || content.includes('Elegir una cuenta') || content.includes('Choose an account')) {
          console.log('  >>> Account selection page! Clicking account...');
          // Click the account
          const selected = await p.evaluate(() => {
            const items = document.querySelectorAll('[data-email], [data-identifier], li, div[role="link"]');
            for (const item of items) {
              const text = (item.textContent || '');
              if (text.includes('antonio') || text.includes('alt3000')) {
                item.click();
                return 'Selected: ' + text.trim().substring(0, 50);
              }
            }
            // Try clicking first account
            const firstAccount = document.querySelector('ul li, div[data-authuser]');
            if (firstAccount) {
              firstAccount.click();
              return 'Clicked first account';
            }
            return 'No account found';
          });
          console.log('  >>> ' + selected);
        }
      }
    }

    // Wait for redirect back to Contra
    await new Promise(r => setTimeout(r, 8000));

    // Check final state
    const finalPages = await browser.pages();
    for (const p of finalPages) {
      if (p.url().includes('contra.com')) {
        console.log('Contra final URL: ' + p.url());
        await p.screenshot({ path: 'C:/Users/ftass/toolkit-online/scripts/contra-final.png' });
        const title = await p.title();
        console.log('Contra title: ' + title);
      }
    }
  }

  console.log('Done.');
})().catch(e => console.error('Error:', e.message));
