// Standalone type definitions for JSR publication
// These are minimal type exports without external dependencies

export interface ContentFile {
  /** The filename of the content (without the extension) */
  filename: string;
  /** The slug of the content file for routing */
  slug: string;
  /** Front-matter attributes */
  attributes: Record<string, any>;
  /** The content as a string */
  content: string;
}

export interface MarkdownContentOptions {
  /** Custom marked configuration */
  marked?: any;
  /** Enable or disable syntax highlighting */
  highlighter?: boolean;
  /** Custom highlighter configuration */
  highlighterOptions?: any;
}

export interface ContentRenderer {
  /** Render the content as HTML */
  render(content: string, options?: any): Promise<string>;
}

export interface ContentProviderOptions {
  /** The subdirectory to search for content files */
  subdirectory?: string;
  /** File extensions to include */
  extensions?: string[];
  /** Custom content renderer */
  renderer?: ContentRenderer;
}
