import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  addVsCodeRecommendations,
  applyEsLintFix,
  getExternalDependenciesInfo,
  getO3rPeerDeps,
  getWorkspaceConfig,
  setupDependencies,
} from '@o3r/schematics';
import type {
  DependencyToAdd,
} from '@o3r/schematics';
import {
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import type {
  PackageJson,
} from 'type-fest';
import {
  isUsingFlatConfig,
  shouldOtterLinterBeInstalled,
} from '../rule-factories/linter';
import {
  updateGitIgnore,
} from './helpers/gitignore-update';
import {
  addMonorepoManager,
  addWorkspacesToProject,
  filterPackageJsonScripts,
} from './helpers/npm-workspace';
import {
  generateRenovateConfig,
} from './helpers/renovate';
import type {
  NgAddSchematicsSchema,
} from './schema';

/**
 * List of external dependencies to be added to the project as peer dependencies
 * Enforce tilde range for all dependencies except Angular ones
 */
const dependenciesToInstall: string[] = [];

/**
 * List of external dependencies to be added to the project as dev dependencies
 * Enforce tilde range for all dependencies except Angular ones
 */
const devDependenciesToInstall: string[] = [];

/**
 * Enable all the otter features requested by the user
 * Install all the related dependencies and import the features inside the application
 * @param options installation options to pass to the all the other packages' installation
 */
export const prepareProject = (options: NgAddSchematicsSchema): Rule => {
  const vsCodeExtensions = [
    'AmadeusITGroup.otter-devtools',
    'EditorConfig.EditorConfig',
    'angular.ng-template'
  ];
  const otterDependencies = [
    '@ama-sdk/core',
    '@ama-sdk/schematics'
  ];
  if (!options.skipPreCommitChecks) {
    devDependenciesToInstall.push(
      'husky',
      'lint-staged',
      'editorconfig-checker',
      '@commitlint/cli',
      '@commitlint/config-angular',
      '@commitlint/config-conventional',
      '@commitlint/types'
    );
  }
  const ownSchematicsFolder = path.resolve(__dirname, '..');
  const ownPackageJsonPath = path.resolve(ownSchematicsFolder, '..', 'package.json');
  const depsInfo = getO3rPeerDeps(ownPackageJsonPath);
  const ownPackageJsonContent = JSON.parse(fs.readFileSync(ownPackageJsonPath, { encoding: 'utf8' })) as PackageJson & { generatorDependencies: Record<string, string> };

  return async (tree, context) => {
    if (!ownPackageJsonContent) {
      context.logger.error('Could not find @o3r/workspace package. Are you sure it is installed?');
    }
    const installOtterLinter = await shouldOtterLinterBeInstalled(context, tree);
    const internalPackagesToInstallWithNgAdd = Array.from(new Set([
      ...(installOtterLinter ? [`@o3r/eslint-config${isUsingFlatConfig(tree) ? '' : '-otter'}`] : []),
      ...depsInfo.o3rPeerDeps
    ]));

    const dependencies = [...internalPackagesToInstallWithNgAdd, ...otterDependencies].reduce((acc, dep) => {
      acc[dep] = {
        inManifest: [{
          range: `${options.exactO3rVersion ? '' : '~'}${depsInfo.packageVersion}`,
          types: [NodeDependencyType.Default]
        }],
        ngAddOptions: { exactO3rVersion: options.exactO3rVersion }
      };
      return acc;
    }, {} as Record<string, DependencyToAdd>);

    if (installOtterLinter) {
      vsCodeExtensions.push('dbaeumer.vscode-eslint');
    }

    const workspaceConfig = getWorkspaceConfig(tree);
    const projectPackageJson = tree.readJson('package.json') as PackageJson;
    const externalDependenciesInfo = getExternalDependenciesInfo({
      devDependenciesToInstall,
      dependenciesToInstall,
      projectType: undefined,
      o3rPackageJsonPath: ownPackageJsonPath,
      projectPackageJson
    },
    context.logger,
    (name) => name === 'husky' && !options.skipPreCommitChecks
    );

    return () => chain([
      generateRenovateConfig(__dirname),
      addVsCodeRecommendations(vsCodeExtensions),
      updateGitIgnore(workspaceConfig),
      filterPackageJsonScripts,
      setupDependencies({
        dependencies: {
          ...dependencies,
          ...externalDependenciesInfo
        },
        skipInstall: options.skipInstall,
        ngAddToRun: internalPackagesToInstallWithNgAdd
      }),
      !options.skipLinter && installOtterLinter ? applyEsLintFix() : noop(),
      addWorkspacesToProject(),
      addMonorepoManager(ownPackageJsonContent, options.monorepoManager)
    ])(tree, context);
  };
};
