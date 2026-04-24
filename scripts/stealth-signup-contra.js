const puppeteer = require('puppeteer-core');

(async () => {
  console.log('Connecting to stealth Chrome on port 9223...');
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9223',
    defaultViewport: null
  });

  console.log('Connected! Opening Contra signup...');
  const page = await browser.newPage();

  // Patch webdriver
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  await page.goto('https://contra.com/sign-up', { waitUntil: 'networkidle2', timeout: 30000 });
  console.log('Page loaded: ' + page.url());

  // Take screenshot to see what we got
  await page.screenshot({ path: 'C:/Users/ftass/toolkit-online/scripts/contra-signup.png' });
  console.log('Screenshot saved to contra-signup.png');

  // Get page title
  const title = await page.title();
  console.log('Title: ' + title);

  // Find and click "Continue with Google"
  try {
    const googleBtn = await page.waitForSelector('button:has-text("Continue with Google"), button:has-text("Google")', { timeout: 10000 });
    if (googleBtn) {
      console.log('Found Google button, clicking...');

      // Listen for new page (popup)
      const [popup] = await Promise.all([
        new Promise(resolve => browser.once('targetcreated', async target => {
          const p = await target.page();
          resolve(p);
        })),
        googleBtn.click()
      ]);

      if (popup) {
        console.log('Google popup opened: ' + popup.url());
        await popup.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
        console.log('Popup final URL: ' + popup.url());

        // Check if we're already logged in (auto-redirect) or need to select account
        const popupContent = await popup.content();
        if (popupContent.includes('myaccount') || popupContent.includes('consent')) {
          console.log('Google session detected! May need to select account or consent...');
          await popup.screenshot({ path: 'C:/Users/ftass/toolkit-online/scripts/contra-google-popup.png' });
        }
      }
    }
  } catch(e) {
    console.log('Google button not found or error: ' + e.message);
    // Try finding by xpath or other selectors
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      console.log('Button found: ' + text.trim().substring(0, 50));
    }
  }

  // Don't disconnect - keep browser open
  console.log('Done. Browser stays open.');
})().catch(e => console.error('Error:', e.message));
