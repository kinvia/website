# Kinvia Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the bilingual (ES/EN) Kinvia Tech Partner marketing website and brief privacy pages using Astro SSG and React islands, optimized for FCP/LCP and deployed on Netlify Free with Netlify Forms.

**Architecture:** Static-first Astro 5 site generating `/es/`, `/en/`, `/es/privacidad`, and `/en/privacy` from shared Astro section components and JSON dictionaries (`src/i18n/{es,en}.json`) with a Spanish-fallback translation helper. Visual styling uses a dark-first CSS custom-property token system (supporting light theme, high contrast, 3 text sizes, and reduced motion) paired with two lightweight `@astrojs/react` islands (`ContactForm` and `A11yPanel` loaded `client:idle`).

**Tech Stack:** Astro 5 (SSG), `@astrojs/react`, React 19, TypeScript, Vitest, `@testing-library/react`, `jsdom`, `cheerio`, Netlify Free (`netlify.toml`).

**Spec:** `website/docs/superpowers/specs/2026-10-28-kinvia-website-redesign-design.md` (with copy and positioning from `company-context/company-profile.md` and `company-context/brand-voice.md`)

## Global Constraints

- **Routes:** `/` redirects to `/es/`; `/es/` (Landing ES); `/en/` (Landing EN); `/es/privacidad` (Privacy ES); `/en/privacy` (Privacy EN).
- **SEO & i18n:** Explicit URLs + JSON dictionaries (`src/i18n/{es,en}.json`); missing key in `en` falls back to `es`. `<link rel="alternate" hreflang="...">` for `es`, `en`, and `x-default` (pointing to `/es/`).
- **Hero constraints:** Brand Kinvia as hero-level signal; exact ES claim `«Rentabilidad y Optimización. Integración y cercanía.»`; one supporting sentence (`Socio Tecnológico Integral: Ingeniería de Software, Arquitectura Cloud y Externalización IT`); one CTA group (`#contact` / "Hablemos"). Single composition; NO cards, stats, or badge overlays in Hero. Single LCP candidate with `fetchpriority="high"`.
- **Section order & IDs:** `1` `#hero` (Hero), `2` `#axes` (Two axes: Cloud & Software | IoT & Smart Spaces), `3` `#services` (Services: IT In-House, Custom software, AI & Cloud, FinOps, IoT/AgTech), `4` `#model` (Commercial model: Monthly retainer + hour bank | 3-phase projects | IoT CapEx + Watchdog/OTA), `5` `#contact` (Contact + Netlify Form), plus Footer.
- **Copy & Brand Voice (`brand-voice.md`, `company-profile.md`):** Use "tú" in ES and direct active voice in EN. Translate technical solvency into business outcomes per segment. **Strictly forbidden** to use the founder's raw CV (`Red Hat`, `Principal Software Engineer`, `Everis`) as a sales pitch.
- **Contact & Legal:** Visible `info@kinvia.es` and `+34 644 21 93 52`. Netlify Form with `name="contact"`, `method="POST"`, `data-netlify="true"`, `netlify-honeypot="bot-field"`, hidden `form-name="contact"`, fields `name`, `email`, `message`, and required `privacy` checkbox linking to the locale's privacy page. Brief privacy pages state controller contact (`Kinvia`, `Orihuela Costa`, `info@kinvia.es`, `+34 644 21 93 52`), purpose, and collected fields (no CIF/fiscal address yet, no GA4, no cookie banner). Dynamic copyright year in footer.
- **Visual & Typography:** Dark-first UI with light/dark toggle; CSS variables for background, elevated surfaces, text, and one technical accent (avoid purple-glow AI aesthetic). Primary font stack must **not** be `Inter`, `Roboto`, `Arial`, or `system-ui`.
- **Accessibility (Level B):** Skip link, landmarks, visible focus, AA contrast, `A11yPanel` island (`client:idle`) with text size (`normal` | `large` | `larger`), high contrast, reduce motion, light/dark toggle, and keyboard shortcuts (`?` help modal, `1`–`5` jump to sections, `Escape` close), persisted in `localStorage`.

## Review Focus

1. **Keyboard shortcuts triggered while typing in form fields:** Pressing `1`–`5` or `?` while focused inside `<input>`, `<textarea>`, `<select>`, or `[contenteditable]` must be ignored by the shortcut handler so users can type numbers and question marks in the contact form.
2. **Corrupted or blocked `localStorage` during theme/a11y initialization:** Malformed JSON or storage access errors in `localStorage` must fall back cleanly to `prefers-color-scheme` (or `dark` default) without throwing unhandled exceptions.
3. **Missing translation keys in `t(locale, key)`:** Missing English keys must return the Spanish fallback string; completely unknown dot-paths must return the key string itself rather than `undefined` or throwing a `TypeError`.
4. **Honeypot field accessibility & bot submission prevention:** The `bot-field` input must be hidden from assistive tech (`aria-hidden="true"`, `tabIndex={-1}`) and filled honeypot submissions must be silently ignored on the client without sending spam.
5. **Reduced motion across OS preference and A11y toggle:** Both `(prefers-reduced-motion: reduce)` and `document.documentElement.dataset.reduceMotion === 'true'` must disable smooth scrolling in section-jump shortcuts and suppress non-essential CSS transitions.

