import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Tree
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner
} from '@angular-devkit/schematics/testing';
import {
  asyncSimpleActionsContent
} from './mocks/example-actions';
import {
  asyncSimpleEffectContent
} from './mocks/example-effect';
import {
  asyncSimpleEffectSpecContent
} from './mocks/example-effect-spec';
import {
  asyncSimpleReducerContent
} from './mocks/example-reducer';
import {
  asyncSimpleReducerSpecContent
} from './mocks/example-reducer-spec';
import {
  asyncSimpleStateContent
} from './mocks/example-state';
import {
  asyncSimpleSyncContent
} from './mocks/example-sync';

const collectionPath = path.join(__dirname, '..', '..', '..', 'collection.json');

describe('Store simple async generator', () => {
  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
  });

  it('should generate async simple store', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runExternalSchematic('schematics', 'store-simple-async', {
      storeName: 'Example',
      modelName: 'Example',
      sdkPackage: '@api/sdk',
      path: './'
    }, initialTree);

    expect(tree.readContent('/example/example.actions.ts').replace(/\s|\n/g, '')).toEqual(asyncSimpleActionsContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.effect.spec.ts').replace(/\s|\n/g, '')).toEqual(asyncSimpleEffectSpecContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.effect.ts').replace(/\s|\n/g, '')).toEqual(asyncSimpleEffectContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.reducer.spec.ts').replace(/\s|\n/g, '')).toEqual(asyncSimpleReducerSpecContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.reducer.ts').replace(/\s|\n/g, '')).toEqual(asyncSimpleReducerContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.state.ts').replace(/\s|\n/g, '')).toEqual(asyncSimpleStateContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.sync.ts').replace(/\s|\n/g, '')).toEqual(asyncSimpleSyncContent.replace(/\s|\n/g, ''));
  });
});
