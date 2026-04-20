import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  askConfirmation,
} from '@angular/cli/src/utilities/prompt';
import {
  chain,
  noop,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  addVsCodeRecommendations,
  applyEditorConfig,
  createOtterSchematic,
  getTestFramework,
  getWorkspaceConfig,
  ngAddDependenciesRule,
  O3rCliError,
  registerPackageCollectionSchematics,
  removePackages,
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
  jestDependencies,
  setupJest,
} from './jest';
import {
  playwrightDependencies,
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
  'uuid',
  '@angular-devkit/build-angular',
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
      const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
      const projectType = workspaceProject?.projectType || 'application';
      let installJest;
      let isEslintInstalled;

      try {
        require.resolve('@o3r/eslint-config');
        isEslintInstalled = true;
      } catch {
        isEslintInstalled = false;
      }

      const testFramework = options.testingFramework || getTestFramework(getWorkspaceConfig(tree), context);
      switch (testFramework) {
        case 'jest': {
          installJest = true;
          break;
        }
        case 'jasmine':
        case 'vitest': {
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
        ...installPlaywright
          ? [
            updatePlaywright(options)
          ]
          : [],
        ...installJest ? [setupJest(options)] : [],
        registerPackageCollectionSchematics(packageJson),
        setupSchematicsParamsForProject({
          '@o3r/core:component': schematicsDefaultOptions,
          '@o3r/core:component-container': schematicsDefaultOptions,
          '@o3r/core:component-presenter': schematicsDefaultOptions
        }, options.projectName),
        ngAddDependenciesRule(
          options,
          testPackageJsonPath,
          {
            dependenciesToInstall,
            devDependenciesToInstall: devDependenciesToInstall.concat(
              installJest ? jestDependencies(isEslintInstalled) : [],
              installPlaywright ? playwrightDependencies : []
            )
          }
        ),
        options.skipLinter ? noop() : applyEditorConfig()
      ];
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
