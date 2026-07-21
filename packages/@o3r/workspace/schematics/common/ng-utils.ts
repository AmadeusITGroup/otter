import * as path from 'node:path';
import {
  apply,
  chain,
  externalSchematic,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  findConfigFileRelativePath,
} from '@o3r/schematics';
import {
  PackageJson,
} from 'type-fest';

/**
 * Set jest files and script in the generated library.
 * @param options
 * @param options.targetPath
 * @param options.name
 */
export function setUpAngularTestPackageJson(options: { targetPath: string; name: string }): Rule {
  return (tree: Tree) => {
    const packageJsonPath = path.join(options.targetPath, 'package.json');
    const packageJsonContent = tree.readJson(packageJsonPath) as PackageJson;
    packageJsonContent.scripts ||= {};
    packageJsonContent.scripts.test ||= `ng test ${options.name}`;
    tree.overwrite(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));
    return tree;
  };
}

/**
 * Set jest files and script in the generated library.
 * @param name
 */
function setUpJestForAngularJson(name: string) {
  return (tree: Tree) => {
    const angularFile = tree.readJson('/angular.json') as { projects: any };
    const project: any = angularFile.projects[name];
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
    return tree;
  };
}

/**
 * Set the jest configuration without relying on `@o3r/testing`
 * @param options
 * @param options.targetPath
 * @param options.name
 */
function setUpJestWithoutO3rTesting(options: { targetPath: string; name: string }) {
  return (tree: Tree) =>
    chain([
      mergeWith(
        apply(url('../common/templates/jest'), [
          template({
            tsconfigBasePath: findConfigFileRelativePath(tree, ['tsconfig.base.json', 'tsconfig.json'], options.targetPath),
            tsconfigSpecPath: findConfigFileRelativePath(tree,
              ['tsconfig.test.json', 'tsconfig.spec.json', 'tsconfig.jest.json', 'tsconfig.jasmine.json', 'tsconfig.base.json', 'tsconfig.json'], options.targetPath)
          }),
          renameTemplateFiles(),
          move(options.targetPath)
        ]), MergeStrategy.Overwrite
      ),
      setUpJestForAngularJson(options.name)
    ]);
}

/**
 * Set the jest configuration files, if the project has a dependency on `@o3r/testing`, use the ng add `@o3r/testing` script
 * @param options
 * @param options.targetPath
 * @param options.name
 */
export function setUpJest(options: { targetPath: string; name: string }): Rule {
  return (tree: Tree, context) => {
    const isO3rTestingInstalled: boolean = tree.readText('/package.json').includes('@o3r/testing');
    if (isO3rTestingInstalled) {
      context.logger.debug('Package @o3r/testing detected.');
      return externalSchematic('@o3r/testing', 'ng-add', { projectName: options.name, skipInstall: true, skipLinter: true });
    }
    return setUpJestWithoutO3rTesting(options);
  };
}
