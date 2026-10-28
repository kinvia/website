# Header Responsive, Scrollspy & Hero Alignment — Design Spec

**Date:** 2026-10-28  
**Repo / Worktree:** `website/.worktrees/redesign`  
**Status:** Ready for approval  
**Scope:** Small change (UI / Responsive / UX enhancement)

---

## 1. Intent & Context

During manual testing of the new Kinvia website redesign on mobile viewports, three usability and layout deficiencies were identified:
1. **Mobile header overflow:** On mobile viewports (`< 768px`), the navigation links in the header do not fit, overflowing the viewport and creating an unwanted horizontal scroll bar.
2. **False active state on Contact & missing scrollspy:** The "Contacto" menu link had a permanent bold accent style (`.nav-cta`), misleading users to think they were already on the contact section. Users expect navigation links to highlight dynamically as they scroll into each section (like on kinvia.es).
3. **Hero alignment mismatch:** In `Hero.astro`, `.hero-inner` has `margin: 0 auto 0 0` inside `.container`, pushing the text to the far left of wide viewports while all subsequent sections use the centered `max-width: 1180px; margin: 0 auto;` container.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- **Clean mobile header:** On screens `< 768px`, completely hide `.primary-nav` ("máxima limpieza"), displaying exclusively the Kinvia logo on the left and the language switcher on the right, occupying 100% of the screen width without horizontal scroll.
- **Scrollspy navigation:** Implement a lightweight, zero-dependency `IntersectionObserver` in `Header.astro` that observes `#hero`, `#axes`, `#services`, `#model`, and `#contact`, dynamically marking the currently visible section link with `.is-active` and `aria-current="location"`.
- **Neutral Contact nav item:** Treat "Contacto" with the same base style as other nav links, highlighting it only when the user has scrolled to the `#contact` section.
- **Unified container layout:** Separate `.container` from `.hero-inner` in `Hero.astro`, ensuring the Hero text starts at the exact same horizontal grid line as the rest of the landing sections.

### Non-Goals
- Mobile hamburger menu or off-canvas drawer (the client explicitly requested "máxima limpieza" with just logo and language toggle on mobile).
- Converting the header into a React island.

### Anti-Goals
- Introducing any runtime dependencies or heavy JavaScript libraries.
- Regressing existing automated tests (19/19 passing).

---

## 3. Approaches Considered

- **Option 1 (Chosen): Static Native CSS + Vanilla IntersectionObserver script in `Header.astro`:**  
  CSS media query `@media (max-width: 768px)` hides `.primary-nav`. A minimal inline script in `Header.astro` uses standard `IntersectionObserver` to toggle `.is-active` on the corresponding menu link. Hero layout fixes `.container` nesting.  
  *Pros:* Zero extra bundle size, no React hydration overhead, 100% accessible, FCP/LCP untouched.
- **Option 2 (Rejected): React Header Island:**  
  Rewriting the header as a client React component with React state.  
  *Cons:* Adds unnecessary JS bundle weight and hydration cost for a simple visual scrollspy.

---

## 4. Detailed Component Changes

### 4.1 `src/components/Header.astro`
- **Mobile breakpoint (`@media (max-width: 768px)`):**  
  Set `.primary-nav { display: none; }`. `.header-inner` keeps `justify-content: space-between` and `width: 100%`.
- **Nav item styles:**  
  Remove the persistent bold/accent color from `.nav-cta`.  
  Add `.nav-list a.is-active` styling: `color: var(--accent-tech-strong);` with a subtle bottom indicator or border highlight.
- **Scrollspy script:**  
  Inline `<script>` querying `nav.primary-nav a[href*="#"]` and sections `#hero`, `#axes`, `#services`, `#model`, `#contact`. An `IntersectionObserver` with `rootMargin: '-20% 0px -70% 0px'` updates the active link reliably.

### 4.2 `src/components/Hero.astro`
- Update HTML structure:
  ```html
  <section id="hero" class="hero-plane" tabindex="-1" aria-labelledby="hero-heading">
    <div class="container">
      <div class="hero-inner">
        ...
      </div>
    </div>
  </section>
  ```
- Remove `margin: 0 auto 0 0` from `.hero-inner` so `.container` properly centers and aligns with the rest of the site.

---

## 5. Verification Plan
- Unit & build tests in `tests/`:
  - Verify `Header.astro` hides `.primary-nav` at `max-width: 768px`.
  - Verify `Hero.astro` contains `<div class="container"><div class="hero-inner">`.
  - Re-run full test suite (`npx vitest run`) and static build (`npm run build`).
- Visual check:
  - Mobile viewport (< 768px): zero horizontal scroll, clean logo + language switcher.
  - Desktop viewport: scrollspy activates links smoothly as sections cross viewport; Contact is not permanently bold.
  - Hero margins align identically with TwoAxes, Services, Model, and Contact.

