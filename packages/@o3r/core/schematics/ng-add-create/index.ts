import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getTemplateFolder } from '@o3r/schematics';
import * as path from 'node:path';
import * as fs from 'node:fs';
import type {PackageJson} from 'type-fest';

import { apply, MergeStrategy, mergeWith, renameTemplateFiles, template, url } from '@angular-devkit/schematics';
import { NgGenerateUpdateSchematicsSchema } from './schema';

/**
 * Rule factory to include `ng add` skeleton
 *
 * @param options
 * @param rootPath
 */
export function updateTemplates(options: NgGenerateUpdateSchematicsSchema, rootPath: string): Rule {

  return (tree: Tree, context: SchematicContext) => {

    // register scripts
    if (tree.exists('/package.json')) {
      const packageJson: PackageJson = JSON.parse(tree.read('/package.json')!.toString());
      if (!packageJson.devDependencies?.['@angular/cli']) {
        context.logger.info('You are not in an angular project. Ng add skeleton creation aborted.');
        return tree;
      }
      const o3rCorePackageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      const o3rCorePackageJson: PackageJson = JSON.parse(fs.readFileSync(o3rCorePackageJsonPath)!.toString());
      // prepare needed deps for schematics
      const angularVersion = packageJson.devDependencies['@angular/cli'];
      const otterVersion = o3rCorePackageJson.dependencies!['@o3r/schematics'];

      packageJson.scripts ||= {};
      packageJson.scripts['build:schematics'] = 'tsc -b tsconfig.builders.json --pretty && yarn cpy \'schematics/**/*.json\' dist/schematics && yarn cpy \'collection.json\' dist';
      // eslint-disable-next-line @typescript-eslint/dot-notation, dot-notation
      packageJson['schematics'] = './collection.json';
      packageJson.peerDependencies ||= {};
      packageJson.peerDependencies['@angular-devkit/schematics'] = angularVersion;
      packageJson.peerDependencies['@o3r/schematics'] = otterVersion;
      packageJson.peerDependenciesMeta ||= {};
      packageJson.peerDependenciesMeta['@angular-devkit/schematics'] = {optional: true};
      packageJson.peerDependenciesMeta['@o3r/schematics'] = {optional: true};
      packageJson.devDependencies['@angular-devkit/schematics'] = angularVersion;
      packageJson.devDependencies['@o3r/schematics'] = otterVersion;
      packageJson.devDependencies['cpy-cli'] = o3rCorePackageJson.devDependencies!['cpy-cli'];

      tree.overwrite('/package.json', JSON.stringify(packageJson, null, 2));
    }

    // generate skeleton
    const featureName = options.projectName || path.basename(process.cwd());
    const templateSource = apply(url(getTemplateFolder(rootPath, __dirname)), [
      template({
        featureName
      }),
      renameTemplateFiles()
    ]);

    const rule = mergeWith(templateSource, MergeStrategy.AllowCreationConflict);
    return rule(tree, context);
  };
}

/**
 * add a new ngUpdate function
 *
 * @param options
 */
export function ngAddCreate(options: NgGenerateUpdateSchematicsSchema): Rule {
  return chain([
    updateTemplates(options, __dirname)
  ]);
}
