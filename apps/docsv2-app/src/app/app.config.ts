import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { ViewportScroller } from '@angular/common';
import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideFileRouter, requestContextInterceptor } from '@analogjs/router';
import { provideAnalogQuery } from '@analogjs/router/tanstack-query';
import {
  withDocsMd4xRenderer,
  withDocumentationSource,
} from '@ng-docs/docs-angular';
import {
  QueryClient,
  provideTanStackQuery,
} from '@tanstack/angular-query-experimental';
import { DocsAttributes } from './post-attributes';
import {
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { CONTENT_FILE_LOADER, provideContent } from '@analogjs/content';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideFileRouter(
      withComponentInputBinding(),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),
    provideAppInitializer(() => {
      inject(ViewportScroller).setOffset([0, 120]);
    }),
    provideHttpClient(
      withFetch(),
      withInterceptors([requestContextInterceptor]),
    ),
    provideClientHydration(withEventReplay()),
    provideTanStackQuery(new QueryClient()),
    provideAnalogQuery(),
    withDocsMd4xRenderer(),
    provideContent(
      withDocumentationSource<DocsAttributes>({
        dir: 'src/content/docs',
        baseUrl: '/docs',
      }),
      {
        provide: CONTENT_FILE_LOADER,
        useFactory: () => async () =>
          import.meta.glob(
            [
              '/src/content/docs/**/*.md',
              '/src/content/docs/**/*.markdown',
              '/src/content/docs/**/*.mdx',
            ],
            {
              query: '?raw',
              import: 'default',
            },
          ),
      },
    ),
  ],
};
