// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactForm } from '../src/components/ContactForm';
import { getDictionary } from '../src/i18n';

describe('Netlify ContactForm island', () => {
  it('renders Netlify form attributes, hidden form-name, and accessible fields with locale privacy link', () => {
    const copy = getDictionary('es').contact.form;
    const { container } = render(<ContactForm locale="es" copy={copy} />);
    const form = container.querySelector('form[name="contact"]');
    expect(form).not.toBeNull();
    expect(form?.getAttribute('method')).toBe('POST');
    expect(form?.getAttribute('data-netlify')).toBe('true');
    expect(form?.getAttribute('netlify-honeypot')).toBe('bot-field');

    const hiddenFormName = container.querySelector('input[type="hidden"][name="form-name"]') as HTMLInputElement;
    expect(hiddenFormName?.value).toBe('contact');

    const honeypotWrapper = container.querySelector('[data-honeypot="true"]');
    expect(honeypotWrapper?.getAttribute('aria-hidden')).toBe('true');
    const honeypotInput = container.querySelector('input[name="bot-field"]');
    expect(honeypotInput?.getAttribute('tabindex')).toBe('-1');

    const privacyCheckbox = container.querySelector('input[type="checkbox"][name="privacy"]') as HTMLInputElement;
    expect(privacyCheckbox?.required).toBe(true);

    const privacyLink = container.querySelector('a[href="/es/privacidad"]');
    expect(privacyLink).not.toBeNull();
  });

  it('silently discards bot submissions when honeypot bot-field is filled without calling fetch', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 200 }));
    const copy = getDictionary('en').contact.form;
    const { container } = render(<ContactForm locale="en" copy={copy} />);

    fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: 'Bot' } });
    fireEvent.change(container.querySelector('input[name="email"]')!, { target: { value: 'bot@example.com' } });
    fireEvent.change(container.querySelector('textarea[name="message"]')!, { target: { value: 'Spam' } });
    fireEvent.click(container.querySelector('input[name="privacy"]')!);
    fireEvent.change(container.querySelector('input[name="bot-field"]')!, { target: { value: 'i-am-a-bot' } });

    fireEvent.submit(container.querySelector('form[name="contact"]')!);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toBeTruthy();
    fetchSpy.mockRestore();
  });
});
