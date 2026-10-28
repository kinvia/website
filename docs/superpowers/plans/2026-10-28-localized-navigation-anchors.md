# Localized Navigation Anchors & Language Switch Hash Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Localize landing section IDs and navigation hashes in Spanish (`#inicio`, `#divisiones`, `#servicios`, `#modelos`, `#contacto`) and English (`#hero`, `#axes`, `#services`, `#model`, `#contact`), and preserve the translated section anchor when switching languages.

**Architecture:** Extends `src/i18n/{es,en}.json` with `nav.anchors` and adds a bidirectional `translateHash()` helper in `src/i18n/index.ts`. Landing sections render localized `id` attributes alongside stable `data-section` attributes (used by `A11yPanel` keyboard shortcuts), while `Header.astro`'s client script keeps language switcher links (`[data-lang-switch]`) synchronized with the translated hash of the current URL hash or active scrollspy section.

**Tech Stack:** Astro 5, TypeScript, React 19 (`A11yPanel`, `ContactForm`), Vitest, Cheerio.

**Spec:** `docs/superpowers/specs/2026-10-28-localized-navigation-anchors-design.md`

## Global Constraints

- **Spanish section anchors (`/es/`):** `#inicio`, `#divisiones`, `#servicios`, `#modelos`, `#contacto`.
- **English section anchors (`/en/`):** `#hero`, `#axes`, `#services`, `#model`, `#contact`.
- **Bidirectional hash translation on language switch:** Navigating via the language switcher from `/en/#contact` must target `/es/#contacto` (and conversely for all 5 section pairs).
- **Keyboard shortcuts (`1`–`5`):** Must continue jumping to the 5 sections in both `/es/` and `/en/` via `data-section="hero|axes|services|model|contact"` (with `getElementById` fallback).
- **Zero regression:** All existing unit and `astro build` verification tests must pass.

## Review Focus

1. **Direct load with URL hash (`/en/#contact`) before scrolling:** If a user lands directly on `/en/#contact` and immediately clicks `ES` without scrolling, the language switcher must respect `window.location.hash` and point to `/es/#contacto`.
2. **Repeated hash changes / scrolling:** Updating `[data-lang-switch]` `href` must always build from `data-base-href` (`/es/` or `/en/`) rather than appending `#hash` repeatedly (`#contacto#modelos`).
3. **Privacy page language switch:** On `/es/privacidad` and `/en/privacy` (where no landing sections exist), `[data-lang-switch]` must remain `/en/privacy` and `/es/privacidad` without appending bogus section hashes.
4. **Hero CTA & ContactForm post-submit anchor in Spanish:** `Hero.astro` CTA and `ContactForm.tsx` action URL must use `#contacto` in Spanish and `#contact` in English.
5. **Keyboard shortcut compatibility:** `A11yPanel.tsx` must locate sections when rendered with localized IDs (`id="servicios" data-section="services"`) as well as in unit tests with `id="services"`.

---

### Task 1: i18n Anchor Dictionary & Bidirectional Hash Translation (`src/i18n/`)

**Files:**
- Modify: `src/i18n/es.json`
- Modify: `src/i18n/en.json`
- Modify: `src/i18n/index.ts`
- Modify: `tests/i18n.test.ts`

**Interfaces:**
- Consumes: `src/i18n/es.json`, `src/i18n/en.json`
- Produces:
  - `dict.nav.anchors`: `{ hero: string; axes: string; services: string; model: string; contact: string }`
  - `export type SectionKey = 'hero' | 'axes' | 'services' | 'model' | 'contact'`
  - `export function translateHash(targetLocale: Locale, hash: string): string`
  - `export function getAlternatePath(targetLocale: Locale, pathname: string, hash?: string): string`

- [ ] **Step 1: Write the failing test in `tests/i18n.test.ts`**

Add to `tests/i18n.test.ts`:
```typescript
  it('defines localized nav.anchors and translates hashes bidirectionally between ES and EN', () => {
    const esAnchors = getDictionary('es').nav.anchors;
    const enAnchors = getDictionary('en').nav.anchors;
    expect(esAnchors).toEqual({
      hero: 'inicio',
      axes: 'divisiones',
      services: 'servicios',
      model: 'modelos',
      contact: 'contacto',
    });
    expect(enAnchors).toEqual({
      hero: 'hero',
      axes: 'axes',
      services: 'services',
      model: 'model',
      contact: 'contact',
    });

    expect(translateHash('es', '#contact')).toBe('#contacto');
    expect(translateHash('es', '#model')).toBe('#modelos');
    expect(translateHash('en', '#divisiones')).toBe('#axes');
    expect(translateHash('en', 'servicios')).toBe('#services');
    expect(translateHash('es', '#unknown')).toBe('');

    expect(getAlternatePath('es', '/en/', '#contact')).toBe('/es/#contacto');
    expect(getAlternatePath('en', '/es/', '#modelos')).toBe('/en/#model');
    expect(getAlternatePath('en', '/es/privacidad', '#contacto')).toBe('/en/privacy');
  });
```
(Also import `translateHash` from `../src/i18n` at the top of `tests/i18n.test.ts`).

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/i18n.test.ts`
Expected: FAIL (`translateHash is not a function` / `esAnchors` undefined).

- [ ] **Step 3: Implement `nav.anchors` in `es.json` & `en.json` and `translateHash` / `getAlternatePath` in `src/i18n/index.ts`**

Add `"anchors": { "hero": "inicio", "axes": "divisiones", "services": "servicios", "model": "modelos", "contact": "contacto" }` under `"nav"` in `src/i18n/es.json`, and `"anchors": { "hero": "hero", "axes": "axes", "services": "services", "model": "model", "contact": "contact" }` under `"nav"` in `src/i18n/en.json`.
In `src/i18n/index.ts`, implement `translateHash(targetLocale: Locale, hash: string): string` mapping any ES or EN anchor name to `targetLocale`'s `#<anchor>` (or `''` if unrecognized), and update `getAlternatePath(targetLocale: Locale, pathname: string, hash?: string): string` to append `translateHash(targetLocale, hash)` when the route is `/es/` or `/en/`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/i18n.test.ts`
Expected: PASS (5 passed)

