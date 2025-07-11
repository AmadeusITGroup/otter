import {
  Tree,
} from '@angular-devkit/schematics';
import {
  isUsingLegacyConfig,
} from './index';

const eslintPackageJson = 'eslint/package.json';

describe('isUsingLegacyConfig', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should return true if a legacy ESLint config file is found', () => {
    jest.mock(eslintPackageJson, () => ({}), { virtual: true });
    const tree = Tree.empty();
    tree.create('.eslintrc.json', '');
    expect(isUsingLegacyConfig(tree)).toBe(true);
  });

  it('should return false if no legacy ESLint config file is found', () => {
    jest.mock(eslintPackageJson, () => ({}), { virtual: true });
    const tree = Tree.empty();
    tree.create('otherfile.txt', '');
    expect(isUsingLegacyConfig(tree)).toBe(false);
  });

  it('should return false if the eslint package is not installed', () => {
    jest.mock(eslintPackageJson, () => {
      throw new Error('Cannot find module');
    }, { virtual: true });
    const tree = Tree.empty();
    expect(isUsingLegacyConfig(tree)).toBe(false);
  });

  it('should return true for various legacy ESLint config file extensions', () => {
    jest.mock(eslintPackageJson, () => ({}), { virtual: true });
    const filenames = ['.eslintrc.json', '.eslintrc.js', '.eslintrc.yaml', '.eslintrc.yml'];
    filenames.forEach((filename) => {
      const tree = Tree.empty();
      tree.create(filename, '');
      expect(`${filename}:${isUsingLegacyConfig(tree)}`).toBe(`${filename}:true`);
    });
  });
});
