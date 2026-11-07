# RUN LEDGER — Omni-QA 10 SaaS (4-5 nov 2026)

> Rigenerato da `node progress.cjs table`. Non modificare a mano: la fonte e'
> `run-events.jsonl`. Legenda: ✅ fatto · ❌ fallito · ⏳ in corso · ⚠️ con riserva · — non applicabile.

| SaaS                     | M0-realign | M2-scan | M3-fix | M3-gate | M3-pr | M3-deploy | M4-journey | M4-teardown |
| ------------------------ | ---------- | ------- | ------ | ------- | ----- | --------- | ---------- | ----------- |
| **CompliPilot** (`f1`)   |            |         |        |         |       |           |            |             |
| **FixMyWeb** (`f2`)      |            |         |        |         |       |           |            |             |
| **PaymentRescue** (`f3`) |            |         |        |         |       |           |            |             |
| **ParseFlow** (`f4`)     |            |         |        |         |       |           |            |             |
| **CaptureAPI** (`b7`)    |            |         |        |         |       |           |            |             |
| **CardForge** (`cfg`)    |            | ⏳      |        |         | ✅    | ✅        | ✅         |             |
| **EmailGuard** (`eg`)    |            |         |        |         | ✅    | ✅        | ✅         |             |
| **HeaderShield** (`hsh`) |            |         |        |         | ✅    | ✅        | ✅         |             |
| **HookLab** (`hkl`)      |            |         |        |         | ✅    | ✅        | ✅         |             |
| **SEOScope** (`seo`)     |            |         |        |         | ✅    | ✅        | ✅         |             |

**Chiavi Redis scritte in produzione e da rimuovere nel teardown: 50** (`REDIS-WRITES.jsonl`)

## Ultimi eventi

