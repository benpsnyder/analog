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

export interface RemarkDirectiveAdmonitionOptions {
  /**
   * Class names applied to generated HTML nodes.
   */
  classes?: {
    container?: string;
    title?: string;
  };

  /**
   * Mapping of admonition keyword to output variant.
   */
  types?: Record<string, string>;
}

function toClassList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value)
    .split(/\s+/)
    .map((v) => v.trim())
    .filter(Boolean);
}

export function remarkDirectiveAdmonition({
  classes: { container = 'admonition', title = 'admonition-title' } = {},
  types = {
    note: 'info',
    tip: 'success',
    info: 'info',
    warn: 'warning',
    warning: 'warning',
    danger: 'error',
    caution: 'warning',
    important: 'info',
    success: 'success',
  },
}: RemarkDirectiveAdmonitionOptions = {}): Transformer<Root, Root> {
  return (tree) => {
    visit(tree, 'containerDirective', (rawNode) => {
      const node = rawNode as unknown as ContainerDirectiveNode;
      if (!(node.name in types)) return;

      const titleNodes: PhrasingContent[] = [];
      const bodyNodes: (BlockContent | DefinitionContent)[] = [];

      for (const child of node.children) {
        if (
          child.type === 'paragraph' &&
          (child as { data?: DirectiveData }).data?.directiveLabel
        ) {
          titleNodes.push(...child.children);
        } else {
          bodyNodes.push(child);
        }
      }

      const children: BlockContent[] = [];

      if (titleNodes.length > 0) {
        children.push({
          type: 'paragraph',
          children: titleNodes,
          data: {
            hName: 'p',
            hProperties: { className: [title] },
          },
        } as BlockContent);
      }

      children.push(...(bodyNodes as BlockContent[]));

      const {
        class: classAttr,
        className: classNameAttr,
        ...restAttributes
      } = node.attributes ?? {};

      node.data = {
        ...(node.data ?? {}),
        hName: 'div',
        hProperties: {
          ...restAttributes,
          className: [
            container,
            `admonition-${types[node.name]}`,
            ...toClassList(classAttr),
            ...toClassList(classNameAttr),
          ],
          'data-admonition': node.name,
        },
      };
      node.children = children;
    });
  };
}
