import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
} from '@angular-devkit/schematics/testing';
import {
  syncSimpleActionsContent,
} from './mocks/example-actions';
import {
  syncSimpleReducerContent,
} from './mocks/example-reducer';
import {
  syncSimpleReducerSpecContent,
} from './mocks/example-reducer-spec';
import {
  syncSimpleStateContent,
} from './mocks/example-state';

const collectionPath = path.join(__dirname, '..', '..', '..', 'collection.json');

describe('Store simple sync generator', () => {
  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
  });

  it('should generate sync simple store', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runExternalSchematic('schematics', 'store-simple-sync', {
      storeName: 'Example',
      path: './'
    }, initialTree);

    expect(tree.readContent('/example/example.actions.ts').replace(/\s|\n/g, '')).toEqual(syncSimpleActionsContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.reducer.spec.ts').replace(/\s|\n/g, '')).toEqual(syncSimpleReducerSpecContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.reducer.ts').replace(/\s|\n/g, '')).toEqual(syncSimpleReducerContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.state.ts').replace(/\s|\n/g, '')).toEqual(syncSimpleStateContent.replace(/\s|\n/g, ''));
  });
});
