import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Tree
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner
} from '@angular-devkit/schematics/testing';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');

describe('Store Action generator', () => {
  let initialTree: Tree;

  beforeEach(async () => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
    const runner = new SchematicTestRunner('schematics', collectionPath);
    initialTree = await runner.runExternalSchematic('schematics', 'store-entity-async', {
      storeName: 'Example',
      modelName: 'Example',
      modelIdPropName: 'id',
      sdkPackage: '@api/sdk',
      path: './'
    }, initialTree);
  });

  it('should add a set action', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runExternalSchematic('schematics', 'store-action', {
      storeName: 'Example',
      actionName: 'dummyTest',
      actionGroup: 'testGroup',
      actionType: 'set',
      isCallAction: false,
      storeDirectory: './',
      description: 'dummy description'
    }, initialTree);

    expect(tree.readContent('/example/example.actions.ts').replace(/\n/g, '')).toMatch(/export const setDummyTest/);
    expect(tree.readContent('/example/example.actions.ts').replace(/\n/g, '')).toMatch(/const ACTION_SET_DUMMY_TEST =/);

    expect(tree.readContent('/example/example.reducer.ts').replace(/\n/g, '')).toMatch(/on\(actions\.setDummyTest, \(state, _payload\)/);
  });
});
