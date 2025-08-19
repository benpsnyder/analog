// Standalone type definitions for JSR publication
// These are minimal type exports without external dependencies

export interface VitePluginNitroOptions {
  ssr?: boolean;
  ssrBuildDir?: string;
  /**
   * Prerender the static pages without producing the server output.
   */
  static?: boolean;
  prerender?: PrerenderOptions;
  entryServer?: string;
  index?: string;
  /**
   * Relative path to source files. Default is 'src'.
   */
  sourceRoot?: string;
  /**
   * Absolute path to workspace root. Default is 'process.cwd()'
   */
  workspaceRoot?: string;
  /**
   * Additional page paths to include
   */
  additionalPagesDirs?: string[];
  /**
   * Additional API paths to include
   */
  additionalAPIDirs?: string[];
  apiPrefix?: string;
  /**
   * Toggles internal API middleware.
   */
  useAPIMiddleware?: boolean;
}

export interface PrerenderOptions {
  /**
   * Add additional routes to prerender through crawling page links.
   */
  discover?: boolean;
  /**
   * List of routes to prerender resolved statically or dynamically.
   */
  routes?: string[] | (() => Promise<string[]>);
  sitemap?: SitemapConfig;
  /** List of functions that run for each route after pre-rendering is complete. */
  postRenderingHooks?: ((routes: any) => Promise<void>)[];
}

export interface SitemapConfig {
  host: string;
}

export interface PrerenderContentDir {
  /**
   * The directory where files should be grabbed from.
   */
  contentDir: string;
  /**
   * Transform the matching content files path into a route.
   */
  transform: (file: PrerenderContentFile) => string | false;
  /**
   * Customize the sitemap definition for the prerendered route
   */
  sitemap?:
    | PrerenderSitemapConfig
    | ((file: PrerenderContentFile) => PrerenderSitemapConfig);
}

export interface PrerenderContentFile {
  path: string;
  attributes: Record<string, any>;
  name: string;
  extension: string;
}

export interface PrerenderSitemapConfig {
  lastmod?: string;
  changefreq?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority?: string;
}

export interface PrerenderRouteConfig {
  route: string;
  /**
   * Customize the sitemap definition for the prerendered route
   */
  sitemap?: PrerenderSitemapConfig | (() => PrerenderSitemapConfig);
  /**
   * Prerender static data for the prerendered route
   */
  staticData?: boolean;
}
