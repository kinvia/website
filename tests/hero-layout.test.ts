import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..');

describe('Hero Layout Alignment', () => {
  const heroSource = fs.readFileSync(path.join(root, 'src/components/Hero.astro'), 'utf-8');

  it('nests hero-inner inside container rather than merging classes', () => {
    expect(heroSource).not.toContain('class="container hero-inner"');
    expect(heroSource).toMatch(/class="container"[\s\S]*?class="hero-inner"/);
  });

  it('removes margin override that pushes hero content to the left edge', () => {
    expect(heroSource).not.toContain('margin: 0 auto 0 0');
  });
});
