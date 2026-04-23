# GDPR + Privacy Compliance Audit — 5 SaaS EU Portfolio

> **Data audit:** 23 aprile 2026  
> **Auditor:** Claude (sessione angry-chandrasekhar)  
> **Scope:** F1 CompliPilot, F2 AccessiScan, F3 ChurnGuard (PaymentRescue), F4 ParseFlow (DocuMint), B7 CaptureAPI  
> **Base legale primaria:** GDPR (Reg. UE 2016/679) + ePrivacy Directive (2002/58/EC) + Italian/Spanish DPA guidance  
> **Metodologia:** static code analysis, Glob/Grep su 5 repo Next.js, review privacy/terms/cookie/DPA esistenti

---

## 1. Matrice Compliance (18 × 5)

Legenda: OK = conforme | PART = parziale/incompleto | FAIL = assente/violazione | N/A = non applicabile

| # | Requisito GDPR | F1 CompliPilot | F2 AccessiScan | F3 ChurnGuard | F4 ParseFlow | B7 CaptureAPI |
|---|---|---|---|---|---|---|
| 1 | Privacy Policy pubblicata | OK | OK | OK | OK | OK |
| 2 | Cookie consent banner granulare (Art. 7) | OK | OK | OK | OK | OK |
| 3 | Terms of Service | OK | OK | OK | OK | OK |
| 4 | DPA pubblico | FAIL | FAIL | FAIL | OK (`/dpa`) | FAIL |
| 5 | Endpoint `/api/user/delete` (Art. 17) | FAIL | FAIL | FAIL | FAIL | FAIL |
| 6 | Endpoint `/api/user/export` (Art. 20) | FAIL | FAIL | FAIL | FAIL | FAIL |
| 7 | UI deletion nel dashboard | FAIL | FAIL | FAIL | FAIL | FAIL |
| 8 | Data retention esplicita + cron cleanup | PART | PART | PART | PART (90gg cache) | PART |
| 9 | Data minimization (input validation) | OK | OK | OK | OK | OK |
| 10 | PII scrubbing in logs | PART | PART | PART | PART | PART |
| 11 | Lista sub-processors in privacy | PART | PART | PART | OK | PART |
| 12 | Data transfer SCC (Art. 44-49) | PART | PART | PART | PART | PART |
| 13 | Procedura breach notification (Art. 33) | FAIL | FAIL | FAIL | FAIL | FAIL |
| 14 | Marketing consent opt-in esplicito | N/A | N/A | N/A | N/A | N/A |
| 15 | Age gate <16 (GDPR default) | FAIL | FAIL | FAIL | FAIL | FAIL |
| 16 | TLS 1.2+ / security headers | OK | OK | OK | OK | OK |
| 17 | Vercel region EU (no `vercel.json regions`) | FAIL | FAIL | FAIL | FAIL | FAIL |
| 18 | RoPA (Art. 30) + DPIA (Art. 35) | FAIL | FAIL | FAIL | FAIL (richiesto!) | FAIL |

**Totali OK/18**: F1=6, F2=6, F3=6, F4=8, B7=6  
**FAIL critici (fines risk)**: endpoint DSAR (Art. 17/20), DPIA F4 (Art. 35 obbligatorio), region Vercel (Art. 44), breach procedure (Art. 33), age gate (Art. 8).

---

## 2. Findings Critici per Severità

### SEV 1 — CRITICI (risk fines fino a 4% fatturato globale / €20M)

**F-01. Diritti DSAR non eseguibili via self-service** (applica a tutti e 5)  
Violazione: Art. 15 (accesso), 17 (cancellazione), 20 (portabilità). Privacy policy dichiara "you can exercise your rights" ma NON esistono `/api/user/delete`, `/api/user/export`, UI dashboard. Gestione oggi = manuale via email supporto = non scalabile, rischio sforare i 30 giorni.  
**Impatto**: se un utente EU richiede cancellazione e owner è in ferie/offline, si sfora facilmente il limite. Multa fino a €20M o 4% fatturato.

**F-02. F4 ParseFlow: DPIA assente per special-category data processing**  
F4 processa documenti che possono contenere "special category data" (Art. 9 — salute, dati finanziari di identificazione, dati biometrici via foto ID). Retention 90gg extracted data. Art. 35 GDPR impone DPIA per processing su larga scala di categorie speciali.  
**Impatto**: DPAs europei (Garante IT, AEPD ES, CNIL FR) possono bloccare il servizio se customer enterprise chiede evidenza DPIA prima di firmare contratto. Multa amministrativa.

