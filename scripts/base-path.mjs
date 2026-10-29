/**
 * Where the site is served from. Every tool lives at <BASE_PATH><tool>/.
 *
 * Production (GitHub Pages) is https://labs.overturemaps.org/web-tools/, so
 * the default is '/web-tools/'. PR previews set BASE_PATH to
 * '/web-tools/pr/<number>/'.
 */
export function basePath() {
  let base = process.env.BASE_PATH || '/web-tools/';
  if (!base.startsWith('/')) base = `/${base}`;
  if (!base.endsWith('/')) base = `${base}/`;
  return base;
}

export function toolBase(tool) {
  return `${basePath()}${tool}/`;
}
