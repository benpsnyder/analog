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
  attributes?: Record<string, string | number | boolean | null | undefined>;
  children: (BlockContent | DefinitionContent)[];
  data?: DirectiveData;
};

function phrasingToText(nodes: PhrasingContent[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'text') return node.value;
      if (node.type === 'inlineCode') return node.value;
      if ('children' in node && Array.isArray(node.children)) {
        return phrasingToText(node.children as PhrasingContent[]);
      }
      return '';
    })
    .join('');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

interface TabInfo {
  label: string;
  value: string;
  children: (BlockContent | DefinitionContent)[];
}

function extractTabs(node: ContainerDirectiveNode): TabInfo[] {
  const tabs: TabInfo[] = [];

  for (const child of node.children) {
    const directive = child as unknown as ContainerDirectiveNode;
    if (directive.type !== 'containerDirective' || directive.name !== 'tab') {
      continue;
    }

    let label = '';
    const bodyNodes: (BlockContent | DefinitionContent)[] = [];

    for (const tabChild of directive.children) {
      if (
        tabChild.type === 'paragraph' &&
        (tabChild as { data?: DirectiveData }).data?.directiveLabel
      ) {
        label = phrasingToText(tabChild.children).trim();
      } else {
        bodyNodes.push(tabChild);
      }
    }

    if (!label) {
      label =
        directive.attributes?.['label']?.toString() ?? `Tab ${tabs.length + 1}`;
    }

    const value = label.toLowerCase().replace(/\s+/g, '-');
    tabs.push({ label, value, children: bodyNodes });
  }

  return tabs;
}

export function remarkDirectiveTabs(): Transformer<Root, Root> {
  return (tree) => {
    visit(tree, 'containerDirective', (rawNode) => {
      const node = rawNode as unknown as ContainerDirectiveNode;
      if (node.name !== 'tabs') return;

      const tabs = extractTabs(node);
      if (tabs.length === 0) return;

      const triggers = tabs
        .map(
          (tab, i) =>
            `<button role="tab" class="tab-trigger" data-tab-value="${escapeHtml(tab.value)}" aria-selected="${i === 0 ? 'true' : 'false'}" tabindex="${i === 0 ? '0' : '-1'}">${escapeHtml(tab.label)}</button>`,
        )
        .join('');

      const headerHtml = `<div class="tabs-list" role="tablist">${triggers}</div>`;

      const panelNodes: (BlockContent | DefinitionContent)[] = [];

      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        const openTag: BlockContent = {
          type: 'html' as any,
          value: `<div role="tabpanel" class="tab-panel" data-tab-panel="${escapeHtml(tab.value)}"${i > 0 ? ' hidden' : ''}>`,
        } as any;
        const closeTag: BlockContent = {
          type: 'html' as any,
          value: '</div>',
        } as any;
        panelNodes.push(openTag, ...tab.children, closeTag);
      }

      Object.assign(node, {
        type: 'html' as any,
        value: `<div class="tabs-container" data-tabs>${headerHtml}`,
      });

      const parent = (tree as any).children as any[];
      const idx = parent.indexOf(rawNode);
      if (idx !== -1) {
        parent.splice(idx + 1, 0, ...panelNodes, {
          type: 'html',
          value: '</div>',
        });
      }
    });
  };
}
