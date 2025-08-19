import type { AppRouter } from './server/trpc/routers';
import type { CreateTrpcProxyClient } from '@benpsnyder/analogjs-esm-trpc';
import { createTrpcClient } from '@benpsnyder/analogjs-esm-trpc';
import { inject } from '@angular/core';
import superjson from 'superjson';

export const { provideTrpcClient, TrpcClient, TrpcHeaders } =
  createTrpcClient<AppRouter>({
    url: '/api/trpc',
    transformer: superjson,
  });

// Ensure the injected type is preserved
export function injectTrpcClient(): CreateTrpcProxyClient<AppRouter> {
  const client = inject(TrpcClient);
  // Add type assertion to help with debugging
  return client as CreateTrpcProxyClient<AppRouter>;
}
