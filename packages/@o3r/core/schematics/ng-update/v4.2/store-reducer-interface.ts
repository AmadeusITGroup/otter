import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getSourceFilesFromWorkspaceProjects } from '@o3r/schematics';

/**
 * Remove On interface from reducer which is not exposed anymore by NgRX
 *
 * @param _options
 * @param _options.projectName
 */
export function updateStoreReducerInterface(_options?: { projectName?: string | null | undefined }): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const files = getSourceFilesFromWorkspaceProjects(tree);

    files
      .filter((file) => /reducer\.ts$/.test(file))
      .forEach((file) => {
        const content = tree.read(file)!.toString()
          .replace(/^(import\s.*)On(.*@ngrx\/store.*)/m, '$1ReducerTypes, ActionCreator$2')
          .replace(/On<([^>]*)>\s*\[\]/, 'ReducerTypes<$1, ActionCreator[]>[]');
        tree.overwrite(file, content);
      });

    return tree;
  };
}
