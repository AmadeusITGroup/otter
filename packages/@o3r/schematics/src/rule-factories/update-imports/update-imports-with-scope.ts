import {
  Rule,
  SchematicContext,
  Tree
} from '@angular-devkit/schematics';
import {
  getFilesFromRootOfWorkspaceProjects,
  getFilesWithExtensionFromTree
} from '../../utility/index';
import {
  listOfExposedElements,
  SassImportExposedElement
} from './list-of-vars';

const imports = new RegExp(/^@import\s+["']~?@(o3r|otter)\/styling.*\s*/, 'gm');

/**
 * Update SASS imports to use a scoped dependency
 * @param alias The name of the otter styling package
 * @param dependencyName The name of the dependency to update imports on
 * @param exposedElements The list of exposed elements
 * @param fromRoot Perform on all files in project
 */
export function updateSassImports(alias: string, dependencyName = '@o3r/styling', exposedElements: SassImportExposedElement[] = listOfExposedElements, fromRoot = false): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const files = fromRoot ? getFilesWithExtensionFromTree(tree, 'scss') : getFilesFromRootOfWorkspaceProjects(tree, 'scss');
    files.forEach((file) => {
      let content = tree.read(file)!.toString();
      if (content.match(imports)) {
        const contentWithoutImports = content.replace(imports, '');
        content = `@use '${dependencyName}' as ${alias};\n${contentWithoutImports}`;
        exposedElements.forEach((elem) => {
          const elemRegex = new RegExp(`(?<![\\w\\d-]|o3r\\.)${elem.type === 'var' ? '\\' : ''}${elem.value}((?![\\w\\d-])(?!(\\s*\\:)))`, 'g');
          content = content.replace(elemRegex, `${alias}.${(elem.replacement || elem.value)}`);
        });
        tree.overwrite(file, content);
      }
    });

    return tree;
  };
}
