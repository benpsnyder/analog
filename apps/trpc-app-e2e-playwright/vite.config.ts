/// <reference types="vitest" />

import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    test: {
      reporters: ['default'],
      globals: true,
      environment: 'jsdom',
      include: ['tests/**/*.spec.ts'],
      testTimeout: 30000, // Increase timeout to 30 seconds for e2e tests
      cache: {
        dir: `../../node_modules/.vitest`,
      },
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  };
});
