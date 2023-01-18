import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';
import { commonModuleContent } from '../common/mocks/air-offers-module';
import { commonIndexContent } from '../common/mocks/index';
import { asyncEntityActionsContent } from './mocks/air-offers-actions';
import { asyncEntityEffectContent } from './mocks/air-offers-effect';
import { asyncEntityEffectSpecContent } from './mocks/air-offers-effect-spec';
import { asyncEntityReducerContent } from './mocks/air-offers-reducer';
import { asyncEntityReducerSpecContent } from './mocks/air-offers-reducer-spec';
import { asyncEntitySelectorsContent } from './mocks/air-offers-selectors';
import { asyncEntitySelectorsSpecContent } from './mocks/air-offers-selectors-spec';
import { asyncEntityStateContent } from './mocks/air-offers-state';
import { asyncEntitySyncContent } from './mocks/air-offers-sync';

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
    const tree = await lastValueFrom(runner.runExternalSchematicAsync('schematics', 'store-entity-async', {
      storeName: 'AirOffers',
      modelName: 'AirOffer',
      modelIdPropName: 'id',
      sdkPackage: '@dapi/sdk',
      path: './'
    }, initialTree));

    expect(tree.readContent('/air-offers/index.ts').replace(/\s|\n/g, '')).toEqual(commonIndexContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/air-offers/air-offers.module.ts').replace(/\s|\n/g, '')).toEqual(commonModuleContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/air-offers/air-offers.sync.ts').replace(/\s|\n/g, '')).toEqual(asyncEntitySyncContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/air-offers/air-offers.actions.ts').replace(/\s|\n/g, '')).toEqual(asyncEntityActionsContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/air-offers/air-offers.effect.spec.ts').replace(/\s|\n/g, '')).toEqual(asyncEntityEffectSpecContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/air-offers/air-offers.effect.ts').replace(/\s|\n/g, '')).toEqual(asyncEntityEffectContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/air-offers/air-offers.reducer.spec.ts').replace(/\s|\n/g, '')).toEqual(asyncEntityReducerSpecContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/air-offers/air-offers.reducer.ts').replace(/\s|\n/g, '')).toEqual(asyncEntityReducerContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/air-offers/air-offers.selectors.spec.ts').replace(/\s|\n/g, '')).toEqual(asyncEntitySelectorsSpecContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/air-offers/air-offers.selectors.ts').replace(/\s|\n/g, '')).toEqual(asyncEntitySelectorsContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/air-offers/air-offers.state.ts').replace(/\s|\n/g, '')).toEqual(asyncEntityStateContent.replace(/\s|\n/g, ''));
  });

  it('Ensure that we dont break the training', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await lastValueFrom(runner.runExternalSchematicAsync('schematics', 'store-entity-async', {
      storeName: 'Ratings',
      modelName: 'Rating',
      modelIdPropName: 'flightId',
      sdkPackage: '@flight-rating/sdk',
      path: './'
    }, initialTree));

    expect(tree.readContent('/ratings/ratings.actions.ts')).toContain('@flight-rating/sdk');
    expect(tree.readContent('/ratings/ratings.reducer.ts')).toContain('model.flightId');
  });
});
