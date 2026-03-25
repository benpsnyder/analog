import { readFileSync } from 'node:fs';
import frontMatter from 'front-matter';
import { unified, type PluggableList } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import type { Plugin } from 'vite';

type PipelineConfig = {
  remarkPlugins: PluggableList;
  rehypePlugins: PluggableList;
};

export type RemarkContentPluginOptions = {
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
  enabled?: (id: string) => boolean;
};

function resolvePipeline(
  options: RemarkContentPluginOptions = {},
): PipelineConfig {
  // Keep this resolver as the future extension seam for a preset/factory API.
  return {
    remarkPlugins: options.remarkPlugins ?? [],
    rehypePlugins: options.rehypePlugins ?? [],
  };
}

export function remarkContentPlugin(
  options: RemarkContentPluginOptions = {},
): Plugin {
  return {
    name: 'ng-docs-remark-content',
    enforce: 'pre',
    async load(id) {
      if (!id.includes('analog-content-file=true')) {
        return null;
      }

      if (options.enabled && !options.enabled(id)) {
        return null;
      }

      try {
        const filePath = id.split('?')[0];
        const fileContents = readFileSync(filePath, 'utf8');

        const { body, frontmatter } = frontMatter(fileContents);
        const { remarkPlugins, rehypePlugins } = resolvePipeline(options);

        const rendered = String(
          await unified()
            .use(remarkParse)
            .use(remarkPlugins)
            .use(remarkRehype, { allowDangerousHtml: true })
            .use(rehypePlugins)
            .use(rehypeStringify, { allowDangerousHtml: true })
            .process(body),
        );

        return `export default ${JSON.stringify(
          `---\n${frontmatter}\n---\n\n${rendered}`,
        )}`;
      } catch (error) {
        this.error(
          `[ng-docs-remark-content] Failed to render markdown module: ${id}\n${String(error)}`,
        );
      }
    },
  };
}
