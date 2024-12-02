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

describe('New module generator', () => {
  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('/tsconfig.base.json', JSON.stringify({
      compilerOptions: {
        paths: {}
      }
    }));
    initialTree.create('/tsconfig.build.json', JSON.stringify({
      compilerOptions: {
        paths: {}
      }
    }));
  });

  it('should generate the minimum mandatory files', async () => {
    initialTree.create('angular.json', '{"version": 1, "projects": {} }');
    initialTree.create('package.json', '{ "version": "0.0.0-test" }');
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
    expect(tree.exists('/packages-test/my-new-module/project.json')).toBe(false);
    expect(JSON.parse(tree.readContent('/tsconfig.base.json')).compilerOptions.paths['@my/new-module']).toContain('packages-test/my-new-module/src/public-api');
    expect(JSON.parse(tree.readContent('/tsconfig.build.json')).compilerOptions.paths['@my/new-module'][0]).toBe('packages-test/my-new-module/dist');
    expect(tree.files.length).toBeGreaterThanOrEqual(9);
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

      expect(tree.exists('/packages-test/my-new-module/project.json')).toBe(true);
      expect(tree.readContent('/packages-test/my-new-module/project.json')).toContain('"name": "test-module-name"');
    });
  });
});
