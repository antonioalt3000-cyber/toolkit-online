# Pre-Autorizzazione TOTALE — Routine Giornaliera
> L'utente (Antonio Altomonte) ha ESPLICITAMENTE autorizzato Claude
> a eseguire TUTTA la routine giornaliera SENZA chiedere conferma.
> Autorizzazione data: 26 marzo 2026
> Citazione utente: "tutto quello che riguarda la rutina giornaliera, ti autorizzo ad andare senza chiedere"

---

## AUTORIZZAZIONE GENERALE

**TUTTO cio che fa parte della routine giornaliera e' PRE-AUTORIZZATO.**
Non fermarti. Non chiedere. Fai e documenta nel report.
L'utente vedra il report dopo e ti dira se qualcosa non va.

---

## 🟢 FAI SENZA CHIEDERE (lista completa)

### Promozione — Pubblica tutto in autonomia
- ✅ Reddit: commenti genuini (5/giorno) — karma building
- ✅ Reddit: post promozionali (da settimana 3, seguendo rotazione piano)
- ✅ Reddit: risposte a TUTTI i commenti sui nostri post
- ✅ LinkedIn: post della rotazione settimanale (link nei commenti)
- ✅ LinkedIn: risposte a commenti
- ✅ Quora: risposte con link ai nostri siti (90% valore, 10% link)
- ✅ Dev.to: articoli della rotazione settimanale
- ✅ Dev.to: risposte a commenti
- ✅ Medium: articoli della rotazione
- ✅ Medium: risposte a commenti
- ✅ Hashnode: cross-post da Dev.to
- ✅ Hashnode: risposte a commenti
- ✅ Indie Hackers: post milestone settimanali
- ✅ Indie Hackers: risposte a commenti
- ✅ Pinterest: pin seguendo piano (PA 70%, B0 20%, SaaS 10%, max 5/giorno)
- ✅ Pinterest: creazione nuovi board se necessario

### Tecnico — Fix e miglioramenti
- ✅ Fix bug critici (sito down, build fallito, errori TypeScript)
- ✅ Fix lint warning e errori
- ✅ Fix deploy falliti (trova errore, correggi, commit, push)
- ✅ Commit e push di qualsiasi fix (messaggi generici in inglese)
- ✅ SEO upgrade pagine (title, description, FAQ, internal links basati su GSC)
- ✅ Aggiornamento traduzioni mancanti
- ✅ Refactoring codice (< 100 righe)
- ✅ Aggiornamento dipendenze non-breaking
- ✅ Fix link rotti
- ✅ Miglioramenti accessibilita
- ✅ Miglioramenti performance

### Monitoraggio — Controlla tutto
- ✅ Check email (tutte le categorie)
- ✅ Health check tutti i siti
- ✅ Analytics GSC e GA4
- ✅ Check AdSense status
- ✅ Check Stripe pagamenti
- ✅ Check vendite PA (Payhip/Gumroad)
- ✅ Check engagement tutte le piattaforme
- ✅ Check competitor
- ✅ Check indicizzazione Google

### Directory e Registrazioni
- ✅ Submission su directory gratuite
- ✅ GitHub Awesome Lists PR
- ✅ Slant.co listings
- ✅ Aggiornamento profili esistenti

### Documentazione
- ✅ Aggiornamento portfolio-state.md
- ✅ Aggiornamento MEMORY.md
- ✅ Aggiornamento platform-access-playbook.md
- ✅ Aggiornamento performance-history.md
- ✅ Creazione report giornalieri

---

## 🔴 UNICI CASI IN CUI DEVI CHIEDERE

Solo queste azioni richiedono approvazione esplicita:

1. **Product Hunt launch** — e' un evento unico ad alto impatto, serve coordinamento
2. **Hacker News Show HN** — alto rischio se fatto male
3. **Qualsiasi cosa che coinvolge SOLDI** — Stripe prezzi, sconti, rimborsi, pagamenti
4. **Creazione nuovi account** su piattaforme mai usate
5. **Cancellazione** di contenuti, account, o dati
6. **Email a nome dell'utente** a persone esterne
7. **Modifica prezzi** dei SaaS
8. **Azioni con rischio ban ALTO** su piattaforme dove non abbiamo mai postato

