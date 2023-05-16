import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';

const collectionPath = path.posix.join(__dirname, '..', '..', '..', 'collection.json');

describe('Java Core Generator', () => {
  it('should work correctly', async () => {
    const runner = new SchematicTestRunner('@ama-sdk/schematics', collectionPath);
    const tree = await runner.runSchematic('java-client-core', {
      swaggerSpecPath: path.posix.join(__dirname, '..', '..', '..', 'testing', 'MOCK_swagger.yaml')
    }, Tree.empty());

    expect(tree.files.length).toBeGreaterThan(0);
  });
});