**F-03. Vercel region default US (iad1) — cross-border transfer senza SCC esplicite**  
Nessun `vercel.json` dei 5 SaaS contiene `regions: ["fra1"]` o altra region EU. Default = iad1 (Washington D.C.). Traffic EU user → processing server US senza data transfer impact assessment documentato. Schrems II richiede SCC + TIA (Transfer Impact Assessment).  
**Impatto**: Privacy policy F1 dice "Vercel: EU data processing" = FALSO. Rischio complaint utente + rettifica + sanzione per informazione falsa (Art. 13). F-03 è critico per F1 che vende compliance (conflitto d'interesse pubblico reputazionale).

**F-04. Nessuna procedura breach notification documentata**  
Art. 33: notifica DPA entro 72h + Art. 34 utenti se high-risk. Nessun playbook nei 5 repo (`SECURITY.md`, `INCIDENT-RESPONSE.md` inesistenti). Credential leak Brevo 17/4 (documented in CLAUDE.md) è un tentativo di incidente non seguito da procedure formali.  
**Impatto**: se breach reale, improvvisazione = sanzione per inadeguatezza (Art. 32).

### SEV 2 — ALTI (risk reputazionale + multe fino a 2%)

**F-05. Age gate <16 assente**  
GDPR Art. 8: consent valido solo >16 (IT/DE/SE/NL) o >13-15 (ES/FR con variazioni). Nessun terms dei 5 SaaS vieta esplicitamente signup minori. Nessuna verifica età al registration.  
**Impatto**: processing dati minore senza consenso genitoriale = invalid consent = processing illecito (Art. 6).

**F-06. Lista sub-processors incompleta in privacy**  
F1/F2/F3/B7 menzionano genericamente Stripe + Vercel + Upstash ma NON dichiarano: Brevo (email transactional), Resend (F3), Clerk (se usato), Cloudflare (se CDN). Art. 28 impone trasparenza completa.  
**Azione**: popolare lista completa + link privacy di ciascuno + dichiarare paese processing.

**F-07. PII potenzialmente in logs Vercel**  
F1 scan route raccoglie `x-forwarded-for` IP per rate-limiting (`redis KEYS.userByIp`). IP è PII (GDPR Recital 30). F3 webhook Stripe logga customer ID + invoice ID. Vercel function logs conservano 1gg (Hobby) / 7gg (Pro) = processing non documentato in privacy.  
**Azione**: hash IP prima storage (sha256(ip + salt)), o dichiara in privacy che IP è raccolto per 30gg.

**F-08. No data retention policy concreta + no cron cleanup**  
Privacy policies dicono generico "as long as your account is active". Nessun cron job trovato che cancella scan/extraction/screenshot dopo N giorni (tranne F3 dunning). F4 dichiara 90gg cache ma nessun codice `EXPIRE` visibile in `lib/usage.ts`.  
**Azione**: implementare TTL Redis esplicito (`SETEX key 7776000 value` = 90gg) + cron weekly cleanup DB.

### SEV 3 — MEDI

**F-09. Cookie banner accetta solo English** (tutti e 5)  
Target EU multilingue ma banner solo inglese. EU Commission guidance: consent in lingua utente.  
**Azione**: i18n del banner almeno IT/ES/FR/DE.

**F-10. CSP permissive `'unsafe-inline'` script-src**  
Tutti e 5 hanno `script-src 'self' 'unsafe-inline'`. Sicurezza accettabile ma non best-practice 2026 (nonce-based preferito). Non è GDPR violation ma aumenta attack surface (breach probability).

**F-11. `Access-Control-Allow-Origin: *` su F4 API**  
`/api/v1/:path*` risponde CORS wildcard. OK per API B2B pubblica, ma dichiarare esplicitamente in privacy.

---

## 3. Minimum Viable Privacy Pack (prima del primo utente pagante)

Obiettivo: essere "defensibly compliant" — non perfetto, ma difendibile in caso di reclamo DPA. Priorità 1-10 (1 = fare subito, entro 48h).

**Priority 1 — Blockers commerciali**
1. `/api/user/delete` endpoint: chiama `redis DEL user:{id} *` + invalida sessione + email confirm. Logga soft-delete per 30gg (GDPR consente grace period anti-fraud).
2. `/api/user/export` endpoint: ritorna JSON con tutti i campi `user:{id}`, `scans:{id}`, `extractions:{id}`. Content-Type `application/json` + `Content-Disposition: attachment`.
3. UI dashboard: button "Delete my account" + "Export my data" con modal confirm.
4. Popolare lista sub-processors completa nelle 5 privacy pages. Rimuovere asserzione falsa "Vercel EU data processing" in F1.
5. Configurare `vercel.json` con `regions: ["fra1"]` (Frankfurt) per tutti e 5. Primary region EU = zero transfer per utenti EU.

**Priority 2 — Fondamenta compliance**
6. Template `SECURITY.md` breach response: chi notifica DPA, template email utenti, timeline 72h.
7. F4 ONLY: DPIA documento scritto (Art. 35 template CNIL free) per document processing. Pubblicare versione summary su `/dpia`.
8. Terms update: clausola "The Service is not intended for users under 16. By registering you confirm you are 16+".
9. Cookie banner i18n minimo EN/IT/ES/FR/DE.
10. Redis TTL esplicito su tutti i key utente-generated (`SETEX 7776000` = 90gg default).

---

## 4. Template Privacy Policy — Outline 10 Capitoli

Adattabile a ciascun SaaS sostituendo `{SITE_NAME}`, `{CONTROLLER_LEGAL}`, `{PROCESSING_PURPOSES}`.

1. **Data Controller Identity** — nome, contatto, paese residence (SP/IT). DPO contact se applicabile.
2. **Categories of Personal Data Collected** — enumerare: account (email), usage (URLs/documents/scans), technical (IP, user-agent), payment (Stripe PII), cookie (solo con consent).
3. **Legal Basis (Art. 6)** — contract, consent, legitimate interest, legal obligation per ciascuna categoria.
4. **Purposes of Processing** — purpose limitation esplicita per ogni lawful basis.
5. **Sub-processors (Art. 28)** — lista completa con link privacy ciascuno + regione processing + DPA link.
6. **International Transfers (Art. 44-49)** — SCC modules, adequacy decisions, esplicita eventuali transfer US con TIA reference.
7. **Retention Periods** — tabella key → TTL giorni: account attivo = lifetime, scans = 90gg, logs = 30gg, payment = 10 anni (legge tributaria).
8. **Data Subject Rights (Art. 15-22)** — 6 diritti con modalità self-service + email fallback + response time 30gg.
9. **Cookies & Tracking** — lista cookie con finalità + durata + granularità consent.
10. **Security of Processing (Art. 32)** — TLS, encryption at rest, access control, regular security reviews, breach notification 72h.

**Appendix**: Children (Art. 8), automated decision-making (Art. 22), changes to policy, contact/complaints + DPA locale link.

---

## 5. Template Cookie Banner Minimale (HTML + JS)

Implementazione consent-gated. Default deny + Google Consent Mode v2. Già esistente in F1 (`CookieConsent.tsx`) come reference — replicare negli altri 4 se non identico.

```jsx
// components/CookieConsent.tsx (self-contained, no deps)
"use client";
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "site-cookie-consent";
type Consent = { essential: true; analytics: boolean; advertising: boolean };

function updateGtag(c: Consent) {
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: c.analytics ? "granted" : "denied",
      ad_storage: c.advertising ? "granted" : "denied",
      ad_user_data: c.advertising ? "granted" : "denied",
      ad_personalization: c.advertising ? "granted" : "denied",
    });
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);
  const [c, setC] = useState<Consent>({ essential: true, analytics: false, advertising: false });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) { const p = JSON.parse(stored); setC(p); updateGtag(p); }
    else setVisible(true);
  }, []);

  const save = useCallback((n: Consent) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(n));
    updateGtag(n); setC(n); setVisible(false);
  }, []);

  if (!visible) return null;
  return (
    <div role="dialog" aria-label="Cookie preferences" className="fixed bottom-0 inset-x-0 z-50 bg-white border-t p-6">
      {/* layout + 3 buttons: Accept All / Essential Only / Customize */}
      {/* se details=true: 3 checkbox (essential disabled) */}
    </div>
  );
}
```

**Critical bits per GDPR compliance:**
- Default: analytics/advertising = `denied` (GDPR Art. 7: consent must be active opt-in).
- `essential` = always on, disabled checkbox (legitimate interest).
- Button "Essential Only" visibile e con pari dignità rispetto "Accept All" (no dark pattern — CNIL 2022 guideline).
- Consent revocabile in qualunque momento (link footer `/cookies` o button "Manage preferences").
- Storage in localStorage con versioning (`consent-v2`) per forzare re-consent dopo changes materiali.
- Nessun cookie analytics/ads caricato prima della scelta (Google Consent Mode v2 gestisce questo automaticamente).

**GTM integration (layout.tsx):**
```html
<Script id="gtag-default" strategy="beforeInteractive">{`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied',
    wait_for_update: 500
  });
