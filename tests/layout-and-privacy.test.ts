// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { applyStoredPreferences, STORAGE_KEY } from '../src/utils/theme-boot';

describe('Theme and A11y boot resilience', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-contrast');
    document.documentElement.removeAttribute('data-text-size');
    document.documentElement.removeAttribute('data-reduce-motion');
  });

  it('defaults to dark when storage is empty and prefersLight is false', () => {
    const mockStorage = { getItem: () => null };
    applyStoredPreferences(document, mockStorage, false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('recovers gracefully from corrupted JSON or throwing storage', () => {
    const corruptedStorage = { getItem: () => '{bad-json' };
    expect(() => applyStoredPreferences(document, corruptedStorage, true)).not.toThrow();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    const throwingStorage = {
      getItem: () => {
        throw new Error('SecurityError');
      },
    };
    expect(() => applyStoredPreferences(document, throwingStorage, false)).not.toThrow();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('applies stored theme, contrast, textSize, and reduceMotion attributes', () => {
    const validStorage = {
      getItem: (key: string) =>
        key === STORAGE_KEY
          ? JSON.stringify({
              theme: 'light',
              highContrast: true,
              textSize: 'larger',
              reduceMotion: true,
            })
          : null,
    };
    applyStoredPreferences(document, validStorage, false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-contrast')).toBe('high');
    expect(document.documentElement.getAttribute('data-text-size')).toBe('larger');
    expect(document.documentElement.getAttribute('data-reduce-motion')).toBe('true');
  });
});
