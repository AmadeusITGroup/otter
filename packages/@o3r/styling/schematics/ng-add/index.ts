import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { NgAddSchematicsSchema } from './schema';

/**
 * Add Otter styling to an Angular Project
 * Update the styling if the app/lib used otter v7
 *
 * @param options for the dependency installations
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    try {
      const {
        getO3rPeerDeps,
        getProjectDepType,
        ngAddPackages,
        ngAddPeerDependencyPackages,
        removePackages,
        registerPackageCollectionSchematics,
        setupSchematicsDefaultParams,
        updateSassImports
      } = await import('@o3r/schematics');
      const {updateThemeFiles, removeV7OtterAssetsInAngularJson} = await import('./theme-files');
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const {NodeDependencyType} = await import('@schematics/angular/utility/dependencies');
      const depsInfo = getO3rPeerDeps(packageJsonPath);
      const dependencyType = getProjectDepType(tree);
      return () => chain([
        removePackages(['@otter/styling']),
        updateSassImports('o3r'),
        updateThemeFiles(__dirname),
        removeV7OtterAssetsInAngularJson(options),
        ngAddPackages(depsInfo.o3rPeerDeps, {
          skipConfirmation: true,
          version: depsInfo.packageVersion,
          parentPackageInfo: depsInfo.packageName,
          dependencyType
        }),
        registerPackageCollectionSchematics(JSON.parse(fs.readFileSync(packageJsonPath).toString())),
        setupSchematicsDefaultParams({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '@o3r/core:component': {
            useOtterTheming: null
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '@o3r/core:component-presenter': {
            useOtterTheming: null
          }
        }),
        ngAddPeerDependencyPackages(['chokidar'], packageJsonPath, NodeDependencyType.Dev, options, depsInfo.packageName)
      ])(tree, context);
    } catch (e) {
      // styling needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @o3r/styling has failed.
If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the styling package. Please run 'ng add @o3r/core' .
Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}
