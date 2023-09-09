import type { Rule } from '@angular-devkit/schematics';
import { posix } from 'node:path';
import type { PackageJson } from 'type-fest';

/**
 * Clean files generated to standalone SDK
 * @param targetPath Path where the SDK has been generated
 */
export function cleanStandaloneFiles(targetPath: string): Rule {
  return (tree) => {
    tree.delete(posix.join(targetPath, '.renovaterc.json'));
    tree.delete(posix.join(targetPath, '.vscode', 'settings.json'));
    tree.delete(posix.join(targetPath, '.editorconfig'));
    tree.delete(posix.join(targetPath, '.versionrc.json'));
    tree.delete(posix.join(targetPath, '.commitlintrc.json'));
    tree.delete(posix.join(targetPath, 'CONTRIBUTING.md'));
    tree.delete(posix.join(targetPath, '.husky', 'commit-msg'));
    tree.delete(posix.join(targetPath, '.husky', 'pre-commit'));

    const packageJson = tree.readJson(posix.join(targetPath, 'package.json')) as PackageJson;
    if (packageJson.scripts?.postinstall) {
      delete packageJson.scripts.postinstall;
    }
    tree.overwrite(posix.join(targetPath, 'package.json'), JSON.stringify(packageJson, null, 2));
    return tree;
  };
}
