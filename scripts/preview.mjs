/**
 * Serve the assembled dist/ under BASE_PATH, the way GitHub Pages does, so the
 * production build can be checked locally before it ships:
 *
 *   npm run build && npm run preview
 *   open http://localhost:4173/web-tools/taxonomy-explorer/
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { basePath } from './base-path.mjs';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
const base = basePath();
const port = Number(process.env.PORT) || 4173;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (path === base.slice(0, -1)) {
    res.writeHead(301, { Location: base }).end();
    return;
  }
  if (!path.startsWith(base)) {
    res.writeHead(404).end('Not found');
    return;
  }
  let file = normalize(join(dist, path.slice(base.length)));
  if (!file.startsWith(dist)) {
    res.writeHead(403).end();
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) {
    // Mirror Pages: a directory without a trailing slash redirects to one.
    if (!path.endsWith('/')) {
      res.writeHead(301, { Location: `${path}/` }).end();
      return;
    }
    file = join(file, 'index.html');
  }
  if (!existsSync(file)) {
    res.writeHead(404).end('Not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(port, () => {
  console.log(`Serving dist/ at http://localhost:${port}${base}`);
});
