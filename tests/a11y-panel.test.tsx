// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { A11yPanel } from '../src/components/A11yPanel';
import { getDictionary } from '../src/i18n';
import { STORAGE_KEY } from '../src/utils/theme-boot';

describe('A11yPanel and keyboard shortcuts', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.removeAttribute('data-contrast');
    document.documentElement.removeAttribute('data-text-size');
    document.documentElement.removeAttribute('data-reduce-motion');
    document.body.innerHTML = `
      <section id="hero" tabindex="-1"></section>
      <section id="axes" tabindex="-1"></section>
      <section id="services" tabindex="-1"></section>
      <section id="model" tabindex="-1"></section>
      <section id="contact" tabindex="-1"><input id="test-input" type="text" /></section>
    `;
  });

  it('toggles theme, high contrast, text size, and reduce motion and persists to localStorage', () => {
    const copy = getDictionary('es').a11y;
    render(<A11yPanel copy={copy} />);

    fireEvent.click(screen.getByRole('button', { name: copy.buttonLabel }));
    fireEvent.click(screen.getByRole('button', { name: copy.themeLight }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    fireEvent.click(screen.getByRole('button', { name: copy.sizeLarge }));
    expect(document.documentElement.getAttribute('data-text-size')).toBe('large');

    fireEvent.click(screen.getByRole('switch', { name: copy.contrastLabel }));
    expect(document.documentElement.getAttribute('data-contrast')).toBe('high');

    fireEvent.click(screen.getByRole('switch', { name: copy.reduceMotionLabel }));
    expect(document.documentElement.getAttribute('data-reduce-motion')).toBe('true');

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    expect(saved).toMatchObject({
      theme: 'light',
      textSize: 'large',
      highContrast: true,
      reduceMotion: true,
    });
  });

  it('handles ? to open shortcuts help, 1-5 to jump sections, Escape to close, and ignores keys inside inputs', () => {
    const copy = getDictionary('es').a11y;
    render(<A11yPanel copy={copy} />);

    const servicesEl = document.getElementById('services')!;
    const scrollSpy = vi.fn();
    servicesEl.scrollIntoView = scrollSpy;

    // Typing inside an input must NOT trigger shortcuts
    const input = document.getElementById('test-input')!;
    input.focus();
    fireEvent.keyDown(input, { key: '3' });
    fireEvent.keyDown(input, { key: '?' });
    expect(scrollSpy).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();

    // Pressing 3 on document body jumps to #services
    input.blur();
    document.documentElement.dataset.reduceMotion = 'true';
    fireEvent.keyDown(document, { key: '3' });
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });

    // Pressing ? opens shortcuts dialog, Escape closes it
    fireEvent.keyDown(document, { key: '?' });
    expect(screen.getByRole('dialog')).not.toBeNull();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('does not throw when window.localStorage getter throws SecurityError', () => {
    const copy = getDictionary('es').a11y;
    const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError: localStorage disabled');
      },
    });

    try {
      expect(() => render(<A11yPanel copy={copy} />)).not.toThrow();
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(window, 'localStorage', originalDescriptor);
      }
    }
  });
});

