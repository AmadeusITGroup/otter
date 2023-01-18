import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';
import { syncEntityActionsContent } from './mocks/example-actions';
import { syncEntityReducerContent } from './mocks/example-reducer';
import { syncEntityReducerSpecContent } from './mocks/example-reducer-spec';
import { syncEntitySelectorsContent } from './mocks/example-selectors';
import { syncEntitySelectorsSpecContent } from './mocks/example-selectors-spec';
import { syncEntityStateContent } from './mocks/example-state';

const collectionPath = path.join(__dirname, '..', '..', '..', 'collection.json');

describe('Store entity sync generator', () => {

  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
  });

  it('should generate sync entity store', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await lastValueFrom(runner.runExternalSchematicAsync('schematics', 'store-entity-sync', {
      storeName: 'Example',
      modelName: 'Example',
      modelIdPropName: 'id',
      sdkPackage: '@api/sdk',
      path: './'
    }, initialTree));

    expect(tree.readContent('/example/example.actions.ts').replace(/\s|\n/g, '')).toEqual(syncEntityActionsContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.reducer.spec.ts').replace(/\s|\n/g, '')).toEqual(syncEntityReducerSpecContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.reducer.ts').replace(/\s|\n/g, '')).toEqual(syncEntityReducerContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.selectors.spec.ts').replace(/\s|\n/g, '')).toEqual(syncEntitySelectorsSpecContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.selectors.ts').replace(/\s|\n/g, '')).toEqual(syncEntitySelectorsContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.state.ts').replace(/\s|\n/g, '')).toEqual(syncEntityStateContent.replace(/\s|\n/g, ''));
  });
});
