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
 */
function setupJestScript(workingDirectory: string) {
  return (tree: Tree) => {
    const packageJsonFile = tree.readJson(`${workingDirectory}/package.json`) as PackageJson;
    packageJsonFile.scripts ||= {};
    packageJsonFile.scripts.test = 'jest';
    tree.overwrite(`${workingDirectory}/package.json`, JSON.stringify(packageJsonFile, null, 2));
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
    const setupJestInProject = mergeWith(apply(url('./jest/templates/project'), [
      template({
        ...options,
        rootRelativePath,
        isAngularSetup: tree.exists('/angular.json')
      }),
      move(workingDirectory),
      renameTemplateFiles()
    ]), MergeStrategy.Overwrite);

    const rules = [
      setupJestScript(workingDirectory),
      setupJestInProject
    ];

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
