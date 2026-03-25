/// <reference types="vitest" />

import analog from '@analogjs/platform';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => ({
  root: __dirname,
  publicDir: 'src/public',
  assetsInclude: ['**/*.wasm', '**/*.wasm?module', '**/*.wasm?url'],
  build: {
    outDir: '../../dist/apps/docsv2-app/client',
    emptyOutDir: true,
    reportCompressedSize: true,
    target: ['es2024'],
  },
  resolve: {
    mainFields: ['module'],
  },
  plugins: [
    analog({
      content: {
        highlighter: 'shiki',
      },
      experimental: {
        useAngularCompilationAPI: true,
        typedRouter: true,
      },
    }),
    nxViteTsPaths(),
    tailwindcss(),
  ],
  test: {
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/docsv2-app',
      provider: 'v8',
    },
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
  },
}));
