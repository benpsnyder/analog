/// <reference types="vitest" />

import analog from '@analogjs/platform';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, Plugin } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import inspect from 'vite-plugin-inspect';

// Enhanced debug plugin with Vite 7 Environment API support
function debugPlugin(): Plugin {
  return {
    name: 'analog-debug',
    config(config, { mode, command, isSsrBuild }) {
      const debugEnv = process.env.DEBUG;
      const debugLevel = debugEnv === '1' ? 1 : debugEnv === '2' ? 2 : 0;
      const isDebug = debugLevel > 0;

      // Base debug configuration
      const baseDebugConfig = {
        define: {
          // Global DEBUG variables available in all environments
          'globalThis.DEBUG': JSON.stringify(isDebug),
          'globalThis.DEBUG_LEVEL': JSON.stringify(debugLevel),
          'global.DEBUG': JSON.stringify(isDebug),
          'global.DEBUG_LEVEL': JSON.stringify(debugLevel),
          'window.DEBUG': JSON.stringify(isDebug),
          'window.DEBUG_LEVEL': JSON.stringify(debugLevel),
        },
        envPrefix: ['VITE_', 'DEBUG', 'NX_'],
      };

      // If using Vite 7 Environment API, configure per environment
      if (config.environments) {
        return {
          ...baseDebugConfig,
          environments: {
            client: {
              ...config.environments['client'],
              define: {
                ...baseDebugConfig.define,
                // Client-specific debug variables
                'globalThis.DEBUG_CLIENT': JSON.stringify(isDebug),
                'globalThis.DEBUG_CSR': JSON.stringify(isDebug),
              },
            },
            ssr: {
              ...config.environments['ssr'],
              define: {
                ...baseDebugConfig.define,
                // Server-specific debug variables
                'globalThis.DEBUG_SERVER': JSON.stringify(isDebug),
                'globalThis.DEBUG_SSR': JSON.stringify(isDebug),
                'globalThis.DEBUG_SERVER_TIMING': JSON.stringify(isDebug),
              },
            },
          },
        };
      }

      // Fallback for non-Environment API setups
      return baseDebugConfig;
    },
    configResolved(config) {
      const debugEnv = process.env.DEBUG;
      const debugLevel = debugEnv === '1' ? 1 : debugEnv === '2' ? 2 : 0;
      const isDebug = debugLevel > 0;

      if (isDebug) {
        console.log(`[DEBUG PLUGIN] Debug level: ${debugLevel}`);
        console.log(`[DEBUG PLUGIN] Build mode: ${config.mode}`);
        console.log(`[DEBUG PLUGIN] SSR build: ${config.build?.ssr || false}`);

        if (config.environments) {
          console.log(`[DEBUG PLUGIN] Using Vite Environment API`);
          Object.keys(config.environments).forEach((env) => {
            console.log(`[DEBUG PLUGIN] Environment: ${env}`);
          });
        }
      }
    },
  };
}

// Only run in Netlify CI
let base = process.env['URL'] || 'http://localhost:3000';
if (process.env['NETLIFY'] === 'true') {
  if (process.env['CONTEXT'] === 'deploy-preview') {
    base = `${process.env['DEPLOY_PRIME_URL']}/`;
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode, isSsrBuild }) => {
  return {
    root: __dirname,
    publicDir: 'src/public',
    build: {
      outDir: '../../dist/apps/analog-app/client',
      reportCompressedSize: true,
      target: ['es2020'],
    },
    optimizeDeps: {
      include: ['@angular/forms'],
    },
    plugins: [
      debugPlugin(),
      analog({
        apiPrefix: 'api',
        additionalPagesDirs: ['/libs/shared/feature'],
        additionalAPIDirs: ['/libs/shared/feature/src/api'],
        prerender: {
          routes: [
            '/',
            '/cart',
            '/shipping',
            '/client',
            '/404.html',
            {
              route: '/newsletter',
              staticData: true,
            },
          ],
          sitemap: {
            host: base,
          },
        },
        vite: {
          inlineStylesExtension: 'scss',
          experimental: {
            supportAnalogFormat: true,
          },
        },
        liveReload: true,
        nitro: {
          routeRules: {
            '/cart/**': {
              ssr: false,
            },
            '/404.html': {
              ssr: false,
            },
          },
        },
      }),
      nxViteTsPaths(),
      visualizer() as Plugin,
      // !isSsrBuild &&
      //   inspect({
      //     build: true,
      //     outputDir: '../../.vite-inspect/analog-app',
      //   }),
    ],
    test: {
      reporters: ['default'],
      coverage: {
        reportsDirectory: '../../coverage/apps/analog-app',
        provider: 'v8',
      },
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/test-setup.ts'],
      include: ['**/*.spec.ts'],
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  };
});
