import type {
  ShikiHighlighterOptions,
  ShikiHighlightOptions,
} from './shiki-highlighter.js';

import type { BundledLanguage } from 'shiki';

export interface WithShikiHighlighterOptions {
  highlighter?: Partial<ShikiHighlighterOptions> & {
    additionalLangs?: BundledLanguage[];
  };
  highlight?: ShikiHighlightOptions;
  container?: string;
}
