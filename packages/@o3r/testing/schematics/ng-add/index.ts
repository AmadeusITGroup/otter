import { apply, chain, MergeStrategy, mergeWith, move, noop, renameTemplateFiles, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import {
  addVsCodeRecommendations,
  createSchematicWithMetricsIfInstalled,
  getExternalDependenciesVersionRange,
  getO3rPeerDeps,
  getPackageInstallConfig,
  getProjectNewDependenciesTypes,
  getTestFramework,
  getWorkspaceConfig,
  O3rCliError,
  registerPackageCollectionSchematics,
  removePackages, setupDependencies,
  setupSchematicsDefaultParams
} from '@o3r/schematics';
import { askConfirmation } from '@angular/cli/src/utilities/prompt';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PackageJson } from 'type-fest';
import type { NgAddSchematicsSchema } from '../../schematics/ng-add/schema';
import { updateFixtureConfig } from './fixture';
import { updatePlaywright } from './playwright';

const devDependenciesToInstall = [
  'pixelmatch',
  'pngjs',
  'jest',
  'jest-preset-angular'
];

/**
 * Add Otter testing to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const testPackageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(testPackageJsonPath, { encoding: 'utf-8' })) as PackageJson;
      const depsInfo = getO3rPeerDeps(testPackageJsonPath);
      const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
      const workingDirectory = workspaceProject?.root || '.';
      const projectType = workspaceProject?.projectType || 'application';
      const dependencies = depsInfo.o3rPeerDeps.reduce((acc, dep) => {
        acc[dep] = {
          inManifest: [{
            range: `~${depsInfo.packageVersion}`,
            types: getProjectNewDependenciesTypes(workspaceProject)
          }]
        };
        return acc;
      }, getPackageInstallConfig(testPackageJsonPath, tree, options.projectName, true));
      Object.entries(getExternalDependenciesVersionRange(devDependenciesToInstall, testPackageJsonPath))
        .forEach(([dep, range]) => {
          dependencies[dep] = {
            inManifest: [{
              range,
              types: [NodeDependencyType.Dev]
            }]
          };
        });

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
        case 'other':
        default: {
          installJest = false;
          break;
        }
      }

      const installPlaywright = options.enablePlaywright !== undefined && projectType === 'application' ?
        options.enablePlaywright :
        await askConfirmation('Do you want to setup Playwright test framework for E2E?', true);

      const rules = [
        updateFixtureConfig(options, installJest),
        removePackages(['@otter/testing']),
        addVsCodeRecommendations(['Orta.vscode-jest']),
        installPlaywright ? updatePlaywright(options, dependencies) : noop,
        setupDependencies({
          projectName: options.projectName,
          dependencies,
          ngAddToRun: depsInfo.o3rPeerDeps
        }),
        registerPackageCollectionSchematics(packageJson),
        setupSchematicsDefaultParams({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '@o3r/core:component': {
            useComponentFixtures: undefined
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '@o3r/core:component-container': {
            useComponentFixtures: undefined
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '@o3r/core:component-presenter': {
            useComponentFixtures: undefined
          }
        })
      ];

      if (installJest) {
        if (workingDirectory !== undefined) {
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

          const jestConfigFilesForWorkspace = () => mergeWith(apply(url('./templates/workspace'), [
            template({
              ...options,
              rootRelativePath
            }),
            move(tree.root.path),
            renameTemplateFiles()
          ]), MergeStrategy.Default);
          rules.push(
            jestConfigFilesForProject,
            jestConfigFilesForWorkspace
          );
        } else {
          throw new O3rCliError(`Could not find working directory for project ${options.projectName || ''}`);
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
export const ngAdd = createSchematicWithMetricsIfInstalled(ngAddFn);
