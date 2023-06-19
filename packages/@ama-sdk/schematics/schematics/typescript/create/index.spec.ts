import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';

const collectionPath = path.join(__dirname, '..', '..', '..', 'collection.json');

describe('Typescript SDK Generator', () => {
  it('should execute shell and core generator', async () => {
    const runner = new SchematicTestRunner('@ama-sdk/schematics', collectionPath);

    const tree = await runner.runSchematic('typescript-sdk', {
      name: 'test-scope',
      package: 'test-sdk',
      specPath: path.join(__dirname, '..', '..', '..', 'testing', 'MOCK_swagger.yaml')
    }, Tree.empty());

    const baseTree = await runner.runSchematic('typescript-shell', {
      name: 'test-sdk',
      package: 'sdk'
    }, Tree.empty());

    const coreTree = await runner.runSchematic('typescript-core', {
      specPath: path.join(__dirname, '..', '..', '..', 'testing', 'MOCK_swagger.yaml')
    }, baseTree);

    expect(tree.files.sort()).toEqual(coreTree.files.sort());
    expect(tree.files.length).toBeGreaterThan(0);
  }, 10000);
});
