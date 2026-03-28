---
title: "The European Accessibility Act Is Now Live — Is Your Website Compliant?"
published: false
description: "The EAA is enforceable since June 2025. Here are the top 10 WCAG 2.1 AA failures most sites have — and how to fix them with code examples."
tags: webdev, accessibility, a11y, webstandards
---

If you build websites for European users (or for companies that sell to European users), June 28, 2025 changed everything.

That is when the **European Accessibility Act (EAA)** became enforceable. Not a guideline. Not a recommendation. A law — with real fines, real enforcement, and real consequences for non-compliant digital products and services.

And yet, most development teams I talk to either have not heard of it or assume it only applies to government websites. It does not. The EAA covers **any digital product or service** sold in the EU, including e-commerce, banking apps, e-books, travel booking platforms, and SaaS tools.

## What the EAA Actually Requires

The EAA points to **EN 301 549**, which in turn references **WCAG 2.1 Level AA** as the technical standard. If you already know WCAG, you know the baseline. If you don't — here is the short version:

Your website must be **perceivable, operable, understandable, and robust** for users with disabilities. That includes people who use screen readers, keyboard-only navigation, voice control, or high-contrast modes.

The penalties vary by EU member state, but they can include fines, product withdrawal from the market, and public naming. Germany, France, and Spain already have national transposition laws in place.

## The Top 10 WCAG 2.1 AA Issues Most Websites Fail On

After scanning hundreds of sites, these are the failures that come up over and over again. If your site has even three of these, you are likely non-compliant.

### 1. Missing alt text on images

The most common issue by far. Every `<img>` needs a meaningful `alt` attribute — or an empty `alt=""` if the image is purely decorative.

```html
<!-- Bad -->
<img src="chart.png">

<!-- Good: informative image -->
<img src="chart.png" alt="Revenue growth chart showing 40% increase in Q3 2025">

<!-- Good: decorative image -->
<img src="divider.png" alt="">
```

### 2. Insufficient color contrast

WCAG requires a **4.5:1** contrast ratio for normal text and **3:1** for large text. Tools report this constantly on light gray text on white backgrounds.

```css
/* Fails: contrast ratio ~2.5:1 */
.subtitle {
  color: #999999;
  background: #ffffff;
}

/* Passes: contrast ratio ~4.6:1 */
.subtitle {
  color: #595959;
  background: #ffffff;
}
```

### 3. Missing form labels

Screen readers cannot identify an input without a `<label>`. Placeholder text is not a substitute.

```html
<!-- Bad: relies on placeholder only -->
<input type="email" placeholder="Your email">

<!-- Good: visible label tied to input -->
<label for="email">Email address</label>
<input type="email" id="email" placeholder="you@example.com">
```

### 4. No keyboard focus indicators

If a user cannot see where they are on the page when using Tab, your site fails. Never remove focus outlines without providing an alternative.

```css
/* Never do this without a replacement */
*:focus { outline: none; }

/* Do this instead */
*:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

### 5. Missing skip navigation link

Users who navigate by keyboard should not have to tab through 50 header links to reach the main content.

```html
<body>
  <a href="#main-content" class="sr-only focus:not-sr-only">
    Skip to main content
  </a>
  <header><!-- nav links --></header>
  <main id="main-content">
    <!-- page content -->
  </main>
</body>
```

### 6. Missing language attribute

Screen readers need to know the page language to use correct pronunciation.

```html
<!-- Bad -->
<html>

<!-- Good -->
<html lang="en">
```

### 7. Empty links and buttons

Links or buttons that have no text content (just an icon) need an `aria-label`.

```html
<!-- Bad -->
<button><svg><!-- icon --></svg></button>

<!-- Good -->
<button aria-label="Close dialog"><svg><!-- icon --></svg></button>
```

### 8. Missing document structure (headings)

Pages need a logical heading hierarchy. Jumping from `<h1>` to `<h4>` confuses assistive technology.

```html
<!-- Bad: skips h2 and h3 -->
<h1>Dashboard</h1>
<h4>Recent Activity</h4>

<!-- Good: proper hierarchy -->
<h1>Dashboard</h1>
<h2>Recent Activity</h2>
```

### 9. Auto-playing media

Videos or audio that play automatically without user control violate WCAG 1.4.2. Always let the user decide.

```html
<!-- Bad -->
<video autoplay src="promo.mp4"></video>

<!-- Good -->
<video controls src="promo.mp4"></video>
```

### 10. Missing ARIA landmarks

Screen reader users rely on landmarks (`<nav>`, `<main>`, `<footer>`, `<aside>`) to jump between page sections. A page that is all `<div>` elements is a wall of unlabeled content.

```html
<!-- Bad: no semantic structure -->
<div class="header">...</div>
<div class="content">...</div>
<div class="footer">...</div>

<!-- Good: proper landmarks -->
<header>...</header>
<main>...</main>
<footer>...</footer>
```

## Why Automated Scanners Miss Most Issues

Here is where it gets tricky. If you run your site through WAVE (the most popular free accessibility checker), you will catch some of these — maybe 30-40 issues on a typical page. WAVE checks roughly **100 rules**.

But WCAG 2.1 AA has **201 testable success criteria and techniques** when you account for all the sub-requirements. That means free tools catch about half the picture. You ship thinking you are compliant, and you are not.

This is why I built [AccessiScan](https://fixmyweb.dev) — it tests against all 201 WCAG criteria, generates a prioritized report, and gives you the exact code fixes. It is designed for developers who need to pass an audit, not just run a quick check.

## Where to Start Right Now

If your site serves EU users, here is a practical checklist:

1. **Run a scan** — use any automated tool to get a baseline
2. **Fix the top 10 above first** — they account for ~80% of failures
3. **Test with a keyboard** — tab through your entire site without a mouse
4. **Test with a screen reader** — VoiceOver (Mac) or NVDA (Windows) are free
5. **Check your color contrast** — use the DevTools contrast checker
6. **Add it to CI** — accessibility regressions sneak in with every deploy

The EAA is not going away. If anything, enforcement will ramp up through 2026 and 2027 as member states build out their oversight bodies. The time to fix your site is now, not after you receive a complaint.

---

If you want a tool that covers the full 201 WCAG criteria in one scan, check out [AccessiScan Pro — lifetime access for $29](https://buy.stripe.com/7sYdRb1wr6V93XhcMGc7u00) (normally $29/month). Only 50 lifetime seats available.

Happy building — and happy shipping accessible products.
