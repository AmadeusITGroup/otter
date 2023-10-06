import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

/**
 * Generic basic updates to be done on a repository
 */
export function genericUpdates(): Rule {

  const updateGitIgnore = (tree: Tree, _context: SchematicContext) => {
    // update gitignore
    if (tree.exists('/.gitignore')) {
      let gitignore = tree.readText('/.gitignore');
      const foldersToExclude = ['node_modules', 'dist'];
      const foldersToExcludeRegExp = new RegExp(`(\r\n|\n)/(${foldersToExclude.join('|')})(\r\n|\n)`, 'gm');
      gitignore = gitignore.replaceAll(foldersToExcludeRegExp, '$1$2$3');
      foldersToExclude.forEach(folderToExclude => {
        if (!gitignore.includes(folderToExclude)) {
          gitignore +=
            `
${folderToExclude}
        `;
        }
      });
      tree.overwrite('/.gitignore', gitignore);
    }
    return tree;
  };

  return updateGitIgnore;

}
