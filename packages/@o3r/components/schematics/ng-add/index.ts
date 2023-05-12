import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as path from 'node:path';
import { NgAddSchematicsSchema } from './schema';

/**
 * Add Otter components to an Angular Project
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const {getO3rPeerDeps, getProjectDepType, ngAddPackages, ngAddPeerDependencyPackages, removePackages} = await import('@o3r/schematics');
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { NodeDependencyType } = await import('@schematics/angular/utility/dependencies');
      const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      const depsInfo = getO3rPeerDeps(packageJsonPath);
      const dependencyType = getProjectDepType(tree);
      const rule = chain([
        removePackages(['@otter/components']),
        ngAddPackages(depsInfo.o3rPeerDeps, { skipConfirmation: true, version: depsInfo.packageVersion, parentPackageInfo: depsInfo.packageName, dependencyType }),
        ngAddPeerDependencyPackages(['chokidar'], packageJsonPath, NodeDependencyType.Dev, options, '@o3r/components - install builder dependency')
      ]);

      context.logger.info(`The package ${depsInfo.packageName!} comes with a debug mechanism`);
      context.logger.info('Get more information on the following page: https://github.com/AmadeusITGroup/otter/tree/main/docs/components/COMPONENT_STRUCTURE.md#Runtime-debugging');

      return () => rule(tree, context);
    } catch (e) {
      // components needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @o3r/components has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the components package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}
