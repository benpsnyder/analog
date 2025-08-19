import { InjectionToken, Provider, signal, TransferState } from '@angular/core';
import 'isomorphic-fetch';
import {
  httpBatchLink,
  HTTPBatchLinkOptions,
  CreateTRPCClientOptions,
  HTTPHeaders,
  TRPCLink,
} from '@trpc/client';
import { AnyRouter } from '@trpc/server';
import { transferStateLink } from './links/transfer-state-link';
import { transformerLink } from './links/transformer-link';
import {
  provideTrpcCacheState,
  provideTrpcCacheStateStatusManager,
  tRPC_CACHE_STATE,
} from './cache-state';
import { createTRPCRxJSProxyClient } from './trpc-rxjs-proxy';
/**
 * Types copied from @trpc/client/dist/internals/types.d.ts for JSR compatibility
 * These types define the minimal fetch-like interface required by tRPC internally.
 *
 * @see https://github.com/trpc/trpc/blob/main/packages/client/src/internals/types.ts
 */

/**
 * A subset of the standard RequestInit properties needed by tRPC internally.
 * @see RequestInit from lib.dom.d.ts
 * @remarks
 * If you need a property that you know exists but doesn't exist on this
 * interface, go ahead and add it.
 */
interface RequestInitEsque {
  /**
   * Sets the request's body.
   */
  body?: FormData | ReadableStream | string | null;
  /**
   * Sets the request's associated headers.
   */
  headers?: [string, string][] | Record<string, string>;
  /**
   * The request's HTTP-style method.
   */
  method?: string;
  /**
   * Sets the request's signal.
   */
  signal?: AbortSignal | null;
}

/**
 * A subset of the standard Response properties needed by tRPC internally.
 * @see Response from lib.dom.d.ts
 */
interface ResponseEsque {
  readonly body?: NodeJS.ReadableStream | WebReadableStreamEsque | null;
  /**
   * @remarks
   * The built-in Response::json() method returns Promise<any>, but
   * that's not as type-safe as unknown. We use unknown because we're
   * more type-safe. You do want more type safety, right? 😉
   */
  json(): Promise<unknown>;
}

/**
 * A subset of the standard ReadableStream properties needed by tRPC internally.
 * @see ReadableStream from lib.dom.d.ts
 */
type WebReadableStreamEsque = {
  getReader: () => ReadableStreamDefaultReader<Uint8Array>;
};

/**
 * A subset of the standard fetch function type needed by tRPC internally.
 * @see fetch from lib.dom.d.ts
 * @remarks
 * If you need a property that you know exists but doesn't exist on this
 * interface, go ahead and add it.
 */
type FetchEsque = (
  input: RequestInfo | URL | string,
  init?: RequestInit | RequestInitEsque,
) => Promise<ResponseEsque>;

export type TrpcOptions<T extends AnyRouter> = {
  url: string;
  options?: Partial<CreateTRPCClientOptions<T>>;
  batchLinkOptions?: Omit<
    HTTPBatchLinkOptions<T['_def']['_config']['$types']>,
    'url' | 'headers'
  >;
  transformer?: any; // Transformer at top level for better DX
};

export type TrpcClient<AppRouter extends AnyRouter> = ReturnType<
  typeof createTRPCRxJSProxyClient<AppRouter>
>;
const tRPC_INJECTION_TOKEN = new InjectionToken<unknown>(
  '@benpsnyder/analogjs-esm-trpc proxy client',
);

function customFetch(
  input: RequestInfo | URL,
  init?: RequestInit & { method: 'GET' },
) {
  if ((globalThis as any).$fetch) {
    return (globalThis as any).$fetch
      .raw(input.toString(), init)
      .catch((e: any) => {
        throw e;
      })
      .then((response: any) => ({
        ...response,
        headers: response.headers,
        json: () => Promise.resolve(response._data),
      }));
  }

  // dev server trpc for analog & nitro
  if (typeof window === 'undefined') {
    const host =
      process.env['NITRO_HOST'] ?? process.env['ANALOG_HOST'] ?? 'localhost';
    const port =
      process.env['NITRO_PORT'] ?? process.env['ANALOG_PORT'] ?? 4205;
    const base = `http://${host}:${port}`;
    if (input instanceof Request) {
      input = new Request(base, input);
    } else {
      input = new URL(input, base);
    }
  }

  return fetch(input, init);
}

export const createTrpcClient = <AppRouter extends AnyRouter>({
  url,
  options,
  batchLinkOptions,
  transformer,
}: TrpcOptions<AppRouter>) => {
  const TrpcHeaders = signal<HTTPHeaders>({});
  const provideTrpcClient = (): Provider[] => [
    provideTrpcCacheState(),
    provideTrpcCacheStateStatusManager(),
    {
      provide: tRPC_INJECTION_TOKEN,
      useFactory: () => {
        const links: TRPCLink<AppRouter>[] = [
          ...(options?.links ?? []),
          ...(transformer ? [transformerLink(transformer)] : []),
          transferStateLink(),
          httpBatchLink<AppRouter>({
            ...(batchLinkOptions ?? {}),
            headers() {
              return TrpcHeaders();
            },
            fetch: customFetch as any,
            url: url ?? '',
            // Remove this line: ...(transformer && { transformer }),
          } as HTTPBatchLinkOptions<AppRouter['_def']['_config']['$types']>),
        ];

        return createTRPCRxJSProxyClient<AppRouter>({
          links,
        });
      },
      deps: [tRPC_CACHE_STATE, TransferState],
    },
  ];
  const TrpcClient = tRPC_INJECTION_TOKEN as InjectionToken<
    TrpcClient<AppRouter>
  >;
  return {
    TrpcClient,
    provideTrpcClient,
    TrpcHeaders,
    /** @deprecated use TrpcClient instead */
    tRPCClient: TrpcClient,
    /** @deprecated use provideTrpcClient instead */
    provideTRPCClient: provideTrpcClient,
    /** @deprecated use TrpcHeaders instead */
    tRPCHeaders: TrpcHeaders,
  };
};
