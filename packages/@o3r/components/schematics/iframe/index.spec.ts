import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getComponentSelectorWithoutSuffix, TYPES_DEFAULT_FOLDER } from '@o3r/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');

/**
 * @param componentName
 * @param fileName
 * @param componentStructure
 */
function getGeneratedComponentPath(componentName: string, fileName: string) {
  return `/${TYPES_DEFAULT_FOLDER['@o3r/core:component'].app}/${strings.dasherize(componentName)}/${fileName}`;
}

describe('Iframe component', () => {

  let initialTree: Tree;

  const componentName = 'iframeComponent';
  const expectedFileNames = [
    'iframe-component.component.ts',
    'iframe-component.config.ts',
    'iframe-component.module.ts',
    'iframe-component.spec.ts',
    'iframe-component.template.html',
    'README.md',
    'index.ts'
  ];

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
  });

  it('should generate an iframe component in the default components folder', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('iframe-component', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      path: 'src/components'
    }, initialTree);

    expect(tree.files.filter((file) => /iframe-component/.test(file)).length).toEqual(expectedFileNames.length);
    expect(tree.files.filter((file) => /iframe-component/.test(file))).toEqual(expect.arrayContaining(
      expectedFileNames.map((fileName) => getGeneratedComponentPath(componentName, fileName)))
    );
  });

  it('should generate a standalone iframe component in the default components folder', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('iframe-component', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      path: 'src/components',
      standalone: true
    }, initialTree);

    expect(tree.files.filter((file) => /iframe-component/.test(file)).length).toEqual(expectedFileNames.length - 1);
    expect(tree.files.find((file) => /iframe-component\.module\.ts/.test(file))).toBeFalsy();
    expect(tree.readContent(tree.files.find((file) => /iframe-component\.component\.ts/.test(file)))).toContain('standalone: true');
  });

  it('should generate an iframe component with the selector prefixed with o3r by default', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('iframe-component', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      path: 'src/components'
    }, initialTree);

    expect(tree.readContent(getGeneratedComponentPath(componentName, 'iframe-component.component.ts')))
      .toContain(`selector: '${getComponentSelectorWithoutSuffix(componentName, 'o3r')}'`);
  });

  it('should generate an iframe component without otter configuration', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('iframe-component', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      useOtterConfig: false,
      path: 'src/components'
    }, initialTree);

    const expectedFileNamesWithoutConfig = expectedFileNames.filter((fileName) => fileName !== 'iframe-component.config.ts');

    expect(tree.files.filter((file) => /iframe-component/.test(file)).length).toEqual(expectedFileNamesWithoutConfig.length);
    expect(tree.files.filter((file) => /iframe-component/.test(file))).toEqual(expect.arrayContaining(
      expectedFileNamesWithoutConfig.map((fileName) => getGeneratedComponentPath(componentName, fileName)))
    );
  });

});
