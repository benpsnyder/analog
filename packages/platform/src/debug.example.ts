/**
 * Example usage of strongly typed debug utilities
 *
 * This file demonstrates how to use the debug system with TypeScript support,
 * following Vite 7 Environment API and Nitro v2 best practices.
 */

import {
  debug,
  trace,
  perfMark,
  perfMeasure,
  assert,
  isVerboseDebug,
  isDebugEnabled,
  getDebugLevel,
} from './debug.js';

// Strongly typed Nitro interfaces following Nitro v2 and H3 best practices
interface NitroApp {
  hooks: {
    hook: <T extends unknown[]>(
      name: string,
      handler: (...args: T) => void | Promise<void>,
    ) => void;
  };
}

interface NitroHookEvent {
  path: string;
  method: string;
  context?: Record<string, unknown>;
}

interface NitroResponseContext {
  body?: unknown;
}

interface NitroErrorContext {
  event?: NitroHookEvent;
}

type NitroPlugin = (nitroApp: NitroApp) => void | Promise<void>;

// Mock defineNitroPlugin function for environments where Nitro is not available
const defineNitroPlugin = (plugin: NitroPlugin): NitroPlugin => plugin;

// Example function with debug logging
export function processData(data: unknown[]) {
  // Performance tracking
  perfMark('processData:start');

  // Basic debug logging
  debug('Processing data array:', { length: data.length, type: typeof data });

  // Trace logging for detailed debugging
  trace('processData:input', { length: data.length, sample: data.slice(0, 3) });

  // Assertions that only run in debug mode
  assert(Array.isArray(data), 'Data must be an array');
  assert(data.length > 0, 'Data array cannot be empty');

  // Conditional logic based on debug level
  if (isVerboseDebug()) {
    debug('Verbose mode: Processing each item individually');
    data.forEach((item: unknown, index: number) => {
      debug(`Item ${index}:`, item);
    });
  }

  // Process the data
  const result = data.map((item: unknown) => (item as number) * 2);

  // Performance measurement
  perfMeasure('processData:total', 'processData:start');

  // Debug level information
  if (isDebugEnabled()) {
    debug('Debug level:', getDebugLevel());
  }

  return result;
}

// Example of using global DEBUG variable directly
export function alternativeDebugExample() {
  // Using global DEBUG variable (zero-cost when disabled)
  if (DEBUG) {
    console.log('[DEBUG] Using global DEBUG variable');
  }

  // Using global DEBUG_LEVEL for conditional logic
  if (DEBUG_LEVEL >= 2) {
    console.log('[VERBOSE] Detailed debugging enabled');
  }
}

// Example Nitro plugin with debug integration
export function createDebugPlugin() {
  return defineNitroPlugin((nitroApp: NitroApp) => {
    if (!isDebugEnabled()) return;

    nitroApp.hooks.hook('request', (event: NitroHookEvent) => {
      perfMark(`request:${event.path}`);
      debug('Request:', { path: event.path, method: event.method });
    });

    nitroApp.hooks.hook(
      'beforeResponse',
      (event: NitroHookEvent, { body }: NitroResponseContext) => {
        perfMeasure(`response:${event.path}`, `request:${event.path}`);
        debug('Response:', {
          path: event.path,
          size: typeof body === 'string' ? body.length : undefined,
        });
      },
    );

    if (isVerboseDebug()) {
      nitroApp.hooks.hook(
        'error',
        (error: Error, { event }: NitroErrorContext) => {
          console.error('[NITRO ERROR]', event?.path, error);
          // In verbose mode, we could write to debug files
        },
      );
    }
  });
}
