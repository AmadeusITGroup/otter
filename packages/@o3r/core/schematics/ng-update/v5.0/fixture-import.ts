import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getFilesFromWorkspaceProjects } from '@o3r/schematics';

/** Update import path for the fixtures */
export function updateFixtureImport(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const files = getFilesFromWorkspaceProjects(tree, 'ts');
    files
      .forEach((file) => {
        const content = tree.read(file)!.toString()
          .replace(/from (['"])([^'"]*)fixtures\/fixtures(['"]);/g, 'from $1$2fixtures$3;');
        tree.overwrite(file, content);
      });

    return tree;
  };
}
