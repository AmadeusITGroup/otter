import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getFilesFromRootOfWorkspaceProjects } from '@o3r/schematics';
import { listOfExposedElements } from './list-of-vars';

const imports = new RegExp(/^@import\s+['"]~?@(o3r|otter)\/styling.*\s*/, 'gm');

/**
 * Update o3r imports to use scoped o3r/styling
 *
 * @param alias The name of the otter styling package
 */
export function updateO3rImports(alias: string): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const files = getFilesFromRootOfWorkspaceProjects(tree, 'scss');
    files
      .forEach((file) => {
        let content = tree.read(file)!.toString();
        if (content.match(imports)) {
          const contentWithoutImports = content.replace(imports, '');
          content = `@use '@o3r/styling' as ${alias};\n${contentWithoutImports}`;
          listOfExposedElements.forEach(elem => {
            const elemRegex = new RegExp(`(?<![\\w\\d-])${elem.type === 'var' ? '\\' : ''}${elem.value}((?![\\w\\d-])(?!(\\s*\\:)))`, 'g');
            content = content.replace(elemRegex, `${alias}.${(elem.replacement || elem.value)}`);
          });
          tree.overwrite(file, content);
        }
      });

    return tree;
  };
}
