---
name: add-tools-batch
description: Create multiple new tools at once using parallel agents
user-invocable: true
argument-hint: "[tool1,tool2,tool3,...] [category]"
---

Create a batch of new tools for ToolKit Online. Parse $ARGUMENTS to get the tool slugs and category.

## Steps:

1. **Parse input**: Split the comma-separated tool slugs from $ARGUMENTS[0], category from $ARGUMENTS[1]
2. **Launch parallel agents**: Use the Agent tool to create tools in parallel (max 4-5 agents at once)
3. Each agent should:
   - Create the page at `app/[lang]/tools/[slug]/page.tsx` with full functionality
   - Include ToolPageWrapper, SEO article (300-400 words), FAQ (4-5 questions)
   - Translate everything in 6 languages
4. **Update translations.ts**: Add all new tools to the `tools` object and `getToolsByCategory()`
5. **Build test**: Run `npx next build` to verify no errors
6. **Deploy**: Stage, commit, push

## Important:
- Each tool must be fully functional and interactive
- Follow existing patterns exactly
- Real translations only
- Use /deploy to push when done
