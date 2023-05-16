import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';

const collectionPath = path.posix.join(__dirname, '..', '..', '..', 'collection.json');

describe('Typescript Core Generator', () => {

  let baseTree: UnitTestTree;
  beforeEach(async () => {
    const runner = new SchematicTestRunner('@ama-sdk/schematics', collectionPath);
    const tree = Tree.empty();
    tree.create('/readme.md', 'Based on Swagger spec 0.1.0');
    baseTree = await runner.runSchematic('typescript-shell', {
      name: 'test-sdk',
      package: 'sdk'
    }, tree);
  });

  it('should update readme', async () => {
    const runner = new SchematicTestRunner('@ama-sdk/schematics', collectionPath);
    const tree = await runner.runSchematic('typescript-core', {
      swaggerSpecPath: path.posix.join(__dirname, '..', '..', '..', 'testing', 'MOCK_swagger.yaml')
    }, baseTree);

    expect(tree.readContent('/readme.md')).toContain('Based on Swagger spec 1.0.0');
  });

  it('should clean previous install', async () => {
    baseTree.create('/src/api/my-apy/test.ts', 'fake module');
    const runner = new SchematicTestRunner('@ama-sdk/schematics', collectionPath);
    const tree = await runner.runSchematic('typescript-core', {
      swaggerSpecPath: path.posix.join(__dirname, '..', '..', '..', 'testing', 'MOCK_swagger.yaml')
    }, baseTree);

    expect(tree.exists('/src/api/my-apy/test.ts')).toBeFalsy();
  });

  it('should throw when swagger is missing', async () => {
    baseTree.create('/src/api/my-apy/test.ts', 'fake module');
    const runner = new SchematicTestRunner('@ama-sdk/schematics', collectionPath);

    return expect(() => runner.runSchematic('typescript-core', {
      swaggerSpecPath: 'does/not/exist.yaml'
    }, baseTree)).rejects.toThrow();
  });
});
