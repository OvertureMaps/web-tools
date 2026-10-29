/**
 * Serve the assembled dist/ under BASE_PATH, the way GitHub Pages does, so the
 * production build can be checked locally before it ships:
 *
 *   npm run build && npm run preview
 *   open http://localhost:4173/web-tools/taxonomy-explorer/
 */
import { createReadStream, existsSync, realpathSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, isAbsolute, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { basePath } from './base-path.mjs';

const distDir = fileURLToPath(new URL('../dist', import.meta.url));
if (!existsSync(distDir)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}
const dist = realpathSync(distDir);
const base = basePath();
const port = Number(process.env.PORT) || 4173;
// Loopback only by default; set HOST=0.0.0.0 to expose it on the network.
const host = process.env.HOST || '127.0.0.1';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// True when `file` (after resolving symlinks) is dist/ or inside it.
function insideDist(file) {
  const rel = relative(dist, realpathSync(file));
  return rel === '' || (rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

createServer((req, res) => {
  let path;
  try {
    path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }
  if (path === base.slice(0, -1)) {
    res.writeHead(301, { Location: base }).end();
    return;
  }
  if (!path.startsWith(base)) {
    res.writeHead(404).end('Not found');
    return;
  }
  let file = join(dist, path.slice(base.length));
  if (!existsSync(file)) {
    res.writeHead(404).end('Not found');
    return;
  }
  if (!insideDist(file)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  if (statSync(file).isDirectory()) {
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
}).listen(port, host, () => {
  console.log(`Serving dist/ at http://${host}:${port}${base}`);
});
