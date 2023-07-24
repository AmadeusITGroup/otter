import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getComponentSelectorWithoutSuffix, TYPES_DEFAULT_FOLDER } from '@o3r/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PRESENTER_FOLDER } from './index';

const collectionPath = path.join(__dirname, '..', '..', '..', 'collection.json');

/**
 * @param componentName
 * @param fileName
 * @param componentStructure
 */
function getGeneratedComponentPath(componentName: string, fileName: string, componentStructure: string) {
  return `/${TYPES_DEFAULT_FOLDER['@o3r/core:component'].app}/${strings.dasherize(componentName)}/${componentStructure === 'full' ? PRESENTER_FOLDER + '/' : ''}${fileName}`;
}

describe('Component presenter', () => {

  let initialTree: Tree;
  let runner: SchematicTestRunner;

  const componentName = 'testComponent';
  const expectedFileNames = [
    'test-component-pres.component.ts',
    'test-component-pres.context.ts',
    'test-component-pres.module.ts',
    'test-component-pres.spec.ts',
    'test-component-pres.style.scss',
    'test-component-pres.template.html',
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

  it('should generate a presenter component in the default component folder', async () => {
    const tree = await runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'presenter',
      activateDummy: true,
      path: 'src/components'
    }, initialTree);

    expect(tree.files.filter((file) => /test-component/.test(file)).length).toEqual(expectedFileNames.length);
    expect(tree.files.filter((file) => /test-component/.test(file))).toEqual(expect.arrayContaining(
      expectedFileNames.map((fileName) => getGeneratedComponentPath(componentName, fileName, 'presenter')))
    );
  });

  it('should generate a presenter component as part of a full component structure', async () => {
    const tree = await runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'full',
      activateDummy: true,
      path: 'src/components'
    }, initialTree);

    expect(tree.files.filter((file) => /test-component/.test(file)).length).toEqual(expectedFileNames.length);
    expect(tree.files.filter((file) => /test-component/.test(file))).toEqual(expect.arrayContaining(
      expectedFileNames.map((fileName) => getGeneratedComponentPath(componentName, fileName, 'full')))
    );
  });

  it('should generate a presenter with the selector prefixed with o3r by default', async () => {
    const tree = await runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'presenter',
      activateDummy: true,
      path: 'src/components'
    }, initialTree);

    expect(tree.readContent(getGeneratedComponentPath(componentName, 'test-component-pres.component.ts', 'presenter')))
      .toContain(`selector: '${getComponentSelectorWithoutSuffix(componentName, 'o3r')}-pres'`);
  });

  it('should generate a presenter with the selector prefixed with provided value', async () => {
    const customPrefix = 'custom';
    const tree = await runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: customPrefix,
      componentStructure: 'presenter',
      activateDummy: true,
      path: 'src/components'
    }, initialTree);

    expect(tree.readContent(getGeneratedComponentPath(componentName, 'test-component-pres.component.ts', 'presenter')))
      .toContain(`selector: '${getComponentSelectorWithoutSuffix(componentName, customPrefix)}-pres'`);
  });

  it('should generate a presenter component without fixture', async () => {
    const tree = await runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'presenter',
      useComponentFixtures: false,
      activateDummy: true,
      path: 'src/components'
    }, initialTree);

    expect(tree.files.filter((file) => /test-component-pres\.fixture\.ts$/.test(file)).length).toBe(0);
  });

  it('should generate a presenter component without otter theme', async () => {
    const tree = await runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'presenter',
      useOtterTheming: false,
      activateDummy: true,
      path: 'src/components'
    }, initialTree);

    const expectedFileNamesWithoutOtterTheme = expectedFileNames.filter((fileName) => fileName !== 'test-component-pres.style.theme.scss');

    expect(tree.files.filter((file) => /test-component/.test(file)).length).toEqual(expectedFileNamesWithoutOtterTheme.length);
    expect(tree.files.filter((file) => /test-component/.test(file))).toEqual(expect.arrayContaining(
      expectedFileNamesWithoutOtterTheme.map((fileName) => getGeneratedComponentPath(componentName, fileName, 'presenter')))
    );
  });

  it('should throw if generate a presenter component with otter theming, as @o3r/styling is not installed', async () => {
    await expect(runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'presenter',
      useOtterTheming: true,
      path: 'src/components'
    }, initialTree)).rejects.toThrow();
  });

  it('should throw if generate a presenter component with otter localization, as @o3r/localization is not installed', async () => {
    await expect(runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'presenter',
      useLocalization: true,
      path: 'src/components'
    }, initialTree)).rejects.toThrow();
  });

  it('should generate a presenter component without context', async () => {
    const tree = await runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'presenter',
      useContext: false,
      activateDummy: true,
      path: 'src/components'
    }, initialTree);

    const expectedFileNamesWithoutContext = expectedFileNames.filter((fileName) => fileName !== 'test-component-pres.context.ts');

    expect(tree.files.filter((file) => /test-component/.test(file)).length).toEqual(expectedFileNamesWithoutContext.length);
    expect(tree.files.filter((file) => /test-component/.test(file))).toEqual(expect.arrayContaining(
      expectedFileNamesWithoutContext.map((fileName) => getGeneratedComponentPath(componentName, fileName, 'presenter')))
    );
  });

  it('should generate a presenter component without localization', async () => {
    const tree = await runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'presenter',
      useLocalization: false,
      activateDummy: true,
      path: 'src/components'
    }, initialTree);

    const expectedFileNamesWithoutLocalization = expectedFileNames.filter((fileName) =>
      fileName !== 'test-component-pres.localization.json' && fileName !== 'test-component-pres.translation.ts'
    );

    expect(tree.files.filter((file) => /test-component/.test(file)).length).toEqual(expectedFileNamesWithoutLocalization.length);
    expect(tree.files.filter((file) => /test-component/.test(file))).toEqual(expect.arrayContaining(
      expectedFileNamesWithoutLocalization.map((fileName) => getGeneratedComponentPath(componentName, fileName, 'presenter')))
    );
  });

  it('should throw if generate a presenter component with otter configuration, as @o3r/configuration is not installed', async () => {
    await expect(runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'presenter',
      useOtterConfig: true,
      activateDummy: true,
      path: 'src/components'
    }, initialTree)).rejects.toThrow();
  });

  it('should generate a presenter component without otter configuration', async () => {
    const tree = await runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'presenter',
      useOtterConfig: false,
      activateDummy: true,
      path: 'src/components'
    }, initialTree);

    expect(tree.files.filter((file) => /test-component-pres\.config\.ts$/.test(file)).length).toBe(0);
  });

  it('should generate a standalone presenter component', async () => {
    const tree = await runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'presenter',
      standalone: true,
      path: 'src/components'
    }, initialTree);

    const expectedFileNamesWithoutModule = expectedFileNames.filter((fileName) => fileName !== 'test-component-pres.module.ts');

    expect(tree.files.filter((file) => /test-component/.test(file)).length).toEqual(expectedFileNamesWithoutModule.length);
    expect(tree.files.filter((file) => /test-component/.test(file))).toEqual(expect.arrayContaining(
      expectedFileNamesWithoutModule.map((fileName) => getGeneratedComponentPath(componentName, fileName, 'container')))
    );
    expect(tree.readContent(tree.files.find((file) => file.includes('test-component-pres.component.ts')))).toContain('standalone: true');
  });
});
