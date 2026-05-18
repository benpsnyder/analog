import type { ModuleNode } from 'vite';

/**
 * Marks a Vite `ModuleNode` as self-accepting for HMR across Vite 6/7/8.
 *
 * Vite 6 exposes a writable `_clientModule.isSelfAccepting` slot, which we
 * keep mutating for back-compat. Vite 7 and 8 surface `ModuleNode` from the
 * environment module graph where `isSelfAccepting` is a non-writable
 * getter — assigning to the field directly throws on Vite 8+. Returning a
 * fresh object via spread keeps `isSelfAccepting` as a plain data property
 * and sidesteps the setter entirely.
 */
export function markModuleSelfAccepting(mod: ModuleNode): ModuleNode {
  if ('_clientModule' in mod) {
    (mod as any)['_clientModule'].isSelfAccepting = true;
  }

  return {
    ...mod,
    isSelfAccepting: true,
  } as ModuleNode;
}
