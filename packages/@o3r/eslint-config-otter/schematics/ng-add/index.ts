import * as path from 'node:path';
import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  addVsCodeRecommendations,
  createOtterSchematic,
  getExternalDependenciesVersionRange,
  getO3rPeerDeps,
  getPackageInstallConfig,
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
  removePackages,
  setupDependencies,
} from '@o3r/schematics';
import {
  updateLinterConfigs,
} from './linter';
import type {
  NgAddSchematicsSchema,
} from './schema';

/**
 * Add Otter eslint-config to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree: Tree, context: SchematicContext) => {
    const devDependenciesToInstall = [
      'eslint',
      '@angular-eslint/builder',
      '@angular-eslint/eslint-plugin',
      '@stylistic/eslint-plugin-ts',
      '@typescript-eslint/parser',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/utils',
      'eslint-plugin-jest',
      'eslint-plugin-jsdoc',
      'eslint-plugin-prefer-arrow',
      'eslint-plugin-unicorn',
      'jest',
      'jsonc-eslint-parser',
      'yaml-eslint-parser'
    ];

    const depsInfo = getO3rPeerDeps(path.resolve(__dirname, '..', '..', 'package.json'), true, /^@(?:o3r|ama-sdk|eslint-)/);
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const linterSchematicsFolder = __dirname;
    const { NodeDependencyType } = await import('@schematics/angular/utility/dependencies');
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const dependencies = depsInfo.o3rPeerDeps.reduce((acc, dep) => {
      acc[dep] = {
        inManifest: [{
          range: `${options.exactO3rVersion ? '' : '~'}${depsInfo.packageVersion}`,
          types: getProjectNewDependenciesTypes(workspaceProject)
        }],
        ngAddOptions: { exactO3rVersion: options.exactO3rVersion }
      };
      return acc;
    }, getPackageInstallConfig(packageJsonPath, tree, options.projectName, true, !!options.exactO3rVersion));
    Object.entries(getExternalDependenciesVersionRange(devDependenciesToInstall, packageJsonPath, context.logger))
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
  };
}

/**
 * Add Otter eslint-config to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
