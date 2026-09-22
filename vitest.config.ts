import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    // Mirrors the `@/*` path alias in tsconfig.json. Declared directly rather
    // than via vite-tsconfig-paths, which is ESM-only and cannot load here.
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  // These are node-only logic tests. Without an inline (empty) PostCSS config,
  // vitest discovers the app's Tailwind v4 config, which its bundled PostCSS
  // cannot parse — the run then dies before collecting any test.
  css: { postcss: { plugins: [] } },
  test: {
    environment: 'node',
    // The legacy scoring.test.ts predates this runner: it prints to the console
    // and asserts nothing, so vitest would report it as a file with no tests.
    include: ['src/**/__tests__/**/*.test.ts'],
    exclude: ['src/lib/__tests__/scoring.test.ts', 'node_modules/**'],
  },
});
