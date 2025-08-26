import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  askConfirmation,
} from '@angular/cli/src/utilities/prompt';
import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  addVsCodeRecommendations,
  applyEditorConfig,
  createOtterSchematic,
  getExternalDependenciesInfo,
  getO3rPeerDeps,
  getPackageInstallConfig,
  getProjectNewDependenciesTypes,
  getTestFramework,
  getWorkspaceConfig,
  O3rCliError,
  registerPackageCollectionSchematics,
  removePackages,
  setupDependencies,
  setupSchematicsParamsForProject,
} from '@o3r/schematics';
import type {
  PackageJson,
} from 'type-fest';
import type {
  NgAddSchematicsSchema,
} from '../../schematics/ng-add/schema';
import {
  updateFixtureConfig,
} from './fixture';
import {
  updatePlaywright,
} from './playwright';
/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall: string[] = [];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall = [
  'pixelmatch',
  'pngjs',
  '@angular-devkit/build-angular',
  '@angular/animations',
  '@angular/core',
  '@angular/common'
];

/**
 * Add Otter testing to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const testPackageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(testPackageJsonPath, { encoding: 'utf8' })) as PackageJson;
      const depsInfo = getO3rPeerDeps(testPackageJsonPath);
      const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
      const workingDirectory = workspaceProject?.root || '.';
      const projectPackageJson = tree.readJson(path.posix.join(workingDirectory, 'package.json')) as PackageJson;
      const projectType = workspaceProject?.projectType || 'application';
      let installJest;

      const testFramework = options.testingFramework || getTestFramework(getWorkspaceConfig(tree), context);
      switch (testFramework) {
        case 'jest': {
          installJest = true;
          break;
        }
        case 'jasmine': {
          installJest = await askConfirmation(`You are currently using ${testFramework}. Do you want to setup Jest test framework? You will have to remove ${testFramework} yourself.`, true, false);
          break;
        }
        case undefined: {
          installJest = await askConfirmation('No test framework detected. Do you want to setup Jest test framework?', true, false);
          break;
        }
        default: {
          installJest = false;
          break;
        }
      }

      const internalDependenciesInfo = depsInfo.o3rPeerDeps.reduce((acc, dep) => {
        acc[dep] = {
          inManifest: [{
            range: `${options.exactO3rVersion ? '' : '~'}${depsInfo.packageVersion}`,
            types: getProjectNewDependenciesTypes(workspaceProject)
          }],
          ngAddOptions: { exactO3rVersion: options.exactO3rVersion }
        };
        return acc;
      }, getPackageInstallConfig(testPackageJsonPath, tree, options.projectName, true, !!options.exactO3rVersion));
      if (installJest) {
        devDependenciesToInstall.push(
          '@angular-builders/jest',
          '@types/jest',
          'jest',
          'jest-environment-jsdom',
          'jest-preset-angular',
          'jest-util',
          'ts-jest'
        );
      }

      const externalDependenciesInfo = getExternalDependenciesInfo({
        devDependenciesToInstall,
        dependenciesToInstall,
        o3rPackageJsonPath: testPackageJsonPath,
        projectType: workspaceProject?.projectType,
        projectPackageJson
      },
      context.logger
      );
      const dependencies = { ...internalDependenciesInfo, ...externalDependenciesInfo };

      let installPlaywright = false;
      if (projectType === 'application') {
        installPlaywright = options.enablePlaywright === undefined
          ? await askConfirmation('Do you want to setup Playwright test framework for E2E?', true)
          : options.enablePlaywright;
      }

      const schematicsDefaultOptions = {
        useComponentFixtures: undefined
      };
      const rules = [
        updateFixtureConfig(options),
        removePackages(['@otter/testing']),
        addVsCodeRecommendations(['Orta.vscode-jest']),
        installPlaywright ? updatePlaywright(options, dependencies) : noop,
        setupDependencies({
          projectName: options.projectName,
          dependencies,
          ngAddToRun: depsInfo.o3rPeerDeps
        }),
        registerPackageCollectionSchematics(packageJson),
        setupSchematicsParamsForProject({
          '@o3r/core:component': schematicsDefaultOptions,
          '@o3r/core:component-container': schematicsDefaultOptions,
          '@o3r/core:component-presenter': schematicsDefaultOptions
        }, options.projectName),
        options.skipLinter ? noop() : applyEditorConfig()
      ];

      if (installJest) {
        if (workingDirectory === undefined) {
          throw new O3rCliError(`Could not find working directory for project ${options.projectName || ''}`);
        } else {
          if (workspaceProject) {
            const packageJsonFile = tree.readJson(`${workingDirectory}/package.json`) as PackageJson;
            packageJsonFile.scripts ||= {};
            packageJsonFile.scripts.test = 'jest';
            tree.overwrite(`${workingDirectory}/package.json`, JSON.stringify(packageJsonFile, null, 2));
            const rootRelativePath = path.posix.relative(workingDirectory, tree.root.path.replace(/^\//, './'));
            const jestConfigFilesForProject = () => mergeWith(apply(url('./templates/project'), [
              template({
                ...options,
                rootRelativePath,
                isAngularSetup: tree.exists('/angular.json')
              }),
              move(workingDirectory),
              renameTemplateFiles()
            ]), MergeStrategy.Overwrite);
            rules.push(jestConfigFilesForProject);
          }
          if (tree.exists('/jest.config.js')) {
            context.logger.info('Jest configuration files already exist at the root of the project.');
          } else {
            const jestConfigFilesForWorkspace = () => mergeWith(apply(url('./templates/workspace'), [
              template({
                ...options,
                tsconfigPath: `./${['tsconfig.base.json', 'tsconfig.json'].find((tsconfigBase) => tree.exists(`./${tsconfigBase}`))}`
              }),
              move(tree.root.path),
              renameTemplateFiles()
            ]), MergeStrategy.Default);
            rules.push(
              jestConfigFilesForWorkspace
            );
          }
        }
      }

      return () => chain(rules)(tree, context);
    } catch (e) {
      context.logger.error(`[ERROR]: Adding @o3r/testing has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' or '@o3r/schematics' to be able to use the testing package.
      Please run 'ng add @o3r/core' or 'ng add @o3r/schematics'. Otherwise, use the error message as guidance.`);
      throw new O3rCliError(e);
    }
  };
}

/**
 * Add Otter testing to an Angular Project
 * @param options
 */
export const ngAdd = createOtterSchematic(ngAddFn);
