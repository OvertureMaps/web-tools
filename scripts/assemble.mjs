/**
 * Assemble every tool's build into one site under dist/, ready to publish:
 *
 *   dist/index.html            landing page listing the tools
 *   dist/<tool>/...            tools/<tool>/dist/...
 *
 * Run after the workspaces have built (`npm run build` does both).
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const toolsDir = join(root, 'tools');
const out = join(root, 'dist');

const escape = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );

const toTitle = (slug) =>
  slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const tools = [];
for (const name of readdirSync(toolsDir).sort()) {
  const pkgPath = join(toolsDir, name, 'package.json');
  if (!existsSync(pkgPath)) continue;
  const built = join(toolsDir, name, 'dist');
  if (!existsSync(built)) {
    console.error(`tools/${name} has no dist/ directory; did its build run?`);
    process.exit(1);
  }
  cpSync(built, join(out, name), { recursive: true });
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  tools.push({ name, description: pkg.description ?? '' });
}

const items = tools
  .map(
    (t) =>
      // Explicit index.html: the staging preview host does not serve directory indexes.
      `      <li><a href="./${escape(t.name)}/index.html">${escape(toTitle(t.name))}</a>` +
      (t.description ? `<span>${escape(t.description)}</span>` : '') +
      '</li>'
  )
  .join('\n');

writeFileSync(
  join(out, 'index.html'),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Web tools | Overture Maps Foundation</title>
    <style>
      :root { color-scheme: light dark; }
      body { margin: 0 auto; max-width: 48rem; padding: 2rem 1.5rem; font-family: 'Montserrat', Arial, sans-serif; font-weight: 300; background: #ffffff; color: #001a39; }
      h1 { font-weight: 700; color: #2c2e7f; }
      a { color: #4051cc; font-weight: 700; }
      ul { list-style: none; padding: 0; }
      li { padding: 0.75rem 0; border-top: 1px solid #e0e4e7; }
      li span { display: block; }
      @media (prefers-color-scheme: dark) {
        body { background: #001a39; color: #ffffff; }
        h1 { color: #ffffff; }
        a { color: #4edad8; }
        li { border-color: #1f3551; }
      }
    </style>
  </head>
  <body>
    <h1>Overture Maps Foundation web tools</h1>
    <p>Small, public tools for working with Overture data.</p>
    <ul>
${items}
    </ul>
  </body>
</html>
`
);

console.log(`Assembled ${tools.length} tool(s) into dist/: ${tools.map((t) => t.name).join(', ')}`);
