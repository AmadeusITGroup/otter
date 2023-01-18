import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';
import { asyncSimpleActionsContent } from './mocks/air-offers-actions';
import { asyncSimpleEffectContent } from './mocks/air-offers-effect';
import { asyncSimpleEffectSpecContent } from './mocks/air-offers-effect-spec';
import { asyncSimpleReducerContent } from './mocks/air-offers-reducer';
import { asyncSimpleReducerSpecContent } from './mocks/air-offers-reducer-spec';
import { asyncSimpleStateContent } from './mocks/air-offers-state';
import { asyncSimpleSyncContent } from './mocks/air-offers-sync';

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
    const tree = await lastValueFrom(runner.runExternalSchematicAsync('schematics', 'store-simple-async', {
      storeName: 'AirOffers',
      modelName: 'AirOffer',
      path: './'
    }, initialTree));

    expect(tree.readContent('/air-offers/air-offers.actions.ts').replace(/\s|\n/g, '')).toEqual(asyncSimpleActionsContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/air-offers/air-offers.effect.spec.ts').replace(/\s|\n/g, '')).toEqual(asyncSimpleEffectSpecContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/air-offers/air-offers.effect.ts').replace(/\s|\n/g, '')).toEqual(asyncSimpleEffectContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/air-offers/air-offers.reducer.spec.ts').replace(/\s|\n/g, '')).toEqual(asyncSimpleReducerSpecContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/air-offers/air-offers.reducer.ts').replace(/\s|\n/g, '')).toEqual(asyncSimpleReducerContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/air-offers/air-offers.state.ts').replace(/\s|\n/g, '')).toEqual(asyncSimpleStateContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/air-offers/air-offers.sync.ts').replace(/\s|\n/g, '')).toEqual(asyncSimpleSyncContent.replace(/\s|\n/g, ''));
  });
});
