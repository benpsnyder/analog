#!/usr/bin/env bun

/**
 * Script to generate JSR configs for all AnalogJS packages
 * Usage: bun scripts/setup-jsr-configs.ts
 */

import {
  writeFileSync,
  readFileSync,
  existsSync,
  readdirSync,
  statSync,
} from 'fs';
import { resolve, join } from 'path';

interface PackageJson {
  name: string;
  version: string;
  description?: string;
  license?: string;
  exports?: Record<string, any>;
  repository?: {
    type: string;
    url: string;
  };
  peerDependencies?: Record<string, string>;
}

interface JSRConfig {
  $schema: string;
  name: string;
  version: string;
  description?: string;
  license?: string;
  repository?: {
    type: string;
    url: string;
  };
  exports: Record<string, string>;
  publish: {
    exclude: string[];
  };
  peerDependencies?: Record<string, string>;
}

const DEFAULT_EXCLUDES = [
  '**/*.spec.ts',
  '**/*.test.ts',
  '**/test-setup.ts',
  '**/__tests__/**',
  '**/coverage/**',
  '**/node_modules/**',
  '**/*.map',
  'migrations/**',
  'tsconfig.*.json',
  'jest.config.*',
  'vite.config.*',
];

function convertNpmNameToJSR(npmName: string): string {
  // Convert @benpsnyder/analogjs-esm-package-name to @benpsnyder/analogjs-esm-package-name
  return npmName.replace(
    '@benpsnyder/analogjs-esm-',
    '@benpsnyder/analogjs-esm-',
  );
}

function findFilesRecursive(dir: string, pattern: RegExp): string[] {
  const results: string[] = [];

  if (!existsSync(dir)) return results;

  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursively search subdirectories
      results.push(...findFilesRecursive(fullPath, pattern));
    } else if (pattern.test(item)) {
      results.push(fullPath);
    }
  }

  return results;
}

function generateExports(
  packagePath: string,
  packageJson: PackageJson,
): Record<string, string> {
  const exports: Record<string, string> = {};

  // Default export - look for src/index.ts
  const mainIndex = resolve(packagePath, 'src/index.ts');
  if (existsSync(mainIndex)) {
    exports['.'] = './src/index';
  }

  // Package.json export
  exports['./package.json'] = './package.json';

  // Look for subpath exports based on existing package.json exports
  if (packageJson.exports && typeof packageJson.exports === 'object') {
    Object.entries(packageJson.exports).forEach(([key, value]) => {
      if (key === './package.json') return;

      if (typeof value === 'string') {
        // Simple string export - convert to TypeScript source
        const tsPath = value.replace(/\.js$/, '.ts');
        if (existsSync(resolve(packagePath, tsPath))) {
          exports[key] = tsPath;
        }
      } else if (typeof value === 'object' && value.import) {
        // Object with import field
        const tsPath = value.import.replace(/\.js$/, '.ts');
        if (existsSync(resolve(packagePath, tsPath))) {
          exports[key] = tsPath;
        }
      }
    });
  }

  // Auto-discover subpackages (e.g., router/server, content/og)
  const indexFiles = findFilesRecursive(packagePath, /^index\.ts$/);
  indexFiles.forEach((indexFile) => {
    const relativePath = indexFile.replace(packagePath + '/', '');
    if (
      relativePath.includes('/src/index.ts') &&
      relativePath !== 'src/index.ts'
    ) {
      const subPackageName = relativePath.split('/')[0];
      const exportKey = `./${subPackageName}`;
      if (!exports[exportKey]) {
        exports[exportKey] = `./${relativePath}`;
      }
    }
  });

  return exports;
}

function generateJSRConfig(packagePath: string): JSRConfig {
  const packageJsonPath = resolve(packagePath, 'package.json');

  if (!existsSync(packageJsonPath)) {
    throw new Error(`package.json not found in ${packagePath}`);
  }

  const packageJson: PackageJson = JSON.parse(
    readFileSync(packageJsonPath, 'utf-8'),
  );

  const config: JSRConfig = {
    $schema: 'https://jsr.io/schema/config-file.v1.json',
    name: convertNpmNameToJSR(packageJson.name),
    version: packageJson.version,
    description: packageJson.description
      ? `${packageJson.description} - ESM edition`
      : undefined,
    license: packageJson.license || 'MIT',
    repository: packageJson.repository || {
      type: 'git',
      url: 'https://github.com/analogjs/analog.git',
    },
    exports: generateExports(packagePath, packageJson),
    publish: {
      exclude: [...DEFAULT_EXCLUDES],
    },
    // Include peer dependencies for proper external dependency resolution
    ...(packageJson.peerDependencies && {
      peerDependencies: packageJson.peerDependencies,
    }),
  };

  // Package-specific excludes
  const packageName = packageJson.name.split('/')[1];
  switch (packageName) {
    case 'content':
      config.publish.exclude.push('ng-package.json', 'plugin/**');
      break;
    case 'router':
      config.publish.exclude.push('ng-package.json');
      break;
    case 'nx-plugin':
      config.publish.exclude.push('executors.json', 'generators.json');
      break;
  }

  return config;
}

const TARGET_PACKAGES = [
  'platform',
  'router',
  'content',
  'vite-plugin-angular',
  'trpc',
];

function main() {
  console.log(
    '🔧 Generating JSR configurations for target AnalogJS packages...',
  );
  console.log(`📦 Target packages: ${TARGET_PACKAGES.join(', ')}`);

  const packagesDir = resolve('packages');
  let successCount = 0;

  TARGET_PACKAGES.forEach((packageName) => {
    const packagePath = join(packagesDir, packageName);
    const packageJsonPath = join(packagePath, 'package.json');

    // Skip if package doesn't exist
    if (!existsSync(packagePath) || !existsSync(packageJsonPath)) {
      console.log(`⚠️  Skipping ${packageName} - package not found`);
      return;
    }

    try {
      const config = generateJSRConfig(packagePath);
      const jsrConfigPath = resolve(packagePath, 'jsr.json');

      writeFileSync(jsrConfigPath, JSON.stringify(config, null, 2));
      console.log(`✅ Generated ${jsrConfigPath}`);
      successCount++;
    } catch (error) {
      console.error(
        `❌ Failed to generate JSR config for ${packagePath}:`,
        error,
      );
    }
  });

  console.log(
    `\n📊 Generated ${successCount}/${TARGET_PACKAGES.length} JSR configurations`,
  );
  console.log('\n🚀 Next steps:');
  console.log('1. Review the generated jsr.json files');
  console.log('2. Install JSR CLI: npm install -g @jsr/cli');
  console.log('3. Login to JSR: jsr auth');
  console.log('4. Test publish: bun scripts/publish.ts --dry-run');
  console.log('5. Publish: bun scripts/publish.ts');
}

// For Bun compatibility, we'll just run main() directly
main();
