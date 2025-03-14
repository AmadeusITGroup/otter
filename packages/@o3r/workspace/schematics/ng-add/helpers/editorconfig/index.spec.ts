import {
  Tree,
} from '@angular-devkit/schematics';
import {
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import {
  generateEditorConfig,
} from './index';

describe('generateEditorConfig', () => {
  const mergeWith = jest.fn();
  jest.mock('@angular-devkit/schematics', () => ({
    apply: jest.fn(),
    MergeStrategy: jest.fn(),
    mergeWith,
    renameTemplateFiles: jest.fn(),
    Rule: jest.fn(),
    SchematicContext: jest.fn(),
    template: jest.fn(),
    Tree: jest.fn(),
    url: jest.fn()
  }));

  jest.mock('@o3r/schematics', () => ({
    getPackageManager: jest.fn()
  }));

  beforeEach(() => jest.resetAllMocks());

  test('should skip if a config already exists', async () => {
    const context: any = { logger: { info: jest.fn() } };
    const tree = new UnitTestTree(Tree.empty());
    tree.create('.editorconfig', 'root: true');
    await generateEditorConfig()(tree, context);

    expect(context.logger.info).toHaveBeenCalled();
  });

  test('should create the config file', async () => {
    const context: any = { logger: { info: jest.fn() } };
    const tree = new UnitTestTree(Tree.empty());
    await generateEditorConfig()(tree, context);

    expect(context.logger.info).not.toHaveBeenCalled();
  });
});
