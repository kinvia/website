// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..');

describe('Header Responsive and Scrollspy', () => {
  const headerSource = fs.readFileSync(path.join(root, 'src/components/Header.astro'), 'utf-8');

  it('hides primary navigation on mobile screens below 768px', () => {
    expect(headerSource).toMatch(/@media\s*\(\s*max-width:\s*768px\s*\)[^{]*\{[\s\S]*?\.primary-nav\s*\{[^}]*display:\s*none/);
  });

  it('removes permanent bold styling from nav-cta to avoid false active appearance', () => {
    expect(headerSource).not.toMatch(/\.nav-cta\s*\{[^}]*font-weight:\s*700/);
    expect(headerSource).toContain('.nav-list a.is-active');
  });

  it('activates the matching nav link when header script runs before main sections are parsed and user scrolls', () => {
    const scriptMatch = headerSource.match(/<script is:inline>([\s\S]*?)<\/script>/);
    expect(scriptMatch).not.toBeNull();
    const inlineScript = scriptMatch![1];

    // Simulate browser parsing <header> BEFORE <main> exists
    document.body.innerHTML = `
      <header class="site-header">
        <ul class="nav-list">
          <li><a href="/es/#hero">Inicio</a></li>
          <li><a href="/es/#axes">Divisiones</a></li>
          <li><a href="/es/#services">Servicios</a></li>
          <li><a href="/es/#model">Modelo</a></li>
          <li><a href="/es/#contact">Contacto</a></li>
        </ul>
      </header>
    `;

    Object.defineProperty(document, 'readyState', {
      configurable: true,
      get: () => 'loading',
    });

    // Execute inline script while readyState is 'loading' and <main> is not yet in DOM
    window.eval(inlineScript);

    // Now browser finishes parsing <main> sections and fires DOMContentLoaded
    document.body.insertAdjacentHTML(
      'beforeend',
      `
      <main>
        <section id="hero"></section>
        <section id="axes"></section>
        <section id="services"></section>
        <section id="model"></section>
        <section id="contact"></section>
      </main>
    `
    );

    const rects: Record<string, number> = {
      hero: -900,
      axes: -400,
      services: 80,
      model: 700,
      contact: 1400,
    };

    for (const [id, top] of Object.entries(rects)) {
      const el = document.getElementById(id)!;
      el.getBoundingClientRect = () =>
        ({
          top,
          bottom: top + 500,
          left: 0,
          right: 1000,
          width: 1000,
          height: 500,
          x: 0,
          y: top,
          toJSON: () => {},
        }) as DOMRect;
    }

    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 900 });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 3000,
    });

    document.dispatchEvent(new Event('DOMContentLoaded'));
    window.dispatchEvent(new Event('scroll'));

    const servicesLink = document.querySelector('.nav-list a[href="/es/#services"]');
    const heroLink = document.querySelector('.nav-list a[href="/es/#hero"]');
    expect(servicesLink?.classList.contains('is-active')).toBe(true);
    expect(servicesLink?.getAttribute('aria-current')).toBe('location');
    expect(heroLink?.classList.contains('is-active')).toBe(false);
  });
});
