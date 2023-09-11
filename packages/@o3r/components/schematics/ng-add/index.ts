import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { updateCmsAdapter } from '../cms-adapter';
import type { NgAddSchematicsSchema } from './schema';

/**
 * Add Otter components to an Angular Project
 *
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const {
        getDefaultOptionsForSchematic,
        getO3rPeerDeps,
        getProjectDepType,
        getWorkspaceConfig,
        ngAddPackages,
        ngAddPeerDependencyPackages,
        removePackages,
        registerPackageCollectionSchematics,
        getProjectRootDir
      } = await import('@o3r/schematics');
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { NodeDependencyType } = await import('@schematics/angular/utility/dependencies');
      options = {...getDefaultOptionsForSchematic(getWorkspaceConfig(tree), '@o3r/components', 'ng-add', options), ...options};
      const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf-8' }));
      const depsInfo = getO3rPeerDeps(packageJsonPath);
      if (options.enableMetadataExtract) {
        depsInfo.o3rPeerDeps = [...depsInfo.o3rPeerDeps , '@o3r/extractors'];
      }
      const dependencyType = getProjectDepType(tree);
      const workingDirectory = getProjectRootDir(tree, options.projectName);
      const rule = chain([
        removePackages(['@otter/components']),
        ngAddPackages(depsInfo.o3rPeerDeps, {
          skipConfirmation: true,
          version: depsInfo.packageVersion,
          parentPackageInfo: depsInfo.packageName,
          projectName: options.projectName,
          dependencyType,
          workingDirectory
        }),
        ngAddPeerDependencyPackages(['chokidar'], packageJsonPath, NodeDependencyType.Dev, {...options, workingDirectory, skipNgAddSchematicRun: true}, '@o3r/components - install builder dependency'),
        registerPackageCollectionSchematics(packageJson),
        ...(options.enableMetadataExtract ? [updateCmsAdapter(options)] : [])
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
