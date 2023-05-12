import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getComponentSelectorWithoutSuffix, TYPES_DEFAULT_FOLDER } from '@o3r/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CONTAINER_FOLDER } from './index';

const collectionPath = path.join(__dirname, '..', '..', '..', 'collection.json');

/**
 * @param componentName
 * @param fileName
 * @param componentStructure
 */
function getGeneratedComponentPath(componentName: string, fileName: string, componentStructure: string) {
  return `/${TYPES_DEFAULT_FOLDER['@o3r/core:component'].app}/${strings.dasherize(componentName)}/${componentStructure === 'full' ? CONTAINER_FOLDER + '/' : ''}${fileName}`;
}

describe('Component container', () => {

  let initialTree: Tree;

  const componentName = 'testComponent';
  const expectedFileNames = [
    'test-component-cont.component.ts',
    'test-component-cont.config.ts',
    'test-component-cont.context.ts',
    'test-component-cont.module.ts',
    'test-component-cont.spec.ts',
    'test-component-cont.template.html',
    'README.md',
    'index.ts',
    'test-component-cont.fixture.ts'
  ];

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
  });

  it('should generate a container component in the default component folder', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
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
    const runner = new SchematicTestRunner('schematics', collectionPath);
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
    const runner = new SchematicTestRunner('schematics', collectionPath);
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
    const customPrefix = '6x';
    const runner = new SchematicTestRunner('schematics', collectionPath);
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
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('component-container', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'container',
      useComponentFixtures: false,
      path: 'src/components'
    }, initialTree);

    const expectedFileNamesWithoutFixture = expectedFileNames.filter((fileName) => fileName !== 'test-component-cont.fixture.ts');

    expect(tree.files.filter((file) => /test-component/.test(file)).length).toEqual(expectedFileNamesWithoutFixture.length);
    expect(tree.files.filter((file) => /test-component/.test(file))).toEqual(expect.arrayContaining(
      expectedFileNamesWithoutFixture.map((fileName) => getGeneratedComponentPath(componentName, fileName, 'container')))
    );
  });

  it('should generate a container component without otter configuration', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('component-container', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'container',
      useOtterConfig: false,
      path: 'src/components'
    }, initialTree);

    const expectedFileNamesWithoutConfig = expectedFileNames.filter((fileName) => fileName !== 'test-component-cont.config.ts');

    expect(tree.files.filter((file) => /test-component/.test(file)).length).toEqual(expectedFileNamesWithoutConfig.length);
    expect(tree.files.filter((file) => /test-component/.test(file))).toEqual(expect.arrayContaining(
      expectedFileNamesWithoutConfig.map((fileName) => getGeneratedComponentPath(componentName, fileName, 'container')))
    );
  });

  it('should generate a standalone container component', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
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
});
