import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  addVsCodeRecommendations,
  applyEditorConfig,
  applyEsLintFix,
  DependencyToAdd,
  getExternalDependenciesInfo,
  getO3rPeerDeps,
  getWorkspaceConfig,
  setupDependencies,
} from '@o3r/schematics';
import {
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import type {
  PackageJson,
} from 'type-fest';
import {
  generateCommitLintConfig,
  getCommitHookInitTask,
} from './helpers/commit-hooks';
import {
  generateEditorConfig,
} from './helpers/editorconfig';
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

const updateEditorConfig: Rule = (tree) => {
  const editorconfigPath = '.editorconfig';
  const editorconfig = tree.exists(editorconfigPath) ? tree.readText(editorconfigPath) : '';
  if (editorconfig.includes('end_of_line')) {
    return tree;
  }
  const newEditorconfig = /\[[*]\]/.test(editorconfig)
    ? editorconfig.replace(/(\[[*]\])/, '$1\nend_of_line = lf')
    : editorconfig.concat('[*]\nend_of_line = lf');
  tree.overwrite(editorconfigPath, newEditorconfig);
  return tree;
};

/**
 * List of external dependencies to be added to the project as peer dependencies
 * Enforce tilde range for all dependencies except Angular ones
 */
const dependenciesToInstall: string[] = [
  '@angular/core',
  '@angular/common'
];

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
  let hasEslint = false;
  try {
    const eslintPackage = 'eslint';
    require.resolve(eslintPackage);
    hasEslint = true;
  } catch {}
  const vsCodeExtensions = [
    'AmadeusITGroup.otter-devtools',
    'EditorConfig.EditorConfig',
    'angular.ng-template',
    ...hasEslint ? ['dbaeumer.vscode-eslint'] : []
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

  return (tree, context) => {
    if (!ownPackageJsonContent) {
      context.logger.error('Could not find @o3r/workspace package. Are you sure it is installed?');
    }
    const internalPackagesToInstallWithNgAdd = depsInfo.o3rPeerDeps;

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
      options.skipRenovate ? noop() : generateRenovateConfig(__dirname),
      ...(options.skipPreCommitChecks ? [] : [generateCommitLintConfig()]),
      updateEditorConfig,
      options.skipVscodeTools ? noop() : addVsCodeRecommendations(vsCodeExtensions),
      updateGitIgnore(workspaceConfig),
      filterPackageJsonScripts,
      setupDependencies({
        dependencies: {
          ...dependencies,
          ...externalDependenciesInfo
        },
        skipInstall: options.skipInstall,
        ngAddToRun: internalPackagesToInstallWithNgAdd,
        scheduleTaskCallback: (taskIds) => {
          if (!options.skipPreCommitChecks) {
            if (options.skipInstall) {
              context.logger.warn(`The pre-commit checks will not be setup because the installation has been skipped.`);
            } else {
              getCommitHookInitTask(context)(taskIds);
            }
          }
        }
      }),
      !options.skipLinter && hasEslint ? applyEsLintFix() : noop(),
      addWorkspacesToProject(),
      addMonorepoManager(ownPackageJsonContent, options.monorepoManager),
      options.skipEditorConfigSetup ? noop() : generateEditorConfig(),
      options.skipLinter ? noop() : applyEditorConfig()
    ])(tree, context);
  };
};
