# Bozze email — 3 ottobre 2026 (NON inviate: draft-first, invio solo su tuo «ok manda»)

> Invio previsto via Brevo dal mittente del prodotto, come per le email del 2 e del 10 agosto. Il connettore Gmail invierebbe da antonio.alt3000@gmail.com, cioè dal mittente sbagliato.

---

## 1. api.market — risposta all'accettazione dell'opzione 2 (CaptureAPI)

- **Da:** support@captureapi.dev
- **A:** hey@api.market
- **Oggetto:** Re: captureapi on api.market
- **Contesto:**
  - Il 30 settembre Shashank ha scritto due volte. Nella seconda conferma che il loro owner accetta «chiavi upstream separate per piano», cioè la nostra opzione 2.
  - Chiede la spec OpenAPI pubblica e la proposta di piani e tetti. Chiede anche di non mandare chiavi private via email.
  - Da parte nostra nessuna risposta: Brevo registra 0 invii verso hey@api.market negli ultimi 30 giorni.
- **Da decidere tu prima dell'invio:**
  1. Prezzi su api.market: la bozza ricalca il listino pubblico, ma la loro commissione è del 20%.
  2. La spec OpenAPI **non esiste ancora come file pubblico** (`/openapi.json` → 404). La bozza la promette «a breve»: va preparata prima o subito dopo l'invio.

```
Hi Shashank,

Thanks for confirming — dedicated keys per plan tier works on our side as it is today.
Every CaptureAPI key carries a plan with a hard monthly cap enforced server-side
(the API answers 429 RATE_LIMIT_EXCEEDED once the cap is reached), plus a
per-second limit, so each api.market tier maps cleanly onto one key.

Proposed tiers (same caps as our public plans):
- Starter — 2,000 captures / month
- Pro — 15,000 captures / month
- Business — 50,000 captures / month

Captures are PNG/JPEG/WebP screenshots, PDFs and OG images; the endpoint reference
is at https://captureapi.dev/docs. I'm finalising the OpenAPI 3.1 file and will
send it as a follow-up, so you can prepare the listing and test routing, quotas
and error handling before anything goes live.

Understood on both points: no private keys by email (I'll enter them in your
seller dashboard once the listing draft exists), and plan keys are not
per-consumer isolation — happy for the listing to say exactly that.

Best,
Antonio
CaptureAPI — captureapi.dev
```

---

## 2. quicksaasbrowser.com — HookLab (bassa priorità)

- **Da:** hello@gethooklab.dev
- **A:** james@quicksaasbrowser.com
- **Oggetto:** Re: HookLab included to our site
- **Contesto:**
  - Il 30 settembre ha scritto che HookLab è stato aggiunto alla loro directory «API Testing Tools» e chiede se può mandare l'URL per far verificare la scheda.
  - È il tipico aggancio da directory, che spesso porta a un listing a pagamento. Rispondere costa poco e una scheda corretta non fa danni; si può anche ignorare.

```
Hi James,

Thanks for listing HookLab. Sure, send the URL and I'll check the category and
details. For reference: HookLab is a webhook testing and inspection tool —
capture, inspect, replay and forward webhooks, verify Stripe/GitHub/Shopify
signatures — at https://gethooklab.dev.

Best,
Antonio
HookLab
```

---

## 3. Nessuna risposta necessaria

- **robca45@proton.me** (cliente LTD FixMyWeb), 1 ottobre: «Thanks alot». Il ticket di accesso è chiuso.
- **Spam dal 29 settembre** (letto via Chrome 9223): solo promozioni e truffe. Tra queste, «edward.tang@ygweb26.hi.cn — fixmyweb», la classica truffa della «registrazione del vostro brand in Cina», da ignorare. Nessun cliente né partner.
