import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

/**
 * Update renovate config to include all file changes
 */
export function updateRenovateConfig(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const renovatercPath = '/.renovaterc.json';
    if (!tree.exists(renovatercPath)) {
      return tree;
    }

    const renovatercContent = JSON.parse(tree.read(renovatercPath)!.toString());

    renovatercContent.packageRules.forEach((packageSetting: any) => {
      if (packageSetting.postUpgradeTasks && !packageSetting.postUpgradeTasks.fileFilters) {
        packageSetting.postUpgradeTasks.fileFilters = ['**'];
      }
    });

    const renovatercContentString = `${JSON.stringify(renovatercContent, null, 2)}\n`;

    tree.overwrite(renovatercPath, renovatercContentString);

    return tree;
  };
}
