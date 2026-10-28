# Localized Navigation Anchors & Language Switch Hash Sync — Design Spec

**Date:** 2026-10-28  
**Repo / Worktree:** `website/.worktrees/redesign`  
**Status:** Ready for approval  
**Scope:** Small change (i18n anchor localization & language switcher UX)

---

## 1. Intent & Why

Currently, section IDs (`#hero`, `#axes`, `#services`, `#model`, `#contact`) are hardcoded in English across both `/es/` and `/en/`, and clicking the language switcher (`ES` ↔ `EN`) resets the URL to the root locale path (`/es/` or `/en/`) without preserving or translating the active section anchor. Users browsing `/en/#contact` who switch to Spanish expect to land on `/es/#contacto` with localized Spanish anchor names throughout `/es/`.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- **Localized section IDs per locale:**
  - Spanish (`/es/`): `#inicio`, `#divisiones`, `#servicios`, `#modelos`, `#contacto`
  - English (`/en/`): `#hero`, `#axes`, `#services`, `#model`, `#contact`
- **Preserve & translate section hash on language switch:** Switching language from `/en/#contact` navigates to `/es/#contacto` (and vice versa for all 5 sections), whether triggered from the URL hash or the active scrollspy section.
- **Stable keyboard shortcuts (`1`–`5`):** Add `data-section="hero|axes|services|model|contact"` to each section so `A11yPanel.tsx` shortcuts work identically across both locales.

### Non-Goals
- Changing top-level page routes (`/es/`, `/en/`, `/es/privacidad`, `/en/privacy`).

### Anti-Goals
- Duplicating hidden anchor `<span id="...">` elements in the DOM or breaking existing automated tests.

---

## 3. Approaches Considered

1. **Approach 1 (Chosen) — Declarative i18n `nav.anchors` + Bidirectional Hash Mapper + Client Lang-Switch Sync:**
   - Define `nav.anchors` (`hero`, `axes`, `services`, `model`, `contact`) in `src/i18n/es.json` (`inicio`, `divisiones`, `servicios`, `modelos`, `contacto`) and `src/i18n/en.json` (`hero`, `axes`, `services`, `model`, `contact`).
   - Add `translateHash(targetLocale, hash)` and `getAlternatePath(targetLocale, pathname, hash?)` in `src/i18n/index.ts`.
   - Render `<section id={dict.nav.anchors.<key>} data-section="<key>">` in `Hero.astro`, `TwoAxes.astro`, `Services.astro`, `CommercialModel.astro`, and `ContactSection.astro` (plus CTA `href={`#${dict.nav.anchors.contact}`}` and `ContactForm.tsx` action URL).
   - Update `Header.astro` and `Footer.astro` links to use `dict.nav.anchors.*`, and have the `Header.astro` script keep `.lang-switch` (and footer language link) `href` synchronized with the translated hash of the active section / `window.location.hash`.
2. **Approach 2 (Rejected) — Dual invisible anchor tags:** Clutters the DOM and leaves menu URLs unlocalized.

---

## 4. What Is Left to the Builder

- Exact data attribute name on `.lang-switch` (`data-base-href={altPath}`) so the inline script can cleanly append `#<translatedAnchor>` without accumulating hashes.
- Updating existing test assertions that hardcode `#hero` or `#contact` on `/es/` to expect `#inicio` and `#contacto` in Spanish and `#hero` and `#contact` in English.
