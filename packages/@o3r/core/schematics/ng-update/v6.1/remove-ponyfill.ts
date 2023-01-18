import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getMainFilePath } from '@o3r/schematics';
import { removePackageJsonDependency } from '@schematics/angular/utility/dependencies';

/**
 * Remove the ponyfill from the project
 */
export function removePonyfill(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const mainModulePath = getMainFilePath(tree, context);
    if (!mainModulePath || !tree.exists(mainModulePath)) {
      return tree;
    }

    let mainModule = tree.read(mainModulePath)!.toString();
    mainModule = mainModule
      .replace(/cssVars\s*\(([^)])+\);?[\n\r]*/, '')
      .replace(/import [^"']+["']css-vars-ponyfill["'];?[\n\r]*/, '');

    tree.overwrite(mainModulePath, mainModule);

    removePackageJsonDependency(tree, 'css-vars-ponyfill');

    return tree;
  };
}
