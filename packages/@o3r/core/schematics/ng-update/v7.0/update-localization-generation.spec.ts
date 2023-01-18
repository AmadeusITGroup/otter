import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';
import { updateLocalizationGeneration } from './update-localization-generation';

const collectionPath = path.join(__dirname, '..', '..', '..', 'migration.json');

describe('Update Localization Generation', () => {

  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, 'mocks', 'package.mocks.json')));
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, 'mocks', 'angular.app.mocks.json')));
  });

  it('should be removed from application', async () => {
    const runner = new SchematicTestRunner('migrations', collectionPath);
    const tree = await lastValueFrom(runner.callRule(updateLocalizationGeneration(), initialTree));

    expect(tree.read('package.json').toString('utf8')).toBe(fs.readFileSync(path.resolve(__dirname, 'mocks', 'package.mocks.result.json'), {encoding: 'utf-8'}));
  });

});
