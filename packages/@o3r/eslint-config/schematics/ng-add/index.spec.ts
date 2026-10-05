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

jest.mock('@o3r/schematics', () => ({
  ...jest.requireActual<typeof import('@o3r/schematics')>('@o3r/schematics'),
  createOtterSchematic: jest.fn((schematicFn) => schematicFn)
}));
jest.mock('./vscode/index', () => ({
  updateVscode: jest.fn(() => {})
}));
jest.mock('./eslint/index', () => ({
  updateEslintConfig: jest.fn(() => () => {})
}));

const mockUpdateVscode = jest.requireMock('./vscode/index').updateVscode as jest.Mock;
const mockUpdateEslintConfig = jest.requireMock('./eslint/index').updateEslintConfig as jest.Mock;

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');
const emptyPackageJson = JSON.stringify({
  name: 'test',
  dependencies: {},
  peerDependencies: {},
  devDependencies: {}
});

describe('ng add eslint-config', () => {
  beforeEach(() => {
    mockUpdateVscode.mockClear();
    mockUpdateEslintConfig.mockClear();
  });

  it('should run add on workspace', async () => {
    const initialTree = Tree.empty();
    initialTree.create('package.json', emptyPackageJson);
    const runner = new SchematicTestRunner('schematics', collectionPath);
    await runner.runSchematic('ng-add', {}, initialTree);
    expect(mockUpdateVscode).toHaveBeenCalled();
    expect(mockUpdateEslintConfig).toHaveBeenCalledTimes(1);

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
    expect(mockUpdateVscode).toHaveBeenCalled();
    expect(mockUpdateEslintConfig).toHaveBeenCalledTimes(2);
    expect(mockUpdateEslintConfig).toHaveBeenCalledWith(__dirname);
    expect(mockUpdateEslintConfig).toHaveBeenCalledWith(__dirname, 'project-test');
  });
});
