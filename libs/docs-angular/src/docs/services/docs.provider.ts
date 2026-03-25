import {
  computed,
  inject,
  Injectable,
  InjectionToken,
  Provider,
  ResourceRef,
  Signal,
} from '@angular/core';
import { NavItem, Doc, DocsTreeRoot } from '../models';
import { injectContentFiles } from '@analogjs/content';
import { contentFileResource } from '@analogjs/content/resources';

export interface DocumentationSourceOptions {
  dir: string;
  baseUrl?: string;
}

/**
 * Injection token used to configure which directory contains documentation
 * when using `withDocumentationSource(dir)`.
 */
export const DOCUMENTATION_SOURCE_TOKEN = new InjectionToken<
  DocumentationSourceOptions | undefined
>('ng-docs.documentationSource');
export const DOCUMENTATION_ATTRIBUTES_TOKEN = new InjectionToken<any>(
  'ng-docs.documentationAttributes',
);

/**
 * Provider helper to configure a documentation source directory.
 * Use it inside `provideContent(...)` so the `DocsProvider` will pick up
 * and register content files automatically:
 *
 * provideContent(withDocumentationSource('src/content/docs'))
 */
export function withDocumentationSource<
  Attributes extends Record<string, any> = Record<string, any>,
>(opts: DocumentationSourceOptions): Provider[] {
  return [
    {
      provide: DOCUMENTATION_SOURCE_TOKEN,
      useValue: opts,
    },
    // Provide a typed placeholder for consumers to attach attribute typing.
    // The actual value is not used at runtime; this exists to carry the
    // Attributes type into DI so callers can call withDocumentationSource<T>().
    {
      provide: DOCUMENTATION_ATTRIBUTES_TOKEN,
      useValue: undefined as unknown as Attributes,
    },
  ];
}

export interface DocsApi {
  getPage: (slug: Signal<string>) => ResourceRef<any>;
  readonly pageTree: DocsTreeRoot;
}

export type TocItem = { id: string; level: number; text: string };

@Injectable({
  providedIn: 'root',
})
export class DocsProvider implements DocsApi {
  private readonly docsOptions = inject(DOCUMENTATION_SOURCE_TOKEN, {
    optional: true,
  });
  private readonly docsRegistry = new Map<string, Doc>();
  private pageTreeRoot: DocsTreeRoot = this.createRootTree('Docs');

  /** Builds the initial docs registry and navigation tree from configured content files. */
  constructor() {
    this.initializeRegistry();
  }

  getPage<T extends Record<string, any> = Record<string, any>>(
    slug: Signal<string>,
  ): ResourceRef<any> {
    const filePath = computed(() => ({
      customFilename: this.resolveContentLookupFromSlug(slug()),
      skipRender: true,
    }));
    return contentFileResource(filePath);
  }

  /** Exposes the computed docs navigation tree for rendering. */
  get pageTree(): DocsTreeRoot {
    return this.pageTreeRoot;
  }

  /** Discovers content files and populates the in-memory registry/tree once on startup. */
  private initializeRegistry(): void {
    const dir = this.docsOptions?.dir;
    if (!dir) {
      return;
    }

    try {
      const files = injectContentFiles((f) => f.filename.includes(dir));
      this.pageTreeRoot = this.createRootTree(this.resolveTreeRootName(dir));
      files.forEach((file) => this.registerContentFile(file as any));
    } catch (e) {
      console.warn('DocsProvider: unable to load documentation source', e);
    }
  }

  /** Derives a friendly root label from the configured docs directory name. */
  private resolveTreeRootName(dir: string): string {
    const folderName = dir.split(/[\\/]/).filter(Boolean).pop() || 'docs';
    return this.humanizeSegment(folderName);
  }

  /** Normalizes a content file into a Doc model and inserts it into the navigation tree. */
  private registerContentFile(file: {
    filename: string;
    slug?: string;
    attributes?: any;
  }): void {
    const slugFromFilename = this.buildSlugFromFilename(file.filename);
    const slug = slugFromFilename || file.slug || '';
    const doc: Doc = {
      slug,
      title: this.resolveDocTitle(file.attributes, slug),
      description: this.resolveDocDescription(file.attributes),
      content: '',
    };
    const isIndexDoc = this.isIndexFile(file.filename);
    const relativeFile = this.buildRelativeFilePath(file.filename);

    this.docsRegistry.set(slug, doc);
    this.insertDocIntoTree(
      this.pageTreeRoot.children,
      doc,
      isIndexDoc,
      relativeFile,
    );
  }

