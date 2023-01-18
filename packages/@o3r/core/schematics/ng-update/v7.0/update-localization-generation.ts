import { Rule, Tree } from '@angular-devkit/schematics';
import { getProjectFromTree, readPackageJson } from '@o3r/schematics';

/**
 * Update Localization generation script to remove the "-c" option from "ng run"
 */
export function updateLocalizationGeneration(): Rule {
  return (tree: Tree) => {
    const workspaceProject = getProjectFromTree(tree);
    const packageJson = readPackageJson(tree, workspaceProject);
    if (packageJson.scripts) {
      if (packageJson.scripts.build) {
        packageJson.scripts.build = packageJson.scripts.build.replace('generate:translations -c production', 'generate:translations');
      }

      const projectNameMatch = /ng run ([^ ]+):generate-translations/.exec(packageJson.scripts?.['generate:translations'] || '');
      if (projectNameMatch && projectNameMatch[1]) {
        packageJson.scripts['generate:translations:dev'] = packageJson.scripts['generate:translations'];
        packageJson.scripts['generate:translations'] = `ng run ${projectNameMatch[1]}:generate-translations:production`;
      }
    }

    return tree.overwrite(`${workspaceProject.root}/package.json`, JSON.stringify(packageJson, null, 2) + '\n');
  };
}
