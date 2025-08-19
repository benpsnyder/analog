import { withPrismHighlighter } from '@benpsnyder/analogjs-esm-content/prism-highlighter';
import { provideFileRouter } from '@benpsnyder/analogjs-esm-router';
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import {
  provideContent,
  withMarkdownRenderer,
} from '@benpsnyder/analogjs-esm-content';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFileRouter(),
    provideHttpClient(),
    provideContent(
      withMarkdownRenderer(),
      // NOTE: .agx files are not affected by the highlighter yet.
      withPrismHighlighter(),
    ),
  ],
};
