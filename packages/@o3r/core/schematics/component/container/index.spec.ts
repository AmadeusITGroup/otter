import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  strings,
} from '@angular-devkit/core';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
} from '@angular-devkit/schematics/testing';
import {
  getComponentSelectorWithoutSuffix,
  TYPES_DEFAULT_FOLDER,
} from '@o3r/schematics';
import type {
  PackageJson,
} from 'type-fest';
import {
  CONTAINER_FOLDER,
} from './index';

const collectionPath = path.join(__dirname, '..', '..', '..', 'collection.json');

function getGeneratedComponentPath(componentName: string, fileName: string, componentStructure: string) {
  return `/${TYPES_DEFAULT_FOLDER['@o3r/core:component'].app}/${strings.dasherize(componentName)}/${componentStructure === 'full' ? CONTAINER_FOLDER + '/' : ''}${fileName}`;
}

describe('Component container', () => {
  let initialTree: Tree;
  let runner: SchematicTestRunner;

  const componentName = 'testComponent';
  const expectedFileNames = [
    'test-component-cont.component.ts',
    'test-component-cont.context.ts',
    'test-component-cont.module.ts',
    'test-component-cont.spec.ts',
    'test-component-cont.template.html',
    'README.md',
    'index.ts'
  ];

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
    runner = new SchematicTestRunner('schematics', collectionPath);
    const angularPackageJson = require.resolve('@schematics/angular/package.json');
    runner.registerCollection('@schematics/angular', path.resolve(path.dirname(angularPackageJson), require(angularPackageJson).schematics));
  });

  it('should generate a container component in the default component folder', async () => {
    const tree = await runner.runSchematic('component-container', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'container',
      path: 'src/components'
    }, initialTree);

    expect(tree.files.filter((file) => /test-component/.test(file)).length).toEqual(expectedFileNames.length);
    expect(tree.files.filter((file) => /test-component/.test(file))).toEqual(expect.arrayContaining(
      expectedFileNames.map((fileName) => getGeneratedComponentPath(componentName, fileName, 'container')))
    );
  });

  it('should generate a container component as part of a full component structure', async () => {
    const tree = await runner.runSchematic('component-container', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'full',
      path: 'src/components'
    }, initialTree);

    expect(tree.files.filter((file) => /test-component/.test(file)).length).toEqual(expectedFileNames.length);
    expect(tree.files.filter((file) => /test-component/.test(file))).toEqual(expect.arrayContaining(
      expectedFileNames.map((fileName) => getGeneratedComponentPath(componentName, fileName, 'full')))
    );
  });

  it('should generate a container with the selector prefixed with o3r by default', async () => {
    const tree = await runner.runSchematic('component-container', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'container',
      path: 'src/components'
    }, initialTree);

    expect(tree.readContent(getGeneratedComponentPath(componentName, 'test-component-cont.component.ts', 'container')))
      .toContain(`selector: '${getComponentSelectorWithoutSuffix(componentName, 'o3r')}-cont'`);
  });

  it('should generate a container with the selector prefixed with provided value', async () => {
    const customPrefix = 'custom';
    const tree = await runner.runSchematic('component-container', {
      projectName: 'test-project',
      componentName,
      prefix: customPrefix,
      componentStructure: 'container',
      path: 'src/components'
    }, initialTree);

    expect(tree.readContent(getGeneratedComponentPath(componentName, 'test-component-cont.component.ts', 'container')))
      .toContain(`selector: '${getComponentSelectorWithoutSuffix(componentName, customPrefix)}-cont'`);
  });

  it('should generate a container component without fixture', async () => {
    const tree = await runner.runSchematic('component-container', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'container',
      useComponentFixtures: false,
      path: 'src/components'
    }, initialTree);

    expect(tree.files.filter((file) => /test-component-cont\.fixture\.ts$/.test(file)).length).toBe(0);
  });

  it('should throw if generate a container component with otter fixture, as @o3r/testing is not installed', async () => {
    await expect(runner.runSchematic('component-container', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'container',
      useComponentFixtures: true,
      path: 'src/components'
    }, initialTree)).rejects.toThrow();
  });

  it('should throw if generate a container component with otter configuration, as @o3r/configuration is not installed', async () => {
    await expect(runner.runSchematic('component-container', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'presenter',
      useOtterConfig: true,
      activateDummy: true,
      path: 'src/components'
    }, initialTree)).rejects.toThrow();
  });

  it('should generate a container component without otter configuration', async () => {
    const tree = await runner.runSchematic('component-container', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'container',
      useOtterConfig: false,
      path: 'src/components'
    }, initialTree);

    expect(tree.files.filter((file) => /test-component-cont\.config\.ts$/.test(file)).length).toBe(0);
  });

  // eslint-disable-next-line jest/no-disabled-tests -- adapt when switching to default standalone
  it.skip('should generate a standalone container component', async () => {
    const tree = await runner.runSchematic('component-container', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'container',
      standalone: true,
      path: 'src/components'
    }, initialTree);

    const expectedFileNamesWithoutModule = expectedFileNames.filter((fileName) => fileName !== 'test-component-cont.module.ts');

    expect(tree.files.filter((file) => /test-component/.test(file)).length).toEqual(expectedFileNamesWithoutModule.length);
    expect(tree.files.filter((file) => /test-component/.test(file))).toEqual(expect.arrayContaining(
      expectedFileNamesWithoutModule.map((fileName) => getGeneratedComponentPath(componentName, fileName, 'container')))
    );
    expect(tree.readContent(tree.files.find((file) => file.includes('test-component-cont.component.ts')))).toContain('standalone: true');
  });

  it('should throw if generate a container component with rules engine, as @o3r/rules-engine is not installed', async () => {
    await expect(runner.runSchematic('component-container', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'container',
      useRulesEngine: true,
      activateDummy: true,
      path: 'src/components'
    }, initialTree)).rejects.toThrow();
  });

  it('should generate a container component with rules engine', async () => {
    const packageJson = initialTree.readJson('package.json') as PackageJson;
    packageJson.dependencies ??= {};
    packageJson.dependencies['@o3r/rules-engine'] = '0.0.0';
    initialTree.overwrite('package.json', JSON.stringify(packageJson));
    const externalSchematicsSpy = jest.fn((tree: Tree) => tree);
    const externalCollection = {
      createSchematic: () => externalSchematicsSpy
    } as any;
    const createCollectionOriginal = runner.engine.createCollection;
    const createCollectionSpy = jest.spyOn(runner.engine, 'createCollection')
      .mockImplementation((name, requester) => name === '@o3r/rules-engine'
        ? externalCollection
        : createCollectionOriginal.call(runner.engine, name, requester)
      );

    await runner.runSchematic('component-container', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'container',
      useRulesEngine: true,
      path: 'src/components'
    }, initialTree);

    expect(createCollectionSpy).toHaveBeenCalledWith('@o3r/rules-engine', expect.any(Object));
    expect(externalSchematicsSpy).toHaveBeenCalled();
  });
});
