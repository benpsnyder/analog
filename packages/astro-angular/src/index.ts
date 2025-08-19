import viteAngular, {
  PluginOptions,
} from '@benpsnyder/analogjs-esm-vite-plugin-angular';
import { enableProdMode } from '@angular/core';
import type { AstroIntegration, AstroRenderer, ViteUserConfig } from 'astro';

// Define DeepPartial locally using Astro's implementation instead of importing from astro/dist/type-utils
// Source: https://raw.githubusercontent.com/withastro/astro/92881331d1138ae146bbc4b0bfb9c675ca3f3d55/packages/astro/src/type-utils.ts
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object | undefined
      ? DeepPartial<T[P]>
      : T[P];
};

interface AngularOptions {
  vite?: PluginOptions;
}

function getRenderer(): AstroRenderer {
  return {
    name: '@benpsnyder/analogjs-esm-astro-angular',
    clientEntrypoint: '@benpsnyder/analogjs-esm-astro-angular/client.js',
    serverEntrypoint: '@benpsnyder/analogjs-esm-astro-angular/server.js',
  };
}

function getViteConfiguration(vite?: PluginOptions) {
  return {
    esbuild: {
      jsxDev: true,
    },
    optimizeDeps: {
      include: [
        '@angular/platform-browser',
        '@angular/core',
        '@benpsnyder/analogjs-esm-astro-angular/client.js',
      ],
      exclude: [
        '@angular/platform-server',
        '@benpsnyder/analogjs-esm-astro-angular/server.js',
      ],
    },

    plugins: [
      viteAngular(vite),
      {
        name: '@benpsnyder/analogjs-esm-astro-angular-platform-server',
        transform(code: string, id: string) {
          if (id.includes('platform-server')) {
            code = code.replace(/global\./g, 'globalThis.');

            return {
              code: code.replace(
                'new xhr2.XMLHttpRequest',
                'new (xhr2.default.XMLHttpRequest || xhr2.default)',
              ),
            };
          }

          return;
        },
      },
    ],
    ssr: {
      noExternal: ['@angular/**', '@benpsnyder/analogjs-esm-**'],
    },
  };
}

export default function (options?: AngularOptions): AstroIntegration {
  process.env['ANALOG_ASTRO'] = 'true';

  return {
    name: '@benpsnyder/analogjs-esm-astro-angular',
    hooks: {
      'astro:config:setup': ({
        addRenderer,
        config,
        isRestart,
        updateConfig,
      }) => {
        if (!isRestart && config.markdown?.syntaxHighlight === 'shiki') {
          config.markdown.syntaxHighlight = 'prism';
        }

        addRenderer(getRenderer());
        updateConfig({
          vite: getViteConfiguration(
            options?.vite,
          ) as DeepPartial<ViteUserConfig>,
        });
      },
      'astro:config:done': ({ config }) => {
        if (
          'markdown' in config &&
          config.markdown.syntaxHighlight === 'shiki'
        ) {
          console.warn(
            `[warning] The Angular integration doesn't support Shiki syntax highlighting in MDX files. Overriding with Prism.\n
To disable this warning, set the syntaxHighlight option in your astro.config.mjs mdx() integration to 'prism' or false.`,
          );
        }
        if (process.env['NODE_ENV'] === 'production') {
          enableProdMode();
        }
      },
    },
  };
}
