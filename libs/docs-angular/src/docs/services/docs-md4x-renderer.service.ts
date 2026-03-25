import {
  ContentRenderer,
  RenderedContent,
  TableOfContentItem,
} from '@analogjs/content';
import { Injectable, inject } from '@angular/core';
import { createHighlighter, type BundledLanguage } from 'shiki';
import { RemarkContentRendererService } from './remark-renderer.provider';

type DirectiveBlock = {
  body: string;
  endIndex: number;
  label?: string;
};

type TabDefinition = {
  label: string;
  value: string;
  body: string;
};

const ADMONITION_VARIANTS: Record<string, string> = {
  note: 'info',
  tip: 'success',
  info: 'info',
  warn: 'warning',
  warning: 'warning',
  danger: 'error',
  caution: 'warning',
  important: 'info',
  success: 'success',
};

const SHIKI_LANGS: BundledLanguage[] = [
  'ts',
  'tsx',
  'js',
  'jsx',
  'json',
  'html',
  'css',
  'bash',
  'md',
  'yaml',
  'diff',
];

const FOLDER_ICON_SVG =
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6.75A1.75 1.75 0 0 1 4.75 5h4.1c.45 0 .88.18 1.2.5l1.2 1.2c.14.14.33.22.53.22h7.5A1.75 1.75 0 0 1 21 8.67v9.58A1.75 1.75 0 0 1 19.25 20H4.75A1.75 1.75 0 0 1 3 18.25V6.75Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
const FILE_ICON_SVG =
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7.75 3h6.84c.46 0 .9.18 1.22.5l3.69 3.69c.32.32.5.76.5 1.22v11.84A1.75 1.75 0 0 1 18.25 22h-10.5A1.75 1.75 0 0 1 6 20.25V4.75A1.75 1.75 0 0 1 7.75 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M14 3v5h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

let docsHighlighterPromise: ReturnType<typeof createHighlighter> | undefined;

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function decodeHtml(value: string): string {
  return value
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&');
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, '').trim();
}

function makeSlug(text: string, slugCounts: Map<string, number>): string {
  const baseSlug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const count = slugCounts.get(baseSlug) ?? 0;
  slugCounts.set(baseSlug, count + 1);
  return count === 0 ? baseSlug : `${baseSlug}-${count}`;
}

function parseDirectiveStart(line: string): {
  markerLength: number;
  name: string;
  label?: string;
} | null {
  const match = /^(:{3,})([a-zA-Z][\w-]*)(?:\[(.*?)\])?\s*$/.exec(line.trim());
  if (!match) {
    return null;
  }

  return {
    markerLength: match[1].length,
    name: match[2],
    label: match[3]?.trim() || undefined,
  };
}

function isDirectiveClose(line: string, markerLength: number): boolean {
  return new RegExp(`^:{${markerLength}}\\s*$`).test(line.trim());
}

function extractDirectiveBlock(
  lines: string[],
  startIndex: number,
  markerLength: number,
  label?: string,
): DirectiveBlock {
  const body: string[] = [];
  let index = startIndex + 1;

  while (index < lines.length) {
    if (isDirectiveClose(lines[index], markerLength)) {
      return {
        body: body.join('\n'),
        endIndex: index,
        label,
      };
    }
    body.push(lines[index]);
    index++;
  }

  return {
    body: body.join('\n'),
    endIndex: lines.length - 1,
    label,
  };
}

function normalizeTabValue(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '-');
}

function extractTabs(lines: string[]): TabDefinition[] {
  const tabs: TabDefinition[] = [];

  for (let index = 0; index < lines.length; index++) {
    const start = parseDirectiveStart(lines[index]);
    if (!start || start.name !== 'tab') {
      continue;
    }

    const block = extractDirectiveBlock(
      lines,
      index,
      start.markerLength,
      start.label,
    );
    const label = start.label || `Tab ${tabs.length + 1}`;
    tabs.push({
      label,
      value: normalizeTabValue(label),
      body: block.body,
    });
    index = block.endIndex;
  }

  return tabs;
}

