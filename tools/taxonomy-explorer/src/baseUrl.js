/**
 * Resolve a root-relative path ('/taxonomy/...') against the base the app was
 * built for, e.g. '/web-tools/taxonomy-explorer/'. Vite sets BASE_URL from the
 * `base` option in vite.config.js; it is '/' under Vitest and the dev server
 * default, so paths pass through unchanged there.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBaseUrl(url) {
  if (!url || !url.startsWith('/') || url.startsWith('//')) return url;
  return `${BASE}${url}`;
}
