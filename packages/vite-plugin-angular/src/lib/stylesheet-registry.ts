import { createHash } from 'node:crypto';
import { dirname, normalize, resolve } from 'node:path';
import { normalizePath } from 'vite';
import type { StylePreprocessor } from './style-preprocessor.js';

export interface AnalogStylesheetRecord {
  publicId: string;
  sourcePath?: string;
  originalCode?: string;
  normalizedCode: string;
}

export class AnalogStylesheetRegistry {
  private servedById = new Map<string, AnalogStylesheetRecord>();
  private servedAliasToId = new Map<string, string>();
  private externalRequestToSource = new Map<string, string>();

  get servedCount(): number {
    return this.servedById.size;
  }

  get externalCount(): number {
    return this.externalRequestToSource.size;
  }

  hasServed(requestId: string): boolean {
    return this.resolveServedRecord(requestId) !== undefined;
  }

  getServedContent(requestId: string): string | undefined {
    return this.resolveServedRecord(requestId)?.normalizedCode;
  }

  resolveExternalSource(requestId: string): string | undefined {
    return this.externalRequestToSource.get(requestId);
  }

  registerExternalRequest(requestId: string, sourcePath: string): void {
    this.externalRequestToSource.set(requestId, sourcePath);
  }

  registerServedStylesheet(
    record: AnalogStylesheetRecord,
    aliases: string[] = [],
  ): void {
    this.servedById.set(record.publicId, record);
    this.servedAliasToId.set(record.publicId, record.publicId);

    for (const alias of aliases) {
      this.servedAliasToId.set(alias, record.publicId);
    }
  }

  private resolveServedRecord(
    requestId: string,
  ): AnalogStylesheetRecord | undefined {
    const publicId = this.servedAliasToId.get(requestId) ?? requestId;
    return this.servedById.get(publicId);
  }
}

export function preprocessStylesheet(
  code: string,
  filename: string,
  stylePreprocessor?: StylePreprocessor,
): string {
  return stylePreprocessor ? (stylePreprocessor(code, filename) ?? code) : code;
}

export function rewriteRelativeCssImports(
  code: string,
  filename: string,
): string {
  const cssDir = dirname(filename);
  return code.replace(
    /@import\s+(?:url\(\s*(["']?)(\.[^'")\s;]+)\1\s*\)|(["'])(\.[^'"]+)\3)/g,
    (_match, urlQuote, urlPath, stringQuote, stringPath) => {
      const relPath = urlPath ?? stringPath;
      const absPath = resolve(cssDir, relPath);

      if (typeof urlPath === 'string') {
        return `@import url(${urlQuote}${absPath}${urlQuote})`;
      }

      return `@import ${stringQuote}${absPath}${stringQuote}`;
    },
  );
}

export function registerStylesheetContent(
  registry: AnalogStylesheetRegistry,
  {
    code,
    containingFile,
    className,
    order,
    inlineStylesExtension,
    resourceFile,
  }: {
    code: string;
    containingFile: string;
    className?: string;
    order?: number;
    inlineStylesExtension: string;
    resourceFile?: string;
  },
): string {
  const id = createHash('sha256')
    .update(containingFile)
    .update(className ?? '')
    .update(String(order ?? 0))
    .update(code)
    .digest('hex');
  const stylesheetId = `${id}.${inlineStylesExtension}`;

  const aliases: string[] = [];

  if (resourceFile) {
    const normalizedResourceFile = normalizePath(normalize(resourceFile));
    // Avoid basename-only aliases here: shared filenames like `index.css`
    // can collide across components and break HMR lookups.
    aliases.push(
      resourceFile,
      normalizedResourceFile,
      resourceFile.replace(/^\//, ''),
      normalizedResourceFile.replace(/^\//, ''),
    );
  }

  registry.registerServedStylesheet(
    {
      publicId: stylesheetId,
      sourcePath: resourceFile,
      normalizedCode: code,
    },
    aliases,
  );

  return stylesheetId;
}
