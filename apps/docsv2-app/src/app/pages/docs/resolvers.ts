import { injectContentFiles } from '@analogjs/content';
import type { AnalogJsonLdDocument } from '@analogjs/router';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';

import { DocsAttributes } from '../../post-attributes';

const BASE_URL = 'https://analogjs.org';

function injectActiveDocAttributes(
  route: ActivatedRouteSnapshot,
): DocsAttributes | undefined {
  const slug = route.params['slug'] as string | undefined;
  const files = injectContentFiles<DocsAttributes>((f) =>
    f.filename.includes('/src/content/docs/'),
  );

  if (!slug) {
    return files.find((f) => f.slug === 'introduction')?.attributes;
  }

  return files.find(
    (f) =>
      f.filename === `/src/content/docs/${slug}.md` ||
      f.filename === `/src/content/docs/${slug}/index.md`,
  )?.attributes;
}

export const docsJsonLdResolver: ResolveFn<AnalogJsonLdDocument | undefined> = (
  route,
) => {
  const attributes = injectActiveDocAttributes(route);
  if (!attributes) {
    return undefined;
  }

  const slug = route.params['slug'] as string | undefined;
  const pageUrl = slug ? `${BASE_URL}/docs/${slug}` : `${BASE_URL}/docs`;

  const webPage = {
    '@context': 'https://schema.org' as const,
    '@type': 'WebPage' as const,
    name: attributes.title,
    description: attributes.description,
    url: pageUrl,
    isPartOf: {
      '@type': 'WebSite' as const,
      name: 'AnalogJS',
      url: BASE_URL,
    },
  };

  const breadcrumb = {
    '@context': 'https://schema.org' as const,
    '@type': 'BreadcrumbList' as const,
    itemListElement: buildBreadcrumbItems(slug ?? '', attributes.title),
  };

  return [webPage, breadcrumb];
};

function buildBreadcrumbItems(
  slug: string,
  pageTitle: string,
): Array<{
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}> {
  const items: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }> = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Docs',
      item: `${BASE_URL}/docs`,
    },
  ];

  if (!slug) {
    return items;
  }

  const segments = slug.split('/');
  let path = '/docs';

  for (let i = 0; i < segments.length; i++) {
    path += `/${segments[i]}`;
    const isLast = i === segments.length - 1;
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name: isLast ? pageTitle : humanize(segments[i]),
      ...(isLast ? {} : { item: `${BASE_URL}${path}` }),
    });
  }

  return items;
}

function humanize(segment: string): string {
  return segment
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .map((s) => (s.length ? s[0].toUpperCase() + s.slice(1) : s))
    .join(' ');
}
