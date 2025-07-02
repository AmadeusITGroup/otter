import * as path from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
} from '@angular-devkit/schematics/testing';

jest.mock('@angular-devkit/schematics', () => {
  const originalModule = jest.requireActual('@angular-devkit/schematics');
  return {
    ...originalModule,
    externalSchematic: jest.fn().mockImplementation(() => (tree: Tree) => {
      return tree;
    })
  };
});

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');
const angularJsonFile = JSON.stringify({
  version: 1,
  projects: {
    'my-new-module': {
      projectType: 'library',
      root: 'packages-test/my-new-module'
    }
  }
}, null, 2);

describe('New module generator', () => {
  let initialTree: Tree;
  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', angularJsonFile);
    initialTree.create('package.json', '{ "version": "0.0.0-test" }');
  });

  it('should generate the minimum mandatory files', async () => {
    initialTree.create('/tsconfig.base.json', JSON.stringify({}));
    initialTree.create('/packages-test/my-new-module/package.json', '{ "version": "0.0.0-test" }');
    initialTree.create('/packages-test/my-new-module/ng-package.json', '{  }');
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const angularPackageJson = require.resolve('@schematics/angular/package.json');
    const o3rCorePackageJson = require.resolve('@o3r/core/package.json');
    runner.registerCollection('@o3r/core', path.resolve(path.dirname(o3rCorePackageJson), require(o3rCorePackageJson).schematics));
    runner.registerCollection('@schematics/angular', path.resolve(path.dirname(angularPackageJson), require(angularPackageJson).schematics));
    const spy = jest.spyOn(require('@angular-devkit/schematics'), 'externalSchematic');
    const tree = await runner.runSchematic('library', {
      path: 'packages-test',
      name: '@my/new-module',
      skipLinter: true,
      skipInstall: true
    }, initialTree);

    expect(spy).toHaveBeenNthCalledWith(1, '@schematics/angular', 'library', expect.anything());
    expect(tree.exists('/packages-test/my-new-module/tsconfig.json')).toBe(true);
    expect(tree.readJson('/packages-test/my-new-module/tsconfig.lib.prod.json')).toStrictEqual({ extends: '../../tsconfig.base.json' });
    expect(tree.exists('/packages-test/my-new-module/project.json')).toBe(false);
    expect(JSON.parse(tree.readContent('/tsconfig.base.json')).compilerOptions.paths['@my/new-module']).toContain('packages-test/my-new-module/src/public-api');
    expect(JSON.parse(tree.readContent('/tsconfig.base.json')).compilerOptions.paths['@my/new-module']).not.toContain('packages-test/my-new-module/dist');
    expect(tree.exists('/tsconfig.build.json')).toBe(true);
    expect(JSON.parse(tree.readContent('/tsconfig.build.json')).compilerOptions.paths['@my/new-module']).toContain('packages-test/my-new-module/dist');
    expect(tree.exists('/packages-test/my-new-module/testing/setup-jest.ts')).toBe(false);
    expect(JSON.parse(tree.readContent('/packages-test/my-new-module/package.json')).scripts.test).toContain('ng test my-new-module');
    expect(tree.exists('/packages-test/my-new-module/jest.config.js')).toBe(false);
    expect(tree.files.length).toBeGreaterThanOrEqual(9);
  });

  it('should handle the missing tsconfig.base.json', async () => {
    initialTree.create('/packages-test/my-new-module/package.json', '{ "version": "0.0.0-test" }');
    initialTree.create('/packages-test/my-new-module/ng-package.json', '{  }');
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const angularPackageJson = require.resolve('@schematics/angular/package.json');
    const o3rCorePackageJson = require.resolve('@o3r/core/package.json');
    runner.registerCollection('@o3r/core', path.resolve(path.dirname(o3rCorePackageJson), require(o3rCorePackageJson).schematics));
    runner.registerCollection('@schematics/angular', path.resolve(path.dirname(angularPackageJson), require(angularPackageJson).schematics));
    const spy = jest.spyOn(require('@angular-devkit/schematics'), 'externalSchematic');
    const tree = await runner.runSchematic('library', {
      path: 'packages-test',
      name: '@my/new-module',
      skipLinter: true,
      skipInstall: true
    }, initialTree);
    expect(spy).toHaveBeenNthCalledWith(1, '@schematics/angular', 'library', expect.anything());
    expect(tree.exists('/tsconfig.base.json')).toBe(false);
  });

  // eslint-disable-next-line jest/no-disabled-tests -- TODO: Should be re-enable when the following issue #2066 is fixed
  describe.skip('in NX monorepo', () => {
    it('should generate Nx project.json with given name', async () => {
      initialTree.create('nx.json', '{"workspaceLayout": { "libsDir": "packages-test" } }');
      initialTree.create('angular.json', '{"version": 1, "projects": {} }');
      initialTree.create('package.json', '{ "version": "0.0.0-test" }');
      initialTree.create('/packages-test/my-new-module/package.json', '{ "version": "0.0.0-test" }');
      initialTree.create('/packages-test/my-new-module/ng-package.json', '{  }');
      const nxPackageJson = require.resolve('@nx/angular/package.json');
      const nxWorkspacePackageJson = require.resolve('@nx/workspace/package.json');
      const angularPackageJson = require.resolve('@schematics/angular/package.json');
      const runner = new SchematicTestRunner('schematics', collectionPath);
      runner.registerCollection('@nx/angular', path.resolve(path.dirname(nxPackageJson), require(nxPackageJson).generators));
      runner.registerCollection('@schematics/angular', path.resolve(path.dirname(angularPackageJson), require(angularPackageJson).schematics));
      runner.registerCollection('@nx/workspace', path.resolve(path.dirname(nxWorkspacePackageJson), require(nxWorkspacePackageJson).generators));
      const tree = await runner.runExternalSchematic('schematics', 'library', {
        path: 'packages-test',
        name: '@my/new-module',
        projectName: 'test-module-name',
        skipLinter: true
      }, initialTree);

      expect(tree.exists('/packages-test/my-new-module/testing/setup-jest.ts')).toBe(true);
      expect(tree.exists('/packages-test/my-new-module/jest.config.js')).toBe(true);
      const packageJsonContent = tree.readJson('/packages-test/my-new-module/package.json') as any;
      expect(packageJsonContent.scripts.test).toBe('ng test my-new-module');
      expect(packageJsonContent.devDependencies['@angular-builders/jest']).toBeDefined();
      (tree.readJson('/packages-test/my-new-module/tsconfig.spec.json') as { references: { path: string }[] })
        .references
        .forEach((ref) => {
          expect(tree.exists(path.join('/packages-test/my-new-module', ref.path))).toBe(true);
        });
      expect(tree.exists('/packages-test/my-new-module/project.json')).toBe(true);
      const projectJson: any = tree.readJson('/packages-test/my-new-module/project.json');
      expect(projectJson.name).toBe('test-module-name');
      expect(tree.exists(projectJson.targets.test.options.jestConfig)).toBe(true);
      expect(projectJson.targets.test.executor).toBe('@nx/jest:jest');
    });
  });
});
