import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Tree
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner
} from '@angular-devkit/schematics/testing';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');

describe('Fixture', () => {
  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
  });

  it('should generate a fixture in an empty fixture', async () => {
    const filePath = 'example-empty.fixture.ts';
    initialTree.create(filePath, fs.readFileSync(path.join(__dirname, 'mocks/example-empty.fixture.ts.mock')));
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('add-functions-to-fixture', {
      path: filePath,
      methods: ['getText'],
      selector: '.test'
    }, initialTree);

    const content = tree.readContent(filePath);
    expect(content).toContain('SELECTOR_TEST');
    expect(content).toContain('getTestText(): Promise<string | undefined>');
  });

  it('should generate a fixture in a fixture file', async () => {
    const filePath = 'example.fixture.ts';
    initialTree.create(filePath, fs.readFileSync(path.join(__dirname, 'mocks/example.fixture.ts.mock')));
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('add-functions-to-fixture', {
      path: filePath,
      methods: ['getText'],
      selector: '.test'
    }, initialTree);

    const content = tree.readContent(filePath);
    expect(content).toContain('SELECTOR_TEST');
    expect(content).toContain('getTestText(): Promise<string | undefined>');
  });
});
