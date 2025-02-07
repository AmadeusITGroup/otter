import type {
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  getPackageManager,
  WorkspaceSchema,
} from '@o3r/schematics';

/**
 * Update git ignore of the repository
 * @param workspaceConfig
 */
export function updateGitIgnore(workspaceConfig?: WorkspaceSchema | null): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    // update gitignore
    if (tree.exists('/.gitignore')) {
      let gitignore = tree.readText('/.gitignore');
      const foldersToExclude = ['node_modules', 'dist'];
      const foldersToExcludeRegExp = new RegExp(`(\r\n|\n)/(${foldersToExclude.join('|')})(\r\n|\n)`, 'gm');
      gitignore = gitignore.replaceAll(foldersToExcludeRegExp, '$1$2$3');
      foldersToExclude.forEach((folderToExclude) => {
        if (!gitignore.includes(folderToExclude)) {
          gitignore
            += `
${folderToExclude}
        `;
        }
      });
      const packageManager = getPackageManager({ workspaceConfig });
      if (packageManager === 'yarn') {
        gitignore += `

### yarn ###
# https://yarnpkg.com/getting-started/qa#which-files-should-be-gitignored

.yarn/*
!.yarn/releases
!.yarn/patches
!.yarn/plugins
!.yarn/sdks
!.yarn/versions

# if you are NOT using Zero-installs, then:
# comment the following lines
# !.yarn/cache

# and uncomment the following lines
.pnp.*

`;
      }
      tree.overwrite('/.gitignore', gitignore);
    }
    return tree;
  };
}
