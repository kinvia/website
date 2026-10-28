import React, { useState, useEffect, useCallback } from 'react';
import type { Dictionary } from '../i18n';
import { STORAGE_KEY, type A11yPrefs, applyStoredPreferences } from '../utils/theme-boot';

export interface A11yPanelProps {
  copy: Dictionary['a11y'];
}

const SECTION_MAP: Record<string, string> = {
  '1': 'hero',
  '2': 'axes',
  '3': 'services',
  '4': 'model',
  '5': 'contact',
};

export function navigateToSection(sectionKey: string): boolean {
  const sectionId = SECTION_MAP[sectionKey];
  if (!sectionId) return false;

  const el =
    (document.querySelector(`[data-section="${sectionId}"]`) as HTMLElement | null) ||
    document.getElementById(sectionId);

  if (!el) return false;

  let osReduced = false;
  try {
    osReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    // ignore
  }
  const reduced =
    osReduced || document.documentElement.getAttribute('data-reduce-motion') === 'true';

  if (typeof el.scrollIntoView === 'function') {
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
  el.focus({ preventScroll: true });

  const targetHash = `#${el.id}`;
  if (window.location.hash !== targetHash) {
    try {
      window.history.pushState(null, '', targetHash);
      const event =
        typeof HashChangeEvent !== 'undefined'
          ? new HashChangeEvent('hashchange')
          : new Event('hashchange');
      window.dispatchEvent(event);
    } catch {
      window.location.hash = targetHash;
    }
  }

  return true;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if (target.isContentEditable || target.getAttribute('contenteditable') === 'true') return true;
  return false;
}

export function A11yPanel({ copy }: A11yPanelProps) {
  const [open, setOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [prefs, setPrefs] = useState<A11yPrefs>({
    theme: 'dark',
    highContrast: false,
    textSize: 'normal',
    reduceMotion: false,
  });

  useEffect(() => {
    let prefersLight = false;
    try {
      prefersLight =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: light)').matches;
    } catch {
      // ignore
    }
    let storage: Storage | null = null;
    try {
      storage = typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
      storage = null;
    }
    const loaded = applyStoredPreferences(document, storage, prefersLight);
    setPrefs(loaded);
  }, []);

  const updatePrefs = useCallback((next: A11yPrefs) => {
    setPrefs(next);
    const root = document.documentElement;
    root.setAttribute('data-theme', next.theme);
    if (next.highContrast) {
      root.setAttribute('data-contrast', 'high');
    } else {
      root.removeAttribute('data-contrast');
    }
    if (next.textSize === 'large' || next.textSize === 'larger') {
      root.setAttribute('data-text-size', next.textSize);
    } else {
      root.removeAttribute('data-text-size');
    }
    if (next.reduceMotion) {
      root.setAttribute('data-reduce-motion', 'true');
    } else {
      root.removeAttribute('data-reduce-motion');
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota/security errors
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setShowShortcuts(false);
        return;
      }

      if (isEditableElement(e.target) || e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
        setOpen(false);
        return;
      }

      if (SECTION_MAP[e.key]) {
        e.preventDefault();
        navigateToSection(e.key);
        setShowShortcuts(false);
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <aside className="a11y-dock" aria-label={copy.panelTitle}>
      <button
        type="button"
        className="a11y-fab"
        aria-label={copy.buttonLabel}
        aria-expanded={open}
        onClick={() => {
          setOpen((prev) => !prev);
          setShowShortcuts(false);
        }}
      >
        <span aria-hidden="true">⚙</span>
      </button>

      {open && (
        <div role="dialog" aria-modal="false" aria-label={copy.panelTitle} className="a11y-panel">
          <div className="a11y-panel-header">
            <h2 className="a11y-panel-title">{copy.panelTitle}</h2>
            <button
              type="button"
              className="a11y-close-btn"
              aria-label={copy.closeLabel}
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="a11y-group">
            <span className="a11y-label">{copy.themeLabel}</span>
            <div className="a11y-segmented">
              <button
                type="button"
                aria-pressed={prefs.theme === 'dark'}
                className={prefs.theme === 'dark' ? 'is-active' : ''}
                onClick={() => updatePrefs({ ...prefs, theme: 'dark' })}
              >
                {copy.themeDark}
              </button>
              <button
                type="button"
                aria-pressed={prefs.theme === 'light'}
                className={prefs.theme === 'light' ? 'is-active' : ''}
                onClick={() => updatePrefs({ ...prefs, theme: 'light' })}
              >
                {copy.themeLight}
              </button>
            </div>
          </div>

          <div className="a11y-group">
            <span className="a11y-label">{copy.textSizeLabel}</span>
            <div className="a11y-segmented">
              <button
                type="button"
                aria-pressed={prefs.textSize === 'normal'}
                className={prefs.textSize === 'normal' ? 'is-active' : ''}
                onClick={() => updatePrefs({ ...prefs, textSize: 'normal' })}
              >
                {copy.sizeNormal}
              </button>
              <button
                type="button"
                aria-pressed={prefs.textSize === 'large'}
                className={prefs.textSize === 'large' ? 'is-active' : ''}
                onClick={() => updatePrefs({ ...prefs, textSize: 'large' })}
              >
                {copy.sizeLarge}
              </button>
              <button
                type="button"
                aria-pressed={prefs.textSize === 'larger'}
                className={prefs.textSize === 'larger' ? 'is-active' : ''}
                onClick={() => updatePrefs({ ...prefs, textSize: 'larger' })}
              >
                {copy.sizeLarger}
              </button>
            </div>
          </div>

          <div className="a11y-toggle-row">
            <span>{copy.contrastLabel}</span>
            <button
              type="button"
              role="switch"
              aria-label={copy.contrastLabel}
              aria-checked={prefs.highContrast}
              className={`a11y-switch ${prefs.highContrast ? 'is-on' : ''}`}
              onClick={() => updatePrefs({ ...prefs, highContrast: !prefs.highContrast })}
            >
              <span className="a11y-switch-thumb" />
            </button>
          </div>

          <div className="a11y-toggle-row">
            <span>{copy.reduceMotionLabel}</span>
            <button
              type="button"
              role="switch"
              aria-label={copy.reduceMotionLabel}
              aria-checked={prefs.reduceMotion}
              className={`a11y-switch ${prefs.reduceMotion ? 'is-on' : ''}`}
              onClick={() => updatePrefs({ ...prefs, reduceMotion: !prefs.reduceMotion })}
            >
              <span className="a11y-switch-thumb" />
            </button>
          </div>

          <button
            type="button"
            className="a11y-shortcuts-trigger"
            onClick={() => {
              setOpen(false);
              setShowShortcuts(true);
            }}
          >
            {copy.shortcutsButton}
          </button>
        </div>
      )}

      {showShortcuts && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={copy.shortcutsTitle}
          className="a11y-panel a11y-shortcuts-modal"
        >
          <div className="a11y-panel-header">
            <h2 className="a11y-panel-title">{copy.shortcutsTitle}</h2>
            <button
              type="button"
              className="a11y-close-btn"
              aria-label={copy.closeLabel}
              onClick={() => setShowShortcuts(false)}
            >
              ×
            </button>
          </div>
          <p className="a11y-hint">{copy.shortcutsHelpHint}</p>
          <dl className="a11y-shortcuts-list">
            {copy.shortcuts.map((item) => {
              const hasTarget = Boolean(SECTION_MAP[item.key]);
              const onTrigger = hasTarget
                ? () => {
                    navigateToSection(item.key);
                    setShowShortcuts(false);
                  }
                : undefined;

              return (
                <div
                  key={item.key}
                  className={`a11y-shortcut-row ${hasTarget ? 'is-clickable' : ''}`}
                  onClick={onTrigger}
                >
                  <dt>
                    <kbd>{item.key}</kbd>
                  </dt>
                  <dd>
                    {hasTarget ? (
                      <button
                        type="button"
                        className="a11y-shortcut-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onTrigger) onTrigger();
                        }}
                      >
                        {item.description}
                      </button>
                    ) : (
                      item.description
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      )}
    </aside>
  );
}

