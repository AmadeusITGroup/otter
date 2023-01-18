import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getFilesFromWorkspaceProjects } from '@o3r/schematics';

/**
 * Update Sass files to support cssvar in Material design components
 */
export function updateTypographiesCSSVar(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const files = getFilesFromWorkspaceProjects(tree, 'scss');

    files
      .forEach((file) => {
        const content = tree.read(file)!.toString()
          .replace(/apply-theme\(\$theme\);/, 'apply-theme($theme);\n@include apply-typography($typography);')
          .replace(/mat-core\(\$typography\)/, 'mat-core(mat-typography-to-otter($typography))')
          .replace(/angular-material-typography\(\$typography\)/, 'angular-material-typography(mat-typography-to-otter($typography))')
          .replace(/@import '~@otter\/styling\/scss\/typography\/functions';/, '@import \'~@otter/styling/scss/typography/functions\';\n@import \'~@otter/styling/scss/typography/mixins\';');
        tree.overwrite(file, content);
      });

    return tree;
  };
}
