import { PageServerLoad } from '@benpsnyder/analogjs-esm-router';

export const load = async ({ params, fetch }: PageServerLoad) => {
  return {
    slug: true,
  };
};
