export const STORAGE_KEY = 'kinvia-a11y-prefs';

export interface A11yPrefs {
  theme: 'dark' | 'light';
  highContrast: boolean;
  textSize: 'normal' | 'large' | 'larger';
  reduceMotion: boolean;
}

export function applyStoredPreferences(
  doc: Document,
  storage: Pick<Storage, 'getItem'> | null,
  prefersLight: boolean
): A11yPrefs {
  const defaults: A11yPrefs = {
    theme: prefersLight ? 'light' : 'dark',
    highContrast: false,
    textSize: 'normal',
    reduceMotion: false,
  };

  let prefs: A11yPrefs = { ...defaults };

  if (storage) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<A11yPrefs>;
        if (parsed && typeof parsed === 'object') {
          if (parsed.theme === 'light' || parsed.theme === 'dark') {
            prefs.theme = parsed.theme;
          }
          if (typeof parsed.highContrast === 'boolean') {
            prefs.highContrast = parsed.highContrast;
          }
          if (
            parsed.textSize === 'normal' ||
            parsed.textSize === 'large' ||
            parsed.textSize === 'larger'
          ) {
            prefs.textSize = parsed.textSize;
          }
          if (typeof parsed.reduceMotion === 'boolean') {
            prefs.reduceMotion = parsed.reduceMotion;
          }
        }
      }
    } catch {
      // Fallback safely to defaults on corrupted JSON or SecurityError
    }
  }

  const root = doc.documentElement;
  root.setAttribute('data-theme', prefs.theme);

  if (prefs.highContrast) {
    root.setAttribute('data-contrast', 'high');
  } else {
    root.removeAttribute('data-contrast');
  }

  if (prefs.textSize === 'large' || prefs.textSize === 'larger') {
    root.setAttribute('data-text-size', prefs.textSize);
  } else {
    root.removeAttribute('data-text-size');
  }

  if (prefs.reduceMotion) {
    root.setAttribute('data-reduce-motion', 'true');
  } else {
    root.removeAttribute('data-reduce-motion');
  }

  return prefs;
}
