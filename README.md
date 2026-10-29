# Overture Maps web tools

Public web tools for working with [Overture Maps Foundation](https://overturemaps.org) data, kept in one repository so they share build tooling, accessibility standards, and branding.

Tools are published to GitHub Pages at <https://labs.overturemaps.org/web-tools/>, the custom domain of the OvertureMaps organization's Pages site.

| Tool                                                  | Live URL                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| [Places Taxonomy Explorer](#places-taxonomy-explorer) | <https://labs.overturemaps.org/web-tools/taxonomy-explorer/> |

The [documentation site](https://github.com/OvertureMaps/docs) and the [Explore site](https://explore.overturemaps.org) live in their own repositories.

## Repository layout

```text
tools/<slug>/        One npm workspace per tool (Vite + React), served at /web-tools/<slug>/
scripts/
  base-path.mjs      Resolves the site base path (BASE_PATH env, default /web-tools/)
  assemble.mjs       Copies each tools/*/dist into dist/<slug>/ and writes the landing page
  preview.mjs        Serves dist/ locally under the base path
.github/workflows/   CI, GitHub Pages deploy, and PR previews
```

## Development

Requires Node.js 24 or later.

```sh
npm ci                                   # install all workspaces
npm run dev -w tools/taxonomy-explorer   # dev server: http://localhost:5173/web-tools/taxonomy-explorer/
npm test                                 # run every tool's tests
npm run lint                             # ESLint
npm run format                           # Prettier (CI runs format:check)
npm run build                            # build every tool and assemble dist/
npm run preview                          # serve dist/ at http://localhost:4173/web-tools/
```

### Accessibility

CI serves the built site and runs [pa11y-ci](https://github.com/pa11y/pa11y-ci) with axe against WCAG 2.1 AA, using `.pa11yci.json`. Add each new tool's URL there.

The taxonomy explorer hides three elements from that check: `.taxonomy-viz-center-label`, `.taxonomy-viz-center-sub`, and `.taxonomy-viz-zoom`. axe reports them as color-contrast "needs review" because it can't resolve the background behind SVG text or controls layered over an SVG. Their colors are the same text tokens on the page background that pass AA elsewhere, so this isn't hiding a real failure.

### Base path

Every tool is built for `<BASE_PATH><slug>/`. `BASE_PATH` defaults to `/web-tools/`, which matches GitHub Pages. PR previews build with `BASE_PATH=/web-tools/pr/<number>/`. Use Vite's `import.meta.env.BASE_URL` (not hardcoded absolute paths) for anything a tool fetches or links to.

### Adding a tool

1. Create `tools/<slug>/` with its own `package.json`. Give it a `description`, which the landing page shows, and `build` and `test` scripts.
2. In its `vite.config.js`, set `base: toolBase('<slug>')` from `scripts/base-path.mjs`.
3. Build output goes to `tools/<slug>/dist/`. `npm run build` picks it up and publishes it at `/web-tools/<slug>/`.

Keep tools self-contained. Factor shared code into a package only once a second tool needs it.

## Places Taxonomy Explorer

An interactive browser for the [Overture Places taxonomy](https://docs.overturemaps.org/guides/places/taxonomy/). It shows a searchable tree, a sunburst view, per-category place counts, and CSV downloads for each release. Its source is in [`tools/taxonomy-explorer`](tools/taxonomy-explorer).

### Embedding

The docs site embeds the explorer in an iframe:

```html
<iframe
  src="https://labs.overturemaps.org/web-tools/taxonomy-explorer/?theme=light"
  title="Places Taxonomy Explorer"
  style="width: 100%; height: min(82vh, 940px); min-height: 560px; border: 0"
></iframe>
```

- `?theme=light` or `?theme=dark` sets the color scheme. Without it, the tool follows the visitor's `prefers-color-scheme`. To switch themes, reload the iframe with the new value.
- When framed, the tool hides its own page header and padding and fills the frame. Below 560px tall it scrolls inside the frame.
- Nothing blocks framing: no `X-Frame-Options` or CSP `frame-ancestors` is set.

### Data files

Each release's data is served from the tool, so download links work wherever it is embedded:

```text
tools/taxonomy-explorer/public/taxonomy/<data-version>/
  taxonomy.json                       tree the explorer renders
  taxonomy.csv                        full taxonomy
  basic_categories.csv                basic categories
  taxonomy_to_legacy_categories.csv   legacy category crosswalk
```

The data files are licensed under [CC BY 4.0](tools/taxonomy-explorer/public/taxonomy/LICENSE.md). The code in this repo is MIT. The tool shows this notice below the explorer, standalone and framed.

These files are published at `https://labs.overturemaps.org/web-tools/taxonomy-explorer/taxonomy/<data-version>/<file>`.

### Adding a release

1. Create `tools/taxonomy-explorer/public/taxonomy/<data-version>/` (for example `2026-12-16.0`) and add the four files above.
2. Add an entry to the end of the list in [`src/releases.js`](tools/taxonomy-explorer/src/releases.js). Entries are ordered oldest first, and the last one is selected on load. Set its `label`, `releaseUrl`, `tags`, `dataUrl`, and `downloads`, using paths that start with `/taxonomy/<data-version>/`.
3. Run `npm test` and `npm run build && npm run preview`, then check the new release in the browser.

`taxonomy.json` has this shape:

```jsonc
{
  "version": "2026-10-21.0",
  "schemaVersion": "v2.0.0",
  "releaseDate": "2026-10-21",
  "generatedAt": "…",
  "source": "…",
  "stats": {
    "categories": 2302,
    "basicCategories": 298,
    "rootGroups": 13,
    "maxDepth": 5,
    "totalPlaces": 85169026,
  },
  "tree": [
    {
      "name": "arts_and_entertainment",
      "displayName": "Arts and Entertainment",
      "isBasic": true,
      "count": 333890, // places with exactly this category (optional)
      "totalCount": 1773417, // places in this category and its descendants
      "children": [/* same shape */],
    },
  ],
}
```

There is no generator script yet. The `2026-10-21.0` files were produced this way:

- The tree, display names, `isBasic`, and `basicCategory` are unchanged from the previous release, because `overture_taxonomy.json` and `overture_basic_category.json` in tf-data-platform had the same 2,302 categories and 298 basic categories. The three CSVs are copied unchanged.
- `count` is the number of places in the release whose `taxonomy.primary` equals the node's `name` (names are unique across the taxonomy), omitted when zero. `totalCount` is `count` plus the children's `totalCount`. `stats.totalPlaces` excludes places with no taxonomy.

```sql
SELECT taxonomy.primary, count(*)
FROM read_parquet('s3://overturemaps-us-west-2/release/<data-version>/theme=places/type=place/*.parquet')
GROUP BY 1;
```

If the taxonomy itself changes in a release, the CSVs and tree also need regenerating from those tf-data-platform files.

## Deployment

- **Production:** every push to `main` builds all tools and deploys `dist/` to GitHub Pages (`.github/workflows/production_deploy.yml`).
- **PR previews:** PRs from branches in this repository are built with `BASE_PATH=/web-tools/pr/<number>/`, synced to the staging bucket, and linked in a PR comment (`.github/workflows/staging_deploy.yaml`). The preview is deleted when the PR closes. Preview links point at `index.html` because the staging host does not serve directory indexes.

## Maintainers

This repository uses `MAINTAINERS.md` files to track ownership for [LFX Insights](https://insights.linuxfoundation.org/docs/introduction/maintainers/) ingestion. LFX scans the full repository tree, so these files can live anywhere.

To add a `MAINTAINERS.md` for a module or package, create it in the relevant directory using this format:

```markdown
# MAINTAINERS

| Name     | GitHub Username | Role            | Affiliation |
| -------- | --------------- | --------------- | ----------- |
| Jane Doe | @janedoe        | Lead Maintainer | Org         |
```
