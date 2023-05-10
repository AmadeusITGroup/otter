import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';
import { updateThrowOnUndefinedCalls } from './throw-on-undefined';

const collectionPath = path.join(__dirname, '..', '..', '..', '..', 'migration.json');

describe('Update ThrowOnUndefined helper', () => {

  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, 'mocks', 'angular.mocks.json.template')));
    initialTree.create('/src/mock.fixture.ts', fs.readFileSync(path.resolve(__dirname, 'mocks', 'fixture.mocks.ts.template')));
    initialTree.create('/src/mock.component.ts', fs.readFileSync(path.resolve(__dirname, 'mocks', 'fixture.mocks.ts.template')));
  });

  it('should not update non-fixture files', async () => {
    const runner = new SchematicTestRunner('migrations', collectionPath);
    const tree = await lastValueFrom(runner.callRule(updateThrowOnUndefinedCalls(), initialTree));

    expect(tree.readText('/src/mock.component.ts')).toBe(fs.readFileSync(path.resolve(__dirname, 'mocks', 'fixture.mocks.ts.template'), {encoding: 'utf-8'}));
  });

  it('should update fixture files', async () => {
    const runner = new SchematicTestRunner('migrations', collectionPath);
    const tree = await lastValueFrom(runner.callRule(updateThrowOnUndefinedCalls(), initialTree));

    expect(tree.readText('/src/mock.fixture.ts')).toBe(fs.readFileSync(path.resolve(__dirname, 'mocks', 'fixture.mocks.result.ts.template'), { encoding: 'utf-8' }));
  });
});
