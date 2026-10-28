# Header Responsive, Scrollspy & Hero Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix mobile horizontal overflow by hiding nav links on small screens, add a dynamic vanilla IntersectionObserver scrollspy to the header with neutral contact styling, and unify Hero container centering with the rest of the site.

**Architecture:** Enhances `Header.astro` with CSS media queries hiding `.primary-nav` below 768px and adds an inline zero-dependency `IntersectionObserver` scrollspy script that toggles `.is-active` and `aria-current="location"`. Refactors `Hero.astro` markup and styles so `.hero-inner` sits inside a standard centered `.container` without margin offsets.

**Tech Stack:** Astro 5, TypeScript, Vanilla CSS & Web APIs (`IntersectionObserver`), Vitest.

**Spec:** `docs/superpowers/specs/2026-10-28-header-responsive-scrollspy-hero-layout-design.md`

## Global Constraints

- **Mobile cleanliness:** On screens `< 768px`, navigation links (`.primary-nav`) must be completely hidden (`display: none`), displaying exclusively the Kinvia logo on the left and the language switcher on the right, with no horizontal scroll.
- **Scrollspy & Contact styling:** All navigation links must have neutral default styling (no permanent bold or active color on "Contacto"). The link for the section currently in viewport (`#hero`, `#axes`, `#services`, `#model`, `#contact`) must receive `.is-active` and `aria-current="location"`.
- **Hero alignment:** The hero section content must be centered and aligned within `<div class="container"><div class="hero-inner">...</div></div>`, matching the `1180px` max-width and margins of all other landing sections.
- **Performance & Zero Hydration Overhead:** Keep the header static HTML + CSS + lightweight inline vanilla JS script (~25 lines); do NOT convert the header into a React island.
- **Regression boundary:** All 19 existing Vitest and build verification tests must remain passing.

## Review Focus

1. **Mobile header width & overflow:** Ensure `.header-inner` and `header.site-header` occupy full width with `justify-content: space-between` on viewports `< 768px` without any horizontal overflow.
2. **Scrollspy disconnection when navigating away:** Ensure `IntersectionObserver` handles edge cases like fast scrolling or resizing without throwing errors or leaving multiple conflicting active links.
3. **Hero responsive padding & max-width:** Ensure removing `margin: 0 auto 0 0` preserves the text hierarchy and readably wraps on both mobile and wide displays.
4. **Accessible active indicator:** Ensure `.is-active` state is conveyed to assistive technology via `aria-current="location"`.
5. **No conflict with existing keyboard shortcuts:** Ensure programmatic scrolling triggered by keyboard shortcuts `1`–`5` seamlessly updates the scrollspy state.

---

### Task 1: Responsive Header & Dynamic Scrollspy (`Header.astro`)

**Files:**
- Modify: `src/components/Header.astro`
- Create: `tests/header-responsive-scrollspy.test.ts`

**Interfaces:**
- Consumes: `Locale`, `getDictionary`, `getAlternatePath` from `src/i18n`
- Produces:
  - Responsive header CSS hiding `.primary-nav` on `@media (max-width: 768px)`
  - Active link indicator styles for `.nav-list a.is-active` and neutral styling for `.nav-cta`
  - Inline `IntersectionObserver` scrollspy script in `Header.astro`

- [ ] **Step 1: Write the failing test in `tests/header-responsive-scrollspy.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..');

describe('Header Responsive and Scrollspy', () => {
  const headerSource = fs.readFileSync(path.join(root, 'src/components/Header.astro'), 'utf-8');

  it('hides primary navigation on mobile screens below 768px', () => {
    expect(headerSource).toMatch(/@media\s*\(\s*max-width:\s*768px\s*\)[^{]*\{[\s\S]*?\.primary-nav\s*\{[^}]*display:\s*none/);
  });

  it('removes permanent bold styling from nav-cta to avoid false active appearance', () => {
    expect(headerSource).not.toMatch(/\.nav-cta\s*\{[^}]*font-weight:\s*700/);
    expect(headerSource).toContain('.nav-list a.is-active');
  });

  it('includes an inline IntersectionObserver scrollspy script tracking sections', () => {
    expect(headerSource).toContain('IntersectionObserver');
    expect(headerSource).toContain('aria-current');
    expect(headerSource).toContain('is-active');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/header-responsive-scrollspy.test.ts`
