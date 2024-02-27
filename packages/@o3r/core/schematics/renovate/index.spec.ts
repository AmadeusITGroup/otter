import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');

describe('Renovate Bot generator', () => {

  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
  });

  it('should generate a basic renovate bot repository', async () => {
    const organizationName = 'test-orga';
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runExternalSchematic('schematics', 'renovate-bot', {
        organizationName
      }, initialTree);

    expect(tree.files.length).toEqual(2);
    expect(tree.readContent('/.renovate/config.js')).toContain(`https://dev.azure.com/${organizationName}`);
  });
});
