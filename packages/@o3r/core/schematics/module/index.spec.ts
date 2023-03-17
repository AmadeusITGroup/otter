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
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runExternalSchematic('schematics', 'module', {
      path: 'packages-test',
      name: '@my/new-module',
      skipLinter: true
    }, initialTree);

    expect(tree.readContent('/packages-test/@my/new-module/package.json')).toContain('"name": "@my/new-module"');
    expect(tree.exists('/packages-test/@my/new-module/collection.json')).toBe(true);
    expect(tree.exists('/packages-test/@my/new-module/project.json')).toBe(false);
    expect(JSON.parse(tree.readContent('/tsconfig.base.json')).compilerOptions.paths['@my/new-module']).toContain('packages-test/@my/new-module/src/public_api');
    expect(JSON.parse(tree.readContent('/tsconfig.build.json')).compilerOptions.paths['@my/new-module'][0]).toBe('packages-test/@my/new-module/dist');
    expect(tree.files.length).toBeGreaterThan(16);
  });

  describe('in NX monorepo', () => {
    it('should generate Nx specific files', async () => {
      initialTree.create('nx.json', '{}');
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const tree = await runner.runExternalSchematic('schematics', 'module', {
        path: 'packages-test',
        name: '@my/new-module',
        skipLinter: true
      }, initialTree);

      expect(tree.exists('/packages-test/@my/new-module/project.json')).toBe(true);
      expect(tree.readContent('/packages-test/@my/new-module/project.json')).toContain('"name": "my-new-module');
    });

    it('should generate Nx project.json with given name', async () => {
      initialTree.create('nx.json', '{}');
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const tree = await runner.runExternalSchematic('schematics', 'module', {
        path: 'packages-test',
        name: '@my/new-module',
        projectName: 'test-module-name',
        skipLinter: true
      }, initialTree);

      expect(tree.exists('/packages-test/@my/new-module/project.json')).toBe(true);
      expect(tree.readContent('/packages-test/@my/new-module/project.json')).toContain('"name": "test-module-name"');
    });
  });
});
