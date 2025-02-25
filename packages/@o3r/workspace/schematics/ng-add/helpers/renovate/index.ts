import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  apply,
  MergeStrategy,
  mergeWith,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  getPackageManager,
  getTemplateFolder,
} from '@o3r/schematics';
import type {
  PackageJson,
} from 'type-fest';

/**
 * Add renovate configuration to Otter application
 * @param rootPath @see RuleFactory.rootPath
 */
export function generateRenovateConfig(rootPath: string): Rule {
  const ownPackageJsonContent = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', '..', '..', 'package.json'), { encoding: 'utf8' })) as PackageJson;

  return (tree: Tree, context: SchematicContext) => {
    if (tree.exists('.renovaterc.json')) {
      return tree;
    }
    const templateSource = apply(url(getTemplateFolder(rootPath, __dirname)), [
      template({
        dot: '.',
        version: ownPackageJsonContent.version,
        packageManager: getPackageManager()
      }),
      renameTemplateFiles()
    ]);

    const rule = mergeWith(templateSource, MergeStrategy.Overwrite);
    return rule(tree, context);
  };
}
