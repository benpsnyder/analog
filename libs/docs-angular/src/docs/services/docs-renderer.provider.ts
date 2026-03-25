import {
  ContentRenderer,
  withContentFileLoader,
  withContentListLoader,
} from '@analogjs/content';
import { Provider } from '@angular/core';
import { DocsMd4xContentRendererService } from './docs-md4x-renderer.service';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import rehypeShiki from '@shikijs/rehype';
import remarkDirective from 'remark-directive';
import {
  REHYPE_ALLOW_DANGEROUS_HTML_TOKEN,
  RemarkContentRendererService,
  withRehypePlugin,
  withRemarkPlugin,
} from './remark-renderer.provider';
import {
  remarkDirectiveAdmonition,
  remarkDirectiveFiletree,
  remarkDirectiveTabs,
} from '../../../../markdown-pipeline/src/index';

export function withDocsMd4xRenderer(): Provider[] {
  return [
    withContentFileLoader(),
    withContentListLoader(),
    RemarkContentRendererService,
    {
      provide: REHYPE_ALLOW_DANGEROUS_HTML_TOKEN,
      useValue: true,
    },
    withRemarkPlugin(remarkDirective),
    withRemarkPlugin(remarkDirectiveAdmonition),
    withRemarkPlugin(remarkDirectiveFiletree),
    withRemarkPlugin(remarkDirectiveTabs),
    withRehypePlugin(rehypeSlug),
    withRehypePlugin(rehypeAutolinkHeadings),
    withRehypePlugin([
      rehypeShiki,
      {
        themes: {
          light: 'github-light',
          dark: 'github-dark',
        },
      },
    ]),
    DocsMd4xContentRendererService,
    { provide: ContentRenderer, useExisting: DocsMd4xContentRendererService },
  ];
}

export const withDocsRenderer = withDocsMd4xRenderer;
