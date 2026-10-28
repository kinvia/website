import es from './es.json';
import en from './en.json';

export type Locale = 'es' | 'en';
export type Dictionary = typeof es;

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

const routePairs: Array<[string, string]> = [
  ['/es/', '/en/'],
  ['/es', '/en'],
  ['/es/privacidad', '/en/privacy'],
  ['/es/privacidad/', '/en/privacy/'],
];

export function getAlternatePath(targetLocale: Locale, pathname: string): string {
  const normalized = pathname || '/';
  for (const [esPath, enPath] of routePairs) {
    if (normalized === esPath || normalized === enPath) {
      return targetLocale === 'es' ? esPath.replace(/\/privacidad\/$/, '/privacidad') : enPath.replace(/\/privacy\/$/, '/privacy');
    }
  }
  return targetLocale === 'es' ? '/es/' : '/en/';
}

