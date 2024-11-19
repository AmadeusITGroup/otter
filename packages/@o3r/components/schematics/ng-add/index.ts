import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { updateCmsAdapter } from '../cms-adapter';
import type { NgAddSchematicsSchema } from './schema';
import { registerDevtools } from './helpers/devtools-registration';
import type { DependencyToAdd } from '@o3r/schematics';
import {
  createSchematicWithMetricsIfInstalled,
  getDefaultOptionsForSchematic,
  getO3rPeerDeps,
  getPackageInstallConfig,
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
  registerPackageCollectionSchematics,
  removePackages,
  setupDependencies
} from '@o3r/schematics';
import type { NodeDependencyType } from '@schematics/angular/utility/dependencies';

/**
 * Add Otter components to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree: Tree, context: SchematicContext) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { NodeDependencyType } = await import('@schematics/angular/utility/dependencies').catch(() => ({ NodeDependencyType: { Dev: 'devDependencies' as NodeDependencyType.Dev } }));
    options = {...getDefaultOptionsForSchematic(getWorkspaceConfig(tree), '@o3r/components', 'ng-add', options), ...options};
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' }));
    const depsInfo = getO3rPeerDeps(packageJsonPath);
    if (options.enableMetadataExtract) {
      depsInfo.o3rPeerDeps = [...depsInfo.o3rPeerDeps , '@o3r/extractors'];
    }

    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const dependencies = depsInfo.o3rPeerDeps.reduce((acc, dep) => {
      acc[dep] = {
        inManifest: [{
          range: `${options.exactO3rVersion ? '' : '~'}${depsInfo.packageVersion}`,
          types: getProjectNewDependenciesTypes(workspaceProject)
        }],
        ngAddOptions: { exactO3rVersion: options.exactO3rVersion }
      };
      return acc;
    }, getPackageInstallConfig(packageJsonPath, tree, options.projectName, false, !!options.exactO3rVersion));
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
      registerDevtools(options)
    ]);

    context.logger.info(`The package ${depsInfo.packageName!} comes with a debug mechanism`);
    context.logger.info('Get more information on the following page: https://github.com/AmadeusITGroup/otter/tree/main/docs/components/INTRODUCTION.md#Runtime-debugging');

    return () => rule(tree, context);
  };
}

/**
 * Add Otter components to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => createSchematicWithMetricsIfInstalled(ngAddFn)(options);
