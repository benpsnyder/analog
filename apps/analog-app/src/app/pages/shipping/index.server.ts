import { parseCookies } from 'h3';
import { PageServerLoad } from '@benpsnyder/analogjs-esm-router';

export const load = async ({ event }: PageServerLoad) => {
  console.log('shipping');
  const cookies = parseCookies(event);

  console.log('test cookie', cookies['test']);

  return {
    shipping: true,
  };
};
