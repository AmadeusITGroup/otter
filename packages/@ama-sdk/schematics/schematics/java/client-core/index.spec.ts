import * as path from 'node:path';
import {
  Tree
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner
} from '@angular-devkit/schematics/testing';

const collectionPath = path.join(__dirname, '..', '..', '..', 'collection.json');

describe('Java Core Generator', () => {
  it('should work correctly', async () => {
    const runner = new SchematicTestRunner('@ama-sdk/schematics', collectionPath);
    const tree = await runner.runSchematic('java-client-core', {
      specPath: path.join(__dirname, '..', '..', '..', 'testing', 'MOCK_swagger.yaml')
    }, Tree.empty());

    expect(tree.files.length).toBeGreaterThan(0);
  });
});
