# Division-Integrated Success Cases Carousels & Optimized Assets — Design Spec

**Date:** 2026-10-29  
**Repo / Worktree:** `website/.worktrees/redesign`  
**Status:** Ready for approval  
**Scope:** Feature enhancement inside `TwoAxes.astro` (`#divisiones` / `#axes`) — dual division carousels, 5 bilingual case studies, and 15 optimized WebP screenshots

---

## 1. Intent & Why

Instead of adding a 6th top-level section to the landing page, integrate Kinvia's 5 real-world success cases from `company-context/portfolio-and-success-cases.md` directly inside the **Divisiones / Two Axes** section (`TwoAxes.astro`), placing a dedicated horizontal case-study carousel at the bottom of each division column:
- **Columna 1 — Cloud & Software (3 casos):** **Sercore**, **Ramos Calabria**, and **CAPSA / UCAM**.
- **Columna 2 — IoT & Espacios Inteligentes (2 casos):** **Villa Gran Alacant** and **Villa Punta Prima**.

This keeps the 5-section navigation hierarchy (`inicio`, `divisiones`, `servicios`, `modelos`, `contacto`) clean while immediately backing each division's value proposition with tangible visual proof and production outcomes.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- **Optimize all 15 client images for the web:** Convert the 15 high-resolution JPEGs (`2752x1536` and `2400x1792`, ~2.0–2.8 MB each, ~34 MB total) in `/tmp/kinvia/clientes/` into optimized `.webp` files in `public/images/cases/` (max width `1280px`, quality `82`, ~70–120 KB each):
  - `sercore-1.webp`, `sercore-2.webp`, `sercore-3.webp`
  - `rc-1.webp`, `rc-2.webp`, `rc-3.webp`
  - `capsa-1.webp`, `capsa-2.webp`, `capsa-3.webp`
  - `iot-gran-alacant-1.webp`, `iot-gran-alacant-2.webp`, `iot-gran-alacant-3.webp`
  - `iot-punta-prima-1.webp`, `iot-punta-prima-2.webp`, `iot-punta-prima-3.webp`
- **Two Independent Horizontal Carousels (One per Division Column in `TwoAxes.astro`):**
  - **Option B Horizontal Track with Peek & Client Transition:** Inside each `.axis-column`, a horizontal sliding track where the active case study card occupies ~85% of the column width with the next case study card peeking on the right. Switching between cases (via prev/next controls, pagination pills, keyboard arrows, or clicking the peeking card) animates smoothly (`transform`, `scale`, and `opacity`).
  - **Internal 3-Screen Animated Gallery:** At the top of each case card, a media showcase displaying its 3 product views with smooth *crossfade* + subtle slide transitions, module selector tabs (`1`, `2`, `3` with descriptive captions), and prev/next image controls.
  - **Accessibility & Reduced Motion:** Automatically respects `data-reduce-motion="true"` and `prefers-reduced-motion: reduce`; full keyboard navigation and ARIA attributes.
- **Complete Bilingual Content (`ES` & `EN`) for All 5 Cases:**
  - **Cloud & Software (`axes.cloud.cases`):**
    1. **Sercore** (Reformas y Aseguradoras / Renovation & Insurance): 1980s MS-DOS migration to Docker/AngularJS/CI-CD multi-service web platform with zero production incidents.
    2. **Ramos Calabria** (Despacho de Abogados / Law Firm): Full "IT In-House" + high-speed custom `.NET` legal dossier, instant document preview, and court deadline system.
    3. **CAPSA / UCAM** (Salud e Investigación / Clinical Health & Research): Interactive 3D anatomical skinfold model, physiological algorithms, and USDA nutritional database integration.
  - **IoT & Espacios Inteligentes (`axes.iot.cases`):**
    4. **Villa Gran Alacant** (Obra Nueva y Eficiencia Solar / Luxury New-Build & Solar Efficiency): 100% local Home Assistant + Zigbee/Wi-Fi hub, custom ESP32 biometric access, solar-tracking bioclimatic automation, and appliance retrofit.
    5. **Villa Punta Prima** (Retrofit "Tecnología Invisible" / "Invisible Tech" Heritage Retrofit): Hidden automation behind classic switches, Zero-Touch proximity vehicle arrival & perimeter security, and custom 16-zone smart irrigation with local weather station.

### Non-Goals
- Adding a new top-level section or altering the 5 navigation anchors (`#inicio`, `#divisiones`, `#servicios`, `#modelos`, `#contacto` / `#hero`, `#axes`, `#services`, `#model`, `#contact`).
- Dedicated multi-page routes per case study.

### Anti-Goals
- Letting carousel tracks overflow `.axis-column` grid tracks (must enforce `min-width: 0` on `.axis-column`).
- Shipping raw multi-megabyte JPEGs.

---

## 3. Approaches Considered

1. **Approach 1 (Chosen) — Reusable React Island (`SuccessCasesCarousel.tsx` with `client:visible`) Mounted in Both Columns of `TwoAxes.astro` + `sharp` WebP Pipeline:**
   - Render two instances of `<SuccessCasesCarousel client:visible ... />` inside `TwoAxes.astro` — one under `.axis-column` for Cloud & Software (3 cases) and one under `.axis-column` for IoT & Smart Spaces (2 cases).
   - Each instance independently manages its active case index and per-case active screenshot index (`0..2`), with smooth CSS transitions for both client cards and screenshots.
   - `scripts/optimize-case-images.mjs` uses `sharp` to convert all 15 source JPEGs from `/tmp/kinvia/clientes/` into `public/images/cases/*.webp`.
2. **Approach 2 (Rejected) — Separate Standalone Landing Section:**
   - Adds a 6th section and mixes Cloud and IoT cases in a single track instead of reinforcing each division directly where the visitor reads about it.

---

## 4. What Is Left to the Builder

- Setting `min-width: 0; display: flex; flex-direction: column;` on `.axis-column` in `TwoAxes.astro` so both columns and their embedded carousels align cleanly side-by-side without horizontal grid blowout.
- Normalizing screenshot aspect ratios inside the card media frame (`aspect-ratio: 16 / 10` with `object-fit: cover`) so `2752x1536` and `2400x1792` captures display with uniform height.
