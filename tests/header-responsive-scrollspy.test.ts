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

  it('activates the matching nav link and updates language switcher href with translated hash when user scrolls or has URL hash', () => {
    const scriptMatch = headerSource.match(/<script is:inline>([\s\S]*?)<\/script>/);
    expect(scriptMatch).not.toBeNull();
    const inlineScript = scriptMatch![1];

    // Simulate browser parsing <header> BEFORE <main> exists on /es/
    document.body.innerHTML = `
      <header class="site-header">
        <ul class="nav-list">
          <li><a href="/es/#inicio">Inicio</a></li>
          <li><a href="/es/#divisiones">Divisiones</a></li>
          <li><a href="/es/#servicios">Servicios</a></li>
          <li><a href="/es/#modelos">Modelo</a></li>
          <li><a href="/es/#contacto">Contacto</a></li>
        </ul>
        <a href="/en/" class="lang-switch" data-lang-switch data-base-href="/en/" data-target-locale="en">EN</a>
      </header>
    `;

    Object.defineProperty(document, 'readyState', {
      configurable: true,
      get: () => 'loading',
    });

    window.eval(inlineScript);

    document.body.insertAdjacentHTML(
      'beforeend',
      `
      <main>
        <section id="inicio" data-section="hero"></section>
        <section id="divisiones" data-section="axes"></section>
        <section id="servicios" data-section="services"></section>
        <section id="modelos" data-section="model"></section>
        <section id="contacto" data-section="contact"></section>
      </main>
    `
    );

    const rects: Record<string, number> = {
      inicio: -900,
      divisiones: -400,
      servicios: 80,
      modelos: 700,
      contacto: 1400,
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

    const servicesLink = document.querySelector('.nav-list a[href="/es/#servicios"]');
    const heroLink = document.querySelector('.nav-list a[href="/es/#inicio"]');
    const langSwitch = document.querySelector('[data-lang-switch]');
    expect(servicesLink?.classList.contains('is-active')).toBe(true);
    expect(servicesLink?.getAttribute('aria-current')).toBe('location');
    expect(heroLink?.classList.contains('is-active')).toBe(false);
    expect(langSwitch?.getAttribute('href')).toBe('/en/#services');

    // Clicking #contacto link updates active state and langSwitch to /en/#contact
    const contactLink = document.querySelector('.nav-list a[href="/es/#contacto"]') as HTMLElement;
    contactLink.click();
    expect(contactLink.classList.contains('is-active')).toBe(true);
    expect(langSwitch?.getAttribute('href')).toBe('/en/#contact');
  });
});