---

### Task 1: Project Scaffolding, Asset Migration, Design Tokens & Netlify Config

**Files:**
- Create: `website/package.json`
- Create: `website/tsconfig.json`
- Create: `website/astro.config.mjs`
- Create: `website/vitest.config.ts`
- Create: `website/netlify.toml`
- Create: `website/src/styles/tokens.css`
- Create: `website/src/styles/global.css`
- Move/Copy: `website/favicon*`, `website/android-chrome-*`, `website/apple-touch-icon.png`, `website/site.webmanifest`, `website/images/*` → `website/public/`
- Test: `website/tests/config-and-tokens.test.ts`

**Interfaces:**
- Consumes: Existing static brand assets in `website/` and `website/images/`
- Produces:
  - CSS custom properties on `:root`, `[data-theme="light"]`, `[data-contrast="high"]`, `[data-text-size="large" | "larger"]`, `[data-reduce-motion="true"]` in `website/src/styles/tokens.css`
  - Global reset, skip-link, focus-ring, and layout utility classes in `website/src/styles/global.css`
  - Netlify config in `website/netlify.toml` (`publish = "dist"`, redirect `/` → `/es/`)

- [ ] **Step 1: Initialize `website/package.json`, `tsconfig.json`, `astro.config.mjs`, `vitest.config.ts` and install dependencies**

Create `website/package.json` with scripts `"dev": "astro dev"`, `"build": "astro build"`, `"preview": "astro preview"`, `"test": "vitest run"`, and dependencies `astro`, `@astrojs/react`, `react`, `react-dom` plus devDependencies `typescript`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `cheerio`, `@types/react`, `@types/react-dom`. Copy `website/favicon*`, `website/android-chrome-*`, `website/apple-touch-icon.png`, `website/site.webmanifest` into `website/public/` and `website/images/*` into `website/public/images/`. Run `npm install` inside `website/`.

- [ ] **Step 2: Write the failing test in `website/tests/config-and-tokens.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..');

describe('Netlify configuration and Design Tokens', () => {
  it('configures netlify.toml with dist publish dir and / to /es/ redirect', () => {
    const toml = fs.readFileSync(path.join(root, 'netlify.toml'), 'utf-8');
    expect(toml).toContain('publish = "dist"');
    expect(toml).toContain('from = "/"');
    expect(toml).toContain('to = "/es/"');
  });

  it('defines dark-first tokens, light theme, high contrast, text sizes, and non-banned primary fonts', () => {
    const tokens = fs.readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf-8');
    expect(tokens).toContain('--bg-primary:');
    expect(tokens).toContain('--bg-elevated:');
    expect(tokens).toContain('--text-primary:');
    expect(tokens).toContain('--accent-tech:');
    expect(tokens).toContain('[data-theme="light"]');
    expect(tokens).toContain('[data-contrast="high"]');
    expect(tokens).toContain('[data-text-size="large"]');
    expect(tokens).toContain('[data-text-size="larger"]');

    const fontDisplayMatch = tokens.match(/--font-display:\s*([^;]+);/);
    const fontBodyMatch = tokens.match(/--font-body:\s*([^;]+);/);
    expect(fontDisplayMatch).not.toBeNull();
    expect(fontBodyMatch).not.toBeNull();
    const primaryDisplay = fontDisplayMatch![1].split(',')[0].toLowerCase();
    const primaryBody = fontBodyMatch![1].split(',')[0].toLowerCase();
    for (const banned of ['inter', 'roboto', 'arial', 'system-ui']) {
      expect(primaryDisplay).not.toContain(banned);
      expect(primaryBody).not.toContain(banned);
    }
  });

  it('migrates brand logos and favicons into public/', () => {
    expect(fs.existsSync(path.join(root, 'public/favicon.ico'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'public/images/logo-w.webp'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'public/images/logo.webp'))).toBe(true);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm --prefix website test -- tests/config-and-tokens.test.ts`
Expected: FAIL with `ENOENT: no such file or directory, open '.../netlify.toml'`

- [ ] **Step 4: Implement `website/netlify.toml`, `website/src/styles/tokens.css`, and `website/src/styles/global.css`**

