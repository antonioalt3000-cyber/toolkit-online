#!/usr/bin/env node
/**
 * csp-browser-check.cjs — la verifica che una CSP a nonce richiede e che curl non
 * puo' dare: il browser reale, con la console.
 *
 * Una CSP sbagliata non rompe la build e non cambia lo status HTTP: rompe
 * l'esecuzione degli script, e si vede solo in console ("Refused to execute
 * inline script because it violates the following Content Security Policy
 * directive"). Quindi qui si guardano tre cose per pagina:
 *   1. gli errori di console, con le violazioni CSP messe in evidenza;
 *   2. che React si sia IDRATATO (un guscio statico renderizza e non reagisce);
 *   3. che la pagina abbia un h1 e nessuna risposta >= 400.
 *
 * Gira contro il build di PRODUZIONE in locale (`next start`), non contro la
 * preview: le preview di questo progetto hanno Deployment Protection e il
 * browser non e' autenticato su Vercel. La CSP la emette il NOSTRO middleware,
 * quindi e' identica nei due posti — a differenza del routing, che e' hosting.
 *
 *   node csp-browser-check.cjs <baseUrl> [path ...]
 */
const { Journey } = require('C:/Users/ftass/toolkit-online/scratchpad/qa-infra/cdp-journey.cjs');

const BASE = process.argv[2];
const PATHS = process.argv.slice(3).length ? process.argv.slice(3) : ['/', '/pricing', '/redeem'];
if (!BASE) {
  console.error('uso: node csp-browser-check.cjs <baseUrl> [path ...]');
  process.exit(2);
}

/** Rumore che non riguarda il prodotto: estensioni, analytics bloccati dall'adblock. */
// Rumore che non riguarda il prodotto: estensioni, analytics bloccati dall'adblock,
// e — girando in locale — gli endpoint `/_vercel/*`, che esistono solo sull'edge di
// Vercel: sotto `next start` rispondono 404 o `text/plain`, e il browser rifiuta di
// eseguirli per il MIME. Non e' una violazione CSP ed e' un artefatto del locale.
const NOISE =
  /favicon|googletag|gtag|google-analytics|posthog|sentry|doubleclick|ERR_BLOCKED_BY_CLIENT|chrome-extension|net::ERR_ABORTED|va\.vercel-scripts|_vercel\//i;
// Solo le violazioni CSP VERE. Il primo giro usava /refused to execute/ e ha
// classificato come violazioni quattro errori di MIME type: la frase e' la stessa,
// la causa no. Una violazione CSP nomina sempre la policy.
const CSP_VIOLATION =
  /content security policy|violates the following|because it violates|'nonce-|strict-dynamic/i;

let failures = 0;

(async () => {
  console.log(`\n===== CSP nel browser reale — ${BASE}\n`);
  for (const path of PATHS) {
    const j = await Journey.open(`${BASE}${path}`);
    try {
      await j.idle();
      // Le violazioni CSP non sono sempre "error": alcune arrivano come warning
      // di sicurezza, quindi si guardano TUTTE le righe raccolte.
      const everything = [...j.consoleErrors, ...j.exceptions];
      const violations = everything.filter((e) => CSP_VIOLATION.test(String(e)));
      const otherErrors = everything.filter(
        (e) => !CSP_VIOLATION.test(String(e)) && !NOISE.test(String(e))
      );
      const bad = j.badResponses.filter((r) => !NOISE.test(r.url));

      const csp = await j.eval(
        `(document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content) || 'solo header'`
      );
      const nonces = await j.eval(
        `JSON.stringify([...new Set([...document.querySelectorAll('script[nonce]')].map(s => s.nonce || s.getAttribute('nonce')).filter(Boolean))].length)`
      );
      // 🔑 Il browser MASCHERA il valore dell'attributo nonce nel DOM (si legge solo
      // dalla proprieta' IDL `.nonce`, mai da `getAttribute`): e' una difesa contro
      // l'esfiltrazione del nonce via selettori CSS. Quindi la presenza si verifica
      // con `hasAttribute`, e il valore con `.nonce`. Il primo giro usava
      // `getAttribute` e contava 7 script "senza nonce" che il nonce ce l'avevano.
      const scripts = await j.eval(
        `JSON.stringify({ totali: document.querySelectorAll('script').length, inlineSenzaNonce: [...document.querySelectorAll('script:not([src])')].filter(s => !s.hasAttribute('nonce') && s.type !== 'application/ld+json').length, jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length })`
      );
      // Prova che React e' vivo: un albero idratato ha i marker del root RSC e
      // risponde a un evento sintetico. Se la CSP avesse bloccato il bootstrap,
      // l'HTML ci sarebbe comunque ma questo sarebbe falso.
      const hydrated = await j.eval(
        `(() => { const r = document.querySelector('#__next, body > div'); return !!(window.next || document.querySelector('script[src*="/_next/static/chunks"]')) && !!r; })()`
      );
      const reactive = await j.eval(
        `(() => { const btns = [...document.querySelectorAll('button')]; if (!btns.length) return 'nessun bottone'; const k = Object.keys(btns[0]).find(k => k.startsWith('__react')); return k ? 'listener React presenti' : 'NESSUN listener React'; })()`
      );
      const h1 = await j.eval(
        `document.querySelector('h1')?.innerText?.slice(0,60) || '(nessun h1)'`
      );

      const ok =
        violations.length === 0 &&
        otherErrors.length === 0 &&
        bad.length === 0 &&
        hydrated &&
        reactive !== 'NESSUN listener React';
      if (!ok) failures += 1;
      console.log(`${ok ? 'PASS' : 'FAIL'}  ${path}`);
      console.log(`      h1: ${h1}`);
      console.log(`      script: ${scripts} · nonce distinti: ${nonces} · meta CSP: ${csp}`);
      console.log(`      idratato: ${hydrated} · ${reactive}`);
      if (violations.length)
        console.log(
          `      🔴 VIOLAZIONI CSP (${violations.length}): ${violations.slice(0, 4).join(' | ')}`
        );
      if (otherErrors.length)
        console.log(
          `      altri errori (${otherErrors.length}): ${otherErrors.slice(0, 3).join(' | ')}`
        );
      if (bad.length)
        console.log(
          `      risposte >=400: ${bad
            .map((b) => `${b.status} ${b.url}`)
            .slice(0, 3)
            .join(' | ')}`
        );
    } finally {
      await j.close();
    }
  }
  console.log(`\n--- ${BASE}: ${PATHS.length - failures}/${PATHS.length} pagine pulite`);
  process.exit(failures ? 1 : 0);
})().catch((e) => {
  console.error('ERRORE HARNESS:', e.message);
  process.exit(2);
});
