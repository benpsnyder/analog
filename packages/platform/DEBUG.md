# Debug System

The Analog platform provides a strongly typed debug system for zero-cost conditional debugging.

## Environment Variables

### DEBUG

Controls debug output level:

- `DEBUG=0` or undefined: Production mode, no debug output
- `DEBUG=1`: Basic debug mode with logging and performance tracking
- `DEBUG=2`: Verbose debug mode with file dumps and detailed analysis

## Usage

### Import Debug Utilities

```typescript
import {
  debug,
  trace,
  perfMark,
  perfMeasure,
  assert,
  isVerboseDebug,
  isDebugEnabled,
  getDebugLevel,
} from '@analogjs/platform';
```

### Basic Debug Logging

```typescript
// Only executes when DEBUG=1 or DEBUG=2
debug('Processing data:', { length: data.length });
trace('data:input', data);
```

### Performance Tracking

```typescript
perfMark('processData:start');
// ... processing ...
perfMeasure('processData:total', 'processData:start');
```

### Debug Assertions

```typescript
// Only throws when DEBUG is enabled and condition is false
assert(Array.isArray(data), 'Data must be an array');
```

### Conditional Logic

```typescript
if (isVerboseDebug()) {
  // Only executes when DEBUG=2
  debug('Verbose mode: Processing each item');
}

if (isDebugEnabled()) {
  // Executes when DEBUG=1 or DEBUG=2
  debug('Debug level:', getDebugLevel());
}
```

### Global Variables

You can also use global variables directly:

```typescript
// Global DEBUG boolean (zero-cost when false)
if (DEBUG) {
  console.log('[DEBUG] Using global variable');
}

// Global DEBUG_LEVEL (0, 1, or 2)
if (DEBUG_LEVEL >= 2) {
  console.log('[VERBOSE] Detailed debugging');
}
```

## NX Commands

```bash
# Basic debug mode
DEBUG=1 nx build platform

# Verbose debug mode
DEBUG=2 nx test platform

# Production mode (no debug)
DEBUG=0 nx build platform
```

## TypeScript Support

The debug system is fully typed with TypeScript:

- `process.env.DEBUG` is typed as `'0' | '1' | '2' | undefined`
- Global `DEBUG` is typed as `boolean`
- Global `DEBUG_LEVEL` is typed as `0 | 1 | 2`

## Zero-Cost Abstractions

All debug code is tree-shakeable in production builds. When `DEBUG=0` or undefined:

- Debug functions become no-ops
- Performance tracking is disabled
- Assertions are removed
- No runtime overhead

## Integration with Nitro

The debug system integrates seamlessly with Nitro.js v2:

```typescript
export default defineNitroPlugin((nitroApp) => {
  if (!isDebugEnabled()) return;

  nitroApp.hooks.hook('request', (event) => {
    perfMark(`request:${event.path}`);
    debug('Request:', { path: event.path, method: event.method });
  });
});
```
