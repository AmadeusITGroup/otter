import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Tree
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner
} from '@angular-devkit/schematics/testing';
import type {
  NgAddSchematicsSchema
} from './schema';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');

describe('ng-add', () => {
  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
  });

  it('should generate a GitHub workflow', async () => {
    const runner = new SchematicTestRunner('@o3r/pipeline', collectionPath);
    const tree = await runner.runSchematic('ng-add', {
      toolchain: 'github'
    } as NgAddSchematicsSchema, initialTree);

    expect(tree.exists('.github/actions/setup/action.yml')).toBe(true);
    expect(tree.exists('.github/workflows/main.yml')).toBe(true);
    expect(tree.exists('.npmrc')).toBe(false);

    expect(tree.readText('.github/workflows/main.yml')).toContain('ubuntu-latest');
  });

  it('should generate a GitHub workflow with custom parameters', async () => {
    const runner = new SchematicTestRunner('@o3r/pipeline', collectionPath);
    const tree = await runner.runSchematic('ng-add', {
      toolchain: 'github',
      runner: 'windows-latest',
      npmRegistry: 'private.registry.com'
    } as NgAddSchematicsSchema, initialTree);

    expect(tree.exists('.github/actions/setup/action.yml')).toBe(true);
    expect(tree.exists('.github/workflows/main.yml')).toBe(true);
    expect(tree.exists('.npmrc')).toBe(true);

    expect(tree.readText('.github/workflows/main.yml')).toContain('windows-latest');
    expect(tree.readText('.npmrc')).toContain('registry=private.registry.com');
  });

  it('should generate a GitHub workflow with custom parameters when npmrc exists', async () => {
    const runner = new SchematicTestRunner('@o3r/pipeline', collectionPath);
    initialTree.create('.npmrc', 'registry=http://public.registry.com');
    const tree = await runner.runSchematic('ng-add', {
      toolchain: 'github',
      runner: 'windows-latest',
      npmRegistry: 'http://private.registry.com'
    } as NgAddSchematicsSchema, initialTree);

    expect(tree.exists('.github/actions/setup/action.yml')).toBe(true);
    expect(tree.exists('.github/workflows/main.yml')).toBe(true);
    expect(tree.exists('.npmrc')).toBe(true);

    expect(tree.readText('.github/workflows/main.yml')).toContain('windows-latest');
    expect(tree.readText('.npmrc')).toBe('registry=http://private.registry.com');
  });
});
