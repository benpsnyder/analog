import type { StorybookConfig } from '@benpsnyder/analogjs-esm-storybook-angular';

const config: StorybookConfig = {
  stories: ['../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: ['@storybook/addon-links', '@storybook/addon-docs'],
  framework: {
    name: '@benpsnyder/analogjs-esm-storybook-angular',
    options: {},
  },
};

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
