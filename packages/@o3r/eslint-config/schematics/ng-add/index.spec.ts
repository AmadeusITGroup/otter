import * as path from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
} from '@angular-devkit/schematics/testing';
import type {
  PackageJson,
} from 'type-fest';

const setupDependenciesMock = jest.fn(() => () => {});
const updateVscodeMock = jest.fn(() => {});
const updateEslintConfigMock = jest.fn(() => () => {});

jest.mock('@o3r/schematics', () => ({
  ...jest.requireActual('@o3r/schematics'),
  createOtterSchematic: jest.fn((schematicFn) => schematicFn),
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
    const tree = Tree.empty();
    tree.create('package.json', '{}');
    await runner.runSchematic('ng-add', {}, tree);
    expect(setupDependenciesMock).toHaveBeenCalledWith(expect.objectContaining({
      dependencies: expect.objectContaining({
        '@eslint-community/eslint-plugin-eslint-comments': expect.objectContaining({}),
        '@eslint/js': expect.objectContaining({}),
        '@o3r/eslint-plugin': expect.objectContaining({}),
        '@stylistic/eslint-plugin': expect.objectContaining({}),
        '@typescript-eslint/parser': expect.objectContaining({}),
        'angular-eslint': expect.objectContaining({}),
        eslint: expect.objectContaining({}),
        'eslint-import-resolver-node': expect.objectContaining({}),
        'eslint-import-resolver-typescript': expect.objectContaining({}),
        'eslint-plugin-import': expect.objectContaining({}),
        'eslint-plugin-import-newlines': expect.objectContaining({}),
        'eslint-plugin-jest': expect.objectContaining({}),
        'eslint-plugin-jsdoc': expect.objectContaining({}),
        'eslint-plugin-prefer-arrow': expect.objectContaining({}),
        // TODO: reactivate once https://github.com/nirtamir2/eslint-plugin-sort-export-all/issues/18 is fixed
        // 'eslint-plugin-sort-export-all': expect.objectContaining({}),
        'eslint-plugin-unicorn': expect.objectContaining({}),
        'eslint-plugin-unused-imports': expect.objectContaining({}),
        globby: expect.objectContaining({}),
        'jsonc-eslint-parser': expect.objectContaining({}),
        'typescript-eslint': expect.objectContaining({})
      }),
      ngAddToRun: expect.arrayContaining(['@o3r/eslint-plugin'])
    }));
    expect(updateVscodeMock).toHaveBeenCalled();
    expect(updateEslintConfigMock).toHaveBeenCalledTimes(1);

    const packageJson = tree.readJson('package.json') as PackageJson;
    expect(packageJson.scripts.harmonize).toBe("eslint '**/package.json' .yarnrc.yml --quiet --fix");
    expect(packageJson.scripts.postinstall).toContain('yarn harmonize && yarn install --mode=skip-build');
  });

  it('should not add harmonize script if it already exists', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = Tree.empty();
    tree.create('package.json', '{"scripts": {"harmonize": "do not touch"} }');
    await runner.runSchematic('ng-add', {}, tree);

    const packageJson = tree.readJson('package.json') as PackageJson;
    expect(packageJson.scripts.harmonize).toBe('do not touch');
    expect(packageJson.scripts.postinstall).not.toBeDefined();
  });

  it('should throw an exception if package.json does not exist', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = Tree.empty();

    await expect(runner.runSchematic('ng-add', {}, tree)).rejects.toThrow('Root package.json does not exist');
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
    initialTree.create('package.json', '{}');
    await runner.runSchematic('ng-add', { projectName: 'project-test' }, initialTree);
    expect(setupDependenciesMock).toHaveBeenCalled();
    expect(updateVscodeMock).toHaveBeenCalled();
    expect(updateEslintConfigMock).toHaveBeenCalledTimes(2);
    expect(updateEslintConfigMock).toHaveBeenCalledWith(__dirname);
    expect(updateEslintConfigMock).toHaveBeenCalledWith(__dirname, 'project-test');
  });
});