Create `website/netlify.toml` with `[build] command = "npm run build"`, `publish = "dist"`, and `[[redirects]] from = "/" to = "/es/" status = 302`.
Create `website/src/styles/tokens.css` with dark-first infrastructure palette (`--bg-primary: #070b12`, `--bg-elevated: #0f1724`, `--text-primary: #f0f6fc`, `--text-secondary: #94a3b8`, `--accent-tech: #14b8a6` teal/cyan, `--font-display: 'Space Grotesk', 'Outfit', sans-serif`, `--font-body: 'Plus Jakarta Sans', 'DM Sans', sans-serif`), `[data-theme="light"]` overrides (WCAG AA contrast), `[data-contrast="high"]` overrides, `[data-text-size="large"]` (`font-size: 112.5%`), `[data-text-size="larger"]` (`font-size: 125%`).
Create `website/src/styles/global.css` importing `tokens.css`, setting base typography, `.skip-link`, `:focus-visible` outline, and `@media (prefers-reduced-motion: reduce)` + `html[data-reduce-motion="true"]` rules disabling animations and smooth scroll.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm --prefix website test -- tests/config-and-tokens.test.ts`
Expected: PASS (3 passed)

- [ ] **Step 6: Commit**

```bash
git -C website add package.json package-lock.json tsconfig.json astro.config.mjs vitest.config.ts netlify.toml public/ src/styles/ tests/config-and-tokens.test.ts
git -C website commit -m "chore: scaffold Astro project, design tokens, and Netlify config"
```

---

### Task 2: Bilingual i18n Dictionary & Fallback Helper (`es` / `en`)

**Files:**
- Create: `website/src/i18n/es.json`
- Create: `website/src/i18n/en.json`
- Create: `website/src/i18n/index.ts`
- Test: `website/tests/i18n.test.ts`

**Interfaces:**
- Consumes: none
- Produces:
  - `export type Locale = 'es' | 'en'`
  - `export function t(locale: Locale, key: string, overrides?: Partial<Record<Locale, Record<string, unknown>>>): string`
  - `export function getDictionary(locale: Locale): typeof es`
  - `export function getAlternatePath(locale: Locale, pathname: string): string`

- [ ] **Step 1: Write the failing test in `website/tests/i18n.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { t, getDictionary, getAlternatePath } from '../src/i18n';

