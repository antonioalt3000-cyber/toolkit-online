---
name: deploy
description: Build, test, commit, and deploy the project to Vercel
user-invocable: true
argument-hint: "[commit message]"
---

Deploy ToolKit Online to production.

## Steps:

1. **Check status**: Run `git status` to see all changes
2. **Build test**: Run `npx next build` — if it fails, fix errors first
3. **Stage files**: Add all changed files with `git add -A`
4. **Commit**: Create a commit with the provided message or auto-generate one based on changes. Always include `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
5. **Push**: Run `git push` to trigger Vercel auto-deploy
6. **Ping Google sitemap**: Run `curl -s "https://www.google.com/ping?sitemap=https://toolkitonline.vip/sitemap.xml"` to notify Google of sitemap updates
7. **Wait**: Wait 90 seconds for Vercel deploy
8. **Verify**: Fetch https://toolkitonline.vip to confirm the site is live
9. **Report**: Show commit hash, files changed, deployment status, and sitemap ping result
