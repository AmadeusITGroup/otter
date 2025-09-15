import * as path from 'node:path';
import {
  chain,
  noop,
  type Rule,
  type SchematicContext,
  SchematicsException,
  type Tree,
} from '@angular-devkit/schematics';
import {
  applyEditorConfig,
  createOtterSchematic,
  getExternalDependenciesInfo,
  getO3rPeerDeps,
  getPackageInstallConfig,
  getPackageManager,
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
  setupDependencies,
} from '@o3r/schematics';
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
  'typescript-eslint'
  // TODO: reactivate once https://github.com/nirtamir2/eslint-plugin-sort-export-all/issues/18 is fixed
  // 'eslint-plugin-sort-export-all',
];

const handleOtterEslintErrors = (projectName: string): Rule => (tree, context) => {
  if (!projectName) {
    return;
  }
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
/**
 * Add a harmonize script in package.json
 */
const addHarmonizeScript = (): Rule => {
  const rootPackageJsonPath = '/package.json';
  return (tree: Tree, context: SchematicContext) => {
    if (!tree.exists(rootPackageJsonPath)) {
      throw new SchematicsException('Root package.json does not exist');
    }
    const isYarnPackageManager = getPackageManager() === 'yarn';
    const extraPostInstall = isYarnPackageManager ? 'yarn harmonize && yarn install --mode=skip-build' : 'npm run harmonize && npm install --ignore-scripts';
    const rootPackageJsonObject = tree.readJson(rootPackageJsonPath) as PackageJson;
    rootPackageJsonObject.scripts ||= {};
    if (rootPackageJsonObject.scripts.harmonize) {
      context.logger.info('A "harmonize" script already exists in the root "package.json". Version harmonize script will not be added.');
      return tree;
    }
    const postInstall = rootPackageJsonObject.scripts.postinstall;
    rootPackageJsonObject.scripts.harmonize = `eslint "**/package.json" ${isYarnPackageManager ? '.yarnrc.yml ' : ''}--quiet --fix --no-error-on-unmatched-pattern`;
    rootPackageJsonObject.scripts.postinstall = `${postInstall ? postInstall + ' && ' : ''}${extraPostInstall}`;
    tree.overwrite(rootPackageJsonPath, JSON.stringify(rootPackageJsonObject, null, 2));
    return tree;
  };
};

function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return (tree: Tree, context: SchematicContext) => {
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
      addHarmonizeScript(),
      options.projectName && workspaceProject?.root
        ? chain([
          updateEslintConfig(__dirname, options.projectName),
          options.fix ? handleOtterEslintErrors(options.projectName) : noop()
        ])
        : noop(),
      options.skipLinter ? noop() : applyEditorConfig()
    ])(tree, context);
  };
}

/**
 * Add Otter eslint-config to an Angular Project
 * @param options Options for the schematic
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