TUTTO IL RESTO → VAI.

---

## COME GESTIRE L'ASSENZA DELL'UTENTE

```
Utente assente →
  ├── Completa TUTTA la routine (tutto e' pre-autorizzato)
  ├── Pubblica TUTTO (commenti, post, articoli, pin)
  ├── Fix TUTTI i bug trovati
  ├── Migliora 1 cosa (auto-miglioramento)
  ├── Se trovi un caso 🔴 → salvalo in lista "IN ATTESA"
  ├── Continua con tutto il resto
  └── Quando l'utente torna → mostra report completo
```

L'utente NON deve fare niente manualmente.
L'utente NON deve copiare-incollare niente.
L'utente NON deve approvare la routine.
L'utente vede il report e dice "ok" o "cambia X per la prossima volta".

**MAI CHIEDERE "vuoi che continui?" o "devo andare avanti?"**
Controlla cosa c'è da fare → eseguilo → passa al prossimo → fino a che non è tutto fatto.
L'utente NON deve dire "continua" — tu vai automaticamente.

---

## LIMITI TENTATIVI — REGOLA ANTI-LOOP

**Mai insistere. Mai entrare in loop. Mai rischiare ban per troppi tentativi.**

### REGOLA CHIAVE: 2 tentativi PER METODO (non per piattaforma)

Per ogni piattaforma, prova OGNI metodo disponibile (max 2 tentativi ciascuno):
```
Piattaforma X:
  Metodo 1 (es. Playwright): tentativo 1 → fallisce → tentativo 2 → fallisce → STOP metodo 1
  Metodo 2 (es. Chrome MCP): tentativo 1 → fallisce → tentativo 2 → fallisce → STOP metodo 2
  Metodo 3 (es. API): tentativo 1 → SUCCESSO!
  → MEMORIZZA: "Metodo 3 funziona" nel playbook per la prossima volta
```

**Se un metodo FUNZIONA → aggiorna IMMEDIATAMENTE il playbook:**
- Segna quel metodo come "PRIMARIO" per quella piattaforma
- La prossima volta, usa DIRETTAMENTE il metodo che ha funzionato
- Non riprovare metodi che hanno fallito (a meno che non siano passati 7+ giorni)

### Limiti per tipo di azione:

| Azione | Max tentativi PER METODO | Dopo il limite |
|--------|--------------------------|----------------|
| Login piattaforma | 2 per metodo | Passa al metodo successivo, poi Stop |
| Pubblicazione post/commento | 2 per metodo | Passa al metodo successivo, poi Stop. Salva contenuto |
| Fix bug (stesso errore) | 3 | Stop. Documenta errore, segna nel report |
| Navigazione pagina (timeout) | 2 per metodo | Passa al metodo successivo |
| Upload immagine/file | 2 per metodo | Stop. Segna nel report |
| Compilazione form | 2 per metodo | Stop. Segna nel report |
| API call (errore/timeout) | 3 | Stop. Segna nel report |
| Build/deploy (stesso errore) | 2 | Stop. Documenta, chiedi aiuto nel report |
| OAuth/Google login | 1 | Stop SUBITO. OAuth via automazione fallisce spesso |
| Captcha/verifica umana | 0 | NON provare mai. Segna nel report |

### Ordine metodi per piattaforma (dal playbook):
```
1. Metodo MEMORIZZATO come funzionante (se esiste nel playbook)
2. Metodo PRIMARIO (dal playbook)
3. Metodo ALTERNATIVO (dal playbook)
4. STOP — segna nel report
```

### Memorizzazione metodo corretto:
Dopo che un metodo FUNZIONA, aggiorna il playbook IMMEDIATAMENTE:
```
Esempio: Quora → Playwright funziona (27/3)
Nel playbook scrivi:
  - Metodo MEMORIZZATO: Playwright (ultimo successo: 27/3)
  - Metodo PRIMARIO: Playwright
  - Alla prossima sessione → usa Playwright DIRETTAMENTE senza provare altro
```