  /** Resolves a doc title from frontmatter attributes with a slug fallback. */
  private resolveDocTitle(attributes: any, fallback: string): string {
    return attributes?.title || fallback;
  }

  /** Resolves an optional doc description from frontmatter attributes. */
  private resolveDocDescription(attributes: any): string | undefined {
    return attributes?.description || undefined;
  }

  /** Converts a slug segment into a readable label (e.g. "getting-started" -> "Getting Started"). */
  private humanizeSegment(seg: string): string {
    return seg
      .replace(/[-_]+/g, ' ')
      .split(' ')
      .map((s) => (s.length ? s[0].toUpperCase() + s.slice(1) : s))
      .join(' ');
  }

  /** Builds a route slug by trimming the content dir, extension, and trailing index segment. */
  private buildSlugFromFilename(filename: string): string {
    try {
      const relative = this.pathRelativeToContentDir(filename);
      return relative
        .replace(/^\/+/, '')
        .replace(/\.(md|mdx|markdown)$/i, '')
        .replace(/(?:^|\/)index$/i, '');
    } catch {
      return '';
    }
  }

  /** Computes the file path relative to the configured content directory. */
  private buildRelativeFilePath(filename: string): string {
    return this.pathRelativeToContentDir(filename).replace(/^\/+/, '');
  }

  /** Checks whether the source file is an index document. */
  private isIndexFile(filename: string): boolean {
    const normalized = filename.replace(/\\/g, '/');
    return /(?:^|\/)index\.(md|mdx|markdown)$/i.test(normalized);
  }

