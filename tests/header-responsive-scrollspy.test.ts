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

  it('includes an inline IntersectionObserver scrollspy script tracking sections', () => {
    expect(headerSource).toContain('IntersectionObserver');
    expect(headerSource).toContain('aria-current');
    expect(headerSource).toContain('is-active');
  });
});
