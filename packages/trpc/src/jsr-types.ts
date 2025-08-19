// Standalone type definitions for JSR publication
// These are minimal type exports without external dependencies

export interface TRPCClientOptions {
  /** The base URL for the tRPC server */
  baseUrl: string;
  /** Additional headers to send with requests */
  headers?: Record<string, string>;
  /** Custom transformer for data serialization */
  transformer?: any;
}

export interface TRPCServerOptions {
  /** The base path for tRPC endpoints */
  basePath?: string;
  /** Enable development mode */
  dev?: boolean;
  /** Custom context factory */
  createContext?: (req: any) => any;
}

export interface TRPCRouter {
  /** Router procedures */
  [key: string]: any;
}

export interface TRPCProcedure {
  /** Input validation schema */
  input?: any;
  /** Output validation schema */
  output?: any;
  /** The procedure resolver */
  resolve: (opts: any) => any;
}
