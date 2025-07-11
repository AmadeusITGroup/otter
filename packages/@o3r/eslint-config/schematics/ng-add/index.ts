import * as path from 'node:path';
import {
  chain,
  noop,
  type Rule,
  type SchematicContext,
  type Tree,
} from '@angular-devkit/schematics';
import type {
  PackageJson,
} from 'type-fest';
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

/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall: string[] = [];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall = [
  '@eslint/js',
  '@eslint-community/eslint-plugin-eslint-comments',
  '@stylistic/eslint-plugin',
  '@typescript-eslint/parser',
  '@typescript-eslint/utils',
  '@typescript-eslint/types',
  'angular-eslint',
  'eslint',
  'eslint-import-resolver-node',
  'eslint-import-resolver-typescript',
  'eslint-plugin-import',
  'eslint-plugin-import-newlines',
  'eslint-plugin-jsdoc',
  'eslint-plugin-prefer-arrow',
  'eslint-plugin-unicorn',
  'eslint-plugin-unused-imports',
  'globals',
  'globby',
  'jsonc-eslint-parser',
  'typescript-eslint',
  // TODO: reactivate once https://github.com/nirtamir2/eslint-plugin-sort-export-all/issues/18 is fixed
  // 'eslint-plugin-sort-export-all',
  // TODO could be removed once #2482 is fixed
  'yaml-eslint-parser'
];

const handleOtterEslintErrors = (projectName: string): Rule => async (tree: Tree, context: SchematicContext) => {
  if (!projectName) {
    return;
  }
  const { getWorkspaceConfig } = await import('@o3r/schematics');
  const workspace = getWorkspaceConfig(tree);
  if (!workspace) {
    return;
  }
  const workspaceProject = workspace.projects[projectName];

  if (!workspaceProject) {
    context.logger.warn('No project detected, linter task can not be added.');
    return;
  }
  const projectRoot = workspaceProject.root;
  const mainTsPath = path.posix.join(projectRoot, 'src/main.ts');
  if (tree.exists(mainTsPath)) {
    const mainTsContent = tree.readText(mainTsPath);
    tree.overwrite(mainTsPath, '/* eslint-disable no-console -- console.error is used to log error in the browser while initializing the Angular application */\n' + mainTsContent);
  }
  const appComponentPath = path.posix.join(projectRoot, 'src/app/app.component.ts');
  if (tree.exists(appComponentPath)) {
    const appComponentContent = tree.readText(appComponentPath);
    tree.overwrite(appComponentPath, appComponentContent.replace(/^(\s+)(title =)/m, '$1public $2'));
  }
  context.logger.warn('Linter errors may occur and should be fixed by hand or by running the linter with the option `--fix`.');
};

function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree: Tree, context: SchematicContext) => {
    let installJestPlugin = false;
    try {
      require.resolve('jest');
      installJestPlugin = true;
    } catch {}

    if (installJestPlugin) {
      devDependenciesToInstall.push('eslint-plugin-jest');
    }
    if (options.projectName) {
      devDependenciesToInstall.push('@angular-eslint/builder');
    }

    const {
      getExternalDependenciesInfo,
      setupDependencies,
      getWorkspaceConfig,
      getO3rPeerDeps,
      getProjectNewDependenciesTypes,
      getPackageInstallConfig
    } = await import('@o3r/schematics');
    const depsInfo = getO3rPeerDeps(path.resolve(__dirname, '..', '..', 'package.json'), true, /^@(?:o3r|ama-sdk)/);
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
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

    const projectDirectory = workspaceProject?.root || '.';
    const projectPackageJson = tree.readJson(path.posix.join(projectDirectory, 'package.json')) as PackageJson;

    const externalDependenciesInfo = getExternalDependenciesInfo({
      devDependenciesToInstall,
      dependenciesToInstall,
      projectType: workspaceProject?.projectType,
      projectPackageJson,
      o3rPackageJsonPath: packageJsonPath
    },
    context.logger
    );

    return () => chain([
      setupDependencies({
        projectName: options.projectName,
        dependencies: {
          ...dependencies,
          ...externalDependenciesInfo
        },
        ngAddToRun: depsInfo.o3rPeerDeps
      }),
      updateVscode,
      updateEslintConfig(__dirname),
      options.projectName && workspaceProject?.root
        ? chain([
          updateEslintConfig(__dirname, options.projectName),
          options.fix ? handleOtterEslintErrors(options.projectName) : noop()
        ])
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