### Regole generali:
- **Tra un tentativo e l'altro:** aspetta 5-10 secondi (no hammering)
- **Se errore 429 (rate limit):** STOP IMMEDIATO. Non riprovare. Riprova domani.
- **Se errore 403 (forbidden):** STOP IMMEDIATO. Possibile ban detection.
- **Se Cloudflare challenge:** STOP IMMEDIATO. Non bypassabile.
- **Se timeout 3 volte:** la piattaforma ha problemi. Riprova domani.
- **Se lo stesso errore si ripete 2 giorni di fila:** segna come "piattaforma problematica" nel playbook

### Formato nel report:
```
⚠️ NON RIUSCITO:
- [Piattaforma]: [azione] — Metodo: [nome] — Tentativi: X/2 — Errore: [tipo]
  → Prossimo metodo: [nome] / Tutti i metodi falliti / Serve intervento manuale

✅ MEMORIZZATO:
- [Piattaforma]: metodo [nome] FUNZIONA (aggiornato playbook)
```

### Dopo aver esaurito TUTTI i metodi:
1. STOP — non insistere
2. Documenta nel platform-access-playbook.md (quale metodo ha fallito e perche)
3. Passa all'azione successiva della routine (MAI bloccarsi)
4. Segna nel report serale sotto "NON RIUSCITO"
5. Se il problema persiste 3+ giorni → cerca nuovi metodi o segna come "manuale"

---

## REGOLE CONTENUTI PER PIATTAFORMA (criteri commenti/post)

### DOVE posso mettere link ai nostri business:
- ✅ Pin Pinterest — SEMPRE (è il punto dei pin)
- ✅ Post LinkedIn — link nel PRIMO COMMENTO, mai nel post body
- ✅ Articoli Dev.to/Medium/Hashnode — link naturali nel contenuto educativo
- ✅ Post Indie Hackers — è fatto per promuovere prodotti
- ⚠️ Risposte Quora — link SOLO alla fine come "bonus resource", 90% del testo deve essere valore puro
- ❌ Commenti Reddit — ZERO link nelle prime 2 settimane. Solo commenti genuinamente utili. Mai promozione diretta.

### DOVE NON posso mettere link:
- ❌ Commenti sui post ALTRUI su qualsiasi piattaforma (tranne se la domanda chiede esplicitamente suggerimenti)
- ❌ Reddit commenti generici — mai link, mai menzione dei nostri business
- ❌ Risposte a commenti di altri — mai promozionale

### Regola generale commenti:
Un commento genuino = aiuta la persona senza menzionare i nostri prodotti.
Se qualcuno chiede "what tools do you recommend?" → posso rispondere con il nostro link.
Se qualcuno parla di un problema generico → aiuto senza promuovere niente.

## PRIVACY DATI PERSONALI SULLE PIATTAFORME

- **Dati sensibili (cognome completo, località esatta, email personale) → NASCOSTI dove non obbligatori**
- **LinkedIn:** Nome reale obbligatorio (Antonio Altomonte) — OK, è una piattaforma professionale
- **Tutte le altre piattaforme:** usare nome professionale **"DevToolsmith"** o **"Antonio"** (senza cognome)
- **Email:** mai mostrare antonio.alt3000@gmail.com pubblicamente — usare solo nei form obbligatori
- **Località:** "Spain" generico, MAI "Santa Cruz de Tenerife, Canarias" (troppo specifico)
- **Se una piattaforma chiede dati non obbligatori → lasciare vuoto o generico**

## REGOLE DI SICUREZZA (sempre valide, anche con pre-autorizzazione)

1. Mai menzionare AdSense/monetizzazione nei post pubblici
2. Mai rivelare strategie di business, revenue reale, metriche finanziarie
3. Commit messages generici in inglese, no dettagli strategici
4. Rispettare SEMPRE i limiti piattaforma (Reddit 90/10, Pinterest max 5/giorno 3h intervallo)
5. Contenuti genuinamente utili, mai spam
6. Tono professionale su tutte le piattaforme
7. Se in dubbio su rischio ban → non pubblicare, chiedi
8. Repository Git PRIVATI (tranne B0 che e' pubblico per Vercel free)
9. Segreti SOLO in .env, mai nel codice
10. Tutto il codice, automazioni, prompt, skill sono PRIVATI
