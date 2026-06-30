import {
  chain,
  type Rule,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  getWorkspaceConfig,
  writeAngularJson,
} from '@o3r/schematics';
import type {
  PackageJson,
} from 'type-fest';

const TRANSLOCO_PACKAGE = '@o3r/transloco';

/** Angular builders that perform JavaScript bundling and support the externalDependencies option */
const BUNDLING_BUILDERS = new Set([
  '@angular-devkit/build-angular:browser-esbuild',
  '@angular-devkit/build-angular:server',
  '@angular/build:application',
  '@angular/build:karma'
]);

/**
 * Builders from `@angular-builders/custom-webpack` that bundle JavaScript through a user-provided webpack config file.
 * These do not support the `externalDependencies` option, so the equivalent fix must be applied in the webpack config
 * referenced by their `customWebpackConfig.path` option.
 */
const CUSTOM_WEBPACK_BUILDERS = new Set([
  '@angular-builders/custom-webpack:browser',
  '@angular-builders/custom-webpack:server',
  '@angular-builders/custom-webpack:karma'
]);

/**
 * Add `@o3r/transloco` to externalDependencies in bundling targets of angular.json
 * when it is not a direct dependency of the project.
 * This is required because `@o3r/components` performs a dynamic `import('@o3r/transloco')` at runtime,
 * and webpack/esbuild will fail at build time if the module is not installed and not marked as external.
 * @param tree
 * @param context
 */
const addTranslocoExternalDependency: Rule = (tree, context) => {
  const workspace = getWorkspaceConfig(tree);
  if (!workspace) {
    context.logger.warn('No angular.json found, skipping migration.');
    return;
  }

  const packageJson = tree.exists('/package.json')
    ? tree.readJson('/package.json') as PackageJson
    : null;

  const isTranslocoInstalled = !!packageJson?.dependencies?.[TRANSLOCO_PACKAGE]
    || !!packageJson?.devDependencies?.[TRANSLOCO_PACKAGE];

  if (isTranslocoInstalled) {
    context.logger.info(`${TRANSLOCO_PACKAGE} is already installed, no externalDependencies update needed.`);
    return;
  }

  let modified = false;
  for (const [projectName, project] of Object.entries(workspace.projects || {})) {
    if (project.projectType !== 'application') {
      continue;
    }
    const architect = project.architect || {};
    for (const [targetName, target] of Object.entries(architect)) {
      if (CUSTOM_WEBPACK_BUILDERS.has(target.builder)) {
        const webpackConfigPath = (target.options as { customWebpackConfig?: { path?: string } } | undefined)?.customWebpackConfig?.path;
        const webpackConfigLabel = webpackConfigPath ? `the webpack config "${webpackConfigPath}"` : 'your webpack config';
        context.logger.warn(
          `${projectName}/${targetName} uses the custom-webpack builder "${target.builder}", which does not support the externalDependencies option.\n`
          + `Please add the following to ${webpackConfigLabel} manually so the bundler skips the optional ${TRANSLOCO_PACKAGE} import:\n`
          + '  const { IgnorePlugin } = require(\'webpack\');\n'
          + '  config.plugins.push(new IgnorePlugin({\n'
          + `    resourceRegExp: /^${TRANSLOCO_PACKAGE.replace('/', '\\/')}$/\n`
          + '  }));\n'
          + `For testing only, if adjusting the webpack config is not possible, you can as a last resort install ${TRANSLOCO_PACKAGE} as a dev dependency so it is bundled normally during tests.`
        );
        continue;
      }
      if (!BUNDLING_BUILDERS.has(target.builder)) {
        continue;
      }
      if (!target.options) {
        target.options = {};
      }
      const existingExternals: string[] = (target.options).externalDependencies ?? [];
      if (!existingExternals.includes(TRANSLOCO_PACKAGE)) {
        (target.options).externalDependencies = [...existingExternals, TRANSLOCO_PACKAGE];
        context.logger.info(`Added ${TRANSLOCO_PACKAGE} to externalDependencies in ${projectName}/${targetName}.`);
        modified = true;
      }
    }
  }

  if (modified) {
    writeAngularJson(tree, workspace);
  }
};

// eslint-disable-next-line @typescript-eslint/naming-convention -- version in the function name
function updateV14_4Fn(): Rule {
  return (tree, context) => chain([
    addTranslocoExternalDependency
  ])(tree, context);
}

/**
 * Update of `@o3r/components` v14.4
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- version in the function name
export const updateV14_4 = createOtterSchematic(updateV14_4Fn);
