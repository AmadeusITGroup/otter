import * as path from 'node:path';
import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  getWorkspaceConfig,
  O3rCliError,
} from '@o3r/schematics';
import type {
  PackageJson,
} from 'type-fest';
import type {
  NgAddSchematicsSchema,
} from '../../../schematics/ng-add/schema';

/**
 * List of dependencies needed to run jest
 * @param eslintDependencies
 */
export const jestDependencies = (eslintDependencies: boolean) => [
  '@angular-builders/jest',
  '@types/jest',
  'jest',
  'jest-environment-jsdom',
  'jest-preset-angular',
  'jest-util',
  'ts-jest',
  ...eslintDependencies ? ['eslint-plugin-jest'] : []
];

/**
 * Run jest on 'npm/yarn run test'
 * @param workingDirectory
 * @param isAngular
 * @param projectName
 */
function setupJestScript(workingDirectory: string, isAngular: boolean, projectName: string) {
  return (tree: Tree) => {
    const packageJsonFile = tree.readJson(`${workingDirectory}/package.json`) as PackageJson;
    packageJsonFile.scripts ||= {};
    packageJsonFile.scripts.test = isAngular ? `ng test ${projectName}` : 'jest';
    tree.overwrite(`${workingDirectory}/package.json`, JSON.stringify(packageJsonFile, null, 2));
  };
}

/**
 * Set jest files and script in the generated library.
 * @param projectName
 */
export function setUpJestForAngularJson(projectName: string) {
  return (tree: Tree) => {
    const angularFile = tree.readJson('/angular.json') as { projects: any };
    const project: any = angularFile.projects[projectName];
    if (project) {
      project.architect ||= {};
      project.architect.test = {
        builder: '@angular-builders/jest:run',
        options: {
          tsConfig: `tsconfig.spec.json`,
          config: `jest.config.js`,
          setupFilesAfterEnv: './testing/setup-jest.ts'
        }
      };

      tree.overwrite('/angular.json', JSON.stringify(angularFile, null, 2));
    }
    return tree;
  };
}

/**
 * Setup jest as recommended
 * @param options
 */
export function setupJest(options: NgAddSchematicsSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const workingDirectory = workspaceProject?.root || '.';
    if (workingDirectory === undefined) {
      throw new O3rCliError(`Could not find working directory for project ${options.projectName || ''}`);
    }
    const rootRelativePath = path.posix.relative(workingDirectory, tree.root.path.replace(/^\//, './'));
    const isAngularSetup = tree.exists('/angular.json');
    const setupJestInProject = mergeWith(apply(url('./jest/templates/project'), [
      template({
        ...options,
        rootRelativePath,
        isAngularSetup
      }),
      move(workingDirectory),
      renameTemplateFiles()
    ]), MergeStrategy.Overwrite);

    const rules = options.projectName
      ? [
        setupJestScript(workingDirectory, isAngularSetup, options.projectName),
        setupJestInProject,
        setUpJestForAngularJson(options.projectName)
      ]
      : [];

    if (tree.exists('/jest.config.js')) {
      context.logger.info('Jest configuration files already exist at the root of the project.');
    } else {
      rules.push(mergeWith(apply(url('./jest/templates/workspace'), [
        template({
          ...options,
          tsconfigPath: `./${['tsconfig.base.json', 'tsconfig.json'].find((tsconfigBase) => tree.exists(`./${tsconfigBase}`))}`
        }),
        move(tree.root.path),
        renameTemplateFiles()
      ]), MergeStrategy.Default));
    }
    return chain(rules)(tree, context);
  };
}
