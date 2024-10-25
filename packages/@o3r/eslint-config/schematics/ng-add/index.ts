import * as path from 'node:path';
import {
  applyToSubtree,
  chain,
  noop,
  type Rule,
  type SchematicContext,
  type Tree,
} from '@angular-devkit/schematics';
import {
  updateEslintConfig,
} from './eslint/index';
import type {
  NgAddSchematicsSchema,
} from './schema';
import {
  updateVscode,
} from './vscode/index';

const reportMissingSchematicsDep = (logger: { error: (message: string) => any }) => (reason: any) => {
  logger.error(`[ERROR]: Adding @o3r/eslint-config has failed.
You need to install '@o3r/schematics' package to be able to use the eslint-config package. Please run 'ng add @o3r/schematics' .`);
  throw reason;
};

function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree: Tree, context: SchematicContext) => {
    const devDependenciesToInstall = [
      '@stylistic/eslint-plugin',
      'angular-eslint',
      'eslint',
      'eslint-import-resolver-typescript',
      'eslint-plugin-import',
      '@eslint-community/eslint-plugin-eslint-comments',
      'eslint-plugin-sort-export-all',
      'eslint-plugin-import-newlines',
      'eslint-plugin-unused-imports',
      'eslint-plugin-jsdoc',
      'eslint-plugin-prefer-arrow',
      'eslint-plugin-unicorn',
      'globby',
      'typescript-eslint',
      'jsonc-eslint-parser'
    ];

    const {
      getExternalDependenciesVersionRange,
      setupDependencies,
      getWorkspaceConfig,
      getO3rPeerDeps,
      getProjectNewDependenciesTypes,
      getPackageInstallConfig
    } = await import('@o3r/schematics');
    const depsInfo = getO3rPeerDeps(path.resolve(__dirname, '..', '..', 'package.json'), true, /^@(?:o3r|ama-sdk|eslint-)/);
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
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
      setupDependencies({
        projectName: options.projectName,
        dependencies,
        ngAddToRun: depsInfo.o3rPeerDeps
      }),
      updateVscode,
      updateEslintConfig(),
      options.projectName && workspaceProject?.root
        ? applyToSubtree(workspaceProject.root, [updateEslintConfig(false)])
        : noop()
    ])(tree, context);
  };
}

/**
 * Add Otter eslint-config to an Angular Project
 * @param options Options for the schematic
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, { logger }) => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics').catch(reportMissingSchematicsDep(logger));
  return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
};
