import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { createSchematicWithMetricsIfInstalled } from '@o3r/schematics';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { updateCmsAdapter } from '../cms-adapter';
import type { NgAddSchematicsSchema } from './schema';
import { registerDevtools } from './helpers/devtools-registration';
import { type DependencyToAdd, getPackageInstallConfig } from '@o3r/schematics';

/**
 * Add Otter components to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const {
        getDefaultOptionsForSchematic,
        getO3rPeerDeps,
        getProjectNewDependenciesTypes,
        getWorkspaceConfig,
        setupDependencies,
        removePackages,
        registerPackageCollectionSchematics
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

      const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
      const dependencies = depsInfo.o3rPeerDeps.reduce((acc, dep) => {
        acc[dep] = {
          inManifest: [{
            range: `~${depsInfo.packageVersion}`,
            types: getProjectNewDependenciesTypes(workspaceProject)
          }]
        };
        return acc;
      }, getPackageInstallConfig(packageJsonPath, tree, options.projectName));
      const devDependencies: Record<string, DependencyToAdd> = {
        chokidar: {
          inManifest: [{
            range: packageJson.peerDependencies.chokidar,
            types: [NodeDependencyType.Dev]
          }]
        }
      };
      const rule = chain([
        removePackages(['@otter/components']),
        setupDependencies({
          projectName: options.projectName,
          dependencies: {
            ...dependencies,
            ...devDependencies
          },
          ngAddToRun: depsInfo.o3rPeerDeps
        }),
        registerPackageCollectionSchematics(packageJson),
        ...(options.enableMetadataExtract ? [updateCmsAdapter(options)] : []),
        await registerDevtools(options)
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

/**
 * Add Otter components to an Angular Project
 * @param options
 */
export const ngAdd = createSchematicWithMetricsIfInstalled(ngAddFn);
