/**
 * Releases shown in the explorer, oldest first; the newest is selected on load.
 *
 * `dataUrl` and download `url`s are relative to the tool's root and resolve
 * against the deployed base path, so files under public/taxonomy/<version>/
 * are served at <site>/taxonomy-explorer/taxonomy/<version>/.
 *
 * Set `enabled: false` to keep a release configured but hidden.
 */
const releases = [
  {
    id: 'september',
    label: '2026 September (Canonical Taxonomy)',
    releaseUrl: 'https://docs.overturemaps.org/blog/2026/09/23/release-notes/',
    tags: [
      { label: '23 September 2026', title: 'Date' },
      { label: '2026-09-23.0', title: 'Data version' },
      { label: 'v2.0.0', title: 'Schema version' },
    ],
    dataUrl: '/taxonomy/2026-09-23.0/taxonomy.json',
    downloads: [
      { label: 'Taxonomy (CSV)', url: '/taxonomy/2026-09-23.0/taxonomy.csv' },
      { label: 'Basic categories (CSV)', url: '/taxonomy/2026-09-23.0/basic_categories.csv' },
      {
        label: 'Taxonomy to legacy categories (CSV)',
        url: '/taxonomy/2026-09-23.0/taxonomy_to_legacy_categories.csv',
      },
    ],
    displayFields: [{ field: 'is_basic', label: 'Is Basic Category' }],
  },
];

export default releases;
