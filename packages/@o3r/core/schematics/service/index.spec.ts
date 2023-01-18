import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');

describe('Service generator', () => {

  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
  });

  it('should generate service in custom folder', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await lastValueFrom(runner.runExternalSchematicAsync('schematics', 'service', {
      projectName: 'test-project',
      name: 'test-service',
      featureName: 'test-base',
      path: './'
    }, initialTree));

    expect(tree.files.filter((file) => /test-service/.test(file)).length).toEqual(12);
    expect(tree.files.some((file) => /^[\\/]?test-service[\\/]test-base[\\/]test-service\.test-base\.module\.ts$/i.test(file))).toBeTruthy();
  });

  it('should generate service in default folder', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await lastValueFrom(runner.runExternalSchematicAsync('schematics', 'service', {
      projectName: 'test-project',
      name: 'test-service',
      featureName: 'test-base',
      path: 'src/services'
    }, initialTree));

    expect(tree.files.filter((file) => /test-service/.test(file)).length).toEqual(12);
    expect(tree.files.some((file) => /^[\\/]?src[\\/]services[\\/]test-service[\\/]test-base[\\/]test-service\.test-base\.module\.ts$/i.test(file))).toBeTruthy();
  });
});
