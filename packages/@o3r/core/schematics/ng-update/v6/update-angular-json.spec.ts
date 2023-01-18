import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { readAngularJson } from '@o3r/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';
import { updateI18nBuild, updatePrefetchTargetBuild } from './update-angular-json';

const collectionPath = path.join(__dirname, '..', '..', '..', 'migration.json');

describe('Update angular json', () => {

  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));

  });

  it('should add the mandatory targetBuild property for the prefetch builder', async () => {
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, 'angular.app.mocks.json')));
    const runner = new SchematicTestRunner('migrations', collectionPath);
    const tree = await lastValueFrom(runner.callRule(updatePrefetchTargetBuild(), initialTree));

    const workspace = readAngularJson(tree);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(workspace.projects['test-project'].architect.prefetch.options.targetBuild).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(workspace.projects['test-project'].architect.build.options.targetBuild).not.toBeDefined();
  });

  it('should do nothing', async () => {
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, 'angular.lib.mocks.json')));
    const runner = new SchematicTestRunner('migrations', collectionPath);
    const tree = await lastValueFrom(runner.callRule(updatePrefetchTargetBuild(), initialTree));

    const workspace = readAngularJson(tree);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(workspace.projects['test-project'].architect.prefetch.options.targetBuild).not.toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(workspace.projects['test-project'].architect.build.options.targetBuild).not.toBeDefined();
  });

  it('should update the i18n builder configuration', async () => {
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, 'angular.app.mocks.json')));
    const runner = new SchematicTestRunner('migrations', collectionPath);
    const tree = await lastValueFrom(runner.callRule(updateI18nBuild(), initialTree));

    const workspace = readAngularJson(tree);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(workspace.projects['test-project'].architect.i18n.options.localizationConfigs).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(workspace.projects['test-project'].architect.i18n.options.localizationConfigs.length).toBe(2);
  });
});
