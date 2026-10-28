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

