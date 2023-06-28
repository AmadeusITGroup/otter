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

  const componentName = 'testComponent';
  const expectedFileNames = [
    'test-component-pres.component.ts',
    'test-component-pres.context.ts',
    'test-component-pres.localization.json',
    'test-component-pres.module.ts',
    'test-component-pres.spec.ts',
    'test-component-pres.style.scss',
    'test-component-pres.template.html',
    'test-component-pres.translation.ts',
    'README.md',
    'index.ts',
    'test-component-pres.fixture.ts',
    'test-component-pres.style.theme.scss',
    'test-component-pres.stories.ts'
  ];

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
  });

  it('should generate a presenter component in the default component folder', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'presenter',
      useOtterAnalytics: false,
      activateDummy: true,
      path: 'src/components'
    }, initialTree);

    expect(tree.files.filter((file) => /test-component/.test(file)).length).toEqual(expectedFileNames.length);
    expect(tree.files.filter((file) => /test-component/.test(file))).toEqual(expect.arrayContaining(
      expectedFileNames.map((fileName) => getGeneratedComponentPath(componentName, fileName, 'presenter')))
    );
  });

  it('should generate a presenter component as part of a full component structure', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'full',
      useOtterAnalytics: false,
      activateDummy: true,
      path: 'src/components'
    }, initialTree);

    expect(tree.files.filter((file) => /test-component/.test(file)).length).toEqual(expectedFileNames.length);
    expect(tree.files.filter((file) => /test-component/.test(file))).toEqual(expect.arrayContaining(
      expectedFileNames.map((fileName) => getGeneratedComponentPath(componentName, fileName, 'full')))
    );
  });

  it('should generate a presenter with the selector prefixed with o3r by default', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
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
    const customPrefix = '6x';
    const runner = new SchematicTestRunner('schematics', collectionPath);
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
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'presenter',
      useComponentFixtures: false,
      useOtterAnalytics: false,
      activateDummy: true,
      path: 'src/components'
    }, initialTree);

    const expectedFileNamesWithoutFixture = expectedFileNames.filter((fileName) => fileName !== 'test-component-pres.fixture.ts');

    expect(tree.files.filter((file) => /test-component/.test(file)).length).toEqual(expectedFileNamesWithoutFixture.length);
    expect(tree.files.filter((file) => /test-component/.test(file))).toEqual(expect.arrayContaining(
      expectedFileNamesWithoutFixture.map((fileName) => getGeneratedComponentPath(componentName, fileName, 'presenter')))
    );
  });

  it('should generate a presenter component without otter theme', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'presenter',
      useOtterTheming: false,
      useOtterAnalytics: false,
      activateDummy: true,
      path: 'src/components'
    }, initialTree);

    const expectedFileNamesWithoutOtterTheme = expectedFileNames.filter((fileName) => fileName !== 'test-component-pres.style.theme.scss');

    expect(tree.files.filter((file) => /test-component/.test(file)).length).toEqual(expectedFileNamesWithoutOtterTheme.length);
    expect(tree.files.filter((file) => /test-component/.test(file))).toEqual(expect.arrayContaining(
      expectedFileNamesWithoutOtterTheme.map((fileName) => getGeneratedComponentPath(componentName, fileName, 'presenter')))
    );
  });

  it('should generate a presenter component without translation', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'presenter',
      useComponentFixtures: false,
      activateDummy: false,
      path: 'src/components'
    }, initialTree);

    expect(tree.readContent(tree.files.find((file) => /\.localization\.json$/i.test(file))!).replace(/[\s\r\n]/g, '')).toBe('{}');
    expect(tree.readContent(tree.files.find((file) => /\.translation\.ts$/i.test(file))!).replace(/[\s\r\n]/g, '')).toMatch(/extendsTranslation\{\}/);
    expect(tree.readContent(tree.files.find((file) => /\.translation\.ts$/i.test(file))!).replace(/[\s\r\n]/g, '')).toMatch(/exportconsttranslations:[a-zA-Z0-9]+=\{\}/);
  });

  it('should generate a presenter component without storybook', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'presenter',
      useStorybook: false,
      useContext: true,
      useOtterAnalytics: false,
      activateDummy: true,
      path: 'src/components'
    }, initialTree);

    const expectedFileNamesWithoutStorybook = expectedFileNames.filter((fileName) => fileName !== 'test-component-pres.stories.ts');

    expect(tree.files.filter((file) => /test-component/.test(file)).length).toEqual(expectedFileNamesWithoutStorybook.length);
    expect(tree.files.filter((file) => /test-component/.test(file))).toEqual(expect.arrayContaining(
      expectedFileNamesWithoutStorybook.map((fileName) => getGeneratedComponentPath(componentName, fileName, 'presenter')))
    );
  });

  it('should generate a presenter component without context', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('component-presenter', {
      projectName: 'test-project',
      componentName,
      prefix: 'o3r',
      componentStructure: 'presenter',
      useStorybook: true,
      useContext: false,
      useOtterAnalytics: false,
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
    const runner = new SchematicTestRunner('schematics', collectionPath);
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
    const runner = new SchematicTestRunner('schematics', collectionPath);

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
    const runner = new SchematicTestRunner('schematics', collectionPath);
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
    const runner = new SchematicTestRunner('schematics', collectionPath);
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
