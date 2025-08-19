#!/usr/bin/env bun

/**
 * Script to publish AnalogJS packages to JSR and/or npm under @benpsnyder scope
 *
 * This script automatically builds each package using 'nx build <package>' before publishing.
 *
 * Usage:
 *   bun scripts/publish.ts [--dry-run] [--npm] [--jsr] [--force]     # Build & publish all packages
 *   bun scripts/publish.ts <package-name> [options]                  # Build & publish single package
 *   bun scripts/publish.ts --list                                    # List available packages
 *   bun scripts/publish.ts --help                                    # Show help
 *
 * Publishing Options:
 *   --jsr         Publish to JSR (default if no registry specified)
 *   --npm         Publish to npm
 *   --both        Publish to both JSR and npm
 *   --dry-run     Test mode - validate without building/publishing
 *   --force       Force npm publish (override existing versions)
 *
 * Available packages: platform, router, content, vite-plugin-angular, vite-plugin-nitro, trpc
 *
 * Examples:
 *   bun scripts/publish.ts platform --dry-run            # Test build & publish platform package (JSR)
 *   bun scripts/publish.ts router --npm                  # Build & publish router to npm only
 *   bun scripts/publish.ts content --both --dry-run      # Test build & publish content on both registries
 *   bun scripts/publish.ts platform --npm --force        # Build & force republish platform to npm
 *   bun scripts/publish.ts --npm --dry-run               # Test build & publish all packages on npm
 *
 * NOTE: This script is designed to be upstream-friendly.
 * Simply change the scope in package.json/jsr.json files to switch between
 * @benpsnyder (experimental) and @analogjs (official) when merging upstream.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

interface JSRConfig {
  name: string;
  version: string;
  description?: string;
}

interface NPMConfig {
  name: string;
  version: string;
  description?: string;
}

interface PublishOptions {
  packageName: string;
  isDryRun: boolean;
  publishToJSR: boolean;
  publishToNPM: boolean;
  force: boolean;
}

const PACKAGES_TO_PUBLISH = [
  'platform',
  'router',
  'content',
  'vite-plugin-angular',
  'vite-plugin-nitro',
  'trpc',
];

function loadJSRConfig(packagePath: string): JSRConfig {
  const jsrConfigPath = resolve(packagePath, 'jsr.json');
  if (!existsSync(jsrConfigPath)) {
    throw new Error(`jsr.json not found in ${packagePath}`);
  }

  return JSON.parse(readFileSync(jsrConfigPath, 'utf-8'));
}

function loadNPMConfig(packagePath: string): NPMConfig {
  const npmConfigPath = resolve(packagePath, 'package.json');
  if (!existsSync(npmConfigPath)) {
    throw new Error(`package.json not found in ${packagePath}`);
  }

  return JSON.parse(readFileSync(npmConfigPath, 'utf-8'));
}

function getPackageOutputPath(packageName: string): string {
  const projectConfigPath = resolve('packages', packageName, 'project.json');
  if (!existsSync(projectConfigPath)) {
    console.log(
      `⚠️  project.json not found for ${packageName}, using default path`,
    );
    return resolve('packages', packageName);
  }

  try {
    const projectConfig = JSON.parse(readFileSync(projectConfigPath, 'utf-8'));

    // Determine outputPath based on the project configuration
    let outputPath;

    if (packageName === 'platform') {
      // Platform uses composite build command
      outputPath =
        projectConfig.targets?.['build-package']?.options?.outputPath;
    } else if (projectConfig.targets?.build?.outputs?.[0]) {
      // Use outputs array if available (handles ng-packagr and nx:run-commands)
      outputPath = projectConfig.targets?.build?.outputs?.[0];
      if (outputPath && outputPath.includes('{workspaceRoot}')) {
        // Replace {workspaceRoot} with actual workspace root
        outputPath = outputPath.replace('{workspaceRoot}', process.cwd());
      }
    } else {
      // Fallback to standard outputPath for @nx/js:tsc packages
      outputPath = projectConfig.targets?.build?.options?.outputPath;
    }

    if (outputPath && existsSync(outputPath)) {
      console.log(
        `🔧 Using built package location for ${packageName}: ${outputPath}`,
      );
      return outputPath;
    } else {
      console.log(
        `⚠️  Built package not found at ${outputPath}, run 'nx build ${packageName}' first`,
      );
      return resolve('packages', packageName);
    }
  } catch (error) {
    console.log(
      `⚠️  Error reading project.json for ${packageName}, using default path`,
    );
    return resolve('packages', packageName);
  }
}

function validatePackageForPublishing(
  packageName: string,
  packagePath: string,
): boolean {
  console.log(`🔍 Validating ${packageName} package before publishing...`);

  let validationErrors: string[] = [];

  // 1. Check if package.json exists and is valid
  const packageJsonPath = resolve(packagePath, 'package.json');
  if (!existsSync(packageJsonPath)) {
    validationErrors.push('package.json not found');
  } else {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      // Validate required fields
      if (!packageJson.name)
        validationErrors.push('package.json missing "name" field');
      if (!packageJson.version)
        validationErrors.push('package.json missing "version" field');
      if (!packageJson.type || packageJson.type !== 'module') {
        validationErrors.push(
          'package.json must have "type": "module" for ESM compliance',
        );
      }

      // Validate exports field exists for ESM packages
      if (!packageJson.exports) {
        validationErrors.push(
          'package.json missing "exports" field (required for ESM)',
        );
      }

      // Check if this is a scoped package with correct naming
      if (!packageJson.name.startsWith('@benpsnyder/analogjs-esm-')) {
        validationErrors.push(
          `package name "${packageJson.name}" should start with "@benpsnyder/analogjs-esm-"`,
        );
      }
    } catch (error) {
      validationErrors.push(`package.json is invalid JSON: ${error}`);
    }
  }

  // 2. Check for required compiled files based on package type
  if (packageName === 'platform') {
    // Platform should have nx-plugin directory
    const nxPluginPath = resolve(packagePath, 'src/lib/nx-plugin');
    if (!existsSync(nxPluginPath)) {
      validationErrors.push('Platform package missing nx-plugin directory');
    } else {
      // Check for critical nx-plugin files
      const executorsJson = resolve(nxPluginPath, 'executors.json');
      const generatorsJson = resolve(nxPluginPath, 'generators.json');
      if (!existsSync(executorsJson)) {
        validationErrors.push(
          'Platform package missing nx-plugin/executors.json',
        );
      }
      if (!existsSync(generatorsJson)) {
        validationErrors.push(
          'Platform package missing nx-plugin/generators.json',
        );
      }
    }

    // Platform should have compiled JS files
    const platformIndexJs = resolve(packagePath, 'src/index.js');
    if (!existsSync(platformIndexJs)) {
      validationErrors.push(
        'Platform package missing compiled src/index.js file',
      );
    }
  }

  // 3. Check for Angular packages (router, content) - should have fesm2022 directory
  if (packageName === 'router' || packageName === 'content') {
    const fesmDir = resolve(packagePath, 'fesm2022');
    if (!existsSync(fesmDir)) {
      validationErrors.push(
        `${packageName} package missing fesm2022 directory (Angular build output)`,
      );
    } else {
      // Check for main module file
      const mainModule = resolve(
        fesmDir,
        `benpsnyder-analogjs-esm-${packageName}.mjs`,
      );
      if (!existsSync(mainModule)) {
        validationErrors.push(
          `${packageName} package missing main module: benpsnyder-analogjs-esm-${packageName}.mjs`,
        );
      }
    }

    // Check for TypeScript declarations
    const indexDts = resolve(packagePath, 'index.d.ts');
    if (!existsSync(indexDts)) {
      validationErrors.push(`${packageName} package missing index.d.ts file`);
    }
  }

  // 4. Check for standard packages (vite-plugin-*) - should have compiled JS files
  if (packageName.startsWith('vite-plugin-')) {
    const srcIndexJs = resolve(packagePath, 'src/index.js');
    const srcIndexDts = resolve(packagePath, 'src/index.d.ts');

    if (!existsSync(srcIndexJs)) {
      validationErrors.push(
        `${packageName} package missing compiled src/index.js file`,
      );
    }
    if (!existsSync(srcIndexDts)) {
      validationErrors.push(
        `${packageName} package missing src/index.d.ts declaration file`,
      );
    }

    // Check for lib directory with JS files
    const libDir = resolve(packagePath, 'src/lib');
    if (existsSync(libDir)) {
      const { readdirSync } = require('fs');
      const jsFiles = readdirSync(libDir, { recursive: true }).filter(
        (file: string) => file.endsWith('.js'),
      );
      if (jsFiles.length === 0) {
        validationErrors.push(
          `${packageName} package src/lib directory contains no compiled .js files`,
        );
      }
    }
  }

  // 5. General checks for all packages

  // Check for README
  const readmePath = resolve(packagePath, 'README.md');
  if (!existsSync(readmePath)) {
    validationErrors.push('README.md file missing');
  }

  // Warn about large package sizes (over 500KB unpacked)
  try {
    const { execSync } = require('child_process');
    const packOutput = execSync(`npm pack --dry-run --silent`, {
      cwd: packagePath,
      encoding: 'utf-8',
    });
    const sizeMatch = packOutput.match(
      /unpacked size:\s*([0-9.]+)\s*([kKmMgG]?B)/,
    );
    if (sizeMatch) {
      const [, size, unit] = sizeMatch;
      const sizeNum = parseFloat(size);
      if (unit.toLowerCase().includes('m') && sizeNum > 10) {
        console.log(`⚠️  Warning: Large package size (${size} ${unit})`);
      } else if (unit.toLowerCase().includes('k') && sizeNum > 500) {
        console.log(`⚠️  Warning: Large package size (${size} ${unit})`);
      }
    }
  } catch (error) {
    // Non-critical, just skip size check
  }

  // Report validation results
  if (validationErrors.length > 0) {
    console.error(`❌ Package validation failed for ${packageName}:`);
    validationErrors.forEach((error) => console.error(`   • ${error}`));
    return false;
  }

  console.log(`✅ Package validation passed for ${packageName}`);
  return true;
}

function publishToJSR(
  packagePath: string,
  packageName: string,
  isDryRun: boolean,
): boolean {
  try {
    const config = loadJSRConfig(packagePath);
    console.log(`📦 Publishing ${config.name}@${config.version} to JSR...`);

    const publishCmd = `npx jsr publish ${isDryRun ? '--dry-run' : ''} --allow-slow-types --allow-dirty`;

    execSync(publishCmd, {
      cwd: packagePath,
      stdio: 'inherit',
    });

    if (isDryRun) {
      console.log(`✅ JSR dry run successful for ${config.name}`);
    } else {
      console.log(
        `✅ Successfully published ${config.name}@${config.version} to JSR`,
      );
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to publish ${packageName} to JSR:`, error);
    return false;
  }
}

function publishToNPM(
  packagePath: string,
  packageName: string,
  isDryRun: boolean,
  force: boolean = false,
): boolean {
  try {
    const config = loadNPMConfig(packagePath);
    console.log(`📦 Publishing ${config.name}@${config.version} to npm...`);

    // Use the correct output path from project.json for ALL packages
    const publishPath = getPackageOutputPath(packageName);

    // Verify the built package exists
    if (!existsSync(publishPath)) {
      console.log(
        `⚠️  Built package not found at ${publishPath}, run 'nx build ${packageName}' first`,
      );
      return false;
    }

    // Determine if this is a prerelease version and what tag to use
    const isPrerelease = config.version.includes('-');
    let tag = 'latest';

    if (isPrerelease) {
      // Extract prerelease tag (e.g., "test" from "2.0.0-alpha.16")
      const prereleaseMatch = config.version.match(/-([^.]+)/);
      tag = prereleaseMatch ? prereleaseMatch[1] : 'next';
    }

    const publishCmd = `npm publish ${isDryRun ? '--dry-run' : ''} --access public --tag ${tag}${force ? ' --force' : ''}`;

    execSync(publishCmd, {
      cwd: publishPath,
      stdio: 'inherit',
    });

    if (isDryRun) {
      console.log(`✅ npm dry run successful for ${config.name} (tag: ${tag})`);
    } else {
      console.log(
        `✅ Successfully published ${config.name}@${config.version} to npm (tag: ${tag})`,
      );
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to publish ${packageName} to npm:`, error);
    return false;
  }
}

function buildPackage(packageName: string, isDryRun: boolean): boolean {
  try {
    console.log(`🔨 Building ${packageName} (with dependencies)...`);

    // Special note for platform package which also builds nx-plugin
    if (packageName === 'platform') {
      console.log(
        `📝 Note: Platform build will also build nx-plugin automatically`,
      );
    }

    if (isDryRun) {
      console.log(
        `✅ Dry run: Would build ${packageName} with 'nx build ${packageName}' (including dependencies)`,
      );
      if (packageName === 'platform') {
        console.log(
          `✅ Dry run: Would also build nx-plugin as part of platform build`,
        );
      }
      return true;
    }

    // Use nx to build with dependencies in the correct order
    const buildCmd = `nx build ${packageName}`;
    execSync(buildCmd, {
      stdio: 'inherit',
    });

    console.log(`✅ Successfully built ${packageName}`);
    if (packageName === 'platform') {
      console.log(
        `✅ nx-plugin was also built automatically as part of platform build`,
      );
    }
    return true;
  } catch (error) {
    console.error(`❌ Failed to build ${packageName}:`, error);
    return false;
  }
}

function publishPackage(options: PublishOptions): boolean {
  const {
    packageName,
    isDryRun,
    publishToJSR: shouldPublishToJSR,
    publishToNPM: shouldPublishToNPM,
    force,
  } = options;
  const packagePath = resolve('packages', packageName);

  if (!existsSync(packagePath)) {
    console.error(`❌ Package ${packageName} not found at ${packagePath}`);
    return false;
  }

  // Build the package first
  if (!buildPackage(packageName, isDryRun)) {
    console.error(`❌ Build failed for ${packageName}, skipping publish`);
    return false;
  }

  // Get the correct output path for validation and publishing
  const publishPath = getPackageOutputPath(packageName);

  // Validate the package before publishing (unless it's a dry run and package isn't built)
  if (!isDryRun || existsSync(publishPath)) {
    if (!validatePackageForPublishing(packageName, publishPath)) {
      console.error(
        `❌ Package validation failed for ${packageName}, skipping publish`,
      );
      return false;
    }
  } else {
    console.log(
      `⚠️  Skipping validation for ${packageName} in dry run mode (package not built)`,
    );
  }

  let success = true;

  // Publish to JSR if requested
  if (shouldPublishToJSR) {
    success = publishToJSR(packagePath, packageName, isDryRun) && success;
  }

  // Publish to npm if requested
  if (shouldPublishToNPM) {
    success =
      publishToNPM(publishPath, packageName, isDryRun, force) && success;
  }

  return success;
}

function showHelp() {
  console.log(`
🚀 AnalogJS Package Publisher (JSR + npm)

This script automatically builds each package using 'nx build <package>' before publishing.

Usage:
  bun scripts/publish.ts [options]                     # Build & publish all packages
  bun scripts/publish.ts <package-name> [options]      # Build & publish single package
  bun scripts/publish.ts --list                        # List available packages
  bun scripts/publish.ts --help                        # Show this help

Available packages:
  ${PACKAGES_TO_PUBLISH.map((pkg) => `  • ${pkg}`).join('\n')}

Publishing Options:
  --jsr         Publish to JSR (default if no registry specified)
  --npm         Publish to npm
  --both        Publish to both JSR and npm
  --dry-run     Test mode - validate without building/publishing
  --force       Force npm publish (override existing versions)

Other Options:
  --list        List all available packages with versions
  --help        Show this help message

Examples:
  bun scripts/publish.ts platform --dry-run            # Test build & publish platform package (JSR)
  bun scripts/publish.ts router --npm                  # Build & publish router to npm only
  bun scripts/publish.ts content --both --dry-run      # Test build & publish content on both registries
  bun scripts/publish.ts platform --npm --force        # Build & force republish platform to npm
  bun scripts/publish.ts --npm --dry-run               # Test build & publish all packages on npm
  bun scripts/publish.ts --both                        # Build & publish all to both registries
`);
}

function listPackages() {
  console.log('📦 Available packages for publication:\n');

  for (const packageName of PACKAGES_TO_PUBLISH) {
    const packagePath = resolve('packages', packageName);
    console.log(`  📁 ${packageName}:`);

    // Show npm info
    try {
      const npmConfig = loadNPMConfig(packagePath);
      console.log(`    📦 npm: ${npmConfig.name}@${npmConfig.version}`);
    } catch {
      console.log(`    📦 npm: (package.json not found)`);
    }

    // Show JSR info
    try {
      const jsrConfig = loadJSRConfig(packagePath);
      console.log(`    🦕 JSR: ${jsrConfig.name}@${jsrConfig.version}`);
    } catch {
      console.log(`    🦕 JSR: (jsr.json not found)`);
    }

    console.log('');
  }

  console.log(`💡 Examples:`);
  console.log(
    `   bun scripts/publish.ts <package-name> --npm --dry-run    # Build & test publish to npm`,
  );
  console.log(
    `   bun scripts/publish.ts <package-name> --both --dry-run   # Build & test publish to both registries`,
  );
}

function main() {
  const args = process.argv.slice(2);
  const targetPackage = args.find((arg) => !arg.startsWith('--'));
  const isDryRun = args.includes('--dry-run');
  const showHelpFlag = args.includes('--help') || args.includes('-h');
  const showListFlag = args.includes('--list') || args.includes('-l');

  // Publishing target options
  const publishToJSRFlag = args.includes('--jsr');
  const publishToNPMFlag = args.includes('--npm');
  const publishToBothFlag = args.includes('--both');
  const force = args.includes('--force');

  // Default to JSR if no specific registry is specified
  const publishToJSR =
    publishToBothFlag ||
    publishToJSRFlag ||
    (!publishToNPMFlag && !publishToBothFlag);
  const publishToNPM = publishToBothFlag || publishToNPMFlag;

  if (showHelpFlag) {
    showHelp();
    return;
  }

  if (showListFlag) {
    listPackages();
    return;
  }

  // Determine target registries for display
  const registries: string[] = [];
  if (publishToJSR) registries.push('JSR');
  if (publishToNPM) registries.push('npm');

  console.log(
    `🚀 Publishing AnalogJS packages to ${registries.join(' + ')}...`,
  );
  console.log(`🔧 Mode: ${isDryRun ? 'DRY RUN' : 'PUBLISH'}`);

  if (targetPackage) {
    // Publish single package
    if (!PACKAGES_TO_PUBLISH.includes(targetPackage)) {
      console.error(`❌ Unknown package: ${targetPackage}`);
      console.log(`Available packages: ${PACKAGES_TO_PUBLISH.join(', ')}`);
      console.log(
        `\nRun 'bun scripts/publish.ts --help' for more information.`,
      );
      process.exit(1);
    }

    console.log(
      `🎯 Publishing single package: ${targetPackage} to ${registries.join(' + ')}\n`,
    );
    const options: PublishOptions = {
      packageName: targetPackage,
      isDryRun,
      publishToJSR,
      publishToNPM,
      force,
    };
    const success = publishPackage(options);
    process.exit(success ? 0 : 1);
  } else {
    // Publish all packages
    console.log(`📦 Publishing all packages to ${registries.join(' + ')}...\n`);
    let successCount = 0;

    for (const packageName of PACKAGES_TO_PUBLISH) {
      const options: PublishOptions = {
        packageName,
        isDryRun,
        publishToJSR,
        publishToNPM,
        force,
      };
      if (publishPackage(options)) {
        successCount++;
      }
    }

    console.log(
      `\n📊 Published ${successCount}/${PACKAGES_TO_PUBLISH.length} packages`,
    );

    if (successCount < PACKAGES_TO_PUBLISH.length) {
      process.exit(1);
    }
  }
}

// For Bun compatibility, we'll just run main() directly
main();
