import {
  provideContent,
  withMarkdownRenderer,
} from '@benpsnyder/analogjs-esm-content';
import { withShikiHighlighter } from '@benpsnyder/analogjs-esm-content/shiki-highlighter';
import { provideFileRouter } from '@benpsnyder/analogjs-esm-router';
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import {
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
} from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideClientHydration(),
    provideContent(
      withMarkdownRenderer({
        loadMermaid: !import.meta.env.SSR ? () => import('mermaid') : undefined,
      }),
      withShikiHighlighter(),
    ),
    provideFileRouter(
      withInMemoryScrolling({ anchorScrolling: 'enabled' }),
      withEnabledBlockingInitialNavigation(),
    ),
  ],
};
