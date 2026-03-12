---
name: auto-grow
description: Automatically suggests and creates new high-volume tools when a session starts
user-invocable: true
---

## Auto-Grow: espandi automaticamente il sito

Controlla quanti tool ci sono attualmente nel progetto, confronta con la lista di tool ad alto volume da creare, e proponi all'utente di crearne di nuovi.

### Tool ad alto volume da aggiungere (in ordine di priorità):
1. compound-interest-calculator (finance) — ~450K ricerche/mese
2. scientific-calculator (math) — ~1M ricerche/mese
3. gpa-calculator (math) — ~300K ricerche/mese
4. fraction-calculator (math) — HIGH
5. stopwatch (math) — HIGH
6. paycheck-calculator (finance) — HIGH
7. sales-tax-calculator (finance) — HIGH
8. investment-calculator (finance) — HIGH
9. profit-margin-calculator (finance) — MEDIUM
10. savings-goal-calculator (finance) — MEDIUM
11. square-root-calculator (math) — MEDIUM
12. standard-deviation-calculator (math) — MEDIUM
13. ideal-weight-calculator (health) — MEDIUM
14. body-fat-calculator (health) — MEDIUM
15. water-intake-calculator (health) — MEDIUM
16. macro-calculator (health) — MEDIUM
17. url-encoder (dev) — MEDIUM
18. hash-generator (dev) — MEDIUM
19. text-diff (dev) — MEDIUM
20. timestamp-converter (conversion) — MEDIUM
21. roman-numeral-converter (conversion) — MEDIUM
22. number-base-converter (conversion) — MEDIUM

### Steps:
1. Count current tools in lib/translations.ts
2. Show the user how many tools exist and suggest the next batch to create
3. Ask the user if they want to proceed
4. If yes, use /add-tools-batch to create them in parallel