describe('i18n helper and Kinvia copy rules', () => {
  it('returns exact Hero claim and positioning in Spanish and English', () => {
    expect(t('es', 'hero.claim')).toBe('«Rentabilidad y Optimización. Integración y cercanía.»');
    expect(t('es', 'hero.subtitle')).toContain('Socio Tecnológico');
    expect(t('en', 'hero.claim')).toContain('Profitability');
    expect(t('en', 'hero.subtitle')).toContain('Tech Partner');
  });

  it('falls back to Spanish when an English key is missing, and returns the key path when unknown in both', () => {
    const customEn = { hero: {} };
    expect(t('en', 'hero.claim', { en: customEn })).toBe('«Rentabilidad y Optimización. Integración y cercanía.»');
    expect(t('es', 'nonexistent.deep.key')).toBe('nonexistent.deep.key');
  });

  it('enforces brand-voice rules: includes real contact details and forbids raw founder CV terms', () => {
    const esRaw = JSON.stringify(getDictionary('es'));
    const enRaw = JSON.stringify(getDictionary('en'));
    for (const raw of [esRaw, enRaw]) {
      expect(raw).toContain('info@kinvia.es');
      expect(raw).toContain('+34 644 21 93 52');
      expect(raw).not.toMatch(/Red Hat/i);
      expect(raw).not.toMatch(/Everis/i);
      expect(raw).not.toMatch(/Principal Software Engineer/i);
    }
  });

  it('maps alternate paths accurately between /es/ and /en/ routes', () => {
    expect(getAlternatePath('en', '/es/')).toBe('/en/');
    expect(getAlternatePath('es', '/en/')).toBe('/es/');
    expect(getAlternatePath('en', '/es/privacidad')).toBe('/en/privacy');
    expect(getAlternatePath('es', '/en/privacy')).toBe('/es/privacidad');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix website test -- tests/i18n.test.ts`
Expected: FAIL with `Cannot find module '../src/i18n'`

- [ ] **Step 3: Implement `website/src/i18n/es.json`, `website/src/i18n/en.json`, and `website/src/i18n/index.ts`**

Populate `es.json` and `en.json` with keys for:
- `meta` (`title`, `description`)
- `nav` (`skipLink`, `axes`, `services`, `model`, `contact`, `langSwitchLabel`)
- `hero` (`eyebrow`: "Kinvia · Socio Tecnológico" / "Kinvia · Tech Partner", `claim`: "«Rentabilidad y Optimización. Integración y cercanía.»" / "«Profitability & Optimization. Integration & Proximity.»", `subtitle`, `cta`: "Hablemos" / "Let's talk")
- `axes` (`title`, `subtitle`, `cloud`: title, tagline, description, outcomes; `iot`: title, tagline, description, outcomes)
- `services` (`title`, `subtitle`, `items`: 5 items for `it-in-house`, `custom-software`, `ai-cloud`, `finops`, `iot-agtech` with `title` and `summary`)
- `model` (`title`, `subtitle`, `items`: 3 modalities for `retainer`, `three-phase`, `iot-watchdog` with `title`, `badge`, `description`, `highlights`)
- `contact` (`title`, `subtitle`, `email`: `info@kinvia.es`, `phone`: `+34 644 21 93 52`, `phoneHref`: `tel:+34644219352`, `location`: "Orihuela Costa, Alicante", `form`: `nameLabel`, `namePlaceholder`, `emailLabel`, `emailPlaceholder`, `messageLabel`, `messagePlaceholder`, `privacyPrefix`, `privacyLinkText`, `privacyHref`, `submit`, `submitting`, `successTitle`, `successMessage`, `errorMessage`)
- `a11y` (`buttonLabel`, `panelTitle`, `themeLabel`, `themeDark`, `themeLight`, `contrastLabel`, `textSizeLabel`, `sizeNormal`, `sizeLarge`, `sizeLarger`, `reduceMotionLabel`, `shortcutsTitle`, `shortcutsHelpHint`, `closeLabel`, `shortcuts`: list of `?`, `1`–`5`, `Escape`)
- `footer` (`rights`, `privacyLink`)
- `privacy` (`title`, `updated`, `intro`, `controllerTitle`, `controllerText`, `purposeTitle`, `purposeText`, `dataTitle`, `dataText`, `rightsTitle`, `rightsText`, `legalGapNote`, `backHome`)

Implement `t()`, `getDictionary()`, and `getAlternatePath()` in `website/src/i18n/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix website test -- tests/i18n.test.ts`
Expected: PASS (4 passed)

- [ ] **Step 5: Commit**

```bash
git -C website add src/i18n/ tests/i18n.test.ts
git -C website commit -m "feat(i18n): add ES/EN dictionaries and fallback translation helper"
```

---

### Task 3: BaseLayout, Theme Boot Script & Privacy Pages (`/`, `/es/privacidad`, `/en/privacy`)

**Files:**
- Create: `website/src/utils/theme-boot.ts`
- Create: `website/src/layouts/BaseLayout.astro`
- Create: `website/src/components/Header.astro`
- Create: `website/src/components/Footer.astro`
- Create: `website/src/pages/index.astro`
- Create: `website/src/pages/es/privacidad.astro`
- Create: `website/src/pages/en/privacy.astro`
- Test: `website/tests/layout-and-privacy.test.ts`

**Interfaces:**
- Consumes: `Locale`, `t`, `getDictionary`, `getAlternatePath` from `website/src/i18n`
- Produces:
  - `applyStoredPreferences(doc: Document, storage: Pick<Storage, 'getItem'> | null, prefersLight: boolean): void` in `website/src/utils/theme-boot.ts`
  - `BaseLayout.astro` with props `{ locale: Locale; title?: string; description?: string; currentPath: string }`
  - `Header.astro` and `Footer.astro` with prop `{ locale: Locale; currentPath: string }`

- [ ] **Step 1: Write the failing test in `website/tests/layout-and-privacy.test.ts`**

```typescript
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { applyStoredPreferences, STORAGE_KEY } from '../src/utils/theme-boot';

describe('Theme and A11y boot resilience', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-contrast');
    document.documentElement.removeAttribute('data-text-size');
    document.documentElement.removeAttribute('data-reduce-motion');
  });

  it('defaults to dark when storage is empty and prefersLight is false', () => {
    const mockStorage = { getItem: () => null };
    applyStoredPreferences(document, mockStorage, false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('recovers gracefully from corrupted JSON or throwing storage', () => {
    const corruptedStorage = { getItem: () => '{bad-json' };
    expect(() => applyStoredPreferences(document, corruptedStorage, true)).not.toThrow();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    const throwingStorage = {
      getItem: () => {
        throw new Error('SecurityError');
      },
    };
    expect(() => applyStoredPreferences(document, throwingStorage, false)).not.toThrow();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('applies stored theme, contrast, textSize, and reduceMotion attributes', () => {
    const validStorage = {
      getItem: (key: string) =>
        key === STORAGE_KEY
          ? JSON.stringify({
              theme: 'light',
              highContrast: true,
              textSize: 'larger',
              reduceMotion: true,
            })
          : null,
    };
    applyStoredPreferences(document, validStorage, false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-contrast')).toBe('high');
    expect(document.documentElement.getAttribute('data-text-size')).toBe('larger');
    expect(document.documentElement.getAttribute('data-reduce-motion')).toBe('true');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix website test -- tests/layout-and-privacy.test.ts`
Expected: FAIL with `Cannot find module '../src/utils/theme-boot'`

- [ ] **Step 3: Implement `theme-boot.ts`, `BaseLayout.astro`, `Header.astro`, `Footer.astro`, `index.astro`, and Privacy pages**

Create `website/src/utils/theme-boot.ts` exporting `STORAGE_KEY = 'kinvia-a11y-prefs'`, `A11yPrefs` interface, and `applyStoredPreferences()`.
Create `website/src/layouts/BaseLayout.astro` with `<html lang={locale} data-theme="dark">`, `<link rel="alternate" hreflang="es" ...>`, `<link rel="alternate" hreflang="en" ...>`, `<link rel="alternate" hreflang="x-default" href="/es/" />`, favicons, inline boot script matching `applyStoredPreferences`, skip link `<a class="skip-link" href="#main-content">`, `<Header />`, `<main id="main-content" tabindex="-1"><slot /></main>`, and `<Footer />`.
Create `website/src/components/Footer.astro` computing `const currentYear = new Date().getFullYear()` dynamically and displaying section anchors, language switch, privacy link, and `© {currentYear} Kinvia`.
Create `website/src/pages/index.astro` with meta refresh + `Astro.redirect('/es/', 302)` and `website/src/pages/es/privacidad.astro` + `website/src/pages/en/privacy.astro` rendering the brief privacy notice (controller Kinvia in Orihuela Costa, `info@kinvia.es`, `+34 644 21 93 52`, purpose, form fields collected, explicit note that CIF/fiscal address will be updated upon registration).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix website test -- tests/layout-and-privacy.test.ts`
Expected: PASS (3 passed)

- [ ] **Step 5: Commit**

```bash
git -C website add src/utils/theme-boot.ts src/layouts/ src/components/Header.astro src/components/Footer.astro src/pages/index.astro src/pages/es/privacidad.astro src/pages/en/privacy.astro tests/layout-and-privacy.test.ts
git -C website commit -m "feat(layout): add BaseLayout, theme boot script, Header, Footer, and privacy pages"
```

---

### Task 4: Landing Storytelling Sections (Hero, Two Axes, Services, Commercial Model)

**Files:**
- Create: `website/src/components/Hero.astro`
- Create: `website/src/components/TwoAxes.astro`
- Create: `website/src/components/Services.astro`
- Create: `website/src/components/CommercialModel.astro`
- Create: `website/src/pages/es/index.astro`
- Create: `website/src/pages/en/index.astro`
- Test: `website/tests/landing-sections.test.ts`

**Interfaces:**
- Consumes: `Locale`, `t`, `getDictionary` from `website/src/i18n`; `BaseLayout.astro`
- Produces:
  - Semantic section landmarks `#hero`, `#axes`, `#services`, `#model` with `tabindex="-1"` for keyboard shortcut focus jumps
  - Single LCP image candidate in `Hero.astro` (`/images/logo-w.webp` with explicit `width`, `height`, `fetchpriority="high"`, `loading="eager"`)

- [ ] **Step 1: Write the failing test in `website/tests/landing-sections.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { getDictionary } from '../src/i18n';

const root = path.resolve(__dirname, '..');

describe('Landing Storytelling Sections', () => {
  it('defines all 5 services and 3 commercial modalities in both locales', () => {
    for (const locale of ['es', 'en'] as const) {
      const dict = getDictionary(locale);
      expect(dict.services.items).toHaveLength(5);
      expect(dict.model.items).toHaveLength(3);
      expect(dict.axes.cloud.title).toBeTruthy();
      expect(dict.axes.iot.title).toBeTruthy();
    }
  });

  it('ensures Hero.astro has a single LCP candidate with fetchpriority="high" and no cards or stats overlays', () => {
    const heroSource = fs.readFileSync(path.join(root, 'src/components/Hero.astro'), 'utf-8');
    expect(heroSource).toContain('id="hero"');
    expect(heroSource).toContain('fetchpriority="high"');
    expect(heroSource).toContain('href="#contact"');
    expect(heroSource).not.toMatch(/class="[^"]*\b(card|stat-badge|overlay-card)\b/i);
  });

  it('wires Hero, TwoAxes, Services, and CommercialModel in order in es/index.astro and en/index.astro', () => {
    for (const rel of ['src/pages/es/index.astro', 'src/pages/en/index.astro']) {
      const page = fs.readFileSync(path.join(root, rel), 'utf-8');
      const heroIdx = page.indexOf('<Hero');
      const axesIdx = page.indexOf('<TwoAxes');
      const servicesIdx = page.indexOf('<Services');
      const modelIdx = page.indexOf('<CommercialModel');
      expect(heroIdx).toBeGreaterThan(-1);
      expect(axesIdx).toBeGreaterThan(heroIdx);
      expect(servicesIdx).toBeGreaterThan(axesIdx);
      expect(modelIdx).toBeGreaterThan(servicesIdx);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix website test -- tests/landing-sections.test.ts`
Expected: FAIL with `ENOENT: no such file or directory, open '.../src/components/Hero.astro'`

- [ ] **Step 3: Implement `Hero.astro`, `TwoAxes.astro`, `Services.astro`, `CommercialModel.astro`, and `/es/` + `/en/` index pages**

Implement:
- `Hero.astro`: `<section id="hero" tabindex="-1">`, Kinvia logo `/images/logo-w.webp` (`width="240" height="79" fetchpriority="high" loading="eager"`), `<h1>` with `hero.claim`, supporting sentence `hero.subtitle`, and single CTA `<a href="#contact">{hero.cta}</a>`. No cards, stats, or badge overlays.
- `TwoAxes.astro`: `<section id="axes" tabindex="-1">` presenting Cloud & Software and IoT & Smart Spaces side-by-side with business outcome bullets.
- `Services.astro`: `<section id="services" tabindex="-1">` listing the 5 services (IT In-House, Custom Software, AI & Cloud, FinOps, IoT/AgTech) with title and concise outcome line.
- `CommercialModel.astro`: `<section id="model" tabindex="-1">` presenting the 3 transparent commercial modalities (Monthly Retainer + Hour Bank, 3-Phase Collaborative Projects, Open IoT CapEx + Watchdog/OTA Subscription).
- `src/pages/es/index.astro` and `src/pages/en/index.astro` rendering the sections in exact spec order inside `BaseLayout.astro`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix website test -- tests/landing-sections.test.ts`
Expected: PASS (3 passed)

- [ ] **Step 5: Commit**

```bash
git -C website add src/components/Hero.astro src/components/TwoAxes.astro src/components/Services.astro src/components/CommercialModel.astro src/pages/es/index.astro src/pages/en/index.astro tests/landing-sections.test.ts
git -C website commit -m "feat(landing): implement Hero, TwoAxes, Services, and CommercialModel sections"
```

---

### Task 5: Netlify Contact Form & Section (`ContactForm.tsx` + `ContactSection.astro`)

**Files:**
- Create: `website/src/components/ContactForm.tsx`
- Create: `website/src/components/ContactSection.astro`
- Modify: `website/src/pages/es/index.astro`
- Modify: `website/src/pages/en/index.astro`
- Test: `website/tests/contact-form.test.tsx`

**Interfaces:**
- Consumes: `Locale`, ` getDictionary` from `website/src/i18n`
- Produces:
  - `export function ContactForm({ locale, copy, initialSuccess }: ContactFormProps): JSX.Element` in `website/src/components/ContactForm.tsx`
  - `ContactSection.astro` with `#contact` landmark, visible `info@kinvia.es` and `+34 644 21 93 52`, and `<ContactForm client:visible />`

- [ ] **Step 1: Write the failing test in `website/tests/contact-form.test.tsx`**

```tsx
// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactForm } from '../src/components/ContactForm';
import { getDictionary } from '../src/i18n';

describe('Netlify ContactForm island', () => {
  it('renders Netlify form attributes, hidden form-name, and accessible fields with locale privacy link', () => {
    const copy = getDictionary('es').contact.form;
    const { container } = render(<ContactForm locale="es" copy={copy} />);
    const form = container.querySelector('form[name="contact"]');
    expect(form).not.toBeNull();
    expect(form?.getAttribute('method')).toBe('POST');
    expect(form?.getAttribute('data-netlify')).toBe('true');
    expect(form?.getAttribute('netlify-honeypot')).toBe('bot-field');

    const hiddenFormName = container.querySelector('input[type="hidden"][name="form-name"]') as HTMLInputElement;
    expect(hiddenFormName?.value).toBe('contact');

    const honeypotWrapper = container.querySelector('[data-honeypot="true"]');
    expect(honeypotWrapper?.getAttribute('aria-hidden')).toBe('true');
    const honeypotInput = container.querySelector('input[name="bot-field"]');
    expect(honeypotInput?.getAttribute('tabindex')).toBe('-1');

    const privacyCheckbox = container.querySelector('input[type="checkbox"][name="privacy"]') as HTMLInputElement;
    expect(privacyCheckbox?.required).toBe(true);

    const privacyLink = container.querySelector('a[href="/es/privacidad"]');
    expect(privacyLink).not.toBeNull();
  });

  it('silently discards bot submissions when honeypot bot-field is filled without calling fetch', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 200 }));
    const copy = getDictionary('en').contact.form;
    const { container } = render(<ContactForm locale="en" copy={copy} />);

    fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: 'Bot' } });
    fireEvent.change(container.querySelector('input[name="email"]')!, { target: { value: 'bot@example.com' } });
    fireEvent.change(container.querySelector('textarea[name="message"]')!, { target: { value: 'Spam' } });
    fireEvent.click(container.querySelector('input[name="privacy"]')!);
    fireEvent.change(container.querySelector('input[name="bot-field"]')!, { target: { value: 'i-am-a-bot' } });

    fireEvent.submit(container.querySelector('form[name="contact"]')!);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toBeTruthy();
    fetchSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix website test -- tests/contact-form.test.tsx`
Expected: FAIL with `Cannot find module '../src/components/ContactForm'`

- [ ] **Step 3: Implement `ContactForm.tsx`, `ContactSection.astro`, and add `<ContactSection />` to `/es/` and `/en/` pages**

Create `website/src/components/ContactForm.tsx` rendering `<form name="contact" method="POST" action={locale === 'es' ? '/es/?enviado=1#contact' : '/en/?sent=1#contact'} data-netlify="true" netlify-honeypot="bot-field">`, `<input type="hidden" name="form-name" value="contact" />`, honeypot wrapper `<div data-honeypot="true" aria-hidden="true" className="sr-only-honeypot"><input name="bot-field" tabIndex={-1} autoComplete="off" /></div>`, required `name`, `email`, `message`, and `privacy` checkbox linking to `copy.privacyHref` (`/es/privacidad` or `/en/privacy`). Support progressive enhancement: detect `?enviado=1` or `?sent=1` on mount or submit via URL-encoded `POST` to `/`, silently short-circuiting to success state if `bot-field` is non-empty.
Create `website/src/components/ContactSection.astro` displaying `info@kinvia.es`, `+34 644 21 93 52`, location `Orihuela Costa, Alicante`, and `<ContactForm client:visible locale={locale} copy={dict.contact.form} />`. Add `<ContactSection locale={locale} />` to `src/pages/es/index.astro` and `src/pages/en/index.astro`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix website test -- tests/contact-form.test.tsx`
Expected: PASS (2 passed)

- [ ] **Step 5: Commit**

```bash
git -C website add src/components/ContactForm.tsx src/components/ContactSection.astro src/pages/es/index.astro src/pages/en/index.astro tests/contact-form.test.tsx
git -C website commit -m "feat(contact): add Netlify ContactForm island and ContactSection"
```

---

### Task 6: Accessibility Panel & Keyboard Shortcuts Island (`A11yPanel.tsx`) + Full Build Verification

**Files:**
- Create: `website/src/components/A11yPanel.tsx`
- Modify: `website/src/layouts/BaseLayout.astro`
- Test: `website/tests/a11y-panel.test.tsx`
- Test: `website/tests/build-verification.test.ts`

**Interfaces:**
- Consumes: `STORAGE_KEY`, `A11yPrefs` from `website/src/utils/theme-boot.ts`; `a11y` copy from `website/src/i18n`
- Produces:
  - `export function A11yPanel({ copy }: { copy: ReturnType<typeof getDictionary>['a11y'] }): JSX.Element` mounted with `client:idle` in `BaseLayout.astro`

- [ ] **Step 1: Write the failing tests in `website/tests/a11y-panel.test.tsx` and `website/tests/build-verification.test.ts`**

`website/tests/a11y-panel.test.tsx`:
```tsx
// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { A11yPanel } from '../src/components/A11yPanel';
import { getDictionary } from '../src/i18n';
import { STORAGE_KEY } from '../src/utils/theme-boot';

describe('A11yPanel and keyboard shortcuts', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.removeAttribute('data-contrast');
    document.documentElement.removeAttribute('data-text-size');
    document.documentElement.removeAttribute('data-reduce-motion');
    document.body.innerHTML = `
      <section id="hero" tabindex="-1"></section>
      <section id="axes" tabindex="-1"></section>
      <section id="services" tabindex="-1"></section>
      <section id="model" tabindex="-1"></section>
      <section id="contact" tabindex="-1"><input id="test-input" type="text" /></section>
    `;
  });

  it('toggles theme, high contrast, text size, and reduce motion and persists to localStorage', () => {
    const copy = getDictionary('es').a11y;
    render(<A11yPanel copy={copy} />);

    fireEvent.click(screen.getByRole('button', { name: copy.buttonLabel }));
    fireEvent.click(screen.getByRole('button', { name: copy.themeLight }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    fireEvent.click(screen.getByRole('button', { name: copy.sizeLarge }));
    expect(document.documentElement.getAttribute('data-text-size')).toBe('large');

    fireEvent.click(screen.getByRole('switch', { name: copy.contrastLabel }));
    expect(document.documentElement.getAttribute('data-contrast')).toBe('high');

    fireEvent.click(screen.getByRole('switch', { name: copy.reduceMotionLabel }));
    expect(document.documentElement.getAttribute('data-reduce-motion')).toBe('true');

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    expect(saved).toMatchObject({
      theme: 'light',
      textSize: 'large',
      highContrast: true,
      reduceMotion: true,
    });
  });

  it('handles ? to open shortcuts help, 1-5 to jump sections, Escape to close, and ignores keys inside inputs', () => {
    const copy = getDictionary('es').a11y;
    render(<A11yPanel copy={copy} />);

    const servicesEl = document.getElementById('services')!;
    const scrollSpy = vi.fn();
    servicesEl.scrollIntoView = scrollSpy;

    // Typing inside an input must NOT trigger shortcuts
    const input = document.getElementById('test-input')!;
    input.focus();
    fireEvent.keyDown(input, { key: '3' });
    fireEvent.keyDown(input, { key: '?' });
    expect(scrollSpy).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();

    // Pressing 3 on document body jumps to #services
    input.blur();
    document.documentElement.dataset.reduceMotion = 'true';
    fireEvent.keyDown(document, { key: '3' });
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });

    // Pressing ? opens shortcuts dialog, Escape closes it
    fireEvent.keyDown(document, { key: '?' });
    expect(screen.getByRole('dialog')).not.toBeNull();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
```

`website/tests/build-verification.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const root = path.resolve(__dirname, '..');

describe('Astro static build verification checklist', () => {
  it('builds static HTML for /es/, /en/, /es/privacidad, and /en/privacy meeting all spec checks', () => {
    execSync('npm run build', { cwd: root, stdio: 'pipe' });

    const esHtml = fs.readFileSync(path.join(root, 'dist/es/index.html'), 'utf-8');
    const enHtml = fs.readFileSync(path.join(root, 'dist/en/index.html'), 'utf-8');
    const esPrivHtml = fs.readFileSync(path.join(root, 'dist/es/privacidad/index.html'), 'utf-8');
    const enPrivHtml = fs.readFileSync(path.join(root, 'dist/en/privacy/index.html'), 'utf-8');

    const $es = cheerio.load(esHtml);
    expect($es('link[rel="alternate"][hreflang="es"]').attr('href')).toContain('/es/');
    expect($es('link[rel="alternate"][hreflang="en"]').attr('href')).toContain('/en/');
    expect($es('link[rel="alternate"][hreflang="x-default"]').attr('href')).toContain('/es/');
    expect($es('#hero h1').text()).toContain('Rentabilidad y Optimización. Integración y cercanía.');
    expect($es('form[name="contact"][data-netlify="true"]').length).toBe(1);
    expect($es('a[href="/es/privacidad"]').length).toBeGreaterThan(0);
    expect(esHtml).toContain('info@kinvia.es');
    expect(esHtml).toContain('+34 644 21 93 52');
    expect(esHtml).toContain(String(new Date().getFullYear()));

    const $en = cheerio.load(enHtml);
    expect($en('form[name="contact"][data-netlify="true"]').length).toBe(1);
    expect($en('a[href="/en/privacy"]').length).toBeGreaterThan(0);

    expect(esPrivHtml).toContain('Orihuela Costa');
    expect(enPrivHtml).toContain('Orihuela Costa');
  }, 30000);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm --prefix website test -- tests/a11y-panel.test.tsx`
Expected: FAIL with `Cannot find module '../src/components/A11yPanel'`

- [ ] **Step 3: Implement `website/src/components/A11yPanel.tsx` and mount it in `website/src/layouts/BaseLayout.astro`**

Implement `A11yPanel.tsx` with:
- Floating trigger button + header trigger integration
- Controls for theme (`dark` | `light`), text size (`normal` | `large` | `larger`), high contrast switch (`role="switch"`), reduce motion switch (`role="switch"`), and button to open keyboard shortcuts help view
- Global `keydown` listener ignoring events when `event.target` is an `HTMLInputElement`, `HTMLTextAreaElement`, `HTMLSelectElement`, or `isContentEditable`, handling `?` (toggle help dialog), `1`–`5` (scroll and focus `#hero`, `#axes`, `#services`, `#model`, `#contact` using `behavior: 'auto'` when reduced motion is active via OS media query or `dataset.reduceMotion === 'true'`, else `'smooth'`), and `Escape` (close open panel/modal).
Mount `<A11yPanel client:idle copy={dict.a11y} />` in `BaseLayout.astro`.

- [ ] **Step 4: Run full test suite and static build verification**

Run: `npm --prefix website test`
Expected: PASS (all 6 test files passing, including `astro build` verification)

- [ ] **Step 5: Commit**

```bash
git -C website add src/components/A11yPanel.tsx src/layouts/BaseLayout.astro tests/a11y-panel.test.tsx tests/build-verification.test.ts
git -C website commit -m "feat(a11y): add A11yPanel island, keyboard shortcuts, and full build verification"
```
