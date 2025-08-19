// Standalone type definitions for JSR publication
// These are minimal type exports without external dependencies

export interface PrerenderOptions {
  /**
   * Add additional routes to prerender through crawling page links.
   */
  discover?: boolean;

  /**
   * List of routes to prerender resolved statically or dynamically.
   */
  routes?: string[] | (() => Promise<string[]>);
}

export interface AnalogOptions {
  ssr?: boolean;
  ssrBuildDir?: string;
  /**
   * Prerender the static pages without producing the server output.
   */
  static?: boolean;
  prerender?: PrerenderOptions;
  entryServer?: string;
  apiPrefix?: string;
  jit?: boolean;
  index?: string;
  workspaceRoot?: string;

  /**
   * Enables Angular's HMR during development
   */
  liveReload?: boolean;

  /**
   * Additional page paths to include
   */
  additionalPagesDirs?: string[];
  /**
   * Additional page paths to include
   */
  additionalContentDirs?: string[];
  /**
   * Additional API paths to include
   */
  additionalAPIDirs?: string[];
  /**
   * Additional files to include in compilation
   */
  include?: string[];
  /**
   * Toggles internal API middleware.
   * If disabled, a proxy request is used to route /api
   * requests to / in the production server build.
   */
  useAPIMiddleware?: boolean;
  /**
   * Disable type checking diagnostics by the Angular compiler
   */
  disableTypeChecking?: boolean;
}

export interface PrerenderContentFile {
  /** The filename of the content (without the extension) */
  filename: string;
  /** The slug of the content file for routing */
  slug: string;
  /** Front-matter attributes */
  attributes: Record<string, any>;
}
