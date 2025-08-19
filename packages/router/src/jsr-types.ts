// Standalone type definitions for JSR publication
// These are minimal type exports without external dependencies

export interface RouteExport {
  /** The default component for this route */
  default?: any;
  /** Meta configuration for this route */
  routeMeta?: RouteMeta;
  /** Server-side load function */
  load?: PageServerLoad;
}

export interface RouteMeta {
  /** Route title */
  title?: string;
  /** Meta tags for this route */
  meta?: MetaTag[];
  /** Whether this route is protected */
  canActivate?: any[];
}

export interface MetaTag {
  /** The name attribute */
  name?: string;
  /** The content attribute */
  content?: string;
  /** The property attribute */
  property?: string;
  /** The charset attribute */
  charset?: string;
  /** The httpEquiv attribute */
  httpEquiv?: string;
}

export interface PageServerLoad {
  (params: any): Promise<LoadResult> | LoadResult;
}

export interface LoadResult {
  /** Data to pass to the component */
  data?: any;
  /** Redirect response */
  redirect?: string;
  /** Error response */
  error?: any;
}

export interface Files {
  [key: string]: RouteExport;
}
