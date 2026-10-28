# Kinvia Website Redesign — Design Spec

**Date:** 2026-10-28  
**Repo:** `website/`  
**Status:** Approved for implementation planning  
**Sources of truth (copy & positioning):** `company-context/` (`company-profile.md`, `brand-voice.md`)

---

## 1. Goal

Replace the previous IoT-only marketing site with a new **Tech Partner** landing that covers both business units (Cloud & Software and IoT & Smart Spaces), bilingual ES/EN, optimized for **FCP/LCP**, deployed on **Netlify Free**, with contact via **Netlify Forms**.

Reference for scroll/storytelling feel only: [kinvia.es](https://kinvia.es/). Visual design is **new** (not a clone).

---

## 2. Scope

### In scope (MVP)

- Astro SSG + `@astrojs/react` islands
- Single long-page storytelling scroll per locale
- Locales: `es` (default) and `en` under `/es/` and `/en/`
- JSON translation files
- `hreflang` alternate links (`es`, `en`, `x-default`)
- Dark-first UI with light/dark toggle
- Accessibility panel + keyboard shortcuts (level B below)
- Netlify Forms contact (name, email, message + privacy checkbox)
- Brief privacy pages (no CIF/fiscal address yet)
- Stock imagery (licensed) + existing logos/favicons in repo
- Dynamic copyright year in footer
- Deploy config for Netlify Free (`netlify.toml`, redirect `/` → `/es/`)

### Out of scope (MVP)

- Custom email backend (Resend, Netlify Functions for mail, SMTP server)
- Google Analytics 4 and cookie consent banner
- Full legal pack (CIF, fiscal address, Aviso legal completo)
- Locales DE/DA
- Voice synthesis / voice commands
- CMS, blog, auth, multi-page marketing beyond privacy

---

## 3. Architecture

```
Browser
  → Netlify CDN (static Astro HTML/CSS/assets)
  → React islands (form UX helpers, a11y panel, light motions)
  → Netlify Forms (POST contact) → notify info@kinvia.es
```

| Layer | Choice | Rationale |
| :--- | :--- | :--- |
| Framework | Astro (SSG) | Best FCP/LCP on Free tier; minimal JS by default |
| Interactivity | `@astrojs/react` islands | Form/a11y/motion only; `client:idle` / `client:visible` |
| Hosting | Netlify Free | Stated constraint |
| Contact | Netlify Forms + honeypot | No custom mail stack in MVP |
| i18n | Astro routing + `src/i18n/{es,en}.json` | Explicit URLs + JSON as requested |
| Content | Hardcoded sections fed by JSON / company-context | No CMS |

**Rejected for MVP:** Astro hybrid/SSR for the whole site; Resend/Functions mail; Netlify Forms-only without Astro islands where needed.

---

## 4. Information architecture

### Routes

| Path | Purpose |
| :--- | :--- |
| `/` | Redirect to `/es/` |
| `/es/` | Landing ES |
| `/en/` | Landing EN |
| `/es/privacidad` | Privacy (brief) ES |
| `/en/privacy` | Privacy (brief) EN |

### Landing section order

1. **Hero** — Brand Kinvia as hero-level signal; claim *«Rentabilidad y Optimización. Integración y cercanía.»*; one supporting sentence (Socio Tecnológico); one CTA group (to contact / “Hablemos”). One composition; no cards, stats, or badge overlays.
2. **Two axes** — Cloud & Software | IoT & Smart Spaces (value props; no founder CV pitch).
3. **Services** — IT In-House, Custom software, AI & Cloud, FinOps, IoT/AgTech (title + short line each).
4. **Commercial model** — Monthly retainer + hour bank | 3-phase projects | IoT CapEx + Watchdog/OTA (high level).
5. **Contact** — Visible `info@kinvia.es` and `+34 644 21 93 52`; form; privacy microcopy + checkbox.
6. **Footer** — Section anchors, language switch, privacy link, `© {currentYear} Kinvia`.

Copy rules: `brand-voice.md` (tú in ES, direct EN); translate tech solvency into business outcomes per segment; no resume-as-sales.

---

## 5. Visual design

- **Atmosphere:** Dark / nocturnal by default; high contrast; “infrastructure / Cloud Native” feel; **new** system (not kinvia.es chrome).
- **Tokens:** CSS variables for background, elevated surfaces, text, **one** technical accent. Avoid generic purple-glow AI aesthetic.
- **Typography:** Expressive display + readable body; do not use Inter, Roboto, Arial, or system-ui as the primary stack.
- **Imagery:** Licensed stock + logos in `images/` (light/dark variants as needed). Compress (WebP/AVIF via Astro assets); explicit dimensions; careful LCP for hero.
- **Layout:** Full-bleed hero plane; one job per section; cards only when required for interaction (form / a11y controls).
- **Motion (medium):** About three intentional moments (hero entrance, axes reveal, CTA emphasis). Honor `prefers-reduced-motion` and a11y “reduce motion”.
- **Themes:** Light theme fully supported via toggle; both themes target WCAG AA contrast.

---

## 6. Accessibility (level B)

### Native baseline

- Skip link, landmarks, visible focus, keyboard-operable nav and form
- Correct labels/`aria` on controls
- AA contrast in light and dark
- Honeypot field hidden from assistive tech appropriately

### Accessibility panel (React island)

- Text size: normal / large / larger (document root class or CSS variables)
- High contrast mode
- Reduce motion
- Light / dark theme toggle
- Entry to keyboard shortcut help

Persistence: `localStorage`. Initial theme: stored preference, else `prefers-color-scheme`, else dark.

### Keyboard shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Tab` / focus | Skip link available |
| `?` | Open shortcuts help |
| `1`…`n` | Jump to main sections (hero, axes, services, model, contact) |
| `Escape` | Close panel / modal |

Load panel with `client:idle` or on first open so it does not block LCP.

---

## 7. Contact form (Netlify Forms)

- `name="contact"`, `method="POST"`, `data-netlify="true"`, `netlify-honeypot="bot-field"`
- Fields: `name`, `email`, `message`, privacy checkbox (`required`), honeypot
- Labels and placeholders from i18n JSON
- Hidden `form-name` for Netlify as per docs
- Success: in-page confirmation or `?enviado=1` / `?sent=1` (locale-aware)
- Netlify form notifications → `info@kinvia.es`

No custom serverless mail in MVP.

---

## 8. Privacy (MVP)

- Brief pages at `/es/privacidad` and `/en/privacy`
- State: controller contact (Kinvia, Orihuela Costa, email, phone), purpose (respond to enquiries), data collected (form fields), no CIF/fiscal address yet (explicit gap to fill later)
- Form checkbox required; links to privacy page
- No GA4 and no cookie banner until legal identity is complete

---

## 9. Performance budget (targets)

- Static HTML on CDN; no JS required for first paint of hero content
- Single LCP candidate in hero (`fetchpriority="high"` when image-based)
- Self-hosted or subset fonts; `font-display: swap`
- Below-fold images lazy-loaded
- Islands only for form enhancements, a11y panel, optional motion
- Verify with Lighthouse mobile (FCP, LCP, CLS) on Netlify preview

---

## 10. Repository layout

```
website/
  public/                 # favicons, webmanifest, optional static logos
  images/                 # existing brand assets (migrate into public/ or src/assets as needed)
  src/
    components/           # Astro sections + React islands
    layouts/              # BaseLayout (meta, hreflang, theme boot)
    pages/
      es/index.astro
      es/privacidad.astro
      en/index.astro
      en/privacy.astro
    i18n/es.json
    i18n/en.json
    styles/               # design tokens, themes, global
  netlify.toml
  docs/superpowers/specs/ # this document
```

`netlify.toml`: publish `dist`; redirect `/` → `/es/`; enable forms.

---

## 11. Error handling

- HTML5 validation on form; clear error/success copy in both locales
- Silent honeypot discard
- Missing i18n key → fall back to Spanish string (dev warning optional)
- Theme/a11y script failures must not break static content
- Reduce-motion OS preference and panel toggle both disable non-essential animation

---

## 12. Verification checklist

- [ ] `/` redirects to `/es/`
- [ ] `/es/` and `/en/` render full landing; `hreflang` present
- [ ] Privacy pages linked from form checkbox
- [ ] Netlify Forms submission works on deploy preview; mail to `info@kinvia.es`
- [ ] Theme toggle + a11y panel persist; AA contrast spot-check
- [ ] Keyboard: skip link, `?`, section shortcuts, form without mouse
- [ ] `prefers-reduced-motion` respected
- [ ] Footer year is dynamic
- [ ] Lighthouse mobile: no major FCP/LCP regressions vs empty Astro baseline
- [ ] Contact shows `info@kinvia.es` and `+34 644 21 93 52`

---

## 13. Decisions log

| Topic | Decision |
| :--- | :--- |
| Positioning | Full Tech Partner (both divisions) |
| Scroll | Single long storytelling page |
| Mail | Netlify Forms (not Resend/SMTP/Functions) |
| Visual | New dark-first design; stock + logos |
| i18n | `/es`, `/en` + JSON + hreflang |
| Form fields | Name, email, message (+ privacy checkbox) |
| Analytics | Deferred (no GA4 in MVP) |
| Legal | Brief privacy only; no CIF yet |
| A11y | Level B (panel + shortcuts, no voice) |
| Phone | +34 644 21 93 52 |
| Copyright | Dynamic current year |
