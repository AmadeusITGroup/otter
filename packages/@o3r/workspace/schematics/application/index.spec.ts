import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as fs from 'node:fs';
import * as path from 'node:path';

jest.mock('@o3r/schematics', () => ({
  setupDependencies: jest.fn().mockReturnValue((tree: any) => tree),
  getPackagesBaseRootFolder: jest.fn().mockReturnValue('/projects'),
  getWorkspaceConfig: jest.fn().mockReturnValue({ projects: {} }),
  isNxContext: jest.fn().mockReturnValue(false),
  createSchematicWithMetricsIfInstalled: jest.fn().mockImplementation((fn: any) => fn)
}));

jest.mock('@angular-devkit/schematics', () => {
  const originalModule = jest.requireActual('@angular-devkit/schematics');
  return {
    ...originalModule,
    externalSchematic: jest.fn().mockImplementation(() => (tree: Tree) => tree),
    schematic: jest.fn().mockImplementation(() => (tree: Tree) => tree)
  };
});

const collectionPath = path.join(__dirname, '../../collection.json');
let runner: SchematicTestRunner;

describe('generateApplication', () => {
  let initalTree: UnitTestTree;

  beforeEach(() => {
    initalTree = new UnitTestTree(Tree.empty());
    initalTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initalTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    runner = new SchematicTestRunner('schematics', collectionPath);
    const angularPackageJson = require.resolve('@schematics/angular/package.json');
    runner.registerCollection('@schematics/angular', path.resolve(path.dirname(angularPackageJson), require(angularPackageJson).schematics));
  });

  it('should generate an application', async () => {
    const tree = await runner.runSchematic('application', { name: 'test', routing: true }, initalTree);
    const mockExternalSchematic = require('@angular-devkit/schematics').externalSchematic as jest.Mock;
    expect(mockExternalSchematic).toHaveBeenCalledWith('@schematics/angular', 'application', expect.objectContaining({
      name: 'test',
      routing: true,
      projectRoot: '/projects/test',
      style: 'scss'
    }));
    ['/angular.json', '/package.json', '/projects/test/package.json'].forEach(filePath => {
      expect(tree.files).toContain(filePath);
    });
  });

  it('should generate an application with provided path', async () => {
    const tree = await runner.runSchematic('application', { name: 'test', path: '/apps' }, initalTree);
    const mockExternalSchematic = require('@angular-devkit/schematics').externalSchematic as jest.Mock;
    expect(mockExternalSchematic).toHaveBeenCalledWith('@schematics/angular', 'application', expect.objectContaining({
      name: 'test',
      projectRoot: '/apps/test',
      style: 'scss'
    }));
    ['/angular.json', '/package.json', '/apps/test/package.json'].forEach(filePath => {
      expect(tree.files).toContain(filePath);
    });
  });

  it('should throw error if NX context is detected', async () => {
    require('@o3r/schematics').isNxContext.mockReturnValueOnce(true);
    await expect(runner.runSchematic('application', { name: 'test' }, initalTree)).rejects.toThrow(
      'NX is not currently supported. Feature tracked via https://github.com/AmadeusITGroup/otter/issues/720');
  });

  it('should throw error if no workspace configuration is found', async () => {
    require('@o3r/schematics').getWorkspaceConfig.mockReturnValueOnce(null);
    await expect(runner.runSchematic('application', { name: 'test' }, initalTree)).rejects.toThrow(
      'The `path` option is not provided and no workspace configuration file found to define it.');
  });

});
