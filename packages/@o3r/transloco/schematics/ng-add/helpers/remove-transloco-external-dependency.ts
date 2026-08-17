import {
  type Rule,
} from '@angular-devkit/schematics';
import {
  getWorkspaceConfig,
} from '@o3r/schematics';

const TRANSLOCO_PACKAGE = '@o3r/transloco';

/** Builders from `@angular-builders/custom-webpack` whose bundling is driven by a user-provided webpack config file. */
const CUSTOM_WEBPACK_BUILDERS = new Set([
  '@angular-builders/custom-webpack:browser',
  '@angular-builders/custom-webpack:server',
  '@angular-builders/custom-webpack:karma'
]);

/**
 * Remove `@o3r/transloco` from the `externalDependencies` of all application bundling targets in angular.json.
 *
 * The `@o3r/components` `ng update` migration adds `@o3r/transloco` to `externalDependencies` when the package is not
 * installed, so that the bundler skips its dynamic `import()`. Once `@o3r/transloco` is added to the project (via this
 * `ng add`), it must be bundled again, so the previously added entry has to be cleaned up.
 * Custom-webpack builders cannot be updated automatically, so a warning is logged to revert the manual `IgnorePlugin`.
 * @param tree
 * @param context
 */
export const removeTranslocoExternalDependency: Rule = (tree, context) => {
  const workspace = getWorkspaceConfig(tree);
  if (!workspace) {
    return tree;
  }

  let modified = false;
  for (const [projectName, project] of Object.entries(workspace.projects || {})) {
    if (project.projectType !== 'application') {
      continue;
    }
    for (const [targetName, target] of Object.entries(project.architect || {})) {
      if (CUSTOM_WEBPACK_BUILDERS.has(target.builder)) {
        const webpackConfigPath = (target.options as { customWebpackConfig?: { path?: string } } | undefined)?.customWebpackConfig?.path;
        const webpackConfigLabel = webpackConfigPath ? `the webpack config "${webpackConfigPath}"` : 'your webpack config';
        context.logger.warn(
          `${projectName}/${targetName} uses the custom-webpack builder "${target.builder}".\n`
          + `If you previously added an IgnorePlugin for ${TRANSLOCO_PACKAGE} in ${webpackConfigLabel} (following the @o3r/components migration), `
          + 'please remove it now so the package is bundled again:\n'
          + `  config.plugins.push(new IgnorePlugin({ resourceRegExp: /^${TRANSLOCO_PACKAGE.replace('/', '\\/')}$/ }));`
        );
        continue;
      }
      const existingExternals: string[] | undefined = (target.options as { externalDependencies?: string[] } | undefined)?.externalDependencies;
      if (!existingExternals?.includes(TRANSLOCO_PACKAGE)) {
        continue;
      }
      const updatedExternals = existingExternals.filter((dependency) => dependency !== TRANSLOCO_PACKAGE);
      if (updatedExternals.length > 0) {
        (target.options as { externalDependencies?: string[] }).externalDependencies = updatedExternals;
      } else {
        delete (target.options as { externalDependencies?: string[] }).externalDependencies;
      }
      context.logger.info(`Removed ${TRANSLOCO_PACKAGE} from externalDependencies in ${projectName}/${targetName} as it is now a project dependency.`);
      modified = true;
    }
  }

  if (modified) {
    tree.overwrite('/angular.json', JSON.stringify(workspace, null, 2));
  }
  return tree;
};
