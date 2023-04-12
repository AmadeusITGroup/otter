import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as fs from 'node:fs';
import * as path from 'node:path';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');

describe('Storybook component generator', () => {

  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
  });

  it('should not generate a storybook file in a folder without component', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runExternalSchematic('schematics', 'storybook-component', {
      projectName: 'test-project',
      useOtterConfig: false,
      path: 'src/components'
    }, initialTree);

    expect(tree.files.length).toEqual(3);
  });

  it('should generate a storybook file', async () => {
    initialTree.create('test-pres.component.ts', '');
    initialTree.create('test.pres.style.scss', '');

    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runExternalSchematic('schematics', 'storybook-component', {
      projectName: 'test-project',
      useOtterConfig: false,
      useLocalization: false,
      path: 'src/components'
    }, initialTree);

    expect(tree.files.length).toEqual(6);
    expect(tree.exists('test-pres.stories.ts')).toBeTruthy();
  });

  it('should not override an existing storybook file', async () => {
    initialTree.create('test-pres.component.ts', '');
    initialTree.create('test-pres.style.scss', '');
    initialTree.create('test-pres.stories.ts', 'test');

    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runExternalSchematic('schematics', 'storybook-component', {
      projectName: 'test-project',
      useOtterConfig: false,
      path: 'src/components'
    }, initialTree);

    expect(tree.files.length).toEqual(6);
    expect(tree.get('test-pres.stories.ts')?.content.toString()).toMatch(/^test$/);
  });
});
