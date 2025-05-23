import {
  readFileSync,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  updateJestConfigCoveragePathIgnorePatterns,
} from './coverage-ignore';

describe('updateJestConfigCoveragePathIgnorePatterns', () => {
  const mock = readFileSync(resolve(__dirname, '..', '..', '..', '..', 'testing', 'mocks', 'jest-config', 'mock.jest.config.js'), { encoding: 'utf8' });
  const resultContent = readFileSync(resolve(__dirname, '..', '..', '..', '..', 'testing', 'mocks', 'jest-config', 'result.jest.config.js'), { encoding: 'utf8' });

  beforeEach(() => {
    jest.resetModules();
  });

  test('should not touch other files', async () => {
    const tree = Tree.empty();
    tree.create('other.js', mock);
    await updateJestConfigCoveragePathIgnorePatterns(tree, { logger: { info: jest.fn() } } as any);
    expect(tree.readText('other.js')).toBe(mock);
  });

  test('should update jest.config.js', async () => {
    const tree = Tree.empty();
    tree.create('jest.config.js', mock);
    const context = { logger: { info: jest.fn(), warn: jest.fn() } } as any;
    await updateJestConfigCoveragePathIgnorePatterns(tree, context);
    expect(context.logger.warn).not.toHaveBeenCalled();
    expect(tree.readText('jest.config.js')).toBe(resultContent);
  });
});
