import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';
import { updateSassImports } from '@o3r/schematics';

const collectionPath = path.join(__dirname, '..', '..', '..', '..', 'collection.json');

describe('Update Styling imports', () => {

  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('/packages/@o3r/styling/schematics/ng-add/updates-of-old-otter-scope/imports/mocks/old.scss', fs.readFileSync(path.resolve(__dirname, 'mocks', 'old.scss')));
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, 'mocks', 'angular.json')));
  });

  it('should update otter imports and scoped functions/variables in scss files', async () => {
    const runner = new SchematicTestRunner('migrations', collectionPath);
    const tree = await lastValueFrom(runner.callRule(updateSassImports('o3r'), initialTree));

    expect(tree.read('/packages/@o3r/styling/schematics/ng-add/updates-of-old-otter-scope/imports/mocks/old.scss')!.toString('utf8'))
      .toBe(fs.readFileSync(path.resolve(__dirname, 'mocks', 'new.scss.result'), {encoding: 'utf-8'}));
  });

});