  /** Inserts a doc into the nested tree structure, creating folders/pages along the slug path. */
  private insertDocIntoTree(
    tree: NavItem[],
    doc: Doc,
    isIndexDoc: boolean,
    relativeFile?: string,
  ): void {
    const raw = this.normalizeSlug(doc.slug);
    if (!raw) {
      tree.push(this.createPageNode('', doc, relativeFile || 'index.md'));
      return;
    }

    const segments = raw.split('/').filter(Boolean);
    let currentLevel = tree;
    const pathParts: string[] = [];

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      pathParts.push(seg);
      const pathKey = pathParts.join('/');
      const isLeaf = i === segments.length - 1;
      const shouldBeFolder = !isLeaf || isIndexDoc;
      const node = this.ensureTreeNode(
        currentLevel,
        pathKey,
        seg,
        shouldBeFolder,
        doc,
        relativeFile,
      );

      if (isLeaf) {
        this.applyLeafDoc(node, pathKey, doc, isIndexDoc, relativeFile);
      }

      if (shouldBeFolder && node.type === 'folder') {
        currentLevel = this.ensureChildren(node);
      }
    }
  }

  /** Returns an existing node for a path key, or creates/converts one to match folder/page shape. */
  private ensureTreeNode(
    level: NavItem[],
    pathKey: string,
    segment: string,
    shouldBeFolder: boolean,
    doc: Doc,
    relativeFile?: string,
  ): NavItem {
    let node = level.find((item) => item.slug === pathKey);
    if (node?.type === 'page' && shouldBeFolder) {
      this.convertPageToFolder(node, segment);
      return node;
    }

    if (!node) {
      node = shouldBeFolder
        ? this.createFolderNode(pathKey, segment)
        : this.createPageNode(pathKey, doc, relativeFile);
      level.push(node);
    }

    return node;
  }

  /** Applies the leaf doc payload onto the final node (index page, page update, or folder index). */
  private applyLeafDoc(
    node: NavItem,
    pathKey: string,
    doc: Doc,
    isIndexDoc: boolean,
    relativeFile?: string,
  ): void {
    if (isIndexDoc && node.type === 'folder') {
      node.index = this.createPageNode(
        pathKey,
        doc,
        relativeFile || `${pathKey}/index.md`,
      );
      return;
    }

    if (!isIndexDoc && node.type === 'page') {
      this.updatePageNode(node, pathKey, doc, relativeFile);
      return;
    }

    if (!isIndexDoc && node.type === 'folder') {
      node.index = this.createPageNode(
        pathKey,
        doc,
        relativeFile || `${pathKey}.md`,
      );
    }
  }

  /** Guarantees a folder node has a mutable children array and returns it. */
  private ensureChildren(node: NavItem): NavItem[] {
    if (!node.children) {
      node.children = [];
    }
    return node.children;
  }

  /** Creates a new root object for the docs navigation tree. */
  private createRootTree(name: string): DocsTreeRoot {
    return {
      $id: 'root',
      name,
      children: [],
    };
  }

  /** Normalizes slugs by removing leading/trailing slashes. */
  private normalizeSlug(slug?: string): string {
    return (slug || '').replace(/^\/+|\/+$/g, '');
  }

  /** Returns the configured docs content directory with normalized slashes. */
  private get contentDir(): string {
    return (this.docsOptions?.dir || 'src/content/docs').replace(
      /^\/+|\/+$/g,
      '',
    );
  }

  /** Returns the docs directory relative to src/content for content resource lookups. */
  private get contentLookupDir(): string {
    return this.contentDir
      .replace(/^src\/content\/?/, '')
      .replace(/^\/+|\/+$/g, '');
  }

  /** Returns the normalized public base URL used for docs page links. */
  private get baseUrl(): string {
    return (this.docsOptions?.baseUrl || '/docs').replace(/\/+$/g, '');
  }

  /** Converts an absolute content filename to a path relative to the configured docs directory. */
  private pathRelativeToContentDir(filename: string): string {
    const normalized = filename.replace(/\\/g, '/');
    const configuredDir = this.contentDir
      .replace(/\\/g, '/')
      .replace(/^\/+/, '');
    const idx = normalized.indexOf(configuredDir);
    const relative =
      idx !== -1 ? normalized.slice(idx + configuredDir.length) : normalized;
    return relative.replace(/^\/+/, '');
  }
  /** Resolves a route slug to a content lookup path under src/content. */
  private resolveContentLookupFromSlug(routeSlug: string): string {
    const normalizedSlug = this.normalizeRouteSlug(routeSlug);
    const matchedDoc =
      this.docsRegistry.get(normalizedSlug)?.slug ?? normalizedSlug;
    return matchedDoc
      ? `${this.contentLookupDir}/${matchedDoc}`
      : this.contentLookupDir;
  }

  /** Normalizes incoming route slugs to match docs registry keys. */
  private normalizeRouteSlug(routeSlug: string): string {
    const normalized = this.normalizeSlug(routeSlug);
    const baseSegment = this.normalizeSlug(this.baseUrl);

    if (
      baseSegment &&
      (normalized === baseSegment || normalized.startsWith(`${baseSegment}/`))
    ) {
      return normalized.slice(baseSegment.length).replace(/^\/+/, '');
    }

    return normalized;
  }

  /** Builds a docs page URL by combining the configured base URL and path key. */
  private buildPageUrl(pathKey: string): string {
    return pathKey
      ? `${this.baseUrl}/${pathKey}`.replace(/\/\/+/g, '/')
      : this.baseUrl;
  }

  /** Creates a folder node used as a section in the docs navigation tree. */
  private createFolderNode(pathKey: string, segment: string): NavItem {
    return {
      $id: pathKey,
      name: this.humanizeSegment(segment),
      description: '',
      type: 'folder',
      slug: pathKey,
      children: [],
    };
  }

  /** Creates a page node that points to a content file reference and public URL. */
  private createPageNode(pathKey: string, doc: Doc, fileRef?: string): NavItem {
    const refFile = fileRef || `${pathKey || 'index'}.md`;
    return {
      $id: refFile,
      name: doc.title,
      description: doc.description || '',
      type: 'page',
      slug: pathKey,
      url: this.buildPageUrl(pathKey),
      $ref: { file: refFile },
      children: [],
    };
  }

  /** Updates an existing page node with the latest doc metadata and file reference. */
  private updatePageNode(
    node: NavItem,
    pathKey: string,
    doc: Doc,
    fileRef?: string,
  ): void {
    const refFile = fileRef || `${pathKey}.md`;
    node.$id = fileRef || node.$id || pathKey;
    node.name = doc.title;
    node.description = doc.description || node.description || '';
    node.url = this.buildPageUrl(pathKey);
    node.$ref = { file: refFile };
  }

  /** Promotes a page node into a folder and preserves the original page as the folder index page. */
  private convertPageToFolder(node: NavItem, segment: string): void {
    const existingPage = { ...node };
    node.type = 'folder';
    node.name = this.humanizeSegment(segment);
    node.description = '';
    node.children = existingPage.children ?? [];
    node.index = {
      $id: existingPage.$id || existingPage.slug,
      name: existingPage.name,
      description: existingPage.description,
      type: 'page',
      slug: existingPage.slug,
      url: existingPage.url,
      $ref: existingPage.$ref,
      children: [],
    };
  }
}
