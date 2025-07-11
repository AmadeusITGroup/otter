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
  getExternalDependenciesInfo,
  getO3rPeerDeps,
  getPackageInstallConfig,
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
  removePackages,
  setupDependencies,
} from '@o3r/schematics';
import type {
  PackageJson,
} from 'type-fest';
import {
  updateLinterConfigs,
} from './linter';
import type {
  NgAddSchematicsSchema,
} from './schema';

/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall: string[] = [];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall = [
  '@angular-eslint/builder',
  '@angular-eslint/eslint-plugin',
  '@stylistic/eslint-plugin-ts',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  '@typescript-eslint/utils',
  'eslint',
  'eslint-import-resolver-node',
  'eslint-plugin-jsdoc',
  'eslint-plugin-prefer-arrow',
  'eslint-plugin-unicorn',
  'jsonc-eslint-parser'
];

/**
 * Add Otter eslint-config to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return (tree: Tree, context: SchematicContext) => {
    const depsInfo = getO3rPeerDeps(path.resolve(__dirname, '..', '..', 'package.json'), true, /^@(?:o3r|ama-sdk|eslint-)/);
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const linterSchematicsFolder = __dirname;
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

    try {
      require.resolve('jest');
      devDependenciesToInstall.push('eslint-plugin-jest', 'jest');
    } catch {}

    const projectDirectory = workspaceProject?.root || '.';
    const projectPackageJson = tree.readJson(path.posix.join(projectDirectory, 'package.json')) as PackageJson;

    const externalDependenciesInfo = getExternalDependenciesInfo({
      devDependenciesToInstall,
      dependenciesToInstall,
      o3rPackageJsonPath: packageJsonPath,
      projectPackageJson,
      projectType: workspaceProject?.projectType
    },
    context.logger
    );

    return () => chain([
      removePackages(['@otter/eslint-config-otter', '@otter/eslint-plugin']),
      setupDependencies({
        projectName: options.projectName,
        dependencies: {
          ...dependencies,
          ...externalDependenciesInfo
        },
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
