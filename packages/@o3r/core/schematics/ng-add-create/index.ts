import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import {
  createSchematicWithMetricsIfInstalled,
  findConfigFileRelativePath,
  getPackageManagerRunner
} from '@o3r/schematics';
import type {
  PackageJson
} from 'type-fest';
import {
  NgGenerateUpdateSchematicsSchema
} from './schema';

/**
 * Rule factory to include `ng add` skeleton
 * @param options
 */
function updateTemplatesFn(options: NgGenerateUpdateSchematicsSchema): Rule {
  const targetPath = options.path ? path.posix.join('/', options.path) : '/';
  const packageJsonPath = path.posix.join(targetPath, 'package.json');

  return (tree: Tree, context: SchematicContext) => {
    // register scripts
    if (tree.exists(packageJsonPath)) {
      const packageJson: PackageJson = JSON.parse(tree.read(packageJsonPath)!.toString());
      if (!packageJson.devDependencies?.['@angular/cli'] && !packageJson.devDependencies?.['@angular/core']) {
        context.logger.info('You are not in an angular project. Ng add skeleton creation aborted.');
        return tree;
      }
      const o3rCorePackageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      const o3rCorePackageJson: PackageJson & { generatorDependencies?: Record<string, string> } = JSON.parse(fs.readFileSync(o3rCorePackageJsonPath).toString());
      // prepare needed deps for schematics
      const angularVersion = packageJson.devDependencies?.['@angular/cli'] || packageJson.devDependencies?.['@angular/core'];
      const otterVersion = o3rCorePackageJson.dependencies!['@o3r/schematics'];
      const packageManagerRunner = getPackageManagerRunner();
      packageJson.scripts ||= {};
      packageJson.scripts['build:schematics'] = `tsc -b tsconfig.builders.json --pretty && ${packageManagerRunner} cpy 'schematics/**/*.json' dist/schematics && ${packageManagerRunner} cpy 'collection.json' dist`;
      // eslint-disable-next-line @typescript-eslint/dot-notation, dot-notation
      packageJson['schematics'] = './collection.json';
      packageJson.peerDependencies ||= {};
      packageJson.peerDependencies['@angular-devkit/schematics'] = angularVersion;
      packageJson.peerDependencies['@angular-devkit/core'] = angularVersion;
      packageJson.peerDependencies['@o3r/schematics'] = otterVersion;
      packageJson.peerDependenciesMeta ||= {};
      packageJson.peerDependenciesMeta['@angular-devkit/schematics'] = { optional: true };
      packageJson.peerDependenciesMeta['@angular-devkit/core'] = { optional: true };
      packageJson.peerDependenciesMeta['@schematics/angular'] = { optional: true };
      packageJson.peerDependenciesMeta['@o3r/schematics'] = { optional: true };
      packageJson.devDependencies['@angular-devkit/schematics'] = angularVersion;
      packageJson.devDependencies['@angular-devkit/core'] = angularVersion;
      packageJson.devDependencies['@o3r/schematics'] = otterVersion;
      packageJson.devDependencies['cpy-cli'] = o3rCorePackageJson.generatorDependencies!['cpy-cli'];

      tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    // generate skeleton
    const featureName = options.name || path.basename(process.cwd());
    const templateSource = apply(url('./templates'), [
      template({
        featureName,
        tsconfigBuildPath: findConfigFileRelativePath(tree, ['tsconfig.build.json', 'tsconfig.base.json', 'tsconfig.json'], targetPath)
      }),
      renameTemplateFiles(),
      move(targetPath)
    ]);

    const rule = mergeWith(templateSource, MergeStrategy.AllowCreationConflict);
    return rule(tree, context);
  };
}

/**
 * Rule factory to include `ng add` skeleton
 * @param options
 */
export const updateTemplates = createSchematicWithMetricsIfInstalled(updateTemplatesFn);

/**
 * add a new ngUpdate function
 * @param options
 */
function ngAddCreateFn(options: NgGenerateUpdateSchematicsSchema): Rule {
  return chain([
    updateTemplates(options)
  ]);
}

/**
 * add a new ngUpdate function
 * @param options
 */
export const ngAddCreate = createSchematicWithMetricsIfInstalled(ngAddCreateFn);
