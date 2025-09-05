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

const updateVscodeMock = jest.fn(() => {});
const updateEslintConfigMock = jest.fn(() => () => {});

jest.mock('@o3r/schematics', () => ({
  ...jest.requireActual('@o3r/schematics'),
  createOtterSchematic: jest.fn((schematicFn) => schematicFn)
}));
jest.mock('./vscode/index', () => ({
  updateVscode: updateVscodeMock
}));
jest.mock('./eslint/index', () => ({
  updateEslintConfig: updateEslintConfigMock
}));

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');
const emptyPackageJson = JSON.stringify({
  name: 'test',
  dependencies: {},
  peerDependencies: {},
  devDependencies: {}
});

describe('ng add eslint-config', () => {
  beforeEach(() => {
    updateVscodeMock.mockClear();
    updateEslintConfigMock.mockClear();
  });

  it('should run add on workspace', async () => {
    const initialTree = Tree.empty();
    initialTree.create('package.json', emptyPackageJson);
    const runner = new SchematicTestRunner('schematics', collectionPath);
    await runner.runSchematic('ng-add', {}, initialTree);
    expect(updateVscodeMock).toHaveBeenCalled();
    expect(updateEslintConfigMock).toHaveBeenCalledTimes(1);

    const packageJson = initialTree.readJson('package.json') as PackageJson;
    expect(packageJson.scripts.harmonize).toBe('eslint "**/package.json" .yarnrc.yml --quiet --fix --no-error-on-unmatched-pattern');
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

    await expect(runner.runSchematic('ng-add', {}, tree)).rejects.toThrow('Path "package.json" does not exist.');
  });

  it('should run add on project', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const initialTree = Tree.empty();
    initialTree.create('package.json', emptyPackageJson);
    initialTree.create('angular.json', JSON.stringify({
      projects: {
        'project-test': {
          root: 'project-test'
        }
      }
    }, null, 2));
    initialTree.create(path.join('project-test', 'package.json'), emptyPackageJson);

    await runner.runSchematic('ng-add', { projectName: 'project-test' }, initialTree);
    expect(updateVscodeMock).toHaveBeenCalled();
    expect(updateEslintConfigMock).toHaveBeenCalledTimes(2);
    expect(updateEslintConfigMock).toHaveBeenCalledWith(__dirname);
    expect(updateEslintConfigMock).toHaveBeenCalledWith(__dirname, 'project-test');
  });
});
