import { describe, expect, it } from 'vitest';
import type { ModuleNode } from 'vite';

import { markModuleSelfAccepting } from './hmr-module.js';

describe('markModuleSelfAccepting', () => {
  it('returns a fresh module marked as self-accepting (Vite 7 shape)', () => {
    const mod = { id: '/src/app.component.ts', isSelfAccepting: false };
    const result = markModuleSelfAccepting(mod as unknown as ModuleNode);

    expect(result).not.toBe(mod);
    expect(result.isSelfAccepting).toBe(true);
    expect(result.id).toBe('/src/app.component.ts');
  });

  it('does not throw when isSelfAccepting is a getter-only property (Vite 8+)', () => {
    const mod = Object.defineProperties(
      { id: '/src/app.component.ts' },
      {
        isSelfAccepting: {
          get: () => false,
          enumerable: true,
          configurable: false,
        },
      },
    );

    expect(() =>
      markModuleSelfAccepting(mod as unknown as ModuleNode),
    ).not.toThrow();

    const result = markModuleSelfAccepting(mod as unknown as ModuleNode);
    expect(result).not.toBe(mod);
    expect(result.isSelfAccepting).toBe(true);
  });

  it('mutates `_clientModule.isSelfAccepting` for the Vite 6 shape', () => {
    const clientModule = { isSelfAccepting: false };
    const mod = {
      id: '/src/app.component.ts',
      isSelfAccepting: false,
      _clientModule: clientModule,
    };

    const result = markModuleSelfAccepting(mod as unknown as ModuleNode);

    expect(clientModule.isSelfAccepting).toBe(true);
    expect(result.isSelfAccepting).toBe(true);
  });
});
