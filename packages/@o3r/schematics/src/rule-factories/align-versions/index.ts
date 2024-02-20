import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {findFilesInTree} from '@o3r/schematics';

/**
 * Update the dependencies versions in the tree to align them with the root package.json
 * @param packagesToAlign
 */
export function alignVersions(packagesToAlign: (string | RegExp)[]): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const packageJsonMatcher = /package.json$/;
    const rootPackageJson = tree.readText('package.json');

    const files = findFilesInTree(tree.getDir('/'), (filePath) => packageJsonMatcher.test(filePath))
      .filter((fileEntry) => !/^\/package.json$/.test(fileEntry.path));
    if (!files.length) {
      return tree;
    }

    const packagesToReplace = packagesToAlign
      .flatMap((input) => {
        const output: {packageName: string; version: string}[] = [];
        const packageMatcher = new RegExp(`"(${typeof input === 'string' ? input : input.toString().replace(/^\/|\/\w*$/g, '')})"\\s*:\\s*"([^"]*)"`, 'g');
        let result;
        while ((result = packageMatcher.exec(rootPackageJson))) {
          const [, packageName, version] = result;
          output.push({packageName, version});
        }
        return output;
      });

    packagesToReplace.forEach(({packageName, version}) => {
      const packageMatcher = new RegExp(`"${packageName}"\\s*:\\s*"[^"]*"`);
      files.forEach((fileEntry) => {
        tree.overwrite(fileEntry.path, tree.readText(fileEntry.path).replace(packageMatcher, `"${packageName}": "${version}"`));
      });
    });
    return tree;
  };
}
