/**
 * Patches h3's toResponse function to handle cross-realm Promises.
 *
 * In h3 v2 (beta), `toResponse` uses `val instanceof Promise` to detect Promises.
 * This fails for cross-realm Promises (e.g., from Worker threads or different module
 * evaluation contexts), causing the Promise object to be serialized as "[object Promise]"
 * instead of being awaited.
 *
 * This patch adds thenable detection (`typeof val?.then === "function"`) as a fallback.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Find all h3.mjs files in node_modules
import { execSync } from 'node:child_process';

const files = execSync('find node_modules/.pnpm -path "*/h3/dist/h3.mjs" -type f', {
  cwd: root,
  encoding: 'utf-8',
}).trim().split('\n').filter(Boolean);

const ORIGINAL = 'if (val && val instanceof Promise) return val.catch((error) => error).then((resolvedVal) => toResponse(resolvedVal, event, config));';
const PATCHED = 'if (val && (val instanceof Promise || typeof val?.then === "function")) return Promise.resolve(val).catch((error) => error).then((resolvedVal) => toResponse(resolvedVal, event, config));';

let patched = 0;
for (const file of files) {
  const fullPath = resolve(root, file);
  const content = readFileSync(fullPath, 'utf-8');
  if (content.includes(ORIGINAL)) {
    writeFileSync(fullPath, content.replace(ORIGINAL, PATCHED));
    console.log(`[h3 patch] Patched: ${file}`);
    patched++;
  } else if (content.includes(PATCHED)) {
    console.log(`[h3 patch] Already patched: ${file}`);
  } else {
    console.log(`[h3 patch] Pattern not found in: ${file}`);
  }
}

if (patched > 0) {
  console.log(`[h3 patch] Successfully patched ${patched} file(s)`);
} else {
  console.log('[h3 patch] No files needed patching');
}
