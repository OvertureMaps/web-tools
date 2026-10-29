import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { toolBase } from '../../scripts/base-path.mjs';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Built and served at <BASE_PATH>taxonomy-explorer/. Tests keep Vite's
  // default '/' so fetched and linked paths are asserted as written.
  base: mode === 'test' ? '/' : toolBase('taxonomy-explorer'),
  test: {
    include: ['src/**/__tests__/**/*.test.{js,jsx}'],
    setupFiles: ['./src/setupTests.js'],
    // The render-heavy sunburst tests can exceed the 5s default on a loaded
    // CI runner.
    testTimeout: 20000,
  },
}));
