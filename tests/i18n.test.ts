import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { t, getDictionary, getAlternatePath, translateHash } from '../src/i18n';

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

  it('defines 3 Cloud cases and 2 IoT cases with 3 optimized WebP images (< 250KB) each in ES and EN', () => {
    const es = getDictionary('es');
    const en = getDictionary('en');

    expect(es.axes.cloud.cases.map((c) => c.id)).toEqual([
      'sercore',
      'ramos-calabria',
      'capsa-ucam',
    ]);
    expect(en.axes.cloud.cases.map((c) => c.id)).toEqual([
      'sercore',
      'ramos-calabria',
      'capsa-ucam',
    ]);

    expect(es.axes.iot.cases.map((c) => c.id)).toEqual([
      'villa-gran-alacant',
      'villa-punta-prima',
    ]);
    expect(en.axes.iot.cases.map((c) => c.id)).toEqual([
      'villa-gran-alacant',
      'villa-punta-prima',
    ]);

    const allCases = [
      ...es.axes.cloud.cases,
      ...es.axes.iot.cases,
      ...en.axes.cloud.cases,
      ...en.axes.iot.cases,
    ];
    for (const c of allCases) {
      expect(c.images).toHaveLength(3);
      expect(c.challenge.length).toBeGreaterThan(20);
      expect(c.solution.length).toBeGreaterThan(20);
      expect(c.impact.length).toBeGreaterThan(15);
      expect(c.highlights.length).toBeGreaterThanOrEqual(3);

      for (const img of c.images) {
        expect(img.src).toMatch(/^\/images\/cases\/[a-z0-9-]+-[123]\.webp$/);
        const filePath = path.resolve(process.cwd(), 'public', img.src.replace(/^\//, ''));
        expect(fs.existsSync(filePath)).toBe(true);
        const stat = fs.statSync(filePath);
        expect(stat.size).toBeGreaterThan(5000);
        expect(stat.size).toBeLessThan(250 * 1024);
      }
    }
  });
});
