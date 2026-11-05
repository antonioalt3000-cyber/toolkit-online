#!/usr/bin/env node
/**
 * diag-redeem.cjs — perche' il bottone di /redeem non ha mandato la POST?
 *
 *   node diag-redeem.cjs <dominio>
 *
 * Guarda quello che vedrebbe un utente: i campi si riempiono davvero? il bottone
 * e' abilitato? dopo il click parte una richiesta? compare un errore a schermo?
 */
const {
  Journey,
  sleep,
} = require('C:/Users/ftass/toolkit-online/scratchpad/qa-infra/cdp-journey.cjs');

const DOM = process.argv[2];
const CODE = process.argv[3] || 'QAOCT-0000-0000';
const EMAIL = process.argv[4] || 'antonio.alt3000+diag@gmail.com';

(async () => {
  const j = await Journey.open('https://' + DOM + '/redeem');
  try {
    await j.idle();

    const before = await j.eval(`(() => {
      const c = document.querySelector('#redeem-code');
      const e = document.querySelector('#redeem-email');
      const b = document.querySelector('button[type=submit]');
      return {
        code: !!c, email: !!e, button: !!b,
        buttonText: b ? b.textContent.trim().slice(0, 40) : null,
        buttonDisabled: b ? b.disabled : null,
        formCount: document.querySelectorAll('form').length,
      };
    })()`);
    console.log('prima:', JSON.stringify(before));

    await j.type('#redeem-code', CODE);
    await j.type('#redeem-email', EMAIL);

    const filled = await j.eval(`(() => {
      const c = document.querySelector('#redeem-code');
      const e = document.querySelector('#redeem-email');
      const b = document.querySelector('button[type=submit]');
      return { codeValue: c ? c.value : null, emailValue: e ? e.value : null, buttonDisabled: b ? b.disabled : null };
    })()`);
    console.log('dopo il riempimento:', JSON.stringify(filled));

    await sleep(2000);
    await j.click('button[type=submit]');
    await sleep(6000);

    const posts = [];
    for (const r of j.responses.values()) {
      if (/redeem/.test(r.url)) posts.push(r.status + ' ' + r.url);
    }
    console.log('richieste che toccano redeem:', posts.length ? posts.join(' | ') : 'NESSUNA');

    const after = await j.eval(`(() => {
      const err = document.querySelector('[role=alert], #redeem-error');
      const b = document.querySelector('button[type=submit]');
      return {
        errore: err ? err.textContent.trim().slice(0, 160) : null,
        buttonDisabled: b ? b.disabled : null,
        testo: document.body.innerText.replace(/\\s+/g, ' ').slice(0, 200),
      };
    })()`);
    console.log('dopo il click:', JSON.stringify(after));
    console.log('errori console:', j.consoleErrors.slice(0, 3).join(' | ') || 'nessuno');
  } finally {
    await j.close();
  }
})().catch((e) => {
  console.error('ERRORE:', e.message);
  process.exit(1);
});
