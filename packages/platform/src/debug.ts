/**
 * Debug utilities for Analog platform
 *
 * Provides strongly typed debug flags and utilities for zero-cost conditional debugging.
 * Follows Vite 7 Environment API and modern TypeScript best practices.
 */

// Strongly typed environment interface following our tooling best practices
type ImportMetaEnv = {
  readonly DEBUG?: '0' | '1' | '2';
  readonly NODE_ENV?: 'development' | 'production' | 'test';
  readonly DEV?: boolean;
  readonly PROD?: boolean;
  readonly SSR?: boolean;
};

// Initialize global DEBUG variables from environment
declare global {
  var DEBUG: boolean;
  var DEBUG_LEVEL: 0 | 1 | 2;
  var DEBUG_CLIENT: boolean;
  var DEBUG_SERVER: boolean;
  var DEBUG_SSR: boolean;
  var DEBUG_CSR: boolean;
  var DEBUG_SERVER_TIMING: boolean;
}

// Parse DEBUG environment variable with runtime safety following Vite 7 best practices
const getDebugEnv = (): string | undefined => {
  try {
    // Check if we're in a build environment where import.meta.env is available
    if (
      typeof import.meta !== 'undefined' &&
      'env' in import.meta &&
      import.meta.env
    ) {
      return (import.meta.env as ImportMetaEnv).DEBUG;
    }
  } catch {
    // Fallback for environments where import.meta.env is not available
  }

  // Fallback to process.env with bracket notation to avoid index signature errors
  if (typeof process !== 'undefined' && process.env) {
    return process.env['DEBUG'];
  }

  return undefined;
};

const debugEnv = getDebugEnv();
const debugLevel = debugEnv === '1' ? 1 : debugEnv === '2' ? 2 : 0;

// Set global variables
globalThis.DEBUG = debugLevel > 0;
globalThis.DEBUG_LEVEL = debugLevel;

/**
 * Debug logging function - only executes when DEBUG is enabled
 */
export const debug = (...args: unknown[]): void => {
  if (DEBUG) {
    console.log('[DEBUG]', ...args);
  }
};

/**
 * Trace logging function - only executes when DEBUG is enabled
 */
export const trace = (label: string, data: unknown): void => {
  if (DEBUG) {
    console.trace(`[TRACE:${label}]`, data);
  }
};

/**
 * Performance mark - only executes when DEBUG is enabled
 */
export const perfMark = (name: string): void => {
  if (DEBUG && typeof performance !== 'undefined') {
    performance.mark(name);
  }
};

/**
 * Performance measure - only executes when DEBUG is enabled
 */
export const perfMeasure = (name: string, start: string): void => {
  if (DEBUG && typeof performance !== 'undefined') {
    try {
      performance.measure(name, start);
      const measure = performance.getEntriesByName(name)[0];
      if (measure) {
        console.log(`[PERF] ${name}:`, measure.duration.toFixed(2) + 'ms');
      }
    } catch {
      // Ignore performance measurement errors
    }
  }
};

/**
 * Debug-only assertion - throws error when DEBUG is enabled and condition is false
 */
export const assert = (condition: boolean, message: string): void => {
  if (DEBUG && !condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
};

/**
 * Check if verbose debug mode is enabled (DEBUG=2)
 */
export const isVerboseDebug = (): boolean => DEBUG_LEVEL === 2;

/**
 * Check if basic debug mode is enabled (DEBUG=1 or DEBUG=2)
 */
export const isDebugEnabled = (): boolean => DEBUG_LEVEL > 0;

/**
 * Get current debug level
 */
export const getDebugLevel = (): 0 | 1 | 2 => DEBUG_LEVEL;

/**
 * Check if running in client environment
 */
export const isClient = (): boolean => typeof window !== 'undefined';

/**
 * Check if running in server environment
 */
export const isServer = (): boolean => typeof window === 'undefined';

/**
 * Check if running in SSR environment
 */
export const isSSR = (): boolean =>
  isServer() && typeof DEBUG_SSR !== 'undefined' && DEBUG_SSR;

/**
 * Check if running in CSR environment
 */
export const isCSR = (): boolean =>
  isClient() && typeof DEBUG_CSR !== 'undefined' && DEBUG_CSR;

/**
 * Environment-specific debug logging
 */
export const debugClient = (...args: unknown[]): void => {
  if (DEBUG_CLIENT) {
    console.log('[DEBUG:CLIENT]', ...args);
  }
};

export const debugServer = (...args: unknown[]): void => {
  if (DEBUG_SERVER) {
    console.log('[DEBUG:SERVER]', ...args);
  }
};

export const debugSSR = (...args: unknown[]): void => {
  if (DEBUG_SSR) {
    console.log('[DEBUG:SSR]', ...args);
  }
};

export const debugCSR = (...args: unknown[]): void => {
  if (DEBUG_CSR) {
    console.log('[DEBUG:CSR]', ...args);
  }
};
