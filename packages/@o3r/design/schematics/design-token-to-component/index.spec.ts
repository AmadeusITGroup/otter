import * as path from 'node:path';
import {
  Tree
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner
} from '@angular-devkit/schematics/testing';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');
const stylePath = '/src/components/test/test.style.scss';
const designTokenPath = '/src/components/test/test.theme.json';

describe('Add Design Token to component', () => {
  let initialTree: Tree;
  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create(stylePath, '');
  });

  it('should create the design token file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('design-token-to-component', {
      path: designTokenPath
    }, initialTree);

    expect(tree.exists(designTokenPath)).toBe(true);
    const designTokenFileContent = tree.readText(designTokenPath);
    expect(designTokenFileContent).not.toContain('"o3rTargetFile": "test.style.scss"');
    expect(designTokenFileContent).toContain('"test":');
  });

  it('should create the design token file and target styling file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('design-token-to-component', {
      path: designTokenPath,
      stylePath
    }, initialTree);

    expect(tree.exists(designTokenPath)).toBe(true);
    const designTokenFileContent = tree.readText(designTokenPath);
    expect(designTokenFileContent).toContain('"o3rTargetFile": "test.style.scss"');
  });

  it('should create the design token file with correct name', async () => {
    const designTokenPathTestPath = '/src/components/test/test';
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('design-token-to-component', {
      path: designTokenPathTestPath,
      stylePath
    }, initialTree);

    expect(tree.exists(designTokenPathTestPath + '.json')).toBe(true);
    const designTokenFileContent = tree.readText(designTokenPathTestPath + '.json');
    expect(designTokenFileContent).toContain('"o3rTargetFile": "test.style.scss"');
    expect(designTokenFileContent).toContain('"test":');
  });
});
