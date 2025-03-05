import * as path from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import {
  firstValueFrom,
} from 'rxjs';
import {
  editPackageJson,
  generateCommitLintConfig,
  getCommitHookInitTask,
} from './index';

const collectionPath = path.join(__dirname, '..', '..', '..', '..', 'collection.json');

describe('getCommitHookInitTask', () => {
  let context: any;

  beforeEach(() => {
    context = {
      addTask: jest.fn().mockReturnValue({ id: 123 })
    };
  });

  test('should correctly register the tasks', () => {
    const runAfter = [{ id: 111 }];
    getCommitHookInitTask(context)(runAfter);

    expect(context.addTask).toHaveBeenNthCalledWith(1, expect.objectContaining({ script: 'husky init' }), runAfter);
    expect(context.addTask).toHaveBeenNthCalledWith(2, expect.objectContaining({ script: expect.stringMatching(/\.husky\/pre-commit/) }), [{ id: 123 }]);
    expect(context.addTask).toHaveBeenNthCalledWith(2, expect.objectContaining({ script: expect.stringMatching(/exec lint-stage/) }), [{ id: 123 }]);
  });
});

describe('generateCommitLintConfig', () => {
  const initialTree = new UnitTestTree(Tree.empty());
  const apply = jest.fn();
  jest.mock('@angular-devkit/schematics', () => ({
    apply,
    getTemplateFolder: jest.fn(),
    template: jest.fn(),
    renameTemplateFiles: jest.fn(),
    url: jest.fn(),
    mergeWith: jest.fn().mockReturnValue(initialTree)
  }));

  test('should generate template', () => {
    expect(() => generateCommitLintConfig()(initialTree, {} as any)).not.toThrow();
    expect(apply).not.toHaveBeenCalled();
  });
});

describe('editPackageJson', () => {
  let initialTree: UnitTestTree;

  beforeEach(() => {
    initialTree = new UnitTestTree(Tree.empty());
    initialTree.create('/package.json', '{}');
  });

  test('should add stage-lint if not present', async () => {
    const runner = new SchematicTestRunner(
      '@o3r/workspace',
      collectionPath
    );
    const tree = await firstValueFrom(runner.callRule(editPackageJson, initialTree));
    expect((tree.readJson('/package.json') as any)['lint-staged']).toBeDefined();
  });

  test('should not touche stage-lint if present', async () => {
    initialTree.overwrite('/package.json', '{"lint-staged": "test"}');
    const runner = new SchematicTestRunner(
      '@o3r/workspace',
      collectionPath
    );
    const tree = await firstValueFrom(runner.callRule(editPackageJson, initialTree));
    expect((tree.readJson('/package.json') as any)['lint-staged']).toBe('test');
  });
});
