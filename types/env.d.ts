/// <reference types="node" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /**
       * Debug mode flag for enhanced logging and debugging features
       *
       * - `DEBUG=0` or undefined: Production mode, no debug output
       * - `DEBUG=1`: Basic debug mode with logging and performance tracking
       * - `DEBUG=2`: Verbose debug mode with file dumps and detailed analysis
       */
      DEBUG: '0' | '1' | '2' | undefined;

      /**
       * NX Cloud access token for build caching
       */
      NX_CLOUD_ACCESS_TOKEN: string | undefined;

      /**
       * NX verbose logging flag
       */
      NX_VERBOSE_LOGGING: string | undefined;

      /**
       * Node environment
       */
      NODE_ENV: 'development' | 'production' | 'test' | undefined;

      /**
       * Nitro app base URL
       */
      NITRO_APP_BASE_URL: string | undefined;

      /**
       * Build preset for Nitro
       */
      BUILD_PRESET: string | undefined;

      /**
       * Vite environment detection
       */
      VITEST: string | undefined;
    }
  }

  /**
   * Vite import.meta.env interface extension
   */
  interface ImportMetaEnv {
    /**
     * Debug mode flag for enhanced logging and debugging features
     *
     * - `DEBUG=0` or undefined: Production mode, no debug output
     * - `DEBUG=1`: Basic debug mode with logging and performance tracking
     * - `DEBUG=2`: Verbose debug mode with file dumps and detailed analysis
     */
    readonly DEBUG?: '0' | '1' | '2';

    /**
     * Vite development mode flag
     */
    readonly DEV: boolean;

    /**
     * Vite production mode flag
     */
    readonly PROD: boolean;

    /**
     * Server-side rendering flag
     */
    readonly SSR?: boolean;

    /**
     * Vite mode
     */
    readonly MODE: string;

    /**
     * NX Cloud access token for build caching
     */
    readonly NX_CLOUD_ACCESS_TOKEN?: string;

    /**
     * NX verbose logging flag
     */
    readonly NX_VERBOSE_LOGGING?: string;

    /**
     * Node environment
     */
    readonly NODE_ENV?: 'development' | 'production' | 'test';

    /**
     * Nitro app base URL
     */
    readonly NITRO_APP_BASE_URL?: string;

    /**
     * Build preset for Nitro
     */
    readonly BUILD_PRESET?: string;

    /**
     * Vite environment detection
     */
    readonly VITEST?: string;

    /**
     * Analog public base URL
     */
    readonly VITE_ANALOG_PUBLIC_BASE_URL?: string;
  }

  /**
   * ImportMeta interface extension for better Vite compatibility
   */
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  /**
   * Global debug flag for zero-cost conditional debugging
   *
   * Usage:
   * ```typescript
   * const debug = (...args: any[]) => DEBUG && console.log('[DEBUG]', ...args);
   * ```
   */
  var DEBUG: boolean;

  /**
   * Global debug level for enhanced debugging features
   *
   * - `0`: No debug output (production)
   * - `1`: Basic debug mode
   * - `2`: Verbose debug mode with file dumps
   */
  var DEBUG_LEVEL: 0 | 1 | 2;

  /**
   * Client-specific debug flag (CSR builds)
   */
  var DEBUG_CLIENT: boolean;

  /**
   * Server-specific debug flag (SSR builds)
   */
  var DEBUG_SERVER: boolean;

  /**
   * SSR-specific debug flag
   */
  var DEBUG_SSR: boolean;

  /**
   * CSR-specific debug flag
   */
  var DEBUG_CSR: boolean;

  /**
   * Server timing debug flag
   */
  var DEBUG_SERVER_TIMING: boolean;
}

// Ensure this file is treated as a module
export {};