Expected: FAIL (missing `.primary-nav { display: none; }` in 768px media query, `.nav-cta { font-weight: 700; }` present, no `IntersectionObserver`).

- [ ] **Step 3: Update `src/components/Header.astro` with responsive CSS, neutral contact style, and scrollspy script**

In `src/components/Header.astro`:
1. Change `@media (max-width: 720px)` to `@media (max-width: 768px)` with `.primary-nav { display: none; }`.
2. Remove `.nav-list .nav-cta { color: var(--accent-tech-strong); font-weight: 700; }`.
3. Add `.nav-list a.is-active { color: var(--accent-tech-strong); border-bottom: 2px solid var(--accent-tech); padding-bottom: 0.25rem; }`.
4. Add inline `<script>`:
```astro
<script is:inline>
  (function () {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    var links = document.querySelectorAll('.nav-list a[href*="#"]');
    var sectionIds = ['hero', 'axes', 'services', 'model', 'contact'];
    var sections = sectionIds.map(function(id) { return document.getElementById(id); }).filter(Boolean);

    function setActive(id) {
      links.forEach(function(link) {
        var href = link.getAttribute('href') || '';
        var match = href.indexOf('#' + id) !== -1;
        if (match) {
          link.classList.add('is-active');
          link.setAttribute('aria-current', 'location');
        } else {
          link.classList.remove('is-active');
          link.removeAttribute('aria-current');
        }
      });
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, {
      rootMargin: '-20% 0px -70% 0px'
    });

    sections.forEach(function(sec) { observer.observe(sec); });
  })();
</script>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/header-responsive-scrollspy.test.ts`
Expected: PASS (3 passed)

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro tests/header-responsive-scrollspy.test.ts
git commit -m "feat(header): add mobile-responsive clean header and dynamic scrollspy"
```

---

### Task 2: Hero Container Centering & Layout Alignment (`Hero.astro`)

**Files:**
- Modify: `src/components/Hero.astro`
- Create: `tests/hero-layout.test.ts`

**Interfaces:**
- Consumes: `Hero.astro`
- Produces:
  - Clean container wrapper `<div class="container"><div class="hero-inner">`
  - Proper centering and aligned left-grid boundary with subsequent sections

- [ ] **Step 1: Write the failing test in `tests/hero-layout.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..');

describe('Hero Layout Alignment', () => {
  const heroSource = fs.readFileSync(path.join(root, 'src/components/Hero.astro'), 'utf-8');

  it('nests hero-inner inside container rather than merging classes', () => {
    expect(heroSource).not.toContain('class="container hero-inner"');
    expect(heroSource).toMatch(/class="container"[\s\S]*?class="hero-inner"/);
  });

  it('removes margin override that pushes hero content to the left edge', () => {
    expect(heroSource).not.toContain('margin: 0 auto 0 0');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/hero-layout.test.ts`
Expected: FAIL (contains `class="container hero-inner"` and `margin: 0 auto 0 0`).

- [ ] **Step 3: Update `src/components/Hero.astro` HTML structure and CSS styles**

In `src/components/Hero.astro`:
1. Change:
```html
<section id="hero" class="hero-plane" tabindex="-1" aria-labelledby="hero-heading">
  <div class="container">
    <div class="hero-inner">
      ...
    </div>
  </div>
</section>
```
2. In `<style>`:
```css
.hero-inner {
  max-width: 900px;
  animation: heroEntrance var(--transition-med) both;
}
```
(Remove `margin: 0 auto 0 0;`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/hero-layout.test.ts`
Expected: PASS (2 passed)

- [ ] **Step 5: Run full test suite and build verification**

Run: `npm test`
Expected: PASS (all 8 test files passing, including full build verification)

- [ ] **Step 6: Commit**

```bash
git add src/components/Hero.astro tests/hero-layout.test.ts
git commit -m "fix(hero): unify container centering and layout alignment"
```

