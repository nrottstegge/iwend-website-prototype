import { ROUTES, type Lang, type PageKey } from '../i18n/ui';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix a root-relative path with the deployment base path. External URLs pass through. */
export function withBase(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  return BASE + path;
}

export const pageUrl = (page: PageKey, lang: Lang, hash = '') => withBase(ROUTES[page][lang]) + hash;
