/**
 * STEALTH BROWSER — Connessione al Chrome stealth sulla porta 9223
 * Usa: node stealth-browser.js <action> [args]
 *
 * Actions:
 *   list          — Lista pagine aperte
 *   open <url>    — Apri URL in nuova tab
 *   goto <url>    — Naviga nella tab corrente
 *   screenshot    — Cattura screenshot
 *
 * Prerequisito: Chrome lanciato con --remote-debugging-port=9223
 */

const http = require('http');

const CDP_PORT = 9223;

function cdpRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${CDP_PORT}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve(data); }
      });
    }).on('error', reject);
  });
}

async function main() {
  const action = process.argv[2] || 'list';
  const arg = process.argv[3] || '';

  try {
    if (action === 'list') {
      const pages = await cdpRequest('/json/list');
      pages.filter(p => p.type === 'page').forEach((p, i) => {
        console.log(`${i}: ${p.title} — ${p.url}`);
      });
    } else if (action === 'open') {
      const result = await cdpRequest(`/json/new?${encodeURIComponent(arg)}`);
      console.log(`Opened: ${result.url}`);
    } else if (action === 'version') {
      const v = await cdpRequest('/json/version');
      console.log(`Browser: ${v.Browser}`);
      console.log(`UserAgent: ${v['User-Agent']}`);
    } else {
      console.log('Usage: node stealth-browser.js [list|open <url>|version]');
    }
  } catch(e) {
    console.error('Error: Chrome not running on port ' + CDP_PORT);
    console.error('Launch with: chrome.exe --remote-debugging-port=9223 --disable-blink-features=AutomationControlled --user-data-dir="C:/Users/ftass/chrome-automation-profile"');
  }
}

main();
