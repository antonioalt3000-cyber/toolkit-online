# RUN LEDGER — Omni-QA 10 SaaS (4-5 nov 2026)

> Rigenerato da `node progress.cjs table`. Non modificare a mano: la fonte e'
> `run-events.jsonl`. Legenda: ✅ fatto · ❌ fallito · ⏳ in corso · ⚠️ con riserva · — non applicabile.

| SaaS                     | M0-realign | M2-scan | M3-fix | M3-gate | M3-pr | M3-deploy | M4-journey | M4-teardown |
| ------------------------ | ---------- | ------- | ------ | ------- | ----- | --------- | ---------- | ----------- |
| **CompliPilot** (`f1`)   |            | ✅      | ✅     | ✅      | ✅    | ✅        | ✅         |             |
| **FixMyWeb** (`f2`)      |            | ⚠️      | ✅     | ✅      | ✅    | ✅        | ✅         |             |
| **PaymentRescue** (`f3`) |            | ✅      | ✅     | ✅      | ✅    | ✅        | ✅         |             |
| **ParseFlow** (`f4`)     |            | ✅      | ✅     | ✅      | ✅    | ✅        | ✅         |             |
| **CaptureAPI** (`b7`)    |            | ✅      | —      |         |       |           | ✅         | ⚠️          |
| **CardForge** (`cfg`)    |            | ✅      | ✅     | ✅      | ✅    | ✅        | ✅         | ⚠️          |
| **EmailGuard** (`eg`)    |            | ✅      |        | ✅      | ✅    | ✅        | ✅         | ⚠️          |
| **HeaderShield** (`hsh`) |            | ✅      | ✅     | ✅      | ✅    | ✅        | ✅         | ⚠️          |
| **HookLab** (`hkl`)      |            | ✅      |        | ✅      | ✅    | ✅        | ✅         | ⚠️          |
| **SEOScope** (`seo`)     |            | ✅      |        | ✅      | ✅    | ✅        | ✅         | ⚠️          |

**Chiavi Redis scritte in produzione e da rimuovere nel teardown: 11** (`REDIS-WRITES.jsonl`)

## Ultimi eventi

- `11-04 23:50` **f4** M3-deploy ✅ — prod: backslash-500 0, og:image completo (verificato con la sonda che l'aveva trovato)
- `11-04 23:50` **cfg** M3-pr ✅ — cardforge#51 5a4211d mergiata
- `11-04 23:50` **cfg** M3-deploy ✅ — prod: backslash-500 0, og:image completo (verificato con la sonda che l'aveva trovato)
- `11-04 23:50` **eg** M3-pr ✅ — emailguard#56 23368ba mergiata
- `11-04 23:50` **eg** M3-deploy ✅ — prod: backslash-500 0, og:image completo (verificato con la sonda che l'aveva trovato)
- `11-04 23:50` **hkl** M3-pr ✅ — hooklab#59 3bc195a mergiata
- `11-04 23:50` **hkl** M3-deploy ✅ — prod: backslash-500 0, og:image completo (verificato con la sonda che l'aveva trovato)
- `11-04 23:50` **seo** M3-pr ✅ — seoscope#62 c97fe92 mergiata
- `11-04 23:50` **seo** M3-deploy ✅ — prod: backslash-500 0, og:image completo (verificato con la sonda che l'aveva trovato)
- `11-04 23:50` **b7** M3-fix — — immune al backslash: 0/39 pagine colpite, nessun fix necessario
- `11-04 23:50` **cfg** M4-journey ✅ — giro pubblico 6/6 PASS nel browser reale
- `11-04 23:50` **eg** M4-journey ✅ — giro pubblico 6/6 PASS nel browser reale
- `11-04 23:50` **hsh** M4-journey ✅ — giro pubblico 6/6 PASS nel browser reale
- `11-04 23:50` **hkl** M4-journey ✅ — giro pubblico 6/6 PASS nel browser reale
- `11-04 23:50` **seo** M4-journey ✅ — giro pubblico 6/6 PASS nel browser reale
- `11-04 23:50` **f1** M4-journey ✅ — giro pubblico 6/6 PASS nel browser reale
- `11-04 23:50` **f2** M4-journey ✅ — giro pubblico 6/6 PASS nel browser reale
- `11-04 23:50` **f3** M4-journey ✅ — giro pubblico 6/6 PASS nel browser reale
- `11-04 23:50` **f4** M4-journey ✅ — giro pubblico 6/6 PASS nel browser reale
- `11-04 23:50` **b7** M4-journey ✅ — giro pubblico 6/6 PASS nel browser reale
- `11-04 23:50` **f1** M3-gate ✅ — lint 0 err, tsc pulito, 951 test/69 file (base 944/68), build verde
- `11-04 23:50` **f2** M3-gate ✅ — lint 0 err, tsc pulito, 670 test/64 file (base 663/63), build verde
- `11-04 23:50` **f3** M3-gate ✅ — lint 0 err, tsc pulito, 678 test/65 file (base 672/64), build verde
- `11-04 23:50` **f4** M3-gate ✅ — lint 0 err, tsc pulito, 687 test/62 file (base 676/61), build verde
- `11-04 23:50` **cfg** M3-gate ✅ — lint 0 err, typecheck pulito, 735 test/70 file (base 729/69), build verde
- `11-04 23:50` **eg** M3-gate ✅ — lint 0 err, typecheck pulito, 599 test/61 file (base 580/60), build verde
- `11-04 23:50` **hkl** M3-gate ✅ — lint 0 err, typecheck pulito, 884 test/73 file (base 878/72), build verde
- `11-04 23:50` **seo** M3-gate ✅ — lint 0 err, typecheck pulito, 821 test/65 file (base 801/65), build verde
- `11-05 00:17` **cfg** M3-fix ✅ — coupon-stats esclude i coupon interni dai totali partner; errore della rotta non piu' occultato
- `11-05 05:02` **f1** M3-fix ✅ — CSP a nonce: via unsafe-inline da script-src; verificata nel browser reale in produzione
- `11-05 05:02` **f2** M3-fix ✅ — CSP a nonce: via unsafe-inline da script-src; verificata nel browser reale in produzione
- `11-05 05:02` **f3** M3-fix ✅ — CSP a nonce: via unsafe-inline da script-src; verificata nel browser reale in produzione
- `11-05 05:02` **f4** M3-fix ✅ — CSP a nonce: via unsafe-inline da script-src; verificata nel browser reale in produzione
- `11-05 05:02` **eg** M4-teardown ⚠️ — coupon-stats ora separa i coupon interni: i nostri riscatti non falsano piu' i numeri partner
- `11-05 05:02` **hsh** M4-teardown ⚠️ — coupon-stats ora separa i coupon interni: i nostri riscatti non falsano piu' i numeri partner
- `11-05 05:02` **hkl** M4-teardown ⚠️ — coupon-stats ora separa i coupon interni: i nostri riscatti non falsano piu' i numeri partner
- `11-05 05:02` **seo** M4-teardown ⚠️ — coupon-stats ora separa i coupon interni: i nostri riscatti non falsano piu' i numeri partner
- `11-05 05:02` **b7** M4-teardown ⚠️ — coupon-stats ora separa i coupon interni: i nostri riscatti non falsano piu' i numeri partner
- `11-05 05:02` **cfg** M4-teardown ⚠️ — coupon-stats ora separa i coupon interni: i nostri riscatti non falsano piu' i numeri partner
- `11-05 05:02` **f4** M3-deploy ✅ — prod: indirizzo fornitore corretto + CSP a nonce + backslash; 3/3 pagine pulite nel browser
