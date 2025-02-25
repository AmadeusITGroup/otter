import {
  Tree,
} from '@angular-devkit/schematics';
import {
  isUsingFlatConfig,
} from './linter';

describe('isUsingFlatConfig', () => {
  const filenames = [
    'eslint.config.js',
    'eslint.config.ts',
    'eslint.config.mjs',
    'eslint.config.cjs',
    'eslint.config.mts',
    'eslint.config.cts'
  ];

  filenames.forEach((filename) => {
    it(`should return true for ${filename}`, () => {
      const tree = Tree.empty();
      tree.create(filename, '');
      expect(isUsingFlatConfig(tree)).toBe(true);
    });
  });

  it('should return false if no matching eslint config file is found', () => {
    const tree = Tree.empty();
    tree.create('otherfile.txt', '');
    tree.create('anotherfile.md', '');
    expect(isUsingFlatConfig(tree)).toBe(false);
  });

  it('should return false if the eslint config file does not match the pattern', () => {
    const tree = Tree.empty();
    tree.create('eslint.config.json', '');
    tree.create('eslint.config.yaml', '');
    expect(isUsingFlatConfig(tree)).toBe(false);
  });
});
