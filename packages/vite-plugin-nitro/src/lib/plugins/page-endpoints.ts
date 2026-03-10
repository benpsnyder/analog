import { buildSync } from 'esbuild';
import { normalizePath } from 'vite';

export function pageEndpointsPlugin() {
  return {
    name: 'analogjs-vite-plugin-nitro-rollup-page-endpoint',
    async transform(_code: string, id: string) {
      if (normalizePath(id).includes('/pages/') && id.endsWith('.server.ts')) {
        const compiled = buildSync({
          stdin: {
            contents: _code,
            sourcefile: id,
            loader: 'ts',
          },
          write: false,
          metafile: true,
          platform: 'neutral',
          format: 'esm',
          logLevel: 'silent',
        });

        let fileExports: string[] = [];

        for (const key in compiled.metafile?.outputs) {
          if (compiled.metafile?.outputs[key].entryPoint) {
            fileExports = compiled.metafile?.outputs[key].exports;
          }
        }

        const code = `
            import { eventHandler } from 'h3';

            ${
              fileExports.includes('load')
                ? _code
                : `
                ${_code}
                export const load = async () => {
                  return {};
                }`
            }

            ${
              fileExports.includes('action')
                ? ''
                : `
                export const action = async () => {
                  return {};
                }
              `
            }

            export default eventHandler(async(event) => {
              if (event.method === 'GET') {
                try {
                  const result = await load({
                    params: event.context.params,
                    req: event.req,
                    res: event.res,
                    fetch: globalThis.$fetch,
                    event
                  });

                  return result || {};
                } catch(e) {
                  console.error('[Page Endpoint] An error occurred:', e);
                  throw e;
                }
              } else {
                try {
                  const result = await action({
                    params: event.context.params,
                    req: event.req,
                    res: event.res,
                    fetch: globalThis.$fetch,
                    event
                  });
                  return result;
                } catch(e) {
                  console.error('[Page Endpoint] An error occurred:', e);
                  throw e;
                }
              }
            });
          `;

        return {
          code,
          map: null,
        };
      }

      return;
    },
  };
}
