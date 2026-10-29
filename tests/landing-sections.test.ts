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

  it('ensures Hero.astro has localized id, data-section="hero", single LCP candidate with fetchpriority="high", and localized contact CTA', () => {
    const heroSource = fs.readFileSync(path.join(root, 'src/components/Hero.astro'), 'utf-8');
    expect(heroSource).toContain('id={dict.nav.anchors.hero}');
    expect(heroSource).toContain('data-section="hero"');
    expect(heroSource).toContain('fetchpriority="high"');
    expect(heroSource).toContain('href={`#${dict.nav.anchors.contact}`}');
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

  it('embeds SuccessCasesCarousel in both columns of TwoAxes.astro with min-width: 0 for clean grid tracks', () => {
    const twoAxesSource = fs.readFileSync(path.join(root, 'src/components/TwoAxes.astro'), 'utf-8');
    expect(twoAxesSource).toContain('SuccessCasesCarousel');
    expect(twoAxesSource).toContain('division="cloud"');
    expect(twoAxesSource).toContain('division="iot"');
    expect(twoAxesSource).toContain('min-width: 0');
  });
});
