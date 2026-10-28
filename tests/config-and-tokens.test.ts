import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..');

describe('Netlify configuration and Design Tokens', () => {
  it('configures netlify.toml with dist publish dir and / to /es/ redirect', () => {
    const toml = fs.readFileSync(path.join(root, 'netlify.toml'), 'utf-8');
    expect(toml).toContain('publish = "dist"');
    expect(toml).toContain('from = "/"');
    expect(toml).toContain('to = "/es/"');
  });

  it('defines dark-first tokens, light theme, high contrast, text sizes, and non-banned primary fonts', () => {
    const tokens = fs.readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf-8');
    expect(tokens).toContain('--bg-primary:');
    expect(tokens).toContain('--bg-elevated:');
    expect(tokens).toContain('--text-primary:');
    expect(tokens).toContain('--accent-tech:');
    expect(tokens).toContain('[data-theme="light"]');
    expect(tokens).toContain('[data-contrast="high"]');
    expect(tokens).toContain('[data-text-size="large"]');
    expect(tokens).toContain('[data-text-size="larger"]');

    const fontDisplayMatch = tokens.match(/--font-display:\s*([^;]+);/);
    const fontBodyMatch = tokens.match(/--font-body:\s*([^;]+);/);
    expect(fontDisplayMatch).not.toBeNull();
    expect(fontBodyMatch).not.toBeNull();
    const primaryDisplay = fontDisplayMatch![1].split(',')[0].toLowerCase();
    const primaryBody = fontBodyMatch![1].split(',')[0].toLowerCase();
    for (const banned of ['inter', 'roboto', 'arial', 'system-ui']) {
      expect(primaryDisplay).not.toContain(banned);
      expect(primaryBody).not.toContain(banned);
    }
  });

  it('migrates brand logos and favicons into public/', () => {
    expect(fs.existsSync(path.join(root, 'public/favicon.ico'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'public/images/logo-w.webp'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'public/images/logo.webp'))).toBe(true);
  });
});

