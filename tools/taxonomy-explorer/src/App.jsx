import TaxonomyBrowser from './components/TaxonomyBrowser';
import releases from './releases';

function isFramed() {
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin access to window.top throws, which itself means we're framed.
    return true;
  }
}

export default function App() {
  // The embedding page supplies its own title and intro, so only show ours
  // when the tool is opened directly.
  const framed = isFramed();

  return (
    <div className={`app ${framed ? 'app--framed' : ''}`}>
      {!framed && (
        <header className="app-header">
          <h1>Places Taxonomy Explorer</h1>
          <p>
            Explore the Overture Places taxonomy. Click a category to drill into it, search to find
            one by name, and use the download links to take the release away as CSV. See{' '}
            <a href="https://docs.overturemaps.org/guides/places/taxonomy/">Places Taxonomy</a> for
            what the <code>taxonomy</code> and <code>basic_category</code> properties mean.
          </p>
        </header>
      )}
      <main className="app-main">
        <TaxonomyBrowser releases={releases} />
      </main>
      <footer className="app-footer">
        Taxonomy data © Overture Maps Foundation, licensed under{' '}
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
          CC BY 4.0
        </a>
        .
      </footer>
    </div>
  );
}