- `11-07 01:00` **f4** A-core-matrix ❌ — matrice fatture 73/88: 4 difetti di prodotto (migliaia a spazio, PL IVA=totale, NL zeri, nota di credito senza segno) + numero fattura in 5 lingue
- `11-07 01:02` **eg** M3-deploy ✅ — mergiata e live (health commit); matrice --prod: rifiuti con causa vera, zero scritture
- `11-07 01:02` **hsh** M3-deploy ✅ — mergiata e live (health commit); matrice --prod: rifiuti con causa vera, zero scritture
- `11-07 01:02` **hkl** M3-deploy ✅ — mergiata e live (health commit); matrice --prod: rifiuti con causa vera, zero scritture
- `11-07 01:02` **seo** M3-deploy ✅ — mergiata e live (health commit); matrice --prod: rifiuti con causa vera, zero scritture
- `11-07 01:03` **cfg** M3-deploy ✅ — PR #57 mergiata 46d07e7, live; R16/S08 prod ok
- `11-07 01:04` **b7** A-dims ✅ — viewport 320..3840 PNG esatti, byte=Content-Length, 13 parametri ostili -> 400 con messaggio; 34/34
- `11-07 01:07` **f4** A-fix-pr ⏳ — documint#89 aperta (estrattore EU): gate lint0/tsc0/719 test/build ok; CI in corso
- `11-07 01:11` **f1** A-edge ✅ — 10 URL ostili 4xx, vuota/404 senza NaN, determinismo ok (12/12)
- `11-07 01:11` **f2** A-edge ✅ — da browser con controllo positivo: 14/14 (la prova anonima era vacua: 403 del gate)
- `11-07 01:14` **f4** A-fix-pr ✅ — documint#89 mergiata, prod f27e164, matrice 91/91 (da 15 rossi), core 12/12, pubblico 6/6, sweep 31 pagine; residuo lineItems con migliaia a spazio
- `11-07 01:25` **cfg** M3-deploy ✅ — chart fix mergiato e live; suite 5/5 verde sui commit finali
- `11-07 01:25` **eg** M3-deploy ✅ — chart fix mergiato e live; suite 5/5 verde sui commit finali
- `11-07 01:25` **hsh** M3-deploy ✅ — chart fix mergiato e live; suite 5/5 verde sui commit finali
- `11-07 01:25` **hkl** M3-deploy ✅ — chart fix mergiato e live; suite 5/5 verde sui commit finali
- `11-07 01:25` **seo** M3-deploy ✅ — chart fix mergiato e live; suite 5/5 verde sui commit finali
- `11-07 01:47` **f1** A-local-round ✅ — giro locale prod-build+mock: checkout->price id esatto, webhook firmato/falso, Redis giu' 503 senza logout (17-18 check, 0 rossi)
- `11-07 01:47` **f2** A-local-round ✅ — giro locale prod-build+mock: checkout->price id esatto, webhook firmato/falso, Redis giu' 503 senza logout (17-18 check, 0 rossi)
- `11-07 01:47` **f4** A-local-round ⚠️ — giro locale 17/18: checkout con Redis giu' -> 500 (non 503): fix in corso
- `11-07 01:47` **b7** A-local-round ⚠️ — giro locale 16/17: checkout con Redis giu' -> 500 (non 503): fix in corso
- `11-07 01:50` **cfg** M4-journey ✅ — B: riscatto reale prod 5/5, matrice successo prod 8/8, casi limite core in produzione
- `11-07 01:50` **eg** M4-journey ✅ — B: riscatto reale prod 5/5, matrice successo prod 8/8, casi limite core in produzione
- `11-07 01:50` **hsh** M4-journey ✅ — B: riscatto reale prod 5/5, matrice successo prod 8/8, casi limite core in produzione
- `11-07 01:50` **hkl** M4-journey ✅ — B: riscatto reale prod 5/5, matrice successo prod 8/8, casi limite core in produzione
- `11-07 01:50` **seo** M4-journey ✅ — B: riscatto reale prod 5/5, matrice successo prod 8/8, casi limite core in produzione
- `11-07 06:52` **f4** A-fix-final ✅ — documint#89,#90,#91,#92 mergiate; prod c6f6728; matrice 130/130 (righe incluse); baseline f4 VERDE; locale 18/18
- `11-07 06:52` **b7** A-fix-final ✅ — capture-api#114 mergiata; prod 1945ec8; locale 17/17; baseline b7 VERDE
- `11-07 06:52` **f2** A-fix-final ✅ — accessiscan#90 mergiata; prod 946e843; copy banner+privacy verificata nel browser 6/6; locale 18/18
- `11-07 06:52` **f3** A-fix-final ✅ — churnguard#88 mergiata; prod 80afb41; verifica sul vivo 5/5
- `11-07 06:52` **f1** A-fix-final ✅ — nessun difetto di prodotto trovato; locale 17/17; edge 12/12
- `11-07 06:56` **cfg** M3-deploy ✅ — checkout Redis-outage 503 mergiato e live; giro locale 36/36
- `11-07 06:56` **eg** M3-deploy ✅ — checkout Redis-outage 503 mergiato e live; giro locale 36/36
- `11-07 06:56` **hsh** M3-deploy ✅ — checkout Redis-outage 503 mergiato e live; giro locale 36/36
- `11-07 06:56` **hkl** M3-deploy ✅ — checkout Redis-outage 503 mergiato e live; giro locale 36/36
- `11-07 06:56` **seo** M3-deploy ✅ — checkout Redis-outage 503 mergiato e live; giro locale 36/36
- `11-07 07:03` **cfg** M4-journey ✅ — B finale: suite 5/5 verde sui commit finali; FINDINGS.md aggiornato
- `11-07 07:03` **eg** M4-journey ✅ — B finale: suite 5/5 verde sui commit finali; FINDINGS.md aggiornato
- `11-07 07:03` **hsh** M4-journey ✅ — B finale: suite 5/5 verde sui commit finali; FINDINGS.md aggiornato
- `11-07 07:03` **hkl** M4-journey ✅ — B finale: suite 5/5 verde sui commit finali; FINDINGS.md aggiornato
- `11-07 07:03` **seo** M4-journey ✅ — B finale: suite 5/5 verde sui commit finali; FINDINGS.md aggiornato
