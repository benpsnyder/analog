import { PageServerLoad } from '@benpsnyder/analogjs-esm-router';

export function load({ params }: PageServerLoad) {
  console.log('params', params);

  return {
    loaded: true,
  };
}
