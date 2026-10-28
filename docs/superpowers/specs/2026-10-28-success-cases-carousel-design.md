# Success Cases Carousel & Optimized Client Assets — Design Spec

**Date:** 2026-10-28  
**Repo / Worktree:** `website/.worktrees/redesign`  
**Status:** Ready for approval  
**Scope:** Small-to-medium feature change (new landing section, interactive dual-animated carousel island, WebP asset pipeline, and navigation anchor integration)

---

## 1. Intent & Why

Incorporate real-world social proof and engineering track record from `company-context/portfolio-and-success-cases.md` (**Sercore**, **Ramos Calabria**, and **CAPSA / UCAM**) directly into the Kinvia bilingual (`ES`/`EN`) landing page, accompanied by the 9 product screenshots provided in `/tmp/kinvia/clientes/*.jpeg` (3 per client). This proves Kinvia's core promise — zero-downtime production reliability and business-first engineering — right before the visitor reaches the contact section.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- **Optimize all 9 client images for the web:** Convert the 9 high-resolution JPEGs (`2752x1536` and `2400x1792`, ~2.2–2.6 MB each, ~20 MB total) from `/tmp/kinvia/clientes/` into optimized `.webp` files in `public/images/cases/` (max width `1280px`, quality `82`, ~70–120 KB per image).
- **Horizontal Case Study Carousel (Option B) with Dual Transitions:**
  - **Client Track Transition:** Horizontal carousel track where the active client card occupies ~80% of the container width on desktop (`100%` on mobile) with the adjacent client card peeking on the right. Switching clients (via prev/next buttons, pagination dots, keyboard arrows, or clicking the peeking card) animates smoothly (`transform`, `scale`, and `opacity`).
  - **Internal 3-Screen Gallery Transition:** Inside each client card's media header, a 3-screenshot showcase with smooth animated transitions (*crossfade* + subtle slide) between the 3 product views, interactive module tabs (`1`, `2`, `3` with descriptive captions), and prev/next controls.
  - **Accessibility & Reduced Motion:** Respects `data-reduce-motion="true"` and `prefers-reduced-motion: reduce` by disabling slide/fade animations automatically; full ARIA semantics and keyboard support.
- **Complete Bilingual Content (`ES` & `EN`):**
  - **01. Sercore** (Reformas y Aseguradoras / Home Renovation & Insurance): Legacy 1980s MS-DOS migration to containerized multi-service web platform (Docker, AngularJS, CI/CD) with zero production incidents.
  - **02. Ramos Calabria** (Despacho de Abogados / Law Firm): Full "IT In-House" outsourcing (servers, networking) + high-speed custom `.NET` legal dossier, instant document preview, and court deadline platform.
  - **03. CAPSA / UCAM** (Salud e Investigación / Clinical Health & Research): Interactive 3D anatomical body-fold model, advanced physiological algorithms, and real-time USDA nutritional database integration.
- **Navigation, Scrollspy & A11y Shortcut Integration:**
  - Place the section between **CommercialModel** (`#modelos` / `#model`) and **ContactSection** (`#contacto` / `#contact`).
  - Add localized anchor `cases`: `#casos` in Spanish (`/es/#casos`) and `#cases` in English (`/en/#cases`), synchronized across `Header.astro`, `Footer.astro`, `translateHash()`, and `A11yPanel.tsx` shortcuts (`1`–`6`).

### Non-Goals
- Separate multi-page routes per case study (`/es/casos/...`).
- Auto-playing carousels that hijack scroll position.

### Anti-Goals
- Shipping unoptimized multi-megabyte JPEG files to production.
- Breaking existing scrollspy, language-switcher hash translation, or accessibility panel tests.

---

## 3. Constraints

- Must preserve Kinvia's dark-first Industrial Precision aesthetic (`tokens.css` & `global.css`) with full light-mode and high-contrast support.
- Must work cleanly in Astro 5 static build (`astro build`) and pass all Vitest unit, JSDOM, and static build verification checks.

---

## 4. Approaches Considered

1. **Approach 1 (Chosen) — React Island (`SuccessCasesCarousel.tsx` with `client:visible`) + Astro Wrapper (`SuccessCases.astro`) + `sharp` Asset Optimization:**
   - `SuccessCases.astro` renders the `<section id={dict.nav.anchors.cases} data-section="cases">` container and section header in static HTML, hydrating `<SuccessCasesCarousel client:visible copy={dict.cases} />` when scrolled into view.
   - `SuccessCasesCarousel.tsx` manages both the active client index (`0..2`) and each client's active screenshot index (`0..2`) declaratively, rendering all 3 cards in the SSR output for SEO while applying smooth CSS transitions on client and image switches.
   - `sharp` (already installed in `node_modules`) converts `/tmp/kinvia/clientes/{sercore,rc,capsa}{1..3}.jpeg` into `public/images/cases/{sercore,rc,capsa}-{1..3}.webp`.
   - *Trade-off:* Adds ~3 KB gzipped of deferred client JS in exchange for clean state management, rich dual animations, and straightforward unit testing with `@testing-library/react`.
2. **Approach 2 (Rejected) — Pure Astro + Inline Vanilla JS DOM Manipulation:**
   - Zero React hydration overhead, but imperative synchronization of nested carousels (client track + per-client 3-image switcher + ARIA attributes + keyboard navigation) is brittle and harder to test reliably.

---

## 5. Decisions Agreed with User

- **Layout:** Option B — Horizontal sliding card track with side peek of the next case study and an internal 3-screen gallery inside each card.
- **Animations:** Smooth visual transitions both when switching between clients and when switching between the 3 screenshots of a client.
- **Placement & Anchor:** Positioned between `CommercialModel` and `ContactSection` under `#casos` (`ES`) and `#cases` (`EN`).
- **Asset Optimization:** Resize and compress the 9 images from `/tmp/kinvia/clientes` into lightweight WebP assets for the web.

---

## 6. What Is Left to the Builder

- Updating `A11yPanel.tsx` `SECTION_MAP` so keys `1`–`6` map to `hero`, `axes`, `services`, `model`, `cases`, `contact` (and updating `a11y.shortcuts` in `es.json` and `en.json`).
- Exact CSS grid/flex track geometry (`--active-case-index` CSS custom property or transform calculation) so the active card is prominent and the next card peeks cleanly on desktop while stacking/swiping full-width on `< 768px`.
- Reusable Node script (`scripts/optimize-case-images.mjs`) using `sharp` to generate the 9 `.webp` files deterministically.
