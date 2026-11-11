import type { TableOfContentItem } from '../../../src/lib/content-renderer';

function escapeAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, body) => {
    const name = String(body).toLowerCase();
    if (name.startsWith('#x')) {
      return String.fromCodePoint(Number.parseInt(name.slice(2), 16));
    }
    if (name.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(name.slice(1), 10));
    }
    return NAMED_ENTITIES[name] ?? entity;
  });
}

/**
 * Reduces rendered heading markup or md4x heading text to comparable plain
 * text. md4x heading text is entity-decoded but keeps raw inline HTML tags,
 * while a rendered heading body is entity-escaped and carries rendered tags.
 */
function headingIdentity(value: string): string {
  const withoutTags = value
    .replace(/<img\b[^>]*\balt="([^"]*)"[^>]*>/gi, '$1')
    .replace(/<[^>]*>/g, '');
  return decodeEntities(withoutTags)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Adds table-of-contents ids to the rendered headings that correspond to
 * md4x's parsed headings, matched in document order by level and text.
 *
 * md4x renders raw HTML headings but leaves them out of `parseMeta()`, so
 * assigning ids by position alone moves every later id onto the wrong
 * heading. Rendered headings without a match keep their own markup.
 */
export function injectHeadingIds(
  html: string,
  toc: TableOfContentItem[],
): string {
  let index = 0;
  return html.replace(
    /<h([1-6])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi,
    (match, level: string, attributes: string | undefined, body: string) => {
      const heading = toc[index];
      if (attributes && /\sid=/i.test(attributes)) {
        return match;
      }
      if (
        !heading ||
        heading.level !== Number(level) ||
        headingIdentity(heading.text) !== headingIdentity(body)
      ) {
        return match;
      }
      index += 1;
      return `<h${level} id="${escapeAttribute(heading.id)}"${attributes ?? ''}>${body}</h${level}>`;
    },
  );
}
