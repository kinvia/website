import React, { useState, useEffect } from 'react';
import type { Locale, Dictionary } from '../i18n';

export interface ContactFormProps {
  locale: Locale;
  copy: Dictionary['contact']['form'];
  initialSuccess?: boolean;
}

export function ContactForm({ locale, copy, initialSuccess = false }: ContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [privacy, setPrivacy] = useState(false);
  const [botField, setBotField] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>(
    initialSuccess ? 'success' : 'idle'
  );

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('enviado') === '1' || params.get('sent') === '1') {
        setStatus('success');
      }
    } catch {
      // Ignore URL parsing errors in non-browser environments
    }
  }, []);

  const actionUrl = locale === 'es' ? '/es/?enviado=1#contact' : '/en/?sent=1#contact';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Silent honeypot discard if bot-field is filled
    if (botField.trim().length > 0) {
      setStatus('success');
      return;
    }

    setStatus('submitting');
    try {
      const body = new URLSearchParams({
        'form-name': 'contact',
        'bot-field': botField,
        name,
        email,
        message,
        privacy: privacy ? 'yes' : '',
      }).toString();

      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      if (res.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
        setPrivacy(false);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="contact-form-card">
      {status === 'success' ? (
        <div role="status" aria-live="polite" className="form-feedback form-feedback-success">
          <h3>{copy.successTitle}</h3>
          <p>{copy.successMessage}</p>
        </div>
      ) : (
        <form
          name="contact"
          method="POST"
          action={actionUrl}
          data-netlify="true"
          netlify-honeypot="bot-field"
          onSubmit={handleSubmit}
          className="kinvia-form"
        >
          <input type="hidden" name="form-name" value="contact" />

          <div data-honeypot="true" aria-hidden="true" className="sr-only-honeypot">
            <label htmlFor={`bot-field-${locale}`}>Do not fill this out if you are human</label>
            <input
              id={`bot-field-${locale}`}
              name="bot-field"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={botField}
              onChange={(e) => setBotField(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor={`contact-name-${locale}`}>{copy.nameLabel}</label>
            <input
              id={`contact-name-${locale}`}
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder={copy.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor={`contact-email-${locale}`}>{copy.emailLabel}</label>
            <input
              id={`contact-email-${locale}`}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={copy.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor={`contact-message-${locale}`}>{copy.messageLabel}</label>
            <textarea
              id={`contact-message-${locale}`}
              name="message"
              rows={5}
              required
              placeholder={copy.messagePlaceholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="form-checkbox-row">
            <input
              id={`contact-privacy-${locale}`}
              name="privacy"
              type="checkbox"
              required
              checked={privacy}
              onChange={(e) => setPrivacy(e.target.checked)}
            />
            <label htmlFor={`contact-privacy-${locale}`}>
              {copy.privacyPrefix}{' '}
              <a href={copy.privacyHref}>{copy.privacyLinkText}</a>.
            </label>
          </div>

          {status === 'error' && (
            <div role="alert" className="form-feedback form-feedback-error">
              <p>{copy.errorMessage}</p>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={status === 'submitting'}>
            {status === 'submitting' ? copy.submitting : copy.submit}
          </button>
        </form>
      )}
    </div>
  );
}

