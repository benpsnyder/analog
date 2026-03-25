import type {
  BlockContent,
  DefinitionContent,
  PhrasingContent,
  Root,
} from 'mdast';
import type { Transformer } from 'unified';
import { visit } from 'unist-util-visit';

type DirectiveData = {
  directiveLabel?: boolean;
  [key: string]: unknown;
};

type ContainerDirectiveNode = {
  type: 'containerDirective';
  name: string;
  children: (BlockContent | DefinitionContent)[];
  data?: DirectiveData;
};

type FileTreeNode = {
  name: string;
  isDir: boolean;
  children: FileTreeNode[];
};

const FOLDER_ICON_SVG =
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6.75A1.75 1.75 0 0 1 4.75 5h4.1c.45 0 .88.18 1.2.5l1.2 1.2c.14.14.33.22.53.22h7.5A1.75 1.75 0 0 1 21 8.67v9.58A1.75 1.75 0 0 1 19.25 20H4.75A1.75 1.75 0 0 1 3 18.25V6.75Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';

const FILE_ICON_SVG =
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7.75 3h6.84c.46 0 .9.18 1.22.5l3.69 3.69c.32.32.5.76.5 1.22v11.84A1.75 1.75 0 0 1 18.25 22h-10.5A1.75 1.75 0 0 1 6 20.25V4.75A1.75 1.75 0 0 1 7.75 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M14 3v5h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function phrasingToText(nodes: PhrasingContent[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'text') return node.value;
      if (node.type === 'inlineCode') return node.value;
      if (node.type === 'break') return '\n';
      if ('children' in node && Array.isArray(node.children)) {
        return phrasingToText(node.children as PhrasingContent[]);
      }
      return '';
    })
    .join('');
}

function blockToText(node: BlockContent | DefinitionContent): string {
  if (node.type === 'paragraph') return phrasingToText(node.children);
  if (node.type === 'code') return node.value;
  if ('children' in node && Array.isArray(node.children)) {
    return node.children
      .map((child) => {
        if ('type' in child && child.type === 'text') return child.value;
        return '';
      })
      .join('');
  }
  return '';
}

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

    // In directive paragraphs, markdown can normalize away indentation.
    // When that happens, keep nesting continuity from previous directory/file rows.
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

function renderFileTreeMarkup(
  title: string | null,
  tree: FileTreeNode[],
): string {
  const titleMarkup = title
    ? `<p class="filetree-title">${escapeHtml(title)}</p>`
    : '';

  return `<div class="filetree">${titleMarkup}<ul class="filetree-list">${renderTreeItems(
    tree,
  )}</ul></div>`;
}

function buildFileTreeMarkup(raw: string, title: string | null): string {
  const lines = raw
    .split('\n')
    .map((line) => line.replace(/\r$/, ''))
    .filter((line) => line.trim().length > 0);
  const parsed = parseFileTree(lines);
  return renderFileTreeMarkup(title, parsed);
}

export function remarkDirectiveFiletree(): Transformer<Root, Root> {
  return (tree) => {
    visit(tree, 'containerDirective', (rawNode) => {
      const node = rawNode as unknown as ContainerDirectiveNode;
      if (node.name !== 'filetree' && node.name !== 'tree') return;

      let title: string | null = null;
      const bodyBlocks: (BlockContent | DefinitionContent)[] = [];

      for (const child of node.children) {
        if (
          child.type === 'paragraph' &&
          (child as { data?: DirectiveData }).data?.directiveLabel
        ) {
          title = phrasingToText(child.children).trim() || null;
          continue;
        }
        bodyBlocks.push(child);
      }

      const text = bodyBlocks.map(blockToText).join('\n').trim();
      const markup = buildFileTreeMarkup(text, title);

      Object.assign(node, {
        type: 'html',
        value: markup,
      });
    });
  };
}