type FileTreeNode = {
  name: string;
  isDir: boolean;
  children: FileTreeNode[];
};

function parseFileTree(lines: string[]): FileTreeNode[] {
  const root: FileTreeNode = { name: '__root__', isDir: true, children: [] };
  const stack: Array<{ indent: number; node: FileTreeNode }> = [
    { indent: -1, node: root },
  ];
  let previousLevel = 0;
  let previousWasDir = false;

  for (const rawLine of lines) {
    const expanded = rawLine.replaceAll('\t', '  ');
    const trimmedRight = expanded.replace(/\s+$/, '');
    if (!trimmedRight.trim()) continue;

    const trimmedLeft = trimmedRight.trimStart();
    const treePrefixMatch = trimmedRight.match(
      /^((?:\s|[\u2502|])*)(?:[\u251c\u2514])(?:[\u2500-]{2}\s*)/,
    );
    const indentMatch = trimmedRight.match(/^ */);
    const indentSize = indentMatch ? indentMatch[0].length : 0;
    let indentLevel = treePrefixMatch
      ? Math.floor(treePrefixMatch[1].replaceAll('\u2502', ' ').length / 4) + 1
      : Math.floor(indentSize / 2);
    const isConnectorLine = /^[\u251c\u2514]/.test(trimmedLeft);

    if (isConnectorLine && treePrefixMatch && treePrefixMatch[1].length === 0) {
      indentLevel = previousWasDir
        ? previousLevel + 1
        : Math.max(1, previousLevel);
    }

    const cleaned = trimmedRight
      .trim()
      .replace(/^[|`+\-\s]+/, '')
      .replace(/^(?:[\u2502|]?\s*)*(?:[\u251c\u2514])(?:[\u2500-]{2}\s*)?/, '')
      .trim();

    if (!cleaned) continue;

    const isDir = cleaned.endsWith('/');
    const name = isDir ? cleaned.slice(0, -1) : cleaned;
    if (!name) continue;

    while (stack.length > 1 && stack[stack.length - 1].indent >= indentLevel) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    const nextNode: FileTreeNode = { name, isDir, children: [] };
    parent.children.push(nextNode);
    stack.push({ indent: indentLevel, node: nextNode });
    previousLevel = indentLevel;
    previousWasDir = isDir;
  }

  return root.children;
}

function renderTreeItems(nodes: FileTreeNode[]): string {
  return nodes
    .map((node) => {
      const typeClass = node.isDir ? 'is-dir' : 'is-file';
      const icon = node.isDir ? FOLDER_ICON_SVG : FILE_ICON_SVG;
      const children =
        node.children.length > 0
          ? `<ul class="filetree-list">${renderTreeItems(node.children)}</ul>`
          : '';

      return `<li class="filetree-item ${typeClass}"><span class="filetree-icon" aria-hidden="true">${icon}</span><span class="filetree-label">${escapeHtml(
        node.name,
      )}</span>${children}</li>`;
    })
    .join('');
}

function renderFileTreeMarkup(raw: string, title?: string): string {
  const lines = raw
    .split('\n')
    .map((line) => line.replace(/\r$/, ''))
    .filter((line) => line.trim().length > 0);
  const parsed = parseFileTree(lines);
  const titleMarkup = title
    ? `<p class="filetree-title">${escapeHtml(title)}</p>`
    : '';

  return `<div class="filetree">${titleMarkup}<ul class="filetree-list">${renderTreeItems(
    parsed,
  )}</ul></div>`;
}

async function asyncReplace(
  source: string,
  pattern: RegExp,
  replacer: (...args: string[]) => Promise<string>,
): Promise<string> {
  const matches = Array.from(source.matchAll(pattern));
  if (matches.length === 0) {
    return source;
  }

  let result = '';
  let lastIndex = 0;

  for (const match of matches) {
    const index = match.index ?? 0;
    result += source.slice(lastIndex, index);
    result += await replacer(...(match as unknown as string[]));
    lastIndex = index + match[0].length;
  }

  result += source.slice(lastIndex);
  return result;
}

@Injectable()
export class DocsMd4xContentRendererService extends ContentRenderer {
  private initPromise: Promise<void> | null = null;
  private readonly browserFallback = inject(RemarkContentRendererService, {
    optional: true,
  });

  override async render(content: string): Promise<RenderedContent> {
    if (!this.isServerEnvironment() && this.browserFallback) {
      return this.browserFallback.render(content);
    }

    const preparedMarkdown = await this.expandDirectiveBlocks(content);
    let html = await this.renderMd4x(preparedMarkdown);
    html = await this.highlightCodeBlocks(html);
    const toc = this.extractHeadingsFromHtml(html);
    html = this.injectHeadingIds(html, toc);
    html = this.autolinkHeadings(html);
    return { content: html, toc };
  }

  override getContentHeadings(content: string): TableOfContentItem[] {
    return [...content.matchAll(/^(#{1,6})\s+(.+?)\s*$/gm)].map((match) => ({
      id: match[2]
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-'),
      level: match[1].length,
      text: match[2].trim(),
    }));
  }

  private async expandDirectiveBlocks(markdown: string): Promise<string> {
    const lines = markdown.split('\n');
    const rendered: string[] = [];

    for (let index = 0; index < lines.length; index++) {
      const start = parseDirectiveStart(lines[index]);
      if (!start) {
        rendered.push(lines[index]);
        continue;
      }

      if (start.name === 'tabs') {
        const block = extractDirectiveBlock(lines, index, start.markerLength);
        rendered.push(await this.renderTabs(block.body));
        index = block.endIndex;
        continue;
      }

      if (start.name in ADMONITION_VARIANTS) {
        const block = extractDirectiveBlock(
          lines,
          index,
          start.markerLength,
          start.label,
        );
        rendered.push(await this.renderAdmonition(start.name, block));
        index = block.endIndex;
        continue;
      }

      if (start.name === 'filetree' || start.name === 'tree') {
        const block = extractDirectiveBlock(
          lines,
          index,
          start.markerLength,
          start.label,
        );
        rendered.push(renderFileTreeMarkup(block.body, block.label));
        index = block.endIndex;
        continue;
      }

      rendered.push(lines[index]);
    }

    return rendered.join('\n');
  }

  private async renderAdmonition(
    type: string,
    block: DirectiveBlock,
  ): Promise<string> {
    const bodyHtml = await this.renderFragment(block.body);
    const titleHtml = block.label
      ? `<p class="admonition-title">${escapeHtml(block.label)}</p>`
      : '';

    return `<div class="admonition admonition-${ADMONITION_VARIANTS[type]}" data-admonition="${type}">${titleHtml}${bodyHtml}</div>`;
  }

  private async renderTabs(markdown: string): Promise<string> {
    const tabs = extractTabs(markdown.split('\n'));
    if (tabs.length === 0) {
      return markdown;
    }

    const triggers = tabs
      .map(
        (tab, index) =>
          `<button role="tab" class="tab-trigger" data-tab-value="${escapeHtml(tab.value)}" aria-selected="${index === 0 ? 'true' : 'false'}" tabindex="${index === 0 ? '0' : '-1'}">${escapeHtml(tab.label)}</button>`,
      )
      .join('');

    const panels = await Promise.all(
      tabs.map(async (tab, index) => {
        const html = await this.renderFragment(tab.body);
        return `<div role="tabpanel" class="tab-panel" data-tab-panel="${escapeHtml(tab.value)}"${index > 0 ? ' hidden' : ''}>${html}</div>`;
      }),
    );

    return `<div class="tabs-container" data-tabs><div class="tabs-list" role="tablist">${triggers}</div>${panels.join(
      '',
    )}</div>`;
  }

  private async renderFragment(markdown: string): Promise<string> {
    const prepared = await this.expandDirectiveBlocks(markdown);
    return this.renderMd4x(prepared);
  }

  private async renderMd4x(markdown: string): Promise<string> {
    if (this.isServerEnvironment()) {
      const { renderToHtml } = await import('md4x/napi');
      return renderToHtml(markdown);
    }

    const wasm = await import('md4x/wasm');
    if (!this.initPromise) {
      this.initPromise = import('md4x/build/md4x.wasm?module').then(
        ({ default: module }) =>
          wasm.init({
            wasm: module,
          }),
      );
    }
    await this.initPromise;
    return wasm.renderToHtml(markdown);
  }

  private isServerEnvironment(): boolean {
    return typeof window === 'undefined' || !!import.meta.env?.SSR;
  }

  private async highlightCodeBlocks(html: string): Promise<string> {
    return asyncReplace(
      html,
      /<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g,
      async (fullMatch, attrs, code) => {
        const language = /language-([^"\s]+)/.exec(attrs)?.[1];
        const decodedCode = decodeHtml(code);
        const normalizedLang = this.normalizeLanguage(language);

        if (normalizedLang === 'mermaid') {
          return `<pre class="mermaid">${escapeHtml(decodedCode)}</pre>`;
        }

        if (!normalizedLang) {
          return fullMatch;
        }

        try {
          const highlighter = await this.getHighlighter();
          return highlighter.codeToHtml(decodedCode, {
            lang: normalizedLang,
            themes: {
              light: 'github-light',
              dark: 'github-dark',
            },
          });
        } catch {
          return fullMatch;
        }
      },
    );
  }

  private normalizeLanguage(lang?: string): BundledLanguage | 'mermaid' | null {
    if (!lang) {
      return null;
    }

    const normalized = lang.toLowerCase();
    const aliases: Record<string, BundledLanguage | 'mermaid'> = {
      shell: 'bash',
      sh: 'bash',
      zsh: 'bash',
      'diff-ts': 'ts',
      'diff-js': 'js',
      'diff-json': 'json',
      'diff-html': 'html',
      'diff-css': 'css',
      mermaid: 'mermaid',
    };

    return aliases[normalized] ?? (normalized as BundledLanguage);
  }

  private async getHighlighter() {
    docsHighlighterPromise ??= createHighlighter({
      langs: SHIKI_LANGS,
      themes: ['github-light', 'github-dark'],
    });
    return docsHighlighterPromise;
  }

  private extractHeadingsFromHtml(content: string): TableOfContentItem[] {
    const toc: TableOfContentItem[] = [];
    const slugCounts = new Map<string, number>();
    const headingRegex = /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi;

    for (const match of content.matchAll(headingRegex)) {
      const level = Number(match[1]);
      const text = stripTags(match[3] ?? '');
      if (!text) {
        continue;
      }

      toc.push({
        id: makeSlug(text, slugCounts),
        level,
        text,
      });
    }

    return toc;
  }

  private injectHeadingIds(html: string, toc: TableOfContentItem[]): string {
    let tocIndex = 0;
    return html.replace(/<h([1-6])([^>]*)>/g, (match, level, attrs) => {
      if (/\sid=/.test(attrs)) {
        return match;
      }

      const item = toc[tocIndex++];
      if (!item) {
        return match;
      }

      return `<h${level}${attrs} id="${item.id}">`;
    });
  }

  private autolinkHeadings(html: string): string {
    return html.replace(
      /<h([1-6])([^>]*) id="([^"]+)"([^>]*)>([\s\S]*?)<\/h\1>/g,
      (_match, level, beforeId, id, afterId, innerHtml) =>
        `<h${level}${beforeId} id="${id}"${afterId}><a aria-hidden="true" tabindex="-1" href="#${id}"><span class="icon icon-link"></span></a>${innerHtml}</h${level}>`,
    );
  }
}
