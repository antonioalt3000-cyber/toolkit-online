# Bozza — correzione listing OCR (invio del fondatore)

> ⚠️ **Questa la mandi tu.** I rapporti con DealFuel e DealMirror sono tuoi: io non scrivo ai partner.
> Si può inviare **subito**: non dipende da nessun deploy, è una correzione di copy.

Due destinatari, stesso contenuto con il nome del listing cambiato:

- **DealFuel** — `deals@dealfuel.com` (Andy Pena) → listing _ParseFlow_
- **DealMirror** — `pratyush@dealmirror.com` → listing _ParseFlow_

**Subject**: ParseFlow listing — correction to the OCR line (our error)

---

Hi [Andy / Pratyush],

I need to correct something in the ParseFlow listing, and the mistake is ours.

The listing states that ParseFlow handles OCR for scanned documents and images. It does not. There is no OCR engine in the product — not disabled, not gated behind a tier, simply not there. Image files and scanned PDFs without a text layer are rejected with an HTTP 422 on every plan. ParseFlow extracts structured data from documents that already contain selectable text: PDF, DOCX and XLSX.

This came from marketing copy we supplied to you, so please don't take it as a reporting error on your side. I've corrected our source copy today.

A customer bought on the strength of that line and got in touch this week. I've answered him directly and offered a full refund. I'd rather fix the listing now than have it happen again.

Could you update these points, whichever appear on your page:

- Remove "OCR for scanned documents" and "Both native text PDFs and scanned/image PDFs (OCR)".
- The feature-comparison row "OCR support — Yes" on all tiers should read **No** on all tiers, or be removed.
- Remove the FAQ line about the OCR engine supporting "major Latin-script languages", and any related roadmap claim about non-Latin scripts.
- Where the input formats are described, the accurate wording is: _"Text-based PDF, DOCX and XLSX. The document must contain selectable text; scanned images are not supported."_

Everything else in the listing stands: invoice, receipt and contract extraction, batch processing, webhooks, custom templates, and the response envelope in six languages are all real and shipping.

Happy to send you a clean replacement block for the whole description if that's easier than editing line by line.

Sorry for the extra work.

Best regards,
Antonio Altomonte
DevToolsmith

---

## Contesto per te (non va nell'email)

La promessa è partita da noi, non è un'invenzione del partner. Fonte, ora corretta con archive pattern:

| File                                                                  | Righe                             |
| --------------------------------------------------------------------- | --------------------------------- |
| `~/shared-memory/dealmirror-materials.md`                             | 362, 369, 377, 388, 405, 417, 504 |
| `~/shared-memory/mrr-listing-submission-pack.md`                      | 68-71                             |
| `~/shared-memory/saas-distribution-assets/FOUNDER-POST-PACK-09jul.md` | 841                               |

C'è anche una bozza del **3 lug 2026** (`bozza-pratyush-parseflow-tier1-fix-3lug-2026.md`) in cui chiedevamo a Pratyush di **ripubblicare** i bullet Tier 1, e la lista che gli abbiamo passato includeva "OCR for scanned documents". Quindi il bullet non è vecchio: lo abbiamo riconfermato quattro mesi fa.

Il repo del prodotto è invece **pulito**: nega l'OCR correttamente in 34 punti ed è stato bonificato il 22 ago (`lib/constants.ts:67-70` documenta la rimozione di "Multi-language OCR (50+ languages)"). Il guardiano anti-promessa cammina sul repo e **non copre `shared-memory`** — è esattamente da lì che la frase è sopravvissuta.
