import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';
import {updateLocalizationImports} from './localization-imports';

const collectionPath = path.join(__dirname, '..', '..', '..', '..', 'migration.json');

describe('Localization mocks imports', () => {

  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, 'mocks', 'angular.mocks.json.template')));
    initialTree.create('/src/my-component.ts', fs.readFileSync(path.resolve(__dirname, 'mocks', 'my-component.ts.template')));
  });

  it('should double check the imports of localization mocks and do updates if needed', async () => {
    const runner = new SchematicTestRunner('migrations', collectionPath);
    const tree = await lastValueFrom(runner.callRule(updateLocalizationImports(), initialTree));

    expect(tree.readText('/src/my-component.ts')).toBe(fs.readFileSync(path.resolve(__dirname, 'mocks', 'my-component-updated.ts.template'), {encoding: 'utf-8'}));
  });

});
