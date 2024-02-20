import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { createSchematicWithMetricsIfInstalled, getPackageInstallConfig } from '@o3r/schematics';
import type { NgAddSchematicsSchema } from './schema';
import * as path from 'node:path';
import { updateLinterConfigs } from './linter';

/**
 * Add Otter eslint-config to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree: Tree, context: SchematicContext) => {
    const devDependenciesToInstall = [
      'eslint',
      '@stylistic/eslint-plugin-ts',
      '@angular-eslint/builder',
      '@typescript-eslint/parser',
      '@typescript-eslint/eslint-plugin',
      'eslint-plugin-jsdoc',
      'eslint-plugin-prefer-arrow',
      'eslint-plugin-unicorn',
      'jsonc-eslint-parser'
    ];

    try {
      const {
        getExternalDependenciesVersionRange,
        addVsCodeRecommendations,
        setupDependencies,
        getWorkspaceConfig,
        getO3rPeerDeps,
        getProjectNewDependenciesTypes,
        removePackages
      } = await import('@o3r/schematics');
      const depsInfo = getO3rPeerDeps(path.resolve(__dirname, '..', '..', 'package.json'), true, /^@(?:o3r|ama-sdk|eslint-)/);
      const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
      const linterSchematicsFolder = path.resolve(__dirname, '..');
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const {NodeDependencyType} = await import('@schematics/angular/utility/dependencies');
      const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      const dependencies = depsInfo.o3rPeerDeps.reduce((acc, dep) => {
        acc[dep] = {
          inManifest: [{
            range: `~${depsInfo.packageVersion}`,
            types: getProjectNewDependenciesTypes(workspaceProject)
          }]
        };
        return acc;
      }, getPackageInstallConfig(packageJsonPath, tree, options.projectName, true));
      Object.entries(getExternalDependenciesVersionRange(devDependenciesToInstall, packageJsonPath))
        .forEach(([dep, range]) => {
          dependencies[dep] = {
            inManifest: [{
              range,
              types: [NodeDependencyType.Dev]
            }]
          };
        });

      return () => chain([
        removePackages(['@otter/eslint-config-otter', '@otter/eslint-plugin']),
        setupDependencies({
          projectName: options.projectName,
          dependencies,
          ngAddToRun: depsInfo.o3rPeerDeps
        }),
        addVsCodeRecommendations(['dbaeumer.vscode-eslint', 'stylelint.vscode-stylelint']),
        updateLinterConfigs(options, linterSchematicsFolder)
      ])(tree, context);
    } catch (e) {
      // eslint-config-otter needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @o3r/eslint-config-otter has failed.
      You need to install '@o3r/schematics' package to be able to use the eslint-config-otter package. Please run 'ng add @o3r/schematics' .`);
      throw (e);
    }
  };
}

/**
 * Add Otter eslint-config to an Angular Project
 * @param options
 */
export const ngAdd = createSchematicWithMetricsIfInstalled(ngAddFn);
