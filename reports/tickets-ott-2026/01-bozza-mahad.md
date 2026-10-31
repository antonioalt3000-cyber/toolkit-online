# Bozza — Mahad Bajwa (mahad@asaan.io)

> ✅ **Pronta all'invio.** PR #77 mergiata e **live in produzione** (commit `37c3333`, 29 ott 2026 00:34 UTC). Verificato sul suo `synthetic-invoice-165.pdf` reale contro `https://parseflow.dev/api/v1/demo` in Auto-detect: `customer.email` = `""`, `vendor.email` corretta, scadenza dichiarata e totale $165 intatti. Ogni affermazione di questo testo è vera adesso.

- **To**: mahad@asaan.io
- **From**: hello@parseflow.dev (Brevo relay)
- **Subject**: Re: Supplier email appears as the customer email in ParseFlow
- **In risposta a**: thread Gmail `1a1792b6d04b5f13`, 26 ott 2026 17:04 UTC

---

Hi Mahad,

Thank you for the report, and sorry both for the bug and for the three days it took me to answer. You found a real one, and your PDF reproduced it on the first try.

**What was wrong**

Worse than it looked from the outside. Our extractor read the party labels — `From:`, `Bill To:` — only to pull out the _names_. For email and phone it ignored them completely and ran a single pattern across the whole document, taking the first match and assigning it to whichever party it happened to be building. So `vendor.email` and `customer.email` were always the same address, on every invoice, in every language. Your file made it obvious because it has exactly one email in it; on a document with two, the customer would have silently received the supplier's.

The 95% confidence was the second half of the problem. That score was counting how many fields came back non-empty, not whether they were right — and email didn't contribute to it at all, so duplicating one across both parties couldn't lower it. It now only credits fields we actually read next to their own label.

**What changed**

A contact detail is now taken only from the party's own block — the label line down to the next blank line, the other party's label, or the totals. If that block has no email, the field stays empty rather than borrowing one from elsewhere in the document. An empty field you can detect is worth more than a plausible wrong one you can't.

Two related gaps went with it: `address` and `taxId` were declared in the response and never populated at all, so those now work too.

On your `synthetic-invoice-165.pdf`:

```
vendor.email    billing@fictional-studio.example
customer.email  ""          ← was billing@fictional-studio.example
```

Your `$165` total, both party names and your labelled due date all still extract correctly — the due-date handling changed in the same release, so I checked specifically that a stated due date is still kept.

**On your offer**

Thank you — genuinely. I took you up on half of it: your case is now a regression test in our suite, so this particular bug can't come back without a build failing. I appreciate you finding this from the playground and writing it up properly rather than just closing the tab.

A call isn't necessary on my account, since this is resolved — but if you'd find one useful, I'm happy to.

Please re-run your file when you get a moment and tell me if anything still looks off.

Best regards,
Antonio Altomonte
Founder, DevToolsmith
hello@parseflow.dev
