import { InjectionToken, inject } from '@angular/core';

/**
 * Token for DEV mode flag - to be provided by the consuming application
 */
export const IS_DEV_MODE = new InjectionToken<boolean>(
  '@analogjs/router Is Dev Mode',
  {
    providedIn: 'root',
    factory: () => false, // Default to production mode
  },
);

/**
 * Token for SSR flag - to be provided by the consuming application
 */
export const IS_SSR = new InjectionToken<boolean>('@analogjs/router Is SSR', {
  providedIn: 'root',
  factory: () => false, // Default to client-side
});

/**
 * Token for Analog public base URL - to be provided by the consuming application
 */
export const ANALOG_PUBLIC_BASE_URL = new InjectionToken<string | undefined>(
  '@analogjs/router Analog Public Base URL',
  {
    providedIn: 'root',
    factory: () => undefined,
  },
);

/**
 * Helper function to inject dev mode flag
 */
export function injectDevMode(): boolean {
  return inject(IS_DEV_MODE);
}

/**
 * Helper function to inject SSR flag
 */
export function injectIsSSR(): boolean {
  return inject(IS_SSR);
}

/**
 * Helper function to inject Analog public base URL
 */
export function injectAnalogPublicBaseURL(): string | undefined {
  return inject(ANALOG_PUBLIC_BASE_URL);
}
