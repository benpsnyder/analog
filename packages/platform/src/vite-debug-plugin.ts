import type { Plugin } from 'vite';

// Import our strongly typed environment interface
type ImportMetaEnv = {
  readonly DEBUG?: '0' | '1' | '2';
  readonly NODE_ENV?: 'development' | 'production' | 'test';
  readonly DEV?: boolean;
  readonly PROD?: boolean;
  readonly SSR?: boolean;
};

/**
 * Vite plugin to inject DEBUG environment variables and global variables
 *
 * This plugin leverages Vite 7's Environment API for optimal SSR/SSG/CSR compatibility.
 * It ensures that DEBUG and DEBUG_LEVEL are available as global variables
 * in all environments (client, server, and static builds).
 */
/**
 * Vite debug plugin following Vite 7 Environment API best practices
 * Provides strongly typed debug variables across all environments
 */
export function debugPlugin(): Plugin {
  return {
    name: 'analog-debug',
    config(config) {
      const getDebugEnv = (): string | undefined => {
        // Use bracket notation to access process.env.DEBUG due to index signature
        const processDebug =
          typeof process !== 'undefined' && process.env
            ? process.env['DEBUG']
            : undefined;

        // Safe access to import.meta.env following Vite 7 best practices
        let importMetaDebug: string | undefined;
        try {
          if (
            typeof import.meta !== 'undefined' &&
            'env' in import.meta &&
            import.meta.env
          ) {
            importMetaDebug = (import.meta.env as ImportMetaEnv).DEBUG;
          }
        } catch {
          // import.meta.env not available in this context
        }

        return processDebug || importMetaDebug;
      };

      const debugEnv = getDebugEnv();
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
        // Ensure environment variables are available
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
                // Server-side debug utilities
                'globalThis.DEBUG_SERVER_TIMING': JSON.stringify(isDebug),
              },
            },
          },
        };
      }

      // Fallback for non-Environment API setups
      return baseDebugConfig;
    },
    transform(code, id) {
      // Only transform TypeScript/JavaScript files
      if (!/\.(ts|js|tsx|jsx)$/.test(id)) {
        return null;
      }

      // Replace import.meta.env.DEBUG with the actual value for better tree-shaking
      const getDebugEnv = (): string | undefined => {
        const processDebug =
          typeof process !== 'undefined' && process.env
            ? process.env['DEBUG']
            : undefined;

        let importMetaDebug: string | undefined;
        try {
          if (
            typeof import.meta !== 'undefined' &&
            'env' in import.meta &&
            import.meta.env
          ) {
            importMetaDebug = (import.meta.env as ImportMetaEnv).DEBUG;
          }
        } catch {
          // import.meta.env not available in this context
        }

        return processDebug || importMetaDebug;
      };

      const debugEnv = getDebugEnv();
      const debugLevel = debugEnv === '1' ? 1 : debugEnv === '2' ? 2 : 0;
      const isDebug = debugLevel > 0;

      // Replace import.meta.env.DEBUG with literal value for better optimization
      if (code.includes('import.meta.env.DEBUG')) {
        code = code.replace(
          /import\.meta\.env\.DEBUG/g,
          JSON.stringify(debugEnv || '0'),
        );
      }

      return {
        code,
        map: null,
      };
    },
    // Hook into build process for environment-specific optimizations
    configResolved(config) {
      const getDebugEnv = (): string | undefined => {
        const processDebug =
          typeof process !== 'undefined' && process.env
            ? process.env['DEBUG']
            : undefined;

        let importMetaDebug: string | undefined;
        try {
          if (
            typeof import.meta !== 'undefined' &&
            'env' in import.meta &&
            import.meta.env
          ) {
            importMetaDebug = (import.meta.env as ImportMetaEnv).DEBUG;
          }
        } catch {
          // import.meta.env not available in this context
        }

        return processDebug || importMetaDebug;
      };

      const debugEnv = getDebugEnv();
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
