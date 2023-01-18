import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getFilesFromWorkspaceProjects } from '@o3r/schematics';

/**
 * Update Sass files to support cssvar in Material design components
 */
export function updateSassFile(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const files = getFilesFromWorkspaceProjects(tree, 'scss');

    files
      .forEach((file) => {
        const content = tree.read(file)!.toString()
          .replace(/\$mat-theme: *generate-(.*)-theme/, '$meta-theme: generate-$1-theme')
          .replace(/\$theme: *mat-theme-to-otter\(\$mat-theme\)/, '$theme: meta-theme-to-otter($meta-theme) !default;\n$mat-theme: meta-theme-to-material($meta-theme)');
        tree.overwrite(file, content);
      });

    return tree;
  };
}
