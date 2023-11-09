import { apply, chain, MergeStrategy, mergeWith, move, noop, renameTemplateFiles, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import {
  addVsCodeRecommendations,
  getO3rPeerDeps,
  getProjectNewDependenciesType,
  getTestFramework,
  getWorkspaceConfig,
  ngAddPackages,
  ngAddPeerDependencyPackages,
  O3rCliError,
  registerPackageCollectionSchematics,
  removePackages, setupSchematicsDefaultParams } from '@o3r/schematics';
import { askConfirmation } from '@angular/cli/src/utilities/prompt';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PackageJson } from 'type-fest';
import { NgAddSchematicsSchema } from '../../schematics/ng-add/schema';
import { updateFixtureConfig } from './fixture';
import { updatePlaywright } from './playwright';

function canResolvePlaywright(): boolean {
  try {
    require.resolve('playwright/package.json');
    return true;
  } catch {
    return false;
  }
}

/**
 * Add Otter testing to an Angular Project
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const testPackageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(testPackageJsonPath, { encoding: 'utf-8' })) as PackageJson;
      const depsInfo = getO3rPeerDeps(testPackageJsonPath);
      const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
      const workingDirectory = workspaceProject?.root || '.';
      const dependencyType = getProjectNewDependenciesType(workspaceProject);
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
        case 'other':
        default: {
          installJest = false;
          break;
        }
      }

      let installPlaywright;

      if (options.enablePlaywright && projectType === 'application') {
        installPlaywright = true;
      } else {
        installPlaywright = !canResolvePlaywright() ? await askConfirmation('Do you want to setup Playwright test framework for E2E?', true) : false;
      }

      const rules = [
        updateFixtureConfig(options, installJest),
        removePackages(['@otter/testing']),
        addVsCodeRecommendations(['Orta.vscode-jest']),
        ngAddPackages(depsInfo.o3rPeerDeps, {
          skipConfirmation: true,
          version: depsInfo.packageVersion,
          parentPackageInfo: depsInfo.packageName,
          projectName: options.projectName,
          dependencyType: dependencyType,
          workingDirectory
        }),
        installPlaywright ? updatePlaywright(options) : noop,
        ngAddPeerDependencyPackages(['pixelmatch', 'pngjs'], testPackageJsonPath, dependencyType, {...options, workingDirectory, skipNgAddSchematicRun: true}),
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
          const jestConfigFilesForProject = () => mergeWith(apply(url('./templates/project'), [
            template({
              ...options,
              rootRelativePath: path.posix.relative(workingDirectory, tree.root.path.replace(/^\//, './'))
            }),
            move(workingDirectory),
            renameTemplateFiles()
          ]), MergeStrategy.Overwrite);

          const jestConfigFilesForWorkspace = () => mergeWith(apply(url('./templates/workspace'), [
            template({
              ...options
            }),
            move(tree.root.path),
            renameTemplateFiles()
          ]), MergeStrategy.Default);
          rules.push(
            ngAddPeerDependencyPackages(['jest', 'jest-preset-angular'], testPackageJsonPath, NodeDependencyType.Dev, {...options, workingDirectory, skipNgAddSchematicRun: true}),
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
