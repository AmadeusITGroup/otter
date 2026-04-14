import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
} from '@angular-devkit/schematics/testing';

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
    const tree = await runner.runExternalSchematic('schematics', 'service', {
      projectName: 'test-project',
      name: 'test-service',
      featureName: 'test-base',
      path: './'
    }, initialTree);

    expect(tree.files.filter((file) => /test-service/.test(file)).length).toEqual(9);
    expect(tree.files.some((file) => /^[/\\]?test-service[/\\]test-base[/\\]test-service-test-base-module\.ts$/i.test(file))).toBeTruthy();
    expect(tree.readContent('test-service/test-base/test-service-test-base-module.ts')).toContain('export class TestServiceTestBaseModule');
  });

  it('should generate service in default folder', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runExternalSchematic('schematics', 'service', {
      projectName: 'test-project',
      name: 'test-service',
      featureName: 'test-base',
      path: 'src/services'
    }, initialTree);

    expect(tree.files.filter((file) => /test-service/.test(file)).length).toEqual(9);
    expect(tree.files.some((file) => /^[/\\]?src[/\\]services[/\\]test-service[/\\]test-base[/\\]test-service-test-base-module\.ts$/i.test(file))).toBeTruthy();
  });

  // eslint-disable-next-line jest/no-disabled-tests -- TODO enable when https://github.com/jestjs/jest/issues/9543 fixed
  it.skip('should generate service with fixtures for jest if installed', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runExternalSchematic('schematics', 'service', {
      projectName: 'test-project',
      name: 'test-service',
      featureName: 'test-base',
      path: 'src/services'
    }, initialTree);

    expect(tree.files.filter((file) => /test-service/.test(file)).length).toEqual(12);
    expect(tree.files.some((file) => /^[/\\]?src[/\\]services[/\\]test-service[/\\]test-base[/\\]test-service-test-base-module\.ts$/i.test(file))).toBeTruthy();
  });

  it('should generate service with type', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runExternalSchematic('schematics', 'service', {
      projectName: 'test-project',
      name: 'test-service',
      featureName: 'test-base',
      path: 'src/services',
      type: 'service'
    }, initialTree);

    expect(tree.files.filter((file) => /test-service/.test(file)).length).toEqual(9);
    expect(tree.files.some((file) => /^[/\\]?src[/\\]services[/\\]test-service[/\\]test-base[/\\]test-service-test-base-module\.ts$/i.test(file))).toBeTruthy();
    expect(tree.files.some((file) => /^[/\\]?src[/\\]services[/\\]test-service[/\\]test-base[/\\]test-service-test-base\.service\.ts$/i.test(file))).toBeTruthy();
    expect(tree.files.some((file) => /^[/\\]?src[/\\]services[/\\]test-service[/\\]test-base[/\\]test-service-test-base\.service\.spec\.ts$/i.test(file))).toBeTruthy();
    expect(tree.readContent('src/services/test-service/test-base/test-service-test-base.service.ts')).toContain('export class TestServiceTestBaseService');
    expect(tree.readContent('src/services/test-service/test-base/test-service-test-base.service.spec.ts')).toContain('import {TestServiceTestBaseService} from \'./test-service-test-base.service\';');
    expect(tree.readContent('src/services/test-service/test-base/index.ts')).toContain('export * from \'./test-service-test-base.service\';');
  });

  it('should generate service with type but not appended to the service name', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runExternalSchematic('schematics', 'service', {
      projectName: 'test-project',
      name: 'test-service',
      featureName: 'test-base',
      path: 'src/services',
      type: 'service',
      addTypeToServiceName: false
    }, initialTree);

    expect(tree.files.filter((file) => /test-service/.test(file)).length).toEqual(9);
    expect(tree.files.some((file) => /^[/\\]?src[/\\]services[/\\]test-service[/\\]test-base[/\\]test-service-test-base-module\.ts$/i.test(file))).toBeTruthy();
    expect(tree.files.some((file) => /^[/\\]?src[/\\]services[/\\]test-service[/\\]test-base[/\\]test-service-test-base\.service\.ts$/i.test(file))).toBeTruthy();
    expect(tree.files.some((file) => /^[/\\]?src[/\\]services[/\\]test-service[/\\]test-base[/\\]test-service-test-base\.service\.spec\.ts$/i.test(file))).toBeTruthy();
    expect(tree.readContent('src/services/test-service/test-base/test-service-test-base.service.ts')).toContain('export class TestServiceTestBase');
  });
});
