import es from './es.json';
import en from './en.json';

export type Locale = 'es' | 'en';
export type Dictionary = typeof es;
export type SectionKey = keyof typeof es.nav.anchors;
export type SuccessCaseImage = { src: string; label: string; alt: string };
export type SuccessCaseItem = Dictionary['axes']['cloud']['cases'][number];
export type SuccessCasesLabels = Dictionary['axes']['casesLabels'];

const dictionaries: Record<Locale, Dictionary> = {
  es,
  en,
};

function resolveDotPath(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.es;
}

export function t(
  locale: Locale,
  key: string,
  overrides?: Partial<Record<Locale, Record<string, unknown>>>
): string {
  const activeSource = overrides?.[locale] ?? dictionaries[locale];
  const fallbackSource = overrides?.es ?? dictionaries.es;

  const primaryVal = resolveDotPath(activeSource, key);
  if (typeof primaryVal === 'string' && primaryVal.length > 0) {
    return primaryVal;
  }

  const fallbackVal = resolveDotPath(fallbackSource, key);
  if (typeof fallbackVal === 'string' && fallbackVal.length > 0) {
    return fallbackVal;
  }

  return key;
}

const SECTION_KEYS: SectionKey[] = ['hero', 'axes', 'services', 'model', 'contact'];

export function translateHash(targetLocale: Locale, hash: string): string {
  const clean = (hash || '').replace(/^#/, '').trim().toLowerCase();
  if (!clean) return '';

  for (const key of SECTION_KEYS) {
    const esAnchor = dictionaries.es.nav.anchors[key].toLowerCase();
    const enAnchor = dictionaries.en.nav.anchors[key].toLowerCase();
    if (clean === esAnchor || clean === enAnchor || clean === key) {
      return `#${dictionaries[targetLocale].nav.anchors[key]}`;
    }
  }

  return '';
}

const routePairs: Array<[string, string, boolean]> = [
  ['/es/', '/en/', true],
  ['/es', '/en', true],
  ['/es/privacidad', '/en/privacy', false],
  ['/es/privacidad/', '/en/privacy/', false],
];

export function getAlternatePath(targetLocale: Locale, pathname: string, hash?: string): string {
  const normalized = pathname || '/';
  const translatedHash = hash ? translateHash(targetLocale, hash) : '';

  for (const [esPath, enPath, isLanding] of routePairs) {
    if (normalized === esPath || normalized === enPath) {
      const base =
        targetLocale === 'es'
          ? esPath.replace(/\/privacidad\/$/, '/privacidad')
          : enPath.replace(/\/privacy\/$/, '/privacy');
      const normalizedBase = isLanding ? (targetLocale === 'es' ? '/es/' : '/en/') : base;
      return isLanding && translatedHash ? `${normalizedBase}${translatedHash}` : normalizedBase;
    }
  }

  const fallbackBase = targetLocale === 'es' ? '/es/' : '/en/';
  return translatedHash ? `${fallbackBase}${translatedHash}` : fallbackBase;
}
