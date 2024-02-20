import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {createSchematicWithMetricsIfInstalled, registerPackageCollectionSchematics} from '@o3r/schematics';
import { updateCmsAdapter } from '../cms-adapter';
import type { NgAddSchematicsSchema } from './schema';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { registerDevtools } from './helpers/devtools-registration';

const devDependenciesToInstall = [
  'jsonpath-plus'
];

/**
 * Add Otter rules-engine to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const {
        setupDependencies,
        getPackageInstallConfig,
        getDefaultOptionsForSchematic,
        getO3rPeerDeps,
        getProjectNewDependenciesTypes,
        getWorkspaceConfig,
        getExternalDependenciesVersionRange,
        removePackages,
        setupSchematicsDefaultParams
      } = await import('@o3r/schematics');
      options = {...getDefaultOptionsForSchematic(getWorkspaceConfig(tree), '@o3r/rules-engine', 'ng-add', options), ...options};
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
      Object.entries(getExternalDependenciesVersionRange(devDependenciesToInstall, packageJsonPath))
        .forEach(([dep, range]) => {
          dependencies[dep] = {
            inManifest: [{
              range,
              types: getProjectNewDependenciesTypes(workspaceProject)
            }]
          };
        });
      const rule = chain([
        registerPackageCollectionSchematics(packageJson),
        setupSchematicsDefaultParams({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '@o3r/core:component': {
            useRulesEngine: undefined
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '@o3r/core:component-container': {
            useRulesEngine: undefined
          }
        }),
        removePackages(['@otter/rules-engine', '@otter/rules-engine-core']),
        setupDependencies({
          projectName: options.projectName,
          dependencies,
          ngAddToRun: depsInfo.o3rPeerDeps
        }),
        ...(options.enableMetadataExtract ? [updateCmsAdapter(options)] : []),
        await registerDevtools(options)
      ]);

      context.logger.info(`The package ${depsInfo.packageName!} comes with a debug mechanism`);
      context.logger.info('Get information on https://github.com/AmadeusITGroup/otter/tree/main/docs/rules-engine/how-to-use/debug.md');

      return () => rule(tree, context);
    } catch (e) {
      // rules-engine needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @o3r/rules-engine has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the rules-engine package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}

/**
 * Add Otter rules-engine to an Angular Project
 * @param options
 */
export const ngAdd = createSchematicWithMetricsIfInstalled(ngAddFn);
