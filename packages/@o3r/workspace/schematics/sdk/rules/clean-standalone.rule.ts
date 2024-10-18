import {
  posix
} from 'node:path';
import {
  chain,
  type Rule
} from '@angular-devkit/schematics';
import type {
  PackageJson
} from 'type-fest';

const deleteIfExists = (paths: string[]): Rule => (tree, context) => {
  paths.forEach((path) => {
    if (tree.exists(path)) {
      tree.delete(path);
    } else {
      context.logger.warn(`Tried to delete ${path} but file does not exist.`);
    }
  });
};

/**
 * Clean files generated to standalone SDK
 * @param targetPath Path where the SDK has been generated
 */
export function cleanStandaloneFiles(targetPath: string): Rule {
  return chain([
    deleteIfExists(
      [
        posix.join(targetPath, '.renovaterc.json'),
        posix.join(targetPath, '.vscode', 'settings.json'),
        posix.join(targetPath, '.editorconfig'),
        posix.join(targetPath, '.versionrc.json'),
        posix.join(targetPath, '.commitlintrc.json'),
        posix.join(targetPath, 'CONTRIBUTING.md')
      ]
    ),
    (tree) => {
      const packageJson = tree.readJson(posix.join(targetPath, 'package.json')) as PackageJson;
      if (packageJson.scripts) {
        const excludedScripts = ['postinstall', 'set:version'];
        packageJson.scripts = Object.fromEntries(
          Object.entries(packageJson.scripts).filter(([scriptName]) => !excludedScripts.includes(scriptName))
        );
      }
      if (packageJson.devDependencies) {
        packageJson.devDependencies = Object.fromEntries(Object.entries(packageJson.devDependencies).filter(([depName]) => depName !== '@o3r/workspace'));
      }
      tree.overwrite(posix.join(targetPath, 'package.json'), JSON.stringify(packageJson, null, 2));
      return tree;
    }
  ]);
}