- [ ] **Step 5: Commit**

```bash
git add src/i18n/es.json src/i18n/en.json src/i18n/index.ts tests/i18n.test.ts
git commit -m "feat(i18n): add localized section anchors and bidirectional hash translation"
```

---

### Task 2: Localized Section IDs, Header/Footer Hash Sync & A11y Shortcuts

**Files:**
- Modify: `src/components/Hero.astro`
- Modify: `src/components/TwoAxes.astro`
- Modify: `src/components/Services.astro`
- Modify: `src/components/CommercialModel.astro`
- Modify: `src/components/ContactSection.astro`
- Modify: `src/components/ContactForm.tsx`
- Modify: `src/components/A11yPanel.tsx`
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Modify: `tests/landing-sections.test.ts`
- Modify: `tests/header-responsive-scrollspy.test.ts`
- Modify: `tests/build-verification.test.ts`

**Interfaces:**
- Consumes: `dict.nav.anchors` from `src/i18n`
- Produces:
  - Localized `id` + `data-section` on all 5 landing sections
  - Dynamic `[data-lang-switch]` `href` synchronization in `Header.astro` inline script

- [ ] **Step 1: Update tests in `tests/header-responsive-scrollspy.test.ts`, `tests/landing-sections.test.ts`, and `tests/build-verification.test.ts` with localized anchor assertions**

In `tests/header-responsive-scrollspy.test.ts`, update the JSDOM scrollspy test to use Spanish section IDs (`inicio`, `divisiones`, `servicios`, `modelos`, `contacto`) and add a test verifying that when the user is on `/en/#contact` (or scrolled to `#servicios` in `/es/`), the `[data-lang-switch]` link `href` is dynamically updated to `/es/#contacto` (and `/en/#services` respectively).
In `tests/landing-sections.test.ts`, check that `Hero.astro` uses `dict.nav.anchors.hero` and `data-section="hero"`, and CTA uses `#${dict.nav.anchors.contact}`.
In `tests/build-verification.test.ts`, assert that `dist/es/index.html` contains `id="inicio"`, `id="divisiones"`, `id="servicios"`, `id="modelos"`, `id="contacto"`, and `dist/en/index.html` contains `id="hero"`, `id="axes"`, `id="services"`, `id="model"`, `id="contact"`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/header-responsive-scrollspy.test.ts tests/landing-sections.test.ts`
Expected: FAIL (missing localized IDs and `[data-lang-switch]` hash sync).

- [ ] **Step 3: Implement localized section IDs, `data-section` attributes, and language switch hash synchronization**

1. In `Hero.astro`, `TwoAxes.astro`, `Services.astro`, `CommercialModel.astro`, `ContactSection.astro`: set `id={dict.nav.anchors.<key>}` and `data-section="<key>"` (and in `Hero.astro` set CTA `href={`#${dict.nav.anchors.contact}`}`).
2. In `ContactForm.tsx`: set `const actionUrl = locale === 'es' ? '/es/?enviado=1#contacto' : '/en/?sent=1#contact';`.
3. In `A11yPanel.tsx`: resolve section element via `(document.querySelector(\`[data-section="\${sectionId}"]\`) as HTMLElement | null) || document.getElementById(sectionId)`.
4. In `Header.astro` and `Footer.astro`: use `dict.nav.anchors.*` for nav links and add `data-lang-switch data-base-href={altPath} data-target-locale={otherLocale}` on the language switcher `<a>`.
5. In `Header.astro` `<script is:inline>`: map hashes bidirectionally between ES (`inicio`, `divisiones`, `servicios`, `modelos`, `contacto`) and EN (`hero`, `axes`, `services`, `model`, `contact`), and update all `[data-lang-switch]` links whenever `window.location.hash` is present or `setActive(id)` runs.

- [ ] **Step 4: Run full test suite and build verification**

Run: `npx vitest run`
Expected: PASS (all 9 test files passing, including `astro build` verification of localized IDs in `dist/es/index.html` and `dist/en/index.html`).

- [ ] **Step 5: Commit**

```bash
git add src/components/ tests/
git commit -m "feat(nav): localize section anchors per locale and sync hash on language switch"
```
