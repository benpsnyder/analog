// Standalone type definitions for JSR publication
// These are minimal type exports without external dependencies

export interface PluginOptions {
  /** Include glob patterns */
  include?: string[];
  /** Exclude glob patterns */
  exclude?: string[];
  /** Angular configuration overrides */
  tsconfig?: string;
  /** Enable development mode */
  dev?: boolean;
  /** Enable SSR mode */
  ssr?: boolean;
  /** Custom transform options */
  transformOptions?: any;
}

export interface AnalogFileOptions {
  /** The content to compile */
  content: string;
  /** The filename */
  filename: string;
  /** Additional compilation options */
  options?: any;
}

export interface MarkdownTemplateTransform {
  /** The name of the transform */
  name: string;
  /** The transform function */
  transform: (content: string) => string;
}
