---
description: Build, test, commit, and deploy the project to Vercel
argument-hint: "[commit message]"
---

Deploy ToolKit Online to production.

## Steps:

1. **Quality Gate — BLOCCA deploy se fallisce!**
   - Run `npm run lint` — se ci sono errori, FIXA e ri-esegui
   - Run `npm run build` — se fallisce, FIXA e ri-esegui
   - Controlla `git diff` per verificare che non ci siano:
     - File .env committati
     - console.log nel codice di produzione
     - Tipi `any` in file TypeScript
   - **Se qualsiasi check fallisce → NON procedere al deploy**

2. **Check status**: Run `git status` to see all changes

3. **Stage files**: Add all changed files with `git add -A`

4. **Commit**: Create a commit with the provided message or auto-generate one based on changes. Always include `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`

5. **Push**: Run `git push` to trigger Vercel auto-deploy

6. **Notify search engines**:
   - Submit sitemap via GSC MCP tool if available
   - Note: Google/Bing ping endpoints are deprecated

7. **Wait**: Wait 90 seconds for Vercel deploy

8. **Verify**: Fetch https://toolkitonline.vip to confirm the site is live

9. **Report**: Show:
   - ✅ Lint status
   - ✅ Build status
   - ✅ Commit hash
   - ✅ Files changed count
   - ✅ Deployment status
   - ✅ Sitemap notification result
