import type { Tree } from '@angular-devkit/schematics';

/**
 * Add patterns to .gitignore file
 * @param tree Schematics files tree
 * @param patternsToAdd List of patterns with description to add to gitignore files
 */
export function ignorePatterns(tree: Tree, patternsToAdd: {description?: string; patterns: string[]}[]) {
  if (tree.exists('/.gitignore')) {

    let gitIgnoreFile = tree.read('/.gitignore')!.toString();
    let found = false;

    patternsToAdd
      .map(({ description, patterns }) => ({description, patterns: patterns.filter((pattern) => new RegExp('^' + pattern.replace(/([*/\\.])/g, '\\$1')).test(gitIgnoreFile))}))
      .filter(({ patterns }) => patterns.length)
      .forEach(({ description, patterns }) => {
        found = true;
        gitIgnoreFile = gitIgnoreFile + `\n# ${description!}\n${patterns.join('\n')}\n`;
      });

    if (found) {
      tree.overwrite('/.gitignore', gitIgnoreFile);
    }
  }

  return tree;
}
