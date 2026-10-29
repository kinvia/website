import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const root = path.resolve(__dirname, '..');

describe('Astro static build verification checklist', () => {
  it('builds static HTML for /es/, /en/, /es/privacidad, and /en/privacy meeting all spec checks and localized anchors', () => {
    execSync('npm run build', { cwd: root, stdio: 'pipe' });

    const esHtml = fs.readFileSync(path.join(root, 'dist/es/index.html'), 'utf-8');
    const enHtml = fs.readFileSync(path.join(root, 'dist/en/index.html'), 'utf-8');
    const esPrivHtml = fs.readFileSync(path.join(root, 'dist/es/privacidad/index.html'), 'utf-8');
    const enPrivHtml = fs.readFileSync(path.join(root, 'dist/en/privacy/index.html'), 'utf-8');

    const $es = cheerio.load(esHtml);
    expect($es('link[rel="alternate"][hreflang="es"]').attr('href')).toContain('/es/');
    expect($es('link[rel="alternate"][hreflang="en"]').attr('href')).toContain('/en/');
    expect($es('link[rel="alternate"][hreflang="x-default"]').attr('href')).toContain('/es/');
    expect($es('#inicio h1').text()).toContain('Rentabilidad y Optimización. Integración y cercanía.');
    expect($es('#divisiones').length).toBe(1);
    expect($es('#servicios').length).toBe(1);
    expect($es('#modelos').length).toBe(1);
    expect($es('#contacto').length).toBe(1);
    expect($es('form[name="contact"][data-netlify="true"]').length).toBe(1);
    expect($es('a[href="/es/privacidad"]').length).toBeGreaterThan(0);
    expect(esHtml).toContain('info@kinvia.es');
    expect(esHtml).toContain('+34 644 21 93 52');
    expect(esHtml).toContain(String(new Date().getFullYear()));

    // Verify all 5 case studies exist in built HTML for /es/
    expect(esHtml).toContain('Sercore');
    expect(esHtml).toContain('Ramos Calabria');
    expect(esHtml).toContain('CAPSA / UCAM');
    expect(esHtml).toContain('Chalet Gran Alacant');
    expect(esHtml).toContain('Villa Punta Prima');
    expect(esHtml).toContain('/images/cases/sercore-1.webp');
    expect(esHtml).toContain('/images/cases/iot-gran-alacant-1.webp');

    const $en = cheerio.load(enHtml);
    expect($en('#hero').length).toBe(1);
    expect($en('#axes').length).toBe(1);
    expect($en('#services').length).toBe(1);
    expect($en('#model').length).toBe(1);
    expect($en('#contact').length).toBe(1);
    expect($en('form[name="contact"][data-netlify="true"]').length).toBe(1);
    expect($en('a[href="/en/privacy"]').length).toBeGreaterThan(0);
    expect(enHtml).toContain('Sercore');
    expect(enHtml).toContain('Chalet Gran Alacant');
    expect(enHtml).toContain('/images/cases/rc-1.webp');

    expect(esPrivHtml).toContain('Orihuela Costa');
    expect(enPrivHtml).toContain('Orihuela Costa');
  }, 30000);
});
