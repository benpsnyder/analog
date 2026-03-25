import type { Element } from 'hast';
import type { ShikiTransformer } from 'shiki';

type ShikiDiffNotationOptions = {
  classLineAdd?: string;
  classLineRemove?: string;
  classActivePre?: string;
};

type DiffMetaElement = Element & {
  meta?: {
    diff?: boolean;
  };
};

export function shikiDiffNotation(
  options: ShikiDiffNotationOptions = {},
): ShikiTransformer {
  const {
    classLineAdd = 'add',
    classLineRemove = 'remove',
    classActivePre = 'diff',
  } = options;
  return {
    name: 'shiki-diff-notation',
    code(node: Element) {
      if (!(node as DiffMetaElement).meta?.diff) return;
      this.addClassToHast(this.pre, classActivePre);
      const lines = node.children.filter(
        (node) => node.type === 'element',
      ) as Element[];
      lines.forEach((line) => {
        for (const child of line.children) {
          if (child.type !== 'element') continue;
          const text = child.children[0];
          if (text.type !== 'text') continue;
          if (text.value.startsWith('+')) {
            text.value = text.value.slice(1);
            this.addClassToHast(line, classLineAdd);
          }
          if (text.value.startsWith('-')) {
            text.value = text.value.slice(1);
            this.addClassToHast(line, classLineRemove);
          }
        }
      });
    },
  };
}
