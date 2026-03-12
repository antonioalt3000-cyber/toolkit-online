---
name: publish-article
description: Write and publish an SEO article on Dev.to linking to toolkitonline.vip
user-invocable: true
argument-hint: "[topic]"
---

Write and publish an article on Dev.to about $ARGUMENTS.

## Prerequisites:
- Dev.to API key must be stored in environment or provided by user

## Steps:

1. **Research the topic**: Understand what the article should cover
2. **Write the article**:
   - 800-1500 words
   - Include practical examples
   - Naturally link to relevant tools on https://toolkitonline.vip
   - Use markdown formatting
   - Add relevant tags (max 4)
   - Include a compelling title and cover image description
3. **Publish via API**:
```bash
curl -X POST https://dev.to/api/articles \
  -H "api-key: $DEVTO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"article":{"title":"...","body_markdown":"...","published":true,"tags":["..."]}}'
```
4. **Report**: Show the published URL

## Article guidelines:
- Write genuinely useful content, not promotional spam
- Link to toolkitonline.vip tools where naturally relevant
- Target keywords with good search volume
- Use proper heading hierarchy (h2, h3)
- Include code examples for developer topics
