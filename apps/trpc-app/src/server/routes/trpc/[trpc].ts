import { appRouter } from '../../trpc/routers';
import { createContext } from '../../trpc/context';
import { createTrpcNitroHandler } from '@benpsnyder/analogjs-esm-trpc/server';
// export API handler
export default createTrpcNitroHandler({
  router: appRouter,
  createContext,
});
