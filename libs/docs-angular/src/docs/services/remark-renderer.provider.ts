import {
  ContentRenderer,
  withContentFileLoader,
  withContentListLoader,
} from '@analogjs/content';
import { inject, Injectable, InjectionToken, Provider } from '@angular/core';
import type { Content, Element, Root as HastRoot } from 'hast';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { type Plugin, unified } from 'unified';
import { visit } from 'unist-util-visit';

type UnifiedPlugin = Plugin<any[], any>;
export type ProcessorPlugin = UnifiedPlugin | [UnifiedPlugin, ...unknown[]];
type TableOfContentItem = {
  id: string;
  level: number;
  text: string;
};
type RenderedContent = {
  content: string;
  toc: TableOfContentItem[];
};
export type ContentHeading = TableOfContentItem;

export interface WithRemarkRendererOptions {
  remarkPlugins?: ProcessorPlugin[];
  rehypePlugins?: ProcessorPlugin[];
  allowDangerousHtml?: boolean;
}

export const REMARK_PLUGIN_TOKEN = new InjectionToken<ProcessorPlugin>(
  'ng-docs.remarkPlugin',
);
export const REHYPE_PLUGIN_TOKEN = new InjectionToken<ProcessorPlugin>(
  'ng-docs.rehypePlugin',
);
export const REHYPE_ALLOW_DANGEROUS_HTML_TOKEN = new InjectionToken<boolean>(
  'ng-docs.rehypeAllowDangerousHtml',
);

export function withRemarkPlugin(plugin: ProcessorPlugin): Provider {
  return { provide: REMARK_PLUGIN_TOKEN, multi: true, useValue: plugin };
}

export function withRehypePlugin(plugin: ProcessorPlugin): Provider {
  return { provide: REHYPE_PLUGIN_TOKEN, multi: true, useValue: plugin };
}

export function withRemarkRenderer(
  options: WithRemarkRendererOptions = {},
): Provider[] {
  return [
    withContentFileLoader(),
    withContentListLoader(),
    RemarkContentRendererService,
    { provide: ContentRenderer, useExisting: RemarkContentRendererService },
    {
      provide: REHYPE_ALLOW_DANGEROUS_HTML_TOKEN,
      useValue: options.allowDangerousHtml ?? false,
    },
    ...(options.remarkPlugins ?? []).map((plugin) => withRemarkPlugin(plugin)),
    ...(options.rehypePlugins ?? []).map((plugin) => withRehypePlugin(plugin)),
  ];
}

@Injectable()
export class RemarkContentRendererService implements ContentRenderer {
  private readonly remarkPlugins = inject(REMARK_PLUGIN_TOKEN, {
    optional: true,
  }) as ProcessorPlugin[] | null;
  private readonly rehypePlugins = inject(REHYPE_PLUGIN_TOKEN, {
    optional: true,
  }) as ProcessorPlugin[] | null;
  private readonly allowDangerousHtml = inject(
    REHYPE_ALLOW_DANGEROUS_HTML_TOKEN,
    {
      optional: true,
    },
  );
  private headings: TableOfContentItem[] = [];
  private renderRequestId = 0;

  async render(content: string): Promise<RenderedContent> {
    const requestId = ++this.renderRequestId;
    const headings: TableOfContentItem[] = [];
    const processor = unified().use(remarkParse).use(remarkGfm);

    for (const plugin of this.remarkPlugins ?? []) {
      this.applyPlugin(processor, plugin);
    }

    processor.use(remarkRehype, {
      allowDangerousHtml: this.allowDangerousHtml ?? false,
    });

    for (const plugin of this.rehypePlugins ?? []) {
      this.applyPlugin(processor, plugin);
    }

    processor.use(this.createHeadingCollector(headings)).use(rehypeStringify, {
      allowDangerousHtml: this.allowDangerousHtml ?? false,
    });

    const rendered = String(await processor.process(content));

    if (requestId === this.renderRequestId) {
      this.headings = headings;
    }

    return { content: rendered, toc: headings };
  }

  getContentHeadings(content: string): TableOfContentItem[] {
    if (this.headings.length > 0) {
      return this.headings;
    }

    // Keep compatibility with built-in renderer callers that read headings from raw markdown.
    return [...content.matchAll(/^(#{1,6})\s+(.+?)\s*$/gm)].map((match) => ({
      id: this.makeSlug(match[2].trim()),
      level: match[1].length,
      text: match[2].trim(),
    }));
  }

  // eslint-disable-next-line
  enhance() {}

  private applyPlugin(processor: any, plugin: ProcessorPlugin): void {
    if (Array.isArray(plugin)) {
      const [entry, ...options] = plugin;
      processor.use(entry, ...(options as any[]));
      return;
    }

    processor.use(plugin);
  }

  private createHeadingCollector(
    headings: TableOfContentItem[],
  ): Plugin<[], HastRoot> {
    return () => {
      const slugCounts = new Map<string, number>();

      return (tree) => {
        visit(tree, 'element', (node: Element) => {
          if (!/^h[1-6]$/.test(node.tagName)) {
            return;
          }

          const level = Number(node.tagName.slice(1));
          const text = this.readTextContent(node).trim();
          if (!text) {
            return;
          }

          const existingId = node.properties?.['id'];
          const id =
            typeof existingId === 'string' && existingId.length > 0
              ? existingId
              : this.makeUniqueSlug(text, slugCounts);

          node.properties = {
            ...(node.properties ?? {}),
            id,
          };

          headings.push({ id, level, text });
        });
      };
    };
  }

  private readTextContent(node: Element): string {
    let result = '';
    const stack: Content[] = [...(node.children ?? [])];

    while (stack.length > 0) {
      const current = stack.shift();
      if (!current) {
        continue;
      }

      if (current.type === 'text') {
        result += current.value;
      } else if ('children' in current && Array.isArray(current.children)) {
        stack.unshift(...current.children);
      }
    }

    return result;
  }

  private makeSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  private makeUniqueSlug(
    text: string,
    slugCounts: Map<string, number>,
  ): string {
    const baseSlug = this.makeSlug(text);
    const count = slugCounts.get(baseSlug) ?? 0;
    slugCounts.set(baseSlug, count + 1);
    return count === 0 ? baseSlug : `${baseSlug}-${count}`;
  }
}
