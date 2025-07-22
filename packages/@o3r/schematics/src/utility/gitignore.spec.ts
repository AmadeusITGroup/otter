import {
  Tree,
} from '@angular-devkit/schematics';
import {
  ignorePatterns,
} from './gitignore';

const gitIgnoreFileName = '/.gitignore';

describe('ignorePatterns', () => {
  it('should create the gitignore file', () => {
    const resultTree = ignorePatterns(Tree.empty(), [{
      description: 'description',
      patterns: ['pattern']
    }]);
    const gitIgnoreFileContent = resultTree.readText(gitIgnoreFileName);
    expect(gitIgnoreFileContent).toEqual(expect.stringContaining('# description'));
    expect(gitIgnoreFileContent).toEqual(expect.stringContaining('pattern'));
  });

  it('should modify the gitignore file', () => {
    const tree = Tree.empty();
    const previousGitIgnoreContent = 'previous content';
    tree.create(gitIgnoreFileName, previousGitIgnoreContent);
    const resultTree = ignorePatterns(tree, [{
      description: 'description',
      patterns: ['pattern']
    }]);
    const gitIgnoreFileContent = resultTree.readText(gitIgnoreFileName);
    expect(gitIgnoreFileContent).toEqual(expect.stringContaining(previousGitIgnoreContent));
    expect(gitIgnoreFileContent).toEqual(expect.stringContaining('# description'));
    expect(gitIgnoreFileContent).toEqual(expect.stringContaining('pattern'));
  });

  it('should not modify the gitignore file if pattern already present', () => {
    const tree = Tree.empty();
    const previousGitIgnoreContent = 'pattern';
    tree.create(gitIgnoreFileName, previousGitIgnoreContent);
    const resultTree = ignorePatterns(tree, [{
      description: 'description',
      patterns: ['pattern']
    }]);
    const gitIgnoreFileContent = resultTree.readText(gitIgnoreFileName);
    expect(gitIgnoreFileContent).toEqual(previousGitIgnoreContent);
  });
});
