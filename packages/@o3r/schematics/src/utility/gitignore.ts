import type {
  Tree
} from '@angular-devkit/schematics';

/**
 * Add patterns to .gitignore file
 * @param tree Schematics files tree
 * @param patternsToAdd List of patterns with description to add to gitignore files
 */
export function ignorePatterns(tree: Tree, patternsToAdd: { description?: string; patterns: string[] }[]) {
  const gitIgnoreFileName = '/.gitignore';
  const isGitIgnorePresent = tree.exists(gitIgnoreFileName);
  let gitIgnoreFileContent = isGitIgnorePresent ? tree.readText(gitIgnoreFileName) : '';

  const filteredPatternsToAdd = patternsToAdd
    .map(({ description, patterns }) => ({ description, patterns: patterns.filter((pattern) => !new RegExp('^' + pattern.replace(/([*./\\])/g, '\\$1')).test(gitIgnoreFileContent)) }))
    .filter(({ patterns }) => patterns.length);

  if (filteredPatternsToAdd.length === 0) {
    return tree;
  }

  gitIgnoreFileContent += '\n' + filteredPatternsToAdd
    .map(({ description, patterns }) =>
      (description ? `# ${description}\n` : '')
      + patterns.join('\n')
    )
    .join('\n');

  if (isGitIgnorePresent) {
    tree.overwrite(gitIgnoreFileName, gitIgnoreFileContent);
    return tree;
  }

  tree.create(gitIgnoreFileName, gitIgnoreFileContent);
  return tree;
}