`}</Script>
```

---

## 6. Checklist Pre-Launch (15 punti, ordine priorità)

Ogni item: esito binario GO/NO-GO. Fino a tutti-GO = non lanciare commercialmente.

| # | Azione | Owner | Stima | Blocker? |
|---|---|---|---|---|
| 1 | Config `vercel.json` region `fra1` su 5 SaaS + redeploy | dev | 30min | YES |
| 2 | Implementare `/api/user/delete` + `/api/user/export` (5 SaaS) | dev | 4h | YES |
| 3 | UI dashboard delete/export button (5 SaaS) | dev | 2h | YES |
| 4 | Privacy policy: popolare sub-processors completi + fix "Vercel EU" F1 | writer | 1h | YES |
| 5 | F4 DPIA scritto (template CNIL) + pubblicato `/dpia` | owner | 3h | YES |
| 6 | Terms: clausola under-16 ban + age checkbox signup | dev+writer | 1h | YES |
| 7 | Redis TTL esplicito su chiavi user-generated (5 SaaS) | dev | 2h | YES |
| 8 | Cookie banner i18n EN/IT/ES/FR/DE (5 SaaS) | dev | 2h | NO |
| 9 | `SECURITY.md` breach response playbook + contact Garante/AEPD | owner | 1h | YES |
| 10 | RoPA document (Art. 30) per ciascun SaaS — anche 1 pagina | owner | 2h | NO |
| 11 | IP hashing in rate-limit Redis keys (sha256+salt) | dev | 1h | NO |
| 12 | DPA link in footer tutti i SaaS (non solo F4) | dev | 30min | NO |
| 13 | Verifica Brevo DPA signed (account: `antonio.alt3000@gmail.com`) | owner | 15min | NO |
| 14 | Verifica Upstash region (`informed-pony-79407` = US o EU?) | owner | 15min | YES |
| 15 | Garante IT or AEPD ES data controller registration | owner | 30min | NO |

