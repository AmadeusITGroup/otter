import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';
import { syncSimpleActionsContent } from './mocks/air-offers-actions';
import { syncSimpleReducerContent } from './mocks/air-offers-reducer';
import { syncSimpleReducerSpecContent } from './mocks/air-offers-reducer-spec';
import { syncSimpleStateContent } from './mocks/air-offers-state';

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
    const tree = await lastValueFrom(runner.runExternalSchematicAsync('schematics', 'store-simple-sync', {
      storeName: 'AirOffers',
      path: './'
    }, initialTree));

    expect(tree.readContent('/air-offers/air-offers.actions.ts').replace(/\s|\n/g, '')).toEqual(syncSimpleActionsContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/air-offers/air-offers.reducer.spec.ts').replace(/\s|\n/g, '')).toEqual(syncSimpleReducerSpecContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/air-offers/air-offers.reducer.ts').replace(/\s|\n/g, '')).toEqual(syncSimpleReducerContent.replace(/\s|\n/g, ''));
    expect(tree.readContent('/air-offers/air-offers.state.ts').replace(/\s|\n/g, '')).toEqual(syncSimpleStateContent.replace(/\s|\n/g, ''));
  });
});
