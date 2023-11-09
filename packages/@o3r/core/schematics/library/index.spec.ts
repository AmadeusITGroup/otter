import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';

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
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const angularPackageJson = require.resolve('@schematics/angular/package.json');
    runner.registerCollection('@schematics/angular', path.resolve(path.dirname(angularPackageJson), require(angularPackageJson).schematics));
    const tree = await runner.runExternalSchematic('schematics', 'library', {
      path: 'packages-test',
      name: '@my/new-module',
      skipLinter: true
    }, initialTree);

    expect(tree.readContent('/packages-test/my-new-module/package.json')).toContain('"name": "@my/new-module"');
    expect(tree.exists('/packages-test/my-new-module/collection.json')).toBe(true);
    expect(tree.exists('/packages-test/my-new-module/schematics/ng-add/schema.json')).toBe(true);
    expect(tree.exists('/packages-test/my-new-module/project.json')).toBe(false);
    expect(JSON.parse(tree.readContent('/tsconfig.base.json')).compilerOptions.paths['@my/new-module']).toContain('packages-test/my-new-module/src/public-api');
    expect(JSON.parse(tree.readContent('/tsconfig.build.json')).compilerOptions.paths['@my/new-module'][0]).toBe('packages-test/my-new-module/dist');
    expect(tree.files.length).toBeGreaterThan(16);
  });

  // Skip relative to nx generator issue
  // TODO: re-enable when Nx Alias conflict is fixed
  describe.skip('in NX monorepo', () => {
    it('should generate Nx specific files', async () => {
      initialTree.create('nx.json', '{}');
      initialTree.create('package.json', '{ "version": "0.0.0-test" }');
      const nxPackageJson = require.resolve('@nx/angular/package.json');
      const nxWorkspacePackageJson = require.resolve('@nx/workspace/package.json');
      const angularPackageJson = require.resolve('@schematics/angular/package.json');
      const runner = new SchematicTestRunner('schematics', collectionPath);
      runner.registerCollection('@nx/angular', path.resolve(path.dirname(nxPackageJson), require(nxPackageJson).schematics));
      runner.registerCollection('@schematics/angular', path.resolve(path.dirname(angularPackageJson), require(angularPackageJson).schematics));
      runner.registerCollection('@nx/workspace', path.resolve(path.dirname(nxWorkspacePackageJson), require(nxWorkspacePackageJson).schematics));
      const tree = await runner.runExternalSchematic('schematics', 'library', {
        path: 'packages-test',
        name: '@my/new-module',
        skipLinter: true
      }, initialTree);

      expect(tree.exists('/packages-test/my-new-module/project.json')).toBe(true);
      expect(tree.readContent('/packages-test/my-new-module/project.json')).toContain('"name": "my-new-module');
    });

    it('should generate Nx project.json with given name', async () => {
      initialTree.create('nx.json', '{}');
      initialTree.create('package.json', '{ "version": "0.0.0-test" }');
      const nxPackageJson = require.resolve('@nx/angular/package.json');
      const nxWorkspacePackageJson = require.resolve('@nx/workspace/package.json');
      const angularPackageJson = require.resolve('@schematics/angular/package.json');
      const runner = new SchematicTestRunner('schematics', collectionPath);
      runner.registerCollection('@nx/angular', path.resolve(path.dirname(nxPackageJson), require(nxPackageJson).schematics));
      runner.registerCollection('@schematics/angular', path.resolve(path.dirname(angularPackageJson), require(angularPackageJson).schematics));
      runner.registerCollection('@nx/workspace', path.resolve(path.dirname(nxWorkspacePackageJson), require(nxWorkspacePackageJson).schematics));
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
