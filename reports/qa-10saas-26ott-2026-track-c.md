# QA 26 ott 2026 — Traccia C (EmailGuard, SEOScope, HeaderShield, HookLab, CardForge) — PARZIALE

> Interrotta per **limite d'uso raggiunto**. Nessun fix applicato, nessuna PR aperta, nessun deploy. Prove dettagliate in `scratchpad/qa-26ott/evidence/<eg|seo|hsh|hkl>/checks-*.json` (passo → atteso → osservato) con gli screenshot. Script riusabili in `scratchpad/qa-26ott/track-c/` (`lib.cjs`, `audit-public.cjs`, `prod-eg/hsh/seo/hkl.cjs`).

## Fatto (produzione, browser Chrome 9223, oracoli indipendenti)

| SaaS                | Esito         | Cosa è stato verificato                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EmailGuard          | 21/21         | 6 indirizzi (gmail, dominio inesistente, mailinator, info@, `john..doe@`, null MX di example.com): segnali = DNS-over-HTTPS indipendente; punteggio e stato = rubrica ricalcolata (85/10/40/70/0/10); badge e punteggio a schermo coerenti; `a@@b` e il campo vuoto bloccati dalla validazione nativa senza chiamate API                                                                                                                          |
| HeaderShield        | 24/24         | demo su github.com (B 75), toolkitonline.vip (B 73), headershield.dev (A+ 95), w3.org (D 48): voce per voce uguale al mio grader indipendente sugli header scaricati a parte; /simulate con 4 blocchi calcolati a mano (5 F, 100 A+, 37 E con arrotondamento da 36.5, 48 D); SSRF (169.254.169.254, localhost, file://) rifiutato con 400                                                                                                         |
| SEOScope            | 15/15         | audit di toolkitonline.vip (81), pagina W3C BAD (63), github.com (69): punteggio = Σ peso×stato/Σ peso; title, description, h1, canonical, viewport e alt delle immagini uguali al mio parser HTML (alt 6/42 corretto: l'immagine in `<noscript>` e `alt=""` non contano); share link /r/… mostra lo stesso punteggio; SSRF rifiutato con 422                                                                                                     |
| HookLab             | 19/19         | endpoint anonimo creato dalla UI (gethooklab.dev, 7 giorni); POST/GET reali catturati: corpo identico byte per byte (unicode incluso), header e query corretti; il valore `v1=` della firma Stripe è oscurato a schermo per scelta (`redaction.ts`); lo share oscura `Authorization`; verify-signature con chiave creator: Stripe/GitHub/Shopify validi = true, 1 byte manomesso, segreto sbagliato o timestamp scaduto = false; senza chiave 401 |
| Pagine pubbliche ×5 | 8 pagine/sito | 0 errori console, 0 eccezioni, 0 risposte ≥400, nessun overflow a 375 px                                                                                                                                                                                                                                                                                                                                                                          |

## Difetti trovati (confermati, NON ancora corretti)

1. **"Get free key" sotto AA nel tema light**: HeaderShield 4.15:1, HookLab 4.24:1. EmailGuard (13.14), SEOScope (6.74/7.55) e CardForge (5.49) passano. Causa radice: testo fisso `text-[#06070d]` su `bg-[var(--brand)]`, che nel tema light è più scuro (HSH #0a75c2). Stesso difetto su altri bottoni brand, per esempio "Grade these headers" su /simulate. Fix suggerito: un token `--on-brand` (scuro nel tema dark, bianco nel light: bianco su #0a75c2 = 4.84:1) al posto del colore fisso.
2. **EmailGuard, card del demo**: con una sintassi non valida (`john..doe@gmail.com`) mostra "MX records ✕" anche se gmail.com ha MX. Quel controllo non è stato eseguito ma appare come fallito. Va mostrato come "non controllato" quando `checks.syntax` è false. Impatto basso.

## Falsi allarmi chiariti (bug del mio harness, non dei prodotti)

Selettore della card EmailGuard; campo `detail` della risposta SEOScope; redirect 308 di toolkitonline.vip→/en non seguito; conteggio alt (noscript, alt vuoto); rilevamento del tema durante la transizione CSS; regex `\bPOST\b` sulla riga dell'inspector HookLab. Nessuna anomalia di prodotto.

## Da fare (non coperto)

- CardForge: playground in produzione (template e dimensioni: 1080², 1280×720, 1500×500, 1584×396, 1200×630; titolo lungo, unicode e vuoto; hex non valido).
- Locale (`qa26-eg/seo/hsh/hkl/cfg`): signup, email di benvenuto, quota, redeem, checkout, webhook, guasto Redis e delete.
- Fix 1 e 2 qui sopra, più il controllo og:image (HSH 5 pagine e gli altri 4 repo), con PR, CI, merge, deploy e nuova verifica in browser.
- Suite `vitest` + `tsc` + lint per i 5 repo, confrontate con le baseline (EG 569, SEO 796, HSH 749, HKL 875, CFG 717).
