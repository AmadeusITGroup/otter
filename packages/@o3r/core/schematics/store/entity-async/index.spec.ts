import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
} from '@angular-devkit/schematics/testing';
import {
  commonModuleContent,
} from '../common/mocks/example-module';
import {
  commonIndexContent,
} from '../common/mocks/index';
import {
  asyncEntityActionsContent,
} from './mocks/example-actions';
import {
  asyncEntityEffectContent,
} from './mocks/example-effect';
import {
  asyncEntityEffectSpecContent,
} from './mocks/example-effect-spec';
import {
  asyncEntityReducerContent,
} from './mocks/example-reducer';
import {
  asyncEntityReducerSpecContent,
} from './mocks/example-reducer-spec';
import {
  asyncEntitySelectorsContent,
} from './mocks/example-selectors';
import {
  asyncEntitySelectorsSpecContent,
} from './mocks/example-selectors-spec';
import {
  asyncEntityStateContent,
} from './mocks/example-state';
import {
  asyncEntitySyncContent,
} from './mocks/example-sync';

const collectionPath = path.join(__dirname, '..', '..', '..', 'collection.json');

describe('Store entity async generator', () => {
  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
  });

  it('should generate async entity store', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runExternalSchematic('schematics', 'store-entity-async', {
      storeName: 'Example',
      modelName: 'Example',
      modelIdPropName: 'id',
      sdkPackage: '@api/sdk',
      path: './'
    }, initialTree);

    expect(tree.readContent('/example/index.ts').replace(/\s|\n/g, '')).toEqual(commonIndexContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.module.ts').replace(/\s|\n/g, '')).toEqual(commonModuleContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.sync.ts').replace(/\s|\n/g, '')).toEqual(asyncEntitySyncContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.actions.ts').replace(/\s|\n/g, '')).toEqual(asyncEntityActionsContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.effect.spec.ts').replace(/\s|\n/g, '')).toEqual(asyncEntityEffectSpecContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.effect.ts').replace(/\s|\n/g, '')).toEqual(asyncEntityEffectContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.reducer.spec.ts').replace(/\s|\n/g, '')).toEqual(asyncEntityReducerSpecContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.reducer.ts').replace(/\s|\n/g, '')).toEqual(asyncEntityReducerContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.selectors.spec.ts').replace(/\s|\n/g, '')).toEqual(asyncEntitySelectorsSpecContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.selectors.ts').replace(/\s|\n/g, '')).toEqual(asyncEntitySelectorsContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/example/example.state.ts').replace(/\s|\n/g, '')).toEqual(asyncEntityStateContent.replace(/\s|\n/g, ''));
  });

  it('Ensure that we dont break the training', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runExternalSchematic('schematics', 'store-entity-async', {
      storeName: 'Ratings',
      modelName: 'Rating',
      modelIdPropName: 'flightId',
      sdkPackage: '@flight-rating/sdk',
      path: './'
    }, initialTree);

    expect(tree.readContent('/ratings/ratings.actions.ts')).toContain('@flight-rating/sdk');
    expect(tree.readContent('/ratings/ratings.reducer.ts')).toContain('model.flightId');
  });
});
