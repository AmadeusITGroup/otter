import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';
import { updateConfigurationExtractorCategories } from './configuration-extractor-categories';

const collectionPath = path.join(__dirname, '..', '..', '..', '..', 'migration.json');

describe('Update categories in configuration extractor', () => {

  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, 'mocks', 'angular.mocks.json.template')));
    initialTree.create('/src/mock.config.ts', fs.readFileSync(path.resolve(__dirname, 'mocks', 'config.mocks.ts.template')));
    initialTree.create('/src/mock.component.ts', fs.readFileSync(path.resolve(__dirname, 'mocks', 'config.mocks.ts.template')));
  });

  it('should not update non-config files', async () => {
    const runner = new SchematicTestRunner('migrations', collectionPath);
    const tree = await lastValueFrom(runner.callRule(updateConfigurationExtractorCategories(), initialTree));

    expect(tree.readText('/src/mock.component.ts')).toBe(fs.readFileSync(path.resolve(__dirname, 'mocks', 'config.mocks.ts.template'), {encoding: 'utf-8'}));
  });

  it('should update config files', async () => {
    const runner = new SchematicTestRunner('migrations', collectionPath);
    const tree = await lastValueFrom(runner.callRule(updateConfigurationExtractorCategories(), initialTree));

    expect(tree.readText('/src/mock.config.ts')).toBe(fs.readFileSync(path.resolve(__dirname, 'mocks', 'config.mocks.result.ts.template'), { encoding: 'utf-8' }));
  });
});
