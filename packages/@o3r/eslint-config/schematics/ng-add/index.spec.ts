import * as path from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
} from '@angular-devkit/schematics/testing';

const setupDependenciesMock = jest.fn(() => () => {});
const updateVscodeMock = jest.fn(() => {});
const updateEslintConfigMock = jest.fn(() => () => {});

jest.mock('@o3r/schematics', () => ({
  ...jest.requireActual('@o3r/schematics'),
  createSchematicWithMetricsIfInstalled: jest.fn((schematicFn) => schematicFn),
  setupDependencies: setupDependenciesMock
}));
jest.mock('./vscode/index', () => ({
  updateVscode: updateVscodeMock
}));
jest.mock('./eslint/index', () => ({
  updateEslintConfig: updateEslintConfigMock
}));

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');

describe('ng add eslint-config', () => {
  beforeEach(() => {
    setupDependenciesMock.mockClear();
    updateVscodeMock.mockClear();
    updateEslintConfigMock.mockClear();
  });

  it('should run add on workspace', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    await runner.runSchematic('ng-add', {}, Tree.empty());
    expect(setupDependenciesMock).toHaveBeenCalledWith(expect.objectContaining({
      dependencies: expect.objectContaining({
        '@o3r/eslint-plugin': expect.objectContaining({}),
        '@stylistic/eslint-plugin': expect.objectContaining({}),
        'angular-eslint': expect.objectContaining({}),
        eslint: expect.objectContaining({}),
        'eslint-plugin-jsdoc': expect.objectContaining({}),
        'eslint-plugin-prefer-arrow': expect.objectContaining({}),
        'eslint-plugin-unicorn': expect.objectContaining({}),
        globby: expect.objectContaining({}),
        'jsonc-eslint-parser': expect.objectContaining({}),
        'typescript-eslint': expect.objectContaining({})
      }),
      ngAddToRun: expect.arrayContaining(['@o3r/eslint-plugin'])
    }));
    expect(updateVscodeMock).toHaveBeenCalled();
    expect(updateEslintConfigMock).toHaveBeenCalledTimes(1);
  });

  it('should run add on project', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const initialTree = Tree.empty();
    initialTree.create('angular.json', JSON.stringify({
      projects: {

        'project-test': {
          root: 'project-test'
        }
      }
    }, null, 2));

    await runner.runSchematic('ng-add', { projectName: 'project-test' }, initialTree);
    expect(setupDependenciesMock).toHaveBeenCalled();
    expect(updateVscodeMock).toHaveBeenCalled();
    expect(updateEslintConfigMock).toHaveBeenCalledTimes(2);
    expect(updateEslintConfigMock).toHaveBeenCalledWith();
    expect(updateEslintConfigMock).toHaveBeenCalledWith(false);
  });
});