**Items YES (blocker) = 9.** Lavoro stimato totale: ~16h. Fattibile in 2 giorni focused.

---

## 7. Risk Exposure Summary

- **Current state**: portfolio "defensibly compliant" al 40% circa. 5 privacy policies + cookie banner fanno 60% del lavoro ma self-service DSAR assente = rischio strutturale.
- **Se primo utente EU paga oggi e apre ticket "delete my account" e owner offline 30gg**: violazione Art. 12(3) = sanzione fino a €20M o 4% fatturato.
- **F4 senza DPIA**: qualsiasi customer enterprise legalmente informato rifiuterà di firmare contratto. Deal-breaker commerciale.
- **F1 conflict-of-interest**: "compliance scanner" che non è esso stesso compliant = reputation bomb se un competitor scrive un thread Reddit. Risolvere PRIMA di lancio PH.

**Raccomandazione finale**: blocker items 1-7, 9, 14 = 12-16h lavoro tecnico. Farli PRIMA di accettare primo pagamento Stripe LIVE. Monetizzazione zero-cost tier già attiva → nessun urgency finanziaria a skip compliance.

---

## 8. Next Actions (cronologia esecuzione suggerita)

**Giorno 1 (4h)**:
- [ ] Config `vercel.json regions fra1` × 5 → push → redeploy
- [ ] Verifica Upstash region (dashboard Upstash login)
- [ ] Fix privacy F1 "Vercel EU data processing" claim

**Giorno 2 (8h)**:
- [ ] Scaffold `/api/user/delete` + `/api/user/export` comune (copy tra 5)
- [ ] UI dashboard delete/export modal (5 SaaS)
- [ ] Terms update under-16 clause + signup checkbox

**Giorno 3 (4h)**:
- [ ] F4 DPIA template CNIL compilato + publish `/dpia`
- [ ] SECURITY.md breach response
- [ ] Popolare lista sub-processors completa × 5 privacy
- [ ] Commit + push su 5 repo

**Then**: flip `STRIPE_LIVE_MODE=true` con coscienza pulita.

---

**Audit completato. File salvato per reference lanci futuri.**
