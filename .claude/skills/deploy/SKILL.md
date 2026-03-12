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
6. **Wait**: Wait 90 seconds for Vercel deploy
7. **Verify**: Fetch https://toolkitonline.vip to confirm the site is live
8. **Report**: Show commit hash, files changed, and deployment status
