import { PageServerLoad } from '@benpsnyder/analogjs-esm-router';

export function load({ params }: PageServerLoad) {
  console.log('slug', params?.['slug']);

  return {
    loaded: true,
  };
}
