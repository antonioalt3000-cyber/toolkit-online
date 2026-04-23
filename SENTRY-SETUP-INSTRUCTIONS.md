# Sentry Setup — Step-by-step (15 minuti totali)

> Stato: da fare dopo che hai il tempo. I 5 SaaS funzionano senza Sentry. Sentry aggiunge error tracking realtime (5000 errori/mese free, nessuna card richiesta).

## Perché Sentry

Oggi se un utente ha un errore su F3 checkout (pagamento), tu non lo sai. Vercel logs ritiene i log 1gg su Hobby / 7gg su Pro ma li devi andare a guardare manualmente. Sentry invece:
- Ti manda email/Discord **immediatamente** quando un utente ha un errore 500
- Raggruppa errori simili (non spam)
- Ti dà stack trace con source maps + breadcrumbs (step-by-step di cosa ha fatto l'utente prima del crash)
- Session replay (50/mese free) — vedi l'errore come lo ha visto l'utente

## Step 1 — Signup (2 min)

1. Apri https://sentry.io/signup/
2. Signup con `antonio.alt3000@gmail.com` (GitHub SSO OK)
3. Organization: `devtoolsmith` (o quello che preferisci)
4. Plan: **Developer** (free, 5k errors/mese)

## Step 2 — Crea 5 progetti (3 min)

Da Sentry dashboard → **Projects** → **Create Project**:

Per ognuno: Platform = **Next.js** | Alert frequency = "Alert me on every new issue"

| Nome progetto | Slug consigliato |
|---|---|
| CompliPilot | complipilot |
| AccessiScan | accessiscan |
| PaymentRescue | paymentrescue |
| ParseFlow | parseflow |
| CaptureAPI | captureapi |

Alla fine ti mostra il DSN per ogni progetto. Salva i 5 DSN (formato `https://xxx@oYYYY.ingest.sentry.io/ZZZ`).

## Step 3 — Env vars su Vercel (5 min)

Per ciascuno dei 5 progetti Vercel (Dashboard → progetto → Settings → Environment Variables):

Aggiungi (Production + Preview):
```
NEXT_PUBLIC_SENTRY_DSN=<il DSN del progetto corrispondente>
SENTRY_ORG=devtoolsmith
SENTRY_PROJECT=<slug del progetto>
SENTRY_AUTH_TOKEN=<genera da https://sentry.io/orgredirect/organizations/:orgslug/settings/auth-tokens/ con scope "project:releases">
```

## Step 4 — Install SDK (5 min, faccio io)

Una volta pronte le env vars, scrivimi "Sentry DSN ready" e io eseguo automaticamente:

```bash
# In ogni repo
npm install @sentry/nextjs

# Scaffolding con wizard (interactive): skippa se preferisci manuale
npx @sentry/wizard@latest -i nextjs
```

Il wizard crea:
- `sentry.server.config.ts`
- `sentry.client.config.ts`
- `sentry.edge.config.ts`
- Wrap `next.config.ts` con `withSentryConfig`

Tutto conditional su `NEXT_PUBLIC_SENTRY_DSN`: se l'env non è settato, Sentry è silenzioso (zero overhead).

## Step 5 — Verify (2 min)

Dopo il deploy:
1. Apri un qualsiasi SaaS in incognito
2. Forza un errore (naviga a `https://<saas>/api/does-not-exist`)
3. Controlla Sentry dashboard → dovrebbe apparire l'errore entro 60s

## Alert setup Sentry → Discord

Da Sentry → Settings → Integrations → Discord:
- Connect your Discord server (quello `DevToolsmith Ops`)
- Pick channel `#alerts-critical`
- Rule: "Alert me on every new issue in projects F1-F5"

Dopo questa integrazione, ogni errore nuovo → notification Discord istantanea.

## Quotas free tier (verifica mensile)

- 5000 errors/mese totali cross-org
- 10000 performance units/mese
- 50 session replays/mese
- 30gg retention

Con traffic basso stimato (<100 visite/giorno × 5 SaaS), vicino a 0% consumo. Attiva "spike protection" a 70% del limit da Settings → Subscription.
