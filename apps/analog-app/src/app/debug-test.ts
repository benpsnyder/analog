/**
 * Test file to verify debug configuration with Vite 7 Environment API
 *
 * This file demonstrates the strongly typed DEBUG environment variables
 * and global variables working correctly across SSR, SSG, and CSR.
 */

// Test global DEBUG variables
console.log('Global DEBUG:', typeof DEBUG, DEBUG);
console.log('Global DEBUG_LEVEL:', typeof DEBUG_LEVEL, DEBUG_LEVEL);

// Test environment-specific debug variables
console.log('DEBUG_CLIENT:', typeof DEBUG_CLIENT, DEBUG_CLIENT);
console.log('DEBUG_SERVER:', typeof DEBUG_SERVER, DEBUG_SERVER);
console.log('DEBUG_SSR:', typeof DEBUG_SSR, DEBUG_SSR);
console.log('DEBUG_CSR:', typeof DEBUG_CSR, DEBUG_CSR);

// Test import.meta.env access (Vite standard)
console.log('import.meta.env.DEBUG:', import.meta.env.DEBUG);
console.log('import.meta.env.DEV:', import.meta.env.DEV);
console.log('import.meta.env.PROD:', import.meta.env.PROD);
console.log('import.meta.env.SSR:', import.meta.env.SSR);

// Test conditional debug logging
if (DEBUG) {
  console.log('[DEBUG] Debug mode is enabled');
}

if (DEBUG_LEVEL >= 2) {
  console.log('[VERBOSE] Verbose debug mode is enabled');
}

// Test environment-specific logging
if (DEBUG_CLIENT) {
  console.log('[DEBUG:CLIENT] Client-side debugging enabled');
}

if (DEBUG_SERVER) {
  console.log('[DEBUG:SERVER] Server-side debugging enabled');
}

if (DEBUG_SSR) {
  console.log('[DEBUG:SSR] SSR debugging enabled');
}

if (DEBUG_CSR) {
  console.log('[DEBUG:CSR] CSR debugging enabled');
}

// Test debug utilities (if imported)
// import {
//   debug,
//   debugClient,
//   debugServer,
//   debugSSR,
//   debugCSR,
//   isClient,
//   isServer,
//   isSSR,
//   isCSR,
//   isDebugEnabled,
//   getDebugLevel
// } from '@analogjs/platform';

// debug('Testing debug utilities');
// debugClient('Client-specific debug');
// debugServer('Server-specific debug');
// debugSSR('SSR-specific debug');
// debugCSR('CSR-specific debug');

// console.log('Environment detection:');
// console.log('  isClient():', isClient());
// console.log('  isServer():', isServer());
// console.log('  isSSR():', isSSR());
// console.log('  isCSR():', isCSR());
// console.log('  isDebugEnabled():', isDebugEnabled());
// console.log('  getDebugLevel():', getDebugLevel());
